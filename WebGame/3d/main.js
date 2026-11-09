// Bramblewick 3D - Milestone 1. Movement rules ported from Tarnish Movement.java / Direction.java / DoorAction.java
import * as THREE from './assets/three.module.min.js?v=14';
import {makeChar,animate,poolStats} from './chars.js?v=22';
import {buildField,buildTerrain,WL} from './terrain.js?v=25';
import {loadDefs,initGame} from './game3d.js?v=24';
import {initFun} from './fun.js?v=24';
{const m=(window.__B3mods=window.__B3mods||{});m.main=1;const need=['main','game3d','rules','terrain','chars','fun'];window.__B3modsOK=need.every(k=>m[k]);if(!window.__B3modsOK)window.__B3dead='module flags missing: '+need.filter(k=>!m[k]).join(',')}
await (window.__B3gate||0);await (window.__B3sync||0);window.__B3started=1;const CFG=window.__B3cfg||{goals:[]};window.__B3cfgUsed=CFG;
const $=s=>document.querySelector(s);
const ov=document.createElement('div');ov.style.cssText='position:fixed;inset:0;z-index:50;display:flex;align-items:center;justify-content:center;background:#000c;color:#ffe9a3;font:700 16px sans-serif;white-space:pre-wrap;text-align:center;padding:20px';ov.textContent='Loading Bramblewick 3D…';document.body.appendChild(ov);window.__B3mod=1;
let dead=false;const fail=e=>{if(dead)return;dead=true;window.__B3dead=String(e&&e.stack||e&&e.message||e).slice(0,800);const b=document.getElementById('boot');if(b)b.remove();ov.style.display='flex';ov.style.color='#f88';ov.textContent='Error: '+(e&&e.stack||e)};
const soft=e=>{if(window.__B3ready){console.error(e);try{msg('Error: '+String(e&&e.message||e).slice(0,120),'c')}catch(_){}}else fail(e)};addEventListener('error',e=>soft(e.error||e.message));addEventListener('unhandledrejection',e=>soft(e.reason));
const chatEl=$('#chat');function msg(t,c){const d=document.createElement('div');d.innerHTML=c?`<span class="${c}">${t}</span>`:t;chatEl.appendChild(d);while(chatEl.children.length>30)chatEl.firstChild.remove();if(chatEl.classList.contains('open'))chatEl.scrollTop=1e9}
chatEl.addEventListener('click',()=>{chatEl.classList.toggle('open');chatEl.style.overflowY=chatEl.classList.contains('open')?'auto':'hidden';chatEl.scrollTop=1e9});
(async()=>{
const M=await (await fetch('assets/map.json?v=wld01')).json();const {W,H}=M;const NC=Math.ceil(W/16)*Math.ceil(H/16);
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
// ---- roofs over floor (type 5) components; hide when player inside
const roofs=[];{const seen=new Uint8Array(W*H);const rg=new THREE.BoxGeometry(1.02,.22,1.02),rm=new THREE.MeshLambertMaterial({color:0xffffff,flatShading:true});
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(M.t[idx(x,y)]!==5||seen[idx(x,y)])continue;const comp=[],q=[[x,y]];seen[idx(x,y)]=1;while(q.length){const [a,b]=q.pop();comp.push([a,b]);for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){const u=a+dx,v=b+dy;if(inb(u,v)&&!seen[idx(u,v)]&&M.t[idx(u,v)]===5){seen[idx(u,v)]=1;q.push([u,v])}}}
  const set=new Set(comp.map(([a,b])=>idx(a,b)));const cells=new Set(set);comp.forEach(([a,b])=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const u=a+dx,v=b+dy;if(inb(u,v)&&[4,12,13].includes(M.t[idx(u,v)]))cells.add(idx(u,v))}});
  const im=new THREE.InstancedMesh(rg,rm.clone(),cells.size);im.material.transparent=true;const m4=new THREE.Matrix4();let k=0;for(const c of cells){const x=c%W,y=Math.floor(c/W);m4.makeTranslation(x+.5,2.24+((x*7+y*13)%3)*.018,y+.5);im.setMatrixAt(k,m4);const v=.78+((x*17+y*23)%17)/100;im.setColorAt(k,new THREE.Color(.34*v,.23*v,.19*v));k++}S.add(im);const xs=comp.map(a=>a[0]),ys=comp.map(a=>a[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys),wood=new THREE.MeshLambertMaterial({color:0x4c3020});const alongX=maxX-minX>=maxY-minY,len=(alongX?maxX-minX:maxY-minY)+1,ridge=new THREE.Mesh(new THREE.BoxGeometry(alongX?len:.2,.2,alongX?.2:len),wood);ridge.position.set((minX+maxX+1)/2,2.39,(minY+maxY+1)/2);S.add(ridge);roofs.push({set,cells,im,ridge,op:1})}window.__B3roofs=roofs}
// v15: fade roofs that sit between the camera and the player (phone view no longer covered by a red slab)
function roofFade(){if(typeof Pl==='undefined'||!Pl.g)return;const p=Pl.g.position,c=cam.position;for(const r of roofs){let hit=false;for(const yy of [2.2,2.5]){const t=(yy-(p.y+1))/(c.y-(p.y+1));if(t<=0||t>=1)continue;const x=p.x+(c.x-p.x)*t,z=p.z+(c.z-p.z)*t;for(const [dx,dz] of [[0,0],[.6,0],[-.6,0],[0,.6],[0,-.6]]){const u=Math.floor(x+dx),v=Math.floor(z+dz);if(inb(u,v)&&r.cells.has(idx(u,v))){hit=true;break}}if(hit)break}if(!hit){const dpc=Math.hypot(c.x-p.x,c.z-p.z);for(const q of r.cells){const qx=q%W+.5,qz=Math.floor(q/W)+.5;const dc=Math.hypot(qx-c.x,qz-c.z);if(dc<4.5||(dc<dpc&&Math.hypot(qx-p.x,qz-p.z)<dpc&&((qx-p.x)*(c.x-p.x)+(qz-p.z)*(c.z-p.z))>0&&Math.abs((qx-p.x)*(c.z-p.z)-(qz-p.z)*(c.x-p.x))/dpc<3.5)){hit=true;break}}}const want=hit?0:1;r.op+=(want-r.op)*(want<r.op?.5:.2);if(Math.abs(r.op-want)<.01)r.op=want;r.im.material.opacity=r.op;r.im.material.depthWrite=r.op>.99;r.im.visible=r.op>.02&&!r.set.has(idx(Pl.x,Pl.y));r.ridge.material.transparent=true;r.ridge.material.opacity=r.op;r.ridge.visible=r.im.visible}
 // cutaway: wall instances near the camera (between it and the player) drop to low stubs
 const key=Math.round(c.x*2)+','+Math.round(c.z*2)+','+Math.round(p.x)+','+Math.round(p.z);if(key===__wcut)return;__wcut=key;const m4=new THREE.Matrix4(),dpc=Math.hypot(c.x-p.x,c.z-p.z);
 for(const w of WALLS){let ch=false;w.L.forEach(([x,y],k)=>{const qx=x+.5,qz=y+.5;const dc=Math.hypot(qx-c.x,qz-c.z);const along=((qx-p.x)*(c.x-p.x)+(qz-p.z)*(c.z-p.z))/dpc;const cut=dc<4.5||(along>.8&&along<dpc+2&&Math.abs((qx-p.x)*(c.z-p.z)-(qz-p.z)*(c.x-p.x))/dpc<4.5);const hh=cut?.18:w.h;if((w.cut&&w.cut[k])!==cut){(w.cut=w.cut||[])[k]=cut;m4.compose(new THREE.Vector3(qx,hh/2+hAt(qx,qz),qz),new THREE.Quaternion(),new THREE.Vector3(w.th,hh,w.th));w.im.setMatrixAt(k,m4);ch=true}});if(ch){w.im.instanceMatrix.needsUpdate=true;w.im.computeBoundingSphere()}}}
