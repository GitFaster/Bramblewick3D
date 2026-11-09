import * as THREE from '../assets/three.module.min.js?v=14';
import {emitScenery as oldScenery} from './scenery79.js?v=79';
const roofShape=new THREE.Shape();roofShape.moveTo(-.56,0);roofShape.quadraticCurveTo(-.31,.07,0,.62);roofShape.quadraticCurveTo(.31,.07,.56,0);roofShape.lineTo(.48,-.08);roofShape.quadraticCurveTo(.22,.03,0,.48);roofShape.quadraticCurveTo(-.22,.03,-.48,-.08);roofShape.closePath();
const shapes={box:new THREE.BoxGeometry(1,1,1).toNonIndexed(),round:new THREE.CylinderGeometry(.5,.55,1,12).toNonIndexed(),sphere:new THREE.SphereGeometry(.5,12,8).toNonIndexed(),gem:new THREE.OctahedronGeometry(.5).toNonIndexed(),cone:new THREE.ConeGeometry(.5,1,10).toNonIndexed(),roof:new THREE.ExtrudeGeometry(roofShape,{depth:1,bevelEnabled:false,steps:1,curveSegments:5}).translate(0,0,-.5).toNonIndexed(),cap:new THREE.LatheGeometry([new THREE.Vector2(.6,0),new THREE.Vector2(.72,.08),new THREE.Vector2(.69,.2),new THREE.Vector2(.56,.42),new THREE.Vector2(.3,.64),new THREE.Vector2(.03,.75)],14).toNonIndexed()};
const c=new THREE.Color(),v=new THREE.Vector3(),n=new THREE.Vector3(),matrix=new THREE.Matrix4(),normal=new THREE.Matrix3(),quaternion=new THREE.Quaternion();
export function emitScenery(acc,p,d,size,heightAt,roof=false){if(!d.art||!['cottage','hearttree','well','mushroom','shrine','sign','oven','chest'].includes(d.art))return oldScenery(acc,p,d,size,heightAt,roof);const ow=d.w||1,ol=d.l||1,cx=p[3]+ow/2,cz=size-p[4]-ol/2,y=heightAt(cx,cz),face=d.art==='cottage'?(Math.abs(cx-86)>Math.abs(cz-109)?(cx<86?-Math.PI/2:Math.PI/2):(cz<109?Math.PI:0)):0,quarter=Math.abs(face)===Math.PI/2,w=quarter?ol:ow,l=quarter?ow:ol,fc=Math.cos(face),fs=Math.sin(face);let count=0;
function put(shape,pos,scale,tint,rot=[0,0,0]){const g=shapes[shape],a=g.attributes.position,ns=g.attributes.normal;quaternion.setFromEuler(new THREE.Euler(...rot));quaternion.premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),face));matrix.compose(new THREE.Vector3(cx+pos[0]*fc+pos[2]*fs,y+pos[1],cz-pos[0]*fs+pos[2]*fc),quaternion,new THREE.Vector3(...scale));normal.getNormalMatrix(matrix);c.setHex(tint);for(let i=0;i<a.count;i++){v.fromBufferAttribute(a,i).applyMatrix4(matrix);n.fromBufferAttribute(ns,i).applyNormalMatrix(normal);const light=.82+.18*Math.max(0,n.y*.8-n.x*.4+n.z*.2);acc.v(v.x,v.y,v.z,c.r*light,c.g*light,c.b*light,0,0,-1)}count+=a.count/3}
const cream=0xf4ddbb,wood=0x745371,gold=0xffcf87,window=0xffe9ab,col=d.colour||0x8f83c7;
if(d.art==='cottage'){
 put('box',[0,1.3,0],[w*.9,2.6,l*.88],cream);put('box',[0,.23,0],[w*.98,.46,l*.96],0xb7a6be);
 for(const x of [-w*.42,w*.42])put('box',[x,1.5,-l*.45],[.23,3,.18],wood);
 for(const h of [.75,2.48])put('box',[0,h,-l*.45],[w*.91,.14,.16],wood);
 for(const z of [-l*.44,l*.44])for(const x of [-w*.42,w*.42])put('box',[x,1.46,z],[.2,2.92,.2],wood);
 for(const h of [.72,2.45])put('box',[0,h,l*.45],[w*.91,.13,.15],wood);
 for(const x of [-w*.26,w*.26]){put('round',[x,1.62,l*.47],[1.05,.16,1.05],wood,[Math.PI/2,0,0]);put('round',[x,1.62,l*.57],[.84,.07,.84],window,[Math.PI/2,0,0]);put('box',[x,1.62,l*.63],[.065,.76,.045],wood);put('box',[x,1.62,l*.63],[.76,.065,.045],wood);put('box',[x,1.02,l*.58],[1.23,.23,.36],col);for(const q of [-.36,0,.36])put('sphere',[x+q,1.22,l*.62],[.25,.25,.25],q?0xb39dd2:0xe6b3ca)}
 for(const side of [-1,1]){put('round',[side*w*.47,1.55,0],[1,.16,1],wood,[0,0,Math.PI/2]);put('round',[side*w*.57,1.55,0],[.8,.06,.8],window,[0,0,Math.PI/2]);put('box',[side*w*.61,1.55,0],[.04,.7,.07],wood);for(const k of [-.6,.6])put('box',[side*w*.47,1.55,k],[.12,1,.25],col)}
 put('roof',[0,2.55,0],[w,3,l*1.1],col);put('box',[0,4.25,0],[.15,.15,l*1.12],gold);
 put('box',[w*.3,3.7,l*.15],[.55,2,.65],cream);put('box',[w*.3,4.78,l*.15],[.8,.22,.85],col);
 put('round',[0,.94,-l*.46],[1.1,1.9,.18],wood,[Math.PI/2,0,0]);put('box',[0,.62,-l*.47],[.9,1.24,.15],0x9d6d8f);put('sphere',[.25,.7,-l*.57],[.12,.12,.08],gold);
 for(const x of [-w*.27,w*.27]){put('round',[x,1.67,-l*.47],[.95,.16,.95],wood,[Math.PI/2,0,0]);put('round',[x,1.67,-l*.57],[.75,.06,.75],window,[Math.PI/2,0,0]);put('box',[x,1.67,-l*.62],[.07,.7,.04],wood);put('box',[x,1.67,-l*.62],[.7,.07,.04],wood);put('box',[x,1.08,-l*.65],[1.25,.25,.4],col);for(const q of [-.4,0,.4])put('sphere',[x+q,1.3,-l*.65],[.3,.3,.3],q?0xe68db5:0x94be9a)}
 for(const x of [-.86,.86]){put('box',[x,.9,-l*.65],[.1,1.8,.1],wood);put('gem',[x,1.7,-l*.72],[.35,.5,.3],window)}
 put('roof',[0,1.96,-l*.75],[2.5,.85,1.2],col);put('box',[0,2.12,-l* .83],[1.9,.42,.16],0xddd0e8);put('gem',[0,2.14,-l*.94],[.24,.26,.1],gold);
}else if(d.art==='hearttree'){
 put('round',[0,2,0],[1.2,4,1.1],wood);for(let k=0;k<5;k++){const a=k*1.256;put('sphere',[Math.cos(a)*1.15,4.2+(k%2)*.5,Math.sin(a)*1.15],[2.9,2.5,2.9],[0xd98dc0,0xf3b0d2,0xb599d6][k%3]);put('gem',[Math.cos(a)*1.3,2.9,Math.sin(a)*1.3],[.25,.4,.25],0xffebae)}put('round',[0,.13,0],[3.5,.26,3.5],0xd0bdd5);
}else if(d.art==='well'){
 put('round',[0,.25,0],[2.1,.5,2.1],0xc5b8dc);put('round',[0,.54,0],[1.65,.1,1.65],0x72c9d5);put('gem',[0,1.18,0],[.75,1.2,.75],0xc8a5f3);for(let k=0;k<6;k++){const a=k*Math.PI/3;put('sphere',[Math.cos(a)*.9,.7,Math.sin(a)*.9],[.2,.2,.2],gold)}
}else if(d.art==='mushroom'){
 put('round',[0,.5,0],[.4,1,.4],cream);put('cap',[0,.9,0],[1.4,1.4,1.4],(p[3]%2)?0xd49dd4:0x8dcad7);for(let k=0;k<3;k++)put('sphere',[(k-1)*.25,1.5,.35],[.18,.08,.12],0xffecdb);
}else if(d.art==='shrine'){
 put('round',[0,.15,0],[1.8,.3,1.8],0xcbb6dc);put('gem',[0,1,0],[.8,1.4,.8],0xb4d7f0);put('cap',[0,1.6,0],[1.5,1,1.5],0x9e88cb);
}else if(d.art==='sign'){
 put('round',[0,.65,0],[.14,1.3,.14],wood);put('box',[0,1.27,0],[1.1,.65,.16],0xc5a7d6);put('gem',[0,1.27,-.12],[.3,.35,.08],gold);
}else if(d.art==='chest'){
 put('box',[0,.4,0],[1,.8,.7],0x8d73bd);put('round',[0,.84,0],[1,.65,.7],0xb69edc,[0,0,Math.PI/2]);put('box',[0,.48,-.39],[.15,.26,.06],gold);
}else if(d.art==='oven'){
 put('sphere',[0,.65,0],[1.6,1.3,1.5],cream);put('box',[0,.38,-.65],[.7,.6,.1],0x684954);put('sphere',[0,.32,-.72],[.4,.3,.08],0xffb278);put('round',[.3,1.5,.2],[.4,1.5,.4],col);
}return count;}
export function makeBriarAtlas(){const c=document.createElement('canvas');c.width=1024;c.height=512;const x=c.getContext('2d');for(let k=0;k<128;k++){const a=k%16*64,b=Math.floor(k/16)*64;x.fillStyle=k===1?'#74c6d6':'#d2c9d4';x.fillRect(a,b,64,64);x.strokeStyle=k===1?'#b5edf1':'#e1d8e3';for(let j=0;j<5;j++){x.beginPath();x.moveTo(a+j*13,b);x.quadraticCurveTo(a+j*13+8,b+32,a+j*13,b+64);x.stroke()}}return c}
export function addBriarGarden(scene,world,heightAt,walkable){
 const root=new THREE.Group();root.name='Briarhaven gardens and soft light';scene.add(root);
 const shadow=document.createElement('canvas');shadow.width=shadow.height=64;const sx=shadow.getContext('2d'),gradient=sx.createRadialGradient(32,32,4,32,32,32);gradient.addColorStop(0,'rgba(54,39,77,.27)');gradient.addColorStop(.55,'rgba(54,39,77,.16)');gradient.addColorStop(1,'rgba(54,39,77,0)');sx.fillStyle=gradient;sx.fillRect(0,0,64,64);
 const shadeMaterial=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(shadow),transparent:true,depthWrite:false}),shadeGeo=new THREE.PlaneGeometry(1,1);
 for(const p of world.P){const d=world.loc[p[0]];if(!d||!['cottage','hearttree'].includes(d.art))continue;const x=p[3]+d.w/2,z=192-p[4]-d.l/2,m=new THREE.Mesh(shadeGeo,shadeMaterial);m.rotation.x=-Math.PI/2;m.position.set(x,heightAt(x,z)+.018,z);m.scale.set(d.w+3,d.l+3,1);m.raycast=()=>{};root.add(m)}
 const count=220,stems=new THREE.InstancedMesh(new THREE.CylinderGeometry(.017,.025,.24,4),new THREE.MeshLambertMaterial({color:0x75a797}),count),petals=new THREE.InstancedMesh(new THREE.SphereGeometry(.13,6,4),new THREE.MeshLambertMaterial({color:0xffffff}),count),dummy=new THREE.Object3D(),color=new THREE.Color();let n=0;
 for(let k=0;k<1800&&n<count;k++){const x=64+((Math.sin(k*127.1)*43758.54)%1+1)%1*45,z=88+((Math.sin(k*311.7)*16713.11)%1+1)%1*49,r=Math.hypot(x-86,z-109);if(!walkable(Math.floor(x),Math.floor(z))||r<10.5||Math.abs(r-13)<1.6||Math.abs(x-86)<2.2||Math.abs(z-109)<2.2)continue;dummy.position.set(x,heightAt(x,z)+.12,z);dummy.scale.set(1,1,1);dummy.updateMatrix();stems.setMatrixAt(n,dummy.matrix);dummy.position.y+=.18;dummy.scale.set(1.25,.65,1.25);dummy.updateMatrix();petals.setMatrixAt(n,dummy.matrix);petals.setColorAt(n,color.setHex([0xe4a7cc,0xf2d8a1,0xa6cadf,0xd0b3ed][n%4]));n++}
 stems.count=petals.count=n;root.add(stems,petals);stems.raycast=petals.raycast=()=>{};
 const positions=[];for(let k=0;k<45;k++){const a=k*2.399,r=5+(k%15);positions.push(Math.cos(a)*r,1+(k%9)*.35,Math.sin(a)*r)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));const motes=new THREE.Points(geo,new THREE.PointsMaterial({color:0xffe7b0,size:.07,transparent:true,opacity:.65,depthWrite:false}));motes.position.set(86,heightAt(86,109),109);motes.raycast=()=>{};root.add(motes);
 return{flowers:n,update(now){motes.rotation.y=now*.000015;motes.position.y=heightAt(86,109)+Math.sin(now*.0005)*.16}};
}
