// Briarhaven v84: optional, decorative geometry layered into the actual playable 3D scene.
// Existing collision, world placements, combat, save state, and interactions are untouched.
import * as THREE from '../assets/three.module.min.js?v=14';

export function addBriarhaven84(scene,world,heightAt,walkable){
  const root=new THREE.Group();root.name='Briarhaven v84 crystal plaza and spring details';scene.add(root);
  const high=new THREE.Group();root.add(high);
  const M=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.74,metalness:.06,...extra});
  const gold=M(0xdcb76b,{metalness:.65,roughness:.3}),stone=M(0xb3aac6),trim=M(0x80649d),glass=M(0x7ef1fa,{emissive:0x137aaf,emissiveIntensity:.85,metalness:.15,roughness:.16,transparent:true,opacity:.9}),water=M(0x57d0ef,{emissive:0x16587f,emissiveIntensity:.35,metalness:.33,roughness:.16,transparent:true,opacity:.85}),pink=M(0xf2addd,{emissive:0x4a1736,emissiveIntensity:.15}),banner=M(0x7132a6,{side:THREE.DoubleSide});
  const g={cyl:new THREE.CylinderGeometry(1,1,1,24),ring:new THREE.TorusGeometry(1,.055,6,48),gem:new THREE.OctahedronGeometry(1,0),box:new THREE.BoxGeometry(1,1,1),orb:new THREE.IcosahedronGeometry(1,1),plane:new THREE.PlaneGeometry(1,1),cone:new THREE.ConeGeometry(1,1,8)};
  const at=(parent,geo,mat,x,y,z,sx=1,sy=1,sz=1)=>{const o=new THREE.Mesh(geo,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.raycast=()=>{};parent.add(o);return o};
  const ground=(x,z)=>heightAt(x,z);
  // The central landmark sits over the existing well rather than shifting the spawn or altering its geometry.
  const cx=86,cz=109,plaza=new THREE.Group();plaza.position.set(cx,ground(cx,cz),cz);root.add(plaza);
  at(plaza,g.cyl,stone,0,.10,0,2.15,.19,2.15);
  at(plaza,g.cyl,trim,0,.24,0,1.95,.13,1.95);
  at(plaza,g.cyl,water,0,.315,0,1.68,.025,1.68);
  for(let k=0;k<12;k++){const a=k*Math.PI/6,x=Math.cos(a)*1.85,z=Math.sin(a)*1.85;at(plaza,g.box,gold,x,.32,z,.22,.16,.36).rotation.y=-a}
  const crystal=at(plaza,g.gem,glass,0,3.3,0,.82,1.28,.82);
  const core=at(plaza,g.gem,new THREE.MeshBasicMaterial({color:0xdbffff,transparent:true,opacity:.52}),0,3.3,0,.28,.59,.28);
  const rings=[];for(let k=0;k<3;k++){const r=at(plaza,g.ring,gold,0,2.05,0,1.5+k*.21,1.5+k*.21,1);r.rotation.set(Math.PI/2+k*.48,0,k*.35);rings.push(r)}
  for(let k=0;k<8;k++){const a=k*Math.PI/4;const x=Math.cos(a)*1.48,z=Math.sin(a)*1.48;at(plaza,g.gem,glass,x,1.04,z,.11,.23,.11)}
  // Real, authored blossom-tree positions, not random objects across paths.
  const trees=[];for(const p of world.P){const d=world.loc[p[0]];if(d?.art==='blossom'){const x=p[3]+(d.w||1)/2,z=192-p[4]-(d.l||1)/2;if(x>55&&x<122&&z>75&&z<144)trees.push([x,z])}}
  const blossomGeo=new THREE.IcosahedronGeometry(.47,0),blossomMat=M(0xffffff,{roughness:1});
  const maxBlossoms=Math.min(650,trees.length*27),blossoms=new THREE.InstancedMesh(blossomGeo,blossomMat,Math.max(1,maxBlossoms));
  const dummy=new THREE.Object3D(),col=new THREE.Color();let bc=0;const hash=k=>{const v=Math.sin(k*127.1+72.23)*43758.5453;return v-Math.floor(v)};
  for(let t=0;t<trees.length&&bc<maxBlossoms;t++){const [x,z]=trees[t],y=ground(x,z);for(let k=0;k<27&&bc<maxBlossoms;k++){const a=k*2.399+t,rad=1.2+hash(k+t*17)*2.5;dummy.position.set(x+Math.cos(a)*rad,y+3.15+hash(k*11+t)*1.8,z+Math.sin(a)*rad);const s=.52+hash(k*19+t)*.62;dummy.scale.set(s,s*.63,s);dummy.rotation.set(0,a,0);dummy.updateMatrix();blossoms.setMatrixAt(bc,dummy.matrix);blossoms.setColorAt(bc,col.setHex([0xffd4ee,0xf3a4d5,0xeac2fa,0xffe9f6][(t+k)%4]));bc++}}
  blossoms.count=bc;blossoms.visible=false;blossoms.raycast=()=>{};high.add(blossoms);
  // Tile-side flower beds use walkable terrain only and avoid plaza's traversable centre.
  const flowerMat=M(0xffffff),flowerGeo=new THREE.IcosahedronGeometry(.16,0),flower=new THREE.InstancedMesh(flowerGeo,flowerMat,420);let fc=0;
  for(let i=0;i<3000&&fc<420;i++){const x=65+hash(i*13)*44,z=86+hash(i*31+9)*46,r=Math.hypot(x-cx,z-cz);if(r<10||Math.abs(r-13)<1.8||Math.abs(x-cx)<2.5||Math.abs(z-cz)<2.5||!walkable(x|0,z|0))continue;dummy.position.set(x,ground(x,z)+.22,z);dummy.scale.set(.65+hash(i)*.7,.6,.65+hash(i+2)*.7);dummy.rotation.set(0,0,0);dummy.updateMatrix();flower.setMatrixAt(fc,dummy.matrix);flower.setColorAt(fc,col.setHex([0xfc8aca,0xe8bbff,0xffe29a,0xb9d6ff][i%4]));fc++}
  flower.count=fc;flower.visible=false;flower.raycast=()=>{};high.add(flower);
  // Festive purple pennants by the broad plaza corners; purely visual, no physical posts.
  for(const [x,z] of [[74,98],[98,98],[74,120],[98,120]]){if(!walkable(x|0,z|0))continue;const post=new THREE.Group();post.position.set(x,ground(x,z),z);high.add(post);at(post,g.cyl,gold,0,1.75,0,.065,3.5,.065);at(post,g.gem,gold,0,3.6,0,.16,.28,.16);const cloth=at(post,g.plane,banner,.35,2.8,0,.63,1.35,1);cloth.rotation.y=Math.PI/5;at(post,g.gem,pink,.38,2.9,.016,.12,.15,.07)}
  // Inexpensive floating highlights around the fountain (no dynamic point lights).
  const motePos=[];for(let i=0;i<36;i++){const a=i*2.399,r=.7+hash(i)*3.2;motePos.push(Math.cos(a)*r,1.1+hash(i+12)*3.1,Math.sin(a)*r)}
  const moteGeo=new THREE.BufferGeometry();moteGeo.setAttribute('position',new THREE.Float32BufferAttribute(motePos,3));const motes=new THREE.Points(moteGeo,new THREE.PointsMaterial({color:0xb9faff,size:.09,transparent:true,opacity:.8,depthWrite:false}));motes.position.set(cx,ground(cx,cz),cz);motes.raycast=()=>{};high.add(motes);
  root.traverse(o=>{if(o.isMesh||o.isPoints)o.raycast=()=>{}});
  return {stats:{blossomClusters:bc,flowers:fc,decorativeTrees:trees.length,crystal:'animated'},update(now,highQuality,prefs={}){high.visible=highQuality&&prefs.festival!==false;const t=matchMedia('(prefers-reduced-motion: reduce)').matches?0:now*.001;crystal.rotation.y=t*.35;crystal.position.y=3.3+Math.sin(t*1.6)*.13;core.rotation.y=-t*.45;core.position.y=crystal.position.y;for(let i=0;i<rings.length;i++){rings[i].rotation.y=t*(i%2?.13:-.1)}motes.rotation.y=t*.08;motes.position.y=ground(cx,cz)+Math.sin(t)*.07}};
}
