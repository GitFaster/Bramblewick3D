import * as THREE from '../assets/three.module.min.js?v=14';
import {emitScenery as previous,makeBriarAtlas,addBriarGarden} from './scenery81.js?v=81';
export {makeBriarAtlas,addBriarGarden};
const shapes={roof:new THREE.ConeGeometry(.7,1,4).rotateY(Math.PI/4).toNonIndexed(),box:new THREE.BoxGeometry(1,1,1).toNonIndexed(),round:new THREE.CylinderGeometry(.5,.5,1,16).toNonIndexed(),gem:new THREE.OctahedronGeometry(.5).toNonIndexed()},v=new THREE.Vector3(),n=new THREE.Vector3(),c=new THREE.Color(),mx=new THREE.Matrix4(),q=new THREE.Quaternion();
export function emitScenery(acc,p,d,size,heightAt,roof=false){if(d.art==='blossom'||d.art==='hearttree')return emitBlossom(acc,p,d,size,heightAt);let count=previous(acc,p,d,size,heightAt,roof);if(!['cottage','ore'].includes(d.art))return count;const cx=p[3]+d.w/2,cz=size-p[4]-d.l/2,y=heightAt(cx,cz),face=Math.abs(cx-86)>Math.abs(cz-109)?(cx<86?-Math.PI/2:Math.PI/2):(cz<109?Math.PI:0),quarter=Math.abs(face)===Math.PI/2,w=quarter?d.l:d.w,l=quarter?d.w:d.l,fc=Math.cos(face),fs=Math.sin(face);
 function put(shape,x,h,z,sx,sy,sz,tint,rx=0,rz=0,emissive=false){const g=shapes[shape],a=g.attributes.position;q.setFromEuler(new THREE.Euler(rx,face,rz,'YXZ'));mx.compose(new THREE.Vector3(cx+x*fc+z*fs,y+h,cz-x*fs+z*fc),q,new THREE.Vector3(sx,sy,sz));c.setHex(tint);for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(mx);acc.v(v.x,v.y,v.z,c.r,c.g,c.b,0,0,emissive?-5:-1)}count+=a.count/3}
 if(d.art==='ore'){for(let k=0;k<4;k++){const a=k*2.399,x=Math.cos(a)*.23,z=Math.sin(a)*.23;put('gem',x,.5+(k%2)*.16,z,.25,.45,.25,/Copper/.test(d.n)?0xe0a45d:0x98d5e0)}return count;}
 // A tall timber dormer breaks up each roof and presents warm glass to the camera.
 const dx=-w*.24;put('box',dx,3.55,0,1.28,1.12,1.25,0xd5bf9b);put('roof',dx,4.34,0,1.55,1.05,1.55,0x6431a2);for(const side of [-1,1]){put('box',dx,3.62,side*.65,.63,.72,.045,0xffc56f,0,0,true);put('box',dx,3.62,side*.68,.08,.8,.08,0x694258);put('box',dx,3.62,side*.68,.78,.08,.08,0x694258)}for(const side of [-1,1])put('box',dx+side*.61,3.55,0,.12,1.12,1.28,0x694258);
 if(d.n==='The Starlit Nook'){for(let k=0;k<4;k++)put('box',0,.12+k*.12,-l*.43+k*.20,3.4-k*.25,.24,.45,0xb7b1c7);put('box',0,3.7,-l*.44,3.2,1.8,.4,0xc4bfd1);for(const side of [-1,1]){put('box',side*1.25,2,-l*.46,.24,3.8,.32,0x756079);put('box',side*1.18,3.85,-l*.68,.58,1.3,.08,0x8245b5);put('gem',side*1.18,3.8,-l*.73,.25,.35,.04,0xe8c779)}}
 // Warm glass and mullions sit on the existing window openings.
 for(const side of [-1,1])for(const front of [-1,1]){const x=side*w*.27,z=front*l*.633;put('round',x,1.67,z,.70,.045,.70,0xffc56f,Math.PI/2,0,true);put('box',x,1.67,z+front*.035,.065,.72,.055,0x68435b);put('box',x,1.67,z+front*.035,.72,.065,.055,0x68435b)}
 // Each village business gains a striped canopy and a small merchant counter.
 const stripes=8;for(let k=0;k<stripes;k++){const x=-1.25+(k+.5)*2.5/stripes;put('box',x,2.12,-l*.59,2.5/stripes,.09,1.25,k%2?0xf0d6e9:0x8f48bb,.15);put('box',x,1.95,-l*.695,2.5/stripes,.30,.07,k%2?0xf0d6e9:0x8f48bb)}for(const side of [-1,1])put('box',side*1.2,1.06,-l*.43,.10,2.12,.10,0x6e4960);put('box',0,.58,-l*.43,2.25,.15,.5,0x8f6270);put('box',0,.29,-l*.43,2,.44,.36,0x5b4255);
 return count;
}

// Irregular blossom sprays replace the large spherical crowns in existing chunk batches.
// All trees retain their authored placement and original interaction/collision data.
const blossomShapes={branch:new THREE.CylinderGeometry(.12,.21,1,7).toNonIndexed(),cluster:new THREE.IcosahedronGeometry(1,1).toNonIndexed(),petal:new THREE.OctahedronGeometry(1).toNonIndexed()};
function emitBlossom(acc,p,d,size,heightAt){
 const cx=p[3]+d.w/2,cz=size-p[4]-d.l/2,y=heightAt(cx,cz);
 const nearTown=Math.hypot(cx-86,cz-109)<32,heart=d.art==='hearttree',scale=heart?1.35:1;
 const seed=Math.sin(cx*13.7+cz*3.1)*43758.54,variation=seed-Math.floor(seed);
 let count=0;
 function put(shape,x,h,z,sx,sy,sz,tint,rx=0,ry=0,rz=0){
  const a=blossomShapes[shape].attributes.position;
  q.setFromEuler(new THREE.Euler(rx,ry,rz));
  mx.compose(new THREE.Vector3(cx+x*scale,y+h*scale,cz+z*scale),q,new THREE.Vector3(sx*scale,sy*scale,sz*scale));
  c.setHex(tint);
  for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(mx);acc.v(v.x,v.y,v.z,c.r,c.g,c.b,0,0,-1)}
  count+=a.count/3;
 }
 put('branch',0,1.35,0,1.5,2.7,1.5,0x76505b,0,0,-.1);
 for(let k=0;k<6;k++){
  const a=k*2.399+variation,dx=Math.cos(a),dz=Math.sin(a),h=2.9+(k%3)*.26;
  put('branch',dx*.44,2.25,dz*.44,.65,1.7,.65,0x805462,dz*.55,0,-dx*.55);
  put('cluster',dx*.84,h,dz*.84,1.0,.62,.94,[0xc779a5,0xdf94bc,0xf2b1d2][k%3],0,a,0);
  // Keep distant trees simple; blossom sprays add no separate draw calls.
  if(nearTown)for(let j=0;j<7;j++){
   const b=j*2.399+k,r=.25+(j%3)*.19;
   put('cluster',dx*.84+Math.cos(b)*r,h+.32+(j%2)*.12,dz*.84+Math.sin(b)*r,.38,.22,.33,[0xf7c4dc,0xf3a6d0,0xe58fbd][j%3],.15,b,.1);
   put('petal',dx*.84+Math.cos(b)*r,h+.51,dz*.84+Math.sin(b)*r,.16,.045,.10,0xffdae9,0,b,0);
  }
 }
 return count;
}
