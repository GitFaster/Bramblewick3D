/* Bramblewick optional content packs (opt-in, ?pack=<name>). Pack ids must carry the pack prefix (e.g. 't:'),
   so they never collide with base ids. Pack mode uses its own save slot; the main save is never read-modified. */
export const PACK_RE=/^[a-z0-9_-]{1,32}$/;
export function packName(search){const p=new URLSearchParams(search||'').get('pack');return p&&PACK_RE.test(p)?p:null}
export function validatePack(pk,base){const err=[],m=pk&&pk.manifest,pre=m&&m.prefix;
 if(!pre||typeof pre!=='string'||!/^[a-z]+:$/.test(pre))return ['bad prefix'];const D=pk.defs||{};
 for(const t of ['items','npcs','drops'])for(const k in D[t]||{}){if(!k.startsWith(pre))err.push(t+' id without prefix '+k);if(base&&base[t]&&base[t][k])err.push(t+' collides '+k)}
 for(const k in D.drops||{}){if(!(D.npcs||{})[k]&&!(base&&base.npcs[k]))err.push('drop for unknown npc '+k);for(const r of D.drops[k].rolls||[]){if(!(D.items||{})[r.item]&&(base?!base.items[r.item]:r.item.startsWith(pre)))err.push('drop item unknown '+r.item);if(!(r.min>=1&&r.max>=r.min))err.push('bad qty '+k)}}
 for(const k in D.npcs||{}){const n=D.npcs[k];if(!(n.hp>=1&&n.lvl>=0&&Array.isArray(n.ops)))err.push('bad npc '+k)}
 for(const k in D.shops||{})for(const r of D.shops[k].buy||[])if(!(D.items||{})[r.item]&&!(base&&base.items[r.item]))err.push('shop item unknown '+r.item);
 for(const p of pk.place||[])if(!(D.npcs||{})[p.kind])err.push('place unknown '+p.kind);return err}
export function mergePack(base,pk){const out={...base};for(const t of ['items','npcs','drops'])out[t]={...base[t],...((pk.defs||{})[t]||{})};
 const ps=(pk.defs||{}).shops||{};if(base.shops&&base.shops.general_stall){const gs=base.shops.general_stall,seen=new Set(gs.buy.map(r=>r.item)),add=[];for(const k in ps)for(const r of ps[k].buy||[])if(out.items[r.item]&&r.price>0&&!seen.has(r.item)){seen.add(r.item);add.push({item:r.item,price:r.price,shop:ps[k].name})}
  out.shops={...base.shops,general_stall:{...gs,buy:[...gs.buy,...add]}}}return out}
export async function loadPack(name){if(!PACK_RE.test(name))throw new Error('bad pack');const r=await fetch('game/packs/'+name+'/slice.json?v=2');if(!r.ok)throw new Error('pack '+r.status);return await r.json()}