// ---- objects
const TREES={tree:[0x3f7a2e,1],oak:[0x4d8a34,1.2],willow:[0x6a9a3a,1.2],yew:[0x2e5a2a,1.4],magic:[0x3a7ab0,1.4]};const ROCK={copper:0xb87333,tin:0xb0b0b0,iron:0x7a4a3a,coal:0x2a2a2a,gold:0xd4af37,gemrock:0xb04ab0,glim:0x7ad0ff};
const objMeshes=[],doors=[];const trunkG=new THREE.CylinderGeometry(.12,.18,1,6),leafG=new THREE.IcosahedronGeometry(.7,0),rockG=new THREE.DodecahedronGeometry(.4,0),boxG=new THREE.BoxGeometry(.8,.8,.8);const matC={};const LEAFC=new Set([0x3f7a2e,0x4a8233,0x3a6c2c,0x4d8a34,0x5a9238,0x44782e,0x6a9a3a,0x7aa446,0x5f8c34,0x2e5a2a,0x2a5226,0x355f2e,0x3a7ab0,0x4a88bc,0x34709f]);
const sway=m=>{m.onBeforeCompile=sh=>{sh.uniforms.uWind=window.__B3wind||(window.__B3wind={value:0});sh.vertexShader='uniform float uWind;\n'+sh.vertexShader.replace('#include <project_vertex>',`vec4 swW=modelMatrix*vec4(transformed,1.);
#ifdef USE_INSTANCING
swW=modelMatrix*instanceMatrix*vec4(transformed,1.);
#endif
float swA=clamp(swW.y-1.2,0.,3.)*.035;transformed.x+=sin(uWind*1.3+swW.x*.7+swW.z*.4)*swA;transformed.z+=cos(uWind*1.1+swW.z*.6)*swA*.6;
#include <project_vertex>`)};m.customProgramCacheKey=()=>'sway';return m};
const mat=(c,sm)=>matC[c+(sm?'s':'')]||(matC[c+(sm?'s':'')]=(LEAFC.has(c)?sway:(m=>m))(new THREE.MeshLambertMaterial({color:c,flatShading:!sm})));
// v11 trees: tapered trunk + branches + layered, varied canopy (shared geometries, small palette set)
const TH=(x,y,k)=>{const n=Math.sin(x*12.9898+y*78.233+k*37.719)*43758.5453;return n-Math.floor(n)};
const tTrunk=new THREE.CylinderGeometry(.07,.17,1,8,3);{const p=tTrunk.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setX(i,p.getX(i)+Math.sin(y*3)*.03)}tTrunk.translate(0,.5,0);tTrunk.computeVertexNormals()}
const tBranch=new THREE.CylinderGeometry(.03,.06,.6,6);tBranch.translate(0,.3,0);
const blob=(()=>{const g=new THREE.IcosahedronGeometry(.6,2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=1+.13*Math.sin(x*7+y*5)+.09*Math.sin(z*9-y*4);p.setXYZ(i,x*n,y*n*.82,z*n)}g.computeVertexNormals();return g})();
const cone=new THREE.ConeGeometry(.75,.9,10,1);cone.translate(0,.45,0);
const rockRG=(()=>{const g=new THREE.IcosahedronGeometry(.42,2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const n=1+.12*Math.sin(x*9+z*4)+.08*Math.sin(y*11);p.setXYZ(i,x*n*1.1,Math.max(-.1,y*n*.62),z*n)}g.computeVertexNormals();return g})();
const oreG=new THREE.DodecahedronGeometry(.22,0);
const leafPal={tree:[0x3f7a2e,0x4a8233,0x3a6c2c],oak:[0x4d8a34,0x5a9238,0x44782e],willow:[0x6a9a3a,0x7aa446,0x5f8c34],yew:[0x2e5a2a,0x2a5226,0x355f2e],magic:[0x3a7ab0,0x4a88bc,0x34709f]};
function makeTree(g,o){const [,s0]=TREES[o.type];const r=k=>TH(o.x,o.y,k);const s=s0*(.85+.3*r(1));const pal=leafPal[o.type];
 const tr=new THREE.Mesh(tTrunk,mat(0x5e4128,1));tr.scale.set(s*(.9+.3*r(2)),s*(1.1+.3*r(3)),s*(.9+.3*r(2)));tr.castShadow=true;g.add(tr);
 const nb=2+Math.floor(r(4)*2);for(let i=0;i<nb;i++){const b=new THREE.Mesh(tBranch,mat(0x5e4128,1));b.position.y=s*(.75+.25*r(10+i));b.rotation.set(0,r(20+i)*6.28,.7+.4*r(30+i),'YXZ');b.scale.setScalar(s);g.add(b)}
 if(o.type==='yew'){for(let i=0;i<3;i++){const c=new THREE.Mesh(cone,mat(pal[i%3],1));c.position.y=s*(.9+i*.42);c.scale.setScalar(s*(1.15-i*.28));c.rotation.y=r(40+i)*6;c.castShadow=true;g.add(c)}}
 else{const nl=4+Math.floor(r(5)*3),droop=o.type==='willow';for(let i=0;i<nl;i++){const a=r(50+i)*6.28,rad=i?(.35+.25*r(60+i))*s:0;const c=new THREE.Mesh(blob,mat(pal[Math.floor(r(70+i)*3)],1));
   c.position.set(Math.cos(a)*rad,s*(droop?1.15+.2*r(80+i):1.35+.35*r(80+i)+(i?0:.15)),Math.sin(a)*rad);const k=s*(i?.62+.3*r(90+i):1.0);c.scale.set(k,k*(droop?1.25:1),k);c.rotation.y=a;c.castShadow=true;g.add(c)}}
 g.rotation.y=r(6)*6.28}
// v11 fences: posts at fence tiles + two rails to each fence neighbour (connected)
{const isF=(x,y)=>inb(x,y)&&M.t[idx(x,y)]===9;const posts=[],rails=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(!isF(x,y))continue;posts.push([x,y]);if(isF(x+1,y))rails.push([x,y,0]);if(isF(x,y+1))rails.push([x,y,1])}
 const pg=new THREE.BoxGeometry(.12,.75,.12),rg=new THREE.BoxGeometry(1.02,.07,.05);const fm=new THREE.MeshLambertMaterial({color:0x7a5a38});const D=new THREE.Object3D();
 const pi=new THREE.InstancedMesh(pg,fm,posts.length);posts.forEach(([x,y],k)=>{D.position.set(x+.5,hAt(x+.5,y+.5)+.33,y+.5);D.rotation.set(0,TH(x,y,1)*.3-.15,(TH(x,y,2)-.5)*.06);D.updateMatrix();pi.setMatrixAt(k,D.matrix)});
 const ri=new THREE.InstancedMesh(rg,fm,rails.length*2);let k=0;rails.forEach(([x,y,v])=>{const ax=x+.5,az=y+.5,bx=x+.5+(v?0:1),bz=y+.5+(v?1:0),h0=hAt(ax,az),h1=hAt(bx,bz);for(const hh of[.25,.55]){D.position.set((ax+bx)/2,(h0+h1)/2+hh,(az+bz)/2);D.rotation.set(0,v?Math.PI/2:0,Math.atan2(v?0:h1-h0,1)*(v?0:1));if(v)D.rotation.set(Math.atan2(h1-h0,1)*-1,Math.PI/2,0,'YXZ');D.updateMatrix();ri.setMatrixAt(k++,D.matrix)}});
 pi.castShadow=ri.castShadow=true;pi.raycast=ri.raycast=()=>{};S.add(pi,ri)}
