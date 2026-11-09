// Original Briarhaven architectural detail. Geometry remains in existing streamed batches.
import * as THREE from '../assets/three.module.min.js?v=14';
import {emitScenery as baseScenery,makeBriarAtlas,addBriarGarden} from './scenery80.js?v=80';
export {makeBriarAtlas,addBriarGarden};
const shapes={sphere:new THREE.SphereGeometry(.5,12,10).toNonIndexed(),box:new THREE.BoxGeometry(1,1,1).toNonIndexed(),round:new THREE.CylinderGeometry(.5,.5,1,14).toNonIndexed(),cone:new THREE.ConeGeometry(.5,1,16).toNonIndexed(),gem:new THREE.OctahedronGeometry(.5).toNonIndexed(),ring:new THREE.TorusGeometry(.5,.06,6,20).toNonIndexed()};
const v=new THREE.Vector3(),n=new THREE.Vector3(),c=new THREE.Color(),mx=new THREE.Matrix4(),nm=new THREE.Matrix3(),q=new THREE.Quaternion(),axis=new THREE.Vector3(0,1,0);
export function emitScenery(acc,p,d,size,heightAt,roof=false){let count=d.art==='hearttree'?0:baseScenery(acc,p,d,size,heightAt,roof);if(!['cottage','hearttree'].includes(d.art))return count;
 const cx=p[3]+d.w/2,cz=size-p[4]-d.l/2,y=heightAt(cx,cz),face=Math.abs(cx-86)>Math.abs(cz-109)?(cx<86?-Math.PI/2:Math.PI/2):(cz<109?Math.PI:0),quarter=Math.abs(face)===Math.PI/2,w=quarter?d.l:d.w,l=quarter?d.w:d.l,fc=Math.cos(face),fs=Math.sin(face);
 const roofCol=new THREE.Color(d.colour||0x6775ac),wood=0x61494d,gold=0xe2bc72,stone=0xa6a29b;
 function put(shape,x,h,z,sx,sy,sz,tint,rx=0,ry=0,rz=0){const g=shapes[shape],a=g.attributes.position,b=g.attributes.normal;q.setFromEuler(new THREE.Euler(rx,ry,rz));q.premultiply(new THREE.Quaternion().setFromAxisAngle(axis,face));mx.compose(new THREE.Vector3(cx+x*fc+z*fs,y+h,cz-x*fs+z*fc),q,new THREE.Vector3(sx,sy,sz));nm.getNormalMatrix(mx);c.setHex(tint);for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(mx);n.fromBufferAttribute(b,i).applyNormalMatrix(nm);const light=.87+.13*Math.max(0,n.y);acc.v(v.x,v.y,v.z,c.r*light,c.g*light,c.b*light,0,0,-1)}count+=a.count/3;}
 if(d.art==='hearttree'){
 put('round',0,1.9,0,.8,3.8,.8,0x70505e);put('round',0,.1,0,2.8,.2,2.8,0xa49bad);
 for(let k=0;k<7;k++){const a=k*2.399,dx=Math.cos(a),dz=Math.sin(a),h=3.5+(k%3)*.32;put('round',dx*.45,2.8,dz*.45,.25,2,.25,0x70505e,.35*dz,0,-.35*dx);put('sphere',dx*.9,h,dz*.9,2.05,1.65,2.05,[0xb671a0,0xd795b8,0xd3a4cd][k%3]);put('gem',dx*.8,2.1,dz*.8,.1,.23,.1,0xffd9a2)}put('sphere',0,4.2,0,2.1,1.8,2.1,0xe0b2d1);return count;
 }
 // Stone footing and staggered brick joints; stay inside the original footprint.
 for(let row=0;row<2;row++){for(let col=0;col<Math.floor(w/.52);col++){const x=-w*.43+col*.52+(row%2)*.19;if(x>w*.43)continue;for(const side of [-1,1])put('box',x,.13+row*.22,side*l*.458,.48,.19,.12,col%3===0?0xbbb8ad:stone)}for(let col=0;col<Math.floor(l/.53);col++){const z=-l*.42+col*.53;for(const side of [-1,1])put('box',side*w*.463,.13+row*.22,z,.12,.19,.48,col%3===0?0xbbb8ad:stone)}}
 // Individual overlapping shingles follow the same curved roof profile as the cottage.
 for(const side of [-1,1])for(let row=0;row<8;row++){const t=(row+.5)/8,x=side*w*(.62*t-.06*t*t),h=2.55+3*(.62-1.1*t+.48*t*t),slope=3*(-1.1+.96*t)/(w*(.62-.12*t));const angle=side*Math.atan(slope),width=w*.078/Math.cos(angle);for(let col=0;col<Math.ceil(l*1.1/.46);col++){const z=-l*.55+.23+col*.46,shade=.84+((col*7+row*3)%5)*.045,tint=roofCol.clone().multiplyScalar(shade).getHex();put('box',x,h+.07,z,width,.095,.44,tint,0,0,angle)}}
 if(d.n==='The Starlit Nook'){
 // The existing hall gains a keep and twin spires within its blocked footprint.
 for(const side of [-1,1]){put('round',side*w*.28,4.8,l*.2,1.4,5.2,1.4,0xc6c1bf);put('round',side*w*.28,6.9,l*.2,1.65,.26,1.65,wood);put('cone',side*w*.28,8.1,l*.2,2.05,2.3,2.05,0x514578);put('gem',side*w*.28,9.45,l*.2,.23,.55,.23,gold);for(const h of [4.5,5.7,6.4])put('box',side*w*.28,h,l*.2-.72,.25,.55,.04,0xffd797)}put('round',0,5.5,0,2,5.3,2,0xd3cbbf);put('cone',0,8.65,0,2.8,2.5,2.8,0x483d75);put('gem',0,10.2,0,.3,.65,.3,0x8ce6ed);
 }
 // Raised gold ridge and ornamental end caps.
 put('round',0,4.48,0,.16,l*1.16,.16,gold,Math.PI/2);for(const side of [-1,1]){put('gem',0,4.51,side*l*.59,.28,.48,.28,gold);put('box',side*w*.46,2.48,0,.14,.16,l*.92,wood)}
 // A small corner spire gives each inn and hall a stronger fantasy silhouette.
 const tx=w*.28,tz=l*.24;put('round',tx,3.96,tz,1.13,1.5,1.13,0xe5d5bb);put('round',tx,4.55,tz,1.25,.16,1.25,wood);put('cone',tx,5.35,tz,1.7,1.7,1.7,roofCol.clone().multiplyScalar(.86).getHex());put('gem',tx,6.28,tz,.19,.48,.19,gold);put('box',tx,4.05,tz-.57,.3,.55,.05,0xffd27c);put('box',tx,4.05,tz-.61,.04,.54,.02,wood);
 // Timber braces and hanging pennants, rather than blank walls.
 for(const side of [-1,1]){put('box',side*w*.33,2.07,-l*.46,.12,1.02,.15,wood,0,0,-side*.68);put('box',side*w*.37,1.84,l*.48,.62,.97,.075,roofCol.getHex());put('box',side*w*.37,2.4,l*.51,.82,.07,.11,gold);put('gem',side*w*.37,1.8,l*.53,.22,.32,.045,gold)}
 return count;
}
