// b2.js v1 — starter kit (one-time, never saves), magic spellbook + autocast, auto-retaliate toggle.
// Runes + magic XP live ONLY in localStorage 'b3d.magic.v1' (separate from bramblewick-save-v2). Never calls save().
export function initB2({THREE,G,R,DEF,Pl,npcs,msg}){
 const P=()=>G.player,MK='b3d.magic.v1',KK='b3d.kit.v1';
 const rd=k=>{try{return JSON.parse(localStorage.getItem(k)||'null')}catch(e){return null}},wr=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
 let M=rd(MK);if(!M||typeof M!=='object'||!M.runes)M={xp:0,runes:{air:30,mind:30,water:0,earth:0,fire:0},auto:null,v:1};const sv=()=>wr(MK,M);sv();
 const SP=[{id:'wind',n:'Wind Strike',lv:1,c:{air:1,mind:1},max:2,xp:5.5,col:0xd8f0ff},{id:'water',n:'Water Strike',lv:5,c:{air:1,water:1,mind:1},max:4,xp:7.5,col:0x3a8cff},{id:'earth',n:'Earth Strike',lv:9,c:{air:1,earth:2,mind:1},max:6,xp:9.5,col:0x8a6a2a},{id:'fire',n:'Fire Strike',lv:13,c:{air:2,fire:3,mind:1},max:8,xp:11.5,col:0xff6a1a}];
 const XPT=[0];for(let l=1,p=0;l<99;l++){p+=Math.floor(l+300*Math.pow(2,l/7));XPT.push(Math.floor(p/4))}
 const mlv=()=>{let l=1;while(l<99&&M.xp>=XPT[l])l++;return l};
 const can=s=>mlv()>=s.lv&&Object.entries(s.c).every(([k,n])=>(M.runes[k]||0)>=n);
 const S=Pl.g.parent;const proj=[];
 function bolt(s,n){const e=npcs.find(x=>x.gi===n.id);if(!e||!e.g)return;const m=new THREE.Mesh(new THREE.IcosahedronGeometry(.13,0),new THREE.MeshBasicMaterial({color:s.col}));m.raycast=()=>{};m.position.copy(Pl.g.position).y+=1.2;S.add(m);proj.push({m,e,t:0})}
 function cast(s,n,auto){if(!n||n.dead||!can(s))return false;for(const [k,c] of Object.entries(s.c))M.runes[k]-=c;
  const d=DEF.npcs[n.kind]||{};const hit=Math.random()<Math.max(.35,Math.min(.9,.55+(mlv()-(d.def||1))*.02));let dmg=hit?1+Math.floor(Math.random()*s.max):0;dmg=Math.min(dmg,n.hp);n.hp-=dmg;
  G.events.push({t:'hit',by:'player',npc:n.id,dmg,tick:G.tick,magic:s.id});M.xp+=s.xp+dmg*2;bolt(s,n);if(n.target===false)n.target=true;if(n.hp<=0)R.kill(G,n);sv();ui();return true}
 // events: autocast alongside each player swing; runes drop from kills
 let busy=false;const prev=window.__B3fx;window.__B3fx=evs=>{if(prev)prev(evs);if(busy)return;busy=true;try{const L0=evs.length;for(let i=0;i<L0;i++){const e=evs[i];
   if(e.t==='hit'&&e.by==='player'&&!e.magic&&M.auto){const s=SP.find(x=>x.id===M.auto),n=G.npcs[e.npc];if(s&&n&&!n.dead&&!cast(s,n,1)&&!can(s)){M.auto=null;sv();msg('You have run out of runes for autocast.','r');ui()}}
   if(e.t==='kill'){const r=['air','mind','water','earth','fire'][Math.floor(Math.random()*5)],k=1+Math.floor(Math.random()*4);M.runes[r]=(M.runes[r]||0)+k;sv();msg(`You find ${k} ${r} rune${k>1?'s':''}.`,'y');ui()}}}finally{busy=false}};
 function loop(){for(let i=proj.length-1;i>=0;i--){const p=proj[i];p.t+=1/30;const tp=p.e.g.position;p.m.position.lerp({x:tp.x,y:tp.y+.9,z:tp.z},Math.min(1,p.t*2.2));p.m.rotation.y+=.3;if(p.t>.55){S.remove(p.m);p.m.geometry.dispose();proj.splice(i,1)}}requestAnimationFrame(loop)}requestAnimationFrame(loop);
 // ---- UI
 const css=document.createElement('style');css.textContent='#b2btn{position:fixed;left:12px;bottom:310px;z-index:20;width:44px;height:44px;border-radius:10px;border:2px solid #6b5a3a;background:#3a3020e6;color:#ffd84a;font:22px serif}#b2p{position:fixed;left:62px;bottom:200px;z-index:21;width:240px;background:#2a2418f2;border:2px solid #6b5a3a;border-radius:10px;color:#eee;font:13px sans-serif;padding:8px;display:none}#b2p .s{display:flex;align-items:center;gap:4px;padding:5px 2px;border-bottom:1px solid #4a3e2a}#b2p .s.off{opacity:.45}#b2p button{background:#5a4a2a;color:#ffd84a;border:1px solid #8a7a4a;border-radius:6px;padding:3px 6px;font:12px sans-serif}#b2p button.on{background:#2a6a2a;color:#fff}#b2p .h{color:#ffd84a;font-weight:bold;display:flex;justify-content:space-between}';document.head.appendChild(css);
 const btn=document.createElement('button');btn.id='b2btn';btn.textContent='✦';btn.title='Magic';document.body.appendChild(btn);const pn=document.createElement('div');pn.id='b2p';document.body.appendChild(pn);
 btn.onclick=e=>{e.stopPropagation();pn.style.display=pn.style.display==='block'?'none':'block';ui()};
 for(const ev of ['pointerdown','touchstart','click'])pn.addEventListener(ev,e=>e.stopPropagation());
 function ui(){if(pn.style.display!=='block')return;const r=M.runes;pn.innerHTML=`<div class="h"><span>Magic lvl ${mlv()}</span><span>✕</span></div><div style="font-size:11px;color:#ccc;margin:3px 0">Runes: air ${r.air||0} · mind ${r.mind||0} · water ${r.water||0} · earth ${r.earth||0} · fire ${r.fire||0}</div>`+
  SP.map(s=>`<div class="s ${can(s)?'':'off'}"><span style="flex:1">${s.n}<br><small>lvl ${s.lv} · max ${s.max}</small></span><button data-c="${s.id}">Cast</button><button data-a="${s.id}" class="${M.auto===s.id?'on':''}">Auto</button></div>`).join('')+
  `<div class="s"><span style="flex:1">Auto-retaliate</span><button data-r class="${P().autoRet?'on':''}">${P().autoRet?'On':'Off'}</button></div>`;
  pn.querySelector('.h span:last-child').onclick=()=>{pn.style.display='none'};
  pn.querySelectorAll('[data-c]').forEach(b=>b.onclick=()=>{const s=SP.find(x=>x.id===b.dataset.c),n=P().combat!=null?G.npcs[P().combat]:null;if(!n){msg('Attack something first, then cast.','r');return}if(mlv()<s.lv){msg(`You need Magic level ${s.lv}.`,'r');return}if(!cast(s,n))msg('You do not have enough runes.','r')});
  pn.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{const s=SP.find(x=>x.id===b.dataset.a);if(M.auto===s.id)M.auto=null;else if(can(s))M.auto=s.id;else{msg(mlv()<s.lv?`You need Magic level ${s.lv}.`:'You do not have enough runes.','r');return}sv();msg(M.auto?`Autocast: ${s.n}`:'Autocast off','y');ui()});
  pn.querySelector('[data-r]').onclick=()=>{P().autoRet=!P().autoRet;msg('Auto-retaliate '+(P().autoRet?'on':'off'),'y');ui()}}
 // ---- starter kit: once per device+name, only after the cloud/local save is fully applied, never saves itself
 const KIT=[['bronze_axe',1],['bronze_pickaxe',1],['small_net',1],['tinderbox',1],['bread',3]];
 const has=id=>(P().inv||[]).some(x=>x&&x.id===id)||Object.values(P().equip||{}).includes(id)||((P().bank||{})[id]>0);
 async function kit(){try{await window.__B3sync}catch(e){}await new Promise(r=>setTimeout(r,15000));
  const nm=(P().name||'guest');const f=rd(KK)||{};if(f[nm])return;const st=window.__B3online&&window.__B3online.state;if(st==='conflict'||document.querySelector('#bwcmp'))return;
  const got=[];for(const [id,n] of KIT){if(!DEF.items[id]||has(id))continue;if(R.addItem(G,id,n))got.push(DEF.items[id].n||id)}
  f[nm]={at:new Date().toISOString(),got};wr(KK,f);if(got.length)msg('Starter kit: '+got.join(', ')+'.','y')}
 kit();
 return {state:()=>({lv:mlv(),xp:M.xp,runes:{...M.runes},auto:M.auto,kit:rd(KK)})}}
