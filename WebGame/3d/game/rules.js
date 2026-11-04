// Bramblewick rules core: pure, deterministic port of snapshot/index.html game logic.
// No DOM, no three.js, no Date/Math.random. All randomness from state.rng (mulberry32).
// Line refs = /root/b3d/game/snapshot/index.html.
export const TICK_MS = 600;               // L518 TICK=600 (save may pick 300/400/600: L902)
export const INV_SIZE = 28;               // L704
export const SAVE_KEY = 'bramblewick-save-v2'; // L518
export const SPAWN = { x: 28, y: 33 };    // L703
const RAR = { A: 1, C: 1 / 10, U: 1 / 50, R: 1 / 250, V: 1 / 500 }; // L773
const TIER_ROLLS = [['V', 200], ['R', 350], ['U', 7000], ['C', 12500]]; // L776
export const SKILLS = ['attack','strength','defence','hitpoints','mining','woodcutting','fishing','thieving','cooking','smithing','crafting','firemaking','prayer']; // L635 (verified against skills.json at load)

// ---------- RNG ----------
export function rand(state) { // mulberry32
  let t = (state.rng = (state.rng + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
export const rnd = (s, a, b) => a + Math.floor(rand(s) * (b - a + 1)); // L756

// ---------- XP ----------
export const XPT = (() => { const t = [0]; let p = 0; for (let l = 1; l < 99; l++) { p += Math.floor(l + 300 * Math.pow(2, l / 7)); t.push(Math.floor(p / 4)); } return t; })(); // L642
export function lvlOf(xp) { let l = 1; while (l < 99 && xp >= XPT[l]) l++; return l; } // L643
export const lv = (s, k) => lvlOf(s.player.xp[k] || 0);
export const maxHp = s => lv(s, 'hitpoints'); // L711
export function RATE(s) { const r = s.player.rates; return r === 'osrs' ? { c: 4, s: 1 } : r === 'adventure' ? { c: 4, s: 3 } : { c: 1250, s: 3000 }; } // L713
const CMB = { attack: 1, strength: 1, defence: 1, hitpoints: 1, ranged: 1, magic: 1 }; // L2004
export function addXp(s, k, a) {
  if (s.opts.tnlX3 && (CMB[k] || s.player.rates === 'osrs')) a *= 3; // L2006 (TNL x3, default on: L1998)
  const b = lv(s, k); s.player.xp[k] = Math.min(2e8, (s.player.xp[k] || 0) + a); const n = lv(s, k); // L714
  if (n > b && k === 'hitpoints') s.player.hp += n - b;
  s.events.push({ t: 'xp', tick: s.tick, skill: k, amount: a });
}

// ---------- inventory ----------
export const invCount = (s, id) => s.player.inv.reduce((c, it) => c + (it && it.id === id ? it.n : 0), 0); // L715
export const freeSlots = s => s.player.inv.filter(x => !x).length; // L716
export function addItem(s, id, n = 1) { // L717-718: returns number added (partial possible for non-stackables)
  const d = s.defs.items[id]; if (!d) throw new Error('unknown item ' + id); const inv = s.player.inv;
  if (d.st) { const st = inv.find(x => x && x.id === id); if (st) { st.n += n; return n; } const e = inv.indexOf(null); if (e < 0) return 0; inv[e] = { id, n }; return n; }
  let a = 0; for (let k = 0; k < n; k++) { const e = inv.indexOf(null); if (e < 0) break; inv[e] = { id, n: 1 }; a++; } return a;
}
export function removeSlot(s, i, n) { const it = s.player.inv[i]; if (!it) return 0; n = Math.min(n || it.n, it.n); it.n -= n; if (it.n <= 0) s.player.inv[i] = null; return n; } // L719
export function removeItem(s, id, n) { let left = n; for (let i = 0; i < INV_SIZE && left > 0; i++) { const it = s.player.inv[i]; if (it && it.id === id) left -= removeSlot(s, i, left); } return n - left; }
// Transactional plan on a copy: insufficient space/materials changes nothing (L1449-1453 recipeInventory)
export function recipeInventory(s, inv, need, out) {
  const next = inv.map(it => it ? { ...it } : null);
  for (const [id, n] of Object.entries(need)) { if (next.reduce((a, it) => a + (it && it.id === id ? it.n : 0), 0) < n) return null; let left = n;
    for (let i = 0; i < next.length && left; i++) if (next[i] && next[i].id === id) { const u = Math.min(left, next[i].n); left -= u; next[i].n -= u; if (!next[i].n) next[i] = null; } }
  const stack = s.defs.items[out].st && next.find(it => it && it.id === out); if (stack) stack.n++; else { const e = next.indexOf(null); if (e < 0) return null; next[e] = { id: out, n: 1 }; }
  return next;
}

// ---------- bank (L1258-1259) ----------
export function deposit(s, i, n) { const P = s.player, it = P.inv[i]; if (!it) return 0; const id = it.id; let left = n;
  if (s.defs.items[id].st) left -= removeSlot(s, i, n); else for (let k = 0; k < INV_SIZE && left > 0; k++) if (P.inv[k] && P.inv[k].id === id) { removeSlot(s, k, 1); left--; }
  const moved = n - left; if (moved) { P.bank[id] = (P.bank[id] || 0) + moved; s.events.push({ t: 'deposit', item: id, n: moved }); } return moved; }
export function withdraw(s, id, n) { const P = s.player; n = Math.min(n, P.bank[id] || 0); if (!n) return 0; const got = addItem(s, id, n);
  if (!got) { msg(s, "You don't have enough inventory space."); return 0; } P.bank[id] -= got; if (P.bank[id] <= 0) delete P.bank[id]; return got; }

// ---------- shops ----------
// General stall (Merra / village stall). Prices: SHOPBUY L1661, SELLP L1669-1670, gear 40% L1475.
// NOTE: original handler L1473 has `!cheb(..)<=3` (always true) so the live UI closes instead of trading; this implements the intent (within 3 tiles).
export function stallBuy(s, id) { const row = s.defs.shops.general_stall.buy.find(r => r.item === id); if (!row) return false;
  const next = recipeInventory(s, s.player.inv, { coins: row.price }, id); if (!next) { msg(s, 'Not enough coins or backpack space.'); return false; }
  s.player.inv = next; s.events.push({ t: 'buy', item: id, price: row.price }); return true; }
export function stallSellSupplies(s) { const prices = s.defs.sellPrices; let total = 0;
  for (let i = 0; i < INV_SIZE; i++) { const it = s.player.inv[i]; if (it && prices[it.id]) { total += prices[it.id] * it.n; s.player.inv[i] = null; } }
  if (total) grant(s, 'coins', total); return total; }
export function stallSellGear(s) { let t = 0; for (let i = 0; i < INV_SIZE; i++) { const it = s.player.inv[i], d = it && s.defs.items[it.id];
  if (d && d.slot && !d.pick && !d.axe) { t += Math.floor((d.v || 10) * 0.4); s.player.inv[i] = null; } } if (t) grant(s, 'coins', t); return t; }
// Tarnish shop (L2049-2051): buy-only, one unit per click.
export function tarnishBuy(s, id, price) { if (invCount(s, 'coins') < price) { msg(s, "You don't have enough coins."); return false; }
  if (!s.defs.items[id].st && !freeSlots(s)) { msg(s, "You don't have enough inventory space."); return false; }
  removeItem(s, 'coins', price); addItem(s, id, 1); return true; }
// grant (L1609): overflow to bank when full
export function grant(s, id, n) { const got = addItem(s, id, n); if (got < n) s.player.bank[id] = (s.player.bank[id] || 0) + (n - got); }

// ---------- geometry ----------
export const cheb = (ax, ay, bx, by) => Math.max(Math.abs(ax - bx), Math.abs(ay - by)); // L726
export function walkable(s, x, y) { if (!s.walk(x, y)) return false; return !s.objs.some(o => o.x === x && o.y === y); } // L687 (objects occupy tiles)
export function canStep(s, x, y, dx, dy) { if (!walkable(s, x + dx, y + dy)) return false; if (dx && dy && (!walkable(s, x + dx, y) || !walkable(s, x, y + dy))) return false; return true; } // L690
export function adjacentFrom(s, px, py, x, y) { if (cheb(px, py, x, y) !== 1) return false; const dx = x - px, dy = y - py; if (dx && dy && !walkable(s, px + dx, py) && !walkable(s, px, py + dy)) return false; return true; } // L727
const adjacent = (s, x, y) => adjacentFrom(s, s.player.x, s.player.y, x, y);
const DIRS = [[1,0,1],[-1,0,1],[0,1,1],[0,-1,1],[1,1,1.001],[1,-1,1.001],[-1,1,1.001],[-1,-1,1.001]]; // L688
export function astar(s, sx, sy, goal, tx, ty, maxN = 15000) { // L691-701 (Dijkstra/A* with same costs + tie-break)
  const hf = (x, y) => { const a = Math.abs(x - tx), b = Math.abs(y - ty); return Math.max(a, b) + .001 * Math.min(a, b); };
  const key = (x, y) => x + ',' + y, g = new Map([[key(sx, sy), 0]]), from = new Map(), closed = new Set(), open = [[hf(sx, sy), sx, sy]];
  let best = [sx, sy], bestH = hf(sx, sy), n = 0, found = false;
  while (open.length && n < maxN) { open.sort((a, b) => a[0] - b[0]); const [, x, y] = open.shift(); const k = key(x, y); if (closed.has(k)) continue; closed.add(k); n++;
    if (goal(x, y)) { best = [x, y]; found = true; break; } const hh = hf(x, y); if (hh < bestH || (hh === bestH && g.get(k) < g.get(key(...best)))) { bestH = hh; best = [x, y]; }
    for (const [dx, dy, c] of DIRS) { if (!canStep(s, x, y, dx, dy)) continue; const j = key(x + dx, y + dy), ng = g.get(k) + c; if (!g.has(j) || ng < g.get(j)) { g.set(j, ng); from.set(j, [x, y]); open.push([ng + hf(x + dx, y + dy), x + dx, y + dy]); } } }
  const path = []; let c = best; while (!(c[0] === sx && c[1] === sy)) { path.push(c); c = from.get(key(...c)); if (!c) break; } path.reverse(); path.found = found; return path;
}
const npcGoal = (s, n) => (x, y) => cheb(x, y, n.x, n.y) === 1 && !(x !== n.x && y !== n.y && !walkable(s, n.x, y) && !walkable(s, x, n.y)); // L732

// ---------- state ----------
export function createState(defs, { seed = 1, walk, objs = [], npcs = [], tnlX3 = true } = {}) {
  const xp = {}; SKILLS.forEach(k => xp[k] = k === 'hitpoints' ? 1154 : 0); // L706
  return { defs, opts: { tnlX3 }, rng: seed >>> 0, tick: 0, walk: walk || (() => true), log: [], events: [],
    player: { x: SPAWN.x, y: SPAWN.y, path: [], act: null, skill: null, combat: null, run: true, energy: 100, hp: 10, jobs: { logs: 0, ore: 0, forged: 0, boars: 0, claimed: [] }, xp,
      inv: new Array(INV_SIZE).fill(null), equip: { head: null, weapon: 'thorn_sword', body: null, shield: 'wooden_shield', legs: null }, bank: {}, style: 'accurate', pp: 1, spec: 100, autoRet: true, xpOn: true, rates: 'adventure', atkTimer: 0, name: 'Adventurer' }, // L704-705
    objs: objs.map((o, i) => ({ id: i, dep: 0, stock: null, ...o })),
    npcs: npcs.map((n, i) => { const d = defs.npcs[n.kind]; return { id: i, sx: n.x, sy: n.y, box: n.box || [n.x - 3, n.y - 3, n.x + 3, n.y + 3], hp: d.hp || 1, dead: false, respAt: 0, target: false, timer: 0, ...n }; }), // L645
    ground: [] };
}
export function msg(s, t) { s.log.push(t); }
export const bonus = (s, k) => { let b = 0; for (const sl in s.player.equip) { const e = s.player.equip[sl]; if (e && s.defs.items[e][k]) b += s.defs.items[e][k]; } return b; }; // L724
export function hasTool(s, k) { const P = s.player, I = s.defs.items; if (P.equip.weapon && I[P.equip.weapon][k]) return true; return P.inv.some(x => x && I[x.id][k]); } // L722
export function toolTier(s, k) { const P = s.player, I = s.defs.items; return Math.max(1, ...[P.equip.weapon, ...P.inv.filter(Boolean).map(i => i.id)].filter(id => id && I[id][k] && (k !== 'pick' || (I[id].picklvl || 1) <= lv(s, 'mining'))).map(id => I[id].tier || 1)); } // L720
function pickaxeLevel(s) { const I = s.defs.items, P = s.player; const picks = [P.equip.weapon, ...P.inv.filter(Boolean).map(i => i.id)].filter(id => id && I[id].pick); const u = picks.filter(id => (I[id].picklvl || 1) <= lv(s, 'mining')); const c = (u.length ? u : picks).sort((a, b) => (I[b].tier || 1) - (I[a].tier || 1)); return c.length ? (I[c[0]].picklvl || 1) : 1; } // L721

// Revalidate tool/level/bait both when starting and before ongoing gathering.
function gatherBlock(s, d) {
  if (lv(s, d.skill) < d.lvl) return `You need a ${d.skill} level of ${d.lvl}.`;
  const tool = d.tool || (d.kind === 'rock' ? 'pick' : d.kind === 'fish' ? 'net' : 'axe');
  if (!hasTool(s, tool)) return 'You need a tool: ' + tool;
  if (d.bait && !invCount(s, d.bait)) return 'You need bait.';
  if (tool === 'pick' && lv(s, 'mining') < pickaxeLevel(s)) return 'Pickaxe level too high.';
  return null;
}

// ---------- actions (setAct L728 replaces the current action) ----------
export function setAct(s, a) { const P = s.player; P.act = a; P.skill = null; if (!a || a.kind !== 'npc' || a.op !== 'Attack') P.combat = null; P.path = []; if (a) planPath(s); }
export const walkTo = (s, x, y) => setAct(s, { kind: 'walk', x, y });
export const attack = (s, npcId) => setAct(s, { kind: 'npc', op: 'Attack', n: npcId });
export const gather = (s, objId) => setAct(s, { kind: 'obj', op: 'use', o: objId });
export const pickUp = (s, gi) => setAct(s, { kind: 'item', g: gi });
const npcOf = (s, id) => s.npcs[id]; const objOf = (s, id) => s.objs[id];
function planPath(s) { const P = s.player, a = P.act; if (!a) return; let p; // L729-734
  if (a.kind === 'walk') p = astar(s, P.x, P.y, (x, y) => x === a.x && y === a.y, a.x, a.y);
  else if (a.kind === 'obj') { const o = objOf(s, a.o); p = astar(s, P.x, P.y, (x, y) => { if (cheb(x, y, o.x, o.y) !== 1) return false; const dx = o.x - x, dy = o.y - y; return !(dx && dy) || walkable(s, x + dx, y) || walkable(s, x, y + dy); }, o.x, o.y); }
  else if (a.kind === 'npc') { const n = npcOf(s, a.n); a.lx = n.x; a.ly = n.y; p = astar(s, P.x, P.y, npcGoal(s, n), n.x, n.y); }
  else if (a.kind === 'item') { const g = a.g; p = astar(s, P.x, P.y, (x, y) => x === g.x && y === g.y, g.x, g.y); }
  P.path = p; if (a.kind !== 'walk' && !p.found && !p.length && !atTarget(s)) { msg(s, "I can't reach that!"); P.act = null; } }
function atTarget(s) { const a = s.player.act; if (!a) return false; if (a.kind === 'obj') { const o = objOf(s, a.o); return adjacent(s, o.x, o.y); } if (a.kind === 'npc') { const n = npcOf(s, a.n); return adjacent(s, n.x, n.y); } if (a.kind === 'item') return s.player.x === a.g.x && s.player.y === a.g.y; return false; } // L735
function doAct(s) { const P = s.player, a = P.act; P.act = null; P.path = []; // L736-755
  if (a.kind === 'obj') { const o = objOf(s, a.o), d = s.defs.nodes[o.type]; if (objOp(s, o, a.op)) return; if (!d.skill) return;
    if (o.dep) { msg(s, 'depleted'); return; }
    const blocked = gatherBlock(s, d); if (blocked) { msg(s, blocked); return; }
    if (!freeSlots(s) && !s.defs.items[d.item].st) { msg(s, 'Your inventory is too full to hold any more.'); return; }
    const pace = d.kind === 'rock' ? 'pick' : d.kind === 'tree' ? 'axe' : null; P.skill = { o: o.id, start: s.tick, cycle: d.cycle || (pace && toolTier(s, pace) > 1 ? 1 : 2) }; return; }
  if (a.kind === 'npc') { const n = npcOf(s, a.n); if (n.dead) return; if (a.op === 'Attack') { P.combat = n.id; if (n.target === false) n.target = true; } else npcOp(s, n, a.op); return; }
  if (a.kind === 'item') { const i = s.ground.indexOf(a.g); if (i < 0) return; const g = a.g; const got = addItem(s, g.id, g.n); if (!got) { msg(s, "You don't have enough inventory space."); return; }
    s.events.push({ t: 'pickup', item: g.id, n: got }); if (got < g.n) g.n -= got; else s.ground.splice(i, 1); } }

// ---------- combat ----------
export const hitChance = (a, d) => a > d ? 1 - (d + 2) / (2 * (a + 1)) : a / (2 * (d + 1)); // L766
export const CMB_HOOK = 1; // PRAY-01/CMB-03: optional globalThis.__B3cmb {p(s,n)->{a,s,d,acc,dmg,prot}, after(s,n,dmg), keep(s)}; absent = vanilla
const cmbX = (s, n) => { try { const H = globalThis.__B3cmb; return (H && H.p && H.p(s, n)) || {}; } catch (_) { return {}; } };
// CMB-01: attack speed = weapon item spd, else optional hook __B3cmb.spd(s), else 4. Styles: accurate|aggressive|defensive|controlled (rapid/longrange read as accurate).
const spdOf = s => { try { const w = s.defs.items[s.player.equip.weapon], H = globalThis.__B3cmb; return (w && w.spd) || (H && H.spd && H.spd(s)) || 4; } catch (_) { return 4; } };
export function playerAttack(s, n) { const P = s.player, st = P.style, d = s.defs.npcs[n.kind], X = cmbX(s, n); // L767-771 (no prayer, no spec)
  const effA = Math.floor(lv(s, 'attack') * (X.a || 1)) + (st === 'accurate' ? 3 : st === 'controlled' ? 1 : 0) + 8, effS = Math.floor(lv(s, 'strength') * (X.s || 1)) + (st === 'aggressive' ? 3 : st === 'accurate' || st === 'controlled' ? 1 : 0) + 8;
  const aR = effA * (bonus(s, 'ab') + 64) * (X.acc || 1), dR = (d.def + 9) * 64, maxH = Math.floor(Math.floor((Math.floor(.5 + effS * (bonus(s, 'sb') + 64)) + 320) / 640) * (X.dmg || 1));
  const bst = starterBoost(s, d); let dmg = rand(s) < (bst ? Math.max(.65, hitChance(aR, dR)) : hitChance(aR, dR)) ? rnd(s, bst ? 1 : 0, maxH) : 0; dmg = Math.min(dmg, n.hp); n.hp -= dmg; s.events.push({ t: 'hit', by: 'player', npc: n.id, dmg, tick: s.tick }); try { const H = globalThis.__B3cmb; if (H && H.after) H.after(s, n, dmg); } catch (_) {}
  if (dmg) { const r = RATE(s).c, e = dmg * r; if (st === 'controlled') { addXp(s, 'attack', e / 3); addXp(s, 'strength', e / 3); addXp(s, 'defence', e / 3); } else addXp(s, st === 'aggressive' ? 'strength' : st === 'defensive' ? 'defence' : 'attack', e); addXp(s, 'hitpoints', r === 4 ? Math.round(dmg * 13.3) / 10 : Math.floor(e / 3)); }
  if (n.target === false) n.target = true; if (n.hp <= 0) kill(s, n); }
// v14 starter pacing (3D only, opt-in via s.opts.boost): vs. weak NPCs (combat lvl <= 5) while attack < 10, hits land >= 65% and never roll 0.
export function starterBoost(s, d) { return !!(s.opts && s.opts.boost) && lv(s, 'attack') < 10 && (d.lvl || 1) <= 5; }
export function dropGround(s, id, n, x, y) { const g = s.defs.items[id].st && s.ground.find(g => g.id === id && g.x === x && g.y === y); if (g) { g.n += n; g.ttl = s.tick + 300; return; } s.ground.push({ id, n, x, y, ttl: s.tick + 300 }); } // L788
export function rollDrops(s, kind) { const T = s.defs.drops[kind] || { rolls: [] }, d = { tiered: !!T.tiered }, tbl = T.rolls, out = []; // L773-777
  for (const r of tbl) { if (d.tiered && r.rarity !== 'A') continue; if (rand(s) < r.chance) out.push([r.item, rnd(s, r.min, r.max)]); }
  if (d.tiered) { const roll = rnd(s, 0, 19999); let acc = 0; for (const [tier, w] of TIER_ROLLS) { acc += w; if (roll >= acc) continue; const pool = tbl.filter(e => e.rarity === tier); if (!pool.length) continue; const e = pool[rnd(s, 0, pool.length - 1)]; out.push([e.item, rnd(s, e.min, e.max)]); break; } }
  return out; }
export function kill(s, n) { if (n.dead) return; const d = s.defs.npcs[n.kind]; if (n.kind === 'boar') s.player.jobs.boars++; huntKill(s, n); n.dead = true; n.respAt = s.tick + d.resp; n.target = false; if (s.player.combat === n.id) s.player.combat = null; // L772
  s.events.push({ t: 'kill', npc: n.id, kind: n.kind, tick: s.tick });
  for (const [id, q] of rollDrops(s, n.kind)) { dropGround(s, id, q, n.x, n.y); s.events.push({ t: 'drop', npc: n.id, item: id, n: q }); } }
export function npcAttack(s, n) { const P = s.player, d = s.defs.npcs[n.kind], st = P.style, X = cmbX(s, null); // L779-782 (no prayers)
  const aR = (d.att + 8) * 64, dR = (Math.floor(lv(s, 'defence') * (X.d || 1)) + (st === 'defensive' ? 3 : st === 'controlled' ? 1 : 0)) * (bonus(s, 'db') + 64);
  const maxH = Math.max(1, Math.floor((Math.floor(.5 + (d.str + 8) * 64) + 320) / 640)); let dmg = rand(s) < hitChance(aR, dR) ? rnd(s, 0, maxH) : 0; if (X.prot === (d.style || 'melee')) dmg = 0; dmg = Math.min(dmg, P.hp); P.hp -= dmg;
  s.events.push({ t: 'hit', by: n.id, dmg, tick: s.tick });
  if (P.hp <= 0) die(s); else if (P.autoRet && P.combat == null && !P.act && !P.path.length) P.combat = n.id; }
export function die(s) { const P = s.player, I = s.defs.items, all = []; // L783-786
  P.inv.forEach(it => { if (it) for (let k = 0; k < (I[it.id].st ? 1 : it.n); k++) all.push({ id: it.id, n: I[it.id].st ? it.n : 1 }); });
  for (const sl in P.equip) if (P.equip[sl]) all.push({ id: P.equip[sl], n: 1, s: sl });
  const val = x => (I[x.id].v || 5) * (x.id === 'coins' ? 0.001 : 1); all.sort((p, q) => val(q) - val(p)); const keep = all.slice(0, 3 + (() => { try { const H = globalThis.__B3cmb; return (H && H.keep && H.keep(s)) || 0; } catch (_) { return 0; } })()), lose = all.slice(3), dx = P.x, dy = P.y;
  P.inv = new Array(INV_SIZE).fill(null); for (const sl in P.equip) P.equip[sl] = null; for (const k of keep) { if (k.s) P.equip[k.s] = k.id; else addItem(s, k.id, k.n); } for (const l of lose) dropGround(s, l.id, l.n, dx, dy);
  for (const n of s.npcs) n.target = false; P.x = SPAWN.x; P.y = SPAWN.y; P.hp = maxHp(s); P.pp = lv(s, 'prayer'); P.spec = 100; P.path = []; P.act = null; P.combat = null; P.skill = null; s.events.push({ t: 'death', tick: s.tick }); }
function stepToward(s, n, tx, ty) { const dx = Math.sign(tx - n.x), dy = Math.sign(ty - n.y); for (const [ax, ay] of [[dx, dy], [dx, 0], [0, dy]]) { if (!ax && !ay) continue; if (canStep(s, n.x, n.y, ax, ay) && !(n.x + ax === s.player.x && n.y + ay === s.player.y)) { n.x += ax; n.y += ay; return true; } } return false; } // L790 (NOMOB not modelled)

// ---------- tick (L801-896) ----------
export function tick(s) { const P = s.player; s.tick++;
  if (P.act) { if (atTarget(s)) doAct(s); else if (P.act.kind === 'npc') { const n = npcOf(s, P.act.n); if (n.x !== P.act.lx || n.y !== P.act.ly || !P.path.length) planPath(s); } }
  if (P.combat != null && !P.act) { const n = npcOf(s, P.combat); if (n.dead) P.combat = null; else if (!adjacent(s, n.x, n.y)) { if (!P.path.length || P._cx !== n.x || P._cy !== n.y) { P._cx = n.x; P._cy = n.y; const p = astar(s, P.x, P.y, npcGoal(s, n), n.x, n.y); P.path = p; if (!p.length) { P.combat = null; msg(s, "I can't reach that!"); } } } else P.path = []; }
  let steps = 0; const running = P.run && P.energy > 0, max = running ? 2 : 1;
  while (P.path.length && steps < max) { const [nx, ny] = P.path[0]; if (!canStep(s, P.x, P.y, nx - P.x, ny - P.y)) { P.path = []; if (P.act) planPath(s); break; } P.path.shift(); P.x = nx; P.y = ny; steps++; }
  P.moving = steps > 0; if (steps) P.skill = null;
  if (running && steps) { P.energy = Math.max(0, P.energy - .35); if (P.energy <= 0) P.run = false; } if (P.energy < 100 && (!running || !steps)) P.energy = Math.min(100, P.energy + .4);
  if (P.act && !P.path.length && atTarget(s)) doAct(s);
  if (P.skill && P.skill.type && !P.moving) jobTick(s);
  else if (P.skill && !P.moving) { const job = P.skill, o = objOf(s, job.o), d = s.defs.nodes[o.type]; // L861-878 generic gathering
    const blocked = gatherBlock(s, d);
    if (o.dep || !adjacent(s, o.x, o.y)) P.skill = null;
    else if (blocked) { msg(s, blocked); P.skill = null; }
    else if (s.tick > job.start && (s.tick - job.start) % job.cycle === 0) {
      let fish = null;
      if (d.bait && !invCount(s, d.bait)) P.skill = null;
      else if (d.fishTable && !(fish = (() => { const L = lv(s, d.skill); for (const f of d.fishTable) { if (L < f.lvl) continue; if (rand(s) < f.low + Math.max(0, Math.min(98, L - 1)) * (f.high - f.low) / 98) return f; } return null; })())) { }
      else if (!d.fishTable && d.kind === 'fish' && Number.isFinite(d.low) && Number.isFinite(d.high) && rand(s) >= d.low + Math.max(0, Math.min(98, lv(s, d.skill) - 1)) * (d.high - d.low) / 98) { }
      else { const reward = fish ? fish.item : d.gemRock ? gemRockReward(s) : d.item, gx = fish ? fish.xp : d.xp;
        if (!addItem(s, reward, 1)) { msg(s, 'Backpack full. Bank or sell your supplies.'); P.skill = null; }
        else { o.stock = (o.stock ?? (d.kind === 'tree' ? 4 : d.gemRock ? 1 : 2)) - 1; s.events.push({ t: 'gather', obj: o.id, item: reward });
          if (d.bait) removeItem(s, d.bait, 1); if (d.kind === 'tree') P.jobs.logs++; else if (d.kind === 'rock') P.jobs.ore++;
          addXp(s, d.skill, gx * RATE(s).s);
          if (o.stock <= 0) { o.dep = s.tick + d.resp; o.stock = null; P.skill = null; }
          if (P.skill && !freeSlots(s)) { msg(s, 'Backpack full. Bank or sell your supplies.'); P.skill = null; } } } } }
  P.atkTimer--; if (P.combat != null && !P.moving) { const n = npcOf(s, P.combat); if (adjacent(s, n.x, n.y) && P.atkTimer <= 0) { playerAttack(s, n); P.atkTimer = spdOf(s); } } // L881
  for (const n of s.npcs) { const d = s.defs.npcs[n.kind]; if (n.dead) { if (s.tick >= n.respAt) { n.dead = false; n.hp = d.hp; n.x = n.sx; n.y = n.sy; } continue; } // L883
    if (n.target) { const far = cheb(n.x, n.y, (n.box[0] + n.box[2]) >> 1, (n.box[1] + n.box[3]) >> 1) > 14; if (far || P.hp <= 0) { n.target = false; continue; }
      if (adjacent(s, n.x, n.y)) { n.timer--; if (n.timer <= 0) { npcAttack(s, n); n.timer = d.speed; } } else { stepToward(s, n, P.x, P.y); n.timer = Math.max(n.timer, 1); } continue; }
    if (d.still || !s.opts.wander) continue; if (rand(s) < .035) { const dx = rnd(s, -1, 1), dy = rnd(s, -1, 1), nx = n.x + dx, ny = n.y + dy; if ((dx || dy) && nx >= n.box[0] && nx <= n.box[2] && ny >= n.box[1] && ny <= n.box[3] && canStep(s, n.x, n.y, dx, dy) && !(nx === P.x && ny === P.y)) { n.x = nx; n.y = ny; } }
    if (!n.target && n.hp < d.hp && s.tick % 10 === 0) n.hp++; }
  for (const o of s.objs) if (o.dep && s.tick >= o.dep) o.dep = 0; // L890
  for (let i = s.ground.length - 1; i >= 0; i--) if (s.tick >= s.ground[i].ttl) s.ground.splice(i, 1); // L891
  if (s.tick % 100 === 0 && P.hp < maxHp(s)) P.hp++; // L892
  if (P.combat != null && npcOf(s, P.combat).dead) P.combat = null; }
function gemRockReward(s) { const R = s.defs.gemRockRewards; let roll = rnd(s, 1, R.reduce((a, [, w]) => a + w, 0)); for (const [id, w] of R) { roll -= w; if (roll <= 0) return id; } return R[0][0]; } // L1624

// ---------- save / load (L898-903): byte-compatible with bramblewick-save-v2 ----------
export function toSave(s, extra = {}) { const P = s.player; return { v: 2, x: P.x, y: P.y, xp: P.xp, inv: P.inv, equip: P.equip, bank: P.bank, run: P.run, energy: P.energy, hp: P.hp, style: P.style, pp: P.pp, spec: P.spec, autoRet: P.autoRet, xpOn: P.xpOn, rates: P.rates, name: P.name, mapVersion: 3, jobs: P.jobs, slay: P.slay || null, huntPts: P.huntPts || 0, pace: extra.pace ?? 600, renderScale: extra.renderScale ?? 1.5, cam: extra.cam ?? { ang: 0, zoom: 34 } }; }
export function fromSave(s, sv) { const P = s.player, I = s.defs.items; if (!sv || sv.v !== 2) { addItem(s, 'bronze_pickaxe'); addItem(s, 'bronze_axe'); addItem(s, 'bread', 3); addItem(s, 'coins', 25); return false; }
  Object.assign(P.xp, sv.xp || {}); P.inv = (sv.inv || []).slice(0, INV_SIZE).map(x => x && I[x.id] ? { ...x } : null); while (P.inv.length < INV_SIZE) P.inv.push(null);
  for (const k in P.equip) P.equip[k] = sv.equip && sv.equip[k] && I[sv.equip[k]] ? sv.equip[k] : null; P.bank = {}; for (const k in sv.bank || {}) if (I[k]) P.bank[k] = sv.bank[k];
  P.run = sv.mapVersion === 3 ? !!sv.run : true; P.energy = sv.energy ?? 100; P.hp = Math.max(1, Math.min(sv.hp || 10, maxHp(s))); P.style = sv.style || 'accurate'; P.pp = sv.pp ?? lv(s, 'prayer'); P.spec = sv.spec ?? 100; P.autoRet = sv.autoRet ?? true; P.xpOn = sv.xpOn ?? true; P.rates = sv.mapVersion === 3 ? (sv.rates || 'adventure') : 'adventure'; P.name = sv.name || 'Adventurer';
  if (sv.jobs) { for (const k of ['logs', 'ore', 'forged', 'boars']) P.jobs[k] = Math.max(0, Math.floor(Number(sv.jobs[k]) || 0)); P.jobs.claimed = Array.isArray(sv.jobs.claimed) ? sv.jobs.claimed.filter(k => typeof k === 'string') : []; }
  if (sv.slay && s.defs.npcs[sv.slay.k] && sv.slay.left > 0) P.slay = { k: sv.slay.k, n: sv.slay.n | 0, left: sv.slay.left | 0 }; P.huntPts = sv.huntPts | 0;
  if (sv.mapVersion === 3 && walkable(s, sv.x, sv.y)) { P.x = sv.x; P.y = sv.y; } return true; }

// ---------- defs loader (node only helper; rules above take a plain defs object) ----------
export function defsFromJson({ items, npcs, drops, shops, nodes }) { const sellPrices = {}; for (const r of shops.general_stall.sellAll) sellPrices[r.item] = r.price;
  return { items, npcs, drops, shops, nodes: nodes.nodes, gemRockRewards: nodes.gathering.gemRockRewards, sellPrices }; }

// ---------- item actions (v13, moved from the 3D UI; ported from 2D snapshot L1215-1219) ----------
// eat: heals d.eat up to maxHp, delays next attack (atkTimer>=3). Returns healed amount, or -1 if refused.
export function eat(s, i) { const P = s.player, it = P.inv[i], d = it && s.defs.items[it.id]; if (!d || !d.eat) return -1;
  if (P.hp >= maxHp(s)) { msg(s, 'Your health is already full.'); return -1; }
  removeSlot(s, i, 1); const b = P.hp; P.hp = Math.min(maxHp(s), P.hp + d.eat); P.atkTimer = Math.max(P.atkTimer || 0, 3);
  msg(s, `You eat the ${d.n.toLowerCase()}. It heals some health.`); s.events.push({ t: 'eat', item: it.id, heal: P.hp - b }); return P.hp - b; }
// equip: swaps the item in slot i with whatever is worn in its slot. Returns true on success.
export function equip(s, i) { const P = s.player, it = P.inv[i], d = it && s.defs.items[it.id]; if (!d || !d.slot) return false;
  const cur = P.equip[d.slot]; if (d.st && it.n > 1) { if (cur && freeSlots(s) < 1) return false; it.n--; P.equip[d.slot] = it.id; if (cur) addItem(s, cur, 1); }
  else { P.equip[d.slot] = it.id; P.inv[i] = cur ? { id: cur, n: 1 } : null; }
  s.events.push({ t: 'equip', item: it.id, slot: d.slot }); return true; }
export function unequip(s, slot) { const P = s.player, id = P.equip[slot]; if (!id) return false;
  if (!addItem(s, id, 1)) { msg(s, "You don't have enough inventory space."); return false; } P.equip[slot] = null; return true; }
// sellOne: sell ONE unit from slot i at the stall's supply price (SELLP) or gear price (40% of value), same tables as stallSell*.
export function stallSellOne(s, i) { const it = s.player.inv[i], d = it && s.defs.items[it.id]; if (!d) return 0;
  let p = s.defs.sellPrices[it.id] || 0; if (!p && d.slot && !d.pick && !d.axe) p = Math.floor((d.v || 10) * 0.4); if (!p) return 0;
  const sid = it.id; removeSlot(s, i, 1); grant(s, 'coins', p); s.events.push({ t: 'sell', item: sid, price: p }); return p; }

// ================= v15 parity ports from the live 2D index.html (talk, cooking, firemaking, thieving, prayer altar, bury, hunt tasks) =================
export const DIALOG = {
  guide: ['Welcome to Thornbury, traveller! Tap the ground to walk, or tap something to use it.', 'Press and hold anything — rocks, trees, creatures, even items — for more options like Examine.', 'Drag with one finger to turn the camera, pinch to zoom. Tap the minimap or the map button to travel.', 'Trees are just west of the village. Tap one: your axe swings, logs fill your backpack, and the tree becomes a stump.', 'Buy a small net at Merra’s shop, fish shrimp at Willow Pond, then cook your catch at the campfire.', 'At Fishing 5, use a rod and bait at the shoal for sardines; at level 10 you can also catch herring.', 'At Fishing 20, buy a fly-fishing rod and bring feathers to the trout run. Fishing 25 unlocks pike with a rod and bait.', 'Use the workbench for wooden gear, furnace for bars, and anvil for weapons. Cook meat at the fire. Tap JOBS for rewards.'],
  foreman: ['Cinderdell Quarry, finest rock in the realm.', 'Copper and tin need Mining level 1. Iron needs 15, gold 20, coal 30, and glimmerstone 40. A gem rock near the outer quarry wall also needs level 40.', 'Steel pickaxes need Mining level 6; bronze and iron work from level 1. Better pickaxes mine faster, and rocks run dry for a bit after you mine them.'],
  banker: ['Good day! Would you like to access your bank?'],
  guard: ['Move along, citizen. Ashenmoor is under my watch.'],
  shopkeep: ['Welcome to the Thornbury General Store!', 'Tools, weapons, armour and food. I buy ores and loot too — just choose Trade.'],
  fen: ["Back in my day the quarry was a day's walk. Now it's just east of the square!", 'Copper and tin for bronze, and the gold seams pay nicely at the store.'],
  pip: ['Have you seen the Warden down in Grimvale? Big as a house!', 'Captain Rook pays good coin for hunting. He stands at the south road.'] };
export const HUNT = [['mudhen', 1], ['rat', 2], ['thornling', 2], ['toad', 5], ['boar', 6], ['wolf', 10], ['guard', 14], ['wight', 20], ['ogre', 30], ['drake', 45]];
export const COOK = [{ raw: 'raw_meat', out: 'cooked_meat', xp: 30, level: 1, burnLow: 128, burnHigh: 512 }, { raw: 'raw_shrimp', out: 'cooked_shrimp', xp: 30, level: 1, burnLow: 128, burnHigh: 512 },
  { raw: 'raw_sardine', out: 'cooked_sardine', xp: 40, level: 1, burnLow: 118, burnHigh: 492 }, { raw: 'raw_herring', out: 'cooked_herring', xp: 50, level: 5, burnLow: 108, burnHigh: 472 },
  { raw: 'raw_trout', out: 'cooked_trout', xp: 70, level: 15, burnLow: 88, burnHigh: 432 }, { raw: 'raw_pike', out: 'cooked_pike', xp: 80, level: 20, burnLow: 78, burnHigh: 412 },
  { raw: 'raw_salmon', out: 'cooked_salmon', xp: 90, level: 25, burnLow: 68, burnHigh: 392 }];
export const FM_LOGS = { logs: { level: 1, xp: 40 }, oak_logs: { level: 15, xp: 60 }, willow_logs: { level: 30, xp: 90 } };
export const burnChance = (r, L) => 1 - Math.min(1, Math.max(0, (Math.floor(r.burnLow * (99 - L) / 98) + Math.floor(r.burnHigh * (L - 1) / 98) + 1) / 256));
export const pickChance = L => Math.min(100, Math.max(0, (Math.floor(180 * ((99 - L) / 98)) + Math.floor(240 * ((L - 1) / 98)) + 1) / 256 * 100)) / 100;
const inCombat = s => s.player.combat != null || s.npcs.some(n => !n.dead && n.target === true && n.aggro);
export function combatLvl(s) { const b = .25 * (lv(s, 'defence') + lv(s, 'hitpoints') + Math.floor(lv(s, 'prayer') / 2)); return Math.floor(b + .325 * (lv(s, 'attack') + lv(s, 'strength'))); }
function dialog(s, n, lines) { s.events.push({ t: 'dialog', name: n, lines }); for (const l of lines) msg(s, n + ': ' + l); }
export function talk(s, n) { const k = n.kind, d = s.defs.npcs[k], P = s.player, name = d.name;
  if (k === 'rook') return dialog(s, name, ['Captain Rook, hunt-master of Grimvale.', P.slay ? `Your task: ${P.slay.left} more ${s.defs.npcs[P.slay.k].name}s.` : 'Want a hunt task? Choose Get-task.', `Hunt points: ${P.huntPts || 0}.`]);
  if (k === 'guide') { const L = DIALOG.guide.slice(); if (!invCount(s, 'bread') && !P.bank.bread) { L.push('You look hungry. Take this bread for the road!'); dialog(s, name, L); addItem(s, 'bread', 3); msg(s, 'Elsa hands you 3 loaves of bread.'); return; } return dialog(s, name, L); }
  if (DIALOG[k]) { if (k === 'banker') s.events.push({ t: 'ui', ui: 'bank' }); return dialog(s, name, DIALOG[k]); }
  if (d.fight) return dialog(s, name, [d.say || 'Grrr!']);
  return dialog(s, name, ['...']); }
export function giveTask(s) { const P = s.player; if (P.slay) return dialog(s, 'Captain Rook', [`You still have ${P.slay.left} ${s.defs.npcs[P.slay.k].name}s to hunt.`]);
  const cb = combatLvl(s), pool = HUNT.filter(([k, l]) => l <= cb + 8 && s.defs.npcs[k]); const [k] = pool[rnd(s, 0, pool.length - 1)]; const n = rnd(s, 5, 12); P.slay = { k, n, left: n };
  dialog(s, 'Captain Rook', [`Hunt ${n} ${s.defs.npcs[k].name}s for me. Come back for your reward — it pays out the moment you finish.`]); }
export function huntKill(s, n) { const P = s.player; if (!P.slay || P.slay.k !== n.kind) return; P.slay.left--; const d = s.defs.npcs[n.kind];
  if (P.slay.left <= 0) { const r = P.slay.n * (d.lvl || 1) * 4 + 100; P.huntPts = (P.huntPts || 0) + 10; addItem(s, 'coins', r); msg(s, `Hunt complete! +${r} coins, +10 points`); s.events.push({ t: 'hunt', coins: r }); P.slay = null; }
  else if (P.slay.left % 3 === 0) msg(s, `Hunt task: ${P.slay.left} ${d.name}s left.`); }
function npcOp(s, n, op) { const P = s.player;
  if (op === 'Talk-to') return talk(s, n);
  if (op === 'Get-task') return giveTask(s);
  if (op === 'Pickpocket') { if (inCombat(s)) return msg(s, 'Finish combat before thieving.'); if (!invCount(s, 'coins') && !freeSlots(s)) return msg(s, 'You need one free inventory slot for the coins.');
    P.skill = { type: 'thieve', npc: n.id, start: s.tick, cycle: 2 }; return msg(s, `You try to pickpocket ${s.defs.npcs[n.kind].name}...`); } }
export function cookable(s) { return COOK.filter(r => invCount(s, r.raw) && lv(s, 'cooking') >= r.level); }
function objOp(s, o, op) { const P = s.player;
  if (o.type === 'campfire' && (op === 'Cook' || op === 'use')) { const all = COOK.filter(r => invCount(s, r.raw)); if (!all.length) { msg(s, 'You have nothing to cook.'); return true; }
    const r = all.find(r => lv(s, 'cooking') >= r.level); if (!r) { msg(s, `You need Cooking level ${all[0].level} to cook this.`); return true; }
    P.skill = { type: 'cook', o: o.id, raw: r.raw, start: s.tick, cycle: 2 }; msg(s, `You begin cooking ${s.defs.items[r.raw].n.toLowerCase()}.`); return true; }
  if (o.type === 'stall' && op === 'Steal-from') { if (inCombat(s)) { msg(s, 'Finish combat before stealing from the stall.'); return true; }
    if (lv(s, 'thieving') < 5) { msg(s, 'You need Thieving level 5 to steal from the village stall.'); return true; } if (o.dep) { msg(s, 'The stall is empty. The merchant is restocking it.'); return true; }
    if (!freeSlots(s)) { msg(s, 'You need a free inventory slot.'); return true; } P.skill = { type: 'stall', o: o.id, start: s.tick, cycle: 3 }; msg(s, 'You try to steal from the village stall...'); return true; }
  if (o.type === 'well' && op === 'Pray-at') { P.pp = lv(s, 'prayer'); msg(s, 'You kneel at the well. Your prayer points are restored.'); return true; }
  if (o.type === 'well' && op === 'Look-in') { msg(s, 'You peer into the well. Your reflection looks determined.'); return true; }
  return false; }
export function startLighting(s, raw, all) { const P = s.player, r = FM_LOGS[raw]; if (!r) return false; if (inCombat(s)) { msg(s, 'Finish combat before lighting logs.'); return false; }
  if (!invCount(s, 'tinderbox')) { msg(s, 'You need a tinderbox to light logs.'); return false; } if (lv(s, 'firemaking') < r.level) { msg(s, `You need Firemaking level ${r.level} to light these logs.`); return false; }
  if (!invCount(s, raw)) { msg(s, 'You have no logs to light.'); return false; } P.act = null; P.path = []; P.skill = { type: 'light', raw, remaining: all ? invCount(s, raw) : 1, start: s.tick, cycle: 4 }; msg(s, `You attempt to light the ${s.defs.items[raw].n.toLowerCase()}.`); return true; }
export function bury(s, i) { const P = s.player, it = P.inv[i]; const d = it && s.defs.items[it.id]; if (!d || !d.bury) return false; removeSlot(s, i, 1); addXp(s, 'prayer', d.bury); msg(s, 'You dig a hole in the ground... You bury the bones.'); s.events.push({ t: 'bury', item: it.id }); return true; }
function jobTick(s) { const P = s.player, job = P.skill, due = s.tick > job.start && (s.tick - job.start) % job.cycle === 0, I = s.defs.items;
  if (job.type === 'cook') { const o = objOf(s, job.o); if (cheb(P.x, P.y, o.x, o.y) !== 1 || P.combat != null) { P.skill = null; return; } if (!due) return;
    const r = COOK.find(r => r.raw === job.raw), i = P.inv.findIndex(it => it && it.id === job.raw); if (i < 0) { P.skill = null; msg(s, 'You have run out of raw food.'); return; }
    removeSlot(s, i, 1); if (rand(s) < burnChance(r, lv(s, 'cooking'))) { addItem(s, 'burnt_food', 1); msg(s, `You burn the ${I[r.raw].n.toLowerCase()}.`); s.events.push({ t: 'cook', ok: false, item: r.raw }); }
    else { addItem(s, r.out, 1); addXp(s, 'cooking', r.xp * RATE(s).s); msg(s, `You successfully cook the ${I[r.raw].n.replace(/^Raw /i, '').toLowerCase()}.`); s.events.push({ t: 'cook', ok: true, item: r.out }); }
    if (!invCount(s, job.raw)) { const nx = cookable(s)[0]; if (nx) job.raw = nx.raw; else P.skill = null; } return; }
  if (job.type === 'light') { if (inCombat(s) || !invCount(s, 'tinderbox')) { P.skill = null; msg(s, P.combat != null ? 'You stop lighting logs while in combat.' : 'You need a tinderbox to light logs.'); return; } if (!due) return;
    const i = P.inv.findIndex(it => it && it.id === job.raw), r = FM_LOGS[job.raw]; if (i < 0) { P.skill = null; msg(s, 'You have no more logs to light.'); return; }
    removeSlot(s, i, 1); addXp(s, 'firemaking', r.xp * RATE(s).s); msg(s, `The ${I[job.raw].n.toLowerCase()} catch fire and burn down to ash.`); s.events.push({ t: 'fire', item: job.raw, x: P.x, y: P.y }); job.remaining--; if (!invCount(s, job.raw) || job.remaining <= 0) P.skill = null; return; }
  if (job.type === 'thieve') { const n = npcOf(s, job.npc); if (!n || n.dead || !adjacent(s, n.x, n.y) || P.combat != null) { P.skill = null; return; } if (!due) return; P.skill = null;
    const nm = s.defs.npcs[n.kind].name; if (rand(s) >= pickChance(lv(s, 'thieving'))) { P.hp = Math.max(0, P.hp - 1); s.events.push({ t: 'hit', by: 'npc', npc: n.id, dmg: 1, tick: s.tick }); msg(s, `${nm} catches your hand. You lose 1 hitpoint.`); if (!P.hp) die(s); }
    else { addItem(s, 'coins', 3); addXp(s, 'thieving', 8 * RATE(s).s); msg(s, `You quietly take 3 coins from ${nm}.`); s.events.push({ t: 'thieve', coins: 3 }); } return; }
  if (job.type === 'stall') { const o = objOf(s, job.o); if (!o || o.dep || !adjacent(s, o.x, o.y) || inCombat(s)) { P.skill = null; return; } if (!due) return; P.skill = null;
    const rw = ['bread', 'cooked_meat', 'bronze_axe', 'small_net'], reward = rw[rnd(s, 0, rw.length - 1)];
    if (addItem(s, reward, 1)) { o.dep = s.tick + 12; addXp(s, 'thieving', 16 * RATE(s).s); msg(s, `You steal ${I[reward].n.toLowerCase()} from the village stall.`); s.events.push({ t: 'steal', item: reward }); } else msg(s, 'Your backpack is full.'); return; }
  P.skill = null; }
