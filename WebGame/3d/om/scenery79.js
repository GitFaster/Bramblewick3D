// Original Bramblewick scenery. All meshes are generated from our own primitives;
// location metadata supplies footprints and orientation, never imported model vertices.
import * as THREE from '../assets/three.module.min.js?v=14';
const primitive={box:new THREE.BoxGeometry(1,1,1).toNonIndexed(),cylinder:new THREE.CylinderGeometry(.5,.5,1,8).toNonIndexed(),cone:new THREE.ConeGeometry(.5,1,6).toNonIndexed(),gem:new THREE.OctahedronGeometry(.5).toNonIndexed()};
const color=new THREE.Color();
export function emitScenery(acc,p,d,size,heightAt,roof=false){
 const [id,type,rotation,x,y]=p,w=Math.max(1,d.w||1),l=Math.max(1,d.l||1),rw=rotation&1?l:w,rl=rotation&1?w:l,cx=x+rw/2,cz=size-y-rl/2,base=heightAt(cx,cz)+(roof?1.95:0),yaw=-rotation*Math.PI/2,cos=Math.cos(yaw),sin=Math.sin(yaw),name=(d.n||'').toLowerCase();let triangles=0;
 function put(kind,pos,scale,tint,turn=0){const g=primitive[kind],a=g.attributes.position,n=g.attributes.normal,c=Math.cos(turn),s=Math.sin(turn);color.setHex(tint);for(let i=0;i<a.count;i++){const px=a.getX(i)*scale[0],py=a.getY(i)*scale[1],pz=a.getZ(i)*scale[2],lx=px*c+pz*s+pos[0],lz=-px*s+pz*c+pos[2],nx=n.getX(i)*cos+n.getZ(i)*sin,nz=-n.getX(i)*sin+n.getZ(i)*cos,light=.73+.27*Math.max(0,n.getY(i)*.85-nx*.35+nz*.2);acc.v(cx+lx*cos+lz*sin,base+py+pos[1],cz-lx*sin+lz*cos,color.r*light,color.g*light,color.b*light,0,0,-1)}triangles+=a.count/3}
 const stone=0xc2bda9,darkStone=0x53677d,wood=0x704631,edge=0xa77b43,roofBlue=0x35688f;
 function wall(turn=0){put('box',[-w/2,1.16,0],[.22,2.32,l],stone,turn);put('box',[-w/2,2.3,0],[.3,.13,l+.12],roofBlue,turn);put('box',[-w/2,.15,0],[.34,.3,l+.08],darkStone,turn);put('box',[-w/2,1.12,0],[.25,.1,l],darkStone,turn)}
 if(roof){put('box',[0,.15,0],[w,.22,l],roofBlue);put('box',[0,.29,-l*.18],[w*.96,.16,l*.58],(id%2)?0x42789b:0x335e89);return triangles}
 if(/door|gate/.test(name)){const fence=/gate/.test(name);put('box',[-w/2,1.05,0],[.15,fence?1.3:2.1,l*.9],wood);for(const z of [-l*.4,l*.4])put('box',[-w/2,1.05,z],[.24,2.3,.13],edge);put('box',[-w/2-.09,1.05,l*.24],[.08,.1,.1],edge);return triangles}
 if(type===0||type===2){wall();if(type===2){put('box',[0,1.16,-l/2],[w,2.32,.22],stone);put('box',[0,2.3,-l/2],[w+.12,.13,.3],roofBlue)}return triangles}
 if(type===1||type===3){put('box',[-w/2,1.16,-l/2],[.35,2.32,.35],stone);put('cone',[-w/2,2.5,-l/2],[.55,.45,.55],roofBlue);return triangles}
 if(type>=4&&type<=8){if(/banner|tapestry|portrait/.test(name)){put('box',[-w*.45,1.45,0],[.08,1.1,.6],0x5865a6);put('box',[-w*.45,2.02,0],[.13,.12,.8],edge)}else{put('box',[-w*.45,1.6,0],[.24,.38,.3],edge);put('gem',[-w*.48,1.68,0],[.18,.3,.2],0xffdf8c)}return triangles}
 if(/fence|railing/.test(name)||type===9){for(const z of [-.4,.4])put('box',[0,.65,z],[.12,1.3,.12],wood);for(const h of [.4,.9])put('box',[0,h,0],[.1,.12,1],edge);return triangles}
 if(/fountain/.test(name)){put('cylinder',[0,.22,0],[w*.9,.44,l*.9],darkStone);put('cylinder',[0,.47,0],[w*.76,.12,l*.76],0x4fa6b9);put('cylinder',[0,1,0],[.3,1.1,.3],stone);put('cylinder',[0,1.55,0],[w*.55,.25,l*.55],stone);put('gem',[0,2.08,0],[.65,1.1,.65],0x92e8f0);return triangles}
 if(/statue|suit of armour/.test(name)){put('box',[0,.2,0],[.8,.4,.8],darkStone);put('box',[0,.9,0],[.48,1,.3],stone);put('gem',[0,1.58,0],[.4,.5,.4],edge);put('box',[.35,1,0],[.14,.8,.14],edge);return triangles}
 if(/bank booth|counter|stall/.test(name)){put('box',[0,.55,0],[w*.95,1.1,l*.8],wood);put('box',[0,1.17,0],[w*1.05,.16,l*.95],edge);for(const q of [-1,1])put('box',[q*w*.4,1.55,.28],[.12,1.4,.12],wood);put('box',[0,2.1,.05],[w*1.1,.25,l],roofBlue);return triangles}
 if(/rocks|rock|boulder/.test(name)){put('gem',[0,.55,0],[w*.9,1.1,l*.9],/tin|copper/.test(name)?0xa57555:darkStone);put('gem',[.25,.7,.15],[.4,.6,.4],0xa7d2d4);return triangles}
 if(/barrel|cask/.test(name)){put('cylinder',[0,.52,0],[w*.65,1.05,l*.65],wood);for(const h of [.15,.8])put('cylinder',[0,h,0],[w*.68,.12,l*.68],edge);return triangles}
 if(/crate|chest|box/.test(name)){put('box',[0,.4,0],[w*.8,.8,l*.8],wood);put('box',[0,.84,0],[w*.86,.12,l*.86],edge);put('box',[0,.45,-l*.42],[.16,.2,.1],edge);return triangles}
 if(/table|dais|altar|range/.test(name)){put('box',[0,.85,0],[w*.9,.2,l*.85],/altar/.test(name)?stone:wood);for(const q of [-1,1])put('box',[q*w*.3,.38,0],[.16,.76,l*.5],darkStone);if(/altar/.test(name))put('gem',[0,1.3,0],[.4,.7,.4],0x8cbaf4);return triangles}
 if(/chair|stool|throne|bench/.test(name)){put('box',[0,.5,0],[w*.7,.14,l*.65],wood);for(const q of [-1,1])put('box',[q*w*.25,.25,0],[.12,.5,l*.5],wood);if(!/stool/.test(name))put('box',[0,1,.26],[w*.72,1,.14],/throne/.test(name)?0x8652a2:roofBlue);return triangles}
 if(/ladder|stair/.test(name)){for(const q of [-1,1])put('box',[q*.32,1.15,0],[.1,2.3,.1],wood);for(let k=0;k<7;k++)put('box',[0,.2+k*.3,0],[.7,.08,.12],edge);return triangles}
 if(type===22){if(/flower|fern|plant|grass/.test(name)){put('cone',[0,.25,0],[.35,.5,.35],0x4c9b6a);if(/flower/.test(name))put('gem',[0,.5,0],[.2,.2,.2],(id%2)?0xe9b66b:0xa79adb)}return triangles}
 if(/sign|notice/.test(name)){put('box',[0,.7,0],[.14,1.4,.14],wood);put('box',[0,1.3,0],[.8,.6,.12],edge);return triangles}
 if(!name){put('box',[0,.06,0],[w*.95,.12,l*.95],darkStone);return triangles}
 put('box',[0,.28,0],[w*.65,.56,l*.65],wood);put('box',[0,.6,0],[w*.7,.08,l*.7],edge);return triangles;
}