// v15: real props for village stations (were plain boxes that rendered near-black)
function makeProp(g,t){const W_=0x8a5a32,DK=0x5a3a20,ST=0x8f8a80;const pm=c=>{const m=new THREE.MeshLambertMaterial({color:c});m.emissive.setHex(0x161210);return m};const B=(w,h,d,c,x,y,z,ry)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),pm(c));m.position.set(x,y,z);if(ry)m.rotation.y=ry;m.castShadow=true;g.add(m);return m};
 const glow=(c,x,y,z,s)=>{const m=new THREE.Mesh(new THREE.ConeGeometry(.16*s,.5*s,6),new THREE.MeshBasicMaterial({color:c}));m.position.set(x,y,z);g.add(m);return m};
 if(t==='workbench'){B(1,.1,.6,W_,0,.72,0);for(const [x,z] of [[-.42,-.22],[.42,-.22],[-.42,.22],[.42,.22]])B(.08,.7,.08,DK,x,.35,z);B(.5,.06,.2,0xc8a070,-.1,.8,0,.2);B(.05,.05,.35,0x999999,.3,.8,.05);return 1}
 if(t==='board'){B(.08,1.3,.08,DK,-.4,.65,0);B(.08,1.3,.08,DK,.4,.65,0);B(.95,.6,.06,W_,0,1.05,0);for(let i=0;i<4;i++)B(.18,.22,.01,0xf0e6c8,-.3+i*.2,1.06+(i%2)*.08,.04);B(1.05,.08,.14,DK,0,1.4,0);return 1}
 if(t==='campfire'){for(let i=0;i<8;i++){const a=i/8*6.283;const r=new THREE.Mesh(new THREE.DodecahedronGeometry(.1,0),pm(ST));r.position.set(Math.cos(a)*.32,.06,Math.sin(a)*.32);g.add(r)}B(.6,.09,.09,DK,0,.08,0,.6);B(.6,.09,.09,DK,0,.1,0,-.6);const f1=glow(0xff7a1a,0,.32,0,1),f2=glow(0xffd04a,.04,.28,.03,.6);g.userData.flames=[f1,f2];(window.__B3flames=window.__B3flames||[]).push(f1,f2);return 1}
 if(t==='furnace'){B(.9,1.1,.9,0x6f6a62,0,.55,0);B(.5,.7,.5,0x5a554e,0,1.4,0);const m=new THREE.Mesh(new THREE.PlaneGeometry(.4,.35),new THREE.MeshBasicMaterial({color:0xff6a10}));m.position.set(0,.35,.456);g.add(m);return 1}
 if(t==='anvil'){B(.35,.4,.35,DK,0,.2,0);B(.5,.12,.22,0x3c3f44,0,.46,0);B(.2,.1,.18,0x3c3f44,.3,.48,0);return 1}
 if(t==='well'){const ring=new THREE.Mesh(new THREE.CylinderGeometry(.45,.48,.55,12,1,true),pm(ST));ring.material.side=THREE.DoubleSide;ring.position.y=.27;ring.castShadow=true;g.add(ring);const wtr=new THREE.Mesh(new THREE.CircleGeometry(.42,12),new THREE.MeshLambertMaterial({color:0x2e5e8a}));wtr.rotation.x=-Math.PI/2;wtr.position.y=.3;g.add(wtr);B(.07,1.2,.07,DK,-.42,.85,0);B(.07,1.2,.07,DK,.42,.85,0);B(1,.06,.06,DK,0,1.25,0);const rf=B(1.1,.08,.7,0x7a3a2a,0,1.5,-.15);rf.rotation.x=.45;const rf2=B(1.1,.08,.7,0x7a3a2a,0,1.5,.15);rf2.rotation.x=-.45;return 1}
 if(t==='stall'){B(1.1,.08,.6,W_,0,.75,0);B(1,.7,.5,DK,0,.37,0);for(const x of [-.5,.5])for(const z of [-.27,.27])B(.06,1.5,.06,DK,x,.75,z);for(let i=0;i<5;i++)B(.23,.04,.75,i%2?0xf2ead8:0xb8322a,-.46+i*.23,1.52,0,0).rotation.x=.12;B(.2,.15,.2,0xd8a040,-.3,.87,0);B(.2,.12,.2,0x6a9a3a,0,.86,0);B(.18,.14,.18,0xb06030,.3,.86,0);return 1}
 if(t==='sign'){B(.08,1,.08,DK,0,.5,0);B(.6,.3,.05,W_,0,.9,0);return 1}
 if(t==='bank'){B(1,.9,.6,0x6a4a2a,0,.45,0);B(1.05,.06,.65,0xc8a040,0,.92,0);B(.25,.25,.02,0xe8d080,0,.6,.31);return 1}
 return 0}
const statics=[];M.objs.forEach(o=>{const cx=o.x+.5,cz=o.y+.5,h=hAt(cx,cz);let g=new THREE.Group();
 if(o.type==='door'){const piv=new THREE.Group();const leaf=new THREE.Mesh(new THREE.BoxGeometry(1,1.5,.15),mat(0x6b3d15));leaf.position.set(.5,.75,0);piv.add(leaf);
  // hinge on west edge; door spans tile in X. If walls are E/W of door, it's in a N/S wall
  const ns=[4,12,13].includes(M.t[idx(o.x-1,o.y)])||[4,12,13].includes(M.t[idx(o.x+1,o.y)]);if(!ns){piv.rotation.y=Math.PI/2;piv.position.set(cx,h,o.y+1)}else piv.position.set(o.x,h,cz);g=piv;o.mesh=leaf;o.piv=piv;o.base=piv.rotation.y;doors.push(o)}
 else if(TREES[o.type]){makeTree(g,o);g.position.set(cx,h,cz)}
 else if(ROCK[o.type]){const base=new THREE.Mesh(rockRG,mat(0x7c786f,1));base.position.y=.18;base.rotation.y=o.x*1.7+o.y;base.castShadow=base.receiveShadow=true;const ore=new THREE.Mesh(oreG,mat(ROCK[o.type],1));ore.position.set(.08,.36,.05);ore.scale.setScalar(.55);g.add(base,ore);g.position.set(cx,h,cz)}
 else if(makeProp(g,o.type)){g.position.set(cx,h,cz)}
 else{const b=new THREE.Mesh(boxG,mat(o.type.includes('fishing')?0x66aaff:o.type==='bank'?0xc8a040:0x8a6a4a));b.position.y=.4;if(o.type.includes('fishing')){b.scale.set(.6,.1,.6);b.material=mat(0xaaddff)}g.add(b);g.position.set(cx,h,cz)}
 g.rotation.y+=0;g.traverse(m=>{if(m.isMesh){m.userData.obj=o;objMeshes.push(m)}});o.grp=g;S.add(g);if(TREES[o.type]||ROCK[o.type])statics.push(g)});
// v12 perf: bake static trees/rocks into one merged mesh per (32-tile region x material); originals stay hidden but pickable
{const buckets=new Map();const v=new THREE.Vector3(),n=new THREE.Vector3(),nm=new THREE.Matrix3();
 statics.forEach(g=>{g.updateMatrixWorld(true);const rk=Math.floor(g.position.x/32)+'_'+Math.floor(g.position.z/32);g.userData.mr=[];g.traverse(m=>{if(!m.isMesh)return;const k=rk+'|'+m.material.uuid;let b=buckets.get(k);if(!b)buckets.set(k,b={mat:m.material,p:[],n:[],rs:[]});const r0={start:b.p.length/3,count:0};g.userData.mr.push(r0);b.rs.push(r0);
  const ge=m.geometry.index?m.geometry.toNonIndexed():m.geometry;const P=ge.attributes.position,N=ge.attributes.normal;nm.getNormalMatrix(m.matrixWorld);
  for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(m.matrixWorld);n.fromBufferAttribute(N,i).applyMatrix3(nm).normalize();b.p.push(v.x,v.y,v.z);b.n.push(n.x,n.y,n.z)}r0.count=b.p.length/3-r0.start});g.visible=false});
 for(const b of buckets.values()){const ge=new THREE.BufferGeometry();ge.setAttribute('position',new THREE.Float32BufferAttribute(b.p,3));ge.setAttribute('normal',new THREE.Float32BufferAttribute(b.n,3));b.rs.forEach(r=>r.attr=ge.attributes.position);ge.computeBoundingSphere();const me=new THREE.Mesh(ge,b.mat);me.castShadow=me.receiveShadow=true;me.raycast=()=>{};S.add(me)}
 window.__B3merged={groups:statics.length,meshes:buckets.size}}
