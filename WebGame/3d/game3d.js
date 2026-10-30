// Bramblewick 3D gameplay bridge (v12). ALL game state lives in rules.mjs state G (single source of truth).
// This file only: loads defs, builds G, saves/loads bramblewick-save-v2, renders G (HP bars, splats, ground items,
// depletion) and provides UI screens (inventory, equipment, skills, bank, shop).
// v13: Eat/Wield/Wear/Remove/Sell-1 now live in rules.mjs (eat/equip/unequip/stallSellOne, tested in game_test_items.mjs).
// Save guard: never overwrite a save that changed in storage since this tab last read/wrote it (another tab / the 2D game).
import * as R from './game/rules.js?v=21';
(window.__B3mods=window.__B3mods||{}).game3d=1;if(typeof R.eat==='function')window.__B3mods.rules=1;
export {R};
const $=s=>document.querySelector(s);
export async function loadDefs(){const f=async n=>{let e;for(let k=0;k<4;k++){try{const r=await fetch('game/'+n+'.json?v=21');if(!r.ok)throw new Error('defs '+n+' '+r.status);return await r.json()}catch(x){e=x;await new Promise(z=>setTimeout(z,500*(k+1)))}}throw e};
 const [items,npcs,drops,shops,nodes]=await Promise.all(['items','npcs','drops','shops','nodes'].map(f));const D=R.defsFromJson({items,npcs,drops,shops,nodes});const pk=window.__B3pack;if(pk){const PK=await import('./packs.js?v=2');const er=PK.validatePack(pk,D);if(er.length){console.warn('pack rejected',er);window.__B3pack=null;return D}return PK.mergePack(D,pk)}return D}
