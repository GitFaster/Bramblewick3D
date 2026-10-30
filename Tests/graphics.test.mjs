import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from '../WebGame/3d/assets/three.module.min.js';
import {initGfx} from '../WebGame/3d/gfx.js';
function setup(saved='{}') {
  let frame,time=0,pr=3,stored=saved;
  const nodes=[];
  const make=tag=>{const el={tag,style:{},dataset:{},children:[],offsetWidth:230,attrs:{},textContent:'',innerHTML:'',
    appendChild(c){this.children.push(c)},setAttribute(k,v){this.attrs[k]=v},addEventListener(){},
    getBoundingClientRect:()=>({right:52,bottom:52}),querySelector:()=>null,contains:()=>false,focus(){}};
    if(tag==='canvas')el.getContext=()=>({createRadialGradient:()=>({addColorStop(){}}),fillRect(){}});
    nodes.push(el);return el};
  globalThis.document={hidden:false,createElement:make,head:make('head'),body:make('body'),querySelectorAll:()=>[],addEventListener(){}};
  globalThis.performance={now:()=>time};globalThis.requestAnimationFrame=fn=>{frame=fn;return 1};
  globalThis.setInterval=()=>0;globalThis.matchMedia=()=>({matches:false});
  globalThis.devicePixelRatio=3;globalThis.innerWidth=390;globalThis.innerHeight=844;
  globalThis.addEventListener=()=>{};
  globalThis.localStorage={getItem:()=>stored,setItem:(k,v)=>stored=v};
  const scene=new THREE.Scene();scene.fog=new THREE.Fog(0xffffff,32,75);
  const sun=new THREE.DirectionalLight(),renderer={shadowMap:{enabled:true},setPixelRatio:v=>pr=v,getPixelRatio:()=>pr};
  globalThis.window={B3:{THREE,S:scene,Pl:{g:new THREE.Group()}},__B3R:renderer,__B3sun:sun,__B3gfx:'low',dispatchEvent(){}};
  const gfx=initGfx();
  return {gfx,scene,renderer,sun,nodes,stored:()=>JSON.parse(stored),advance(ms,step=100){for(let n=0;n<ms;n+=step){time+=step;frame()}}};
}
test('persisted Low applies fog, pixel ratio and shadows on first load',()=>{const {gfx,scene}=setup('{"gfx":"low"}');assert.deepEqual({...gfx.state(),fps:0},{mode:'low',lvl:0,fps:0,shadows:false,pr:1,glow:false});assert.equal(scene.fog.far,60)});
test('Medium has shadows with a smaller rendering budget and no sun glow',()=>{const {gfx}=setup();gfx.set('medium');assert.equal(gfx.state().pr,1.25);assert.equal(gfx.state().shadows,true);assert.equal(gfx.state().glow,false);assert.equal(gfx.mode,'medium')});
test('switching Low to High enables shadows and glow without reloading',()=>{const {gfx,sun}=setup('{"gfx":"low"}');gfx.set('high');assert.equal(gfx.state().pr,3);assert.equal(gfx.state().glow,true);assert.equal(sun.castShadow,true)});
test('quality writes preserve unrelated UI preferences',()=>{const {gfx,stored}=setup('{"autoEq":false,"layout":"compact"}');gfx.set('medium');assert.deepEqual(stored(),{autoEq:false,layout:'compact',gfx:'medium'})});
test('malformed and null preferences fall back to Auto',()=>{for(const raw of ['null','[]','{broken','"string"']){const {gfx}=setup(raw);assert.equal(gfx.state().mode,'auto');gfx.set('low');assert.equal(gfx.state().lvl,0)}});
test('invalid quality values do not change preferences or render state',()=>{const {gfx,stored}=setup('{"gfx":"medium"}');gfx.set('ultra');assert.equal(gfx.state().mode,'medium');assert.equal(stored().gfx,'medium')});
test('Auto reduces quality after sustained slow frames',()=>{const {gfx,advance}=setup();advance(16000);assert.ok(gfx.state().lvl<2);assert.ok(gfx.drops>0)});
test('explicit Medium stays fixed under slow frames',()=>{const {gfx,advance}=setup('{"gfx":"medium"}');advance(16000);assert.equal(gfx.state().lvl,1);assert.equal(gfx.drops,0)});
test('hidden pages do not trigger Auto quality drops',()=>{const {gfx,advance}=setup();document.hidden=true;advance(16000);assert.equal(gfx.state().lvl,2);assert.equal(gfx.drops,0)});
test('Auto can recover quality after a stable frame rate',()=>{const {gfx,advance}=setup();advance(16000);const low=gfx.state().lvl;advance(45000,1000/60);assert.ok(gfx.state().lvl>low)});
