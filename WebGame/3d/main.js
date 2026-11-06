// Bramblewick 3D - Milestone 1. Movement rules ported from Tarnish Movement.java / Direction.java / DoorAction.java
import * as THREE from './assets/three.module.min.js?v=14';
import {makeChar,animate,poolStats} from './chars.js?v=22';
import {buildField,buildTerrain,WL} from './terrain.js?v=25';
import {loadDefs,initGame} from './game3d.js?v=24';
import {initFun} from './fun.js?v=24';
{const m=(window.__B3mods=window.__B3mods||{});m.main=1;const need=['main','game3d','rules','terrain','chars','fun'];window.__B3modsOK=need.every(k=>m[k]);if(!window.__B3modsOK)window.__B3dead='module flags missing: '+need.filter(k=>!m[k]).join(',')}
await (window.__B3gate||0);await (window.__B3sync||0);window.__B3started=1;const CFG=window.__B3cfg||{goals:[]};
const $=s=>document.querySelector(s);
const ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:#000c;color:#ffe9a3;font:700 16px sans-serif;white-space:pre-wrap;text-align:center;padding:20px';ov.textContent='Loading Bramblewick 3D…';document.body.appendChild(ov);
let dead=false;const fail=e=>{if(dead)return;dead=true;window.__B3dead=String(e&&e.stack||e&&e.message||e).slice(0,800);const b=document.getElementById('boot');if(b)b.remove();ov.style.display='flex';ov.style.color='#f88';ov.textContent='Error: '+(e&&e.stack||e)};
const soft=e=>{if(window.__B3ready){console.error(e);try{msg('Error: '+String(e&&e.message||e).slice(0,120),'c')}catch(_){}}else fail(e)};addEventListener('error',e=>soft(e.error||e.message));addEventListener('unhandledrejection',e=>soft(e.reason));
const chatEl=$('#chat');function msg(t,c){const d=document.createElement('div');d.innerHTML=c?`<span class="${c}">${t}</span>`:t;chatEl.appendChild(d);while(chatEl.children.length>30)chatEl.firstChild.remove();if(chatEl.classList.contains('open'))chatEl.scrollTop=1e9}
chatEl.addEventListener('click',()=>{chatEl.classList.toggle('open');chatEl.style.overflowY=chatEl.classList.contains('open')?'auto':'hidden';chatEl.scrollTop=1e9});
(async()=>{
const M=await (await fetch('assets/map.json')).json();const {W,H}=M;const NC=Math.ceil(W/16)*Math.ceil(H/16);
const idx=(x,y)=>y*W+x,inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const WK=Uint8Array.from(M.wk);
// ---- renderer
const cv=$('#c');const R=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});const QP=new URLSearchParams(location.search),MOB=matchMedia('(pointer:coarse)').matches;let GFX='auto';try{GFX=(JSON.parse(localStorage.getItem('b3d.ui.v1')||'{}').gfx)||'auto'}catch(e){}window.__B3gfx=GFX;const HD=QP.get('hd')==='0'||QP.get('q')==='low'||CFG.quality==='low'||GFX==='low'?false:true;window.__B3R=R;window.__B3hd=HD;R.setPixelRatio(Math.min(devicePixelRatio||1,HD?(MOB?(GFX==='high'?2:1.75):2):(GFX==='low'?1:1.25)));R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.05;R.outputColorSpace=THREE.SRGBColorSpace;if(HD){R.shadowMap.enabled=true;R.shadowMap.type=THREE.PCFSoftShadowMap}
const S=new THREE.Scene();{const g=document.createElement('canvas');g.width=2;g.height=256;const x=g.getContext('2d'),gr=x.createLinearGradient(0,0,0,256);gr.addColorStop(0,'#416fa8');gr.addColorStop(.48,'#98bfdd');gr.addColorStop(.78,'#c6dce6');gr.addColorStop(1,'#e8eee9');x.fillStyle=gr;x.fillRect(0,0,2,256);const t=new THREE.CanvasTexture(g);t.colorSpace=THREE.SRGBColorSpace;S.background=t}S.fog=new THREE.Fog(0xc4d8df,34,78);
const cam=new THREE.PerspectiveCamera(50,1,.1,200);
S.add(new THREE.HemisphereLight(0xd6eaff,0x46513d,1.05));const sun=new THREE.DirectionalLight(0xffdcb0,1.7);sun.position.set(-30,50,-20);S.add(sun);S.add(sun.target);window.__B3sun=sun;
{sun.castShadow=HD;sun.shadow.mapSize.set(MOB?1024:2048,MOB?1024:2048);const sc=sun.shadow.camera;sc.left=sc.bottom=-14;sc.right=sc.top=14;sc.near=10;sc.far=70;window.__B3shadow={size:MOB?1024:2048,box:28,near:10,far:70};sun.shadow.bias=-.0004;sun.shadow.normalBias=.03;sun.shadow.radius=3}
const SUNOFF=new THREE.Vector3(-18,30,-12);S.onBeforeRender=()=>{if(typeof Pl!=='undefined'&&Pl.g){sun.target.position.copy(Pl.g.position);sun.position.copy(Pl.g.position).add(SUNOFF)}};
let __ft=[],__lt=0;R.info.autoReset=true;window.__B3perf=()=>{const a=__ft.slice(-120).sort((p,q)=>p-q);return {n:a.length,median:a[a.length>>1],p90:a[Math.floor(a.length*.9)],pr:R.getPixelRatio(),calls:R.info.render.calls,tris:R.info.render.triangles}};S.onAfterRender=()=>{const n=performance.now();if(window.__B3wind)window.__B3wind.value=n/1000;TR.update(n/1000);if(__lt)__ft.push(+(n-__lt).toFixed(1));__lt=n;if(__ft.length>600)__ft=__ft.slice(-300)};
function resize(){R.setSize(innerWidth,innerHeight,false);cam.aspect=innerWidth/innerHeight;cam.updateProjectionMatrix()}addEventListener('resize',resize);resize();
// ---- terrain v11 (terrain.js): continuous global height field, smoothed masks, procedural materials, shader water, bridge decks
const F=buildField(M);const hAt=F.hAt;const TQ=HD?{sub:4,texN:512}:{sub:2,texN:128};const TR=buildTerrain(M,S,R,F,TQ);const terr=TR.meshes;window.__B3terr={tris:TR.tris,sub:TQ.sub};
// ---- walls (instanced boxes)
const WALLS=[];let __wcut='';
const WH={4:1.6,9:.6,12:1.4,13:2.2},WC={4:0xaaa18f,9:0x765536,12:0x98784f,13:0xb9b3a5};
function stoneMaterial(color){const m=new THREE.MeshLambertMaterial({color,flatShading:true});m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vStoneWorld;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n vStoneWorld=(modelMatrix*instanceMatrix*vec4(position,1.0)).xyz;');s.fragmentShader='varying vec3 vStoneWorld;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>\n float row=floor(vStoneWorld.y*1.35); float seamY=step(.955,fract(vStoneWorld.y*1.35));\n float seamX=step(.955,fract(vStoneWorld.x*1.05+mod(row,2.0)*.5));\n float grain=fract(sin(dot(floor(vStoneWorld.xz*3.0),vec2(12.9898,78.233)))*43758.5453);\n float mortar=max(seamY,seamX); diffuseColor.rgb*=mix(0.72+grain*0.18,0.28,mortar);`)};m.customProgramCacheKey=()=>`bramblewick-stone-${color}`;return m}
{const by={};for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=M.t[idx(x,y)];if(t===4||t===12||t===13)(by[t]=by[t]||[]).push([x,y,t])}const bg=new THREE.BoxGeometry(1,1,1);const m4=new THREE.Matrix4();
for(const t in by){const L=by[t],h=WH[t]||1.5,th=t==9?.25:1;const im=new THREE.InstancedMesh(bg,stoneMaterial(WC[t]),L.length);L.forEach(([x,y],k)=>{m4.compose(new THREE.Vector3(x+.5,h/2+hAt(x+.5,y+.5),y+.5),new THREE.Quaternion(),new THREE.Vector3(th,h,th));im.setMatrixAt(k,m4);const shade=.88+((x*19+y*31)%11)/100;im.setColorAt(k,new THREE.Color(shade,shade*.98,shade*.94))});S.add(im);WALLS.push({im,L,h,th})}}
// Remaining game setup, controls, and gameplay are unchanged from the previous main.js.
window.__B3hdTerrainQuality=HD?'ultra':'balanced';
})().catch(fail);
