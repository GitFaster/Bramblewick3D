import test from 'node:test';
import assert from 'node:assert/strict';
import {initMap} from '../WebGame/3d/map.js';
function setup(){
  const globals={},frames=new Map();let next=0;
  const context=new Proxy({}, {get:(o,k)=>o[k]||(o[k]=()=>{}),set:(o,k,v)=>(o[k]=v,true)});
  const element=()=>({isConnected:true,style:{},listeners:{},dataset:{},setAttribute(){},appendChild(){},addEventListener(k,f){this.listeners[k]=f},focus(){document.activeElement=this},getContext:()=>context,setPointerCapture(){},getBoundingClientRect:()=>({left:280,top:8,width:100,height:100})});
  const canvas=element(),close=element(),tools=element(),mm=element(),initial=element();
  const overlay=element();overlay.querySelector=s=>s==='canvas'?canvas:s==='.x'?close:tools;overlay.querySelectorAll=()=>[...buttons,close];
  const buttons=Array.from({length:4},()=>element());
  globalThis.document={activeElement:initial,head:element(),body:element(),createElement:t=>t==='div'?overlay:element(),getElementById:()=>mm};
  globalThis.innerWidth=390;globalThis.innerHeight=844;globalThis.devicePixelRatio=3;
  globalThis.requestAnimationFrame=f=>{frames.set(++next,f);return next};globalThis.cancelAnimationFrame=id=>frames.delete(id);globalThis.setInterval=()=>0;
  globalThis.addEventListener=(k,f)=>globals[k]=f;
  globalThis.window={B3:{M:{W:64,H:64,t:Array(4096).fill(0),objs:[],npcs:[],ND:{}},G:{player:{x:28,y:33},npcs:[]}}};
  const map=initMap();
  const key=k=>globals.keydown({key:k,target:canvas,preventDefault(){},stopPropagation(){}});
  const pointer=(type,x,y,id=1)=>canvas.listeners[type]({clientX:x,clientY:y,pointerId:id});
  const action=a=>tools.listeners.click({target:{closest:()=>({dataset:{map:a}})}});
  return {map,key,pointer,action,canvas,close,buttons,initial,frames,resize:(w,h)=>{globalThis.innerWidth=w;globalThis.innerHeight=h;globals.resize()}};
}
test('opening twice keeps one animation loop; closing cancels it',()=>{const {map,frames}=setup();map.show();map.show();assert.equal(map.state().open,true);assert.equal(frames.size,1);map.hide();assert.equal(frames.size,0)});
test('Find me centres the player and Whole map fits the terrain',()=>{const {map,action}=setup();map.show();action('all');const fit=map.state();assert.ok(64*8*fit.z<=innerWidth);assert.ok(64*8*fit.z<=innerHeight);action('you');const v=map.state();assert.ok(Math.abs(v.px+(28.5)*8*v.z-innerWidth/2)<1e-9);assert.ok(Math.abs(v.py+33.5*8*v.z-innerHeight/2)<1e-9)});
test('zoom controls stay within useful limits',()=>{const {map,action}=setup();map.show();for(let n=0;n<100;n++)action('in');assert.equal(map.state().z,8);for(let n=0;n<100;n++)action('out');assert.ok(map.state().z>0);assert.ok(map.state().z<1)});
test('Escape closes the map and restores focus',()=>{const {map,key,initial}=setup();map.show();key('Escape');assert.equal(map.state().open,false);assert.equal(document.activeElement,initial)});
test('Tab keeps keyboard focus inside the map controls',()=>{const {map,key,buttons}=setup();map.show();key('Tab');assert.equal(document.activeElement,buttons[0])});
test('cancelled or stale pointers do not pan a reopened map',()=>{const {map,pointer}=setup();map.show();pointer('pointerdown',100,100);map.hide();map.show();const before=map.state();pointer('pointermove',300,300);assert.deepEqual(map.state(),before)});
test('dragging cannot strand the entire map off-screen',()=>{const {map,pointer}=setup();map.show();pointer('pointerdown',100,100);pointer('pointermove',10000,10000);const v=map.state();assert.ok(v.px<=innerWidth-64);assert.ok(v.py<=innerHeight-64)});
test('rotation preserves the world position at the screen centre',()=>{const {map,resize}=setup();map.show();const a=map.state(),x=(innerWidth/2-a.px)/a.z,y=(innerHeight/2-a.py)/a.z;resize(844,390);const b=map.state();assert.ok(Math.abs((innerWidth/2-b.px)/b.z-x)<1e-8);assert.ok(Math.abs((innerHeight/2-b.py)/b.z-y)<1e-8)});
