import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../WebGame/3d/assets/three.module.min.js';
import {initFx} from '../WebGame/3d/fx3.js';
for (const type of ['tree','copper']) test(`${type} effects never overwrite bridge-owned vertex ranges`,()=>{
  let frame;
  globalThis.requestAnimationFrame=fn=>{frame=fn;return 1};
  globalThis.document={createElement:()=>({textContent:''}),head:{appendChild(){}},querySelector:()=>null};
  const attr=new THREE.Float32BufferAttribute([3,1,4,3,2,4,4,1,4],3);
  const original=attr.array.slice();
  const grp=new THREE.Group();grp.position.set(3,0,4);
  grp.add(new THREE.Mesh(new THREE.BoxGeometry(.5,2,.5),new THREE.MeshBasicMaterial()));
  grp.userData.mr=[{attr,start:0,count:3}];
  const source={x:3,y:4,type,dep:false}, visual={x:3,y:4,type,grp};
  const S=new THREE.Scene();S.add(grp);
  globalThis.window={B3:{G:{objs:[source]},S,M:{objs:[visual]},hAt:()=>0,npcs:[],Pl:{g:new THREE.Group()}}};
  const fx=initFx({THREE});
  // The real bridge hides vertices before the effects frame observes depletion.
  for(let i=1;i<attr.array.length;i+=3)attr.array[i]=-999;
  const hidden=attr.array.slice();source.dep=true;frame();
  assert.deepEqual(attr.array,hidden);
  assert.equal(fx.state().dep,1);
  attr.array.set(original);source.dep=false;frame();
  assert.deepEqual(attr.array,original);
  // Repeat, since the original bug persisted across regrowth cycles.
  for(let cycle=0;cycle<10;cycle++){
    attr.array.set(hidden);source.dep=true;frame();assert.deepEqual(attr.array,hidden);
    attr.array.set(original);source.dep=false;frame();assert.deepEqual(attr.array,original);
  }
});
