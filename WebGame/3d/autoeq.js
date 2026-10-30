// Auto-equip newly acquired upgrades through the normal inventory action.
// Counts include worn gear so taking an item off is never treated as new loot.
const KEY = 'b3d.ui.v1';
const enabled = () => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}').autoEq !== false; }
  catch { return true; }
};
export function initAutoEq() {
  const {G, GM} = window.B3, R = GM.R, items = G.defs.items, P = G.player;
  const state = {n: 0, last: null};
  const canUse = d => !d.rq || Object.entries(d.rq).every(([skill, level]) =>
    Number.isFinite(R.lv(G, skill)) && R.lv(G, skill) >= level);
  const isTool = d => !!d && (d.pick || d.axe || /\b(pickaxe|axe)\b/i.test(d.n || ''));
  const specialist = d => !!d && (d.rq?.magic || d.rq?.ranged || /\b(staff|shortbow|longbow)\b/i.test(d.n || ''));
  const score = d => !d ? -1 : d.slot === 'weapon'
    ? (d.ab || 0) + (d.sb || 0) + (d.db || 0) * .2
    : (d.db || 0) + ((d.ab || 0) + (d.sb || 0)) * .3;
  function owned() {
    const counts = new Map();
    const add = (id, n = 1) => { if (id) counts.set(id, (counts.get(id) || 0) + n); };
    P.inv.forEach(it => { if (it) add(it.id, it.n || 1); });
    Object.values(P.equip).forEach(id => add(id));
    return counts;
  }
  let known = owned();
  const pending = new Set();
  function check() {
    // A bank withdrawal/trade isn't loot. Observe it without queuing upgrades.
    const mode = GM.uiMode?.();
    const busy = mode === 'bank' || mode === 'shop';
    const counts = owned();
    if (!enabled()) { known = counts; pending.clear(); return; }
    if (busy) { known = counts; return; }
    for (const [id, count] of counts) if (count > (known.get(id) || 0)) pending.add(id);
    known = counts;
    const candidates = [...pending].sort((a, b) => score(items[b]) - score(items[a]));
    for (const id of candidates) {
      const i = P.inv.findIndex(it => it?.id === id), d = items[id];
      if (i < 0 || !d?.slot || isTool(d) || d.st || (d.slot === 'weapon' && specialist(d))) { pending.delete(id); continue; }
      if (!canUse(d)) continue;
      // Keep player-selected tools and two-handed setups; don't silently change styles.
      const weapon = items[P.equip.weapon];
      if ((d.two && P.equip.shield) || (d.slot === 'shield' && weapon?.two) ||
          (d.slot === 'weapon' && (weapon?.two || isTool(weapon) || specialist(weapon)))) continue;
      const current = P.equip[d.slot], previous = items[current];
      pending.delete(id);
      if (score(d) <= score(previous) + .01) continue;
      GM.uiItemAction(i, d.slot === 'weapon' ? 'Wield' : 'Wear');
      if (P.equip[d.slot] === id) {
        state.n++; state.last = id;
        R.msg(G, `Auto-equipped your new ${(d.n || id).toLowerCase()}. Turn off in ⚙️.`);
        known = owned();
      }
    }
  }
  const timer = setInterval(() => { try { check(); } catch (e) { state.err = String(e); } }, 1200);
  state.check = check;
  state.pend = () => [...pending];
  state.stop = () => clearInterval(timer);
  return state;
}
