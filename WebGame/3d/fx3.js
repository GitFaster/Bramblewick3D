// Batch 3 visual interactivity: 3D hitsplats, tap highlight, tree fall/respawn, rock deplete, fishing ripples. Pure visuals: never touches saves.
export function initFx({THREE}){
 const B=window.B3,G=B.G,S=B.S,M=B.M,hAt=B.hAt;const now=()=>performance.now();
 const css=document.createElement('style');css.textContent='.splat{display:none!important}';document.head.appendChild(css);
 // ---- 3D hitsplats (sprites, depthTest off so always readable, rise + fade)
 const tex={};function stex(v,kind){const k=kind+v;if(tex[k])return tex[k];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');
  x.fillStyle=kind==='m'?'#2a5ad0':v>0?'#c01818':'#2a6ad8';x.strokeStyle='#000';x.lineWidth=4;x.beginPath();
  if(v>0){for(let i=0;i<10;i++){const a=i*Math.PI/5,r=i%2?22:29;x.lineTo(32+Math.cos(a)*r,32+Math.sin(a)*r)}}else x.arc(32,32,24,0,7);x.closePath();x.fill();x.stroke();
  x.fillStyle='#fff';x.font='bold 30px sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=5;x.strokeText(String(v),32,34);x.fillText(String(v),32,34);
  const t=new THREE.CanvasTexture(c);return tex[k]=t}
 const live=[];function splat(g,v,kind){if(!g)return;const m=new THREE.SpriteMaterial({map:stex(v,kind),depthTest:false,transparent:true});const s=new THREE.Sprite(m);s.renderOrder=999;s.scale.set(.75,.75,1);
  const n=live.filter(q=>q.g===g&&now()-q.t0<500).length;s.userData={g,t0:now(),ox:(n%2?.35:-.1)*(n?1:0),oy:1.9+n*.35};S.add(s);live.push({s,g,t0:now()})}
 function entOf(i){const e=B.npcs[i];if(e&&e.gi===i)return e;return B.npcs.find(q=>q.gi===i)||e}
 const prev=window.__B3fx;let busy=0;
 window.__B3fx=evs=>{if(prev)prev(evs);if(busy)return;busy=1;try{for(const e of evs){if(e.t!=='hit')continue;
   if(e.by==='player'){const en=entOf(e.npc);en&&splat(en.g,e.dmg|0,e.magic?'m':'')}else splat(B.Pl.g,e.dmg|0,'')}}catch(err){}busy=0};
 // ---- tap highlight: gold ring that pulses on the tapped target's tile
 const ring=new THREE.Mesh(new THREE.TorusGeometry(.45,.04,6,28),new THREE.MeshBasicMaterial({color:0xffd84a,transparent:true,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.visible=false;S.add(ring);let rT=0,rTarget=null;
 const cv=document.querySelector('canvas');cv&&cv.addEventListener('pointerup',()=>setTimeout(()=>{const a=B.Pl.act;if(!a)return;const t=a.kind==='npc'?a.n:a.o;if(!t)return;rTarget=a.kind==='npc'?(B.npcs.find(q=>q.d===t||q===t)||null):null;rT=now();ring.userData.x=t.x+.5;ring.userData.z=t.y+.5;ring.visible=true},60));
 // ---- objects: tree fall/respawn, rock deplete, fishing ripples
 const gi={};G.objs.forEach(o=>gi[o.x+','+o.y+','+o.type]=o);
 const TR=new Set(['tree','oak','willow','yew','magic']),RK=new Set(['copper','tin','iron','coal','gold','gemrock','glim']);
 const items=M.objs.filter(o=>o.grp&&(TR.has(o.type)||RK.has(o.type))).map(o=>({o,r:gi[o.x+','+o.y+','+o.type],was:0}));
 // game3d owns depletion/restoration of merged geometry. Never snapshot or
 // rewrite those ranges here: afterTick may already have hidden them at -999.
 function deplete(it){const tree=TR.has(it.o.type);
  if(tree){const c=new THREE.Group();const gq=it.o.grp;gq.updateMatrixWorld(true);const inv=gq.matrixWorld.clone().invert();gq.traverse(m=>{if(!m.isMesh)return;const k=new THREE.Mesh(m.geometry,m.material);k.castShadow=true;k.matrixAutoUpdate=false;k.matrix.multiplyMatrices(inv,m.matrixWorld);c.add(k)});const piv=new THREE.Group();piv.position.copy(it.o.grp.position);c.position.set(0,0,0);piv.add(c);S.add(piv);const ang=Math.atan2(it.o.grp.position.x-B.Pl.g.position.x,it.o.grp.position.z-B.Pl.g.position.z);piv.rotation.y=ang;fall.push({piv,c,t0:now()})}}
 function restore(it){/* The gameplay bridge restores its original vertex ranges. */}
 const fall=[];
 const rip=[];M.objs.filter(o=>/fishing/.test(o.type)).forEach(o=>{for(let k=0;k<2;k++){const m=new THREE.Mesh(new THREE.RingGeometry(.2,.26,24),new THREE.MeshBasicMaterial({color:0xdff4ff,transparent:true,depthWrite:false,side:THREE.DoubleSide}));m.rotation.x=-Math.PI/2;m.position.set(o.x+.5,hAt(o.x+.5,o.y+.5)+.06,o.y+.5);m.userData.ph=k*.5+((o.x*7+o.y)%10)/10;S.add(m);rip.push(m)}});
 let last=now();
 function loop(){requestAnimationFrame(loop);const t=now(),dt=Math.min(.1,(t-last)/1000);last=t;
  try{
  for(let i=live.length-1;i>=0;i--){const q=live[i],a=(t-q.t0)/1000;const p=q.g.position;q.s.position.set(p.x+q.s.userData.ox,p.y+q.s.userData.oy+a*.5,p.z);q.s.material.opacity=a<.8?1:Math.max(0,1-(a-.8)/.4);if(a>1.2){S.remove(q.s);q.s.material.dispose();live.splice(i,1)}}
  if(ring.visible){const a=(t-rT)/1000;const tg=rTarget&&rTarget.g;const x=tg?tg.position.x:ring.userData.x,z=tg?tg.position.z:ring.userData.z;ring.position.set(x,hAt(x,z)+.07,z);const s=1+.15*Math.sin(a*12);ring.scale.set(s,s,s);ring.material.opacity=Math.max(0,1-a/.9);if(a>.9)ring.visible=false}
  for(const it of items){if(!it.r)continue;const d=it.r.dep?1:0;if(d!==it.was){it.was=d;d?deplete(it):restore(it)}}
  for(let i=fall.length-1;i>=0;i--){const f=fall[i],a=(t-f.t0)/1000;f.piv.children[0].rotation.x=Math.min(Math.PI/2,a*a*3.2);f.piv.children[0].position.y=a>1.4?-(a-1.4)*1.5:0;if(a>2.4){S.remove(f.piv);fall.splice(i,1)}}
  for(const m of rip){const ph=((t/1600)+m.userData.ph)%1;const s=.6+ph*2.2;m.scale.set(s,s,s);m.material.opacity=.55*(1-ph)}
  }catch(e){window.__B3fx3err=String(e&&e.stack||e).slice(0,300)}}
 loop();
 return {state:()=>({splats:live.length,items:items.length,mapped:items.filter(i=>i.r).length,dep:items.filter(i=>i.was).length,ripples:rip.length,fall:fall.length})}
}
