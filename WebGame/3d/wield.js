// wield.js v1 — held weapons/shield/tools on hand joints, weapon-specific swings, NPC lunge + flinch, foot grounding.
// Pure visual layer: reads G (rules state) and never writes game state or saves.
export function initWield({THREE,G,Pl,npcs}){
 const MET=[['bronze',0xb87333],['iron',0x8a8a8a],['steel',0xc0c6cc],['black',0x2a2a2e],['mithril',0x4a5aa0],['adamant',0x4a8a5a],['rune',0x4ac0d0],['dragon',0xb02020],['thorn',0x5a7a3a],['wood',0x8a5a32]];
 const metC=id=>{for(const [k,c] of MET)if(id.includes(k))return c;return 0x9a9a9a};const WOOD=0x6b4a2a,MC=new Map();
 const mat=c=>{if(!MC.has(c))MC.set(c,new THREE.MeshLambertMaterial({color:c}));return MC.get(c)};const BX=new THREE.BoxGeometry(1,1,1);
 function mesh(kind,c){const g=new THREE.Group(),B=(w,h,d,col,x,y,z)=>{const m=new THREE.Mesh(BX,mat(col));m.scale.set(w,h,d);m.position.set(x,y,z);m.castShadow=true;g.add(m);return m};
  if(kind==='sword'){B(.04,.04,.12,0x3a2a1a,0,0,0);B(.16,.03,.03,0x777777,0,0,.07);B(.05,.015,.55,c,0,0,.36)}
  else if(kind==='dagger'){B(.04,.04,.1,0x3a2a1a,0,0,0);B(.04,.015,.26,c,0,0,.18)}
  else if(kind==='mace'){B(.035,.035,.45,WOOD,0,0,.18);B(.11,.11,.11,c,0,0,.44)}
  else if(kind==='axe'){B(.035,.035,.6,WOOD,0,0,.22);B(.03,.16,.13,c,0,.05,.48)}
  else if(kind==='pick'){B(.035,.035,.6,WOOD,0,0,.22);B(.03,.42,.05,c,0,0,.5)}
  else if(kind==='staff'){B(.04,.04,1.1,WOOD,0,0,.25);const o=new THREE.Mesh(new THREE.IcosahedronGeometry(.07,0),new THREE.MeshBasicMaterial({color:c}));o.position.z=.82;g.add(o)}
  else if(kind==='bow'){B(.03,.7,.03,WOOD,0,0,.05)}
  else if(kind==='net'){B(.03,.03,.5,WOOD,0,0,.2);const r=new THREE.Mesh(new THREE.TorusGeometry(.14,.012,4,12),mat(0xd8d0b0));r.position.z=.55;g.add(r)}
  else if(kind==='rod'){B(.025,.025,1,WOOD,0,0,.4)}
  else if(kind==='shield'){const d=new THREE.Mesh(new THREE.CylinderGeometry(.26,.26,.05,10),mat(c));d.rotation.z=Math.PI/2;d.castShadow=true;g.add(d);B(.06,.06,.06,0x777777,.03,0,0)}
  g.traverse(m=>{if(m.isMesh)m.raycast=()=>{}});return g}
 const wkind=id=>!id?null:/pickaxe/.test(id)?'pick':/axe/.test(id)?'axe':/staff|wand/.test(id)?'staff':/bow/.test(id)?'bow':/dagger/.test(id)?'dagger':/mace|hammer|maul/.test(id)?'mace':'sword';
 const P=()=>G.player,L=()=>Pl.g&&Pl.g.userData&&Pl.g.userData.L;let gk='',gear=[],wk=null,swT=-1e9,blkT=-1e9,eqT=-1e9;
 const inv=re=>{const it=(P().inv||[]).find(x=>x&&re.test(x.id));return it&&it.id};
 function tool(){const s=P().skill;if(!s)return null;const o=(G.objs||[])[s.o]||{},d=(G.defs&&G.defs.objs&&G.defs.objs[o.type])||{};
  if(d.kind==='tree')return ['axe',inv(/_axe$/)||'bronze_axe'];if(d.kind==='rock')return ['pick',inv(/pickaxe/)||'bronze_pickaxe'];if(d.kind==='fish')return [/rod/.test(d.tool||'')?'rod':'net','net'];return null}
 function sync(now){const l=L();if(!l||!l.handR)return;const eq=P().equip||{};const t=P().combat==null?tool():null;let id=eq.weapon||'',k=wkind(id);if(t){[k,id]=t}
  const key=k+id+'|'+(eq.shield||'')+(t?'':'');if(key===gk)return;if(gk)eqT=now;gk=key;for(const m of gear)m.parent&&m.parent.remove(m);gear=[];wk=k;
  if(k){const m=mesh(k,metC(id));m.position.set(0,-.06,0);m.rotation.x=-.25;l.handR.add(m);gear.push(m)}
  if(eq.shield&&!t&&l.handL){const m=mesh('shield',metC(eq.shield));m.position.set(-.07,-.05,.02);l.handL.add(m);gear.push(m)}}
 // foot grounding: drop each rig's inner pivot so its lowest point sits on y=0 (once per model)
 const bb=new THREE.Box3();function ground(g){if(!g||g.userData.__gnd)return;g.userData.__gnd=1;const c=g.children.find(x=>x.isGroup||x.type==='Object3D');if(!c)return;g.updateMatrixWorld(true);bb.setFromObject(c);if(!isFinite(bb.min.y))return;const f=bb.min.y-g.position.y;if(Math.abs(f)>.02&&Math.abs(f)<.5)c.position.y-=f}
 const nAnim=new Map();
 const prev=window.__B3fx;window.__B3fx=evs=>{try{if(prev)prev(evs)}finally{const now=performance.now();for(const e of evs){if(e.t!=='hit')continue;if(e.by==='player'){swT=now;const n=npcs.find(x=>x.gi===e.npc);if(n)nAnim.set(n,{f:now})}else{const n=npcs.find(x=>x.gi===e.by);if(n)nAnim.set(n,Object.assign(nAnim.get(n)||{},{a:now}));if(P().equip&&P().equip.shield)blkT=now;else nAnim.set(Pl,{f:now})}}}};
 const arm=l=>l.sR||l.aR,armL=l=>l.sL||l.aL;
 function pose(now){const l=L();if(!l)return;const R_=arm(l),Lf=armL(l);
  // idle/walk stance: hold weapon slightly forward
  if(wk&&R_&&now-swT>600){R_.rotation.x+=-.25;if(wk==='staff')R_.rotation.x+=-.2}
  const at=now-swT;if(at<560&&R_){const p=at/560,wu=p<.3?p/.3:1,st=p<.3?0:Math.sin((p-.3)/.7*Math.PI);
   if(wk==='staff'){R_.rotation.x=-1.5*Math.min(1,p*3);if(Lf)Lf.rotation.x=-1.3*Math.min(1,p*3)}
   else if(wk==='dagger'){R_.rotation.x=-1.2*wu-.3*st;Pl.g.position.addScaledVector(dir(Pl.g),.22*st)}
   else if(wk==='axe'||wk==='pick'||wk==='mace'){R_.rotation.x=-2.9*wu+2.6*st}
   else if(wk==='bow'){R_.rotation.x=-1.5;if(Lf)Lf.rotation.x=-1.5}
   else if(wk){R_.rotation.x=-2.6*wu+2.4*st;R_.rotation.z=-.5*st}
   else{R_.rotation.x=-2*Math.sin(p*Math.PI)}
   if(l.chest)l.chest.rotation.y=p<.3?-.25*wu:.3*st;if(wk!=='dagger')Pl.g.position.addScaledVector(dir(Pl.g),.15*st)}
  const bt=now-blkT;if(bt<450&&Lf)Lf.rotation.x=-1.2*Math.sin(Math.min(1,bt/450)*Math.PI);
  const et=now-eqT;if(et<400&&R_)R_.rotation.x+=-1.2*Math.sin(et/400*Math.PI)}
 const dv=new THREE.Vector3();const dir=g=>dv.set(Math.sin(g.rotation.y),0,Math.cos(g.rotation.y));
 function npcFx(now){for(const [n,s] of nAnim){if(!n.g){nAnim.delete(n);continue}let any=false;
  if(s.a!=null){const t=now-s.a;if(t<420){any=true;const k=Math.sin(t/420*Math.PI);n.g.position.addScaledVector(dir(n.g),.3*k);const l=n.g.userData.L;if(l){const r=arm(l);if(r)r.rotation.x=-1.8*k;if(l.head)l.head.rotation.x=.3*k}}}
  if(s.f!=null){const t=now-s.f;if(t<260){any=true;const k=Math.sin(t/260*Math.PI);n.g.position.addScaledVector(dir(n.g),-.1*k);n.g.rotation.z=.08*k}else n.g.rotation.z=0}
  if(!any&&(s.a==null||now-s.a>420)&&(s.f==null||now-s.f>260))nAnim.delete(n)}}
 function loop(now){try{ground(Pl.g);for(const n of npcs)ground(n.g);sync(now);pose(now);npcFx(now)}catch(e){console.warn('wield',e)}requestAnimationFrame(loop)}
 requestAnimationFrame(loop);
 return {state:()=>({gk,wk,gear:gear.length})}}
