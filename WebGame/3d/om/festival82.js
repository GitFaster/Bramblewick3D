// Lantern Festival scenery. Decorations never participate in picking or collision.
import * as THREE from '../assets/three.module.min.js?v=14';

export function addFestivalGarden(scene, world, heightAt) {
 const root = new THREE.Group();
 root.name = 'Briarhaven Lantern Festival';
 scene.add(root);
 const dummy = new THREE.Object3D(), color = new THREE.Color();
 const batches = [];
 function batch(geometry, capacity, metallic = false) {
  const material = new THREE.MeshStandardMaterial({color:0xffffff, roughness:metallic ? .4 : .86, metalness:metallic ? .55 : .02});
  const mesh = new THREE.InstancedMesh(geometry, material, capacity);
  mesh.count = 0;
  mesh.raycast = () => {};
  mesh.receiveShadow = true;
  root.add(mesh);
  batches.push(mesh);
  return mesh;
 }
 function put(mesh, x, y, z, sx, sy, sz, tint, yaw = 0) {
  if (mesh.count >= mesh.instanceMatrix.count) return;
  dummy.position.set(x, y, z);
  dummy.rotation.set(0, yaw, 0);
  dummy.scale.set(sx, sy, sz);
  dummy.updateMatrix();
  mesh.setMatrixAt(mesh.count, dummy.matrix);
  mesh.setColorAt(mesh.count++, color.setHex(tint));
 }
 // The flat inlay follows the actual ground, including between tile vertices.
 const positions = [], colors = [];
 function triangle(a, b, c, tint) {
  color.setHex(tint);
  for (const [x,z] of [a,b,c]) {
   positions.push(x, heightAt(x,z) + .065, z);
   colors.push(color.r, color.g, color.b);
  }
 }
 const at = (r,a) => [86+Math.cos(a)*r,109+Math.sin(a)*r];
 for (const [inner,outer] of [[1.48,1.57],[2.65,2.74],[3.04,3.11]]) {
  for (let k=0;k<128;k++) {
   const a=k*Math.PI/64, b=(k+1)*Math.PI/64;
   triangle(at(inner,a),at(inner,b),at(outer,b),0xd9b576);
   triangle(at(inner,a),at(outer,b),at(outer,a),0xd9b576);
  }
 }
 for (let k=0;k<32;k++) {
  const a=k*Math.PI/16, da=Math.PI/72;
  const tip=at(2.6,a), left=at(2.12,a-da), base=at(1.64,a), right=at(2.12,a+da);
  triangle(tip,left,base,k%4 ? 0xb1a4c3 : 0x79cbd0);
  triangle(tip,base,right,k%4 ? 0xe2c994 : 0xd0f1e9);
 }
 const inlayGeo = new THREE.BufferGeometry();
 inlayGeo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 inlayGeo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 inlayGeo.computeVertexNormals();
 const inlay = new THREE.Mesh(inlayGeo,new THREE.MeshStandardMaterial({vertexColors:true,side:THREE.DoubleSide,roughness:.65,metalness:.18}));
 inlay.raycast=()=>{};
 inlay.receiveShadow=true;
 root.add(inlay);
 const pots=batch(new THREE.CylinderGeometry(.5,.41,1,8),10);
 const rims=batch(new THREE.TorusGeometry(.49,.045,5,16).rotateX(Math.PI/2),10,true);
 const soil=batch(new THREE.CylinderGeometry(.44,.44,.025,10),10);
 const stems=batch(new THREE.CylinderGeometry(.012,.018,1,4),80);
 const leaves=batch(new THREE.SphereGeometry(1,6,4),160);
 const petals=batch(new THREE.SphereGeometry(1,6,4),400);
 const hearts=batch(new THREE.SphereGeometry(1,6,4),80);
 let planters=0;
 const size=world.ter.S;
 for (const p of world.P) {
  const d=world.loc[p[0]];
  if (d?.art!=='cottage' || planters>=10) continue;
  const cx=p[3]+d.w/2, cz=size-p[4]-d.l/2;
  const face=Math.abs(cx-86)>Math.abs(cz-109) ? (cx<86?-Math.PI/2:Math.PI/2) : (cz<109?Math.PI:0);
  const quarter=Math.abs(face)===Math.PI/2, w=quarter?d.l:d.w, l=quarter?d.w:d.l;
  const fc=Math.cos(face), fs=Math.sin(face);
  for (const side of [-1,1]) {
   // Nestle pots against the existing wall corners, within the building footprint.
   const x=cx+side*w*.36*fc-l*.36*fs, z=cz-side*w*.36*fs-l*.36*fc, y=heightAt(x,z);
   put(pots,x,y+.23,z,.8,.46,.8,0x736582);
   put(rims,x,y+.46,z,.8,1,.8,0xe1bd79);
   put(soil,x,y+.44,z,.8,1,.8,0x493b45);
   for (let k=0;k<8;k++) {
    const a=k*2.399, r=k?.23:0, fx=x+Math.cos(a)*r, fz=z+Math.sin(a)*r, h=.18+(k%3)*.065;
    const top=y+.46+h, tint=[0xf1a0ce,0xd9b3f1,0xffd48c,0xf8d9e9][(k+planters)%4];
    put(stems,fx,y+.46+h/2,fz,1,h,1,0x507459);
    put(leaves,fx+.07,top-.12,fz,.12,.025,.045,0x6d9c72,a);
    put(leaves,fx-.07,top-.07,fz,.12,.025,.045,0x8caf7c,-a);
    for (let petal=0;petal<5;petal++) {
     const pa=petal*Math.PI*2/5;
     put(petals,fx+Math.cos(pa)*.065,top,fz+Math.sin(pa)*.065,.09,.035,.05,tint,-pa);
    }
    put(hearts,fx,top+.02,fz,.035,.025,.035,0xf5cc72);
   }
   planters++;
  }
 }
 for (const mesh of batches) {
  mesh.instanceMatrix.needsUpdate=true;
  if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;
  mesh.computeBoundingSphere();
 }
 root.traverse(o=>{o.raycast=()=>{}});
 return {setVisible(visible){root.visible=visible},stats:{planters,flowers:hearts.count,mosaicTriangles:positions.length/9,drawCalls:batches.length+1}};
}