// ---- humanoids
// characters come from chars.js (shared rig, kind->model table)
const hsh=s=>{let h=0;for(const ch of s)h=(h*31+ch.charCodeAt(0))|0;return h>>>0};
// ---- entities
const mk=(x,y)=>({x,y,trail:[[x,y]],path:[],yaw:0,tyaw:0,phase:0});
const blobT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,'rgba(0,0,0,.55)');g.addColorStop(.6,'rgba(0,0,0,.25)');g.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=g;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const blobG=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),blobM=new THREE.MeshBasicMaterial({map:blobT,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
const addBlob=(g,r=.95)=>{const b=new THREE.Mesh(blobG,blobM);b.scale.setScalar(r);b.position.y=.03;b.raycast=()=>{};b.renderOrder=2;g.add(b)};
const Pl=Object.assign(mk(...M.pl),{run:false,act:null,name:'You'});Pl.g=makeChar('player');Pl.g.traverse(o=>{if(o.isMesh)o.castShadow=true});addBlob(Pl.g);S.add(Pl.g);
{const PN=new URLSearchParams(location.search).get('pack');if(PN){try{let PK,pk,e0;for(let k=0;k<3&&!pk;k++){try{PK=await import('./packs.js?v=2');pk=await PK.loadPack(PN)}catch(x){e0=x;await new Promise(r=>setTimeout(r,600*(k+1)))}}if(!pk)throw e0;if(!PK.validatePack(pk).length){window.__B3pack=pk;for(const p of pk.place)M.npcs.push({...p})}}catch(e){console.warn('pack',e)}}}
// pb5: more monsters - extra spawns cloned from existing same-kind spawns (stats/drops/model unchanged), placed on free walkable tiles near them; deterministic, no save impact
if(new URLSearchParams(location.search).get('more')!=='0'){const EX={rat:2,mudhen:2,spider:2,cow:2,guard:1,toad:1,boar:1,thornling:1,wolf:1,skeleton:1,zombie:1,bat:1,hillgiant:1,mossgiant:1,wight:1,ogre:1};
 let sd=1337;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;const used=new Set(M.npcs.map(n=>n.x+','+n.y));M.objs.forEach(o=>used.add(o.x+','+o.y));const base=M.npcs.slice();let added=0;
 const okT=(x,y)=>x>0&&y>0&&x<M.W-1&&y<M.H-1&&M.wk[idx(x,y)]===1&&!used.has(x+','+y)&&Math.hypot(x-M.pl[0],y-M.pl[1])>4;
 for(const n of base){if(added>=60)break;const k=EX[n.kind];if(!k||!(n.ops||[]).includes('Attack'))continue;for(let c=0;c<k;c++){for(let t=0;t<30;t++){const x=n.x+Math.round((rnd()*2-1)*5),y=n.y+Math.round((rnd()*2-1)*5);if(okT(x,y)){used.add(x+','+y);M.npcs.push({...n,x,y,extra:1});added++;break}}}}
 window.__B3more={added,total:M.npcs.length}}
const npcs=M.npcs.map(n=>{const e=Object.assign(mk(n.x,n.y),{d:n,sx:n.x,sy:n.y});
 e.g=makeChar(n.look||n.kind);{const id=(n.id??0)*7919+n.x*131+n.y*31+M.npcs.indexOf(n)*977;const rh=k=>{const v=Math.sin(id*12.9898+k*78.233)*43758.5453;return v-Math.floor(v)};const hum=!!(e.g.userData&&e.g.userData.L&&e.g.userData.L.head)||['man','woman','guard','banker','shopkeep','wizard','darkwiz','player'].some(w=>(n.kind||'').includes(w));
 const sc=hum?1+(rh(1)-.5)*.12:1+(rh(1)-.5)*.2;e.g.scale.set(sc*(hum?1+(rh(2)-.5)*.16:1),sc,sc*(hum?1+(rh(2)-.5)*.16:1));e.yaw=e.tyaw=rh(3)*6.283;e.phase=rh(4)*6.283;e.g.userData.tOff=rh(5)*10;
 const mc=new Map();e.g.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;const m=o.material;if(!m||Array.isArray(m)||!m.color)return;let c=mc.get(m);if(!c){c=m.clone();const hsl={};c.color.getHSL(hsl);const k=mc.size+1;const dh=hum?(rh(10+k)-.5)*.08:(rh(10+k)-.5)*.04,ds=(rh(20+k)-.5)*.3,dl=(rh(30+k)-.5)*(hum?.3:.18);c.color.setHSL((hsl.h+dh+1)%1,Math.min(1,Math.max(0,hsl.s*(1+ds))),Math.min(.95,Math.max(.03,hsl.l*(1+dl))));mc.set(m,c)}o.material=c})}e.g.traverse(m=>{if(m.isMesh){m.userData.npc=e;objMeshes.push(m)}});addBlob(e.g,['cow','dragon','gdragon','drake','hillgiant','mossgiant','demon'].includes(n.kind)?1.7:.95);S.add(e.g);return e});
