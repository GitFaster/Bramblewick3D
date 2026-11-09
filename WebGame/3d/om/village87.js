import * as THREE from '../assets/three.module.min.js?v=14';
export function mountVillage87(a){
 const root=new THREE.Group();root.name='Briarhaven story interactions v87';a.scene.add(root);
 const materials=new Map(),m=c=>{if(!materials.has(c))materials.set(c,new THREE.MeshStandardMaterial({color:c,roughness:.85}));return materials.get(c)};
 const box=new THREE.BoxGeometry(1,1,1),sphere=new THREE.SphereGeometry(1,8,6),cylinder=new THREE.CylinderGeometry(.5,.5,1,8),gem=new THREE.OctahedronGeometry(1);
 function mesh(group,geo,color,x,y,z,sx,sy,sz){const o=new THREE.Mesh(geo,m(color));o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=o.receiveShadow=true;group.add(o);return o}
 const objects=[];
 function object(name,x,z,use){const p=a.accessible(x,z);if(!p)return null;const o={kind:'village87',name,x:p.x,z:p.z,w:1,l:1,use,last:-Infinity},group=new THREE.Group();group.position.set(o.x+.5,a.height(o.x+.5,o.z+.5),o.z+.5);o.group=group;root.add(group);objects.push(o);return o}
 const dummy=object('Village practice dummy',89,101,()=>practice());
 if(dummy){mesh(dummy.group,cylinder,0x776142,0,.8,0,.15,1.6,.15);mesh(dummy.group,box,0x9d815b,0,.95,0,.9,.16,.16);mesh(dummy.group,sphere,0xc8ab70,0,1.6,0,.32,.36,.28);mesh(dummy.group,cylinder,0xb9a17c,0,1.05,0,.55,.65,.5);mesh(dummy.group,box,0x57704c,0,1.07,.27,.18,.4,.03)}
 const bench=object('Village bench',95,108,()=>sit('sit'));
 if(bench){mesh(bench.group,box,0x936d48,0,.45,0,1.7,.13,.6);mesh(bench.group,box,0x936d48,0,.84,-.25,1.7,.7,.12);for(const x of [-.65,.65])mesh(bench.group,box,0x5c5547,x,.23,0,.12,.46,.42)}
 const inn=object('Rest at the Moonberry Inn',a.inn.x,a.inn.z,()=>sit('rest'));
 if(inn){mesh(inn.group,cylinder,0x4d6a48,0,.15,0,.38,.3,.38);for(let k=0;k<5;k++)mesh(inn.group,sphere,0xd8ac94,Math.cos(k*2.4)*.14,.37,Math.sin(k*2.4)*.14,.08,.09,.08)}
 const foragers=[];
 for(const [index,p]of a.vegetation.slice(0,8).entries()){
  const kind=index%2?'meadow_flowers':'moonberries';const o=object(kind==='moonberries'?'Moonberry bush':'Meadow flowers',p.x,p.z,()=>forage(kind,o));if(!o)continue;o.forage=kind;foragers.push(o);
  for(let k=0;k<7;k++){const angle=k*2.399,x=Math.cos(angle)*.24,z=Math.sin(angle)*.24;mesh(o.group,sphere,0x557a4f,x,.22,z,.22,.18,.20);mesh(o.group,sphere,kind==='moonberries'?0x6473aa:0xdc9fc4,x,.37+(k%2)*.07,z,.07,.065,.07)}
 }
 const markers=a.landmarks.map((p,i)=>{const o=object('Trail Light '+(i+1),p.x,p.z,()=>{a.content.discover(i)});if(!o)return null;mesh(o.group,cylinder,0x8f8d8b,0,.24,0,.44,.48,.44);const glow=mesh(o.group,gem,0x8cddd5,0,.67,0,.15,.23,.15);o.glow=glow;o.index=i;return o});
 for(const o of objects){o.group.traverse(mesh=>{if(mesh.isMesh)mesh.userData.obj=o});a.pickables.push(o.group)}
 const dist=o=>Math.max(Math.abs(a.me.x-o.x),Math.abs(a.me.z-o.z));
 function nearby(o){if(!o||dist(o)>2){a.notify('Move closer to '+(o?.name||'the village activity')+'.');if(o)a.show(o.x,o.z,o.name);return false}return true}
 function forage(kind,specific=null){const o=specific||foragers.filter(o=>o.forage===kind).sort((p,q)=>dist(p)-dist(q))[0];if(!nearby(o))return false;const now=performance.now();if(now-o.last<1400){a.notify('Give the leaves a moment to settle.');return false}o.last=now;a.stop();a.swing();a.give(kind,1);a.content.event('gather:'+kind);a.notify(kind==='moonberries'?'You gather a handful of moonberries.':'You pick a small bunch of meadow flowers.');a.save();return true}
 function practice(){if(!nearby(dummy))return false;const now=performance.now();if(now-dummy.last<700)return false;dummy.last=now;a.stop();a.swing();const damage=a.practiceDamage();a.notify('Practice strike · '+damage+' damage · no sparks or loot');dummy.group.rotation.z=.10;a.practiceFeedback(dummy.x+.5,dummy.z+.5,damage);return true}
 let resting=null;
 function sit(kind){const o=kind==='sit'?bench:inn;if(!nearby(o))return false;a.stop();resting={kind,x:a.me.x,z:a.me.z,time:performance.now()};a.notify(kind==='sit'?'The village feels calm today. Move to stand up.':'You pause to rest at the inn. Move when you are ready.');return true}
 return{objects,forage,practice,sit,nearest(){return objects.filter(o=>dist(o)<=2).sort((p,q)=>dist(p)-dist(q))[0]},action(kind){return kind==='practice'?practice():sit(kind)},update(now){if(dummy)dummy.group.rotation.z*=.8;for(const marker of markers){if(!marker)continue;const lit=!!a.content.state.stories.lanterns?.unique?.['place:'+marker.index];marker.glow.material=m(lit?0xffd286:0x8cddd5);marker.glow.rotation.y=now*.0004}if(resting){const me=a.me;if(me.act||me.path.length||me.x!==resting.x||me.z!==resting.z||a.inCombat()){resting=null;return}const L=me.r.L;if(L){if(resting.kind==='sit'){if(L.hL)L.hL.rotation.x=-1.25;if(L.hR)L.hR.rotation.x=-1.25;if(L.kL)L.kL.rotation.x=1.35;if(L.kR)L.kR.rotation.x=1.35;me.r.g.position.y-=.28}else{if(L.chest)L.chest.rotation.x=.035+Math.sin(now*.0018)*.015;if(L.head)L.head.rotation.x=.12}}}}};
}
