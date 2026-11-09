import * as THREE from '../assets/three.module.min.js?v=14';
import {buildAdventurer as previous,tierPalette} from './fantasy82.js?v=82';
export {tierPalette};
const leather=new THREE.MeshStandardMaterial({color:0x79563c,roughness:.87}),band=new THREE.MeshStandardMaterial({color:0x53714c,roughness:.9}),gold=new THREE.MeshStandardMaterial({color:0xd8b96d,metalness:.35,roughness:.5}),feather=new THREE.MeshStandardMaterial({color:0xe5d6bd,roughness:.9,side:THREE.DoubleSide});
const brim=new THREE.CylinderGeometry(.24,.24,.025,20),crown=new THREE.CylinderGeometry(.10,.17,.20,16),ribbon=new THREE.TorusGeometry(.158,.017,5,24),clasp=new THREE.OctahedronGeometry(.035);
const leaf=new THREE.Shape();leaf.moveTo(0,0);leaf.quadraticCurveTo(.14,.11,.08,.26);leaf.quadraticCurveTo(-.02,.19,0,0);const leafGeo=new THREE.ShapeGeometry(leaf);
function add(p,g,m,x,y,z){const mesh=new THREE.Mesh(g,m);mesh.position.set(x,y,z);p.add(mesh);return mesh}
export function buildAdventurer(look={},equipment={}){
 const eq={...equipment},appearance={...look};
 if(eq.head==='explorer_cap')delete eq.head;
 if(eq.body==='explorer_tunic'){delete eq.body;appearance.shirt=0x536f45;appearance.sleeve=0xc3b591}
 if(eq.legs==='explorer_pants'){delete eq.legs;appearance.legs=0x6b4b36}
 if(eq.feet==='explorer_boots'){delete eq.feet;appearance.boots=0x59422f}
 if(eq.weapon==='explorer_blade')eq.weapon='steel_sword';
 const g=previous(appearance,eq),L=g.userData.L;if(!L)return g;
 if(equipment.head==='explorer_cap'){
  const hat=new THREE.Group();hat.rotation.z=-.10;L.head.add(hat);
  add(hat,brim,leather,0,.27,0).scale.z=.83;add(hat,crown,leather,-.018,.38,-.025);
  const b=add(hat,ribbon,band,0,.3,-.012);b.rotation.x=Math.PI/2;b.scale.z=.85;
  const plume=add(hat,leafGeo,feather,.12,.35,-.01);plume.rotation.z=-.35;
  add(hat,clasp,gold,.10,.31,.12);
 }
 if(equipment.body==='explorer_tunic')L.chest.traverse(o=>{if(o.isMesh&&Math.abs(o.position.x)>.20&&['OctahedronGeometry','IcosahedronGeometry'].includes(o.geometry.type))o.material=leather});
 const cape=g.userData.cape82;if(cape){cape.visible=!!equipment.cape;if(equipment.cape==='explorer_cape'){cape.material=cape.material.clone();cape.material.color.setHex(0x47613d)}}
 return g;
}