// ---- walkability
const doorAt=(x,y)=>doors.find(o=>o.x===x&&o.y===y);
const walk=(x,y)=>{if(!inb(x,y))return false;const d=doorAt(x,y);if(d)return d.open;return WK[idx(x,y)]===1};
const occupied=(x,y,self)=>npcs.some(n=>n!==self&&n.x===x&&n.y===y);
// ---- v12 gameplay: rules.mjs state G is the single source of truth (player pos/HP/inv/xp/npcs/ground/objects)
const DEF=await loadDefs();const GM=initGame({THREE,S,M,npcs,objs:M.objs,walk,hAt,msg:(t,c)=>msg(t,c),cam,DEF,Pl});const G=GM.G;const FUN=initFun(GM,{msg:(t,c)=>msg(t,c),cfg:CFG});window.__B3fun=FUN;import('./wield.js?v=1').then(W=>{window.__B3wield=W.initWield({THREE,G,Pl,npcs})}).catch(e=>console.warn('wield off',e));import('./ui.js?v=3').then(W=>{window.__B3ui=W.initUI({THREE,G,R:GM.R,DEF,Pl,npcs,msg:(t,c)=>msg(t,c)})}).catch(e=>console.warn('ui off',e));import('./b2.js?v=3').then(W=>{window.__B3b2=W.initB2({THREE,G,R:GM.R,DEF,Pl,npcs,msg:(t,c)=>msg(t,c)})}).catch(e=>console.warn('b2 off',e));import('./fx3.js?v=2').then(W=>{const go=()=>{if(!window.B3||!window.B3.S)return setTimeout(go,300);try{window.__B3fx3=W.initFx({THREE})}catch(e){console.warn('fx3 off',e)}};go()}).catch(e=>console.warn('fx3 off',e));import('./map.js?v=2').then(W=>{const go=()=>{if(!window.B3||!window.B3.M)return setTimeout(go,300);try{window.__B3map=W.initMap()}catch(e){console.warn('map off',e)}};go()}).catch(e=>console.warn('map off',e));import('./models.js?v=1').then(W=>{const go=()=>{if(!window.B3||!window.B3.M)return setTimeout(go,300);try{window.__B3models=W.initModels()}catch(e){console.warn('models off',e)}};go()}).catch(e=>console.warn('models off',e));import('./gfx.js?v=3').then(W=>{const go=()=>{if(!window.B3||!window.B3.S)return setTimeout(go,300);try{window.__B3gfxm=W.initGfx()}catch(e){console.warn('gfx off',e)}};go()}).catch(e=>console.warn('gfx off',e));import('./autoeq.js?v=2').then(W=>{const go=()=>{if(!window.B3||!window.B3.GM||!window.B3.G)return setTimeout(go,300);try{window.__B3autoeq=W.initAutoEq()}catch(e){console.warn('autoeq off',e)}};go()}).catch(e=>console.warn('autoeq off',e));
Pl.x=G.player.x;Pl.y=G.player.y;Pl.trail=[[Pl.x,Pl.y]];npcs.forEach(e=>{if(e.gi!=null){const n=G.npcs[e.gi];e.x=n.x;e.y=n.y;e.trail=[[e.x,e.y]]}});
// ---- A* (8-dir, diagonal rejected if either orthogonal neighbour blocked; Tarnish AStarPathFinder)
function astar(sx,sy,goal,lim=20000){const open=[[0,sx,sy]],g=new Map([[idx(sx,sy),0]]),from=new Map();let n=0;
 while(open.length&&n++<lim){let bi=0;for(let i=1;i<open.length;i++)if(open[i][0]<open[bi][0])bi=i;const [,x,y]=open.splice(bi,1)[0];
  if(goal(x,y)){const p=[];let k=idx(x,y);while(k!==idx(sx,sy)){p.unshift([k%W,Math.floor(k/W)]);k=from.get(k)}return {path:p,found:true}}
  for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){if(!dx&&!dy)continue;const u=x+dx,v=y+dy;if(!walk(u,v))continue;if(dx&&dy&&(!walk(x+dx,y)||!walk(x,y+dy)))continue;
   const ng=g.get(idx(x,y))+(dx&&dy?1.414:1);if(ng<(g.get(idx(u,v))??1e9)){g.set(idx(u,v),ng);from.set(idx(u,v),idx(x,y));open.push([ng,u,v])}}}
 return {path:[],found:false}}
function nearestReachable(tx,ty){if(walk(tx,ty)){const r=astar(Pl.x,Pl.y,(x,y)=>x===tx&&y===ty);if(r.found)return [tx,ty,r.path]}
 // BFS over reachable tiles, choose closest to target
 const seen=new Uint8Array(W*H),q=[[Pl.x,Pl.y]];seen[idx(Pl.x,Pl.y)]=1;let best=[Pl.x,Pl.y],bd=Math.hypot(Pl.x-tx,Pl.y-ty);
 while(q.length){const [x,y]=q.shift();const d=Math.hypot(x-tx,y-ty);if(d<bd){bd=d;best=[x,y]}for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){const u=x+dx,v=y+dy;if((dx||dy)&&walk(u,v)&&!seen[idx(u,v)]&&!(dx&&dy&&(!walk(x+dx,y)||!walk(x,y+dy)))){seen[idx(u,v)]=1;q.push([u,v])}}}
 const r=astar(Pl.x,Pl.y,(x,y)=>x===best[0]&&y===best[1]);return [best[0],best[1],r.path]}
const cheb=(a,b,c,d)=>Math.max(Math.abs(a-c),Math.abs(b-d));
function adjGoal(t,ortho){return (x,y)=>{if(cheb(x,y,t.x,t.y)!==1)return false;const dx=t.x-x,dy=t.y-y;if(dx&&dy){if(ortho)return false;return walk(x+dx,y)&&walk(x,y+dy)}return true}}
// ---- markers
const xm=new THREE.Group();{const b=new THREE.BoxGeometry(.7,.04,.1);const a=new THREE.Mesh(b,new THREE.MeshBasicMaterial({color:0xffff00}));a.rotation.y=Math.PI/4;const c=a.clone();c.rotation.y=-Math.PI/4;xm.add(a,c)}xm.visible=false;S.add(xm);
function markX(x,y,red){xm.children.forEach(m=>m.material.color.set(red?0xff2222:0xffff00));xm.position.set(x+.5,hAt(x+.5,y+.5)+.05,y+.5);xm.visible=true;xm.userData.t=performance.now()}
// ---- actions
function setAct(a){Pl.act=a;Pl.path=[];if(!a)return;
 if(a.kind==='walk'){Pl.path=a.path;return}
 const t=a.kind==='npc'?a.n:a.o;if(cheb(Pl.x,Pl.y,t.x,t.y)===1&&adjGoal(t,a.kind==='obj'&&t.type==='door')(Pl.x,Pl.y))return;
 const r=astar(Pl.x,Pl.y,adjGoal(t,a.kind==='obj'&&t.type==='door'));if(!r.found){msg("I can't reach that!");Pl.act=null;return}Pl.path=r.path}
function faceTo(e,x,y){const dx=Math.sign(x-e.x),dy=Math.sign(y-e.y);if(dx||dy)e.tyaw=Math.atan2(dx,dy)}
function doAct(){const a=Pl.act;const t=a.kind==='npc'?a.n:a.o;faceTo(Pl,t.x,t.y);
 if(a.kind==='npc'){if(a.op==='Talk-to')msg(`<b>${t.d.name}:</b> Greetings, traveller.`);else if(a.op==='Attack')msg(`You attack the ${t.d.name}. (combat arrives in Milestone 2)`);else msg(`You ${a.op.toLowerCase()} the ${t.d.name}.`);Pl.act=null;return}
 const o=t;if(o.type==='door'){o.open=!o.open;msg(o.open?'You open the door.':'You close the door.');Pl.act=null;return}
 const d=M.ND[o.type];msg(`You ${(a.op||'use').toLowerCase()} the ${(d&&d.name)||o.type}.`);Pl.act=null}
// ---- 600ms tick (Tarnish: walk 1, run 2 waypoints per tick; new click replaces queue)
const TICK=600;let lastTick=performance.now(),tickN=0;
function stepEnt(e,max){e.trail=[[e.x,e.y]];let s=0;while(e.path.length&&s<max){const [nx,ny]=e.path[0];if(!walk(nx,ny)){e.path=[];break}const dx=nx-e.x,dy=ny-e.y;if(dx&&dy&&(!walk(e.x+dx,e.y)||!walk(e.x,e.y+dy))){e.path=[];break}e.path.shift();e.x=nx;e.y=ny;e.trail.push([nx,ny]);e.tyaw=Math.atan2(Math.sign(dx),Math.sign(dy));s++}}
function syncEnt(e,nx,ny,pre){const ox=e.x,oy=e.y;e.trail=[[ox,oy]];if(Math.max(Math.abs(nx-ox),Math.abs(ny-oy))>2){e.trail=[[nx,ny]]}else{for(const p of pre){const l=e.trail[e.trail.length-1];if(l[0]===nx&&l[1]===ny)break;if(Math.max(Math.abs(p[0]-l[0]),Math.abs(p[1]-l[1]))===1)e.trail.push([p[0],p[1]])}const l=e.trail[e.trail.length-1];if(l[0]!==nx||l[1]!==ny)e.trail.push([nx,ny])}
 e.x=nx;e.y=ny;if(e.trail.length>1){const a=e.trail[e.trail.length-2];faceTo(e,...[nx+(nx-a[0]),ny+(ny-a[1])])}}
