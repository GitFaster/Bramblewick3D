import * as THREE from '../assets/three.module.min.js?v=14';
import {buildAdventurer as previous,createTree,stylizeCharacter,addTownDetails,tierPalette} from './fantasy81.js?v=81';
export {createTree,stylizeCharacter,addTownDetails,tierPalette};
const shoulders=new THREE.OctahedronGeometry(1,0),gold=new THREE.MeshStandardMaterial({color:0xe8c17a,metalness:.55,roughness:.4}),medal=new THREE.OctahedronGeometry(.07);
export function buildAdventurer(look={},eq={}){const g=previous(look,eq),L=g.userData.L;if(!L)return g;L.head.scale.set(1.18,1.2,1.18);
 // Keep the established animation pivots and equipment, refine the visible shapes.
 g.traverse(m=>{if(!m.isMesh||!m.geometry)return;const p=m.geometry.parameters;if(m.geometry.type==='CylinderGeometry'&&p.radialSegments<10){m.geometry=new THREE.CylinderGeometry(p.radiusTop,p.radiusBottom,p.height,12,p.heightSegments||1,p.openEnded,p.thetaStart,p.thetaLength);if(m.material.isMeshStandardMaterial)m.material.flatShading=false;}
 if(m.geometry.type==='IcosahedronGeometry'&&p.radius===1&&Math.abs(m.position.x)>.2&&m.position.y>.35){m.geometry=shoulders;m.scale.multiply(new THREE.Vector3(.82,.85,.85));}
 if(m.geometry.type==='ShapeGeometry'&&m.position.z<-.1){m.material=m.material.clone();m.material.color.setHex(0x7b315b);m.scale.set(1.14,1.3,1);g.userData.cape82=m;}
 });
 for(const m of L.head.children){if(!m.isMesh||!m.material.color)continue;const hex=m.material.color.getHex();if(hex===0xfff7e9||hex===0x433353)m.scale.multiplyScalar(.72);}
 for(const side of [-1,1]){const pin=new THREE.Mesh(medal,gold);pin.position.set(side*.17,.43,.16);pin.scale.set(.65,.8,.4);L.chest.add(pin)}
 return g;
}
