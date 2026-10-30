import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from '../WebGame/3d/assets/three.module.min.js';
import * as R from '../WebGame/3d/game/rules.js';
globalThis.window={};
const {initGame}=await import('../WebGame/3d/game3d.js');
const data=Object.fromEntries(['items','npcs','drops','shops','nodes'].map(n=>[n,JSON.parse(fs.readFileSync(new URL(`../WebGame/3d/game/${n}.json`,import.meta.url)))]));
const DEF=R.defsFromJson(data);
function setup(saved){
  const storage=new Map(),writes=[],messages=[];
  if(saved)storage.set(R.SAVE_KEY,JSON.stringify(saved));
  globalThis.window={};
  globalThis.localStorage={getItem:k=>storage.get(k)||null,setItem:(k,v)=>{storage.set(k,v);writes.push(k)}};
  const element=()=>({style:{},classList:{toggle(){}},addEventListener(){},contains:()=>false,innerHTML:'',appendChild(){}});
  const elements=Object.fromEntries(['#inv','#invb','#menu','#hp span','#run span','#run'].map(k=>[k,element()]));
  globalThis.document={hidden:false,head:element(),body:element(),querySelector:s=>elements[s],createElement:element,addEventListener(){}};
  globalThis.addEventListener=()=>{};
  const S=new THREE.Scene(),grp=new THREE.Group(),attr=new THREE.Float32BufferAttribute([1,0,1,1,2,1,2,1,1],3);
  grp.userData.mr=[{attr,start:0,count:3}];
  const visual={x:1,y:1,type:'tree',grp};
  const ctx={THREE,S,M:{},npcs:[],objs:[visual],walk:()=>true,hAt:()=>0,msg:t=>messages.push(t),cam:new THREE.PerspectiveCamera(),DEF,Pl:{g:new THREE.Group()}};
  const gm=initGame(ctx);
  return {gm,S,storage,writes,messages,attr};
}
function saveFixture(){const state=R.createState(DEF);R.fromSave(state,null);state.player.xp.attack=500000;state.player.bank.coins=12345;return JSON.parse(JSON.stringify(R.toSave(state)))}
test('loaded XP, inventory and bank survive the first bridge save',()=>{const fixture=saveFixture();const {gm,storage,writes}=setup(fixture);assert.equal(gm.stats().loaded,true);assert.equal(writes.includes(R.SAVE_KEY),false);assert.equal(gm.save(),true);const actual=JSON.parse(storage.get(R.SAVE_KEY));assert.deepEqual(actual.xp,fixture.xp);assert.deepEqual(actual.inv,fixture.inv);assert.deepEqual(actual.bank,fixture.bank)});
test('bridge refuses to overwrite progress changed by another tab',()=>{const {gm,storage,messages}=setup(saveFixture());const other=saveFixture();other.xp.attack=600000;const raw=JSON.stringify(other);storage.set(R.SAVE_KEY,raw);assert.equal(gm.save(),false);assert.equal(storage.get(R.SAVE_KEY),raw);assert.equal(gm.stats().stale,true);assert.ok(messages.some(m=>m.includes('another tab')))});
test('removed ground loot releases its material once',()=>{const {gm,S}=setup();R.dropGround(gm.G,'coins',1,28,33);gm.afterTick();const loot=S.children.find(m=>m.userData.ground);assert.ok(loot);let disposed=0;loot.material.addEventListener('dispose',()=>disposed++);gm.G.ground.length=0;gm.afterTick();gm.afterTick();assert.equal(disposed,1);assert.ok(!S.children.includes(loot))});
test('resource regrowth restores exact vertices and disposes only marker material',()=>{const {gm,S,attr}=setup();const original=attr.array.slice();gm.G.objs[0].dep=999;gm.afterTick();const marker=S.children.find(m=>m.geometry?.type==='CylinderGeometry');assert.ok(marker);let materials=0,geometries=0;marker.material.addEventListener('dispose',()=>materials++);marker.geometry.addEventListener('dispose',()=>geometries++);gm.G.objs[0].dep=0;gm.afterTick();assert.deepEqual(attr.array,original);assert.equal(materials,1);assert.equal(geometries,0);gm.G.objs[0].dep=999;gm.afterTick();assert.ok(S.children.some(m=>m.geometry===marker.geometry))});
test('auto-equip can see bank/shop UI state through the bridge',()=>{const {gm}=setup();assert.equal(gm.uiMode(),null);gm.open('bank');assert.equal(gm.uiMode(),'bank');gm.close();assert.equal(gm.uiMode(),null);gm.open('shop');assert.equal(gm.uiMode(),'shop')});