const PKN=()=>window.__B3pack?':pack:'+window.__B3pack.manifest.pack:'';
export function initGame(ctx){const {THREE,S,M,npcs,objs,walk,hAt,msg,cam,DEF}=ctx;
 const gNpcs=[];npcs.forEach(e=>{if(DEF.npcs[e.d.kind]){e.gi=gNpcs.length;gNpcs.push({kind:e.d.kind,x:e.d.x,y:e.d.y})}});
 const gObjs=[];objs.forEach(o=>{if(o.type==='door')return;o.gi=gObjs.length;gObjs.push({type:o.type,x:o.x,y:o.y})});
 const G=R.createState(DEF,{seed:(Date.now()>>>0)||1,walk,objs:gObjs,npcs:gNpcs});G.opts.wander=true;
 // ---- save migration: back up existing save once, then load through rules.fromSave (v2 compatible)
 let raw=null,sv=null;try{raw=localStorage.getItem((R.SAVE_KEY+PKN()))}catch(e){}
 try{if(raw&&!localStorage.getItem(('b3d.save-backup.v1'+PKN())))localStorage.setItem(('b3d.save-backup.v1'+PKN()),JSON.stringify({at:new Date().toISOString(),from:'2d-or-earlier',save:raw}))}catch(e){}
 try{sv=raw?JSON.parse(raw):null}catch(e){sv=null}
 const loaded=R.fromSave(G,sv);const extra={pace:sv&&sv.pace,renderScale:sv&&sv.renderScale,cam:sv&&sv.cam};
 let dirty=!loaded,saves=0,refused=0,stale=false,lastRaw=raw;
 const save=()=>{if(stale){refused++;return false}try{const cur=localStorage.getItem((R.SAVE_KEY+PKN()));if(cur!==lastRaw){stale=true;refused++;msg('Your progress was saved from another tab or the 2D game; this tab will not overwrite it. Reload to continue.','r');return false}
  const s=JSON.stringify(R.toSave(G,{...extra,gen:((sv&&sv.gen)||0)+saves+1,savedAt:Date.now(),by:'3d'}));localStorage.setItem((R.SAVE_KEY+PKN()),s);lastRaw=s;saves++;dirty=false;return true}catch(e){return false}};
 window.__B3rollback=()=>{const b=JSON.parse(localStorage.getItem(('b3d.save-backup.v1'+PKN()))||'null');if(!b)return 'no backup';localStorage.setItem((R.SAVE_KEY+PKN()),b.save);return 'restored backup from '+b.at+'; reload the page'};
 addEventListener('pagehide',save);document.addEventListener('visibilitychange',()=>{if(document.hidden)save()});
 const I=DEF.items,nm=id=>(I[id]&&I[id].n)||id;
 // ---- overlay (HP bars + hit splats)
 const ov=document.createElement('div');ov.id='gov';ov.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:5;overflow:hidden';document.body.appendChild(ov);
 const bars=new Map(),splats=[];const v3=new THREE.Vector3();
 const scr=(x,y,z)=>{v3.set(x,y,z).project(cam);return [(v3.x+1)/2*innerWidth,(1-v3.y)/2*innerHeight,v3.z<1]};
 const splat=(ent,dmg)=>{const d=document.createElement('div');d.className='splat'+(dmg?'':' miss');d.textContent=dmg;ov.appendChild(d);splats.push({d,ent,t:performance.now()})};
 // ---- ground items (pickable)
 const gmesh=new Map(),pickables=[];const gGeo=new THREE.BoxGeometry(.28,.18,.28);
 const colOf=id=>{let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))>>>0;return new THREE.Color().setHSL((h%360)/360,.55,.5)};
 function syncGround(){for(const [g,m] of gmesh)if(!G.ground.includes(g)){S.remove(m);pickables.splice(pickables.indexOf(m),1);gmesh.delete(g)}
  for(const g of G.ground)if(!gmesh.has(g)){const m=new THREE.Mesh(gGeo,new THREE.MeshLambertMaterial({color:id2col(g.id)}));const k=G.ground.filter(q=>q.x===g.x&&q.y===g.y).indexOf(g);
   m.position.set(g.x+.5+(k%3-1)*.22,hAt(g.x+.5,g.y+.5)+.09,g.y+.5+(Math.floor(k/3)%3-1)*.22);m.castShadow=true;m.userData.ground=g;if(G.tick>0){m.material.emissive.set(0xffc030);m.userData.glow=performance.now()}S.add(m);pickables.push(m);gmesh.set(g,m)}}
 const id2col=id=>id==='coins'?0xf2c94c:id.includes('bones')?0xeeeeee:colOf(id);
 // ---- depletion visuals (merged static meshes: collapse that object's vertex ranges; stump/rubble marker)
 const stumpG=new THREE.CylinderGeometry(.16,.2,.3,8),rubG=new THREE.DodecahedronGeometry(.25,0);const depM=new Map();
 function setDepleted(o,on){const g=o.grp;if(!g||!g.userData.mr)return;for(const r of g.userData.mr){const a=r.attr.array;if(on){r.save=a.slice(r.start*3,(r.start+r.count)*3);for(let i=r.start;i<r.start+r.count;i++)a[i*3+1]=-999}else if(r.save)a.set(r.save,r.start*3);r.attr.needsUpdate=true}
  if(on){const m=new THREE.Mesh(o.type in {tree:1,oak:1,willow:1,yew:1,magic:1}?stumpG:rubG,new THREE.MeshLambertMaterial({color:o.type in {tree:1,oak:1,willow:1,yew:1,magic:1}?0x5e4128:0x6f6a62,flatShading:true}));m.position.set(o.x+.5,hAt(o.x+.5,o.y+.5)+.12,o.y+.5);m.raycast=()=>{};S.add(m);depM.set(o,m)}else{const m=depM.get(o);if(m)S.remove(m);depM.delete(o)}}
 // ---- UI panel (reuses #inv) + tabs
 const pan=$('#inv');pan.innerHTML='';pan.className='hud gpan';let mode='inv';
 const tabs=document.createElement('div');tabs.id='gtabs';tabs.className='hud';tabs.innerHTML='<button data-m="equip">⚔️</button><button data-m="skills">📊</button>';document.body.appendChild(tabs);
 const open=m=>{mode=m;pan.style.display='grid';draw()},close=()=>{pan.style.display='none';if(mode==='bank'||mode==='shop')mode='inv'};
 tabs.onclick=e=>{const b=e.target.closest('button');if(!b)return;(pan.style.display==='grid'&&mode===b.dataset.m)?close():open(b.dataset.m)};
 $('#invb').onclick=()=>(pan.style.display==='grid'&&mode==='inv')?close():open('inv');
 const menu=$('#menu');function pmenu(x,y,title,list){menu.innerHTML=`<div class="h">${title}</div>`+list.map((e,i)=>`<div class="e" data-i="${i}">${e[0]}</div>`).join('')+'<div class="e" data-i="x">Cancel</div>';menu.style.display='block';
  menu.style.left=Math.max(4,Math.min(x-80,innerWidth-174))+'px';menu.style.top=Math.max(4,Math.min(y-20,innerHeight-menu.offsetHeight-4))+'px';menu.onclick=ev=>{const i=ev.target.closest('.e')?.dataset.i;menu.style.display='none';if(i!=null&&i!=='x'){list[+i][1]();draw()}}}
 const cell=(it,i,extra='')=>it?`<div class="slot" data-i="${i}" ${extra} style="--c:#${new THREE.Color(id2col(it.id)).getHexString()}"><b>${nm(it.id).slice(0,10)}</b>${it.n>1?`<i>${it.n>=1e5?Math.floor(it.n/1e3)+'k':it.n}</i>`:''}</div>`:`<div class="slot e" data-i="${i}"></div>`;
 function uiItemAction(i,op){const P=G.player,it=P.inv[i];if(!it)return;const d=I[it.id];
  if(op==='Eat')R.eat(G,i);
  else if(op==='Wield'||op==='Wear'){if(R.equip(G,i))msg(`You ${op.toLowerCase()} the ${nm(it.id).toLowerCase()}.`)}
  else if(op==='Sell'){const p=R.stallSellOne(G,i);msg(p?`You sell the ${nm(it.id).toLowerCase()} for ${p} coins.`:'The stall will not buy that.')}
  else if(op==='Bury')R.bury(G,i);else if(op==='Light'||op==='Light-all'){if(R.startLighting(G,it.id,op==='Light-all'))close()}
  else if(op==='Drop'){R.dropGround(G,it.id,it.n,P.x,P.y);P.inv[i]=null}
  else if(op==='Deposit-1')R.deposit(G,i,1);else if(op==='Deposit-All')R.deposit(G,i,d.st?it.n:R.invCount(G,it.id));
  dirty=true}
 function unequip(sl){R.unequip(G,sl);dirty=true}
 function draw(){const P=G.player;let h='';
  if(mode==='inv'||mode==='bank'||mode==='shop'){h+=`<div class="ph">${mode==='bank'?'Bank — tap item to deposit':mode==='shop'?'General stall — tap item to sell':'Inventory'} <span>${R.invCount(G,'coins')} gp</span></div><div class="grid">`+P.inv.map((it,i)=>cell(it,i)).join('')+'</div>';
   if(mode==='bank'){const ks=Object.keys(P.bank);h+=`<div class="ph">Bank (${ks.length}) <button data-a="depall">Deposit all</button></div><div class="grid bk">`+ks.map(k=>cell({id:k,n:P.bank[k]},k,`data-b="${k}"`)).join('')+'</div>'}
   if(mode==='shop'){const rows=DEF.shops.general_stall.buy;h+=`<div class="ph">Buy <button data-a="sellsup">Sell supplies</button><button data-a="sellgear">Sell gear</button></div><div class="shop">`+rows.map((r,k)=>`<div class="row" data-buy="${k}"><b>${nm(r.item)}</b><span>${r.price} gp</span></div>`).join('')+'</div>'}}
  else if(mode==='equip'){h+=`<div class="ph">Equipment <span>atk+${R.bonus(G,'ab')} str+${R.bonus(G,'sb')} def+${R.bonus(G,'db')}</span></div><div class="eqg">`+['head','weapon','body','shield','legs'].map(sl=>`<div class="slot eq" data-eq="${sl}"><small>${sl}</small><b>${P.equip[sl]?nm(P.equip[sl]):'—'}</b></div>`).join('')+`</div><div class="ph">Style: ${['accurate','aggressive','defensive'].map(s=>`<button data-st="${s}" class="${P.style===s?'on':''}">${s}</button>`).join('')}</div>`}
  else if(mode==='skills'){h+=`<div class="ph">Skills <span>total ${R.SKILLS.reduce((a,k)=>a+R.lv(G,k),0)}</span></div><div class="sk">`+R.SKILLS.map(k=>`<div><b>${k}</b><span>${R.lv(G,k)}</span><small>${Math.floor(P.xp[k]||0)} xp</small></div>`).join('')+'</div>'}
  pan.innerHTML=h}
 pan.addEventListener('click',e=>{const P=G.player,t=e.target;const a=t.closest('[data-a]')?.dataset.a;
  if(a==='depall'){for(let i=0;i<28;i++)if(P.inv[i])R.deposit(G,i,I[P.inv[i].id].st?P.inv[i].n:R.invCount(G,P.inv[i].id));dirty=true;draw();return}
  if(a==='sellsup'){const n=R.stallSellSupplies(G);msg(n?`You sell your supplies for ${n} coins.`:'You have no supplies the stall buys.');dirty=true;draw();return}
  if(a==='sellgear'){const n=R.stallSellGear(G);msg(n?`You sell your spare gear for ${n} coins.`:'You have no gear the stall buys.');dirty=true;draw();return}
  const st=t.closest('[data-st]');if(st){P.style=st.dataset.st;dirty=true;draw();return}
  const by=t.closest('[data-buy]');if(by){const r=DEF.shops.general_stall.buy[+by.dataset.buy];pmenu(e.clientX,e.clientY,nm(r.item)+' — '+r.price+' gp',[['Buy 1',()=>{if(R.stallBuy(G,r.item))msg(`You buy ${nm(r.item)} for ${r.price} gp. You have ${R.invCount(G,'coins')} gp left.`);dirty=true}]]);return}
  const eq=t.closest('[data-eq]');if(eq&&P.equip[eq.dataset.eq]){pmenu(e.clientX,e.clientY,nm(P.equip[eq.dataset.eq]),[['Remove',()=>unequip(eq.dataset.eq)]]);return}
  const s=t.closest('.slot');if(!s||s.classList.contains('e'))return;
  if(s.dataset.b){const k=s.dataset.b;pmenu(e.clientX,e.clientY,nm(k),[['Withdraw-1',()=>{R.withdraw(G,k,1);dirty=true}],['Withdraw-All',()=>{R.withdraw(G,k,P.bank[k]||0);dirty=true}]]);return}
  const i=+s.dataset.i,it=P.inv[i];if(!it)return;const d=I[it.id];const L=[];
  if(mode==='bank'){L.push(['Deposit-1',()=>uiItemAction(i,'Deposit-1')],['Deposit-All',()=>uiItemAction(i,'Deposit-All')])}
  else if(mode==='shop')L.push(['Sell 1',()=>uiItemAction(i,'Sell')]);
  else{if(d.eat)L.push(['Eat',()=>uiItemAction(i,'Eat')]);if(d.slot)L.push([d.slot==='weapon'?'Wield':'Wear',()=>uiItemAction(i,d.slot==='weapon'?'Wield':'Wear')]);if(d.bury)L.push(['Bury',()=>uiItemAction(i,'Bury')]);if(R.FM_LOGS&&R.FM_LOGS[it.id]){L.push(['Light',()=>uiItemAction(i,'Light')]);L.push(['Light-all',()=>uiItemAction(i,'Light-all')])}L.push(['Drop',()=>uiItemAction(i,'Drop')])}
  L.push(['Examine',()=>msg(d.ex||d.n)]);pmenu(e.clientX,e.clientY,d.n,L)});
 // ---- pending UI (bank/shop/door) opened on arrival
 let pend=null;const want=(p)=>{p.idle=0;pend=p};
 // ---- per-tick sync: call after R.tick
 const lvBefore={};R.SKILLS.forEach(k=>lvBefore[k]=R.lv(G,k));
 function showDialog(ev){let el=document.getElementById('dlg');if(!el){el=document.createElement('div');el.id='dlg';el.style.cssText='position:fixed;left:8px;right:8px;bottom:calc(84px + env(safe-area-inset-bottom));z-index:60;background:rgba(40,30,18,.94);border:2px solid #c9a24a;border-radius:8px;color:#f3e6c4;font:14px/1.35 system-ui,sans-serif;padding:10px 12px;max-height:40vh;overflow:auto';el.onclick=()=>{el._k++;if(el._k>=el._ev.lines.length)el.remove();else draw1()};document.body.appendChild(el)}const draw1=()=>{const e=el._ev;el.innerHTML=`<b style="color:#ffd36b">${e.name}</b><div>${e.lines[el._k]}</div><div style="opacity:.6;font-size:11px;text-align:right">${el._k+1}/${e.lines.length} · tap to continue</div>`};el._ev=ev;el._k=0;draw1()}
 function afterTick(){const P=G.player;if(window.__B3fx)try{window.__B3fx(G.events)}catch(e){console.error(e)}
  for(const ev of G.events){if(ev.t==='hit'){if(ev.by==='player'){const e=npcs.find(n=>n.gi===ev.npc);if(e)splat(e,ev.dmg)}else splat(ctx.Pl,ev.dmg)}
   else if(ev.t==='kill')msg(`You defeat the ${DEF.npcs[ev.kind].name}.`);else if(ev.t==='drop')msg(`Loot: ${ev.n>1?ev.n+' × ':''}${nm(ev.item)}`,'y');
   else if(ev.t==='pickup')msg(`You pick up ${ev.n>1?ev.n+' × ':''}${nm(ev.item)}.`);else if(ev.t==='gather')msg(`You get some ${nm(ev.item).toLowerCase()}.`);
   else if(ev.t==='dialog')showDialog(ev);else if(ev.t==='ui')pend={x:G.player.x,y:G.player.y,r:9,ui:ev.ui,idle:0};
   else if(ev.t==='death')msg('Oh dear, you are dead! You respawn in the village.','r');
   else if(ev.t==='xp'){const n=R.lv(G,ev.skill);if(n>lvBefore[ev.skill])msg(`Congratulations, your ${ev.skill} level is now ${n}.`,'y');lvBefore[ev.skill]=n}
   if(ev.t!=='xp')dirty=true;else dirty=true}
  G.events.length=0;for(const l of G.log)msg(l);G.log.length=0;
  for(const o of objs)if(o.gi!=null){const d=!!G.objs[o.gi].dep;if(d!==!!o._dep){o._dep=d;setDepleted(o,d)}}
  syncGround();
  const idleAct=!P.act||(P.act.kind==='walk'&&!P.path.length);if(pend&&idleAct&&!P.path.length){const p=pend;const c=R.cheb(P.x,P.y,p.x,p.y);if(c<=(p.r||1)){pend=null;if(p.ui)open(p.ui);if(p.fn)p.fn()}else if(++p.idle>2)pend=null}else if(pend&&(P.path.length||!idleAct))pend.idle=0;
  if(G.tick%5===0&&dirty)save();
  const hp=$('#hp span');if(hp)hp.textContent=P.hp;const rn=$('#run span');if(rn)rn.textContent=Math.floor(P.energy);$('#run').classList.toggle('on',!!P.run);
  if(pan.style.display==='grid'&&!menu.contains(document.activeElement))draw()}
 // ---- per-frame overlay
 function frame(now){const live=new Set();for(const m of gmesh.values())if(m.userData.glow){const a=(now-m.userData.glow)/1000;if(a>20){m.material.emissive.set(0);m.userData.glow=0}else{m.material.emissiveIntensity=.45+.45*Math.sin(now/180);m.scale.setScalar(1+.12*Math.max(0,Math.sin(now/180)))}}
  const show=(e,hp,max,key)=>{let b=bars.get(key);if(!b){b=document.createElement('div');b.className='hpb';b.innerHTML='<i></i>';ov.appendChild(b);bars.set(key,b)}live.add(key);const p=e.g.position;const [x,y,vis]=scr(p.x,p.y+(e.g.userData.h||2.1)*e.g.scale.y,p.z);b.style.display=vis?'block':'none';b.style.transform=`translate(${x-20}px,${y-6}px)`;b.firstChild.style.width=(100*Math.max(0,hp)/max)+'%'};
  const P=G.player;for(const e of npcs){if(e.gi==null)continue;const n=G.npcs[e.gi];if(!n.dead&&(n.target||n.hp<(DEF.npcs[n.kind].hp||1)))show(e,n.hp,DEF.npcs[n.kind].hp||1,e.gi)}
  if(P.combat!=null||P.hp<R.maxHp(G)||G.npcs.some(n=>n.target))show(ctx.Pl,P.hp,R.maxHp(G),'pl');
  for(const [k,b] of bars)if(!live.has(k)){b.remove();bars.delete(k)}
  for(let i=splats.length-1;i>=0;i--){const s=splats[i],a=(now-s.t)/1100;if(a>1){s.d.remove();splats.splice(i,1);continue}const p=s.ent.g.position;const [x,y]=scr(p.x,p.y+1.2,p.z);s.d.style.transform=`translate(${x-14}px,${y-14-a*18}px)`;s.d.style.opacity=a>.7?(1-a)/.3:1}}
 draw();
 return {G,R,DEF,pickables,afterTick,frame,want,open,close,save,uiItemAction,unequip,stats:()=>({saves,refused,stale,loaded,backup:!!localStorage.getItem(('b3d.save-backup.v1'+PKN())),pend:pend?{x:pend.x,y:pend.y,ui:pend.ui,idle:pend.idle}:null})}}