function tick(){tickN++;const P=G.player;const pre=P.path.slice(0,2);
 R0tick();syncEnt(Pl,P.x,P.y,pre);
 if(!P.moving){const n=P.combat!=null?G.npcs[P.combat]:null;if(n)faceTo(Pl,n.x,n.y);else if(P.skill){const o=P.skill.o!=null?G.objs[P.skill.o]:P.skill.npc!=null?G.npcs[P.skill.npc]:null;if(o)faceTo(Pl,o.x,o.y)}}
 for(const n of npcs){if(n.gi!=null){const g=G.npcs[n.gi];syncEnt(n,g.x,g.y,[]);n.g.visible=!g.dead&&Math.max(Math.abs(g.x-P.x),Math.abs(g.y-P.y))<26;if(g.target&&!g.dead)faceTo(n,P.x,P.y);continue}
  n.trail=[[n.x,n.y]];if(n.path.length){stepEnt(n,1);continue}
  if(Math.random()<.03){const dx=Math.floor(Math.random()*3)-1,dy=Math.floor(Math.random()*3)-1,u=n.x+dx,v=n.y+dy;if((dx||dy)&&walk(u,v)&&!(dx&&dy)&&Math.abs(u-n.sx)<=3&&Math.abs(v-n.sy)<=3&&!(u===Pl.x&&v===Pl.y)&&!occupied(u,v,n))n.path=[[u,v]]}}
 GM.afterTick();
 }
function R0tick(){GM.R.tick(G)}
// ---- camera (OSRS-like orbit; only user input changes yaw/pitch/zoom)
const C={yaw:Math.PI,pitch:.75,dist:12,tx:Pl.x+.5,tz:Pl.y+.5,ty:0};{const Y={north:Math.PI,south:0,east:Math.PI/2,west:-Math.PI/2};if(CFG.camera in Y)C.yaw=Y[CFG.camera];if(CFG.zoom)C.dist=CFG.zoom}const DBG=QP.get('dbgcam')==='1';const PMIN=.3,PMAX=DBG?1.56:1.35,DMIN=5,DMAX=DBG?140:26;
const clampC=()=>{C.pitch=Math.min(PMAX,Math.max(PMIN,C.pitch));C.dist=Math.min(DMAX,Math.max(DMIN,C.dist))};
// ---- input
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function pick(sx,sy){ndc.set(sx/innerWidth*2-1,-(sy/innerHeight)*2+1);ray.setFromCamera(ndc,cam);const hit=ray.intersectObjects([...GM.pickables,...objMeshes,...terr],false).find(h=>{const n=h.object.userData.npc;return !(n&&n.gi!=null&&G.npcs[n.gi].dead)&&h.object.visible!==false||h.object.userData.ground});if(!hit)return null;if(hit.object.userData.ground)return {ground:hit.object.userData.ground,tile:[hit.object.userData.ground.x,hit.object.userData.ground.y]};
 if(hit.object.userData.npc)return {npc:hit.object.userData.npc};if(hit.object.userData.obj)return {obj:hit.object.userData.obj};return {tile:[Math.floor(hit.point.x),Math.floor(hit.point.z)]}}
// Rock feedback uses the same node registry as gathering eligibility and rewards.
let nodeNotice=null,nodeNoticeTimer=0;
function showNodeInfo(o){const d=DEF.nodes[o.type];if(!d||d.kind!=='rock')return;
 const level=GM.R.lv(G,d.skill),node=G.objs[o.gi];
 const status=node&&node.dep?'Depleted':level<d.lvl?'Locked':!GM.R.hasTool(G,'pick')?'Pickaxe needed':'Available';
 if(!nodeNotice){nodeNotice=document.createElement('div');nodeNotice.id='b3node';nodeNotice.setAttribute('role','status');nodeNotice.setAttribute('aria-live','polite');nodeNotice.style.cssText='position:fixed;left:calc(8px + env(safe-area-inset-left));right:calc(92px + env(safe-area-inset-right));bottom:calc(82px + env(safe-area-inset-bottom));max-width:360px;z-index:30;background:#211b12f2;border:2px solid #d1ad57;border-radius:8px;padding:9px 11px;color:#fff;font:700 13px/1.5 system-ui,sans-serif;pointer-events:none';document.body.appendChild(nodeNotice)}
 nodeNotice.textContent=`${d.name} · ${status} — Mining ${d.lvl} required · Your level ${level}`;nodeNotice.style.display='block';clearTimeout(nodeNoticeTimer);nodeNoticeTimer=setTimeout(()=>{nodeNotice.style.display='none'},5000)
}
function entries(sx,sy){const p=pick(sx,sy),out=[];if(!p)return out;
 const walkE=t=>({label:'Walk here',fn:()=>{const [x,y]=nearestReachable(t[0],t[1]);markX(x,y);GM.R.walkTo(G,x,y)}});const Rr=GM.R;const nmI=id=>(DEF.items[id]&&DEF.items[id].n)||id;
 const groundE=(tx,ty)=>G.ground.filter(g=>g.x===tx&&g.y===ty).forEach(g=>out.push({label:`Take <span class="o">${nmI(g.id)}${g.n>1?' ('+g.n+')':''}</span>`,fn:()=>{markX(g.x,g.y,1);Rr.pickUp(G,g)}}));
 if(p.ground)groundE(p.ground.x,p.ground.y);
 if(p.npc){const n=p.npc;const gd=n.gi!=null?DEF.npcs[n.d.kind]:null;const ops=gd?(gd.ops||[]):(n.d.ops||[]).filter(o=>o!=='Attack');if(n.gi!=null&&G.npcs[n.gi].dead)ops.length=0;ops.forEach(op=>out.push({label:`${op} <span class="y">${n.d.name}</span>${n.d.lvl?` (level-${n.d.lvl})`:''}`,fn:()=>{markX(n.x,n.y,1);if(op==='Attack'){Rr.attack(G,n.gi);return}const go=()=>{if(op==='Bank'||op==='Trade'){const r=astar(Pl.x,Pl.y,(x,y)=>cheb(x,y,n.x,n.y)<=2&&!(x===n.x&&y===n.y));if(!r.found){msg("I can't reach that!");return}const e=r.path[r.path.length-1];if(e)Rr.walkTo(G,e[0],e[1]);return}if(n.gi!=null)Rr.setAct(G,{kind:'npc',op,n:n.gi});else{const r=astar(Pl.x,Pl.y,adjGoal(n,false));const e=r.path[r.path.length-1];if(e)Rr.walkTo(G,e[0],e[1])}};go();GM.want({x:n.x,y:n.y,r:2,ui:op==='Bank'?'bank':op==='Trade'?'shop':null,fn:op==='Talk-to'&&n.gi==null?()=>msg(`<b>${n.d.name}:</b> Greetings, traveller.`):null})}}));out.push(walkE([n.x,n.y]));out.push({label:`Examine <span class="y">${n.d.name}</span>`,fn:()=>msg(`It's a ${n.d.name}.`)})}
 else if(p.obj){const o=p.obj,d=M.ND[o.type]||{name:o.type,ops:['Use'],ex:''};const ops=o.type==='door'?[o.open?'Close':'Open']:d.ops||['Use'];ops.forEach(op=>out.push({label:`${op} <span class="c">${d.name}</span>`,fn:()=>{markX(o.x,o.y,1);if(DEF.nodes[o.type]?.kind==='rock'){showNodeInfo(o);if(op==='Prospect')return}if(o.type==='door'){const r=astar(Pl.x,Pl.y,adjGoal(o,true));const e=r.found?(r.path[r.path.length-1]||[Pl.x,Pl.y]):null;if(!e){msg("I can't reach that!");return}Rr.walkTo(G,e[0],e[1]);GM.want({x:o.x,y:o.y,fn:()=>{o.open=!o.open;msg(o.open?'You open the door.':'You close the door.')}});return}
  Rr.setAct(G,{kind:'obj',op:op==='Cook'||op==='Steal-from'||op==='Pray-at'||op==='Look-in'?op:'use',o:o.gi});const nd=DEF.nodes[o.type]||{};const ported=['Cook','Steal-from','Pray-at','Look-in'].includes(op);if(o.type==='bank')GM.want({x:o.x,y:o.y,ui:'bank'});else if(o.type==='stall'&&op!=='Steal-from')GM.want({x:o.x,y:o.y,r:3,ui:'shop'});else if(!nd.skill&&!ported)GM.want({x:o.x,y:o.y,fn:()=>msg(nd.ex||`You ${op.toLowerCase()} the ${d.name}.`)})}}));out.push(walkE([o.x,o.y]));out.push({label:`Examine <span class="c">${d.name}</span>`,fn:()=>msg(d.ex||d.name)})}
 else{groundE(p.tile[0],p.tile[1]);out.push(walkE(p.tile))}
 out.push({label:'Cancel',fn:()=>{}});return out}
