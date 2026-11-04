// ui.js v1 — auto-attack target lock + mobile layout (safe-area, 44px targets). UI prefs in 'b3d.ui.v1' only; never touches the game save.
export function initUI({THREE,G,R,DEF,Pl,npcs,msg}){
 const UK='b3d.ui.v1';let U={};try{U=JSON.parse(localStorage.getItem(UK)||'{}')||{}}catch(e){}const us=()=>{try{localStorage.setItem(UK,JSON.stringify(U))}catch(e){}};if(U.auto==null)U.auto=true;
 const P=()=>G.player;
 // ---------- layout
 const st=document.createElement('style');st.id='b3ui';st.textContent=`
 :root{--st:env(safe-area-inset-top,0px);--sb:env(safe-area-inset-bottom,0px);--sL:env(safe-area-inset-left,0px);--sR:env(safe-area-inset-right,0px)}
 #area{top:calc(6px + var(--st))!important;left:calc(8px + var(--sL))!important}
 #to2d{top:calc(36px + var(--st))!important;left:calc(8px + var(--sL))!important;font-size:11px!important;padding:3px 7px!important;min-height:0!important}
 #bwnet{top:calc(36px + var(--st))!important;left:calc(82px + var(--sL))!important;max-width:128px!important;font-size:11px!important;height:22px!important;padding:0 8px!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
 #trk{top:calc(64px + var(--st))!important;left:calc(8px + var(--sL))!important;width:188px!important;max-width:48vw!important;font-size:11.5px!important;padding:5px 7px!important;max-height:34vh!important;overflow:auto!important}
 #trk .r{padding:1px 0!important;line-height:1.25!important}
 #mm{top:calc(6px + var(--st))!important;right:calc(6px + var(--sR))!important}
 #orbs{top:calc(116px + var(--st))!important;right:calc(6px + var(--sR))!important;left:auto!important;display:flex!important;flex-direction:row!important;gap:6px!important;width:auto!important;height:auto!important}
 #orbs .orb{position:static!important;margin:0!important}
 #bwStar{top:calc(168px + var(--st))!important;right:calc(6px + var(--sR))!important;min-height:44px!important}
 #chat{bottom:calc(6px + var(--sb))!important;left:calc(6px + var(--sL))!important;max-width:calc(100vw - 180px - var(--sL) - var(--sR))!important}
 #gtabs{bottom:calc(6px + var(--sb))!important;right:calc(58px + var(--sR))!important}
 #invb{bottom:calc(6px + var(--sb))!important;right:calc(6px + var(--sR))!important}
 #bwjoy{bottom:calc(62px + var(--sb))!important;left:calc(14px + var(--sL))!important;top:auto!important}
 #bwact{bottom:calc(64px + var(--sb))!important;right:calc(6px + var(--sR))!important;top:auto!important}
 #bwhelpb{bottom:calc(136px + var(--sb))!important;right:calc(14px + var(--sR))!important;top:auto!important}
 #b3auto{position:fixed;z-index:20;bottom:calc(72px + var(--sb));right:calc(78px + var(--sR));width:52px;height:48px;border-radius:12px;border:2px solid #6b5a3a;background:#3a3020e6;color:#ccc;font:bold 12px sans-serif;line-height:1.05}\n    #b3eat{position:fixed;z-index:20;bottom:calc(72px + var(--sb));right:calc(136px + var(--sR));width:52px;height:48px;border-radius:12px;border:2px solid #6b5a3a;background:#3a3020e6;color:#ccc;font:bold 12px sans-serif;line-height:1.05}\n    #b3eat.ready{background:#315c2be6;color:#d7ff9a;border-color:#78a84c}
 #b3auto.on{background:#7a2a1ae6;color:#ffd84a;border-color:#c08a3a}
 #bwqBtn{left:calc(8px + var(--sL))!important}
 #b2btn{left:calc(8px + var(--sL))!important;bottom:auto!important;top:calc(var(--b2t,526px))!important}
 .hud button,.bwcb,#invb,#gtabs>*{min-width:44px;min-height:44px}
 @media (orientation:landscape){
  #trk{max-height:46vh!important;width:200px!important}
  #bwjoy{bottom:calc(16px + var(--sb))!important;left:calc(16px + var(--sL))!important}
  #chat{left:calc(150px + var(--sL))!important;max-width:calc(100vw - 420px)!important}
  #bwact{bottom:calc(60px + var(--sb))!important}
  #b3auto{bottom:calc(68px + var(--sb))}\n    #b3eat{bottom:calc(68px + var(--sb))}
  #bwhelpb{bottom:calc(130px + var(--sb))!important}
  #orbs{top:calc(6px + var(--st))!important;right:calc(116px + var(--sR))!important;flex-direction:column!important}
  #bwStar{top:calc(116px + var(--st))!important}
  #b2btn{top:auto!important;bottom:calc(136px + var(--sb))!important;left:auto!important;right:calc(78px + var(--sR))!important}
 }`;document.head.appendChild(st);
 const place=()=>{const q=document.getElementById('bwqBtn'),s=[...document.querySelectorAll('body>button')].find(b=>b.textContent.trim()==='🔊');let t=q?q.getBoundingClientRect().bottom:0;if(s)t=Math.max(t,s.getBoundingClientRect().bottom);if(t)document.documentElement.style.setProperty('--b2t',(t+8)+'px')};
 // tracker: full on first view, collapsed by default afterwards
 // tracker: docked chip top-left, collapsed by default on phones; tap header to expand
 {const ph=Math.min(innerWidth,innerHeight)<600;if(U.trkOpen===undefined)U.trkOpen=!ph;
  const ts=document.createElement('style');ts.textContent='#trk.b3c .r{display:none!important}#trk.b3c{width:auto!important;max-width:60vw!important;padding:4px 9px!important;border-radius:14px!important}#trk.b3c .th{gap:8px}#trk .th{cursor:pointer;min-height:28px;display:flex;align-items:center;justify-content:space-between;gap:6px}@media (orientation:landscape) and (max-height:600px){#trk:not(.b3c){max-height:40vh!important}}';document.head.appendChild(ts);
  const ap=()=>{const t=document.getElementById('trk');if(t)t.classList.toggle('b3c',!U.trkOpen);const sp=t&&t.querySelector('.th span:last-child');if(sp&&!U.trkOpen)sp.textContent=sp.textContent.replace('▾','▸')};
  document.addEventListener('click',e=>{const th=e.target.closest&&e.target.closest('#trk .th');if(!th)return;e.stopPropagation();e.preventDefault();U.trkOpen=!U.trkOpen;us();ap()},true);
  setInterval(ap,500);ap();setTimeout(()=>{U.trkSeen=1;us();place()},1500)}
 addEventListener('resize',()=>setTimeout(place,200));
 // orbs + Extras: stack under the measured minimap (works with any safe-area/notch)
 const imp=(e,k,v)=>e&&e.style.setProperty(k,v,'important');
 function stack(){const mm=document.getElementById('mm'),ob=document.getElementById('orbs'),ex=document.getElementById('bwStar');if(!mm||!ob)return;const r=mm.getBoundingClientRect(),land=innerWidth>innerHeight;
  if(land){imp(ob,'top',r.top+'px');imp(ob,'right',(innerWidth-r.left+6)+'px');imp(ob,'flex-direction','column');if(ex){imp(ex,'top',(r.bottom+8)+'px');imp(ex,'right',(innerWidth-r.right)+'px')}}
  else{imp(ob,'top',(r.bottom+6)+'px');imp(ob,'right',(innerWidth-r.right)+'px');imp(ob,'flex-direction','row');if(ex){const b=ob.getBoundingClientRect();imp(ex,'top',(b.bottom+8)+'px');imp(ex,'right',(innerWidth-r.right)+'px')}}}
 setInterval(stack,1000);addEventListener('resize',()=>setTimeout(stack,100));setTimeout(stack,500);setTimeout(place,3000);
 // ---------- auto-attack target lock
 const d=k=>DEF.npcs[k]||{};const fighter=n=>{const x=d(n.kind);return !n.dead&&(x.ops||[]).includes('Attack')&&(x.hp||0)>0};
 const dist=n=>Math.max(Math.abs(n.x-P().x),Math.abs(n.y-P().y));
 function nearest(max){let b=null,bs=1e9;for(const n of G.npcs){if(!fighter(n))continue;const k=dist(n);if(k>max)continue;const s=k-(n.target===true?20:0);if(s<bs){bs=s;b=n}}return b}
 let lock=null,ret=0;const go=n=>{if(!n)return false;R.attack(G,n.id);lock=n.id;return true};
 const ab=document.createElement('button');ab.id='b3auto';ab.className='hud';document.body.appendChild(ab);const abu=()=>{ab.classList.toggle('on',!!U.auto);ab.innerHTML='AUTO<br>'+(U.auto?'ON':'OFF')};abu();
 const eat=document.createElement('button');eat.id='b3eat';eat.className='hud';document.body.appendChild(eat);\n    const bestFood=()=>{let best=-1,heal=0;for(let i=0;i<P().inv.length;i++){const it=P().inv[i],d=it&&DEF.items[it.id];if(d&&d.eat&&d.eat>heal){best=i;heal=d.eat}}return best};\n    const updateEat=()=>{const ready=bestFood()>=0&&P().hp<R.maxHp(G);eat.classList.toggle('ready',ready);eat.innerHTML='EAT<br>'+(ready?'READY':'—')};updateEat();\n    const stopP=e=>e.stopPropagation();for(const ev of ['pointerdown','touchstart','mousedown']){ab.addEventListener(ev,stopP);eat.addEventListener(ev,stopP)}\n    eat.onclick=e=>{e.stopPropagation();const i=bestFood();if(i<0){msg('No food in your inventory.','r');return}if(P().hp>=R.maxHp(G)){msg('You are already at full health.','y');return}R.eat(G,i);updateEat();msg('You eat some food.','y')};
 ab.onclick=e=>{e.stopPropagation();U.auto=!U.auto;us();abu();msg('Auto-attack '+(U.auto?'on':'off'),'y');if(!U.auto)lock=null};
 const hand=()=>document.getElementById('bwact');let hb=null;
 const onHand=e=>{const n=nearest(8);if(n){e.stopImmediatePropagation();e.preventDefault();go(n);msg(`Attacking ${d(n.kind).name||n.kind}.`,'y')}};
 const hookHand=()=>{const h=hand();if(h&&h!==hb){hb=h;h.addEventListener('click',onHand,true);h.addEventListener('pointerup',ev=>{},true)}};
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.55,.05,6,24),new THREE.MeshBasicMaterial({color:0xff3a2a,transparent:true,opacity:.9,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.raycast=()=>{};ring.renderOrder=3;ring.visible=false;Pl.g.parent.add(ring);
 function loop(now){try{hookHand();const P_=P();updateEat();
  if(P_.combat!=null)lock=P_.combat;
  else if(lock!=null){const n=G.npcs[lock];if(n&&n.dead&&U.auto&&now>ret){ret=now+300;const m=nearest(10);if(!go(m))lock=null}else if(!n||!n.dead||!U.auto)lock=null}
  const e=lock!=null&&npcs.find(x=>x.gi===lock);if(e&&e.g&&!G.npcs[lock].dead){ring.visible=true;ring.position.copy(e.g.position);ring.position.y+=.06;ring.rotation.z=now/600;ring.scale.setScalar(1+.06*Math.sin(now/150))}else ring.visible=false}catch(e){console.warn('ui',e)}requestAnimationFrame(loop)}
 requestAnimationFrame(loop);
 return {state:()=>({auto:U.auto,lock,ring:ring.visible})}}
