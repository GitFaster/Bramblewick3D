// Briarhaven v85: lightweight, raycast-inert ornamental scenery.
// No changes to collision, navigation, world data, saving, or multiplayer.
import * as THREE from '../assets/three.module.min.js?v=14';
export function addBriarhaven85(scene,heightAt,walkable){
 const root=new THREE.Group();root.name='Briarhaven v85 lantern promenade';scene.add(root);
 const detail=new THREE.Group();root.add(detail);
 const mat=(c,o={})=>new THREE.MeshStandardMaterial({color:c,roughness:.79,metalness:.04,...o});
 const paving=[mat(0xc9b5c7),mat(0xa9a2bd),mat(0xd4c0c6),mat(0xb9aac8)];
 const brass=mat(0xd9aa5b,{metalness:.55,roughness:.31}),dark=mat(0x59436e,{metalness:.2}),rose=mat(0xd78ebc),light=mat(0xffdf9f,{emissive:0xffaa55,emissiveIntensity:1.45});
 const square=new THREE.BoxGeometry(1,1,1),sphere=new THREE.IcosahedronGeometry(1,0),oct=new THREE.OctahedronGeometry(1,0);
 const add=(parent,g,m,x,y,z,sx=1,sy=1,sz=1)=>{const a=new THREE.Mesh(g,m);a.position.set(x,y,z);a.scale.set(sx,sy,sz);a.raycast=()=>{};parent.add(a);return a};
 const cx=86,cz=109,hash=i=>{const v=Math.sin(i*78.233+17.17)*43758.5453;return v-Math.floor(v)};
 // Decorative stone radial mosaic: small, low-height tiles atop existing traversable ground.
 // Skip center fountain and place no blocks: entirely visual and raycast-inert.
 const tileGeo=new THREE.BoxGeometry(1,.024,1),tileMesh=new THREE.InstancedMesh(tileGeo,mat(0xffffff),288);
 const dummy=new THREE.Object3D(),color=new THREE.Color();let tileCount=0;
 for(let ring=0;ring<4;ring++){const rad=4.3+ring*1.15,segments=ring===0?48:ring===1?56:ring===2?72:88;
  for(let j=0;j<segments&&tileCount<288;j++){
   const a=(j+.5*(ring%2))/segments*Math.PI*2,x=cx+Math.cos(a)*rad,z=cz+Math.sin(a)*rad;
   if(!walkable(Math.floor(x),Math.floor(z)))continue;
   dummy.position.set(x,heightAt(x,z)+.038,z);dummy.rotation.set(0,-a,0);
   dummy.scale.set(.44,.75,ring===3?.17:.24);dummy.updateMatrix();tileMesh.setMatrixAt(tileCount,dummy.matrix);
   color.setHex([0xdbc8d4,0xaab1c9,0xc9b5d8,0xb8a3ba][(j+ring)%4]);tileMesh.setColorAt(tileCount,color);tileCount++;
  }
 }
 tileMesh.count=tileCount;tileMesh.instanceMatrix.needsUpdate=true;if(tileMesh.instanceColor)tileMesh.instanceColor.needsUpdate=true;tileMesh.raycast=()=>{};detail.add(tileMesh);
 // Eight evenly spaced lanterns; deliberately outside the central fountain and main axial paths.
 const posts=[];
 for(let k=0;k<8;k++){
  const a=(k+.5)*Math.PI/4,r=9.9,x=cx+Math.cos(a)*r,z=cz+Math.sin(a)*r;
  if(!walkable(Math.floor(x),Math.floor(z)))continue;
  const p=new THREE.Group();p.position.set(x,heightAt(x,z),z);detail.add(p);
  add(p,square,dark,0,.12,0,.46,.23,.46);
  add(p,square,brass,0,1.18,0,.11,2.18,.11);
  add(p,square,dark,0,2.28,0,.34,.14,.34);
  const lamp=add(p,oct,light,0,2.52,0,.24,.34,.24);
  add(p,square,brass,0,2.82,0,.45,.12,.45);
  add(p,sphere,brass,0,2.99,0,.13,.17,.13);
  posts.push(lamp);
 }
 // Flowering planters along the entrance quadrants, each a single lightweight cluster.
 const planters=[];
 for(const [x,z] of [[79,101],[93,101],[79,117],[93,117]]){
  if(!walkable(Math.floor(x),Math.floor(z)))continue;
  const p=new THREE.Group();p.position.set(x,heightAt(x,z),z);detail.add(p);
  add(p,square,dark,0,.22,0,1.2,.34,.6);add(p,square,brass,0,.42,0,1.26,.06,.65);
  for(let i=0;i<7;i++){
   const fx=(i-3)*.15,fz=(hash(i+x+z)-.5)*.38;
   add(p,sphere,i%3===0?rose:paving[i%4],fx,.56+hash(i*2+x)*.23,fz,.16,.15,.16);
  }
  planters.push(p);
 }
 // Drifting cherry petals: one instanced mesh and no per-petal allocations each frame.
 const petals=new THREE.InstancedMesh(new THREE.PlaneGeometry(.16,.1),new THREE.MeshBasicMaterial({color:0xffc3e4,side:THREE.DoubleSide,transparent:true,opacity:.8,depthWrite:false}),72);
 const seeds=[];for(let i=0;i<72;i++)seeds.push([hash(i+3),hash(i+91),hash(i+307),hash(i+509)]);
 petals.raycast=()=>{};petals.visible=false;detail.add(petals);
 root.traverse(o=>{if(o.isMesh)o.raycast=()=>{}});
 let lastBucket=-1;
 function update(now,highQuality,prefs={}){detail.visible=!!highQuality&&prefs.festival!==false;light.emissiveIntensity=prefs.lanterns===false?0:1.45;if(!highQuality)return;
  // Slow, stepped simulation avoids repeated matrix uploads when tabs are throttled.
  const bucket=Math.floor(now/40);if(bucket===lastBucket)return;lastBucket=bucket;
  const t=matchMedia('(prefers-reduced-motion: reduce)').matches?0:now*.001;
  if(petals.visible)for(let i=0;i<seeds.length;i++){
   const [u,v,w,q]=seeds[i],x=71+u*30+Math.sin(t*.48+i)*.9,z=94+v*30+Math.cos(t*.3+i)*.8;
   const base=heightAt(x,z),y=base+1+((w*4-t*(.14+q*.11))%4+4)%4;
   dummy.position.set(x,y,z);dummy.rotation.set(.5+t*.23+i,t*.46+i*.4,t*.3+i);
   const s=.65+q*.8;dummy.scale.set(s,s,s);dummy.updateMatrix();petals.setMatrixAt(i,dummy.matrix);
  }
  petals.instanceMatrix.needsUpdate=true;
  for(let i=0;i<posts.length;i++)posts[i].scale.setScalar(1+Math.sin(t*1.8+i*2.5)*.065);
 }
 return {update,stats:{mosaicTiles:tileCount,lanterns:posts.length,flowerPlanters:planters.length,animatedPetals:72}};
}