const menu=$('#menu');function openMenu(sx,sy){const es=entries(sx,sy);menu.innerHTML='<div class="h">Choose Option</div>'+es.map((e,i)=>`<div class="e" data-i="${i}">${e.label}</div>`).join('');menu.style.display='block';menu.style.left=Math.min(sx,innerWidth-170)+'px';menu.style.top=Math.min(sy,innerHeight-menu.offsetHeight-4)+'px';menu.onclick=ev=>{const i=ev.target.closest('.e')?.dataset.i;if(i!=null)es[+i].fn();menu.style.display='none'}}
const ptrs=new Map();let dn=null,lp=null,pinch0=null,gest=null;const TAPMOVE=10;
// Gesture = from first pointer down until ALL pointers are up. A walk tap is valid only if exactly one pointer was down the whole gesture,
// it moved < TAPMOVE px, no long-press menu opened, and the gesture did not start by dismissing UI (menu/inventory).
window.__B3gest={taps:0,rejected:0,last:''};
const endPtr=id=>{ptrs.delete(id);if(ptrs.size<2)pinch0=null;if(ptrs.size===0){clearTimeout(lp);gest=null;dn=null}};
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('pointerdown',e=>{e.preventDefault();try{cv.setPointerCapture(e.pointerId)}catch(_){}ptrs.set(e.pointerId,[e.clientX,e.clientY]);
 if(!gest){const inv=$('#inv');const ui=menu.style.display==='block'||(inv&&inv.style.display==='grid');gest={max:0,dismiss:ui};menu.style.display='none';if(inv&&ui)inv.style.display='none'}
 gest.max=Math.max(gest.max,ptrs.size);
 if(ptrs.size>=2){const [a,b]=[...ptrs.values()];pinch0=[Math.hypot(a[0]-b[0],a[1]-b[1]),C.dist,Math.atan2(b[1]-a[1],b[0]-a[0]),C.yaw];clearTimeout(lp);dn=null;return}
 if(e.button===2){openMenu(e.clientX,e.clientY);gest.menu=1;dn=null;return}
 dn={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,drag:false};lp=setTimeout(()=>{if(dn&&!dn.drag&&gest&&gest.max===1){openMenu(dn.x,dn.y);gest.menu=1;dn=null}},480)});
cv.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);
 if(pinch0&&ptrs.size===2){const [a,b]=[...ptrs.values()];C.dist=pinch0[1]*pinch0[0]/Math.max(20,Math.hypot(a[0]-b[0],a[1]-b[1]));const da=Math.atan2(b[1]-a[1],b[0]-a[0])-pinch0[2];if(Math.abs(da)>.25)C.yaw=pinch0[3]-da;clampC();return}
 if(!dn||ptrs.size!==1)return;if(!dn.drag&&Math.hypot(e.clientX-dn.x,e.clientY-dn.y)>TAPMOVE){dn.drag=true;clearTimeout(lp)}
 if(dn.drag){C.yaw-=(e.clientX-dn.lx)*.008;C.pitch+=(e.clientY-dn.ly)*.006;clampC();dn.lx=e.clientX;dn.ly=e.clientY}});
cv.addEventListener('pointerrawupdate',e=>{if(dn&&!dn.drag&&ptrs.size===1&&ptrs.has(e.pointerId)&&Math.hypot(e.clientX-dn.x,e.clientY-dn.y)>TAPMOVE){dn.drag=true;clearTimeout(lp)}});
cv.addEventListener('pointerup',e=>{if(!ptrs.has(e.pointerId))return;const g=gest,d=dn;const last=ptrs.size===1;
 if(last&&g&&d){const ok=g.max===1&&!d.drag&&Math.hypot(e.clientX-d.x,e.clientY-d.y)<=TAPMOVE&&!g.menu&&!g.dismiss;if(ok){window.__B3gest.taps++;const es=entries(d.x,d.y);if(es[0]&&es[0].label!=='Cancel')es[0].fn()}else{window.__B3gest.rejected++;window.__B3gest.last=JSON.stringify({max:g.max,drag:d.drag,menu:!!g.menu,dismiss:g.dismiss})}}
 else if(last&&g)window.__B3gest.rejected++;
 endPtr(e.pointerId)});
const kill=e=>{if(!ptrs.has(e.pointerId))return;if(gest)gest.max=9;dn=null;clearTimeout(lp);endPtr(e.pointerId)};
cv.addEventListener('pointercancel',kill);cv.addEventListener('lostpointercapture',e=>{if(ptrs.has(e.pointerId))kill(e)});
const resetInput=()=>{for(const k in keys)keys[k]=0;clearTimeout(lp);ptrs.clear();pinch0=null;gest=null;dn=null};window.__B3inp=()=>({ptrs:ptrs.size,gest:!!gest,dn:!!dn,pinch:!!pinch0});addEventListener('blur',resetInput);document.addEventListener('visibilitychange',()=>{if(document.hidden)resetInput()});
document.addEventListener('dblclick',e=>e.preventDefault(),{passive:false});document.addEventListener('gesturestart',e=>e.preventDefault(),{passive:false});
cv.addEventListener('wheel',e=>{e.preventDefault();C.dist*=Math.exp(e.deltaY*.001);clampC()},{passive:false});
const keys={};addEventListener('keydown',e=>keys[e.key]=1);addEventListener('keyup',e=>keys[e.key]=0);
$('#run').onclick=()=>{G.player.run=!G.player.run&&G.player.energy>0;$('#run').classList.toggle('on',G.player.run)};$('#hp').onclick=()=>{const i=G.player.inv.findIndex(x=>x&&DEF.items[x.id].eat);if(i>=0)GM.uiItemAction(i,'Eat');else msg('You have no food.')};

window.__B3wind=window.__B3wind||{value:0};// ---- v8 decor: sparse instanced grass/flowers/stones on grass tiles; NOT pickable, NOT in collision
{const hs=(x,z,s)=>{const n=Math.sin(x*12.9898+z*78.233+s*37.719)*43758.5453;return n-Math.floor(n)};const sp=[],fl=[],st=[];
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){if(M.t[idx(x,y)]!==0||!walk(x,y)||F.bil(F.wm,x+.5,y+.5)>.08)continue;const r=hs(x,y,1);const GT=HD?.45:.2;if(r<GT)sp.push([x+.15+.7*hs(x,y,2),y+.15+.7*hs(x,y,3)]);else if(r<GT+.035)fl.push([x+.2+.6*hs(x,y,4),y+.2+.6*hs(x,y,5)]);else if(r<GT+.05)st.push([x+.25+.5*hs(x,y,6),y+.25+.5*hs(x,y,7)])}
 const D=new THREE.Object3D(),put=(geo,mat,arr,sc)=>{if(!arr.length)return;const im=new THREE.InstancedMesh(geo,mat,arr.length),tint=new THREE.Color();arr.forEach(([x,z],i)=>{const k=hs(x,z,9);D.position.set(x,hAt(x,z),z);D.rotation.set(0,k*6.28,0);D.scale.setScalar(sc*(.7+.6*k));D.updateMatrix();im.setMatrixAt(i,D.matrix);tint.setHSL(.12+hs(x,z,12)*.16,.12,.68+hs(x,z,13)*.2);im.setColorAt(i,tint)});im.receiveShadow=true;im.raycast=()=>{};im.computeBoundingSphere();S.add(im)};
 const tuft=new THREE.ConeGeometry(.06,.28,4,1,true);tuft.translate(0,.14,0);const t2=tuft.clone().rotateZ(.35).translate(.05,0,0),t3=tuft.clone().rotateZ(-.35).translate(-.05,0,0);
 const mg=(gs)=>{const out=new THREE.BufferGeometry();const ps=[];gs.forEach(g=>{const n=g.toNonIndexed();ps.push(...n.attributes.position.array)});out.setAttribute('position',new THREE.Float32BufferAttribute(ps,3));out.computeVertexNormals();return out};
 const gm=new THREE.MeshLambertMaterial({color:0x719c48,side:THREE.DoubleSide});gm.onBeforeCompile=sh=>{sh.uniforms.uT=window.__B3wind;sh.vertexShader='uniform float uT;varying float vBladeHeight;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n float hgt=max(position.y,0.);vBladeHeight=clamp(hgt/.28,0.,1.);vec4 wp=instanceMatrix*vec4(0,0,0,1);transformed.x+=sin(uT*1.7+wp.x*.6+wp.z*.4)*.06*hgt*4.;transformed.z+=cos(uT*1.3+wp.z*.5)*.04*hgt*4.;');sh.fragmentShader='varying float vBladeHeight;\n'+sh.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\n diffuseColor.rgb*=mix(vec3(.52,.65,.43),vec3(1.12,1.08,.85),vBladeHeight);')};put(mg([tuft,t2,t3]),gm,sp,1);
 const fg=new THREE.IcosahedronGeometry(.05,0);fg.translate(0,.12,0);put(fg,new THREE.MeshLambertMaterial({color:0xf2e36b}),fl.filter((_,i)=>i%2),1);put(fg,new THREE.MeshLambertMaterial({color:0xe9a3c9}),fl.filter((_,i)=>!(i%2)),1);
 const sg=new THREE.DodecahedronGeometry(.12,0);sg.scale(1,.55,1);put(sg,new THREE.MeshLambertMaterial({color:0x8a8a82,flatShading:true}),st,1);window.__B3decor={grass:sp.length,flowers:fl.length,stones:st.length}}
// ---- minimap
const mm=$('#mm'),mx=mm.getContext('2d');const mapC=document.createElement('canvas');mapC.width=W;mapC.height=H;{const c=mapC.getContext('2d'),COL={0:'#568c3e',1:'#967e58',2:'#28568c',3:'#cebe82',4:'#787068',5:'#8c6c48',6:'#828280',7:'#6e6860',8:'#82603c',9:'#8a6a3e',10:'#60964a',12:'#9c7448',13:'#827c70'};for(let y=0;y<H;y++)for(let x=0;x<W;x++){c.fillStyle=COL[M.t[idx(x,y)]]||'#555';c.fillRect(x,y,1,1)}}
function drawMM(){const s=4;mx.setTransform(1,0,0,1,0,0);mx.fillStyle='#000';mx.fillRect(0,0,280,280);mx.save();mx.beginPath();mx.arc(140,140,138,0,7);mx.clip();mx.translate(140,140);mx.rotate(C.yaw-Math.PI);mx.scale(s*2,s*2);mx.translate(-Pl.g.position.x,-Pl.g.position.z);mx.imageSmoothingEnabled=false;mx.drawImage(window.__B3mapC||mapC,0,0,W,H);
 mx.fillStyle='#ff0';for(const n of npcs)mx.fillRect(n.g.position.x-.3,n.g.position.z-.3,.6,.6);if(window.__B3mmIcons)try{window.__B3mmIcons(mx,C.yaw-Math.PI)}catch(e){}mx.restore();mx.fillStyle='#fff';mx.fillRect(137,137,6,6)}
// ---- render loop
let last=performance.now();ov.style.display='none';window.__B3ready=1;{const b=document.getElementById('boot');if(b)b.remove()}msg('Welcome to Bramblewick 3D. Tap to walk; drag to rotate; pinch/scroll to zoom; hold for options.','y');
function ent(e,t,now,dt){const tr=e.trail,seg=tr.length-1;let x,y;if(seg<1){x=e.x+.5;y=e.y+.5}else{const f=Math.min(seg,t*seg),i=Math.min(seg-1,Math.floor(f)),k=f-i;x=tr[i][0]+(tr[i+1][0]-tr[i][0])*k+.5;y=tr[i][1]+(tr[i+1][1]-tr[i][1])*k+.5}
 e.g.position.set(x,hAt(x,y),y);let d=e.tyaw-e.yaw;d=Math.atan2(Math.sin(d),Math.cos(d));e.yaw+=d*Math.min(1,dt*12);e.g.rotation.y=e.yaw;
 {const p=e.g.position,q=e.lp||(e.lp=p.clone());const dist=Math.hypot(p.x-q.x,p.z-q.z);q.copy(p);animate(e,dist<1.5?dist:0,dt,now/1000,seg>1)}}
function loop(now){if(dead)return;try{frame(now)}catch(e){fail(e);return}requestAnimationFrame(loop)}
function frame(now){try{roofFade();if(window.__B3flames)for(const f of window.__B3flames){f.scale.y=.85+.25*Math.sin(now/90+f.position.x*40);f.rotation.y=now/400}}catch(e){}let n=0;while(now-lastTick>=TICK&&n<5){lastTick+=TICK;tick();n++}if(now-lastTick>TICK*5)lastTick=now;
 const dt=Math.min(.1,(now-last)/1000);last=now;const t=Math.min(1,(now-lastTick)/TICK);
 if(keys.ArrowLeft)C.yaw+=dt*1.8;if(keys.ArrowRight)C.yaw-=dt*1.8;if(keys.ArrowUp)C.pitch+=dt;if(keys.ArrowDown)C.pitch-=dt;clampC();
 ent(Pl,t,now,dt);for(const e of npcs)ent(e,t,now,dt);
 for(const o of doors){const want=o.base+(o.open?-Math.PI/2:0);o.piv.rotation.y+=(want-o.piv.rotation.y)*Math.min(1,dt*10)}
 if(xm.visible&&now-xm.userData.t>1200)xm.visible=false;
 const k=1-Math.exp(-dt*12);C.tx+=(Pl.g.position.x-C.tx)*k;C.tz+=(Pl.g.position.z-C.tz)*k;C.ty+=(Pl.g.position.y+1-C.ty)*k;
 cam.position.set(C.tx+Math.sin(C.yaw)*Math.cos(C.pitch)*C.dist,C.ty+Math.sin(C.pitch)*C.dist,C.tz+Math.cos(C.yaw)*Math.cos(C.pitch)*C.dist);cam.lookAt(C.tx,C.ty,C.tz);
 R.render(S,cam);GM.frame(now);if((tickN&1)||!drawMM.f){drawMM();drawMM.f=1}}
requestAnimationFrame(loop);
window.B3={proj:(x,z)=>{const v=new THREE.Vector3(x,hAt(x,z)+.5,z).project(cam);return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]},ents:entries,GM,G,THREE,S,TR,F,poolStats,Pl,npcs,C,M,walk,astar,hAt,cam,tap:(x,y)=>{const es=entries(x,y);es[0]&&es[0].fn()},proj:(wx,wz)=>{const v=new THREE.Vector3(wx,hAt(wx,wz),wz).project(cam);return [(v.x+1)/2*innerWidth,(1-v.y)/2*innerHeight]},doors};
})().catch(fail);
