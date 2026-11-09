// Bramblewick: original procedural scenery and character meshes over the existing playable map.
import * as THREE from '../assets/three.module.min.js?v=14';
import {makeChar,animate as bwAnim,humanoid as bwHum,quad as bwQuad,bird as bwBird} from '../chars69.js?v=69';
import {TARNISH_COMBAT,tarnishDropRows} from './tarnish-data67.js?v=67';
import {mobilePreferences,setItemTapOptions,initMobileControls} from './mobile75.js?v=75';
// Keep the v47 chars.js player as a startup fallback. The custom model is
// optional so a missing/stale own-models.js cannot prevent the world loading.
let buildAdventurer=null,adventurerPalette=null;
try{const own=await import('./fantasy78.js?v=78');buildAdventurer=own.buildAdventurer||null;adventurerPalette=own.tierPalette||null}
catch(e){console.warn('custom adventurer model unavailable; using built-in model',e)}
import {emitScenery} from './scenery79.js?v=79';
import {createTree,addTownDetails} from './fantasy78.js?v=78';
const Q=new URLSearchParams(location.search),MP_ON=Q.get('mp')!=='0';
(window.__B3mods=window.__B3mods||{}).om=1;
const $=id=>document.getElementById(id),TICK=600;
const ls=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lset=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
function hs(x,z,s=0){let h=(Math.imul(x|0,374761393)+Math.imul(z|0,668265263)+Math.imul(s|0,982451653))>>>0;h=Math.imul(h^(h>>>13),1274126177)>>>0;return((h^(h>>>16))>>>0)/4294967296}
function vn(x,z){const xi=Math.floor(x),zi=Math.floor(z);let fx=x-xi,fz=z-zi;fx=fx*fx*(3-2*fx);fz=fz*fz*(3-2*fz);const a=hs(xi,zi),b=hs(xi+1,zi),c=hs(xi,zi+1),d=hs(xi+1,zi+1);return a+(b-a)*fx+(c-a)*fz+(a-b-c+d)*fx*fz}
const rnd=n=>Math.floor(Math.random()*n);
// ---------------- load cache-derived world ----------------
const WV='68',U=p=>new URL(p+'?v='+WV,import.meta.url).href;
{const l=$('loadmsg');if(l)l.textContent='Loading full Lumbridge region…'}
const [WD,TB,ATL]=await Promise.all([fetch(U('w/world.json')).then(r=>r.json()),fetch(U('w/terrain.bin')).then(r=>r.arrayBuffer()),
 new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=U('w/texatlas.png')})]);
const TE=WD.ter,SZ=TE.S,S1=SZ+1,W=SZ,H=SZ,BX=TE.bx,BY=TE.by;
const ta=(T,k)=>new T(TB,TE[k][0],TE[k][1]);
const TH=ta(Int16Array,'h'),TLT=ta(Uint8Array,'lt'),TUB=ta(Uint16Array,'ub'),TOH=ta(Uint16Array,'oh'),TOT=ta(Int8Array,'ot'),TSH=ta(Uint8Array,'sh'),TRT=ta(Uint8Array,'rt'),COL=ta(Uint8Array,'col');
// game tile (x,z): x east, z south.  OSRS local (x, y=S-1-z).
const I=(x,z)=>z*W+x,inb=(x,z)=>x>=0&&z>=0&&x<W&&z<H,oi=(x,z)=>(SZ-1-z)*SZ+x;
const TT={VOID:0,GRASS:1,PATH:2,WATER:3,BRIDGE:4,FLOOR:5,WALL:6,FENCE:7,SAND:8,HUT:9,TOWER:10,COUNTER:11};
const block=new Uint8Array(W*H);
const hasFloor=(x,z)=>{const i=oi(x,z);return TUB[i]||TOH[i]};
const tt=(x,z)=>!inb(x,z)?TT.VOID:(COL[oi(x,z)]&1)?TT.WALL:TT.GRASS;
const walkable=(x,z)=>inb(x,z)&&!(COL[oi(x,z)]&1)&&!block[I(x,z)]&&!!hasFloor(x,z);
const EB=(dx,dz)=>dx>0?8:dx<0?2:dz>0?16:4; // wall edge bit on the source tile (OSRS: W2 N4 E8 S16; game +z = south)
const cstep=(x,z,dx,dz)=>walkable(x+dx,z+dz)&&!(COL[oi(x,z)]&EB(dx,dz));
const stepOK=(x,z,dx,dz)=>!(dx&&dz)?cstep(x,z,dx,dz):(walkable(x+dx,z+dz)&&cstep(x,z,dx,0)&&cstep(x+dx,z,0,dz)&&cstep(x,z,0,dz)&&cstep(x,z+dz,dx,0));
const vh=(vx,vy)=>TH[Math.min(SZ,Math.max(0,vy))*S1+Math.min(SZ,Math.max(0,vx))];
function hAt(px,pz){px=Math.min(W-.001,Math.max(0,px));pz=Math.min(H-.001,Math.max(0,pz));const vx=px,vy=SZ-pz,x=Math.floor(vx),y=Math.floor(vy),fx=vx-x,fy=vy-y;
 const a=vh(x,y),b=vh(x+1,y),c=vh(x,y+1),d=vh(x+1,y+1);return (a*(1-fx)*(1-fy)+b*fx*(1-fy)+c*(1-fx)*fy+d*fx*fy)/128}
// ---------------- renderer ----------------
const cv=$('c'),R=new THREE.WebGLRenderer({canvas:cv,antialias:true,powerPreference:'high-performance'});
let CHAOS=ls('bwl.chaos')!=='0';
let HD3D=true;try{const savedQuality=localStorage.getItem('bwl.hd3d');if(savedQuality!==null)HD3D=savedQuality==='1'}catch(_){}
const qualityUniform={value:HD3D?1:0};
function applyGraphicsQuality(){
 const mobile=matchMedia('(pointer:coarse)').matches,limit=mobile?(HD3D?2:1.25):(HD3D?2.25:1.65);
 // Bound framebuffer cost on tablets while keeping small phone screens sharp.
 const budget=mobile?(HD3D?4000000:2000000):(HD3D?6000000:3500000);
 const ratio=Math.min(devicePixelRatio||1,limit,Math.sqrt(budget/Math.max(1,innerWidth*innerHeight)));
 qualityUniform.value=HD3D?1:0;R.setPixelRatio(ratio);R.setSize(innerWidth,innerHeight,false);
}
applyGraphicsQuality();R.outputColorSpace=THREE.SRGBColorSpace;R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.08;
const S=new THREE.Scene();{const c=document.createElement('canvas');c.width=2;c.height=256;const x=c.getContext('2d'),g=x.createLinearGradient(0,0,0,256);g.addColorStop(0,'#6595bf');g.addColorStop(.48,'#a9cbdc');g.addColorStop(.82,'#e6d7b0');g.addColorStop(1,'#9dcbd2');x.fillStyle=g;x.fillRect(0,0,2,256);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;S.background=t}
const cam=new THREE.PerspectiveCamera(45,1,.3,200);
S.add(new THREE.HemisphereLight(0xc7e9ff,0x6f4154,1.6));const sun=new THREE.DirectionalLight(0xffd49a,1.7);sun.position.set(-20,40,25);S.add(sun);
function canvasTex(N,fn,rep=1){const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d');fn(x,N);const t=new THREE.CanvasTexture(c);t.magFilter=THREE.NearestFilter;t.minFilter=THREE.NearestMipmapNearestFilter;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.repeat.set(rep,rep);return t}
const noiseFill=(lo,hi,s)=>(x,N)=>{for(let j=0;j<N;j++)for(let i=0;i<N;i++){const v=lo+(hi-lo)*hs(i,j,s);x.fillStyle=`rgb(${v|0},${v|0},${v|0})`;x.fillRect(i,j,1,1)}};
const riverTex=(x,N)=>{const makeGrid=(m,s)=>Array.from({length:m},(_,j)=>Array.from({length:m},(_,i)=>hs(i,j,s))),g8=makeGrid(8,91),g16=makeGrid(16,92),vnoise=(grid,m,u,v)=>{const a=u*m,b=v*m,ix=Math.floor(a),iy=Math.floor(b),fx=a-ix,fy=b-iy,sx=fx*fx*(3-2*fx),sy=fy*fy*(3-2*fy),p=(xx,yy)=>grid[(yy+m)%m][(xx+m)%m],n0=p(ix,iy)*(1-sx)+p(ix+1,iy)*sx,n1=p(ix,iy+1)*(1-sx)+p(ix+1,iy+1)*sx;return n0*(1-sy)+n1*sy};
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const u=i/N,v=j/N,w=.68*vnoise(g8,8,u,v)+.32*vnoise(g16,16,u,v)+.035*Math.sin(Math.PI*2*(3*u+Math.sin(Math.PI*4*v)*.08)),h=Math.max(0,Math.min(1,w)),flow=(.5+.5*Math.sin((u*3.2+v*.58+vnoise(g8,8,u,v)*.12)*Math.PI*2)),crest=Math.pow(Math.max(0,flow-.91),3),gl=h>.72?(h-.72)*55:0,r=18+h*20+crest*15|0,gg=78+h*55+gl+crest*45|0,b=103+h*51+gl+crest*55|0;x.fillStyle=`rgb(${r},${gg},${b})`;x.fillRect(i,j,1,1)}};
const groundFill=(x,N)=>{for(let j=0;j<N;j++)for(let i=0;i<N;i++){const broad=hs(i>>3,j>>3,34),clump=hs(i>>1,j>>1,35),grain=hs(i,j,33),v=210+(grain*24|0)+(clump>.63?7:0)+(broad>.72?5:0);x.fillStyle=`rgb(${v},${v},${v})`;x.fillRect(i,j,1,1)}
 for(let k=0;k<270;k++){const px=hs(k,2,37)*N,py=hs(k,3,38)*N,len=1+hs(k,4,39)*6;x.fillStyle=k%4?'rgba(49,67,36,.14)':'rgba(125,94,55,.13)';x.fillRect(px,py,len,1)}};
const groundTexture=()=>{const t=canvasTex(128,groundFill);t.colorSpace=THREE.NoColorSpace;t.magFilter=THREE.LinearFilter;t.minFilter=THREE.LinearMipmapLinearFilter;t.anisotropy=Math.min(4,R.capabilities.getMaxAnisotropy());return t};
const TX={water:canvasTex(64,riverTex),ground:groundTexture(),stone:canvasTex(8,noiseFill(200,240,4)),wood:canvasTex(8,noiseFill(200,240,5)),leaf:canvasTex(8,noiseFill(200,255,10))};
TX.water.magFilter=THREE.LinearFilter;TX.water.minFilter=THREE.LinearMipmapLinearFilter;TX.water.anisotropy=Math.min(2,R.capabilities.getMaxAnisotropy());
const MC={};const lam=(c,o={})=>{const k=c+JSON.stringify(o);return MC[k]||(MC[k]=new THREE.MeshLambertMaterial(Object.assign({color:c,flatShading:true},o)))};
const boxG=(sx,sy,sz)=>new THREE.BoxGeometry(sx,sy,sz);
const C=new THREE.Color(),D=new THREE.Object3D();
function inst(geo,mat,list,fn,colorFn){const m=new THREE.InstancedMesh(geo,mat,Math.max(1,list.length));list.forEach((o,i)=>{fn(o,D);D.updateMatrix();m.setMatrixAt(i,D.matrix);if(colorFn)m.setColorAt(i,C.setHex(colorFn(o,i)))});m.count=list.length;S.add(m);return m}
const reset=()=>{D.position.set(0,0,0);D.rotation.set(0,0,0);D.scale.set(1,1,1)};
const stoneM=lam(0x8f8c86);
// ---------------- OSRS palette + lighting ----------------
const PALB=new Uint8Array(65536*3);{const br=0.78;for(let j=0;j<65536;j++){const h=(j>>10&63)/64+.0078125,s=(j>>7&7)/8+.0625,l=(j&127)/128;let r=l,g=l,b=l;
 if(s!==0){const q=l<.5?l*(1+s):l+s-l*s,p=2*l-q;const f=t=>{if(t>1)t-=1;if(t<0)t+=1;return 6*t<1?p+(q-p)*6*t:2*t<1?q:3*t<2?p+(q-p)*(2/3-t)*6:p};r=f(h+1/3);g=f(h);b=f(h-1/3)}
 PALB[j*3]=Math.min(255,Math.pow(r,br)*256);PALB[j*3+1]=Math.min(255,Math.pow(g,br)*256);PALB[j*3+2]=Math.min(255,Math.pow(b,br)*256)}}
const lc=(hsl,L)=>{let l=((hsl&127)*L)>>7;l=l<2?2:l>126?126:l;return (hsl&0xff80)|l};
// ---------------- atlas shader material ----------------
const atlasT=new THREE.Texture(ATL);atlasT.flipY=false;atlasT.magFilter=THREE.NearestFilter;atlasT.minFilter=THREE.NearestFilter;atlasT.generateMipmaps=false;atlasT.colorSpace=THREE.NoColorSpace;atlasT.needsUpdate=true;
function applyTextureQuality(){
 // Keep mipmaps off for this packed atlas: shared mip levels bleed adjacent cells.
 atlasT.magFilter=atlasT.minFilter=HD3D?THREE.LinearFilter:THREE.NearestFilter;atlasT.needsUpdate=true;
 TX.ground.anisotropy=Math.min(HD3D?8:2,R.capabilities.getMaxAnisotropy());TX.ground.needsUpdate=true;
 TX.water.anisotropy=Math.min(HD3D?4:1,R.capabilities.getMaxAnisotropy());TX.water.needsUpdate=true;
}
applyTextureQuality();
const FOG={c:new THREE.Color(0x9dcbd2),r:new THREE.Vector2(64,116)};
function osMat(opts={}){return new THREE.ShaderMaterial({uniforms:{atlas:{value:atlasT},groundTex:{value:TX.ground},fogC:{value:FOG.c},fogR:{value:FOG.r},tm:{value:0},flash:{value:0},hdQuality:qualityUniform,terrainFx:{value:opts.terrain?1:0}},side:opts.side??THREE.DoubleSide,
 vertexShader:`attribute vec3 color;attribute vec2 tuv;attribute float tsl;varying vec3 vC;varying vec2 vU;varying float vS;varying float vD;uniform float tm;
 void main(){vC=color;vU=tuv;vS=tsl;if(tsl>-.5&&(abs(tsl-(${(WD.wslot??-9).toFixed(1)}))<.1))vU+=vec2(0.,tm*.6);vec4 mv=modelViewMatrix*vec4(position,1.);vD=-mv.z;gl_Position=projectionMatrix*mv;}`,
 fragmentShader:`uniform sampler2D atlas;uniform sampler2D groundTex;uniform vec3 fogC;uniform vec2 fogR;uniform float flash;uniform float hdQuality;uniform float terrainFx;varying vec3 vC;varying vec2 vU;varying float vS;varying float vD;
 void main(){vec3 c=vC;if(vS>-.5){float s=floor(vS+.5);vec2 cell=vec2(mod(s,16.),floor(s/16.));vec2 u=fract(vU);vec4 t=texture2D(atlas,(cell*64.+.5+u*63.)/vec2(1024.,512.));if(t.a<.5)discard;c*=t.rgb*1.15;}
 c=pow(max(c,vec3(0.0)),vec3(.9));float lum=dot(c,vec3(.299,.587,.114));c=mix(vec3(lum),c,1.2);float band=floor(lum*7.+.5)/7.;c*=mix(band,lum,hdQuality*.75)/max(lum,.10);c*=mix(vec3(.91,.97,1.06),vec3(1.1,1.035,.88),smoothstep(.16,.94,lum));
 if(terrainFx>.5&&vS< -1.5){vec3 fine=texture2D(groundTex,vU).rgb;float macro=texture2D(groundTex,vU*.105+vec2(.17,.41)).r;float patchNoise=texture2D(groundTex,vU*.34+vec2(.61,.13)).g;float grass=smoothstep(.035,.16,c.g-max(c.r,c.b)*.42);float soilNoise=(fine.r-.5)*.10+(patchNoise-.5)*.11+(macro-.5)*.12;vec3 varied=c*(1.+soilNoise);varied*=mix(vec3(.88,.84,.73),vec3(1.04,1.02,.94),smoothstep(.34,.72,patchNoise));float worn=smoothstep(.58,.76,macro)*grass*.20;varied=mix(varied,varied*vec3(.72,.68,.56),worn);float lush=smoothstep(.58,.76,patchNoise)*grass*.12;varied=mix(varied,varied*vec3(.91,1.08,.78),lush);c=varied;}
 if(terrainFx<.5){float neutral=1.-smoothstep(.035,.20,max(c.r,max(c.g,c.b))-min(c.r,min(c.g,c.b)));vec3 stone=mix(vec3(.20,.25,.37),vec3(.85,.78,.63),smoothstep(.03,.85,lum));c=mix(c,stone,neutral*.65);}else{float green=smoothstep(.04,.22,c.g-max(c.r,c.b)*.7);c=mix(c,c*vec3(.72,1.08,1.15)+vec3(.025,.015,.025),green*.55);}
 c=clamp(c,0.,1.);c=mix(c,vec3(.92,.12,.09),flash);float f=smoothstep(fogR.x,fogR.y,vD);gl_FragColor=vec4(mix(c,fogC,f),1.);}`})}
const WMAT=osMat();
// geometry accumulator
class Acc{constructor(){this.p=[];this.c=[];this.u=[];this.s=[];this.own=[]}
 v(x,y,z,r,g,b,u,w,s){this.p.push(x,y,z);this.c.push(r,g,b);this.u.push(u,w);this.s.push(s)}
 geo(){const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(this.p,3));g.setAttribute('color',new THREE.Float32BufferAttribute(this.c,3));
  g.setAttribute('tuv',new THREE.Float32BufferAttribute(this.u,2));g.setAttribute('tsl',new THREE.Float32BufferAttribute(this.s,1));g.computeBoundingSphere();g.computeBoundingBox();return g}}
// ---------------- models ----------------
const MCACHE={};
function MDL(id){return null} // Imported cache model vertices are disabled.
// emit one model: o={rot,mir,sx,sy,sz,ox,oy,oz,rf,rt,amb,con,npc,tf(x,y,z)->[X,Y,Z]}
const _P=new Float32Array(3*20000),_N=new Float32Array(3*20000),_NC=new Float32Array(20000);
function emit(acc,mid,o){const m=MDL(mid);if(!m)return 0;const nv=m.nv,nf=m.nf;const P=nv*3<=_P.length?_P:new Float32Array(nv*3),Nn=nv*3<=_N.length?_N:new Float32Array(nv*3),NC=nv<=_NC.length?_NC:new Float32Array(nv);
 const rot=(o.rot||0)&3,mir=!!o.mir,sx=(o.sx??128)/128,sy=(o.sy??128)/128,sz=(o.sz??128)/128;
 for(let i=0;i<nv;i++){let x=m.X[i],y=m.Y[i],z=m.Z[i];if(mir)z=-z;for(let k=0;k<rot;k++){const t=x;x=z;z=-t}P[i*3]=x*sx+(o.ox||0);P[i*3+1]=y*sy+(o.oy||0);P[i*3+2]=z*sz+(o.oz||0);Nn[i*3]=Nn[i*3+1]=Nn[i*3+2]=0;NC[i]=0}
 const lx=sun.position.x,ly=-sun.position.y,lz=-sun.position.z,amb=78+(o.amb||0),con=760+(o.con||0)*(o.npc?1:5),mag=Math.sqrt(lx*lx+ly*ly+lz*lz)|0,k1=(con*mag)>>8;
 const fn=new Float32Array(nf*3);
 for(let f=0;f<nf;f++){let a=m.A[f],b=m.B[f],c=m.C[f];if(a>=nv||b>=nv||c>=nv)continue;if(mir){const t=b;b=c;c=t}
  const ax=P[b*3]-P[a*3],ay=P[b*3+1]-P[a*3+1],az=P[b*3+2]-P[a*3+2],bx=P[c*3]-P[a*3],by=P[c*3+1]-P[a*3+1],bz=P[c*3+2]-P[a*3+2];
  let nx=ay*bz-az*by,ny=az*bx-ax*bz,nz=ax*by-ay*bx;const L=Math.sqrt(nx*nx+ny*ny+nz*nz)||1;nx=nx*256/L;ny=ny*256/L;nz=nz*256/L;fn[f*3]=nx;fn[f*3+1]=ny;fn[f*3+2]=nz;
  if(!m.FL[f]){for(const v of[a,b,c]){Nn[v*3]+=nx;Nn[v*3+1]+=ny;Nn[v*3+2]+=nz;NC[v]++}}}
 const rf=o.rf,rt=o.rt;let cnt=0;
 for(let f=0;f<nf;f++){let a=m.A[f],b=m.B[f],c=m.C[f];if(a>=nv||b>=nv||c>=nv)continue;if(m.AL[f]>=200)continue;
  let col=m.CO[f];if(rf)for(let k=0;k<rf.length;k++)if(rf[k]===col){col=rt[k];break}
  const sl=m.SL?m.SL[f]:-1,vs=[a,b,c];
  const flatL=m.FL[f]?amb+((lx*fn[f*3]+ly*fn[f*3+1]+lz*fn[f*3+2])/(k1+k1/2)|0):0;
  for(let j=0;j<3;j++){const v=vs[j];let L=m.FL[f]||!NC[v]?(m.FL[f]?flatL:amb+((lx*fn[f*3]+ly*fn[f*3+1]+lz*fn[f*3+2])/(k1+k1/2)|0)):amb+((lx*Nn[v*3]+ly*Nn[v*3+1]+lz*Nn[v*3+2])/(k1*NC[v])|0);
   let r,g,bb,u=0,w=0,s=-1;
   if(sl>=0&&m.UV){const q=Math.max(0,Math.min(127,L))/108;r=g=bb=q;u=m.UV[f*6+j*2]/256;w=m.UV[f*6+j*2+1]/256;s=sl}
   else{const h=lc(col,L)*3;r=PALB[h]/255;g=PALB[h+1]/255;bb=PALB[h+2]/255}
   const X=P[v*3],Yy=P[v*3+1],Z=P[v*3+2],t=o.tf(X,Yy,Z);acc.v(t[0],t[1],t[2],r,g,bb,u,w,s)}
  cnt++}
 return cnt}
// ---------------- terrain ----------------
const SHV=[[1,3,5,7],[1,3,5,7],[1,3,5,7],[1,3,5,7,6],[1,3,5,7,6],[1,3,5,7,6],[1,3,5,7,6],[1,3,5,7,2,6],[1,3,5,7,2,8],[1,3,5,7,2,8],[1,3,5,7,11,12],[1,3,5,7,11,12],[1,3,5,7,13,14]];
const SHF=[[0,1,2,3,0,0,1,3],[1,1,2,3,1,0,1,3],[0,1,2,3,1,0,1,3],[0,0,1,2,0,0,2,4,1,0,4,3],[0,0,1,4,0,0,4,3,1,1,2,4],[0,0,4,3,1,0,1,2,1,0,2,4],[0,1,2,4,1,0,1,4,1,0,4,3],[0,4,1,2,0,4,2,5,1,0,4,5,1,0,5,3],[0,4,1,2,0,4,2,3,0,4,3,5,1,0,4,5],[0,0,4,5,1,4,1,2,1,4,2,3,1,4,3,5],[0,0,1,5,0,1,4,5,0,1,2,4,1,0,5,3,1,5,4,3,1,4,2,3],[1,0,1,5,1,1,4,5,1,1,2,4,0,0,5,3,0,5,4,3,0,4,2,3],[1,0,5,4,1,0,1,5,0,0,4,3,0,4,5,3,0,5,2,3,0,1,2,5]];
const PTU=[0,0,.5,1,1,1,.5,0,0,.5,.75,.5,.25,.25,.75,.75,.25],PTV=[0,0,0,0,.5,1,1,1,.5,.25,.5,.75,.5,.25,.25,.75,.75];
// ---- v12: green Lumbridge field (cache goblin field is brown mud) inside the play area
{for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){const z=SZ-1-y;if(x<52||x>136||z<60||z>131)continue;const i=y*SZ+x;const u=TUB[i];
  if(u){const q=u-1,h=q>>10,sa=(q>>7)&7,l=q&127;if(h>=4&&h<=11&&sa>=3)TUB[i]=((12+(h&1))<<10|(6<<7)|Math.min(127,l+2))+1}
  const o=TOH[i];if(o&&TOT[i]<0){const q=o-1,h=q>>10,sa=(q>>7)&7;if(h>=4&&h<=11&&sa>=3&&x>=100)TOH[i]=0}}}
let ground,water;
{const acc=new Acc();
 const isW=(x,y)=>x>=0&&y>=0&&x<SZ&&y<SZ&&TOT[y*SZ+x]===1&&TOH[y*SZ+x]>0;
 // v5: sink water surface (terrain mesh only) so bridges/jetties never clip through it
 const vhw=(vx,vy)=>{const n=isW(vx-1,vy-1)+isW(vx,vy-1)+isW(vx-1,vy)+isW(vx,vy);return vh(vx,vy)-(n?14+n*9:0)};
 const tw=(vx,vy,hh)=>[vx,hh/128,SZ-vy];
  const pcol=(hsl,L,x=0,z=0)=>{const seed=hs(Math.floor(x*2),Math.floor(z*2),41),tone=(hsl>>10)&63, sat=(hsl>>7)&7,grass=tone>=4&&tone<=13&&sat>=3,grain=grass ? 0.88+seed*0.24 : 0.94+seed*0.12,h=lc(hsl,Math.max(0,Math.min(127,Math.round(L*grain))))*3,c=[PALB[h]/255,PALB[h+1]/255,PALB[h+2]/255];if(grass){const moss=hs(Math.floor(x*3),Math.floor(z*3),89);c[0]*=.92+moss*.08;c[1]*=.96+moss*.1;c[2]*=.88+moss*.12}return c};
 for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){const i=y*SZ+x,ub=TUB[i],oh=TOH[i];if(!ub&&!oh)continue;
  const h00=vhw(x,y),h10=vhw(x+1,y),h01=vhw(x,y+1),h11=vhw(x+1,y+1),l00=TLT[y*S1+x],l10=TLT[y*S1+x+1],l01=TLT[(y+1)*S1+x],l11=TLT[(y+1)*S1+x+1];
  const shp=TSH[i],rt=TRT[i],ot=TOT[i];
  const put=(u,v,ov)=>{const hh=(h00*(1-u)*(1-v)+h10*u*(1-v)+h01*(1-u)*v+h11*u*v),L=(l00*(1-u)*(1-v)+l10*u*(1-v)+l01*(1-u)*v+l11*u*v)|0;const p=tw(x+u,y+v,hh);
   if(ov){if(ot>=0){const q=L/112;acc.v(p[0],p[1],p[2],q,q,q,(x+u),(y+v),ot)}else{const c=pcol(oh-1,L,x+u,y+v);acc.v(p[0],p[1],p[2],c[0],c[1],c[2],0,0,-1)}}
   else{if(!ub){acc.v(p[0],p[1],p[2],0,0,0,0,0,-1);return}const cu=(dx,dy)=>{const xx=Math.min(SZ-1,x+dx),yy=Math.min(SZ-1,y+dy),q=TUB[yy*SZ+xx];return pcol((q||ub)-1,L,x+dx,y+dy)};const a0=cu(0,0),a1=cu(1,0),a2=cu(0,1),a3=cu(1,1),w0=(1-u)*(1-v),w1=u*(1-v),w2=(1-u)*v,w3=u*v;acc.v(p[0],p[1],p[2],a0[0]*w0+a1[0]*w1+a2[0]*w2+a3[0]*w3,a0[1]*w0+a1[1]*w1+a2[1]*w2+a3[1]*w3,a0[2]*w0+a1[2]*w1+a2[2]*w2+a3[2]*w3,(x+u)/3,(y+v)/3,-2)}};
  if(!oh||shp===0){const ov=!!oh;
   if(!ov&&!ub)continue;
   put(0,0,ov);put(1,0,ov);put(1,1,ov);put(0,0,ov);put(1,1,ov);put(0,1,ov);continue}
  const codes=SHV[shp]||SHV[0],faces=SHF[shp]||SHF[0],r=rt&3;
  const tc=s=>{if((s&1)===0&&s<=8)return((s-r-r-1)&7)+1;if(s>8&&s<=12)return((s-9-r)&3)+9;if(s>12&&s<=16)return((s-13-r)&3)+13;return s};
  const pts=codes.map(c=>tc(c));
  for(let k=0;k<faces.length;k+=4){const ov=faces[k]!==0;if(!ov&&!ub)continue;let a=faces[k+1],b=faces[k+2],c=faces[k+3];if(a<4)a=(a-r)&3;if(b<4)b=(b-r)&3;if(c<4)c=(c-r)&3;
   for(const q of[a,b,c]){const pc=pts[q];put(PTU[pc],PTV[pc],ov)}}}
 window.__TER={TUB,TOH,TOT,TSH,SZ};const TMAT=osMat({terrain:true});ground=new THREE.Mesh(acc.geo(),TMAT);ground.userData.ground=1;S.add(ground);
 {const P=[],U=[],VC=[],near=(x,y)=>{for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(isW(x+dx,y+dy))return 1;return 0},shore=(vx,vy)=>isW(vx-1,vy-1)+isW(vx,vy-1)+isW(vx-1,vy)+isW(vx,vy);
   for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){if(!near(x,y))continue;const q=[[x,y],[x+1,y],[x+1,y+1],[x,y],[x+1,y+1],[x,y+1]];for(const[vx,vy]of q){const t=tw(vx,vy,vh(vx,vy)-12),n=shore(vx,vy);P.push(t[0],t[1],t[2]);U.push(vx/3,vy/3);VC.push(1,1,1,n ? .92*(.25+.75*n/4) : 0)}}
   const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(P,3));wg.setAttribute('uv',new THREE.Float32BufferAttribute(U,2));wg.setAttribute('color',new THREE.Float32BufferAttribute(VC,4));
   TX.water.wrapS=TX.water.wrapT=THREE.RepeatWrapping;
   water=new THREE.Mesh(wg,new THREE.MeshBasicMaterial({color:0x27aeb4,map:TX.water,vertexColors:true,transparent:true,opacity:1,depthWrite:false,side:THREE.DoubleSide}));water.renderOrder=1;S.add(water)}}
// ---------------- object placements (chunked) ----------------
const LOC=WD.loc,CH=16,NCH=Math.ceil(SZ/CH);
const lmods=(d,t)=>{const mt=t===11?10:(t>=5&&t<=8)?4:t;if(d.t&&d.t.length)return d.m.filter((_,k)=>d.t[k]===mt);return(mt===10||mt===22)?d.m:[]};
// ---- v12: confine to castle -> river -> goblin field; drop distant clutter and most dead trees; add a small mine
const BOX=[0,0,SZ-1,SZ-1],inBox=inb;
{const tin=WD.P.find(p=>LOC[p[0]]&&LOC[p[0]].n==='Tin rocks'),cop=WD.P.find(p=>LOC[p[0]]&&LOC[p[0]].n==='Copper rocks');
 window.__MINE=[];for(const[x,z,src]of[[123,99,tin],[125,99,cop],[124,101,tin],[126,101,cop],[122,102,cop]])if(src){WD.P.push([src[0],src[1],src[2],x,SZ-1-z]);window.__MINE.push([x,z])}}
const BUCK=Array.from({length:NCH*NCH},()=>({P:[],R:[]}));
for(const p of WD.P){const c=(p[4]>>4)*NCH+(p[3]>>4);BUCK[c].P.push(p)}
for(const p of WD.R){const c=(p[4]>>4)*NCH+(p[3]>>4);BUCK[c].R.push(p)}
const roofTile=new Uint8Array(SZ*SZ);for(const p of WD.R){const d=LOC[p[0]];const w=(p[2]&1)?d.l:d.w,l=(p[2]&1)?d.w:d.l;for(let a=-1;a<=w;a++)for(let b=-1;b<=l;b++){const x=p[3]+a,y=p[4]+b;if(x>=0&&y>=0&&x<SZ&&y<SZ)roofTile[y*SZ+x]=1}}
// clear wall edges for doors & gates (always passable; Open/Close is cosmetic)
for(const p of WD.P){const d=LOC[p[0]];if(!d.a||!d.a.some(a=>a==='Open'||a==='Close'))continue;const t=p[1],x=p[3],y=p[4];if(t>3)continue;
 const clr=(x,y,bit)=>{if(x>=0&&y>=0&&x<SZ&&y<SZ)COL[y*SZ+x]&=~bit};const r=p[2]&3;
 const E=[[-1,0,2,8],[0,1,4,16],[1,0,8,2],[0,-1,16,4]];const e=E[r];clr(x,y,e[2]);clr(x+e[0],y+e[1],e[3]);
 if(t===2){const e2=E[(r+1)&3];clr(x,y,e2[2]);clr(x+e2[0],y+e2[1],e2[3])}
 if(d.w&&!(t<=3)){}}
function placeObj(acc,p,roof){const d=LOC[p[0]];return d?emitScenery(acc,p,d,SZ,hAt,roof):0}
// interactive objects registry
const OBJ=[],objAt=new Map(),TREES=[],ROCKS=[],FISH=[],PICK=[],HOUSES=[],WHEAT=[];
const ORE={'Copper rocks':'copper','Tin rocks':'tin'};
const PREG=new Map(); // "x,y" -> obj entry
for(const p of WD.P){const[rid,t,r,x,y]=p,d=LOC[rid];if(!d||!d.a||!d.a.some(Boolean))continue;if(t===22&&!/Chop|Mine|Bank|Open|Close|Climb|Pray|Cook|Search/.test(d.a.join()))continue;
 const w=(r&1)?d.l:d.w,l=(r&1)?d.w:d.l;const acts=d.a.filter(Boolean);
 const kind=acts.includes('Chop down')?'tree':acts.includes('Mine')?'rock':(acts.includes('Bank')||d.n==='Bank booth')?'booth':/altar/i.test(d.n)&&acts.some(a=>/Pray/.test(a))?'altar':'loc';
 const o={kind,name:d.n,acts,rid,t,r,ox:x,oy:y,x,z:SZ-y-l,w:t>=9?w:1,l:t>=9?l:1,alive:1};
 if(kind==='rock'){o.ore=ORE[d.n]||null;ROCKS.push(o)}if(kind==='tree')TREES.push(o);
 OBJ.push(o);PREG.set(rid+','+t+','+x+','+y,o);for(let a=0;a<o.w;a++)for(let b=0;b<o.l;b++)objAt.set(I(o.x+a,o.z+b),o)}
const CHK=new Map();
// v61: small low-poly wildflowers add color and scale across open meadows without replacing cache models.
{const cap=190,stem=new THREE.InstancedMesh(new THREE.CylinderGeometry(.012,.022,.18,4),lam(0x66874c),cap),bloom=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.047,0),lam(0xffffff),cap);let n=0,tries=0;
 while(n<cap&&tries++<5000){const x=2+(hs(tries,61,18)*(SZ-4)|0),z=2+(hs(tries,61,29)*(SZ-4)|0),i=oi(x,z),q=TUB[i]-1,h=q>>10,sat=q>>7&7;
  if(!walkable(x,z)||objAt.has(I(x,z))||TOT[i]===1||h<9||h>15||sat<3)continue;
  const px=x+.5,pz=z+.5,y=hAt(px,pz),col=[0xf2c84b,0xfff1db,0xe888bd,0xa9b9f5][(hs(x,z,81)*4)|0];
  reset();D.position.set(px,y+.09,pz);D.rotation.y=hs(x,z,44)*6.28;D.updateMatrix();stem.setMatrixAt(n,D.matrix);
  D.position.y=y+.205;D.scale.setScalar(.78+hs(x,z,55)*.5);D.updateMatrix();bloom.setMatrixAt(n,D.matrix);bloom.setColorAt(n,C.setHex(col));n++}
 stem.count=bloom.count=n;stem.instanceMatrix.needsUpdate=bloom.instanceMatrix.needsUpdate=true;if(bloom.instanceColor)bloom.instanceColor.needsUpdate=true;S.add(stem,bloom);window.__OM61flowers=n}
// ---------------- doors: real open/close with collision ----------------
const EDGE=[[-1,0,2,8],[0,1,4,16],[1,0,8,2],[0,-1,16,4]]; // OSRS local: W,N,E,S  [dx,dy,bitHere,bitThere]
function setEdge(x,y,r,on){const e=EDGE[r&3];const f=(x,y,b)=>{if(x>=0&&y>=0&&x<SZ&&y<SZ){if(on)COL[y*SZ+x]|=b;else COL[y*SZ+x]&=~b}};f(x,y,e[2]);f(x+e[0],y+e[1],e[3])}
const CORN=[[0,1],[1,1],[1,0],[0,0]]; // corner shared by edge k and k+1
const EMID=[[0,.5],[.5,1],[1,.5],[.5,0]];
const DOORS=[];
for(const o of PREG.values()){if(o.t!==0||!o.acts.some(a=>a==='Open'||a==='Close'))continue;o.kind='door';o.init=o.acts.includes('Close');o.open=o.init;
 o.cE=o.init?(o.r+3)&3:o.r;o.oE=o.init?o.r:(o.r+1)&3;o.hk=o.init?(o.r+3)&3:o.r; // closed edge, open edge, hinge corner
 o.name=o.name||'Door';if(!o.open)setEdge(o.ox,o.oy,o.cE,true);DOORS.push(o)}
function doorAng(o){if(o.open===o.init)return 0;const H=CORN[o.hk],M=EMID[o.r&3],T=EMID[o.open?o.oE:o.cE];
 const mx=M[0]-H[0],my=M[1]-H[1],tx=T[0]-H[0],ty=T[1]-H[1];
 // world (x,y) -> three (X, Z=-y); rotation.y=a maps (X,Z)->(X cos a + Z sin a, -X sin a + Z cos a)
 const tryA=a=>{const X=mx,Z=-my;const X2=X*Math.cos(a)+Z*Math.sin(a),Z2=-X*Math.sin(a)+Z*Math.cos(a);return (X2-tx)**2+(Z2+ty)**2};
 return tryA(Math.PI/2)<tryA(-Math.PI/2)?Math.PI/2:-Math.PI/2}
function toggleDoor(o){if(o.open)setEdge(o.ox,o.oy,o.cE,true);else setEdge(o.ox,o.oy,o.cE,false);o.open=!o.open;if(o.mesh)o.mesh.rotation.y=doorAng(o);
 if(typeof window!=='undefined'&&window.__P6)try{window.__P6.tone(o.open?180:140,.12,'square',.04)}catch(e){}}
function doorMesh(p,o,ch){const acc=new Acc();placeObj(acc,p,false);if(!acc.p.length)return null;const H=CORN[o.hk],hx=o.ox+H[0],hz=SZ-(o.oy+H[1]);
 for(let k=0;k<acc.p.length;k+=3){acc.p[k]-=hx;acc.p[k+2]-=hz}const m=new THREE.Mesh(acc.geo(),WMAT);m.position.set(hx,0,hz);m.rotation.y=doorAng(o);m.userData.obj=o;o.mesh=m;ch.g.add(m);ch.doors.push(m);PICK.push(m);return m}
function buildChunk(ci){const B=BUCK[ci];const acc=new Acc(),racc=new Acc(),own=[],ranges=[];
 const treeP=[],doorP=[];for(const p of B.P){const dO=PREG.get(p[0]+','+p[1]+','+p[3]+','+p[4]);if(dO&&dO.kind==='tree'){treeP.push(dO);continue}const treeDef=LOC[p[0]];if(!dO&&treeDef&&/^(Bush|Tree|Oak|Willow tree|Maple tree|Yew tree|Evergreen)$/.test(treeDef.n||'')){const tw=(p[2]&1)?treeDef.l:treeDef.w,tl=(p[2]&1)?treeDef.w:treeDef.l;treeP.push({name:treeDef.n,x:p[3],z:SZ-p[4]-(tl||1),w:tw||1,l:tl||1,alive:1,visualOnly:true});continue}if(dO&&dO.kind==='door'){doorP.push([p,dO]);continue}const v0=acc.p.length/3;placeObj(acc,p,false);const v1=acc.p.length/3;if(v1===v0)continue;const o=PREG.get(p[0]+','+p[1]+','+p[3]+','+p[4]);ranges.push([v0,v1,p,o||null])}
 for(const p of B.R)placeObj(racc,p,true);
 const g=new THREE.Group();let mesh=null,rmesh=null;
 if(acc.p.length){mesh=new THREE.Mesh(acc.geo(),WMAT);mesh.userData.chunk=ci;g.add(mesh)}
 if(racc.p.length){rmesh=new THREE.Mesh(racc.geo(),WMAT);rmesh.userData.roof=1;g.add(rmesh)}
 S.add(g);const ch={g,mesh,rmesh,ranges,orig:null,doors:[],artTrees:[]};for(const o of treeP){const t=createTree(o,hAt(o.x+o.w/2,o.z+o.l/2),hs(o.x,o.z,78));o.fantasyTree=t;g.add(t);ch.artTrees.push(t);if(!o.visualOnly)PICK.push(t)}CHK.set(ci,ch);for(const[p,dO]of doorP)doorMesh(p,dO,ch);
 for(const rg of ranges)if(rg[3]){rg[3].ch=ch;rg[3].v0=rg[0];rg[3].v1=rg[1];if(!rg[3].alive)applyState(rg[3])}
 if(mesh)PICK.push(mesh);return ch}
function dropChunk(ci){const ch=CHK.get(ci);if(!ch)return;S.remove(ch.g);for(const t of ch.artTrees||[]){t.traverse(m=>{if(m.userData.fantasyOwnedGeometry)m.geometry.dispose()});const i=PICK.indexOf(t);if(i>=0)PICK.splice(i,1);const o=t.children.find(c=>c.userData.obj)?.userData.obj;if(o&&o.fantasyTree===t)o.fantasyTree=null}for(const m of ch.doors){m.geometry.dispose();const k=PICK.indexOf(m);if(k>=0)PICK.splice(k,1);if(m.userData.obj.mesh===m)m.userData.obj.mesh=null}for(const m of[ch.mesh,ch.rmesh])if(m){m.geometry.dispose();const k=PICK.indexOf(m);if(k>=0)PICK.splice(k,1)}for(const rg of ch.ranges)if(rg[3]&&rg[3].ch===ch)rg[3].ch=null;CHK.delete(ci)}
function ownerOf(mesh,face){const ch=CHK.get(mesh.userData.chunk);if(!ch)return null;const v=face*3;for(const rg of ch.ranges)if(v>=rg[0]&&v<rg[1])return rg;return null}
// depleted look: squash trees to stumps, darken rocks
function applyState(o){const ch=o.ch;if(!ch||!ch.mesh)return;const g=ch.mesh.geometry,pa=g.attributes.position,ca=g.attributes.color;
 if(!o.save){o.save={p:pa.array.slice(o.v0*3,o.v1*3),c:ca.array.slice(o.v0*3,o.v1*3)}}
 if(o.alive){pa.array.set(o.save.p,o.v0*3);ca.array.set(o.save.c,o.v0*3)}
 else{let y0=1e9;for(let v=o.v0;v<o.v1;v++)y0=Math.min(y0,o.save.p[(v-o.v0)*3+1]);
  for(let v=o.v0;v<o.v1;v++){const k=(v-o.v0)*3;if(o.kind==='tree'){const yy=o.save.p[k+1]-y0;pa.array[v*3+1]=y0+Math.min(yy,.35);const cx=o.x+o.w/2,cz=o.z+o.l/2;if(yy>.35){pa.array[v*3]=cx+(o.save.p[k]-cx)*.35;pa.array[v*3+2]=cz+(o.save.p[k+2]-cz)*.35}}
   else{const gr=(o.save.c[k]+o.save.c[k+1]+o.save.c[k+2])/3*.75;ca.array[v*3]=ca.array[v*3+1]=ca.array[v*3+2]=gr}}}
 pa.needsUpdate=ca.needsUpdate=true;pa.addUpdateRange?.(0,pa.array.length)}
function setTree(o){o.respawnT=o.respawn;if(o.fantasyTree)o.fantasyTree.userData.canopy.visible=!!o.alive;applyState(o)}
function setRock(o){applyState(o)}
// dummies kept for older code paths
const _dummy=new THREE.InstancedMesh(new THREE.BufferGeometry(),new THREE.MeshBasicMaterial(),1);_dummy.count=0;
const trunkI=_dummy,blobI=_dummy,pineI=_dummy,rockI=_dummy;
// streaming
const STREAM={r:3,last:-1,cx:-1,cy:-1,radius:-1,want:[]};
function streamAt(px,pz,all){const cx=Math.floor(px/CH),cyo=Math.floor((SZ-pz)/CH);let built=0;
 // Reuse the same nearest-first order until the player crosses a chunk boundary.
 // The load budget, radius and collision data remain the same.
 if(cx!==STREAM.cx||cyo!==STREAM.cy||STREAM.r!==STREAM.radius){
  const want=[];for(let a=-STREAM.r;a<=STREAM.r;a++)for(let b=-STREAM.r;b<=STREAM.r;b++){const x=cx+a,y=cyo+b;if(x<0||y<0||x>=NCH||y>=NCH)continue;want.push([a*a+b*b,y*NCH+x])}
  want.sort((p,q)=>p[0]-q[0]);STREAM.want=want;STREAM.cx=cx;STREAM.cy=cyo;STREAM.radius=STREAM.r;
 }
 for(const[,ci]of STREAM.want){if(CHK.has(ci))continue;buildChunk(ci);built++;if(!all&&built>=1)break}
 for(const ci of CHK.keys()){const x=ci%NCH,y=(ci/NCH)|0;if(Math.abs(x-cx)>STREAM.r+1||Math.abs(y-cyo)>STREAM.r+1)dropChunk(ci)}}
let roofsHidden=false;
function roofCheck(tx,tz){if(!inb(tx,tz))return;const hide=!!roofTile[oi(tx,tz)];if(hide!==roofsHidden){roofsHidden=hide;for(const ch of CHK.values())if(ch.rmesh)ch.rmesh.visible=!hide}else if(hide)for(const ch of CHK.values())if(ch.rmesh&&ch.rmesh.visible)ch.rmesh.visible=false}
// ---------------- NPC / player models ----------------
const NGEO={};
function npcGeo(id){if(NGEO[id])return NGEO[id];const d=WD.npc[id];const acc=new Acc();if(d){const s=d.sxz||128,sy=d.sy||128;
 for(const mid of d.models)emit(acc,mid,{npc:1,sx:s,sy,sz:s,rf:d.rf,rt:d.rt,amb:d.amb,con:d.con,tf:(x,y,z)=>[x/128,-y/128,-z/128]})}
 return NGEO[id]=acc.geo()}
function kitGeo(mids,key){if(NGEO[key])return NGEO[key];const acc=new Acc();for(const[mid,rf,rt]of mids)emit(acc,mid,{npc:1,rf,rt,tf:(x,y,z)=>[x/128,-y/128,-z/128]});return NGEO[key]=acc.geo()}
function osMesh(geo){const m=new THREE.Mesh(geo,osMat());return m}
// ---------------- minimap image (OSRS style, 4px per tile) ----------------
const MMS=4,mapC=document.createElement('canvas');mapC.width=SZ*MMS;mapC.height=SZ*MMS;
{const x=mapC.getContext('2d'),im=x.createImageData(SZ*MMS,SZ*MMS),D8=im.data;
 const TAV=WD.tavg||{};
 for(let z=0;z<SZ;z++)for(let X=0;X<SZ;X++){const i=oi(X,z);let hsl=-1;if(TOH[i]&&TSH[i]===0)hsl=TOH[i]-1;else if(TUB[i])hsl=TUB[i]-1;else if(TOH[i])hsl=TOH[i]-1;
  let r=0,g=0,b=0;if(hsl>=0){const h=lc(hsl,96)*3;r=PALB[h];g=PALB[h+1];b=PALB[h+2]}
  for(let a=0;a<MMS;a++)for(let c=0;c<MMS;c++){const k=((z*MMS+a)*SZ*MMS+X*MMS+c)*4;D8[k]=r;D8[k+1]=g;D8[k+2]=b;D8[k+3]=255}}
 x.putImageData(im,0,0);
 x.fillStyle='#eeeeee';for(let z=0;z<SZ;z++)for(let X=0;X<SZ;X++){const c=COL[oi(X,z)];if(c&2)x.fillRect(X*MMS,z*MMS,1,MMS);if(c&8)x.fillRect(X*MMS+MMS-1,z*MMS,1,MMS);if(c&4)x.fillRect(X*MMS,z*MMS,MMS,1);if(c&16)x.fillRect(X*MMS,z*MMS+MMS-1,MMS,1)}
 for(const o of OBJ){if(o.kind==='loc'&&/Door|Gate/.test(o.name)){x.fillStyle='#ee0000';x.fillRect(o.x*MMS+1,o.z*MMS+1,2,2)}}
 for(const t of TREES){x.fillStyle='#0a3a08';x.fillRect(t.x*MMS,t.z*MMS,MMS*t.w-1,MMS*t.l-1)}}
// hooks used by p5 render loop
function worldFrame(now,px,pz){animateChaos(now);WMAT.uniforms.tm.value=(now/4000)%1;const k=Math.floor(px/4)*1000+Math.floor(pz/4);if(k!==STREAM.last||CHK.size<9){STREAM.last=k}streamAt(px,pz,false);roofCheck(Math.floor(px),Math.floor(pz))}
// ---------------- characters (real OSRS models from the cache) ----------------
function piv(p,x,y,z){const g=new THREE.Group();g.position.set(x,y,z);p.add(g);return g}
const shadowT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),g=x.createRadialGradient(32,32,2,32,32,31);g.addColorStop(0,'rgba(15,21,23,.48)');g.addColorStop(.52,'rgba(15,21,23,.26)');g.addColorStop(1,'rgba(15,21,23,0)');x.fillStyle=g;x.fillRect(0,0,64,64);const t=new THREE.CanvasTexture(c);t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;return t})();
const shadowG=new THREE.CircleGeometry(.48,24).rotateX(-Math.PI/2),shadowM=new THREE.MeshBasicMaterial({color:0xffffff,map:shadowT,transparent:true,opacity:.9,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1});
function rig(g,sz=1){const sh=new THREE.Mesh(shadowG,shadowM);sh.position.y=.03;sh.scale.setScalar(sz);g.add(sh);S.add(g);return g}
function wrapGeo(geo,size=1){const g=new THREE.Group(),b=piv(g,0,0,0),m=osMesh(geo);b.add(m);geo.computeBoundingBox();const top=Math.max(.6,geo.boundingBox.max.y);
 return {g:rig(g,size),b,legs:[piv(b,0,0,0),piv(b,0,0,0)],AL:piv(b,0,0,0),AR:piv(b,0,0,0),hd:piv(b,0,top,0),type:'h',mesh:m,top,size}}
// ---- Bramblewick's own characters (chars.js rigs with walk/idle animation) ----
function bwRig(c0,size=1,top=1.75,sc=1){const g=new THREE.Group(),b=piv(g,0,0,0),c=new THREE.Group();c.scale.setScalar(sc);c.add(c0);b.add(c);
 return {g:rig(g,size),b,legs:[],AL:piv(b,0,0,0),AR:piv(b,0,0,0),hd:piv(b,0,top,0),type:'bw',mesh:c,top,size,ah:{g:c0},L:c0.userData.L}}
const HUM=o=>bwHum(Object.assign({skin:0xe0b48c,hair:0x4a3020,shirt:0x777777,legs:0x4a4038,boots:0x3a2a1a},o));
const hashN=s=>{let h=0;for(const c of String(s))h=h*31+c.charCodeAt(0)|0;return Math.abs(h)};
const SHIRTS=[0x7a3a2a,0x2a5a8a,0x5a7a3a,0x8a6a2a,0x6a3a6a,0x3a6a6a],HAIRS=[0x2a1a10,0x5a3a1a,0xb08a40,0x8a3a1a,0xcfcfcf];
function goblinChar(champion=false){
 const skin=champion?0x607d2e:0x7aa040,scale=champion?.98:.78;
 const g=HUM({scale,skin,hair:champion?0x302319:0x2a3a10,shirt:champion?0x513126:0x7a5a2a,legs:champion?0x38291f:0x5a4024,boots:0x3a2a1a,belt:champion?0xc49a48:0x3a2a1a,item:'spear',itemC:champion?0xd7d0a5:0x9a8a7a,hat:champion?'helm':undefined,hatC:champion?0x70502f:undefined});
 const L=g.userData.L;L.head.scale.set(1.3,1.12,1.25);L.chest.scale.set(1.15,1,1.1);const nose=new THREE.Mesh(new THREE.IcosahedronGeometry(.075,0),new THREE.MeshLambertMaterial({color:0x9bb34c,flatShading:true}));nose.position.set(0,.04,.19);L.head.add(nose);const skinM=new THREE.MeshLambertMaterial({color:skin,flatShading:true}),leather=new THREE.MeshLambertMaterial({color:champion?0x65432b:0x73502d,flatShading:true});
 for(const sx of[-1,1]){const e=new THREE.Mesh(new THREE.ConeGeometry(champion?.055:.045,champion?.24:.2,4),skinM);e.position.set(sx*.15,.2,-.01);e.rotation.z=-sx*1.2;L.head.add(e)}
 // Bramblewick-made ear silhouette, cheek tusks and a little asymmetric shoulder armor.
 for(const sx of[-1,1]){const tusk=new THREE.Mesh(new THREE.ConeGeometry(.025,.09,4),new THREE.MeshLambertMaterial({color:0xe8d8ac,flatShading:true}));tusk.position.set(sx*.075,-.02,.155);tusk.rotation.x=Math.PI;L.head.add(tusk)}
 const pauldron=new THREE.Mesh(new THREE.IcosahedronGeometry(.11,0),leather);pauldron.position.set(-.22,.36,0);L.chest.add(pauldron);
 if(champion){const shield=new THREE.Group();shield.position.set(-.08,-.08,.02);L.handL.add(shield);const face=new THREE.Mesh(new THREE.CylinderGeometry(.16,.16,.045,6),new THREE.MeshLambertMaterial({color:0x71502e,flatShading:true}));face.rotation.x=Math.PI/2;shield.add(face);const bossMark=new THREE.Mesh(new THREE.ConeGeometry(.05,.17,4),new THREE.MeshLambertMaterial({color:0xd5b65b,flatShading:true}));bossMark.position.z=.045;shield.add(bossMark);g.userData.bramblewickChampion=1}
 return g}
function charFor(name,kind){const n=name||'';const h=hashN(n);
 if(kind==='mon'){
  if(/Warden|Forest Guardian/i.test(n))return[makeChar('forestwarden'),2.8,1];
  if(n==='Goblin')return[goblinChar(),1.45,1];
  if(/^Cow/.test(n))return[makeChar('cow'),1.35,n==='Cow calf'?.7:1];
  if(/Chicken|Duck|Drake|Crow/.test(n))return[n==='Crow'?bwBird({body:0x222228,wing:0x111114,head:0x222228,tailC:0x111111}):makeChar('mudhen'),.8,n==='Duckling'?.6:1];
  if(/rat$/i.test(n))return[makeChar('rat'),.6,n==='Giant rat'?1.9:1.2];
  if(/spider/i.test(n))return[makeChar('spider'),.8,1];
  if(/frog/i.test(n))return[makeChar('toad'),.8,n==='Giant frog'?2.4:n==='Big frog'?1.8:1.2];
  if(/skeleton/i.test(n))return[makeChar('skeleton'),1.8,1];
  if(/zombie/i.test(n))return[makeChar('zombie'),1.8,1];
  if(n==='Imp')return[makeChar('demon'),1.2,.42];
  if(n==='Ram')return[bwQuad({body:0xe8e2d0,mane:0xf4f0e4,head:0x3a3028,snout:.1,snoutC:0x2a2420,len:.95,ht:.5,w:.7,ears:.08,horns:1,tail:.15,legW:.05,hoof:0x2a2420}),1.1,1];
  if(n==='Unicorn')return[bwQuad({body:0xf4f4f4,mane:0xe0e0ff,head:0xf4f4f4,snout:.16,snoutC:0xe8d0d0,len:1.25,ht:.85,w:.6,bh:.55,ears:.12,horns:1,tail:.6,tailC:0xe0e0ff,legW:.05,hoof:0xc8b060}),1.6,1];
  if(n==='Mugger')return[HUM({shirt:0x3a3a3a,legs:0x2a2a2a,hat:'hood',hatC:0x222222,item:'sword',itemC:0x888888}),1.8,1];
  if(/Monk/.test(n))return[HUM({shirt:0x8a1a1a,robe:0x8a1a1a,hat:'hood',hatC:0x6a1010}),1.8,1];
  if(n==='Giant'||/giant/i.test(n))return[makeChar('hillgiant'),2.8,1]}
 if(n==='Banker')return[makeChar('banker'),1.8,1];
 if(/Shop/.test(n))return[makeChar('shopkeep'),1.8,1];
 if(/Guide/.test(n))return[makeChar('guide'),1.8,1];
 if(/Guard/i.test(n))return[makeChar('guard'),1.8,1];
 if(/Cook/.test(n))return[HUM({shirt:0xf0f0f0,legs:0xe8e8e8,apron:0xffffff,hat:'cap',hatC:0xffffff}),1.8,1];
 if(/Duke/.test(n))return[HUM({shirt:0x5a1a6a,cape:0x8a1a1a,belt:0xd0a040,hair:0xcfcfcf,beard:0xcfcfcf}),1.8,1];
 if(/Father|Priest/.test(n))return[HUM({shirt:0x1a1a1a,robe:0x1a1a1a,hair:0x8a8a8a}),1.8,1];
 if(/Wizard|Mage/.test(n))return[makeChar('darkwiz'),1.9,1];
 return[HUM({shirt:SHIRTS[h%6],sleeve:SHIRTS[(h>>3)%6],hair:HAIRS[(h>>5)%5],legs:[0x4a4038,0x3a3a5a,0x5a4a30][(h>>7)%3],hairStyle:/Woman|Girl|Lady/.test(n)?'long':undefined}),1.8,1]}
// ---- v8: real cache NPC models, animated by limb groups (legs/arms swing around hip/shoulder pivots) ----
function cacheRig(id,size=1){const base=npcGeo(id);const geo=base.clone();const pa=geo.getAttribute('position');if(!pa||pa.count<12)return null;
 geo.computeBoundingBox();const bb=geo.boundingBox,h=bb.max.y-bb.min.y,y0=bb.min.y,cx=(bb.min.x+bb.max.x)/2,cz=(bb.min.z+bb.max.z)/2;if(h<.2)return null;
 const n=pa.count,P0=new Float32Array(pa.array),G=new Int8Array(n);const hipY=y0+h*.46,shY=y0+h*.8;
 let hw=0;for(let i=0;i<n;i++){const y=P0[i*3+1];if(y>y0+h*.5&&y<y0+h*.78)hw=Math.max(hw,Math.abs(P0[i*3]-cx))}
 for(let i=0;i<n;i++){const x=P0[i*3]-cx,y=P0[i*3+1];if(y<hipY)G[i]=x<0?1:2;else if(y<shY+h*.04&&Math.abs(x)>hw*.62)G[i]=x<0?3:4}
 const g=new THREE.Group(),b=piv(g,0,0,0),m=osMesh(geo);b.add(m);const top=Math.max(.6,bb.max.y);
 return {g:rig(g,size),b,legs:[],AL:piv(b,0,0,0),AR:piv(b,0,0,0),hd:piv(b,0,top,0),type:'cr',mesh:m,top,size,cr:{P0,G,pa,hipY,shY,cz,ph:0,last:-1}}}
function crPose(c,aL,aR,armL,armR){const P=c.pa.array,P0=c.P0,G=c.G,n=G.length;const ang=[0,aL,aR,armL,armR],cs=ang.map(Math.cos),sn=ang.map(Math.sin);
 for(let i=0;i<n;i++){const k=G[i];const j=i*3;if(!k){P[j+1]=P0[j+1];P[j+2]=P0[j+2];continue}const py=k<3?c.hipY:c.shY,dy=P0[j+1]-py,dz=P0[j+2]-c.cz;P[j+1]=py+dy*cs[k]-dz*sn[k];P[j+2]=c.cz+dy*sn[k]+dz*cs[k]}
 c.pa.needsUpdate=true}
function crAnim(e,r,px,pz,now,dt){const c=r.cr;const dd=Math.hypot(px-(e._lx??px),pz-(e._lz??pz));e._lx=px;e._lz=pz;
 if(dd>0)c.ph+=dd*4.2;const mv=dd>0.0005;c.amp=(c.amp||0)+((mv?1:0)-(c.amp||0))*Math.min(1,dt*10);const s=Math.sin(c.ph)*.65*c.amp;
 const br=Math.sin(now/700)*.05*(1-c.amp);let aR=-s*.7+br,aL=s*.7-br;
 const at=(now-(e.atkT||-1e9))/450;if(at>=0&&at<1){aR=-Math.sin(at*Math.PI)*1.9}
 if(e.dead){return}
 const key=((s*100)|0)+'_'+((aR*100)|0)+'_'+((aL*100)|0);if(key===c.last)return;c.last=key;crPose(c,s,-s,aL,aR)}
const _CR=false; // Every NPC uses a Bramblewick procedural model.
function makeNpc(id,kind){const d=WD.npc[id]||{};if(kind==='mon'&&(d.name==='Goblin'||/Warden|Forest Guardian/i.test(d.name||d.n||''))){const[c,top,sc]=charFor(d.name||d.n,kind);return bwRig(c,d.size||1,top*sc,sc)}if(_CR){try{const r=cacheRig(id,(WD.npc[id]||{}).size||1);if(r)return r}catch(err){console.warn('cacheRig',id,err)}}const[c,top,sc]=charFor(d.n||d.name,kind);return bwRig(c,d.size||1,top*sc,sc)}
const GEARC={bronze:0xb8793a,leather:0x8a5a30,wood:0x8a6a3a,steel:0xc8c8d0,iron:0x5e6068};
function gearCol(id){const n=(IT[id]&&IT[id].n)||'';return /Bronze/.test(n)?GEARC.bronze:/Leather/.test(n)?GEARC.leather:/Wooden/.test(n)?GEARC.wood:/Iron/.test(n)?GEARC.iron:GEARC.steel}
// player = identity kits (male defaults) + wielded item models
const IC={coins:995,logs:1511,copper:436,tin:438,shrimps:315,bones:526,cowhide:1739,feather:314,axe:1351,pick:1265,net:303,sword:1277,shield:1171,beef:2142,
 air:556,water:555,earth:557,fire:554,mind:558,rawbeef:2132,rawchicken:2138,chicken:2140,rawshrimps:317,tinder:590,
 dagger:1205,scim:1321,lsword:1291,whammer:1337,staff:1379,airstaff:1381,sqshield:1173,medhelm:1139,fullhelm:1155,chain:1103,plate:1117,plegs:1075,pskirt:1087,lbody:1129,chaps:1095,gloves:1059,boots:1061,vambs:1063,cowl:1167,burnt:2146,bread:2309};
const KDEF=(()=>{const o={};for(const k of WD.kits)if(o[k.p]===undefined)o[k.p]=k;return o})();
const HIDE={head:i=>(IT[i].full||/full helm/i.test(IT[i].n||''))?[0,1]:[0],body:i=>IT[i].arms===false?[2]:[2,3],legs:()=>[5],hands:()=>[4],feet:()=>[6]};
const TINT39={iron:[0,0,-6],steel:[0,0,8],mithril:[43,3,-4],adamant:[22,3,-8],rune:[34,3,-2],black:[0,0,-40]};
function wornDef(id){if(!id||!IT[id])return null;let c=IC[id];let d=c!=null&&WD.obj[c];if(d&&d.mw>=0)return {mw:d.mw,rf:d.rf,rt:d.rt};
 const t=IT[id].tid;d=t!=null&&WD.obj[t];if(d&&d.mw>=0)return {mw:d.mw,rf:d.rf,rt:d.rt};
 const m=/^([a-z]+)_(.+)$/.exec(id);if(!m)return null;const base=IC[m[2]];d=base!=null&&WD.obj[base];if(!d||d.mw<0)return null;
 const T=TINT39[m[1]];let rt=d.rt;if(T&&Array.isArray(d.rt))rt=d.rt.map(c=>(T[0]<<10)|(T[1]<<7)|Math.max(0,Math.min(127,(c&127)+T[2])));return {mw:d.mw,rf:d.rf,rt}}
function playerParts(eq){const L=[],hid=new Set(),W={};for(const s of['head','body','legs','hands','feet','weapon','shield']){const id=eq&&eq[s];const w=wornDef(id);if(w)W[s]=w}
 for(const[s,f]of Object.entries(HIDE)){const id=eq&&eq[s];if(id&&IT[id]&&W[s])for(const p of f(id))hid.add(p)}
 for(let p=0;p<7;p++){const k=KDEF[p];if(!k||hid.has(p))continue;for(const m of k.m)L.push([m,k.rf,k.rt])}
 for(const s of['head','body','legs','hands','feet','weapon','shield'])if(W[s])L.push([W[s].mw,W[s].rf,W[s].rt]);return L}
function makePlayerBW(eq,appearance){eq=eq||{};const lk=(ST&&ST.look)||[0,0,0];const shirt=[0x2a5ab0,0x7a2a2a,0x2a7a3a,0x6a4a2a,0x5a2a6a,0x2a6a7a][lk[1]%6];const base={skin:0xe0b48c,hair:HAIRS[lk[0]%5],shirt,sleeve:shirt,legs:[0x3a3a5a,0x4a4038,0x2a2a2a,0x5a4a30,0x3a5a3a][lk[2]%5],boots:0x4a3020,belt:0x6b4a2a};let c=null;if(buildAdventurer)try{c=buildAdventurer(Object.assign(base,appearance||{}),eq)}catch(e){console.warn('custom adventurer build failed; using built-in model',e)}if(!c){try{const r=playerRig(eq);if(r)return r}catch(e){console.warn('cache player fallback unavailable',e)}c=bwHum(Object.assign(base,appearance||{}))}return bwRig(c,1,1.8,1)}
function makeHuman(o){return makePlayerBW(o&&o.eq,o||{})}
// ---------------- items / skills ----------------
const IT={
 coins:{n:'Coins',i:'🪙',st:1,v:1,ex:'Lovely money!'},logs:{n:'Logs',i:'🪵',v:4,ex:'A number of wooden logs.'},
 copper:{n:'Copper ore',i:'🪨',f:'sepia(1) saturate(4) hue-rotate(-25deg)',v:3,ex:'This needs refining.'},tin:{n:'Tin ore',i:'🪨',v:3,ex:'This needs refining.'},
 shrimps:{n:'Shrimps',i:'🦐',v:5,heal:3,ex:'Some nicely cooked shrimps.'},bones:{n:'Bones',i:'🦴',v:1,bury:4.5,ex:'Bones are for burying!'},
 cowhide:{n:'Cowhide',i:'🟫',v:2,ex:'I should take this to the tannery.'},feather:{n:'Feather',i:'🪶',st:1,v:1,ex:'Used for fly-fishing.'},
 axe:{n:'Bronze axe',i:'🪓',v:16,ex:'A woodcutter\'s axe.'},pick:{n:'Bronze pickaxe',i:'⛏️',v:1,ex:'Used for mining.'},net:{n:'Small fishing net',i:'🥅',v:5,ex:'Useful for catching small fish.'},
 sword:{n:'Bronze sword',i:'🗡️',v:26,slot:'weapon',b:{att:4,str:3},ex:'A razor-sharp sword.'},shield:{n:'Wooden shield',i:'🛡️',v:20,slot:'shield',b:{def:5},ex:'A solid wooden shield.'},
 beef:{n:'Cooked meat',i:'🍖',v:4,heal:4,ex:'Mmm, this looks tasty.'},
 air:{n:'Air rune',i:'💨',st:1,v:4,ex:'One of the 4 basic elemental Runes.'},water:{n:'Water rune',i:'💧',st:1,v:4,ex:'One of the 4 basic elemental Runes.'},earth:{n:'Earth rune',i:'🟤',st:1,v:4,ex:'One of the 4 basic elemental Runes.'},
 fire:{n:'Fire rune',i:'🔥',st:1,v:4,ex:'One of the 4 basic elemental Runes.'},mind:{n:'Mind rune',i:'🟠',st:1,v:3,ex:'Used for basic level missile spells.'},
 rawbeef:{n:'Raw beef',i:'🥩',v:1,cook:'beef',ex:'I need to cook this first.'},rawchicken:{n:'Raw chicken',i:'🍗',v:1,cook:'chicken',ex:'I need to cook this first.'},rawshrimps:{n:'Raw shrimps',i:'🦐',v:1,cook:'shrimps',ex:'I should try cooking this.'},chicken:{n:'Cooked chicken',i:'🍗',v:4,heal:3,ex:'Mmm, this looks tasty.'},
 tinder:{n:'Tinderbox',i:'🧰',v:1,ex:'Useful for lighting a fire.'},burnt:{n:'Burnt meat',i:'⬛',v:1,ex:'Oh dear, it\'s totally burnt!'},bread:{n:'Bread',i:'🍞',v:12,heal:5,ex:'Nice crispy bread.'},
 dagger:{n:'Bronze dagger',i:'🗡️',v:10,slot:'weapon',spd:4,b:{att:4,str:3},ex:'Short but pointy.'},scim:{n:'Bronze scimitar',i:'🗡️',v:32,slot:'weapon',spd:4,b:{att:7,str:6},ex:'A vicious, curved sword.'},
 lsword:{n:'Bronze longsword',i:'🗡️',v:40,slot:'weapon',spd:5,b:{att:8,str:7},ex:'A razor-sharp longsword.'},whammer:{n:'Bronze warhammer',i:'🔨',v:52,slot:'weapon',spd:6,b:{att:7,str:9},ex:'I don\'t think it\'s intended for joinery.'},
 staff:{n:'Staff',i:'🦯',v:15,slot:'weapon',spd:5,b:{att:2,str:5,mag:4},ex:'It\'s a slightly magical stick.'},airstaff:{n:'Staff of air',i:'🦯',v:1500,slot:'weapon',spd:5,b:{att:2,str:5,mag:10},rune:'air',ex:'A Magical staff.'},
 sqshield:{n:'Bronze sq shield',i:'🛡️',v:48,slot:'shield',b:{def:6},ex:'A medium square shield.'},medhelm:{n:'Bronze med helm',i:'⛑️',v:24,slot:'head',b:{def:3},ex:'A medium sized helmet.'},
 fullhelm:{n:'Bronze full helm',i:'⛑️',v:44,slot:'head',full:1,b:{def:4},ex:'A full face helmet.'},chain:{n:'Bronze chainbody',i:'🦺',v:60,slot:'body',arms:false,b:{def:9},ex:'A series of connected metal rings.'},
 plate:{n:'Bronze platebody',i:'🦺',v:160,slot:'body',b:{def:15},ex:'Provides excellent protection.'},plegs:{n:'Bronze platelegs',i:'👖',v:80,slot:'legs',b:{def:8},ex:'Big, bronze and heavy looking.'},
 pskirt:{n:'Bronze plateskirt',i:'👗',v:80,slot:'legs',b:{def:8},ex:'Designer leg protection.'},lbody:{n:'Leather body',i:'🦺',v:21,slot:'body',b:{def:8},ex:'Better than no armour!'},
 chaps:{n:'Leather chaps',i:'👖',v:20,slot:'legs',b:{def:3},ex:'Better than no armour!'},gloves:{n:'Leather gloves',i:'🧤',v:6,slot:'hands',b:{def:1},ex:'These will keep my hands warm!'},
 boots:{n:'Leather boots',i:'👢',v:6,slot:'feet',b:{def:1},ex:'Comfortable leather boots.'},vambs:{n:'Leather vambraces',i:'🧤',v:18,slot:'hands',b:{def:3},ex:'These should protect my arms a bit.'},
 cowl:{n:'Leather cowl',i:'⛑️',v:24,slot:'head',b:{def:2},ex:'Better than no armour!'}};
// ---- merged from Tarnish server data (equipment_definitions.json, item_definitions.json, npc_drops.json) ----
Object.assign(IT,{"dagger":{"n":"Bronze dagger","i":"🗡️","v":10,"slot":"weapon","b":{"att":4,"str":3,"def":0,"mag":1},"ex":"Short but pointy.","tid":1205,"spd":4},"sword":{"n":"Bronze sword","i":"🗡️","v":26,"slot":"weapon","b":{"att":4,"str":5,"def":1,"mag":0},"ex":"A razor-sharp sword.","tid":1277,"spd":4},"scim":{"n":"Bronze scimitar","i":"🗡️","v":32,"slot":"weapon","b":{"att":7,"str":6,"def":0,"mag":0},"ex":"A vicious, curved sword.","tid":1321,"spd":4},"lsword":{"n":"Bronze longsword","i":"🗡️","v":40,"slot":"weapon","b":{"att":5,"str":7,"def":2,"mag":0},"ex":"A razor-sharp longsword.","tid":1291,"spd":5},"whammer":{"n":"Bronze warhammer","i":"🔨","v":47,"slot":"weapon","b":{"att":10,"str":8,"def":0,"mag":-4},"ex":"I don't think it's intended for joinery.","tid":1337,"spd":6},"sqshield":{"n":"Bronze sq shield","i":"🛡️","v":48,"slot":"shield","b":{"att":0,"str":0,"def":5,"mag":-6},"ex":"A medium square shield.","tid":1173},"kite":{"n":"Bronze kiteshield","i":"🛡️","v":68,"slot":"shield","b":{"att":0,"str":0,"def":6,"mag":-8},"ex":"A large metal shield.","tid":1189},"medhelm":{"n":"Bronze med helm","i":"⛑️","v":24,"slot":"head","b":{"att":0,"str":0,"def":3,"mag":-3},"ex":"A medium sized helmet.","tid":1139},"fullhelm":{"n":"Bronze full helm","i":"⛑️","v":44,"slot":"head","b":{"att":0,"str":0,"def":4,"mag":-6},"ex":"A full face helmet.","tid":1155,"full":1},"chain":{"n":"Bronze chainbody","i":"🦺","v":60,"slot":"body","b":{"att":0,"str":0,"def":10,"mag":-15},"ex":"A series of connected metal rings.","tid":1103,"arms":false},"plate":{"n":"Bronze platebody","i":"🦺","v":160,"slot":"body","b":{"att":0,"str":0,"def":13,"mag":-30},"ex":"Provides excellent protection.","tid":1117},"plegs":{"n":"Bronze platelegs","i":"👖","v":80,"slot":"legs","b":{"att":0,"str":0,"def":7,"mag":-21},"ex":"Big, heavy looking legs.","tid":1075},"pskirt":{"n":"Bronze plateskirt","i":"👗","v":80,"slot":"legs","b":{"att":0,"str":0,"def":7,"mag":-21},"ex":"Designer leg protection.","tid":1087},"iron_dagger":{"n":"Iron dagger","i":"🗡️","v":35,"slot":"weapon","b":{"att":5,"str":4,"def":0,"mag":1},"ex":"Short but pointy.","tid":1203,"spd":4,"f":"grayscale(1) brightness(.75)"},"iron_sword":{"n":"Iron sword","i":"🗡️","v":91,"slot":"weapon","b":{"att":6,"str":7,"def":1,"mag":0},"ex":"A razor-sharp sword.","tid":1279,"spd":4,"f":"grayscale(1) brightness(.75)"},"iron_scim":{"n":"Iron scimitar","i":"🗡️","v":112,"slot":"weapon","b":{"att":10,"str":9,"def":0,"mag":0},"ex":"A vicious, curved sword.","tid":1323,"spd":4,"f":"grayscale(1) brightness(.75)"},"iron_lsword":{"n":"Iron longsword","i":"🗡️","v":140,"slot":"weapon","b":{"att":8,"str":10,"def":2,"mag":0},"ex":"A razor-sharp longsword.","tid":1293,"spd":5,"f":"grayscale(1) brightness(.75)"},"iron_whammer":{"n":"Iron warhammer","i":"🔨","v":173,"slot":"weapon","b":{"att":11,"str":9,"def":0,"mag":-4},"ex":"I don't think it's intended for joinery.","tid":1335,"spd":6,"f":"grayscale(1) brightness(.75)"},"iron_sqshield":{"n":"Iron sq shield","i":"🛡️","v":168,"slot":"shield","b":{"att":0,"str":0,"def":8,"mag":-6},"ex":"A medium square shield.","tid":1175,"f":"grayscale(1) brightness(.75)"},"iron_kite":{"n":"Iron kiteshield","i":"🛡️","v":238,"slot":"shield","b":{"att":0,"str":0,"def":9,"mag":-8},"ex":"A large metal shield.","tid":1191,"f":"grayscale(1) brightness(.75)"},"iron_medhelm":{"n":"Iron med helm","i":"⛑️","v":84,"slot":"head","b":{"att":0,"str":0,"def":4,"mag":-3},"ex":"A medium sized helmet.","tid":1137,"f":"grayscale(1) brightness(.75)"},"iron_fullhelm":{"n":"Iron full helm","i":"⛑️","v":154,"slot":"head","b":{"att":0,"str":0,"def":6,"mag":-6},"ex":"A full face helmet.","tid":1153,"full":1,"f":"grayscale(1) brightness(.75)"},"iron_chain":{"n":"Iron chainbody","i":"🦺","v":210,"slot":"body","b":{"att":0,"str":0,"def":15,"mag":-15},"ex":"A series of connected metal rings.","tid":1101,"arms":false,"f":"grayscale(1) brightness(.75)"},"iron_plate":{"n":"Iron platebody","i":"🦺","v":560,"slot":"body","b":{"att":0,"str":0,"def":18,"mag":-30},"ex":"Provides excellent protection.","tid":1115,"f":"grayscale(1) brightness(.75)"},"iron_plegs":{"n":"Iron platelegs","i":"👖","v":280,"slot":"legs","b":{"att":0,"str":0,"def":10,"mag":-21},"ex":"Big, heavy looking legs.","tid":1067,"f":"grayscale(1) brightness(.75)"},"iron_pskirt":{"n":"Iron plateskirt","i":"👗","v":280,"slot":"legs","b":{"att":0,"str":0,"def":10,"mag":-21},"ex":"Designer leg protection.","tid":1081,"f":"grayscale(1) brightness(.75)"},"steel_dagger":{"n":"Steel dagger","i":"🗡️","v":125,"slot":"weapon","b":{"att":8,"str":7,"def":0,"mag":1},"ex":"Short but pointy.","tid":1207,"spd":4,"f":"grayscale(1) brightness(1.25)","req":{"Attack":5}},"steel_sword":{"n":"Steel sword","i":"🗡️","v":325,"slot":"weapon","b":{"att":11,"str":12,"def":1,"mag":0},"ex":"A razor-sharp sword.","tid":1281,"spd":4,"f":"grayscale(1) brightness(1.25)","req":{"Attack":5}},"steel_scim":{"n":"Steel scimitar","i":"🗡️","v":400,"slot":"weapon","b":{"att":15,"str":14,"def":0,"mag":0},"ex":"A vicious, curved sword.","tid":1325,"spd":4,"f":"grayscale(1) brightness(1.25)","req":{"Attack":5}},"steel_lsword":{"n":"Steel longsword","i":"🗡️","v":500,"slot":"weapon","b":{"att":14,"str":16,"def":2,"mag":0},"ex":"A razor-sharp longsword.","tid":1295,"spd":5,"f":"grayscale(1) brightness(1.25)","req":{"Attack":5}},"steel_whammer":{"n":"Steel warhammer","i":"🔨","v":640,"slot":"weapon","b":{"att":18,"str":16,"def":0,"mag":-4},"ex":"I don't think it's intended for joinery.","tid":1339,"spd":6,"f":"grayscale(1) brightness(1.25)","req":{"Attack":5}},"steel_sqshield":{"n":"Steel sq shield","i":"🛡️","v":600,"slot":"shield","b":{"att":0,"str":0,"def":12,"mag":-6},"ex":"A medium square shield.","tid":1177,"f":"grayscale(1) brightness(1.25)","req":{"Defence":5}},"steel_kite":{"n":"Steel kiteshield","i":"🛡️","v":850,"slot":"shield","b":{"att":0,"str":0,"def":14,"mag":-8},"ex":"A large metal shield.","tid":1193,"f":"grayscale(1) brightness(1.25)","req":{"Defence":5}},"steel_medhelm":{"n":"Steel med helm","i":"⛑️","v":300,"slot":"head","b":{"att":0,"str":0,"def":7,"mag":-3},"ex":"A medium sized helmet.","tid":1141,"f":"grayscale(1) brightness(1.25)","req":{"Defence":5}},"steel_fullhelm":{"n":"Steel full helm","i":"⛑️","v":550,"slot":"head","b":{"att":0,"str":0,"def":9,"mag":-6},"ex":"A full face helmet.","tid":1157,"full":1,"f":"grayscale(1) brightness(1.25)","req":{"Defence":5}},"steel_chain":{"n":"Steel chainbody","i":"🦺","v":750,"slot":"body","b":{"att":0,"str":0,"def":24,"mag":-15},"ex":"A series of connected metal rings.","tid":1105,"arms":false,"f":"grayscale(1) brightness(1.25)","req":{"Defence":5}},"steel_plate":{"n":"Steel platebody","i":"🦺","v":2000,"slot":"body","b":{"att":0,"str":0,"def":29,"mag":-30},"ex":"Provides excellent protection.","tid":1119,"f":"grayscale(1) brightness(1.25)","req":{"Defence":5}},"steel_plegs":{"n":"Steel platelegs","i":"👖","v":1000,"slot":"legs","b":{"att":0,"str":0,"def":16,"mag":-21},"ex":"Big, heavy looking legs.","tid":1069,"f":"grayscale(1) brightness(1.25)","req":{"Defence":5}},"steel_pskirt":{"n":"Steel plateskirt","i":"👗","v":1000,"slot":"legs","b":{"att":0,"str":0,"def":16,"mag":-21},"ex":"Designer leg protection.","tid":1083,"f":"grayscale(1) brightness(1.25)","req":{"Defence":5}}});
// ---- v37: mithril + rune (tinted tiers, no level reqs so the starter kit is usable)
{const MF='grayscale(1) sepia(1) hue-rotate(190deg) saturate(3) brightness(.8)',RF='grayscale(1) sepia(1) hue-rotate(150deg) saturate(4) brightness(.95)';
 const mk=(id,base,n,v,b,f)=>{const o=Object.assign({},IT[base]);o.n=n;o.v=v;o.b=Object.assign({},o.b,b);o.f=f;delete o.req;IT[id]=o;if(typeof IC==='object'&&IC[base]!=null)IC[id]=IC[base]};
 mk('mithril_fullhelm','steel_fullhelm','Mithril full helm',1430,{def:13},MF);mk('mithril_plate','steel_plate','Mithril platebody',5200,{def:46},MF);
 mk('mithril_plegs','steel_plegs','Mithril platelegs',2600,{def:24},MF);mk('mithril_kite','steel_kite','Mithril kiteshield',2210,{def:22},MF);
 mk('mithril_scim','steel_scim','Mithril scimitar',1040,{att:21,str:20},MF);mk('rune_scim','steel_scim','Rune scimitar',25600,{att:45,str:44},RF);}
IT.axe.slot='weapon';IT.axe.b={att:-2,str:-1,def:0,mag:0};IT.pick.slot='weapon';IT.pick.b={att:4,str:5,def:0,mag:0};
const KIT37=[['mithril_fullhelm',1],['mithril_plate',1],['mithril_plegs',1],['mithril_kite',1],['rune_scim',1],['air',300],['mind',150],['water',100],['earth',100],['fire',100],['shrimps',1],['shrimps',1],['shrimps',1],['bread',1],['bread',1],['beef',1],['axe',1],['pick',1],['net',1],['tinder',1],['coins',10000]];
Object.assign(IT,{knife:{n:'Knife',i:'🔪',v:6,ex:'A dangerous looking knife.'},hammer:{n:'Hammer',i:'🔨',v:1,ex:'Good for hitting things.'},shafts:{n:'Arrow shaft',i:'🥢',st:1,v:1,ex:'A wooden arrow shaft.'},ashes:{n:'Ashes',i:'⚫',v:2,ex:'A heap of ashes.'}});
Object.assign(IC,{"dagger": 1205, "sword": 1277, "scim": 1321, "lsword": 1291, "whammer": 1337, "sqshield": 1173, "kite": 1189, "medhelm": 1139, "fullhelm": 1155, "chain": 1103, "plate": 1117, "plegs": 1075, "pskirt": 1087, "iron_dagger": 1203, "iron_sword": 1279, "iron_scim": 1323, "iron_lsword": 1293, "iron_whammer": 1335, "iron_sqshield": 1175, "iron_kite": 1191, "iron_medhelm": 1137, "iron_fullhelm": 1153, "iron_chain": 1101, "iron_plate": 1115, "iron_plegs": 1067, "iron_pskirt": 1081, "steel_dagger": 1207, "steel_sword": 1281, "steel_scim": 1325, "steel_lsword": 1295, "steel_whammer": 1339, "steel_sqshield": 1177, "steel_kite": 1193, "steel_medhelm": 1141, "steel_fullhelm": 1157, "steel_chain": 1105, "steel_plate": 1119, "steel_plegs": 1069, "steel_pskirt": 1083, "knife": 946, "hammer": 2347, "shafts": 52, "ashes": 592});
const TDROPS={"Goblin":[["bones",1,1,"A"],["sqshield",1,1,"C"],["scim",1,1,"U"],["kite",1,1,"R"],["water",6,6,"C"],["mind",1,2,"C"],["earth",4,4,"U"],["coins",1,24,"C"],["axe",1,1,"U"]],"Cow":[["cowhide",1,1,"A"],["rawbeef",1,1,"A"],["bones",1,1,"A"]],"Cow calf":[["cowhide",1,1,"A"],["rawbeef",1,1,"A"],["bones",1,1,"A"]],"Chicken":[["bones",1,1,"A"],["rawchicken",1,1,"A"],["feather",5,15,"C"]],"Man":[["bones",1,1,"A"],["earth",4,4,"U"],["fire",6,6,"U"],["mind",9,9,"U"],["iron_dagger",1,1,"U"],["medhelm",1,1,"U"],["coins",3,25,"C"],["copper",1,1,"R"]],"Woman":[["bones",1,1,"A"],["earth",4,4,"U"],["fire",6,6,"U"],["mind",9,9,"U"],["iron_dagger",1,1,"U"],["medhelm",1,1,"U"],["coins",3,25,"C"],["copper",1,1,"R"]]};
const SK=['Attack','Hitpoints','Mining','Strength','Agility','Smithing','Defence','Herblore','Fishing','Ranged','Thieving','Cooking','Prayer','Crafting','Firemaking','Magic','Fletching','Woodcutting','Runecraft','Slayer','Farming','Construction','Hunter'];
const SKI={Attack:'⚔️',Hitpoints:'❤️',Mining:'⛏️',Strength:'💪',Agility:'🏃',Smithing:'🔨',Defence:'🛡️',Herblore:'🌿',Fishing:'🐟',Ranged:'🏹',Thieving:'💰',Cooking:'🍳',Prayer:'✨',Crafting:'🧵',Firemaking:'🔥',Magic:'🔮',Fletching:'🪶',Woodcutting:'🪓',Runecraft:'🌀',Slayer:'💀',Farming:'🌱',Construction:'🏠',Hunter:'🐾'};
const XPT=[0,0];{let p=0;for(let l=1;l<120;l++){p+=Math.floor(l+300*Math.pow(2,l/7));XPT[l+1]=Math.floor(p/4)}}
const lvlOf=xp=>{let l=1;while(l<99&&xp>=XPT[l+1])l++;return l};
// ---------------- state ----------------
const SPAWN=(()=>{for(let r=0;r<6;r++)for(let a=-r;a<=r;a++)for(let b=-r;b<=r;b++)if(walkable(86+a,109+b))return[86+a,109+b];return[86,109]})(); // Lumbridge castle courtyard (3222,3218)
const PAL={shirt:['#7a2020','#204a7a','#2a6a2a','#6a4a1a','#5a2a6a','#8a7a2a'],legs:['#3a3a5a','#4a3a2a','#2a2a2a','#5a5a5a'],hair:['#3a2412','#d8b060','#111111','#8a4a1a','#bbbbbb']};
function freshState(){const xp={};for(const s of SK)xp[s]=0;xp.Hitpoints=XPT[10];return{v:1,name:'',xp,inv:KIT37.map(([id,q])=>({id,q})).concat(Array(28-KIT37.length).fill(null)),
 eq:{},bank:{},pos:SPAWN.slice(),run:true,energy:100,hp:10,pp:1,style:0,ar:true,tasks:{},look:[rnd(6),rnd(4),rnd(5)],xpdrops:true,played:0}}
function normalizeState(raw){const base=freshState();if(!raw||typeof raw!=='object'||Array.isArray(raw)||raw.v!==1)return base;
 const xp=Object.assign({},base.xp,raw.xp&&typeof raw.xp==='object'?raw.xp:{});for(const k of Object.keys(xp)){const n=Number(xp[k]);xp[k]=Number.isFinite(n)?Math.max(0,n):0}
 const inv=Array.isArray(raw.inv)?raw.inv.slice(0,28).map(s=>s&&typeof s==='object'&&typeof s.id==='string'?{id:s.id,q:Math.max(1,Math.floor(Number(s.q)||1))}:null):base.inv;
 while(inv.length<28)inv.push(null);
 const pos=Array.isArray(raw.pos)&&Number.isFinite(Number(raw.pos[0]))&&Number.isFinite(Number(raw.pos[1]))?[Math.floor(Number(raw.pos[0])),Math.floor(Number(raw.pos[1]))]:base.pos;
 const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
 const look=Array.isArray(raw.look)&&raw.look.length>=3?raw.look.slice(0,3).map((n,i)=>{const m=[6,4,5][i],v=Number(n),k=Number.isFinite(v)?Math.floor(v):0;return((k%m)+m)%m}):base.look;
 return Object.assign(base,raw,{v:1,xp,inv,eq:obj(raw.eq),bank:obj(raw.bank),tasks:obj(raw.tasks),pos,look,
  name:typeof raw.name==='string'?raw.name:'',hp:Number.isFinite(Number(raw.hp))?Math.max(0,Number(raw.hp)):base.hp,
  pp:Number.isFinite(Number(raw.pp))?Math.max(0,Number(raw.pp)):base.pp,
  energy:Number.isFinite(Number(raw.energy))?Math.max(0,Math.min(100,Number(raw.energy))):base.energy,
  style:Math.max(0,Math.min(2,Math.floor(Number(raw.style)||0))),played:Number.isFinite(Number(raw.played))?Math.max(0,Number(raw.played)):0});
}
let ST;try{ST=normalizeState(JSON.parse(ls('om.save.v3')||'null'))}catch(e){ST=freshState()}
const lv=s=>lvlOf(ST.xp[s]||0);
function save(){lset('om.save.v3',JSON.stringify(ST))}
const bonus=k=>Object.values(ST.eq).reduce((a,id)=>a+((id&&IT[id].b&&IT[id].b[k])||0),0);
const combatLvl=()=>{const b=.25*(lv('Defence')+lv('Hitpoints')+Math.floor(lv('Prayer')/2)),m=.325*(lv('Attack')+lv('Strength'));return Math.floor(b+m)};
// ---------------- pathfinding (A*, 8-dir, no corner cutting) ----------------
const DIRS=[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];
const canStep=stepOK;
function findPath(sx,sz,goal,hx,hz,max=40000){const N=W*H,g=new Float32Array(N).fill(1e9),from=new Int32Array(N).fill(-1),closed=new Uint8Array(N);const heap=[];
 const push=(i,f)=>{heap.push([f,i]);let k=heap.length-1;while(k>0){const p=(k-1)>>1;if(heap[p][0]<=heap[k][0])break;[heap[p],heap[k]]=[heap[k],heap[p]];k=p}};
 const pop=()=>{const t=heap[0],l=heap.pop();if(heap.length){heap[0]=l;let k=0;for(;;){const a=2*k+1,b=a+1;let m=k;if(a<heap.length&&heap[a][0]<heap[m][0])m=a;if(b<heap.length&&heap[b][0]<heap[m][0])m=b;if(m===k)break;[heap[m],heap[k]]=[heap[k],heap[m]];k=m}}return t};
 const hh=(x,z)=>Math.max(Math.abs(x-hx),Math.abs(z-hz));const s=I(sx,sz);g[s]=0;push(s,hh(sx,sz));let n=0,best=s,bh=1e9;
 while(heap.length&&n++<max){const[,i]=pop();if(closed[i])continue;closed[i]=1;const x=i%W,z=(i/W)|0;if(goal(x,z)){const p=[];for(let k=i;k!==s;k=from[k])p.push([k%W,(k/W)|0]);return p.reverse()}
  const h0=hh(x,z);if(h0<bh){bh=h0;best=i}
  for(const[dx,dz]of DIRS){if(!canStep(x,z,dx,dz))continue;const j=I(x+dx,z+dz);const ng=g[i]+(dx&&dz?1.001:1);if(ng<g[j]){g[j]=ng;from[j]=i;push(j,ng+hh(x+dx,z+dz))}}}
 return null}
const cheb=(a,b,c,d)=>Math.max(Math.abs(a-c),Math.abs(b-d));
const card=(a,b,c,d)=>Math.abs(a-c)+Math.abs(b-d)===1;
/* pb9: melee range = Chebyshev 1 (8-way). Spears/halberds reach 2. */
const atkRange=()=>{const w=ST.eq&&ST.eq.weapon&&IT[ST.eq.weapon],n=(w&&(w.n||''))||'';return /halberd|spear|hasta/i.test(n)?2:1};
const inMelee=(ax,az,bx,bz)=>cheb(ax,az,bx,bz)<=atkRange();
// ---------------- entities ----------------
const ENTS=[];let TICKN=0,tickT0=performance.now();
class Ent{constructor(kind,x,z,r){this.kind=kind;this.x=x;this.z=z;this.r=r;this.pts=[[x+.5,z+.5]];this.t0=0;this.face=0;this.vf=0;this.phase=0;this.atkT=-9;this.hitT=-99;this.dead=0;r.g.userData.ent=this;ENTS.push(this)}
 moveTo(steps){const p=[[this.x+.5,this.z+.5]];for(const[x,z]of steps){p.push([x+.5,z+.5]);this.x=x;this.z=z}if(steps.length){this.pts=p;this.t0=performance.now();const a=p[p.length-2],b=p[p.length-1];this.face=Math.atan2(b[0]-a[0],b[1]-a[1])}}
 vpos(now){const p=this.pts,u=Math.max(0,Math.min(1,(now-this.t0)/TICK));if(p.length<2)return[p[0][0],p[0][1],0];const f=u*(p.length-1),k=Math.min(p.length-2,Math.floor(f)),t=f-k;return[p[k][0]+(p[k+1][0]-p[k][0])*t,p[k][1]+(p[k+1][1]-p[k][1])*t,u<1?1:0]}
 faceTo(x,z){this.face=Math.atan2(x-this.x,z-this.z)}
 snap(x,z){this.x=x;this.z=z;this.pts=[[x+.5,z+.5]]}}
const look=ST.look;
const me=new Ent('player',ST.pos[0],ST.pos[1],makePlayer(ST.eq));
if(!walkable(me.x,me.z))me.snap(...SPAWN);

// v20: player built from the original cache identity kits + worn item models (falls back to procedural with ?kit=0)
function playerRig(eq){const parts=playerParts(eq);if(parts.length<5)return null;
 const wd=wornDef(eq.weapon),sd=wornDef(eq.shield);
 const wm=wd?wd.mw:-1,sm=sd?sd.mw:-1;
 const acc=new Acc();const tf=(x,y,z)=>[x/128,-y/128,-z/128];let wa=-1,wb=-1,sa=-1,sb=-1;
 for(const[mid,rf,rt]of parts){const n0=acc.p.length/3;emit(acc,mid,{npc:1,rf,rt,tf});const n1=acc.p.length/3;if(mid===wm&&wa<0){wa=n0;wb=n1}else if(mid===sm&&sa<0){sa=n0;sb=n1}}
 const geo=acc.geo();const pa=geo.getAttribute('position');if(!pa||pa.count<12)return null;
 const bb=geo.boundingBox,h=bb.max.y-bb.min.y,y0=bb.min.y;
 // body extents from non-weapon verts
 let mnx=1e9,mxx=-1e9;for(let i=0;i<pa.count;i++){if((i>=wa&&i<wb)||(i>=sa&&i<sb))continue;const x=pa.array[i*3];mnx=Math.min(mnx,x);mxx=Math.max(mxx,x)}
 const cx=(mnx+mxx)/2,cz=(bb.min.z+bb.max.z)/2,n=pa.count,P0=new Float32Array(pa.array),G=new Int8Array(n);const hipY=y0+h*.46,shY=y0+h*.8;
 let hw=0;for(let i=0;i<n;i++){if((i>=wa&&i<wb)||(i>=sa&&i<sb))continue;const y=P0[i*3+1];if(y>y0+h*.5&&y<y0+h*.78)hw=Math.max(hw,Math.abs(P0[i*3]-cx))}
 let wx=0;if(wb>wa){for(let i=wa;i<wb;i++)wx+=P0[i*3]-cx;wx/=(wb-wa)}const flip=wx<0;
 for(let i=0;i<n;i++){const x=P0[i*3]-cx,y=P0[i*3+1];let g=0;if(i>=wa&&i<wb)g=4;else if(i>=sa&&i<sb)g=3;else if(y<hipY&&Math.abs(x)<hw*.55)g=x<0?1:2;else if(y<shY+h*.04&&Math.abs(x)>hw*.55){g=x<0?3:4;if(flip)g=7-g}else if(y<hipY)g=x<0?1:2;G[i]=g}
 const g=new THREE.Group(),b=piv(g,0,0,0),m=osMesh(geo);b.add(m);const top=Math.max(.6,bb.max.y);
 return {g:rig(g,1),b,legs:[],AL:piv(b,0,0,0),AR:piv(b,0,0,0),hd:piv(b,0,top,0),type:'cr',mesh:m,top,size:1,kit:1,cr:{P0,G,pa,hipY,shY,cz,ph:0,last:-1}}}
function makePlayer(eq){return makePlayerBW(eq||{})}
function refreshGear(eqO){const EQ=eqO||ST.eq;if(!eqO)me._tool='';let r2;try{r2=makePlayer(EQ)}catch(e){console.warn('gear',e);r2=makePlayerBW(EQ)}if(!r2||!r2.g){r2=makePlayerBW(EQ)}const old=me.r;r2.g.position.copy(old.g.position);r2.g.rotation.copy(old.g.rotation);S.remove(old.g);if(!r2.g.parent)S.add(r2.g);r2.g.visible=true;me.r=r2;me._fl=null;if(!eqO&&typeof renderPanel==='function'&&UI.tab)renderPanel()}
function showTool(){const a=me.act&&me.act.t;const t=a==='mine'?'pick':a==='chop'?'axe':a==='fish'?'net':null;const w=t&&hasTool(t)?t:'';if((me._tool||'')===w)return;me._tool=w;try{refreshGear(w?Object.assign({},ST.eq,{weapon:w,shield:null}):ST.eq);me._tool=w}catch(e){}}
me.path=[];me.act=null;me.cd=0;me.skillCd=0;
// monsters & NPCs placed from the Tarnish server's own spawn table (npc_spawns.json), models/levels from the cache
const MS={Goblin:[2,5,1,1,1,1],Cow:[2,8,1,1,1,1],'Cow calf':[2,6,1,1,1,1],Chicken:[1,3,1,1,1,0],Duck:[1,3,1,1,1,0],Drake:[1,3,1,1,1,0],Duckling:[1,3,1,1,1,0],Rat:[1,2,1,1,1,0],'Giant rat':[3,5,2,3,2,1],
 Man:[2,7,1,1,1,1],Woman:[2,7,1,1,1,1],'Giant spider':[2,5,1,1,1,1],Imp:[2,8,1,1,1,0],Frog:[5,8,4,4,4,1],'Big frog':[10,18,8,8,8,2],'Giant frog':[13,23,10,10,10,2],Mugger:[6,8,5,5,5,1],Ram:[2,8,1,1,1,1],Unicorn:[15,19,11,13,13,2],Farmer:[7,12,6,6,6,1],Crow:[4,7,3,3,3,1],'Monk of Zamorak':[22,20,18,18,22,3],Zeke:[0]};
const EXM={Goblin:'An ugly green creature.',Cow:'Converts grass to beef.','Cow calf':'Young and tender; nearly ready for the slaughter.',Chicken:'Yep, definitely a chicken.',Duck:'Quackers.',Rat:'A popular dwarven delicacy.','Giant rat':'Overgrown vermin.',Man:'One of Gielinor\'s many citizens.',Woman:'One of Gielinor\'s many citizens.','Giant spider':'I think this spider has been genetically modified.',Frog:'A frog.',Imp:'A cheeky little imp.',Sheep:'Freshly sheared.',Butterfly:'A small fluttering creature.'};
const GEAR_T=['dagger','sqshield','medhelm','sword','chaps','boots','gloves','lbody','scim','fullhelm','staff','chain'];
const DROPS={Goblin:()=>[['bones',1],Math.random()<.45?['coins',1+rnd(14)]:Math.random()<.4?[['air','water','earth','fire','mind'][rnd(5)],3+rnd(6)]:null,Math.random()<.22?[GEAR_T[Math.min(GEAR_T.length-1,Math.floor(Math.random()**1.6*GEAR_T.length))],1]:null],Cow:()=>[['bones',1],['cowhide',1],['rawbeef',1]],'Cow calf':()=>[['bones',1],['cowhide',1]],
 Chicken:()=>[['bones',1],['rawchicken',1],['feather',5+rnd(10)]],Man:()=>[['bones',1],Math.random()<.6?['coins',3+rnd(20)]:null],Woman:()=>[['bones',1],Math.random()<.6?['coins',3+rnd(20)]:null]};
// Tarnish-style NPC table: preserve all guaranteed drops, then roll exactly
// one rarity tier and select one item uniformly from that tier.
for(const k in TDROPS){const T=TDROPS[k];DROPS[k]=()=>{const out=T.filter(r=>r[3]==='A').map(r=>[r[0],r[1]]),roll=rnd(20001),tier=roll<200?'V':roll<550?'R':roll<7550?'U':'C',items=T.filter(r=>r[3]===tier&&IT[r[0]]);if(items.length){const r=items[rnd(items.length)];out.push([r[0],r[1]+rnd(r[2]-r[1]+1)])}return out}}
const MD={},TARNISH_ITEM_IDS=new Map();for(const [key,itemId] of Object.entries(IC))if(IT[key]&&!TARNISH_ITEM_IDS.has(itemId))TARNISH_ITEM_IDS.set(itemId,key);const MON=[],NPCS=[];
function rollTarnishDrops(id,fallback){const rows=tarnishDropRows(id);if(!rows)return fallback();const out=[];for(const r of rows)if(r[3]==='ALWAYS'){const key=TARNISH_ITEM_IDS.get(r[0]);if(key)out.push([key,r[1]])}const roll=rnd(20001),tier=roll<200?'VERY_RARE':roll<550?'RARE':roll<7550?'UNCOMMON':'COMMON',choices=rows.filter(r=>r[3]===tier);if(choices.length){const r=choices[rnd(choices.length)],key=TARNISH_ITEM_IDS.get(r[0]);if(key&&IT[key])out.push([key,r[1]+rnd(r[2]-r[1]+1)])}return out}
function mdFor(id){if(MD[id])return MD[id];const d=WD.npc[id]||{name:'?'},n=d.name,st=MS[n]||[d.cl||1,Math.max(3,(d.cl||1)*2),1,1,1,1],td=TARNISH_COMBAT[id]||{},fallback=DROPS[n]||(()=>[['bones',1]]);const atk=td['attack-level']??st[2]??(d.cl||1),str=td['strength-level']??st[3]??(d.cl||1),def=td['defence-level']??st[4]??(d.cl||1),hp=td['hitpoints-level']||st[1]||Math.max(3,(d.cl||1)*2),strBonus=td['bonus-strength']||0;const max=td['max-hit']??Math.floor(.5+(str+8)*(64+strBonus)/640);
 return MD[id]={n,id,lvl:td['combat-level']||d.cl||st[0],hp,att:atk,str,def,max,spd:td['attack-cooldown']||4,attackStyle:td['attack-style']||'Melee',weakness:td.weakness||'',aggressive:td.aggressive===true,retaliate:td.retaliate,respawn:td.respawn,attackRadius:td['attack-radius'],size:d.size||1,bonusStrength:strBonus,attackBonus:0,mag:td['magic-level']||1,mdef:td['defence-magic']||0,defence:td,ex:EXM[n]||'',drop:()=>rollTarnishDrops(id,fallback)}}
const LINES={'Hans':['Hello. What are you doing here?','I\'m Hans, I\'ve been looking after the castle for years.','The Duke is upstairs, and the cook keeps to his kitchen.'],
 'Cook':['What am I to do?','The Duke\'s birthday is today and I\'ve no ingredients! If you find an egg, some milk and some flour, do let me know.'],
 'Duke Horacio':['Greetings. Welcome to my castle.','Lumbridge is a peaceful place. Mind the goblins east of the river.'],
 'Father Aereck':['Welcome to the church of holy Saradomin.','You may pray at the altar to recharge your Prayer points.'],
 'Shop assistant':['Can I help you at all?','Use the counter to trade with us.'],'Lumbridge Guide':['Greetings, adventurer! Welcome to Lumbridge.','Tap the ground to walk. Tap the Run orb by the minimap to toggle running. Press and hold on anything for more options.','Goblins wander east of the River Lum, past the church. Cows graze in the fields to the north-east and chickens peck about by the farm north of the castle.','Chop trees around the castle, mine copper and tin in the swamp to the south, and net shrimps from the swamp\'s fishing spots. Cast Wind Strike from your spellbook at a goblin!','Al Kharid bank is east through the toll gate. Check the Quests tab for my tasks. Good luck!']};
const FACE=[Math.PI,Math.PI/2,0,-Math.PI/2];
function npc(name,x,z,id,lines,face=0){const n=new Ent('npc',x,z,makeNpc(id,'npc'));n.name=name;n.lines=lines;n.face=face;n.static=1;n.nid=id;NPCS.push(n);return n}
const SKIPN=new Set(['Fishing spot','Butterfly','Tool Leprechaun','Nurmof','Gee','Donie','Paul','Juan','Nigel','Zeke','Ducklings','Crow']);
const _spT=[];for(const[id,lx,ly,f,rad]of WD.sp){const d=WD.npc[id];if(!d)continue;const x=lx,z=SZ-1-ly;if(!inb(x,z)||!inBox(x,z))continue;
 if((d.actions||[]).includes('Attack')){const n=d.name||'';const gap=/Goblin/.test(n)?6:4;if(_spT.some(t=>t[0]===n&&Math.max(Math.abs(t[1]-x),Math.abs(t[2]-z))<gap))continue;_spT.push([n,x,z])}
 if(d.name==='Fishing spot'){const o={kind:'fish',x,z,name:'Fishing spot'};FISH.push(o);objAt.set(I(x,z),o);OBJ.push(o);continue}
 if(SKIPN.has(d.name))continue;
 const atk=(d.actions||[]).includes('Attack')&&MS[d.name]&&MS[d.name][0]>0;
 if(atk){const md=mdFor(id),m=new Ent('mon',x,z,makeNpc(id,'mon'));m.d=md;m.type=md.n.toLowerCase().replace(/ /g,'');m.hp=md.hp;m.sx=x;m.sz=z;const r=Math.max(3,rad||4);m.area=[x-r,z-r,x+r,z+r];m.aggro=null;m.cd=0;m.face=FACE[f]||0;MON.push(m)}
 else npc(d.name,x,z,id,LINES[d.name]||['Hello there.'],FACE[f]||0)}
// ---- v43: extra spawns (a second copy of a few attackable monsters nearby)
{const seen={};let add=0;for(const[id,lx,ly,f]of WD.sp){if(add>=8)break;const d=WD.npc[id];if(!d)continue;const x0=lx,z0=SZ-1-ly;if(!inb(x0,z0)||!inBox(x0,z0))continue;
  if(!((d.actions||[]).includes('Attack')&&MS[d.name]&&MS[d.name][0]>0))continue;if((seen[d.name]=(seen[d.name]||0)+1)>2)continue;
  for(const[dx,dz]of[[2,1],[-2,2],[1,-2],[3,0]]){const x=x0+dx,z=z0+dz;if(!inb(x,z)||!inBox(x,z)||MON.some(m=>m.sx===x&&m.sz===z))continue;
   const md=mdFor(id),m=new Ent('mon',x,z,makeNpc(id,'mon'));m.d=md;m.type=md.n.toLowerCase().replace(/ /g,'');m.hp=md.hp;m.sx=x;m.sz=z;const r=4;m.area=[x-r,z-r,x+r,z+r];m.aggro=null;m.cd=0;m.face=FACE[f]||0;m.extra43=1;MON.push(m);add++;break}}
 window.__OM43spawns=add}
// ---- v12: invisible walls outside the box, block the new rocks, and move monsters that cannot be reached into the open field
for(let z=0;z<SZ;z++)for(let x=0;x<SZ;x++)if(!inBox(x,z))COL[oi(x,z)]|=1;
// Small trail markers mark the expanded terrain without changing collision.
const trailMarkers = [[52,76],[63,62],[138,98],[120,131]].flatMap(([x,z]) => {
  for (let dz=-2;dz<=2;dz++) for (let dx=-2;dx<=2;dx++) {
    const tx=x+dx,tz=z+dz;
    if (walkable(tx,tz) && !objAt.has(I(tx,tz)) && TOT[oi(tx,tz)]!==1)
      return [{x:tx+.72,z:tz+.72,y:hAt(tx+.72,tz+.72)}];
  }
  return [];
});
if (trailMarkers.length) {
  const parts = [
    [new THREE.CylinderGeometry(.18,.25,.19,6),lam(0x686d72),.095],
    [new THREE.CylinderGeometry(.075,.11,.34,5),lam(0x49332b),.34],
    [new THREE.OctahedronGeometry(.14),new THREE.MeshBasicMaterial({color:0xffc472}),.61],
  ];
  for (const [geometry,material,offset] of parts)
    inst(geometry,material,trailMarkers,(marker,object)=>{
      reset();
      object.position.set(marker.x,marker.y+offset,marker.z);
    });
}

// Meadow detail pass: visual-only grass, flowers and stones on existing green ground.
// It uses the decoded height samples, skips collision/roof/resource tiles and never enters picking.
{
 const coarse=matchMedia('(pointer:coarse)').matches,grassMax=coarse?230:420,flowerMax=coarse?24:52,stoneMax=coarse?38:76;
 const positions=[],colors=[],flowers=[],stones=[];
 const blade=(x,y,z,angle,height,width,color)=>{
  const dx=Math.cos(angle)*width,dz=Math.sin(angle)*width,lx=Math.cos(angle+1.1)*height*.22,lz=Math.sin(angle+1.1)*height*.22;
  positions.push(x-dx,y,z-dz,x+dx,y,z+dz,x+lx,y+height,z+lz);
  const c=new THREE.Color(color),top=c.clone().lerp(new THREE.Color(0xd2df9c),.2);
  for(const v of[0,0,1])colors.push(v?top.r:c.r,v?top.g:c.g,v?top.b:c.b);
 };
 let tuftN=0;
 // Visit tiles in a dispersed order so the small mobile budget reaches every region.
 const spanX=BOX[2]-BOX[0]+1,spanZ=BOX[3]-BOX[1]+1,tileCount=spanX*spanZ;
 const gcd=(a,b)=>{while(b){const r=a%b;a=b;b=r}return a};
 let stride=Math.floor(tileCount*.618)|1;while(gcd(stride,tileCount)!==1)stride+=2;
 for(let n=0;n<tileCount&&(tuftN<grassMax||flowers.length<flowerMax||stones.length<stoneMax);n++){
  const tile=(n*stride+Math.floor(tileCount*.37))%tileCount,x=BOX[0]+tile%spanX,z=BOX[1]+Math.floor(tile/spanX);
  const k=oi(x,z),u=TUB[k],q=u-1,h=q>>10,sat=(q>>7)&7;
  if(!u||!walkable(x,z)||objAt.has(I(x,z))||roofTile[k]||TOT[k]===1||h<4||h>13||sat<3)continue;
  const r=hs(x,z,733),jx=(hs(x,z,734)-.5)*.62,jz=(hs(x,z,735)-.5)*.62,px=x+.5+jx,pz=z+.5+jz,py=hAt(px,pz)+.012;
  if(tuftN<grassMax&&r<.19){const a=hs(x,z,736)*Math.PI*2;for(let b=0;b<3;b++)blade(px,py,pz,a+b*2.094,.14+hs(x,z,737+b)*.13,.025+hs(x,z,741+b)*.018,[0x607f3c,0x77954a,0x8a9d52][b]);tuftN++}
  if(flowers.length<flowerMax&&r<.026)flowers.push({x:px,y:py+.15,z:pz,seed:hs(x,z,742)});
  if(stones.length<stoneMax&&r>.78&&r<.805)stones.push({x:px,y:py,z:pz,seed:hs(x,z,743)});
 }
 if(positions.length){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();const meadow=new THREE.Mesh(geo,new THREE.MeshLambertMaterial({vertexColors:true,side:THREE.DoubleSide}));meadow.userData.visualGroundCover=1;meadow.raycast=()=>{};S.add(meadow)}
 if(flowers.length){const geo=new THREE.SphereGeometry(.045,6,4),m=new THREE.MeshLambertMaterial({color:0xffffff,vertexColors:false});const im=new THREE.InstancedMesh(geo,m,flowers.length),o=new THREE.Object3D(),pal=[0xf3d96c,0xe8a4bc,0xf0eee0];flowers.forEach((f,i)=>{o.position.set(f.x,f.y,f.z);const sc=.72+f.seed*.55;o.scale.set(sc,.72*sc,sc);o.rotation.y=f.seed*6.28;o.updateMatrix();im.setMatrixAt(i,o.matrix);im.setColorAt(i,new THREE.Color(pal[i%pal.length]))});im.raycast=()=>{};S.add(im)}
 if(stones.length){const geo=new THREE.DodecahedronGeometry(.13,0),m=new THREE.MeshLambertMaterial({color:0x8b8c82,flatShading:true}),im=new THREE.InstancedMesh(geo,m,stones.length),o=new THREE.Object3D();stones.forEach((s,i)=>{o.position.set(s.x,s.y+.07,s.z);o.scale.set(.7+s.seed*.8,.45+s.seed*.45,.7+(1-s.seed)*.6);o.rotation.set(s.seed, s.seed*6.28, 0);o.updateMatrix();im.setMatrixAt(i,o.matrix);const v=.8+s.seed*.25;im.setColorAt(i,new THREE.Color(v,v*.98,v*.92))});im.raycast=()=>{};S.add(im)}
 window.__OMmeadow={tufts:tuftN,flowers:flowers.length,stones:stones.length,visualOnly:true};
}

for(const[x,z]of(window.__MINE||[]))COL[oi(x,z)]|=1;
{const seed=(()=>{for(let r=0;r<6;r++)for(let dx=-r;dx<=r;dx++)for(let dz=-r;dz<=r;dz++)if(walkable(118+dx,92+dz))return[118+dx,92+dz]})();const R=new Set();
 if(seed){const q=[seed];R.add(I(...seed));while(q.length){const[x,z]=q.pop();for(const[dx,dz]of[[1,0],[-1,0],[0,1],[0,-1]]){const k=I(x+dx,z+dz);if(!R.has(k)&&stepOK(x,z,dx,dz)){R.add(k);q.push([x+dx,z+dz])}}}}
 const F=[];for(let x=106;x<=128;x++)for(let z=80;z<=106;z++)if(R.has(I(x,z))&&walkable(x,z))F.push([x,z]);let n=0;
 for(const m of MON){if(R.has(I(m.x,m.z))||!F.length)continue;const[x,z]=F[(n++*37+11)%F.length];m.x=x;m.z=z;m.sx=x;m.sz=z;m.area=[x-4,z-4,x+4,z+4];if(m.snap)m.snap(x,z)}
 window.__REACH=R.size;window.__MOVED=n}
// river trout spots (unresolved names) → fishing spots on the River Lum
for(const[x0,y0]of[[3238,3231],[3236,3241],[3235,3245],[3234,3254]]){const x=x0-BX,z=SZ-1-(y0-BY);const o={kind:'fish',x,z,name:'Fishing spot'};FISH.push(o);objAt.set(I(x,z),o);OBJ.push(o)}
const guide=npc('Lumbridge Guide',SPAWN[0]+3,SPAWN[1]-1,306,LINES['Lumbridge Guide'],-Math.PI/2);
const shopk=npc('Shop keeper',3212-BX,SZ-1-(3246-BY),2813,['Can I help you at all?','Use the counter to trade with me.'],Math.PI/2);shopk.store=1;
const banker=npc('Banker',3270-BX,SZ-1-(3167-BY),766,['Good day. Would you like to access your bank account?'],-Math.PI/2);banker.bank=1;for(const[dx,dz]of[[-2,2],[-3,2],[2,3],[-2,-2],[3,-2],[4,0]])if(walkable(SPAWN[0]+dx,SPAWN[1]+dz)){banker.snap(SPAWN[0]+dx,SPAWN[1]+dz);banker.lines=['Good day. Would you like to access your bank account?'];break}
// fishing spot ripples
const fishM=new THREE.MeshBasicMaterial({color:0xddeeff,transparent:true,opacity:.7,side:THREE.DoubleSide});
for(const f of FISH){f.mesh=new THREE.Group();for(let k=0;k<2;k++){const r=new THREE.Mesh(new THREE.RingGeometry(.15,.22,12),fishM);r.rotation.x=-Math.PI/2;f.mesh.add(r)}f.mesh.position.set(f.x+.5,hAt(f.x+.5,f.z+.5)+.04,f.z+.5);const hit=new THREE.Mesh(new THREE.CircleGeometry(.6,8),new THREE.MeshBasicMaterial({visible:false}));hit.rotation.x=-Math.PI/2;hit.userData.obj=f;f.mesh.add(hit);PICK.push(hit);S.add(f.mesh)}
// ground items
const GI=[];const spriteCache={};
function itemTex(id){if(spriteCache[id])return spriteCache[id];const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.font='48px "Apple Color Emoji","Noto Color Emoji",sans-serif';x.textAlign='center';x.textBaseline='middle';if(IT[id].f)x.filter=IT[id].f;x.fillText(IT[id].i,32,36);const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;return spriteCache[id]=t}
function dropItem(id,q,x,z){const st=IT[id].st,ex=st&&GI.find(g=>g.id===id&&g.x===x&&g.z===z);if(ex){ex.q+=q;return}const s=new THREE.Sprite(new THREE.SpriteMaterial({map:itemTex(id),depthWrite:false}));s.scale.set(.55,.55,.55);s.position.set(x+.5+(Math.random()-.5)*.3,hAt(x+.5,z+.5)+.3,z+.5+(Math.random()-.5)*.3);S.add(s);const g={id,q,x,z,s,exp:TICKN+300};s.userData.gi=g;GI.push(g)}
function removeGI(g){S.remove(g.s);g.s.material.dispose();GI.splice(GI.indexOf(g),1)}
// ---------------- inventory / xp ----------------
const invCount=id=>ST.inv.reduce((a,s)=>a+(s&&s.id===id?s.q:0),0);
const hasTool=id=>invCount(id)>0||Object.values(ST.eq).includes(id);
const freeSlots=()=>ST.inv.filter(s=>!s).length;
function addItem(id,q=1){if(IT[id].st){const s=ST.inv.find(s=>s&&s.id===id);if(s){s.q+=q;invChanged();return true}}let left=IT[id].st?1:q;for(let i=0;i<28&&left>0;i++)if(!ST.inv[i]){ST.inv[i]={id,q:IT[id].st?q:1};left--}invChanged();return left===0}
function invChanged(){if(UI.tab==='inv'||UI.tab==='equip'||UI.mode)renderPanel()}
function gainXP(skill,amt){const before=lv(skill);ST.xp[skill]=(ST.xp[skill]||0)+amt;const after=lv(skill);if(ST.xpdrops)xpDrop(skill,amt);if(after>before){msg(`<span style="color:#0000a0">Congratulations, you just advanced a ${skill} level.</span>`);levelUp(skill,after);if(skill==='Hitpoints')ST.hp+=after-before;if(skill==='Prayer')ST.pp+=after-before}if(UI.tab==='skills'||UI.tab==='combat')renderPanel()}
function task(k){if(ST.tasks[k])return;ST.tasks[k]=1;addItem('coins',50);msg(`<span style="color:#7a0000">Guide task complete: ${(TASKS.find(t=>t[0]===k)||[0,k])[1]} (+50 coins)</span>`);if(TASKS.every(t=>ST.tasks[t[0]])&&!ST.tasks.reward){ST.tasks.reward=1;addItem('coins',100);showDialog('Lumbridge Guide',['Well done! You have completed all of my tasks. Here are 100 coins as a reward.'])}if(UI.tab==='quests')renderPanel()}
const TASKS=[['talk','Talk to the Guide'],['goblin','Kill a goblin'],['chop','Chop some logs'],['mine','Mine some ore'],['fish','Catch some shrimps'],['bury','Bury some bones'],['bank','Visit the bank'],['eat','Eat some food'],['fire','Light a fire'],['cook','Cook some food']];
function startGoblinSlayer(){if(ST.tasks.gs_started||ST.tasks.gs_done)return;ST.tasks.gs_started=1;ST.tasks.gs_kills=0;save();msg('<b style="color:#d5ad52">Quest started: Goblin Slayer.</b> Defeat three goblins east of the river; their champion will appear in the field.');if(UI.tab==='quests')renderPanel()}
function progressGoblinSlayer(){if(!ST.tasks.gs_started||ST.tasks.gs_done)return;ST.tasks.gs_kills=Math.min(3,(ST.tasks.gs_kills||0)+1);save();if(UI.tab==='quests')renderPanel();if(ST.tasks.gs_kills===3)spawnGoblinSlayerChampion()}
function spawnGoblinSlayerChampion(restoring=false){if((ST.tasks.gs_bossSpawned&&!restoring)||ST.tasks.gs_done||MON.some(m=>m.questBoss&&!m.dead))return;const near=MON.filter(m=>m.type==='goblin').sort((a,b)=>cheb(a.x,a.z,me.x,me.z)-cheb(b.x,b.z,me.x,me.z))[0];let tile=null;
 if(near)for(let r=1;r<=5&&!tile;r++)for(let dx=-r;dx<=r&&!tile;dx++)for(let dz=-r;dz<=r&&!tile;dz++){const x=near.x+dx,z=near.z+dz;if(Math.max(Math.abs(dx),Math.abs(dz))!==r||!walkable(x,z)||occBy(x,z,null))continue;tile=[x,z]}
 if(!tile){msg('The goblin champion is gathering the clans. Clear a little room in the field and try again.');return}
 const d={n:'Goblin champion',lvl:4,hp:18,att:2,str:3,def:2,max:3,drop:()=>[['bones',1],['coins',15+rnd(35)]]};const m=new Ent('mon',tile[0],tile[1],bwRig(goblinChar(true),1,1.9,1));m.d=d;m.type='goblinchampion';m.hp=d.hp;m.sx=m.x;m.sz=m.z;m.area=[m.x-5,m.z-5,m.x+5,m.z+5];m.aggro=null;m.cd=0;m.face=0;m.questBoss=1;MON.push(m);ST.tasks.gs_bossSpawned=1;save();msg(restoring?'The Goblin champion returns to the field.':'A Goblin champion storms into the field! Tap it, then choose Attack.')}
if(ST.tasks.gs_started&&!ST.tasks.gs_done&&ST.tasks.gs_bossSpawned)setTimeout(()=>spawnGoblinSlayerChampion(true),0);
function completeGoblinSlayer(){if(!ST.tasks.gs_started||ST.tasks.gs_done)return;ST.tasks.gs_done=1;const kept=addItem('sqshield',1);if(!kept)dropItem('sqshield',1,me.x,me.z);addItem('coins',250);save();if(UI.tab==='quests')renderPanel();msg(`<b style="color:#d5ad52">Quest complete: Goblin Slayer.</b> ${kept?'You receive':'Your inventory is full; a reward shield is on the ground. You receive'} a bronze square shield and 250 coins.`)}
// ---------------- actions ----------------
// act: {t:'walk'|'attack'|'chop'|'mine'|'fish'|'take'|'talk'|'bank'|'store'|'altar'|'follow', o}
function setAct(a){me.act=a;me.path=[];closeDialog(true);if(a&&a.t==='walk')me.goal=[a.x,a.z]}
function goalFor(a){const o=a.o;switch(a.t){case 'walk':{let tx=a.x,tz=a.z;return[(x,z)=>x===tx&&z===tz,tx,tz]}
 case 'take':return[(x,z)=>x===o.x&&z===o.z,o.x,o.z];
 case 'attack':return[(x,z)=>inMelee(x,z,o.x,o.z)&&!occBy(x,z,me),o.x,o.z];
 case 'door':return[(x,z)=>(x===o.x&&z===o.z)||(x===o.x+[-1,0,1,0][o.cE]&&z===o.z+[0,-1,0,1][o.cE]),o.x,o.z];
 case 'talk':case 'follow':return[(x,z)=>cheb(x,z,o.x,o.z)===1,o.x,o.z];
 default:{const w=o.w||1,l=o.l||1;return[(x,z)=>{const dx=x<o.x?o.x-x:x>=o.x+w?x-(o.x+w-1):0,dz=z<o.z?o.z-z:z>=o.z+l?z-(o.z+l-1):0;return Math.max(dx,dz)===1&&(dx===0||dz===0||a.t==='fish'||o.kind==='tree'||o.kind==='rock')},o.x,o.z]}}}
function arrived(a){const[g]=goalFor(a);return g(me.x,me.z)}
function planPath(a){const[g,hx,hz]=goalFor(a);if(g(me.x,me.z)){me.path=[];return true}let p=findPath(me.x,me.z,g,hx,hz);
 if(!p&&a.t==='walk'){p=findPath(me.x,me.z,(x,z)=>cheb(x,z,hx,hz)<=1,hx,hz)||findPath(me.x,me.z,(x,z)=>cheb(x,z,hx,hz)<=3,hx,hz)}
 if(!p){me.path=[];return false}me.path=p;return true}
function swing(e,kind='melee'){e.atkT=performance.now();e.atkKind=kind}
const wSpd=()=>(ST.eq.weapon&&IT[ST.eq.weapon].spd)||4;
const occBy=(x,z,self)=>{for(const m of MON)if(m!==self&&!m.dead&&m.x===x&&m.z===z)return m;return null};
const AGGR=new Set(['Goblin','Giant rat','Giant spider','Mugger','Big frog','Giant frog','Imp']);
let lastHitBy=null,lastHitT=-99,tolT=0,tolA=null;
// Tarnish/OSRS roll: accuracy uses the attack-vs-defence formula, then an
// accurate swing rolls an inclusive 0..max hit (a zero damage hit is possible).
function hit(maxHit,attRoll,defRoll){const ch=attRoll>defRoll?1-(defRoll+2)/(2*(attRoll+1)):attRoll/(2*(defRoll+1));return Math.random()<ch?rnd(Math.max(0,Math.floor(maxHit))+1):0}
// Tarnish SkillRepository success roll: integer chance out of 100, with tool
// level averaged into mining/woodcutting and direct skill level for fishing.
function tarnishSkillSuccess(level,required,toolLevel=0){const effective=toolLevel?(level+toolLevel)/2:level,score=Math.ceil(((effective*50-required*15)/required/3)*4);return Math.random()<Math.max(0,Math.min(1,(score+1)/100))}
const pray=k=>UI.prayers[k]?1.05:1;
function attackType(){const item=IT[ST.eq.weapon],style=(item&&item.atkStyle)||'',name=(item&&item.n)||'';if(/stab/i.test(style)||/dagger|spear|hasta/i.test(name)||(/sword/i.test(name)&&!/longsword/i.test(name)))return'stab';if(/crush/i.test(style)||/warhammer|mace|maul|staff/i.test(name))return'crush';return'slash'}
function attackBonus(type){const typed=bonus('att-'+type);return typed!==0?typed:bonus('att')}
let demoStyle=attackType();
function combatPreview(type){
 const st=ST.style,attLevel=Math.floor(lv('Attack')*pray('clar'))+8+(st===0?3:0),strLevel=Math.floor(lv('Strength')*pray('str'))+8+(st===0?1:st===1?3:0);
 const max=Math.floor(.5+strLevel*(64+bonus('str'))/640),attBonus=attackBonus(type),target=UI.target&&!UI.target.dead?UI.target:null;
 const attRoll=Math.floor(attLevel*(64+attBonus));let chance=null;
 if(target){const defBonus=target.d.defence&&target.d.defence['defence-'+type]||0,defRoll=(target.d.def+9)*(64+defBonus);chance=attRoll>defRoll?1-(defRoll+2)/(2*(attRoll+1)):attRoll/(2*(defRoll+1))}
 return{attBonus,strBonus:bonus('str'),max,chance,target,attRoll};
}
function previewSwing(type){demoStyle=type;const now=performance.now();me.atkT=now;me.atkKind=type;me.previewSwingUntil=now+450;try{window.__combatPreviewFx&&window.__combatPreviewFx(type)}catch(_){}renderPanel()}
function combatLabHTML(){
 const modes=['slash','stab','crush'],equip=Object.entries(ST.eq).filter(([slot,id])=>id&&IT[id]).map(([slot,id])=>{const it=IT[id],b=it.b||{},a=b.att||0,s=b.str||0;return`<span class="cv-gear-chip"><b>${esc(slot)}</b> ${esc(it.n)} <i>${a>=0?'+':''}${a} atk · ${s>=0?'+':''}${s} str</i></span>`}).join('')||'<span class="cv-empty">No gear equipped</span>';
 const rows=modes.map(type=>{const q=combatPreview(type),active=demoStyle===type;return`<div class="cv-mode ${type} ${active?'active':''}" data-cv-mode="${type}"><div class="cv-mode-top"><b>${type[0].toUpperCase()+type.slice(1)}</b><strong data-cv-max>Max ${q.max}</strong></div><div class="cv-small" data-cv-stat>+${q.attBonus} style atk · +${q.strBonus} gear str${q.chance==null?'':` · ${(q.chance*100).toFixed(1)}% hit`}</div><button type="button" class="cv-preview" data-cv-type="${type}" aria-pressed="${active}">3D ${type} preview</button></div>`}).join('');
 const target=UI.target&&!UI.target.dead?`${esc(UI.target.d.n)} · ${UI.target.hp}/${UI.target.d.hp} HP`:'Select a target for hit chance';
 return`<section class="cv-lab"><div class="cv-title"><span>⚔ Combat in 3D</span><small>Preview only · no hit or XP</small></div><div class="cv-weapon">${esc(ST.eq.weapon&&IT[ST.eq.weapon]?IT[ST.eq.weapon].n:'Unarmed')} · ${['Accurate','Aggressive','Defensive'][ST.style]||'Accurate'} style</div><div class="cv-target" id="cv-target-status">${target}</div><div class="cv-modes">${rows}</div><div class="cv-bonus"><b>Combined worn gear</b><span>+${bonus('att')} attack · +${bonus('str')} strength · +${bonus('def')} defence</span></div><div class="cv-gear">${equip}</div><div class="cv-foot">Max hit includes your gear and combat style. Real hits show damage over the target in 3D.</div></section>`;
}
let cvRefreshAt=0;function refreshCombatLab(now){if(now<cvRefreshAt)return;cvRefreshAt=now+250;const status=document.getElementById('cv-target-status');if(!status)return;const t=UI.target&&!UI.target.dead?UI.target:null;status.textContent=t?`${t.d.n} · ${Math.max(0,t.hp)}/${t.d.hp} HP`:'Select a target for hit chance';for(const type of['slash','stab','crush']){const box=document.querySelector(`[data-cv-mode="${type}"]`);if(!box)continue;const q=combatPreview(type),stat=box.querySelector('[data-cv-stat]'),max=box.querySelector('[data-cv-max]');if(stat)stat.textContent=`+${q.attBonus} style atk · +${q.strBonus} gear str${q.chance==null?'':` · ${(q.chance*100).toFixed(1)}% hit`}`;if(max)max.textContent='Max '+q.max}}
function playerAttack(m){me.faceTo(m.x,m.z);swing(me);if(!m.aggro&&!m.dead)m.faceTo(me.x,me.z);const st=ST.style,type=attackType(),ea=Math.floor(lv('Attack')*pray('clar'))+8+(st===0?3:0),es=Math.floor(lv('Strength')*pray('str'))+8+(st===0?1:st===1?3:0);
 const max=Math.floor(.5+es*(64+bonus('str'))/640),defBonus=m.d.defence&&m.d.defence['defence-'+type]||0;const dmg=Math.min(m.hp,hit(max,Math.floor(ea*(64+attackBonus(type))),(m.d.def+9)*(64+defBonus)));
 if(m.d.retaliate!==false&&!m.aggro){m.aggro=me;m.cd=Math.max(m.cd,1)}
 /* pb9: land hit at mid-swing so splat matches the attack anim */
 setTimeout(()=>{if(m.dead)return;m.hp-=dmg;splat(m,dmg);m.hitT=performance.now();try{window.__P6&&window.__P6.puff(...(()=>{const q=m.vpos(performance.now());return[q[0],hAt(q[0],q[1])+.9,q[1]]})(),dmg>0?6:2,dmg>0?0xb01010:0x2a4fc7)}catch(_){}
  if(dmg>0){gainXP(['Attack','Strength','Defence'][st],dmg*4);gainXP('Hitpoints',Math.round(dmg*1.33*10)/10)}
  if(m.hp<=0)killMon(m)},220)}
function killMon(m){if(m.dead)return;const dodgeBonus=m._dodged?3+rnd(6):0;m._dodged=false;cancelChaos(m);m._chaosCount=0;m.dead=1;m.deadT=performance.now();m.aggro=null;m.respawn=m.questBoss||m.d.respawn===-1?Infinity:TICKN+(m.d.respawn??30);if(me.act&&me.act.o===m)me.act=null;
 setTimeout(()=>{if(dodgeBonus){dropItem('coins',dodgeBonus,m.x,m.z);msg('Dodge bonus: '+dodgeBonus+' extra coins dropped!')}for(const d of m.d.drop())if(d)dropItem(d[0],d[1],m.x,m.z)},1200);if(m.type==='goblin'){task('goblin');progressGoblinSlayer()}if(m.questBoss)completeGoblinSlayer();msg(`You have defeated the ${m.d.n}.`)}
const CHAOS_ATTACKS=new Map();let chaosEpoch=0;
const chaosNotice=document.createElement('div');chaosNotice.id='chaos-notice';chaosNotice.setAttribute('role','status');document.body.appendChild(chaosNotice);
function cancelChaos(m){const a=CHAOS_ATTACKS.get(m);if(!a)return;for(const ring of a.rings){S.remove(ring);ring.geometry.dispose();ring.material.dispose()}CHAOS_ATTACKS.delete(m);if(!CHAOS_ATTACKS.size)chaosNotice.textContent=''}
function clearChaos(){chaosEpoch++;for(const m of [...CHAOS_ATTACKS.keys()])cancelChaos(m)}
function startChaos(m){if(CHAOS_ATTACKS.has(m))return;lastHitBy=m;lastHitT=TICKN;const p=me.vpos(performance.now()),type=rnd(3),radius=type===1?2:1.25,centres=type===1?[[m.x+.5,m.z+.5]]:type===2?[[p[0],p[1]],[p[0]-1.8,p[1]+.7],[p[0]+1.8,p[1]-.7]]:[[p[0],p[1]]];const names=['Goblin tantrum!','GIANT SNEEZE!','Flying dinner!'],taunts=['I meant to do that!','ACHOO!','Food fight!'];m.sayTxt=taunts[type];m.sayT=performance.now();m.faceTo(me.x,me.z);const rings=centres.map(([x,z])=>{const ring=new THREE.Mesh(new THREE.RingGeometry(radius-.14,radius,32),new THREE.MeshBasicMaterial({color:[0xffad32,0x9de64c,0xd794ff][type],transparent:true,opacity:.85,side:THREE.DoubleSide,depthWrite:false}));ring.rotation.x=-Math.PI/2;ring.position.set(x,hAt(x,z)+.045,z);ring.raycast=()=>{};S.add(ring);return ring});CHAOS_ATTACKS.set(m,{centres,radius,rings,due:TICKN+3,epoch:chaosEpoch,type});chaosNotice.textContent=names[type]+' Move outside the glowing rings!';}
function animateChaos(now){for(const a of CHAOS_ATTACKS.values())for(const ring of a.rings)ring.material.opacity=.5+.4*(.5+.5*Math.sin(now/90));}
function tickChaos(){for(const [m,a]of [...CHAOS_ATTACKS]){if(m.dead||m.aggro!==me||me.tele||a.epoch!==chaosEpoch||cheb(m.x,m.z,me.x,me.z)>15){cancelChaos(m);continue}if(TICKN<a.due)continue;const p=me.vpos(performance.now()),inside=a.centres.some(([x,z])=>Math.hypot(p[0]-x,p[1]-z)<=a.radius);cancelChaos(m);swing(m);if(inside){const cap=Math.max(1,Math.ceil(lv('Hitpoints')*.3)),dmg=Math.min(ST.hp,cap,Math.max(1,m.d.max||2));ST.hp=Math.max(0,ST.hp-dmg);splat(me,dmg);me.hitT=performance.now();msg(a.type===1?'That sneeze had some power!':'Bonk! Move out of the marked area next time.');if(ST.hp<=0)playerDie()}else{m._dodged=true;msg('<span style="color:#ffd471">Dodged! The monster looks deeply embarrassed.</span>');m.sayTxt='...nobody saw that.';m.sayT=performance.now()}updOrbs();}}
function monAttack(m){if(m.dead||ST.hp<=0)return;if(CHAOS&&(m.questBoss||(m.d.lvl||0)>=10||/goblin|imp|giantrat/.test(m.type))&&((m._chaosCount=(m._chaosCount||0)+1)%3===0)){startChaos(m);return}lastHitBy=m;lastHitT=TICKN;swing(m);m.faceTo(me.x,me.z);const defR=(Math.floor(lv('Defence')*pray('skin'))+9+(ST.style===2?3:ST.style===3?1:0))*(64+bonus('def'));const kind=/slash/i.test(m.d.attackStyle)?'slash':/stab/i.test(m.d.attackStyle)?'stab':'crush',attBonus=m.d.defence&&m.d.defence['attack-'+kind]||m.d.attackBonus||0,attRoll=Math.floor((m.d.att+8)*(64+attBonus)),max=Math.floor(.5+(m.d.str+8)*(64+(m.d.bonusStrength||0))/640);const dmg=Math.min(ST.hp,hit(max,attRoll,defR));
 const attackEpoch=chaosEpoch;setTimeout(()=>{if(ST.hp<=0||m.dead||attackEpoch!==chaosEpoch||me.tele||!inMelee(m.x,m.z,me.x,me.z))return;ST.hp-=dmg;splat(me,dmg);me.hitT=performance.now();try{window.__P6&&window.__P6.puff(...(()=>{const q=me.vpos(performance.now());return[q[0],hAt(q[0],q[1])+.9,q[1]]})(),dmg>0?5:2,dmg>0?0xb01010:0x2a4fc7)}catch(_){}
  if(ST.hp<=0)playerDie();else if(ST.ar&&(!me.act||me.act.t==='walk'&&!me.path.length)&&!me.path.length)setAct({t:'attack',o:m})},220)}
function playerDie(){clearChaos();msg('<span style="color:#a00">Oh dear, you are dead!</span>');ST.hp=lv('Hitpoints');ST.pp=lv('Prayer');me.snap(...SPAWN);me.act=null;me.path=[];for(const m of MON)if(m.aggro===me)m.aggro=null;showDialog('',['Oh dear, you are dead! You wake up in Lumbridge.'])}
function skillTick(a){const o=a.o;me.faceTo(o.x,o.z);if(me.skillCd>0)return;me.skillCd=4;swing(me);
 if(a.t==='chop'){if(!o.alive){me.act=null;return}if(!hasTool('axe')){msg('You need an axe to chop down this tree.');me.act=null;return}if(!freeSlots()){msg('Your inventory is too full to hold any more logs.');me.act=null;return}
  if(tarnishSkillSuccess(lv('Woodcutting'),(CHOP[o.name]||[1])[0],1)){addItem('logs');gainXP('Woodcutting',25);msg('You get some logs.');task('chop');if(Math.random()<.33){o.alive=0;o.respawn=TICKN+25+rnd(15);block[I(o.x,o.z)]=1;setTree(o);me.act=null}}}
 else if(a.t==='mine'){if(!o.alive){msg('There is currently no ore available in this rock.');me.act=null;return}if(!hasTool('pick')){msg('You need a pickaxe to mine this rock.');me.act=null;return}if(!freeSlots()){msg('Your inventory is too full to hold any more ore.');me.act=null;return}
  if(tarnishSkillSuccess(lv('Mining'),(MINE[o.name]||[1])[0],1)){addItem(o.ore);gainXP('Mining',17.5);msg(`You manage to mine some ${o.ore}.`);task('mine');o.alive=0;o.respawn=TICKN+8+rnd(6);setRock(o);me.act=null}}
 else if(a.t==='fish'){if(!hasTool('net')){msg('You need a net to fish here.');me.act=null;return}if(!freeSlots()){msg('You don\'t have enough inventory space.');me.act=null;return}
  if(tarnishSkillSuccess(lv('Fishing'),1)){addItem('rawshrimps');gainXP('Fishing',10);msg('You catch some shrimps.');task('fish')}}}
function startMsg(a){const t=a.t;if(t==='chop'&&a.o.alive)msg('You swing your axe at the tree.');if(t==='mine'&&a.o.alive)msg('You swing your pick at the rock.');if(t==='fish')msg('You cast out your net...')}
function doArrive(a){const o=a.o;switch(a.t){
 case 'walk':me.act=null;break;
 case 'take':{const g=o;if(GI.includes(g)){if(addItem(g.id,g.q)){removeGI(g)}else msg('You don\'t have enough inventory space.')}me.act=null;break}
 case 'talk':me.faceTo(o.x,o.z);o.faceTo(me.x,me.z);showDialog(o.name,o.lines,()=>{if(o===guide){task('talk');startGoblinSlayer()}});me.act=null;break;
 case 'bank':me.faceTo(o.x,o.z);openMode('bank');task('bank');me.act=null;break;
 case 'store':me.faceTo(o.x,o.z);openMode('store');me.act=null;break;
 case 'altar':me.faceTo(o.x,o.z);swing(me);if(ST.pp<lv('Prayer')){ST.pp=lv('Prayer');msg('You recharge your Prayer points.')}else msg('You already have full Prayer points.');me.act=null;break;
 case 'chop':case 'mine':case 'fish':skillTick(a);break;
 case 'attack':if(o.dead){me.act=null;break}me.faceTo(o.x,o.z);if(me.cd<=0){playerAttack(o);me.cd=wSpd()}break;
 case 'follow':break}}
// ---------------- tick ----------------
function doTick(){TICKN++;if(!tolA||cheb(me.x,me.z,tolA[0],tolA[1])>10){tolA=[me.x,me.z];tolT=TICKN}ST.played++;if(me.cd>0)me.cd--;if(me.skillCd>0)me.skillCd--;
 const a=me.act;
 if(a){if(a.t==='attack'&&a.o.dead){me.act=null}else if(a.t==='take'&&!GI.includes(a.o)){me.act=null}
  else if(!arrived(a)){
   if(a.t==='attack'){const o=a.o,d=cheb(me.x,me.z,o.x,o.z);
    /* pb9: stand still once in reach — no walk-dance while fighting */
    if(d<=atkRange()){me.path=[]}
    else if(!me.path.length||a._tx!==o.x||a._tz!==o.z){a._tx=o.x;a._tz=o.z;if(!planPath(a)){if(d>10){msg('I can\'t reach that!');me.act=null}}}
   }else if(!me.path.length||a.t==='follow'){if(!planPath(a)){if(a.t!=='walk')msg('I can\'t reach that!');me.act=null}}}
 }
 // move — freeze path the moment we enter attack range
 if(me.path.length&&!(me.act&&arrived(me.act))){if(me.act&&me.act.t==='attack'&&inMelee(me.x,me.z,me.act.o.x,me.act.o.z)){me.path=[]}else{const running=ST.run&&ST.energy>=1&&me.path.length>1;const steps=me.path.splice(0,running?2:1);me.moveTo(steps);if(running)ST.energy=Math.max(0,ST.energy-.7);if(me.act&&me.act.t==='attack'&&arrived(me.act))me.path=[]}}
 else ST.energy=Math.min(100,ST.energy+.45+lv('Agility')*.01);
 if(!me.path.length&&me.act&&me.act.t==='walk'&&!arrived(me.act))me.act=null;
 if(me.act&&arrived(me.act)){const b=me.act;if(!b.started){b.started=1;startMsg(b)}doArrive(b)}
 // Resolve marked attacks after player movement, so manual dodges count.
 tickChaos();
 // monsters
 for(const m of MON){if(m.dead){if(m.dead===1&&performance.now()-m.deadT>1400){m.dead=2;m.r.g.visible=false}if(TICKN>=m.respawn){m.dead=0;m.hp=m.d.hp;m.snap(m.sx,m.sz);m.r.g.visible=true;m.r.b.rotation.set(0,0,0);m.r.b.position.y=0}continue}
  if(m.cd>0)m.cd--;
  if(CHAOS_ATTACKS.has(m))continue;
  if(m.aggro){const p=me;if(cheb(m.x,m.z,m.sx,m.sz)>15||ST.hp<=0||cheb(m.x,m.z,me.x,me.z)>15){m.aggro=null;continue}
   const busy=lastHitBy&&lastHitBy!==m&&!lastHitBy.dead&&TICKN-lastHitT<8;
   if(inMelee(m.x,m.z,p.x,p.z)){if(m.cd<=0&&!busy){monAttack(m);m.cd=m.d.spd||4}}
   else{let best=null,bd=1e9;for(const[dx,dz]of DIRS){const nx=m.x+dx,nz=m.z+dz;if(nx===p.x&&nz===p.z)continue;if(!canStep(m.x,m.z,dx,dz)||occBy(nx,nz,m))continue;const d=Math.abs(nx-p.x)+Math.abs(nz-p.z)+(dx&&dz?.1:0);if(d<bd){bd=d;best=[nx,nz]}}
    const cur=Math.abs(m.x-p.x)+Math.abs(m.z-p.z);if(best&&bd<cur)m.moveTo([best]);else if(m.x===p.x&&m.z===p.z){for(const[dx,dz]of DIRS.slice(0,4))if(walkable(m.x+dx,m.z+dz)){m.moveTo([[m.x+dx,m.z+dz]]);break}}}}
  else{if(m.d.aggressive===true&&ST.hp>0&&combatLvl()<=m.d.lvl*2&&cheb(m.x,m.z,me.x,me.z)<=((m.d.size||1)+3)&&!(lastHitBy&&lastHitBy!==m&&TICKN-lastHitT<8)&&TICKN-tolT<2000&&!me.tele){m.aggro=me;m.cd=Math.max(m.cd,1);continue}
  if(Math.random()<.12){const[dx,dz]=DIRS[rnd(8)],ar=m.area||m.d.area,nx=m.x+dx,nz=m.z+dz;if(nx>=ar[0]&&nx<=ar[2]&&nz>=ar[1]&&nz<=ar[3]&&canStep(m.x,m.z,dx,dz)&&!occBy(nx,nz,m)&&!(nx===me.x&&nz===me.z))m.moveTo([[nx,nz]])}}}
 // respawns
 for(const t of TREES)if(!t.alive&&TICKN>=t.respawn){t.alive=1;setTree(t)}
 for(const r of ROCKS)if(!r.alive&&TICKN>=r.respawn){r.alive=1;setRock(r)}
 for(const g of GI.slice())if(TICKN>=g.exp)removeGI(g);
 // regen / prayer drain
 if(TICKN%15===0&&ST.hp<lv('Hitpoints'))ST.hp++;
 const np=Object.values(UI.prayers).filter(Boolean).length;if(np&&TICKN%6===0){ST.pp=Math.max(0,ST.pp-np);if(ST.pp<=0){UI.prayers={};msg('You have run out of Prayer points.');if(UI.tab==='prayer')renderPanel()}}
 if(me.emote&&performance.now()-me.emote.t0>3000)me.emote=null;
 if(TICKN%10===0){ST.pos=[me.x,me.z];save()}
 updOrbs()}
// ---------------- UI ----------------
const UI={tab:null,mode:null,prayers:{},menu:null,dlg:null};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function msg(h){const d=document.createElement('div');d.innerHTML=h;const L=$('chatlog');L.appendChild(d);while(L.children.length>40)L.firstChild.remove()}
const OV=$('ov');
function splat(e,dmg){const d=document.createElement('div');d.className='hs '+(dmg>0?'r':'b')+' pop';d.textContent=dmg;d.style.cssText=(d.getAttribute('style')||'')+'font-size:18px;transform:scale(1.4);filter:drop-shadow(0 0 3px #000)';OV.appendChild(d);(e.splats=e.splats||[]).push({d,t:performance.now(),big:1});while(e.splats.length>4)e.splats.shift().d.remove();e.hbT=performance.now();if(dmg>0){try{shake=Math.min(.28,(shake||0)+.06+dmg*.015)}catch(_){}}}
function xpDrop(skill,amt){const d=document.createElement('div');d.className='xpd';d.innerHTML=`<span style="font-family:'Apple Color Emoji','Noto Color Emoji'">${SKI[skill]}</span> +${Math.round(amt*10)/10}`;$('xpdrops').appendChild(d);setTimeout(()=>d.remove(),1800);updXpTot()}
function updXpTot(){$('xptot').textContent='XP: '+Math.floor(Object.values(ST.xp).reduce((a,b)=>a+b,0)).toLocaleString()}
function levelUp(skill,l){showDialog('',[`${SKI[skill]} Congratulations, you just advanced a ${skill} level. Your ${skill} level is now ${l}.`]);setTimeout(()=>{if(UI.dlg&&UI.dlg.auto)closeDialog()},3500);UI.dlg.auto=1}
function showDialog(name,lines,done){UI.dlg={name,lines,i:0,done};$('dlg').classList.remove('hidden');drawDialog()}
function drawDialog(){const d=UI.dlg;$('dname').textContent=d.name||'';$('dtext').textContent=d.lines[d.i];$('dcont').textContent=d.i<d.lines.length-1?'Click here to continue':(d.name?'Click here to continue':'')}
function closeDialog(silent){if(!UI.dlg)return;const d=UI.dlg;UI.dlg=null;$('dlg').classList.add('hidden');if(!silent&&d.done)d.done();else if(silent&&d.done&&d.i>=d.lines.length-1)d.done()}
$('dlg').addEventListener('click',()=>{const d=UI.dlg;if(!d)return;if(d.i<d.lines.length-1){d.i++;drawDialog()}else closeDialog()});
// orbs
function updOrbs(){const hp=ST.hp,mh=lv('Hitpoints');const o=$('orbhp').firstChild;o.textContent=hp;o.style.color=hp/mh>.6?'#0f0':hp/mh>.3?'#ff0':'#f22';
 $('orbpr').firstChild.textContent=ST.pp;$('orbrun').firstChild.textContent=Math.floor(ST.energy);$('orbrun').classList.toggle('off',!ST.run);$('orbpr').classList.toggle('off',!Object.values(UI.prayers).some(Boolean))}
$('orbrun').onclick=()=>{ST.run=!ST.run;updOrbs()};$('orbpr').onclick=()=>openTab('prayer');$('orbhp').onclick=()=>{const f=ST.inv.findIndex(s=>s&&IT[s.id].heal);if(f>=0)invAction(f,'eat')};
$('xpbtn').onclick=()=>{$('xptot').classList.toggle('hidden');updXpTot()};
// tabs
const LT=[['combat','⚔️','Combat Options'],['skills','📊','Skills'],['quests','📜','Quest List'],['inv','🎒','Inventory'],['equip','🛡️','Worn Equipment'],['prayer','🙏','Prayer'],['magic','🔮','Magic']];
const RT=[['clan','👥','Clan Chat'],['friends','😊','Friends List'],['account','👤','Account Management'],['logout','🚪','Logout'],['settings','🔧','Settings'],['emotes','💃','Emotes'],['music','🎵','Music Player']];
for(const[col,list]of[['ltabs',LT],['rtabs',RT]])for(const[id,ic,t]of list){const b=document.createElement('button');b.className='tab';b.id='tab-'+id;b.setAttribute('aria-label',t);if(id!=='account'){const im=new Image();im.src=U('sprites/tab_'+id+'.png');im.className='tabimg';im.alt='';im.onerror=()=>{b.textContent=ic};b.appendChild(im)}else b.textContent=ic;b.title=t;b.onclick=()=>openTab(id);$(col).appendChild(b)}
$('chattog').onclick=()=>$('chat').classList.toggle('hidden');
function openTab(id){if(UI.mode){UI.mode=null}if(UI.tab===id){UI.tab=null}else UI.tab=id;document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('on',b.id==='tab-'+UI.tab));renderPanel()}
function closePanel(){UI.tab=null;UI.mode=null;UI.use=null;document.querySelectorAll('.tab.on').forEach(b=>b.classList.remove('on'));renderPanel()}
function openMode(m){UI.mode=m;UI.tab=null;document.querySelectorAll('.tab').forEach(b=>b.classList.remove('on'));renderPanel()}
const slotHTML=(s,i,extra='')=>`<div class="slot" data-i="${i}" ${extra}>${s?`<span style="${IT[s.id].f?'filter:'+IT[s.id].f:''}">${IT[s.id].i}</span>${IT[s.id].st&&s.q>1||s.q>1?`<b>${s.q>=1e5?Math.floor(s.q/1000)+'K':s.q}</b>`:''}`:''}</div>`;
function invGrid(){return `<div class="inv">${ST.inv.map((s,i)=>slotHTML(s,i)).join('')}</div>`}
function renderPanel(){const P=$('panel'),id=UI.tab,m=UI.mode;if(!id&&!m){P.classList.add('hidden');return}P.classList.remove('hidden');
 const right=true;P.classList.toggle('R',right);P.classList.toggle('L',!right);let title='',h='';
 if(m==='bank'){title='The Bank of Gielinor';const bk=Object.entries(ST.bank).filter(([,q])=>q>0);h=`<div class="shop">${bk.map(([id,q])=>`<div class="slot bk" data-id="${id}"><span>${IT[id].i}</span><small>${q}</small></div>`).join('')||'<i style="grid-column:span 4;color:#aaa">Your bank is empty.</i>'}</div><button class="btn" id="depall">Deposit inventory</button><div style="font-size:12px;color:#aaa;margin:2px 0">Tap an item below to deposit it, above to withdraw.</div><div style="height:220px">${invGrid()}</div>`}
 else if(m==='store'){title='Lumbridge General Store';h=storeHTML()}
 else switch(id){
 case 'inv':title='Inventory';h=invGrid();break;
 case 'skills':{title='Skills';let tot=0;h='<div class="skills">'+SK.map(s=>{const l=lv(s);tot+=l;return `<div class="sk" title="${s}: ${Math.floor(ST.xp[s])} xp"><i>${SKI[s]}</i>${s.slice(0,4)}<span>${l}/${l}</span></div>`}).join('')+`<div class="sk" style="color:#ff0">Total: ${tot}</div></div>`;
  const nxt=['Attack','Strength','Defence','Hitpoints','Woodcutting','Mining','Fishing','Prayer'].map(s=>{const l=lv(s);return `<div class="row"><span>${s}</span><span style="color:#fff">${Math.floor(ST.xp[s]).toLocaleString()} xp · next ${Math.max(0,XPT[l+1]-Math.floor(ST.xp[s])).toLocaleString()}</span></div>`}).join('');h+=`<div style="margin-top:6px;font-size:12px">${nxt}</div>`;break}
 case 'combat':{title='Combat Options';const w=ST.eq.weapon?IT[ST.eq.weapon].n:'Unarmed';h=`<div class="row y"><span>${w}</span><span>Combat Lvl: ${combatLvl()}</span></div><div class="grid3" style="grid-template-columns:1fr 1fr;margin:8px 0">${(({dagger:['Stab','Lunge','Block'],sword:['Stab','Lunge','Block'],scim:['Chop','Slash','Block'],lsword:['Chop','Slash','Block'],whammer:['Pound','Pummel','Block'],staff:['Bash','Pound','Focus'],airstaff:['Bash','Pound','Focus']})[ST.eq.weapon]||['Punch','Kick','Block']).map((n,i)=>n+' ('+['Accurate','Aggressive','Defensive'][i]+')').map((n,i)=>`<button class="btn sty ${ST.style===i?'on':''}" data-s="${i}">${n}<br><small>${['Attack','Strength','Defence'][i]} XP</small></button>`).join('')}</div><button class="btn ${ST.ar?'on':''}" id="autoret">Auto Retaliate: ${ST.ar?'On':'Off'}</button><div class="row"><span>Attack bonus</span><span>+${bonus('att')}</span></div><div class="row"><span>Strength bonus</span><span>+${bonus('str')}</span></div><div class="row"><span>Defence bonus</span><span>+${bonus('def')}</span></div>${combatLabHTML()}`;break}
 case 'quests':{const gs=ST.tasks.gs_done?'Completed':!ST.tasks.gs_started?'Speak to the Guide':ST.tasks.gs_bossSpawned?'Defeat the Goblin champion':`Defeat goblins · ${Math.min(3,ST.tasks.gs_kills||0)}/3`;title='Quest List';h=`<div class="row y"><span>Guide's Tasks</span><span>${TASKS.filter(t=>ST.tasks[t[0]]).length}/${TASKS.length}</span></div>`+TASKS.map(([k,n])=>`<div class="row ${ST.tasks[k]?'g':'r'}"><span>${n}</span><span>${ST.tasks[k]?'✔':''}</span></div>`).join('')+`<div class="row y" style="margin-top:8px"><span>Free Quests</span></div><div class="row ${ST.tasks.gs_done?'g':ST.tasks.gs_started?'y':'r'}"><span>Goblin Slayer</span><span>${gs}</span></div>`+["Cook's Assistant","Sheep Shearer","Rune Mysteries","Goblin Diplomacy","The Restless Ghost","Imp Catcher"].map(n=>`<div class="row r"><span>${n}</span></div>`).join('');break}
 case 'equip':{title='Worn Equipment';const sl=[['','',''],['head','🪖','Head'],['','',''],['cape','🧣','Cape'],['neck','📿','Neck'],['ammo','➶','Ammo'],['weapon','🗡️','Weapon'],['body','👕','Body'],['shield','🛡️','Shield'],['','',''],['legs','👖','Legs'],['',' ',''],['hands','🧤','Hands'],['feet','👢','Feet'],['ring','💍','Ring']];
  h=`<div class="eq">${sl.map(([k,ic,n])=>k?`<div class="eqs" data-k="${k}">${ST.eq[k]?IT[ST.eq[k]].i:`<span style="opacity:.25">${ic}</span>`}<small>${n}</small></div>`:'<div></div>').join('')}</div><div class="row y" style="margin-top:6px"><span>Attack bonus</span><span>+${bonus('att')}</span></div><div class="row y"><span>Strength bonus</span><span>+${bonus('str')}</span></div><div class="row y"><span>Defence bonus</span><span>+${bonus('def')}</span></div><div class="row y"><span>Magic bonus</span><span>+${bonus('mag')}</span></div><div class="row"><span>Attack speed</span><span>${(wSpd()*.6).toFixed(1)}s</span></div><div style="font-size:12px;text-align:center;color:#aaa;margin-top:4px">Tap an item to remove it.</div>`;break}
 case 'prayer':{title=`Prayer: ${ST.pp}/${lv('Prayer')}`;const pr=[['skin','🛡️','Thick Skin',1],['str','💪','Burst of Strength',4],['clar','🎯','Clarity of Thought',7],['','🔥','Rock Skin',10],['','⚡','Superhuman Strength',13],['','👁️','Improved Reflexes',16],['','❤️','Rapid Restore',19],['','💖','Rapid Heal',22],['','🧿','Protect Item',25]];
  h=`<div class="grid3">${pr.map(([k,ic,n,l])=>`<div class="ic ${lv('Prayer')<l||!k?'off':''} ${UI.prayers[k]?'on':''}" data-p="${k}" data-l="${l}"><big>${ic}</big>${n}</div>`).join('')}</div><div style="font-size:12px;color:#aaa;margin-top:6px">Bury bones to train Prayer. Recharge at the castle altar.</div>`;break}
 case 'magic':{title='Magic';const sp=[['🏠','Home Teleport',1],['🌬️','Wind Strike',1],['👁️','Confuse',3],['💧','Water Strike',5],['💎','Enchant',7],['🌍','Earth Strike',9],['😩','Weaken',11],['🔥','Fire Strike',13],['🦴','Bones to Bananas',15],['💨','Wind Bolt',17],['🤢','Curse',19],['🧲','Bind',20]];
  h=`<div class="grid4">${sp.map(([ic,n,l],i)=>`<div class="ic ${i?'off':''}" data-sp="${i}"><big>${ic}</big>${n}</div>`).join('')}</div>`;break}
 case 'clan':title='Clan Chat';h='<div class="row w">You are not currently in a clan channel.</div><div style="color:#aaa;font-size:13px;margin-top:8px">Everyone in this world shares the public chat below.</div>';break;
 case 'friends':{title='Friends List';const ps=[...MP.players.values()];h=`<div class="row y"><span>Players online</span><span>${ps.length+1}</span></div><div class="row g"><span>${esc(MP.name||ST.name||'You')} (you)</span><span>World 1</span></div>`+ps.map(p=>`<div class="row g"><span>${esc(p.name)}</span><span>World 1</span></div>`).join('')+(MP_ON?'':'<div class="row r">Multiplayer is off (?mp=0)</div>');break}
 case 'account':title='Account Management';h=`<a class="btn" style="display:block;text-align:center;text-decoration:none;background:#5a3a10;color:#ffb000" href="https://63-250-44-212.sslip.io/classic/" target="_blank" rel="noopener">Switch to OSRS client ▶</a><div class="row y"><span>Name</span><span>${esc(MP.name||ST.name||'Adventurer')}</span></div><div class="row"><span>Combat level</span><span>${combatLvl()}</span></div><div class="row"><span>Total level</span><span>${SK.reduce((a,s)=>a+lv(s),0)}</span></div><div class="row"><span>Time played</span><span>${Math.floor(ST.played*.6/60)} min</span></div><div style="margin-top:8px">Display name:</div><input id="nmin" maxlength="12" value="${esc(ST.name||'')}" style="width:100%;box-sizing:border-box;background:#2b241c;border:1px solid #000;color:#fff;padding:4px"><button class="btn" id="nmsave">Save name</button>`;break;
 case 'logout':title='Logout';h=`<div style="text-align:center;color:#ff981f;margin:6px 0">How much did you enjoy playing Bramblewick today?</div><div style="text-align:center;font-size:24px;margin:8px 0">⭐⭐⭐⭐⭐</div><div style="text-align:center;color:#ff981f;margin:10px 0">Use the button below to logout safely.</div><button class="btn red" id="logout">Tap here to logout</button>`;break;
 case 'settings':title='Settings';h=`<a class="btn" style="display:block;text-align:center;text-decoration:none;background:#5a3a10;color:#ffb000" href="https://63-250-44-212.sslip.io/classic/" target="_blank" rel="noopener">Switch to OSRS client ▶</a><button class="btn ${ST.run?'on':''}" id="s-run">Run: ${ST.run?'On':'Off'}</button><button class="btn ${ST.xpdrops?'on':''}" id="s-xp">XP drops: ${ST.xpdrops?'On':'Off'}</button><button class="btn ${CHAOS?'on':''}" id="s-chaos">Funny monster attacks: ${CHAOS?'On':'Off'}</button><button class="btn ${HD3D?'on':''}" id="s-hd">HD Graphics: ${HD3D?'On':'Off'}</button><button class="btn ${MUS.on?'on':''}" id="s-mus">Music: ${MUS.on?'On':'Off'}</button><button class="btn mobile-setting" id="s-touch-items">Item taps: ${mobilePreferences.itemMenu?'Show all options':'Quick action'}</button><div style="margin:6px 0">Camera zoom</div><input type="range" aria-label="Camera zoom" id="s-zoom" min="7" max="32" step=".5" value="${CAM.dist}" style="width:100%"><button class="btn red" id="s-reset">${UI.resetArm?'Tap again to RESET progress':'Reset progress'}</button>`;break;
 case 'emotes':{title='Emotes';const em=[['👍','Yes'],['👎','No'],['🙇','Bow'],['😠','Angry'],['🤔','Think'],['👋','Wave'],['🤷','Shrug'],['🎉','Cheer'],['👉','Beckon'],['😂','Laugh'],['🦘','Jump'],['💃','Dance'],['👏','Clap'],['😢','Cry'],['🌀','Spin'],['😳','Blush']];h=`<div class="grid4">${em.map(([ic,n])=>`<div class="ic" data-em="${n}"><big>${ic}</big>${n}</div>`).join('')}</div>`;break}
 case 'music':title='Music Player';h=`<div class="row y"><span>Now playing:</span><span>${MUS.on?MUS.track:'—'}</span></div>`+['Harmony','Newbie Melody','Autumn Voyage','Flute Salad','Dream','Sea Shanty 2','Yesteryear','Garden'].map(n=>`<div class="row ${MUS.on&&MUS.track===n?'g':'w'} trk" data-t="${n}" style="cursor:pointer"><span>${n}</span></div>`).join('');break}
 const heading=document.createElement('span');heading.textContent=title;const close=document.createElement('button');close.type='button';close.className='mobile-panel-close';close.textContent='×';close.setAttribute('aria-label','Close '+title);close.onclick=closePanel;$('ptitle').replaceChildren(heading,close);const B=$('pbody');B.innerHTML=h;bindPanel(B)}
const STOCK=[['axe',16],['pick',5],['net',5],['tinder',1],['shield',20],['shrimps',5],['beef',4],['bread',12]].concat(['','iron_','steel_'].flatMap(t=>['dagger','sword','scim','lsword','sqshield','kite','medhelm','fullhelm','chain','plate','plegs'].map(k=>[t+k,IT[t+k].v])));
const STORE={search:'',category:'all',quantity:1};
function storeCategory(d){return d.slot?'gear':d.heal||d.cook?'food':/rune/i.test(d.n)?'runes':'supplies'}
function storeStock(){const prices=new Map(STOCK);return Object.entries(IT).filter(([id])=>id!=='coins').map(([id,d])=>[id,prices.get(id)??Math.max(1,Math.ceil(Number(d.v)||1))]).sort((a,b)=>IT[a[0]].n.localeCompare(IT[b[0]].n))}
function storeHTML(){return `<div class="store-tools">
 <label>Find an item<input id="store-search" type="search" placeholder="Search all items…" value="${esc(STORE.search)}" autocomplete="off"></label>
 <div class="store-options"><label>Category<select id="store-category">${[['all','All items'],['gear','Equipment'],['food','Food'],['runes','Runes'],['supplies','Supplies']].map(([id,n])=>`<option value="${id}" ${STORE.category===id?'selected':''}>${n}</option>`).join('')}</select></label>
 <label>Buy quantity<select id="store-quantity">${[1,5,10,50].map(n=>`<option value="${n}" ${STORE.quantity===n?'selected':''}>${n}</option>`).join('')}</select></label></div>
 <div id="store-count" role="status" aria-live="polite"></div></div>
 <div class="shop store-stock">${storeStock().map(([id,p])=>`<button type="button" class="slot buy" data-id="${id}" data-p="${p}"><span style="${IT[id].f?'filter:'+IT[id].f:''}">${IT[id].i}</span><span class="item-name">${esc(IT[id].n)}</span><small></small></button>`).join('')}</div>
 <p id="store-empty" class="hidden">No items match your search.</p><p class="store-help">Choose a quantity, then tap stock to buy. Prices show the total. Tap inventory to sell. Hold inventory for item options.</p><div class="store-inventory">${invGrid()}</div>`}
function filterStore(B){const query=STORE.search.trim().toLowerCase();let count=0;
 B.querySelectorAll('.buy').forEach(el=>{const id=el.dataset.id,d=IT[id],show=(!query||(d.n+' '+id).toLowerCase().includes(query))&&(STORE.category==='all'||storeCategory(d)===STORE.category),total=+el.dataset.p*STORE.quantity;el.classList.toggle('hidden',!show);if(show)count++;el.querySelector('small').textContent=STORE.quantity+' × · '+total.toLocaleString()+' gp';el.setAttribute('aria-label',`Buy ${STORE.quantity} ${d.n} for ${total} coins`)});
 B.querySelector('#store-count').textContent=count+' items · '+invCount('coins').toLocaleString()+' coins';B.querySelector('#store-empty').classList.toggle('hidden',count>0);
}
function bindPanel(B){
 const search=B.querySelector('#store-search'),category=B.querySelector('#store-category'),quantity=B.querySelector('#store-quantity');
 if(search){filterStore(B);search.oninput=()=>{STORE.search=search.value;filterStore(B)};category.onchange=()=>{STORE.category=category.value;filterStore(B)};quantity.onchange=()=>{STORE.quantity=[1,5,10,50].includes(+quantity.value)?+quantity.value:1;filterStore(B)}}
 B.querySelectorAll('.inv .slot').forEach(el=>{const i=+el.dataset.i;longable(el,()=>{if(UI.use!=null&&UI.use!==i)invTap(i);else if(mobilePreferences.itemMenu&&matchMedia('(pointer:coarse)').matches&&ST.inv[i]){const r=el.getBoundingClientRect();invMenu(i,r.left+r.width/2,r.top+r.height/2)}else invTap(i)},(x,y)=>invMenu(i,x,y))});
 B.querySelectorAll('.bk').forEach(el=>{const id=el.dataset.id;longable(el,()=>{if(mobilePreferences.itemMenu&&matchMedia('(pointer:coarse)').matches){const r=el.getBoundingClientRect();bankMenu(id,r.left+r.width/2,r.top+r.height/2)}else withdrawBank(id,1)},(x,y)=>bankMenu(id,x,y))});
 const da=B.querySelector('#depall');if(da)da.onclick=()=>{for(let i=0;i<28;i++){const s=ST.inv[i];if(s){ST.bank[s.id]=(ST.bank[s.id]||0)+s.q;ST.inv[i]=null}}renderPanel()};
 B.querySelectorAll('.buy').forEach(el=>el.onclick=()=>{const id=el.dataset.id,n=STORE.quantity,p=+el.dataset.p*n;
  if(invCount('coins')<p){msg('You do not have enough coins.');return}
  // A new stack also needs a slot; never charge for an item that could not be added.
  const slotsNeeded=IT[id].st?(invCount(id)?0:1):n;
  if(freeSlots()<slotsNeeded){msg('You do not have enough inventory space. Choose a smaller quantity.');return}
  const scroll=B.scrollTop,focused=document.activeElement===el;if(!addItem(id,n))return;takeCoins(p);save();renderPanel();$('pbody').scrollTop=scroll;
  if(focused){const next=[...$('pbody').querySelectorAll('.buy')].find(b=>b.dataset.id===id);if(next)next.focus({preventScroll:true})}msg(`You buy ${n} × ${IT[id].n} for ${p} coins.`);
 });
 B.querySelectorAll('.sty').forEach(el=>el.onclick=()=>{ST.style=+el.dataset.s;renderPanel()});
 B.querySelectorAll('[data-cv-type]').forEach(el=>el.onclick=()=>previewSwing(el.dataset.cvType));
 const ar=B.querySelector('#autoret');if(ar)ar.onclick=()=>{ST.ar=!ST.ar;renderPanel()};
 B.querySelectorAll('.eqs').forEach(el=>el.onclick=()=>{const k=el.dataset.k;if(!ST.eq[k])return;if(!freeSlots()){msg('Not enough space in your inventory.');return}addItem(ST.eq[k]);ST.eq[k]=null;refreshGear();renderPanel()});
 B.querySelectorAll('[data-p]:not(.buy)').forEach(el=>el.onclick=()=>{const k=el.dataset.p;if(!k)return;if(lv('Prayer')<+el.dataset.l){msg(`You need a Prayer level of ${el.dataset.l} to use this prayer.`);return}if(ST.pp<=0){msg('You need to recharge your Prayer at an altar.');return}UI.prayers[k]=!UI.prayers[k];renderPanel();updOrbs()});
 B.querySelectorAll('[data-sp]').forEach(el=>el.onclick=()=>{if(el.dataset.sp!=='0'){msg('You do not have the runes to cast this spell.');return}homeTele()});
 B.querySelectorAll('[data-em]').forEach(el=>el.onclick=()=>{me.emote={n:el.dataset.em,t0:performance.now()};me.act=null;me.path=[]});
 B.querySelectorAll('.trk').forEach(el=>el.onclick=()=>{MUS.track=el.dataset.t;musicOn(true);renderPanel()});
 B.querySelectorAll('.eqs,.trk,.ic').forEach(el=>{el.tabIndex=0;el.setAttribute('role','button');el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();el.click()}})});
 const q=s=>B.querySelector(s);
 if(q('#nmsave'))q('#nmsave').onclick=()=>{const v=q('#nmin').value.replace(/[^A-Za-z0-9 _-]/g,'').slice(0,12);ST.name=v;save();msg('Name saved. It will be used when you next join the world.');if(MP_ON)mpRejoin()};
 if(q('#logout'))q('#logout').onclick=()=>{ST.pos=[me.x,me.z];save();mpLeave();const b=$('boot');b.style.display='flex';b.innerHTML='You have logged out.<br><br><span style="color:#fff;cursor:pointer" onclick="location.reload()">Tap here to log in</span>'};
 if(q('#s-chaos'))q('#s-chaos').onclick=()=>{CHAOS=!CHAOS;lset('bwl.chaos',CHAOS?'1':'0');if(!CHAOS)clearChaos();renderPanel()};
 if(q('#s-run'))q('#s-run').onclick=()=>{ST.run=!ST.run;updOrbs();renderPanel()};
 if(q('#s-xp'))q('#s-xp').onclick=()=>{ST.xpdrops=!ST.xpdrops;renderPanel()};
 if(q('#s-hd'))q('#s-hd').onclick=()=>{HD3D=!HD3D;try{localStorage.setItem('bwl.hd3d',HD3D?'1':'0')}catch(_){}applyTextureQuality();resize();msg(HD3D?'HD graphics enabled.':'Standard graphics enabled.');renderPanel()};
 if(q('#s-mus'))q('#s-mus').onclick=()=>{musicOn(!MUS.on);renderPanel()};
 if(q('#s-touch-items'))q('#s-touch-items').onclick=()=>{setItemTapOptions(!mobilePreferences.itemMenu);renderPanel()};
 if(q('#s-zoom'))q('#s-zoom').oninput=e=>CAM.dist=+e.target.value;
 if(q('#s-classic'))q('#s-classic').onclick=()=>location.href='classic.html';
 if(q('#s-reset'))q('#s-reset').onclick=()=>{if(!UI.resetArm){UI.resetArm=1;renderPanel();return}lset('om.save.v3','');location.reload()}}
function takeCoins(n){for(const s of ST.inv)if(s&&s.id==='coins'){s.q-=n;if(s.q<=0)ST.inv[ST.inv.indexOf(s)]=null;break}invChanged()}
function homeTele(){if(me.tele)return;msg('You begin casting Home Teleport...');me.act=null;me.path=[];me.tele=performance.now();me.emote={n:'Tele',t0:performance.now()};setTimeout(()=>{me.snap(...SPAWN);me.tele=0;me.emote=null;msg('You teleport home.')},3000)}
function longable(el,tap,long){
 let timer=0,active=null,sx=0,sy=0,moved=false,held=false,suppressClickUntil=0;
 el.style.touchAction='pan-y';el.style.webkitUserSelect='none';el.style.webkitTouchCallout='none';
 el.tabIndex=0;el.setAttribute('role','button');
 const item=el.dataset.id||(ST.inv[+el.dataset.i]||{}).id;el.setAttribute('aria-label',item&&IT[item]?IT[item].n:'Empty inventory slot');
 const cancel=()=>{clearTimeout(timer);active=null;moved=true;suppressClickUntil=performance.now()+600};
 el.addEventListener('pointerdown',e=>{if(e.isPrimary===false){cancel();return}if(e.button!==0||active!==null)return;active=e.pointerId;sx=e.clientX;sy=e.clientY;moved=false;held=false;suppressClickUntil=performance.now()+600;
  timer=setTimeout(()=>{if(active!==null&&!moved){held=true;suppressClickUntil=performance.now()+600;long(sx,sy)}},500)});
 el.addEventListener('pointermove',e=>{if(e.pointerId===active&&Math.hypot(e.clientX-sx,e.clientY-sy)>12){moved=true;clearTimeout(timer)}});
 el.addEventListener('pointerup',e=>{if(e.pointerId!==active)return;clearTimeout(timer);active=null;suppressClickUntil=performance.now()+600;if(!moved&&!held)tap()});
 el.addEventListener('pointercancel',cancel);el.addEventListener('pointerleave',cancel);el.addEventListener('lostpointercapture',cancel);
 el.addEventListener('click',e=>{e.stopPropagation();if(performance.now()>=suppressClickUntil&&!held&&!moved)tap()});
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();tap()}else if(e.key==='ContextMenu'||e.key==='F10'&&e.shiftKey){e.preventDefault();e.stopPropagation();const r=el.getBoundingClientRect();long(r.left+r.width/2,r.top+r.height/2)}});
 el.addEventListener('contextmenu',e=>{e.preventDefault();clearTimeout(timer);active=null;suppressClickUntil=performance.now()+600;if(!held){held=true;long(e.clientX,e.clientY)}});
}
function invOpts(i){const s=ST.inv[i];if(!s)return[];const d=IT[s.id],o=[];if(UI.mode==='bank'){o.push(['Deposit-1','dep1']);if(s.q>1)o.push(['Deposit-5','dep5'],['Deposit-10','dep10'],['Deposit-All','depall'])}else if(UI.mode==='store')o.push([`Sell (${Math.max(1,Math.floor(d.v*.4))} gp)`,'sell']);
 if(d.heal)o.push(['Eat','eat']);if(d.bury)o.push(['Bury','bury']);if(d.slot)o.push([d.slot==='weapon'||d.slot==='shield'?'Wield':'Wear','wield']);o.push(['Use','use'],['Drop','drop'],['Examine','ex']);return o}
function useOn(a,b){const A=ST.inv[a],B=ST.inv[b];UI.use=null;if(!A||!B||a===b)return;const p=[A.id,B.id].sort().join('+');if(p==='logs+tinder'){const li=A.id==='logs'?a:b;lightFire(li);return}const ra=IT[A.id].cook?a:IT[B.id].cook?b:-1;if(ra>=0&&(A.id==='tinder'||B.id==='tinder')){msg('You need a fire or range to cook on.');return}msg('Nothing interesting happens.')}
function invTap(i){if(UI.use!=null&&UI.use!==i){useOn(UI.use,i);return}UI.use=null;const o=invOpts(i);if(o.length)invAction(i,o[0][1])}
function invMenu(i,x,y){const s=ST.inv[i];if(!s)return;openMenu(x,y,invOpts(i).map(([l,a])=>[`${l} <em class="o">${IT[s.id].n}</em>`,()=>invAction(i,a)]))}
function invAction(i,a){const s=ST.inv[i];if(!s)return;const d=IT[s.id];
 switch(a){case 'eat':{const missing=lv('Hitpoints')-ST.hp;if(missing<=0){msg("You are already at full health.");return}const healed=Math.min(d.heal,missing);if(d.st&&s.q>1)s.q--;else ST.inv[i]=null;ST.hp+=healed;me.cd=Math.max(me.cd,3);msg(`You eat the ${d.n.toLowerCase()}. It heals ${healed} hitpoints.`);task('eat');updOrbs();break}
  case 'bury':ST.inv[i]=null;swing(me);msg('You bury the bones.');gainXP('Prayer',d.bury);task('bury');break;
  case 'wield':{if(d.req)for(const k in d.req)if(lv(k)<d.req[k]){msg(`You need a ${k} level of ${d.req[k]} to equip this.`);return}const old=ST.eq[d.slot];ST.eq[d.slot]=s.id;ST.inv[i]=old?{id:old,q:1}:null;refreshGear();break}
  case 'drop':ST.inv[i]=null;dropItem(s.id,s.q,me.x,me.z);break;
  case 'ex':msg(d.ex);break;case 'use':UI.use=i;msg(`Use ${d.n} with... (tap another item)`);break;
  case 'dep':case 'dep1':case 'dep5':case 'dep10':case 'depall':{const amount=a==='depall'?s.q:a==='dep5'?5:a==='dep10'?10:1,n=Math.min(s.q,amount);ST.bank[s.id]=(ST.bank[s.id]||0)+n;s.q-=n;if(s.q<=0)ST.inv[i]=null;break}
  case 'sell':{const p=Math.max(1,Math.floor(d.v*.4))*(d.st?s.q:1);ST.inv[i]=null;addItem('coins',p);msg(`You sell the ${d.n} for ${p} coins.`);break}}
 invChanged()}
function bankMenu(id,x,y){const q=ST.bank[id]||0;if(!q)return;const n=IT[id].st?q:Math.min(q,freeSlots()),choices=[1,5,10].filter(v=>v<n).map(v=>[`Withdraw-${v} <em class="o">${IT[id].n}</em>`,()=>withdrawBank(id,v)]);choices.push([`Withdraw-${IT[id].st?'All':n} <em class="o">${IT[id].n}</em>`,()=>withdrawBank(id,n)]);openMenu(x,y,choices)}
function withdrawBank(id,amount){const q=ST.bank[id]||0;if(!q)return;const n=IT[id].st?Math.min(q,amount):Math.min(q,amount,freeSlots());if(!n){msg('Your inventory is full.');return}if(!addItem(id,n)){msg('Your inventory is full.');return}ST.bank[id]-=n;if(!ST.bank[id])delete ST.bank[id];renderPanel()}
// ---------------- menu ----------------
function openMenu(x,y,items){const M=$('menu');UI.menu=items;$('mitems').innerHTML=items.concat([['Cancel',()=>{}]]).map((it,k)=>`<button type="button" class="mi" data-k="${k}">${it[0]}</button>`).join('');M.classList.remove('hidden');
 const w=M.offsetWidth,h=M.offsetHeight;M.style.left=Math.max(4,Math.min(innerWidth-w-4,x-w/2))+'px';M.style.top=Math.max(4,Math.min(innerHeight-h-4,y-10))+'px';
 M.querySelectorAll('.mi').forEach(el=>el.onclick=e=>{e.stopPropagation();const it=items[+el.dataset.k];closeMenu();if(it)it[1]()})}
function closeMenu(){$('menu').classList.add('hidden');UI.menu=null}
// ---------------- picking ----------------
const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
function pick(cx,cy){ndc.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(ndc,cam);
 const cands=[...MON.filter(m=>!m.dead).map(m=>m.r.g),...NPCS.map(n=>n.r.g),...[...MP.players.values()].map(p=>p.e.r.g),...GI.map(g=>g.s),...PICK,blobI,pineI,trunkI,rockI,ground,water];
 const hits=ray.intersectObjects(cands,true);for(const h of hits){let o=h.object;
  if(o===blobI||o===pineI){const t=TREES.find(t=>t.cm===o&&t.ci===h.instanceId);if(t)return{k:'tree',o:t};continue}
  if(o===trunkI){const t=TREES[h.instanceId];if(t)return{k:'tree',o:t};continue}
  if(o===rockI)return{k:'rock',o:ROCKS[h.instanceId]};
  if(o.userData.gi)return{k:'item',o:o.userData.gi};
  if(o.userData.obj)return{k:o.userData.obj.kind,o:o.userData.obj};
  if(o===ground||o===water){const x=Math.floor(h.point.x),z=Math.floor(h.point.z);const g=GI.filter(g=>g.x===x&&g.z===z).pop();if(g)return{k:'item',o:g,x,z};const ob=objAt.get(I(x,z));if(ob&&ob.kind!=='deco')return{k:ob.kind,o:ob};return{k:'tile',x,z}}
  while(o&&!o.userData.ent)o=o.parent;if(o){const e=o.userData.ent;if(e.kind==='mon'&&!e.dead)return{k:'mon',o:e};if(e.kind==='npc')return{k:'npc',o:e};if(e.kind==='other')return{k:'other',o:e}}}
 return null}
const lvTag=l=>{const d=l-combatLvl();const c=d>2?'#f00':d>0?'#f90':d<-2?'#0f0':d<0?'#9f0':'#ff0';return `<span style="color:${c}">(level-${l})</span>`};
function optsFor(p){if(!p)return[];const o=p.o,Y=n=>`<em>${n}</em>`,C=n=>`<em class="o">${n}</em>`;switch(p.k){
 case 'mon':return[[`Attack ${Y(o.d.n)} ${lvTag(o.d.lvl)}`,()=>act({t:'attack',o},1)],[`Examine ${Y(o.d.n)}`,()=>msg((o.d.ex||'A creature.')+(o.d.weakness?' Weak to '+o.d.weakness+'.':''))]];
 case 'npc':return[[`Talk-to ${Y(o.name)}`,()=>act({t:'talk',o},1)],[`Examine ${Y(o.name)}`,()=>msg(o===guide?'He provides new players with useful information.':'He looks friendly.')]];
 case 'other':return[[`Follow ${C(o.name)}`,()=>act({t:'follow',o},1)],[`Examine ${C(o.name)}`,()=>msg(`It's ${esc(o.name)}, a fellow adventurer.`)]];
 case 'tree':return[[`Chop down ${C(o.alive?'Tree':'Tree stump')}`,()=>act({t:'chop',o},1)],[`Examine ${C('Tree')}`,()=>msg(o.alive?'A healthy, well-rooted tree.':'This tree has been cut down.')]];
 case 'rock':return[[`Mine ${C('Rocks')}`,()=>act({t:'mine',o},1)],[`Prospect ${C('Rocks')}`,()=>msg(o.alive?`This rock contains ${o.ore}.`:'There is currently no ore available in this rock.')]];
 case 'fish':return[[`Net ${Y('Fishing spot')}`,()=>act({t:'fish',o},1)],[`Examine ${Y('Fishing spot')}`,()=>msg('Shrimps swim here.')]];
 case 'booth':return[[`Bank ${C('Bank booth')}`,()=>act({t:'bank',o},1)],[`Examine ${C('Bank booth')}`,()=>msg('The bank teller will serve you from here.')]];
 case 'store':return[[`Trade ${C('Shop counter')}`,()=>act({t:'store',o},1)]];
 case 'altar':return[[`Pray-at ${C('Altar')}`,()=>act({t:'altar',o},1)]];
 case 'item':return[[`Take <em style="color:#f90">${IT[o.id].n}</em>`,()=>act({t:'take',o},1)],[`Examine <em style="color:#f90">${IT[o.id].n}</em>`,()=>msg(IT[o.id].ex)]];
 default:return[]}}
const XM=document.createElement('div');XM.className='xm';XM.textContent='✕';XM.style.display='none';OV.appendChild(XM);let xmT=0,xmP=null;
function mark(x,z,red){xmP=new THREE.Vector3(x,hAt(x,z)+.05,z);XM.style.color=red?'#f00':'#ff0';xmT=performance.now()}
function act(a,red){if(me.tele)return;if(a.t==='attack'&&a.o&&a.o.kind==='mon')UI.target=a.o;closeMenu();if(UI.mode&&a.t!=='bank'&&a.t!=='store'){UI.mode=null;renderPanel()}const o=a.o;if(a.t==='walk')mark(a.x+.5,a.z+.5,0);else if(o){const p=o.pts?o.vpos(performance.now()):[o.x+.5,o.z+.5];mark(p[0],p[1],1)}me.emote=null;setAct(a);if(!arrived(a))planPath(a)}
function tapAt(cx,cy){const p=pick(cx,cy);if(!p)return;const o=optsFor(p);if(o.length)o[0][1]();else if(p.k==='tile'){act({t:'walk',x:p.x,z:p.z})}}
function menuAt(cx,cy){const p=pick(cx,cy);const o=optsFor(p);if(p&&(p.k==='tile'||p.x!==undefined||o.length)){const t=p.k==='tile'?p:{x:Math.floor(p.o.x),z:Math.floor(p.o.z)};o.push(['Walk here',()=>act({t:'walk',x:t.x,z:t.z})])}openMenu(cx,cy,o)}
// ---------------- input ----------------
const CAM={yaw:0,pitch:54*Math.PI/180,dist:18};
// Optional one-finger camera buttons complement the existing drag/pinch gestures.
const cameraControls=document.createElement('details');cameraControls.id='mobile-camera';
cameraControls.innerHTML='<summary aria-label="Show camera controls">Camera</summary><div><button type="button" data-camera="left" aria-label="Rotate camera left">↶</button><button type="button" data-camera="right" aria-label="Rotate camera right">↷</button><button type="button" data-camera="up" aria-label="Tilt camera up">↑</button><button type="button" data-camera="down" aria-label="Tilt camera down">↓</button><button type="button" data-camera="in" aria-label="Zoom in">＋</button><button type="button" data-camera="out" aria-label="Zoom out">−</button><button type="button" data-camera="north" aria-label="Face north">N</button></div>';
$('hud').appendChild(cameraControls);cameraControls.addEventListener('click',e=>{const b=e.target.closest('[data-camera]');if(!b)return;e.stopPropagation();const a=b.dataset.camera;if(a==='left')CAM.yaw+=Math.PI/8;if(a==='right')CAM.yaw-=Math.PI/8;if(a==='up')CAM.pitch=Math.min(66*Math.PI/180,CAM.pitch+.08);if(a==='down')CAM.pitch=Math.max(30*Math.PI/180,CAM.pitch-.08);if(a==='north')CAM.yaw=0;if(a==='in')CAM.dist=Math.max(7,CAM.dist*.85);if(a==='out')CAM.dist=Math.min(32,CAM.dist/ .85)});
const ptrs=new Map();let gest=null;
const cancelWorldGesture=()=>{if(gest)clearTimeout(gest.lp);ptrs.clear();gest=null};
addEventListener('blur',cancelWorldGesture);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelWorldGesture()});
document.addEventListener('pointerdown',e=>{if(e.target!==cv&&ptrs.size)cancelWorldGesture()},{capture:true});
cv.addEventListener('lostpointercapture',e=>{if(ptrs.has(e.pointerId))cancelWorldGesture()});
cv.addEventListener('pointerdown',e=>{if(UI.menu){closeMenu();gest={mode:'none'};return}cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(ptrs.size===1){const sx=e.clientX,sy=e.clientY;gest={mode:'tap',sx,sy,lx:sx,ly:sy,lp:setTimeout(()=>{if(gest&&gest.mode==='tap'){gest.mode='none';menuAt(sx,sy)}},480)}}
 else if(ptrs.size===2){if(gest)clearTimeout(gest.lp);const[a,b]=[...ptrs.values()];gest={mode:'pinch',d0:Math.hypot(a.x-b.x,a.y-b.y),z0:CAM.dist}}});
cv.addEventListener('pointermove',e=>{const p=ptrs.get(e.pointerId);if(!p){if(e.pointerType==='mouse')hover(e.clientX,e.clientY);return}p.x=e.clientX;p.y=e.clientY;if(!gest)return;
 if(gest.mode==='tap'&&Math.hypot(e.clientX-gest.sx,e.clientY-gest.sy)>10){gest.mode='drag';clearTimeout(gest.lp)}
 if(gest.mode==='drag'){CAM.yaw-=(e.clientX-gest.lx)*.008;CAM.pitch=Math.min(66*Math.PI/180,Math.max(30*Math.PI/180,CAM.pitch+(e.clientY-gest.ly)*.004));gest.lx=e.clientX;gest.ly=e.clientY}
 if(gest.mode==='pinch'&&ptrs.size===2){const[a,b]=[...ptrs.values()];const d=Math.hypot(a.x-b.x,a.y-b.y);CAM.dist=Math.min(32,Math.max(7,gest.z0*gest.d0/Math.max(20,d)))}});
const pend=e=>{const had=ptrs.delete(e.pointerId);if(!had||!gest)return;if(gest.mode==='tap'){clearTimeout(gest.lp);if(e.button!==2)tapAt(gest.sx,gest.sy)}if(!ptrs.size)gest=null;else if(gest.mode==='pinch')gest={mode:'none'}};
cv.addEventListener('pointerup',pend);cv.addEventListener('pointercancel',cancelWorldGesture);
cv.addEventListener('contextmenu',e=>{e.preventDefault();if(gest)clearTimeout(gest.lp);gest={mode:'none'};menuAt(e.clientX,e.clientY)});
cv.addEventListener('wheel',e=>{e.preventDefault();CAM.dist=Math.min(32,Math.max(7,CAM.dist*(1+Math.sign(e.deltaY)*.08)))},{passive:false});
addEventListener('keydown',e=>{if(e.defaultPrevented||document.activeElement?.matches('input,textarea,select,button,summary,[role="button"],[contenteditable]'))return;if(e.key==='ArrowLeft')CAM.yaw+=.1;if(e.key==='ArrowRight')CAM.yaw-=.1;if(e.key==='ArrowUp')CAM.pitch=Math.min(66*Math.PI/180,CAM.pitch+.05);if(e.key==='ArrowDown')CAM.pitch=Math.max(30*Math.PI/180,CAM.pitch-.05);if(e.key==='Enter')$('chatinput').focus()});
let hovT=0;function hover(x,y){const n=performance.now();if(n-hovT<120)return;hovT=n;const o=optsFor(pick(x,y));$('tooltip').innerHTML=o.length?o[0][0]+(o.length>1?` <span style="color:#fff">/ ${o.length} more options</span>`:''):''}
$('chatinput').addEventListener('keydown',e=>{if(e.key!=='Enter')return;const v=e.target.value.trim();e.target.value='';e.target.blur();if(!v)return;say(me,v);msg(`<b>${esc(MP.name||ST.name||'You')}</b>: <span style="color:#0000ff">${esc(v)}</span>`);if(MP_ON&&MP.token)mpApi('/mp/3d/chat',{text:v}).catch(()=>{})});
function say(e,t){e.sayT=performance.now();e.sayTxt=t}
const resetNorth=()=>{CAM.yaw=0};$('compass').onclick=resetNorth;$('compass').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();resetNorth()}});
// minimap
const mm=$('mm'),mx=mm.getContext('2d');
function drawMM(px,pz){const N=300,sc=1.3;mx.clearRect(0,0,N,N);mx.save();mx.beginPath();mx.arc(N/2,N/2,N/2,0,7);mx.clip();mx.fillStyle='#000';mx.fillRect(0,0,N,N);mx.translate(N/2,N/2);mx.rotate(CAM.yaw);mx.scale(sc,sc);mx.translate(-px*MMS,-pz*MMS);mx.drawImage(mapC,0,0);
 const dot=(x,z,c,s=4)=>{mx.fillStyle='#000';mx.fillRect(x*MMS-s/2-1,z*MMS-s/2-1,s+2,s+2);mx.fillStyle=c;mx.fillRect(x*MMS-s/2,z*MMS-s/2,s,s)};const n=performance.now();let targetPoint=null;
 for(const g of GI)dot(g.x+.5,g.z+.5,'#f00');for(const m of MON)if(!m.dead){const p=m.vpos(n),elite=m.questBoss||(m.d.lvl||0)>=40,questTarget=ST.tasks.gs_started&&!ST.tasks.gs_done&&(m.type==='goblin'||m.questBoss);dot(p[0],p[1],UI.target===m?'#fff4a3':questTarget?'#ffcf36':elite?'#bd72ff':'#ef5545',UI.target===m||questTarget?7:4);if(UI.target===m)targetPoint=p}if(targetPoint){mx.strokeStyle='#fff';mx.lineWidth=1.5;mx.strokeRect(targetPoint[0]*MMS-4.5,targetPoint[1]*MMS-4.5,9,9)}for(const q of NPCS){const quest=/guide|horacio|aereck|cook/i.test(q.name||'');dot(q.x+.5,q.z+.5,quest?'#65e28d':'#ffd34e')}for(const o of MP.players.values()){const p=o.e.vpos(n);dot(p[0],p[1],'#fff')}
 mx.restore();const heading=me.vf-CAM.yaw,hx=Math.sin(heading),hz=Math.cos(heading),cx=N/2,cz=N/2;mx.beginPath();mx.moveTo(cx+hx*9,cz+hz*9);mx.lineTo(cx+Math.sin(heading+2.45)*7,cz+Math.cos(heading+2.45)*7);mx.lineTo(cx-hx*2,cz-hz*2);mx.lineTo(cx+Math.sin(heading-2.45)*7,cz+Math.cos(heading-2.45)*7);mx.closePath();mx.fillStyle='#fff1ad';mx.strokeStyle='#182a60';mx.lineWidth=2;mx.fill();mx.stroke();$('compass').style.transform=`rotate(${CAM.yaw}rad)`}
mm.addEventListener('click',e=>{const r=mm.getBoundingClientRect(),sx=(e.clientX-r.left)/r.width*300-150,sy=(e.clientY-r.top)/r.height*300-150,c=Math.cos(CAM.yaw),s=Math.sin(CAM.yaw);const dx=(sx*c+sy*s)/1.3/MMS,dz=(-sx*s+sy*c)/1.3/MMS,x=me.x+.5+dx,z=me.z+.5+dz,hit=MON.filter(m=>!m.dead).map(m=>{const p=m.vpos(performance.now());return{m,d:Math.hypot(p[0]-x,p[1]-z)}}).filter(q=>q.d<=2).sort((a,b)=>a.d-b.d)[0];if(hit){act({t:'attack',o:hit.m},1);return}const tx=Math.floor(x),tz=Math.floor(z);if(inb(tx,tz))act({t:'walk',x:tx,z:tz})});
// music (tiny synth)
const MUS={on:false,track:'Harmony',ctx:null,timer:null};
function musicOn(on){MUS.on=on;clearInterval(MUS.timer);if(!on)return;try{MUS.ctx=MUS.ctx||new (window.AudioContext||window.webkitAudioContext)();MUS.ctx.resume()}catch(e){return}let k=0;const seq=[[60,64,67,72],[57,60,64,69],[53,57,60,65],[55,59,62,67]];const base=MUS.track.length%5;
 MUS.timer=setInterval(()=>{const c=MUS.ctx,ch=seq[(k>>3)%4],n=ch[k%4]+base+(k%8>3?12:0);const o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.value=440*Math.pow(2,(n-69)/12);g.gain.setValueAtTime(.05,c.currentTime);g.gain.exponentialRampToValueAtTime(.0001,c.currentTime+.5);o.connect(g).connect(c.destination);o.start();o.stop(c.currentTime+.55);k++},300)}
// ---------------- multiplayer (shared /mp/3d API; only OSRS-mode players shown) ----------------
const OFF=1000;
const MP={on:false,id:null,name:null,token:null,since:0,players:new Map(),err:'',busy:false};window.__B3mp=MP;
const myLook=()=>'om'+look.join('');
async function mpApi(path,body){const h={'Content-Type':'application/json'};if(MP.token)h['X-Player-Token']=MP.token;const tk=ls('bwl.token');if(tk)h.Authorization='Bearer '+tk;const r=await fetch(path,{method:'POST',headers:h,body:JSON.stringify(body)});if(!r.ok){const e=new Error('http '+r.status);e.status=r.status;throw e}return r.json()}
const mpState=()=>({x:OFF+me.x,y:OFF+me.z,plane:0,facing:Math.max(-10,Math.min(10,me.face)),run:!!ST.run,look:myLook()});
async function mpJoin(){try{const j=await mpApi('/mp/3d/join',Object.assign({name:ST.name||('Adv'+(1000+rnd(9000)))},mpState()));MP.token=j.token;MP.id=j.id;MP.name=j.name;MP.since=j.since||0;MP.on=true;MP.err='';$('myname').textContent=j.name;msg(`Welcome to Bramblewick, <b>${esc(j.name)}</b>.`)}catch(e){MP.err=String(e.message||e);MP.on=false}}
function mpRejoin(){mpLeave();MP.token=null;mpJoin()}
function mpLeave(){if(!MP.token)return;try{fetch('/mp/3d/leave',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json','X-Player-Token':MP.token},body:'{}'})}catch(e){}MP.on=false}
async function mpPulse(){if(!MP.token||MP.busy)return;MP.busy=true;try{const r=await mpApi('/mp/3d/pulse',Object.assign(mpState(),{since:MP.since}));MP.err='';const seen=new Set();
 for(const p of r.players||[]){if(!String(p.look||'').startsWith('om')||p.plane!==0)continue;const x=p.x-OFF,z=p.y-OFF;if(!inb(x,z))continue;seen.add(p.id);let o=MP.players.get(p.id);
  if(!o){const lk=String(p.look).slice(2).split('').map(Number);const e=new Ent('other',x,z,makeHuman({skin:'#c8946a',hair:PAL.hair[lk[2]%5|0]||'#3a2412',shirt:PAL.shirt[lk[0]%6|0]||'#7a2020',legs:PAL.legs[lk[1]%4|0]||'#333',boots:'#3a2615'}));e.name=p.name;o={e,name:p.name};MP.players.set(p.id,o)}
  const e=o.e;if(e.x!==x||e.z!==z){const d=cheb(e.x,e.z,x,z);if(d>3)e.snap(x,z);else{const st=[];let cx=e.x,cz=e.z;while(cx!==x||cz!==z){cx+=Math.sign(x-cx);cz+=Math.sign(z-cz);st.push([cx,cz])}e.moveTo(st)}}}
 for(const[id,o]of MP.players)if(!seen.has(id)){S.remove(o.e.r.g);ENTS.splice(ENTS.indexOf(o.e),1);clearEntDom(o.e);MP.players.delete(id)}
 for(const m of r.messages||[]){MP.since=Math.max(MP.since,m.id);if(m.player===MP.id)continue;msg(`<b>${esc(m.name)}</b>: <span style="color:#0000ff">${esc(m.text)}</span>`);const o=[...MP.players.entries()].find(([id])=>id===m.player);if(o)say(o[1].e,m.text)}
 if(UI.tab==='friends'&&TICKN%5===0)renderPanel()}
 catch(e){MP.err=String(e.message||e);if(e.status===401){MP.token=null;mpJoin()}}finally{MP.busy=false}}
if(MP_ON){mpJoin();setInterval(mpPulse,TICK);addEventListener('pagehide',mpLeave)}
addEventListener('pagehide',()=>{ST.pos=[me.x,me.z];save()});
// ---------------- render loop ----------------
const v3=new THREE.Vector3();
function scr(x,y,z){v3.set(x,y,z).project(cam);if(v3.z>1)return null;return[(v3.x+1)/2*innerWidth,(1-v3.y)/2*innerHeight]}
// Persistent, touch-friendly target feedback. The card lives outside the canvas so its
// controls cannot trigger a camera drag or a ground/enemy pick.
const targetCard=document.createElement('section');targetCard.id='target-card';targetCard.className='stone hidden';targetCard.setAttribute('aria-live','polite');
targetCard.innerHTML='<div class="target-head"><strong class="target-name"></strong><button type="button" data-target="style" aria-label="Cycle combat style">ACC</button><button type="button" data-target="prev" aria-label="Previous target">‹</button><button type="button" data-target="next" aria-label="Next target">›</button><button type="button" data-target="clear" aria-label="Clear target">×</button></div><div class="target-hp" role="progressbar" aria-label="Target health" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><i></i></div><div class="target-state"></div><div class="target-actions"><button type="button" class="target-attack" data-target="attack">Attack</button><button type="button" class="target-retaliate" data-target="retaliate" aria-pressed="true">Retaliate: On</button></div>';
document.getElementById('hud').appendChild(targetCard);
const targetMark=document.createElement('div');targetMark.id='target-marker';targetMark.textContent='▼';OV.appendChild(targetMark);
targetCard.addEventListener('click',e=>{const b=e.target.closest('[data-target]');if(!b)return;e.stopPropagation();const live=MON.filter(m=>!m.dead);if(b.dataset.target==='style'){ST.style=((ST.style||0)+1)%3;const names=['Accurate','Aggressive','Defensive'];save();msg('Combat style: '+names[ST.style]+'.');return}if(b.dataset.target==='retaliate'){ST.ar=!ST.ar;save();msg('Auto retaliate '+(ST.ar?'on.':'off.'));return}if(b.dataset.target==='clear'){UI.target=null;return}if(b.dataset.target==='attack'&&UI.target){act({t:'attack',o:UI.target},1);return}if(b.dataset.target==='prev'||b.dataset.target==='next'){if(!live.length){UI.target=null;return}let i=live.indexOf(UI.target);if(i<0)i=0;else i=(i+(b.dataset.target==='next'?1:-1)+live.length)%live.length;UI.target=live[i]}});
function updateTargetUI(now){const styleButton=targetCard.querySelector('[data-target="style"]'),styleName=['Accurate','Aggressive','Defensive'][ST.style]||'Accurate';styleButton.textContent=['ACC','STR','DEF'][ST.style]||'ACC';styleButton.title='Combat style: '+styleName;styleButton.setAttribute('aria-label','Combat style: '+styleName+'. Tap to change.');const autoButton=targetCard.querySelector('[data-target="retaliate"]');autoButton.textContent='Retaliate: '+(ST.ar?'On':'Off');autoButton.classList.toggle('on',!!ST.ar);autoButton.setAttribute('aria-pressed',String(!!ST.ar));const t=UI.target;if(!t||t.dead||!MON.includes(t)){UI.target=null;targetCard.classList.add('hidden');targetMark.style.display='none';return}targetCard.classList.remove('hidden');targetCard.querySelector('.target-name').textContent=`${t.d.n} · level ${t.d.lvl}`;const hp=Math.max(0,Math.min(100,t.hp/t.d.hp*100)),bar=targetCard.querySelector('.target-hp');bar.firstElementChild.style.width=hp+'%';bar.setAttribute('aria-valuenow',String(Math.round(hp)));bar.setAttribute('aria-valuetext',Math.round(hp)+'% health remaining');bar.firstElementChild.style.background=hp<=25?'linear-gradient(90deg,#a51e16,#ef4937)':hp<=50?'linear-gradient(90deg,#b27610,#f1c53d)':'';const d=cheb(me.x,me.z,t.x,t.z),chasing=me.act&&me.act.t==='attack'&&me.act.o===t;targetCard.querySelector('.target-state').textContent=(t.d.weakness?'Weak to '+t.d.weakness+' · ':'')+(d<=1?'In range':chasing?'Approaching · '+d+' tiles':'Out of range · '+d+' tiles');const pos=t.vpos(now),m=scr(pos[0],hAt(pos[0],pos[1])+(t.r.top||1.25)+.3,pos[1]);if(m){targetMark.style.display='block';targetMark.style.left=m[0]+'px';targetMark.style.top=m[1]+'px'}else targetMark.style.display='none'}
function clearEntDom(e){for(const k of['hbD','sayD','nmD'])if(e[k]){e[k].remove();e[k]=null}for(const s of e.splats||[])s.d.remove()}
function entDom(e,now,px,py,pz,top){const head=scr(px,py+top,pz);
 // hp bar
 const showHb=e.hbT&&now-e.hbT<4800&&!(e.kind==='mon'&&e.hp<=0&&now-e.hbT>1200)&&!(e.kind==='mon'&&e.dead===2);if(showHb&&head){if(!e.hbD){e.hbD=document.createElement('div');e.hbD.className='hpb';e.hbD.innerHTML='<i></i>';OV.appendChild(e.hbD)}const f=e===me?ST.hp/lv('Hitpoints'):Math.max(0,e.hp)/e.d.hp;e.hbD.firstChild.style.width=(f*100)+'%';e.hbD.style.left=head[0]+'px';e.hbD.style.top=(head[1]-10)+'px';e.hbD.style.display=''}else if(e.hbD)e.hbD.style.display='none';
 // splats
 if(e.splats&&e.splats.length){const mid=scr(px,py+top*.55,pz);e.splats=e.splats.filter((s,k)=>{if(now-s.t>1000){s.d.remove();return false}if(mid){s.d.style.left=(mid[0]+[0,-14,14,0][k%4])+'px';s.d.style.top=(mid[1]+[0,-12,-12,-24][k%4])+'px'}return true})}
 // overhead chat
 if(e.sayT&&now-e.sayT<4000&&head){if(!e.sayD){e.sayD=document.createElement('div');e.sayD.className='say';OV.appendChild(e.sayD)}e.sayD.textContent=e.sayTxt;e.sayD.style.left=head[0]+'px';e.sayD.style.top=(head[1]-14)+'px';e.sayD.style.display=''}else if(e.sayD)e.sayD.style.display='none';
 // name (other players)
 if(e.kind==='other'&&head){if(!e.nmD){e.nmD=document.createElement('div');e.nmD.className='nm';OV.appendChild(e.nmD)}e.nmD.textContent=e.name;e.nmD.style.left=head[0]+'px';e.nmD.style.top=(head[1]-(e.sayT&&now-e.sayT<4000?30:2))+'px'}}
const _DK=new Map(),_rc=new THREE.Raycaster(),_dn=new THREE.Vector3(0,-1,0);let _WM=null;
function yAt(px,pz){const h=hAt(px,pz),tx=Math.floor(px),tz=Math.floor(pz),y=SZ-1-tz;if(tx<0||y<0||tx>=SZ||y>=SZ||TOT[y*SZ+tx]!==1)return h;const key=tx*4096+tz;let d=_DK.get(key);
 if(d===undefined){if(!_WM){_WM=[];S.traverse(o=>{if(o.isMesh&&o!==ground&&o.material===WMAT)_WM.push(o)})}_rc.set(new THREE.Vector3(tx+.5,h+1.2,tz+.5),_dn);_rc.far=1.6;const hit=_rc.intersectObjects(_WM,false)[0];d=hit?hit.point.y:-1e9;_DK.set(key,d)}
 return Math.max(h,d)}
function animEnt(e,now,dt){try{if(e===me)showTool()}catch(_){}const[px,pz,mv]=e.vpos(now);const r=e.r,g=r.g;const y=yAt(px,pz);g.position.set(px,y,pz);
 let df=e.face-e.vf;df=Math.atan2(Math.sin(df),Math.cos(df));e.vf+=df*Math.min(1,dt*12);g.rotation.y=e.vf;
 const running=mv&&e.pts.length>2;e.phase+=dt*(mv?(running?13:8):0);const sw=mv?Math.sin(e.phase)*(running?.9:.6):0;
 if(r.type==='h'){r.legs[0].rotation.x=sw;r.legs[1].rotation.x=-sw;r.AL.rotation.set(-sw*.8,0,0);r.AR.rotation.set(sw*.8,0,0);r.b.position.y=mv?Math.abs(Math.sin(e.phase))*.04:0;r.b.rotation.set(0,0,0);r.hd.rotation.set(0,0,0)}
 else if(r.type==='cr'){crAnim(e,r,px,pz,now,dt);r.b.rotation.set(0,0,0);r.b.position.y=0}else if(r.type==='bw'){const dd=Math.hypot(px-(e._lx??px),pz-(e._lz??pz));e._lx=px;e._lz=pz;try{bwAnim(r.ah,dd,dt,now/1000,running)}catch(_){}if(r.L?.sL&&r.L?.sR){r.L.sL.rotation.y=0;r.L.sL.rotation.z=-.08;r.L.sR.rotation.y=0;r.L.sR.rotation.z=.08}r.b.rotation.set(0,0,0);r.hd.rotation.x=0;r.b.position.y=0}
 else{r.legs.forEach((l,k)=>l.rotation.x=(k%2?-sw:sw)*(k>1?-1:1));r.b.rotation.set(0,0,0);r.hd.rotation.x=0;r.b.position.y=0}
 // Keep articulated arms on a clean locomotion base each frame; action poses are layered below.
 if(r.type==='bw'&&r.L?.sL&&r.L?.sR&&r.L?.eL&&r.L?.eR&&r.L?.chest){const L=r.L;L.sL.rotation.set(-sw*.45,0,-.08);L.sR.rotation.set(sw*.45,0,.08);L.eL.rotation.set(-.18,0,0);L.eR.rotation.set(-.18,0,0);L.chest.rotation.set(0,0,0)}
 const at=(now-e.atkT)/450;if(at>=0&&at<1){const k=Math.sin(at*Math.PI);if(r.type==='bw'&&r.L?.sL&&r.L?.sR&&r.L?.eL&&r.L?.eR&&r.L?.chest){const L=r.L,wn=(e===me&&ST.eq&&ST.eq.weapon)||'',sty=e===me&&e.previewSwingUntil>now?(e.atkKind==='stab'?1:e.atkKind==='crush'?2:0):(/dagger/.test(wn)?1:/whammer|mace/.test(wn)?2:/staff/.test(wn)?3:0);if(e.atkKind==='magic'){L.sR.rotation.set(-1.05*k,0,.08);L.sL.rotation.set(-.95*k,0,-.08);L.eR.rotation.set(-.15+.62*k,0,0);L.eL.rotation.set(-.15+.5*k,0,0)}else if(sty===1){L.sR.rotation.set(-1.05*k,0,.08-.16*k);L.eR.rotation.set(-.15+.38*k,0,0);L.sL.rotation.x-=.16*k;L.eL.rotation.x+=.12*k;L.chest.rotation.y=.12*k}else if(sty===2){L.sR.rotation.set(-1.55*k,0,.08-.12*k);L.eR.rotation.set(-.15+.34*k,0,0);L.sL.rotation.x-=.2*k;L.eL.rotation.x+=.14*k;L.chest.rotation.y=.1*k}else if(sty===3){L.sR.rotation.set(-.82*k,0,.08-.1*k);L.eR.rotation.set(-.15+.25*k,0,0)}else{L.sR.rotation.set(-1.18*k,0,.08-.38*k);L.eR.rotation.set(-.15+.46*k,0,0);L.sL.rotation.x-=.18*k;L.eL.rotation.x+=.12*k;L.chest.rotation.y=.16*k}}else if(r.type==='bw'){g.position.x+=Math.sin(e.vf)*k*.2;g.position.z+=Math.cos(e.vf)*k*.2;r.b.rotation.x=k*.2}else if(r.type==='h'){r.AR.rotation.x=-k*2.1;r.b.rotation.y=k*.25}else{r.hd.rotation.x=k*.5;r.b.position.z=0;const ln=e===me?.32:.2;g.position.x+=Math.sin(e.vf)*k*ln;g.position.z+=Math.cos(e.vf)*k*ln;if(e===me){const wn=(ST.eq&&ST.eq.weapon)||'';if(/dagger|staff/.test(wn)){r.b.rotation.x=k*.18}else{const a=Math.min(1,at*1.4);r.b.rotation.y=.7-1.4*a;r.b.rotation.x=k*.22}}else r.b.rotation.x=k*.2}}
 const ht=(now-e.hitT)/320;if(ht>=0&&ht<1&&r.type!=='h'){const f=Math.sin(ht*Math.PI);r.b.rotation.z=Math.sin(ht*Math.PI*3)*.14*(1-ht);r.b.rotation.x=-f*.28;g.position.x-=Math.sin(e.vf)*f*.18;g.position.z-=Math.cos(e.vf)*f*.18}
 if(e.emote){const t=(now-e.emote.t0)/1000,n=e.emote.n;if(r.type==='h'){if(n==='Wave'||n==='Cheer'||n==='Beckon'){r.AR.rotation.set(0,0,2.6+Math.sin(t*10)*.4);if(n==='Cheer')r.AL.rotation.set(0,0,-2.6-Math.sin(t*10)*.4)}else if(n==='Bow'||n==='Cry'||n==='Think'){r.b.rotation.x=.5;r.hd.rotation.x=.3}else if(n==='Jump'||n==='Laugh'||n==='Yes'){r.b.position.y=Math.abs(Math.sin(t*7))*.35}else if(n==='Dance'||n==='Spin'||n==='Tele'){g.rotation.y+=t*8;r.b.position.y=Math.abs(Math.sin(t*9))*.15;if(n==='Tele')r.b.position.y=t*.25}else if(n==='Clap'){r.AL.rotation.set(-1.3,0,-Math.abs(Math.sin(t*12))*.6);r.AR.rotation.set(-1.3,0,Math.abs(Math.sin(t*12))*.6)}else if(n==='No'||n==='Angry'||n==='Shrug'){r.hd.rotation.y=Math.sin(t*10)*.5}}}
 // Gathering uses its own two-handed loop; do not leave it stamped over the idle/walk pose.
 if(e===me&&me.act&&['chop','mine','fish'].includes(me.act.t)&&arrived(me.act)){
  const k=Math.abs(Math.sin(now/300));
  if(r.type==='bw'&&r.L?.sL&&r.L?.sR&&r.L?.eL&&r.L?.eR){const L=r.L;L.sR.rotation.set(-1.35*k,0,.08-.12*k);L.sL.rotation.set(-.95*k,0,-.08);L.eR.rotation.x=-.15+.35*k;L.eL.rotation.x=-.15+.25*k}
  else if(r.type==='h'){r.AR.rotation.x=-k*1.8;r.AL.rotation.x=-k*1.2}
 }
 if(e.kind==='mon'){if(e._s0==null)e._s0=g.scale.x;
   if(!e.dead){if(g.scale.x!==e._s0)g.scale.setScalar(e._s0);if(mv)g.position.y+=Math.abs(Math.sin(e.phase))*.08;
    if(at>=0&&at<1){const k=Math.sin(at*Math.PI);g.position.x+=Math.sin(e.vf)*k*.14;g.position.z+=Math.cos(e.vf)*k*.14;g.position.y+=k*.07}
    if(ht>=0&&ht<1){const f=Math.sin(ht*Math.PI);g.position.x-=Math.sin(e.vf)*f*.1;g.position.z-=Math.cos(e.vf)*f*.1;g.rotation.y+=Math.sin(ht*Math.PI*4)*.12*(1-ht)}}
   else{const t=Math.min(1,(now-e.deadT)/600),t2=Math.min(1,Math.max(0,(now-e.deadT-700)/700));r.b.rotation.z=(1-Math.pow(1-t,3))*1.5;r.b.position.y=-t2*.5;g.scale.setScalar(e._s0*(1-t2*.85))}}
 const top=r.top?r.top+.12:r.type==='q'?1.35:r.type==='c'?.85:(e.kind==='mon'?1.25:1.65);entDom(e,now,px,y,pz,top);return[px,y,pz]}
// Add a wind-up/contact/follow-through accent to the selected 3D preview swing.
const _anim67=animEnt;animEnt=function(e,now,dt){const pos=_anim67(e,now,dt),r=e.r;if(e.dead)return pos;const t=(now-e.atkT)/450;if(t<0||t>=1)return pos;
 let wind=0,hit=0,follow=0;if(t<.24)wind=Math.sin(t/.24*Math.PI/2);else if(t<.57)hit=Math.sin((t-.24)/.33*Math.PI);else follow=Math.sin((t-.57)/.43*Math.PI/2);
 const kind=e.atkKind||'slash',L=r.L,profile=kind==='stab'?[-.42,.5,-.12]:kind==='crush'?[-.62,.22,-.28]:kind==='magic'?[-.22,.3,-.1]:[-.32,.48,-.2];
 if(r.type==='bw'&&L?.sR&&L?.eR){L.sR.rotation.x+=profile[0]*wind+profile[1]*hit+profile[2]*follow;L.eR.rotation.x+=.12*wind-.2*hit+.08*follow;if(L.sL){L.sL.rotation.x+=.15*wind-.12*hit+.08*follow;L.eL.rotation.x-=.08*wind+.06*hit}if(L.chest)L.chest.rotation.y+=(kind==='stab'?.2:.32)*(hit-follow*.65)}
 else if(r.type==='h'){r.AR.rotation.x+=profile[0]*wind+profile[1]*hit+profile[2]*follow;r.AL.rotation.x+=.12*wind-.1*hit}else{r.b.rotation.z+=(kind==='crush'?.1:.06)*(wind-follow);r.b.rotation.x-=.08*hit}return pos};
function resize(){const w=innerWidth,h=innerHeight;applyGraphicsQuality();cam.aspect=w/h;cam.fov=w/h<1?60:45;cam.updateProjectionMatrix()}
addEventListener('resize',resize);resize();
let last=performance.now(),camT=null;
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;
 while(now-tickT0>=TICK){tickT0+=TICK;if(now-tickT0>TICK*5)tickT0=now;doTick()}
 let mp=null;for(const e of ENTS){if(e!==me&&e.kind!=='other'&&Math.abs(e.x-me.x)+Math.abs(e.z-me.z)>56){if(e.r.g.visible)e.r.g.visible=false;if(e.hbD)e.hbD.style.display='none';continue}else if(!e.r.g.visible&&!(e.kind==='mon'&&e.dead===2))e.r.g.visible=true;const p=animEnt(e,now,dt);if(e===me)mp=p}
 // camera
 const tx=mp[0],ty=mp[1]+.9,tz=mp[2];if(!camT)camT=new THREE.Vector3(tx,ty,tz);camT.lerp(v3.set(tx,ty,tz),Math.min(1,dt*10));const cp=Math.cos(CAM.pitch),d=CAM.dist;
 cam.position.set(camT.x+Math.sin(CAM.yaw)*cp*d,camT.y+Math.sin(CAM.pitch)*d,camT.z+Math.cos(CAM.yaw)*cp*d);cam.lookAt(camT);
 TX.water.offset.set(now*.00003,now*.00005);for(const f of FISH){f.mesh.children.forEach((c,k)=>{if(c.geometry.type!=='RingGeometry')return;const s=1+((now/700+k*.5)%1)*1.6;c.scale.set(s,s,s)})}
 if(window.__omFlag)window.__omFlag.rotation.y=Math.sin(now/500)*.15;
 // x marker
 const xt=(now-xmT)/450;if(xmP&&xt<1){const s=scr(xmP.x,xmP.y,xmP.z);if(s){XM.style.display='';XM.style.left=s[0]+'px';XM.style.top=s[1]+'px';XM.style.transform=`scale(${1.3-xt*.7})`}}else XM.style.display='none';
 updateTargetUI(now);worldFrame(now,mp[0],mp[2]);drawMM(mp[0],mp[2]);R.render(S,cam)}
// ---------------- boot ----------------
updOrbs();updXpTot();if(!MP_ON)$('myname').textContent=ST.name||'You';
streamAt(me.x+.5,me.z+.5,true);window.__fantasy78={townDetails:addTownDetails(S,WD.P,LOC,SZ,hAt)};
msg('Welcome to Bramblewick.');
openTab('inv');
requestAnimationFrame(t=>{last=t;tickT0=t;frame(t);$('boot').style.display='none';window.__B3ready=true});
if(!ST.tasks.talk)setTimeout(()=>{
 if((navigator.maxTouchPoints>0||matchMedia('(any-pointer:coarse)').matches)&&matchMedia('(orientation:landscape)').matches){
  msg('<span style="color:#ffd471">Lumbridge Guide:</span> Welcome to Lumbridge. Talk to me by the castle for your first tasks.');
 }else showDialog('Lumbridge Guide',['Welcome to Lumbridge, adventurer! Come and talk to me here by the castle — I have some tasks for you.']);
},800);
// test / debug hooks
// ================= v43: CLIENT-SIDE BOTS ("random players") =================
// These are NOT real players: local-only NPC entities (e.bot=1) with OSRS-style names that wander, swing at trees/monsters and chat.
const BOTS=[];try{const hid=Object.keys(WD.npc).find(k=>/^(Man|Woman)$/.test((WD.npc[k]||{}).name||''));
 const BN=['Zezima_2','Iron Bram','Lumby Lad','Rune Rick','xXGoblinXx','Shrimp Queen'],BL=['buying gf','selling lobbies 200ea','anyone wanna duel?','lvl up! :D','gz','where is the mine?','nice weather in Lumbridge','free stuff at castle lol','wc lvl 15 finally','afk chopping'];
 if(hid)for(let i=0;i<BN.length;i++){let x=0,z=0;for(let k=0;k<80;k++){x=BOX[0]+4+((i*37+k*13)%(BOX[2]-BOX[0]-8));z=BOX[1]+4+((i*53+k*29)%(BOX[3]-BOX[1]-8));if(walkable(x,z))break}
  const b=npc(BN[i]+' (bot)',x,z,hid,['Just training, mate.','(This is a bot.)']);b.static=0;b.bot=1;BOTS.push(b)}
 setInterval(()=>{if(document.hidden)return;for(const b of BOTS){const r=Math.random();
   if(r<.55){const dx=[-1,0,1][Math.random()*3|0],dz=[-1,0,1][Math.random()*3|0],nx=b.x+dx,nz=b.z+dz;if((dx||dz)&&inBox(nx,nz)&&walkable(nx,nz)&&canStep(b.x,b.z,dx,dz))b.moveTo([[nx,nz]])}
   else if(r<.7){const t=[...TREES,...MON.filter(m=>!m.dead)].find(o=>Math.abs(o.x-b.x)<=2&&Math.abs(o.z-b.z)<=2);if(t){b.face=Math.atan2(t.x-b.x,t.z-b.z);b.atkT=performance.now()}}
   else if(r<.73){const l=BL[Math.random()*BL.length|0];say(b,l);msg('<span style="color:#7ad">'+b.name+':</span> '+l)}}},1200)}catch(err){console.warn('bots43',err)}
window.__OM43bots=BOTS;
window.__OM={ST,me,MON,FISH,OBJ,CHK,streamAt,walkable,stepOK,findPath,SPAWN,TREES,ROCKS,GI,NPCS,act,pick,CAM,invCount,lv,screenOf:(e)=>{const p=e.pts?e.vpos(performance.now()):[e.x+.5,e.z+.5];return scr(p[0],hAt(p[0],p[1])+.7,p[1])},tapAt,menuAt,openTab,get tick(){return TICKN}};
// ================= p6: polish layer =================
{
const FL=[];
// ---- particles (death puffs, hit sparks)
const PT=[];const puffM=new THREE.MeshBasicMaterial({color:0xdddddd,transparent:true,opacity:.8,depthWrite:false});const pg=new THREE.IcosahedronGeometry(.18,0);
function puff(x,y,z,n=10,col){for(let i=0;i<n;i++){const m=new THREE.Mesh(pg,col?new THREE.MeshBasicMaterial({color:col,transparent:true,depthWrite:false}):puffM.clone());m.position.set(x,y,z);S.add(m);const a=Math.random()*6.28;PT.push({m,v:[Math.cos(a)*(.6+Math.random()),.8+Math.random()*1.4,Math.sin(a)*(.6+Math.random())],t0:performance.now(),life:600+Math.random()*400})}}
// Lightweight, local-only combat preview geometry. Preview buttons never call the hit or XP rules.
const STRIKES=[],STRIKE_ARC=new THREE.TorusGeometry(.72,.045,7,24,Math.PI*1.35),STRIKE_RING=new THREE.TorusGeometry(.48,.035,6,20),STRIKE_LINE=new THREE.CylinderGeometry(.045,.075,.9,7);
function addStrike(e,kind,now){if(kind==='magic'||!e?.vpos)return;const colors={slash:0xffc45c,stab:0xd7efff,crush:0xff7040};
 const mat=new THREE.MeshBasicMaterial({color:colors[kind]||colors.slash,transparent:true,opacity:.9,depthWrite:false,side:THREE.DoubleSide,toneMapped:false,blending:THREE.AdditiveBlending});
 const mesh=new THREE.Mesh(kind==='crush'?STRIKE_RING:kind==='stab'?STRIKE_LINE:STRIKE_ARC,mat),p=e.vpos(now),face=e.vf??e.face??0;
 mesh.position.set(p[0]+Math.sin(face)*.46,hAt(p[0],p[1])+(kind==='crush'?.14:.88),p[1]+Math.cos(face)*.46);
 mesh.rotation.set(kind==='crush'?Math.PI/2:kind==='stab'?Math.PI/2:0,face,kind==='stab'?.22:0);mesh.renderOrder=3;S.add(mesh);STRIKES.push({mesh,mat,t0:now,life:kind==='crush'?380:300,kind,face});
}
function updateStrikes(now){for(let i=STRIKES.length-1;i>=0;i--){const q=STRIKES[i],t=(now-q.t0)/q.life;if(t>=1){S.remove(q.mesh);q.mat.dispose();STRIKES.splice(i,1);continue}q.mat.opacity=.9*(1-t);const pulse=1+.7*t;if(q.kind==='crush')q.mesh.scale.set(pulse,pulse,pulse);else if(q.kind==='stab')q.mesh.scale.set(.8,1.35-.3*t,.8);else q.mesh.scale.set(1+.18*t,1+.1*t,1);q.mesh.rotation.y=q.face+(q.kind==='slash'?-.42*t:q.kind==='stab'?.04*t:0)}}
window.__combatPreviewFx=kind=>addStrike(me,kind,performance.now());
// ---- hit flash (per-entity cloned materials)
function flashable(e){if(e._fl)return e._fl;const L=[];e.r.g.traverse(c=>{if(c.isMesh&&c.material&&c.material.uniforms&&c.material.uniforms.flash)L.push({emissive:{setHex:h=>{c.material.uniforms.flash.value=h?.55:0}}})});return e._fl=L}
// ---- sfx
const AU={c:null};function ac(){try{AU.c=AU.c||new (window.AudioContext||window.webkitAudioContext)();if(AU.c.state==='suspended')AU.c.resume()}catch(e){}return AU.c}
addEventListener('pointerdown',()=>ac(),{once:true});
function tone(f,d,type='square',v=.06,t0=0,f2){const c=AU.c;if(!c||ST.sfx===false)return;const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+t0;o.type=type;o.frequency.setValueAtTime(f,t);if(f2)o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.02)}
function noise(d,v=.08,fq=1200,t0=0){const c=AU.c;if(!c||ST.sfx===false)return;const n=c.sampleRate*d|0,b=c.createBuffer(1,n,c.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=fq;const g=c.createGain();g.gain.value=v;s.connect(f);f.connect(g);g.connect(c.destination);s.start(c.currentTime+t0)}
const SFX={hit:()=>{noise(.12,.18,900);tone(140,.12,'square',.05,0,60)},miss:()=>noise(.08,.06,2500),swing:()=>noise(.09,.05,3500),
 die:()=>{tone(300,.4,'sawtooth',.05,0,70);noise(.3,.08,600,.05)},chop:()=>{tone(220,.06,'square',.06);noise(.05,.08,1800)},mine:()=>{tone(1400,.08,'triangle',.06);tone(2100,.06,'triangle',.03,.02)},
 fish:()=>noise(.25,.05,700),eat:()=>{noise(.05,.07,1500);noise(.05,.07,1500,.12)},pop:()=>tone(600,.08,'sine',.07,0,900),
 lvl:()=>{[523,659,784,1047].forEach((f,i)=>tone(f,.22,'square',.05,i*.12));tone(1047,.6,'triangle',.05,.48)}};
window.__OMsfx=SFX;
// ---- wrappers
const _splat=splat;splat=function(e,dmg){_splat(e,dmg);const now=performance.now();const L=e.splats&&e.splats[e.splats.length-1];if(L)L.d.classList.add('pop');
 if(dmg>0){e.hitT=now;SFX.hit();const F=flashable(e);for(const m of F)m.emissive.setHex(0x880000);e._flT=now;const p=e.vpos?e.vpos(now):[e.x+.5,e.z+.5];puff(p[0],hAt(p[0],p[1])+.9,p[1],4,0xb01010);if(e===me&&dmg>=3)shake=Math.min(.25,dmg*.04)}else SFX.miss()};
const _kill=killMon;killMon=function(m){const p=m.vpos(performance.now());_kill(m);SFX.die();setTimeout(()=>puff(p[0],hAt(p[0],p[1])+.4,p[1],12),900)};
const _gx=gainXP;gainXP=function(s,a){_gx(s,a);if(s==='Woodcutting')SFX.chop();else if(s==='Mining')SFX.mine();else if(s==='Fishing')SFX.fish()};
const _sw=swing;swing=function(e,kind='melee'){const attackKind=kind==='melee'&&e===me&&me.act?.t==='attack'?attackType():kind;_sw(e,attackKind);if(e===me){const t=me.act&&me.act.t;if(t==='chop')SFX.chop();else if(t==='mine')SFX.mine();else if(t==='attack')SFX.swing()}};
if(typeof levelUp==='function'){const _lu=levelUp;levelUp=function(...a){_lu(...a);SFX.lvl()}}
let shake=0;
const _frame=frame;frame=function(now){_frame(now);refreshCombatLab(now);
 for(const f of FL){if(f.light){f.light.intensity=1.3+Math.sin(now/90)*.3+Math.random()*.2;continue}const s=.85+Math.sin(now/70+f.k*3)*.15+Math.random()*.08;f.m.scale.set(s,1+Math.sin(now/55+f.k)*.25,s)}
 for(let i=PT.length-1;i>=0;i--){const p=PT[i],t=(now-p.t0)/p.life;if(t>=1){S.remove(p.m);p.m.material.dispose();PT.splice(i,1);continue}const dt=.016;p.m.position.x+=p.v[0]*dt;p.m.position.y+=p.v[1]*dt;p.m.position.z+=p.v[2]*dt;p.v[1]-=dt*1.5;p.m.scale.setScalar(1+t*1.5);p.m.material.opacity=.8*(1-t)}
 for(const e of[me,...MON])if(e._flT&&now-e._flT>130){for(const m of(e._fl||[]))m.emissive.setHex(0);e._flT=0}
 };
{const _r=R.render.bind(R);R.render=(s,c)=>{updateStrikes(performance.now());if(shake>0){c.position.x+=(Math.random()-.5)*shake;c.position.y+=(Math.random()-.5)*shake;shake=Math.max(0,shake-.015)}_r(s,c)}}
// ---- HUD stone texture
{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.fillStyle='#3d3427';x.fillRect(0,0,64,64);
 for(let j=0;j<64;j++)for(let i=0;i<64;i++){const v=hs(i,j,77);if(v<.35){x.fillStyle=`rgba(${v<.12?0:90},${v<.12?0:78},${v<.12?0:60},.18)`;x.fillRect(i,j,1,1)}}
 x.fillStyle='rgba(20,16,10,.55)';for(let r=0;r<4;r++){x.fillRect(0,r*16+15,64,1);for(let k=0;k<3;k++)x.fillRect(((k*24+(r%2)*12)%64),r*16,1,16)}
 x.fillStyle='rgba(120,105,80,.18)';for(let r=0;r<4;r++)x.fillRect(0,r*16,64,1);
 document.documentElement.style.setProperty('--stoneimg',`url(${c.toDataURL()})`)}
window.__P6={puff,tone};
}
// ================= p7: cache-world interactions, spells, prayers, item icons =================
{
// ---- picking: entities, items, interactive scenery (per-triangle owner), ground
pick=function(cx,cy){ndc.set(cx/innerWidth*2-1,-(cy/innerHeight)*2+1);ray.setFromCamera(ndc,cam);
 const ents=[...MON.filter(m=>!m.dead&&m.r.g.visible).map(m=>m.r.g),...NPCS.filter(n=>n.r.g.visible).map(n=>n.r.g),...[...MP.players.values()].map(p=>p.e.r.g),...GI.map(g=>g.s)];
 const hits=ray.intersectObjects([...ents,...PICK,ground],true);
 for(const h of hits){let o=h.object;
  if(o.userData.gi)return{k:'item',o:o.userData.gi};
  if(o.userData.obj)return{k:o.userData.obj.kind,o:o.userData.obj};
  if(o.userData.chunk!==undefined){const rg=ownerOf(o,h.faceIndex);if(!rg)continue;if(rg[3])return{k:rg[3].kind,o:rg[3]};const d=LOC[rg[2][0]];if(d&&d.n&&rg[2][1]>=9&&rg[2][1]!==22){const x=Math.floor(h.point.x),z=Math.floor(h.point.z);return{k:'tile',x,z,scen:d.n}}continue}
  if(o===ground){const x=Math.floor(h.point.x),z=Math.floor(h.point.z);const g=GI.filter(g=>g.x===x&&g.z===z).pop();if(g)return{k:'item',o:g,x,z};const ob=objAt.get(I(x,z));if(ob&&ob.kind==='fish')return{k:'fish',o:ob};if(ob&&ob.fire&&ob.alive)return{k:'loc',o:ob};return{k:'tile',x,z}}
  while(o&&!o.userData.ent)o=o.parent;if(o){const e=o.userData.ent;if(e.kind==='mon'&&!e.dead)return{k:'mon',o:e};if(e.kind==='npc')return{k:'npc',o:e};if(e.kind==='other')return{k:'other',o:e}}}
 return null};
// ---- spells
const SPELLS=[{id:'wind',n:'Wind Strike',l:1,max:2,xp:5.5,r:[['air',1],['mind',1]],c:0xd8f0ff,sp:15},{id:'water',n:'Water Strike',l:5,max:4,xp:7.5,r:[['air',1],['water',1],['mind',1]],c:0x3a7aff,sp:17},
 {id:'earth',n:'Earth Strike',l:9,max:6,xp:9.5,r:[['air',1],['earth',2],['mind',1]],c:0x6a4a1a,sp:19},{id:'fire',n:'Fire Strike',l:13,max:8,xp:11.5,r:[['air',2],['fire',3],['mind',1]],c:0xff6a10,sp:21}];
window.__SPELLS=SPELLS;UI.sel=null;
const staffRune=()=>ST.eq.weapon&&IT[ST.eq.weapon].rune;
const hasRunes=sp=>sp.r.every(([id,q])=>id===staffRune()||invCount(id)>=q);
function takeRunes(sp){for(const[id,q]of sp.r){if(id===staffRune())continue;let left=q;for(let i=0;i<28&&left>0;i++){const s=ST.inv[i];if(s&&s.id===id){const t=Math.min(left,s.q);s.q-=t;left-=t;if(s.q<=0)ST.inv[i]=null}}}invChanged()}
const PJ=[];const pjG=new THREE.IcosahedronGeometry(.13,1);
function castSpell(m,sp){if(lv('Magic')<sp.l){msg(`You need a Magic level of ${sp.l} to cast this spell.`);me.act=null;return}if(!hasRunes(sp)){msg('You do not have enough runes to cast this spell.');me.act=null;return}
 takeRunes(sp);swing(me,'magic');me.faceTo(m.x,m.z);me.emote={n:'Cast',t0:performance.now()};const p0=me.vpos(performance.now()),p1=m.vpos(performance.now());
 const mesh=new THREE.Mesh(pjG,new THREE.MeshBasicMaterial({color:sp.c}));S.add(mesh);const glow=new THREE.PointLight(sp.c,2,3);mesh.add(glow);
 PJ.push({mesh,a:[p0[0],hAt(p0[0],p0[1])+1.1,p0[1]],m,t0:performance.now()+250,dur:550+cheb(me.x,me.z,m.x,m.z)*45,sp});
 try{window.__P6.tone(520,.25,'sine',.05,0,880)}catch(e){}}
function landSpell(p){const m=p.m,sp=p.sp;if(m.dead)return;
 // Tarnish MagicAccuracy: use the player's magic attack roll against the NPC's
 // magic level and magic-defence bonus. NPC definitions without explicit magic
 // data use level 1 and no bonus, matching basic Lumbridge creatures.
 const ea=(lv('Magic')+8)*(64+bonus('mag')),ml=Math.max(1,+m.d.mag||1),ed=(ml+9)*(64+(+m.d.mdef||0));
 const acc=ea>ed?1-(ed+2)/(2*(ea+1)):ea/(2*(ed+1)),landed=Math.random()<acc;
 // Tarnish's ordinary strike spells roll damage from zero through their max hit.
 let dmg=landed?rnd(sp.max+1):-1;gainXP('Magic',sp.xp+(dmg>0?dmg*2:0));
 if(dmg<0){splat(m,0);msg('Your spell splashes on the target.')}else{dmg=Math.min(m.hp,dmg);m.hp-=dmg;splat(m,dmg);if(dmg>0)gainXP('Hitpoints',Math.round(dmg*1.33*10)/10);m.hitT=performance.now();window.__P6.puff(...(()=>{const q=m.vpos(performance.now());return[q[0],hAt(q[0],q[1])+.8,q[1]]})(),8,sp.c)}
 if(!m.aggro){m.aggro=me;m.cd=Math.max(m.cd,1)}if(m.hp<=0)killMon(m)}
const _frame7=frame;frame=function(now){_frame7(now);for(let i=PJ.length-1;i>=0;i--){const p=PJ[i];const u=(now-p.t0)/p.dur;if(u<0){p.mesh.visible=false;continue}p.mesh.visible=true;const q=p.m.vpos(now),b=[q[0],hAt(q[0],q[1])+.8,q[1]];
  if(u>=1){S.remove(p.mesh);p.mesh.material.dispose();PJ.splice(i,1);landSpell(p);continue}p.mesh.position.set(p.a[0]+(b[0]-p.a[0])*u,p.a[1]+(b[1]-p.a[1])*u+Math.sin(u*Math.PI)*.6,p.a[2]+(b[2]-p.a[2])*u);p.mesh.rotation.y+=.3}
 WMAT.uniforms.tm.value=(now/4000)%1};
// ---- action goals / arrival
const _gf=goalFor;goalFor=function(a){if(a.t==='cast'){const o=a.o;return[(x,z)=>{const d=cheb(x,z,o.x,o.z);return d>=1&&d<=8},o.x,o.z]}return _gf(a)};
const CHOP={'Tree':[1,25,'logs'],'Dead tree':[1,25,'logs'],'Oak tree':[15,37.5,'logs'],'Willow tree':[30,67.5,'logs']};
const MINE={'Copper rocks':[1,17.5],'Tin rocks':[1,17.5],'Iron rocks':[15,35],'Coal rocks':[30,50],'Mithril rocks':[55,80],'Clay rocks':[1,5]};
const _da=doArrive;doArrive=function(a){const o=a.o;
 if(a.t==='door'){me.faceTo(o.x,o.z);swing(me);toggleDoor(o);me.act=null;return}
 if(a.t==='cast'){if(o.dead){me.act=null;return}if(me.cd<=0){castSpell(o,a.sp);me.cd=5;if(UI.sel){UI.sel=null;selUI()}}return}
 if(a.t==='attack'&&ST.autocast){const sp=SPELLS.find(s=>s.id===ST.autocast);if(sp&&lv('Magic')>=sp.l&&hasRunes(sp)){if(o.dead){me.act=null;return}if(me.cd<=0){castSpell(o,sp);me.cd=5}return}}
 if(a.t==='chop'){const c=CHOP[o.name]||[1];if(lv('Woodcutting')<c[0]){me.faceTo(o.x,o.z);msg(`You need a Woodcutting level of ${c[0]} to chop down this tree.`);me.act=null;return}}
 if(a.t==='mine'){const c=MINE[o.name]||[1];if(lv('Mining')<c[0]){msg(`You need a Mining level of ${c[0]} to mine this rock.`);me.act=null;return}if(!o.ore){me.faceTo(o.x,o.z);swing(me);msg('You swing your pick at the rock... but this ore is too hard for a bronze pickaxe here.');me.act=null;return}}
 if(a.t==='talk'&&o.store){me.faceTo(o.x,o.z);openMode('store');me.act=null;return}
 if(a.t==='talk'&&o.bank){me.faceTo(o.x,o.z);openMode('bank');task('bank');me.act=null;return}
 if(a.t==='cook'){me.faceTo(o.x,o.z);const i=ST.inv.findIndex(s=>s&&IT[s.id]&&IT[s.id].cook);if(i<0){msg('You have nothing to cook.');me.act=null;return}if(me.skillCd>0)return;me.skillCd=4;swing(me);const s=ST.inv[i];const ok=Math.random()<Math.min(.9,.55+lv('Cooking')*.03);
  if(ok){ST.inv[i]={id:IT[s.id].cook,q:1};gainXP('Cooking',s.id==='rawbeef'||s.id==='rawchicken'?30:30);task('cook');msg(`You cook the ${IT[s.id].n.replace('Raw ','').toLowerCase()}.`)}else{ST.inv[i]=null;msg('You accidentally burn the food.')}invChanged();if(!ST.inv.some(s=>s&&IT[s.id]&&IT[s.id].cook))me.act=null;return}
 if(a.t==='use'){me.faceTo(o.x,o.z);const v=a.v;me.act=null;
  if(/^Open$|^Close$/.test(v)){msg(v==='Open'?`You open the ${o.name.toLowerCase()}.`:`You close the ${o.name.toLowerCase()}.`);return}
  if(/Climb/.test(v)){msg('You climb the '+o.name.toLowerCase()+'... but the upper floors are not open yet.');return}
  if(v==='Search'){msg(`You search the ${o.name.toLowerCase()} but find nothing interesting.`);return}
  if(v==='Pick'){swing(me);msg(`You pick some ${o.name.toLowerCase()}.`);return}
  if(/Pray/.test(v)){_da({t:'altar',o});return}
  msg('Nothing interesting happens.');return}
 return _da(a)};
// ---- options
const C7=n=>`<em class="o">${n}</em>`,Y7=n=>`<em>${n}</em>`;
const _of=optsFor;optsFor=function(p){if(!p)return[];const o=p.o;
 if(UI.sel&&p.k==='mon'){const sp=UI.sel;return[[`Cast <em style="color:#0f0">${sp.n}</em> -> ${Y7(o.d.n)} ${lvTag(o.d.lvl)}`,()=>{act({t:'cast',o,sp},1);UI.sel=null;selUI()}],[`Cancel`,()=>{UI.sel=null;selUI()}]]}
 if(UI.sel&&p.k!=='mon'){return[[`Cancel`,()=>{UI.sel=null;selUI()}]]}
 switch(p.k){
  case 'mon':return[[`Attack ${Y7(o.d.n)} ${lvTag(o.d.lvl)}`,()=>act({t:'attack',o},1)],[`Cast ${SPELLS[0].n} -> ${Y7(o.d.n)}`,()=>act({t:'cast',o,sp:bestSpell()},1)],[`Examine ${Y7(o.d.n)}`,()=>msg((o.d.ex||'A creature.')+(o.d.weakness?' Weak to '+o.d.weakness+'.':''))]];
  case 'npc':{const L=[[`Talk-to ${Y7(o.name)}`,()=>act({t:'talk',o},1)]];if(o.store)L.unshift([`Trade ${Y7(o.name)}`,()=>act({t:'talk',o},1)]);if(o.bank)L.unshift([`Bank ${Y7(o.name)}`,()=>act({t:'talk',o},1)]);L.push([`Examine ${Y7(o.name)}`,()=>msg(o===guide?'He provides new players with useful information.':`It's ${o.name}.`)]);return L}
  case 'tree':return[[`Chop down ${C7(o.alive?o.name:'Tree stump')}`,()=>act({t:'chop',o},1)],[`Examine ${C7(o.name)}`,()=>msg(o.alive?'A healthy, well-rooted tree.':'This tree has been cut down.')]];
  case 'rock':return[[`Mine ${C7(o.alive?o.name:'Rocks')}`,()=>act({t:'mine',o},1)],[`Prospect ${C7(o.name)}`,()=>msg(o.alive?(o.ore?`This rock contains ${o.ore}.`:`This rock contains ${o.name.replace(' rocks','').toLowerCase()}.`):'There is currently no ore available in this rock.')]];
  case 'booth':return[[`Bank ${C7('Bank booth')}`,()=>act({t:'bank',o},1)],[`Examine ${C7('Bank booth')}`,()=>msg('The bank teller will serve you from here.')]];
  case 'altar':return[[`Pray-at ${C7(o.name)}`,()=>act({t:'altar',o},1)],[`Examine ${C7(o.name)}`,()=>msg('An altar to Saradomin.')]];
  case 'door':return[[`${o.open?'Close':'Open'} ${C7(o.name)}`,()=>act({t:'door',o},1)],[`Examine ${C7(o.name)}`,()=>msg(o.name==='Gate'?'A wooden gate.':'The door is '+(o.open?'open.':'closed.'))]];
  case 'loc':{const L=o.acts.map(v=>[`${v} ${C7(o.name)}`,()=>act(v==='Cook'?{t:'cook',o}:{t:'use',o,v},1)]);L.push([`Examine ${C7(o.name)}`,()=>msg(`It's a ${o.name.toLowerCase()}.`)]);return L}
  case 'tile':return p.scen?[[`Examine ${C7(p.scen)}`,()=>msg(`It's a ${p.scen.toLowerCase()}.`)]].filter(()=>false):[];
 }
 return _of(p)};
const _menuAt=menuAt;menuAt=function(cx,cy){const p=pick(cx,cy);if(p&&p.k==='tile'&&p.scen){const o=[['Walk here',()=>act({t:'walk',x:p.x,z:p.z})],[`Examine ${C7(p.scen)}`,()=>msg(`It's a ${p.scen.toLowerCase()}.`)]];openMenu(cx,cy,o);return}_menuAt(cx,cy)};
function bestSpell(){let b=SPELLS[0];for(const s of SPELLS)if(lv('Magic')>=s.l&&hasRunes(s))b=s;return b}
function selUI(){document.body.classList.toggle('spellsel',!!UI.sel);if(UI.tab==='magic')renderPanel()}
window.__OMcast=(m,id)=>act({t:'cast',o:m,sp:SPELLS.find(s=>s.id===id)||SPELLS[0]},1);
window.__OMsel=id=>{UI.sel=SPELLS.find(s=>s.id===id)||null;selUI()};
// Inventory retains its existing 2D icons; no imported 3D item models are rendered.
itemTex=function(id){if(spriteCache[id])return spriteCache[id];if(!IT[id].img){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d');x.font='48px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText(IT[id].i,32,36);const t=new THREE.CanvasTexture(c);return spriteCache[id]=t}
 const t=new THREE.TextureLoader().load(IT[id].img);t.magFilter=THREE.NearestFilter;t.colorSpace=THREE.SRGBColorSpace;return spriteCache[id]=t};
if(UI.tab)renderPanel();
window.__OM.SPELLS=SPELLS;window.__OM.castSpell=castSpell;window.__OM.UI=UI;
}
window.__OMd={IT,IC,DOORS,toggleDoor,invAction,refreshGear,COL,SZ,stepOK};
// ---- v4: left shortcut strip + objective overlay ----
(()=>{const hud=document.getElementById('hud');const st=document.createElement('div');st.id='lstrip';
 const mk=(t,ti,fn)=>{const b=document.createElement('button');b.className='tab';b.textContent=t;b.title=ti;b.setAttribute('aria-label',ti);b.onclick=e=>{e.stopPropagation();fn(b)};st.appendChild(b);return b};
 mk('💬','Chat',b=>{const c=document.getElementById('chat');c.classList.toggle('hidden');b.classList.toggle('off',c.classList.contains('hidden'))});
 const rb=mk('🏃','Run',b=>{ST.run=!ST.run;b.classList.toggle('off',!ST.run);const o=document.getElementById('orbrun');o&&o.classList.toggle('off',!ST.run)});rb.classList.toggle('off',!ST.run);
 mk('XP','XP drops',b=>{ST.xpdrops=!ST.xpdrops;b.classList.toggle('off',!ST.xpdrops);document.getElementById('xpdrops').style.display=ST.xpdrops?'':'none'});
 mk('⚔','Auto-retaliate',b=>{ST.ar=!ST.ar;b.classList.toggle('off',!ST.ar);msg('Auto retaliate: '+(ST.ar?'On':'Off'))});
 hud.appendChild(st);
 const ob=document.createElement('div');ob.id='obj';const dl=document.getElementById('dlg');dl.after(ob);
 const upd=()=>{if(ST.tasks.gs_started&&!ST.tasks.gs_done){const s=ST.tasks.gs_bossSpawned?'Defeat the Goblin champion':`Defeat goblins · ${Math.min(3,ST.tasks.gs_kills||0)}/3`;ob.style.display='';ob.textContent='Quest: '+s;return}const t=TASKS.find(t=>!ST.tasks[t[0]]);ob.style.display=t?'':'none';if(t)ob.textContent='Objective: '+t[1]};upd();setInterval(upd,1000)})();
// ---- v5: touch-friendly entity picking: prefer the monster/NPC whose body is within a finger radius of the tap ----
{const _pick=pick;const _v=new THREE.Vector3();
 pick=function(cx,cy){const touch=UI.lastPtr==='touch'||matchMedia('(pointer:coarse)').matches;const R=touch?46:26;let best=null,bd=R*R;
  const test=(e,k)=>{if(!e.r||!e.r.g.visible)return;const p=e.vpos?e.vpos(performance.now()):[e.x+.5,e.z+.5];const y=hAt(p[0],p[1]);const top=(e.r.top||1.6);
   for(const f of[.25,.55,.85]){_v.set(p[0],y+top*f,p[1]).project(cam);if(_v.z>1)continue;const sx=(_v.x+1)/2*innerWidth,sy=(1-_v.y)/2*innerHeight;const d=(sx-cx)**2+(sy-cy)**2;if(d<bd){bd=d;best={k,o:e}}}};
  for(const m of MON)if(!m.dead)test(m,'mon');
  if(!best)for(const n of NPCS)test(n,'npc');
  const r=_pick(cx,cy);if(best&&(!r||r.k==='tile'||r.k==='mon'||r.k==='npc'||bd<16*16))return best;return r}}
addEventListener('pointerdown',e=>{UI.lastPtr=e.pointerType},true);
// ---- v5: drawn fallback icons, used only for items with no cache icon ----
{const _all=/ic=draw/.test(location.search);const cv=document.createElement('canvas');cv.width=cv.height=64;const X=cv.getContext('2d');
 const BR='#c07a38',LE='#8a5a30',WO='#9a6a36',ST='#9aa0a8';
 const col=id=>{const n=(IT[id]&&IT[id].n)||'',tier=(/^(Bronze|Iron|Steel|Mithril|Rune)\b/i.exec(n)||[])[1]?.toLowerCase(),palette=adventurerPalette&&adventurerPalette[tier];
  if(palette)return '#'+palette.main.toString(16).padStart(6,'0');
  return /Mithril/.test(n)?'#3297a6':/Rune/.test(n)?'#7046a5':/Iron/.test(n)?'#626b73':/Bronze/.test(n)?BR:/Leather/.test(n)?LE:/Wooden/.test(n)?WO:ST};
 const S=(f)=>{X.lineJoin='round';X.lineCap='round';X.lineWidth=3;X.strokeStyle='#000';f();};
 const poly=(pts,fill)=>{X.beginPath();pts.forEach(([x,y],i)=>i?X.lineTo(x,y):X.moveTo(x,y));X.closePath();X.fillStyle=fill;X.fill();X.stroke()};
 const ell=(x,y,rx,ry,fill)=>{X.beginPath();X.ellipse(x,y,rx,ry,0,0,Math.PI*2);X.fillStyle=fill;X.fill();X.stroke()};
 const shade=(c,k)=>{const n=parseInt(c.slice(1),16);const f=v=>Math.max(0,Math.min(255,Math.round(v*k)));return'#'+[n>>16,(n>>8)&255,n&255].map(f).map(v=>v.toString(16).padStart(2,'0')).join('')};
 const D={
  rune:(c,g)=>{poly([[14,10],[50,8],[56,32],[48,56],[16,56],[8,32]],'#b9ae98');ell(32,32,13,13,c);X.fillStyle='#fff';X.font='bold 16px Verdana';X.textAlign='center';X.textBaseline='middle';X.fillText(g,32,33)},
  coins:()=>{for(const[y,x]of[[46,26],[40,38],[34,28],[28,34]])ell(x,y,14,6,'#f2c230');X.fillStyle='#fff6';X.fillRect(24,26,8,2)},
  sword:(c,l=1)=>{X.save();X.translate(32,32);X.rotate(-Math.PI/4);poly([[-4,-26*l],[0,-30*l],[4,-26*l],[4,8],[-4,8]],shade(c,1.15));poly([[-12,8],[12,8],[12,13],[-12,13]],'#6b4a2a');poly([[-3,13],[3,13],[3,26],[-3,26]],'#4a3020');X.restore()},
  scim:c=>{X.save();X.translate(30,34);X.rotate(-Math.PI/4);X.beginPath();X.moveTo(-4,8);X.quadraticCurveTo(-8,-14,8,-28);X.quadraticCurveTo(4,-8,4,8);X.closePath();X.fillStyle=shade(c,1.15);X.fill();X.stroke();poly([[-11,8],[11,8],[11,13],[-11,13]],'#6b4a2a');poly([[-3,13],[3,13],[3,25],[-3,25]],'#4a3020');X.restore()},
  hammer:c=>{X.save();X.translate(32,32);X.rotate(-Math.PI/4);poly([[-3,-14],[3,-14],[3,28],[-3,28]],'#6b4a2a');poly([[-15,-26],[15,-26],[15,-12],[-15,-12]],c);X.restore()},
  staff:c=>{X.save();X.translate(32,32);X.rotate(-Math.PI/4);poly([[-3,-20],[3,-20],[3,28],[-3,28]],'#7a5228');ell(0,-24,7,7,c);X.restore()},
  round:c=>{ell(32,32,22,22,c);ell(32,32,14,14,shade(c,1.2));ell(32,32,4,4,'#888')},
  sq:c=>{poly([[12,10],[52,10],[52,36],[32,56],[12,36]],c);poly([[20,18],[44,18],[44,34],[32,46],[20,34]],shade(c,1.2))},
  helm:(c,full)=>{X.beginPath();X.moveTo(12,44);X.quadraticCurveTo(12,12,32,12);X.quadraticCurveTo(52,12,52,44);X.closePath();X.fillStyle=c;X.fill();X.stroke();if(full){poly([[16,30],[48,30],[48,52],[16,52]],shade(c,.9));X.fillStyle='#000';X.fillRect(20,36,24,4)}else poly([[29,28],[35,28],[35,46],[29,46]],shade(c,.85))},
  body:(c,chain)=>{poly([[20,10],[44,10],[56,20],[50,30],[46,26],[46,56],[18,56],[18,26],[14,30],[8,20]],c);if(chain){X.fillStyle=shade(c,.7);for(let y=20;y<54;y+=6)for(let x=22;x<44;x+=6)X.fillRect(x,y,2,2)}else{X.strokeStyle=shade(c,.6);X.lineWidth=2;X.beginPath();X.moveTo(32,14);X.lineTo(32,54);X.stroke()}},
  legs:(c,skirt)=>{if(skirt)poly([[20,10],[44,10],[54,56],[10,56]],c);else poly([[16,10],[48,10],[50,56],[36,56],[32,26],[28,56],[14,56]],c)},
  gloves:c=>{poly([[18,56],[18,26],[22,14],[28,14],[28,24],[32,10],[38,10],[38,24],[44,16],[48,22],[46,40],[46,56]],c)},
  boots:c=>{poly([[16,8],[34,8],[34,40],[54,44],[54,56],[16,56]],c)},
  rock:(c,d)=>{poly([[10,40],[18,18],[38,12],[54,26],[52,48],[26,54]],c);X.fillStyle=d;for(const[x,y]of[[24,28],[38,24],[32,40],[44,38]]){X.beginPath();X.arc(x,y,4,0,7);X.fill()}},
  hide:()=>{poly([[14,14],[26,18],[38,14],[52,20],[48,34],[54,48],[38,52],[26,48],[12,52],[16,34]],'#c8a070');X.fillStyle='#5a3a1a';X.beginPath();X.arc(28,30,5,0,7);X.arc(40,40,4,0,7);X.fill()},
  net:()=>{X.strokeStyle='#000';X.lineWidth=5;X.beginPath();X.arc(32,30,20,0,7);X.stroke();X.strokeStyle='#d8d0b0';X.lineWidth=2;for(let i=14;i<52;i+=7){X.beginPath();X.moveTo(i,12);X.lineTo(i,48);X.moveTo(12,i-2);X.lineTo(52,i-2);X.stroke()}X.strokeStyle='#8a5a28';X.lineWidth=4;X.beginPath();X.arc(32,30,20,0,7);X.moveTo(32,50);X.lineTo(32,60);X.stroke()},
  tinder:()=>{poly([[12,30],[52,30],[52,52],[12,52]],'#8a6a40');poly([[12,30],[52,30],[46,22],[18,22]],'#a8844c');X.fillStyle='#ff8a20';X.beginPath();X.moveTo(32,6);X.quadraticCurveTo(42,16,32,22);X.quadraticCurveTo(22,16,32,6);X.fill()},
  emoji:(e,f)=>{X.font='44px "Apple Color Emoji","Noto Color Emoji",sans-serif';X.textAlign='center';X.textBaseline='middle';if(f)X.filter=f;X.fillText(e,32,35);X.filter='none'}};
 const RUNE={air:['#e8f0ff','A'],water:['#2a6ae0','W'],earth:['#7a5228','E'],fire:['#e03a1a','F'],mind:['#e88a20','M'],body:['#3a5ae0','B']};
 const EM={logs:'🪵',shrimps:'🦐',rawshrimps:['🦐','saturate(.6) brightness(1.25)'],bones:'🦴',feather:'🪶',axe:'🪓',pick:'⛏️',beef:'🥩',rawbeef:['🥩','saturate(1.4) hue-rotate(-10deg)'],chicken:'🍗',rawchicken:['🍗','saturate(.5) brightness(1.3)'],burnt:['🥩','brightness(.25)'],bread:'🍞'};
 const draw=id=>{X.clearRect(0,0,64,64);const n=(IT[id].n||'');const c=col(id);
  S(()=>{if(RUNE[id])D.rune(...RUNE[id]);else if(id==='coins')D.coins();else if(id==='copper')D.rock('#8a6a50','#e07a30');else if(id==='tin')D.rock('#8a8a84','#d0d0d0');else if(id==='cowhide')D.hide();else if(id==='net')D.net();else if(id==='tinder')D.tinder();
   else if(EM[id]){const e=EM[id];Array.isArray(e)?D.emoji(e[0],e[1]):D.emoji(e)}
   else if(/scimitar/i.test(n))D.scim(c);else if(/dagger/i.test(n))D.sword(c,.6);else if(/sword/i.test(n))D.sword(c,/long/i.test(n)?1.1:.85);else if(/hammer/i.test(n))D.hammer(c);else if(/staff/i.test(n))D.staff(/air/i.test(n)?'#e8f0ff':'#7a5228');
   else if(IT[id].slot==='shield')id==='shield'?D.round(WO):D.sq(c);else if(IT[id].slot==='head')/cowl/i.test(n)?D.helm(LE):D.helm(c,!!IT[id].full);else if(IT[id].slot==='body')D.body(c,/chain/i.test(n));else if(IT[id].slot==='legs')D.legs(c,/skirt/i.test(n));
   else if(IT[id].slot==='hands')D.gloves(c);else if(IT[id].slot==='feet')D.boots(c);
   else{X.fillStyle='#d8c8a0';X.fillRect(14,14,36,36);X.strokeRect(14,14,36,36);X.fillStyle='#000';X.font='bold 22px Verdana';X.textAlign='center';X.textBaseline='middle';X.fillText(n[0]||'?',32,33)}});
  return cv.toDataURL()};
 for(const id of Object.keys(IT)){if(!_all&&IT[id].img)continue;try{const url=draw(id);IT[id].i=`<img class="ii" src="${url}" alt="">`;IT[id].img=url;IT[id].f=null;delete spriteCache[id]}catch(e){}}
 if(typeof renderPanel==='function')renderPanel()}
// ---- v7: per-account cloud save (/api/osrs/save): every 8 s when changed, on hide, and on logout ----
{const A=window.__ACCT;
 if(A){ST.acct=A.name;ST.name=A.name;$('myname').textContent=A.name;msg('Logged in as '+A.name+'. Your progress saves to your account.')}
 let last='';const snap=()=>{ST.pos=[me.x,me.z];save();return JSON.stringify(ST)};
 const push=(keep)=>{if(!A)return Promise.resolve();const s=snap();if(s===last)return Promise.resolve();const tk=ls('bwl.token');if(!tk)return Promise.resolve();
  return fetch('/api/osrs/save',{method:'PUT',keepalive:!!keep&&s.length<60000,headers:{'Content-Type':'application/json',Authorization:'Bearer '+tk},body:'{"data":'+s+'}'}).then(r=>{if(r.ok)last=s}).catch(()=>{})};
 window.__OMsave=push;
 if(A){setInterval(()=>push(false),8000);addEventListener('pagehide',()=>push(true));document.addEventListener('visibilitychange',()=>{if(document.hidden)push(true)})}
 // logout: save to the account, end the session, back to the login screen
 document.addEventListener('click',async e=>{if(!e.target||e.target.id!=='logout')return;e.stopImmediatePropagation();e.preventDefault();
  try{await push(false)}catch(_){}try{mpLeave()}catch(_){}
  if(A){try{await fetch('/api/logout',{method:'POST',headers:{Authorization:'Bearer '+ls('bwl.token')}})}catch(_){}try{localStorage.removeItem('bwl.token');localStorage.removeItem('bwl.user')}catch(_){}}
  location.search='?login=1'},true)}

// ---- v11: real cache spell icons in the Magic tab
{const SPN=['Home Teleport', 'Wind Strike', 'Confuse', 'Water Strike', 'Enchant', 'Earth Strike', 'Weaken', 'Fire Strike', 'Bones to Bananas', 'Wind Bolt', 'Curse', 'Bind'];const fix=()=>{const pb=document.getElementById('pbody');if(!pb)return;if(UI.tab==='combat'&&!pb.querySelector('#acbox')){const d=document.createElement('div');d.id='acbox';d.style.cssText='margin-top:8px';const SP7=window.__SPELLS||[];
  d.innerHTML='<div class="row y"><span>Autocast</span><span id="acname">'+((SP7.find(q=>q.id===ST.autocast)||{}).n||'Off')+'</span></div><div class="grid4">'+SP7.map(q=>'<div class="ic" data-ac="'+q.id+'" style="cursor:pointer'+(ST.autocast===q.id?';outline:2px solid #fff':'')+'"><img class="spimg" style="width:26px;height:26px;image-rendering:pixelated;display:block;margin:auto" src="'+U('sprites/sp_'+q.n.toLowerCase().replace(/ /g,'_')+'.png')+'">'+q.n+'</div>').join('')+'</div>';
  pb.appendChild(d);d.querySelectorAll('[data-ac]').forEach(el=>el.onclick=ev=>{ev.stopPropagation();const id=el.dataset.ac,q=SP7.find(q=>q.id===id);if(ST.autocast===id){ST.autocast=null;msg('Autocast off.')}else if(lv('Magic')<q.l){msg(`You need a Magic level of ${q.l} to autocast ${q.n}.`);return}else{ST.autocast=id;msg(`You will now autocast ${q.n}.`)}d.remove();fix()})}
for(const e of pb.querySelectorAll('.ic')){const bg=e.querySelector('big');if(!bg)continue;const n=SPN.find(n=>e.textContent.includes(n));if(!n)continue;const SP7=window.__SPELLS||[],hR=sp=>sp.r.every(([id,q])=>(ST.eq.weapon&&IT[ST.eq.weapon].rune===id)||invCount(id)>=q),sel=id=>window.__OMsel(id);const spd=SP7.find(q=>q.n===n);
  if(spd){const ok=lv('Magic')>=spd.l&&hR(spd);if(e.classList.contains('off')===ok)e.classList.toggle('off',!ok);const on=UI.sel===spd;if(e.classList.contains('sel')!==on)e.classList.toggle('sel',on);
   e.onclick=ev=>{ev.stopPropagation();if(lv('Magic')<spd.l){msg(`You need a Magic level of ${spd.l} to cast this spell.`);return}if(!hR(spd)){msg('You do not have enough runes to cast this spell.');return}
    if(UI.sel===spd){sel(null);return}sel(spd.id);msg(`Choose a target for ${spd.n}.`)}}
  else if(n==='Home Teleport'){if(e.classList.contains('off'))e.classList.remove('off');e.onclick=ev=>{ev.stopPropagation();homeTele()}}
  else e.onclick=ev=>{ev.stopPropagation();msg(lv('Magic')<({'Confuse':3,'Enchant':7,'Weaken':11,'Bones to Bananas':15,'Wind Bolt':17,'Curse':19,'Bind':20}[n]||1)?'Your Magic level is not high enough for this spell.':'You do not have the runes to cast this spell.')};
  const k=n.toLowerCase().replace(/ /g,'_'),want=k+(e.classList.contains('off')?'_off':'');if(bg.dataset.sp===want)continue;bg.dataset.sp=want;bg.innerHTML='<img class="spimg" src="'+U('sprites/sp_'+want+'.png')+'">'}};
 const mo=new MutationObserver(fix);const go=()=>{const pb=document.getElementById('pbody');if(pb){mo.observe(pb,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});fix()}else setTimeout(go,500)};go()}
// ---- v12: on short phone screens start with the side panel closed so the world is visible
// The active panel stays open at launch, as in the landscape mobile reference.
// ---- v13: saves from before the play-area walls: put the player back at spawn if they load outside it
setTimeout(()=>{try{if(!walkable(me.x,me.z)){me.snap(...SPAWN);streamAt(me.x,me.z,true);msg('You find yourself back in Lumbridge.')}}catch(e){}},400);
// ---- v15: iOS device fixes: robust tap (pointercancel/click fallback), build badge, stale-build self-reload, bigger touch pick ----
// Versioned pages load loginNN.js, so match any login*.js entry point.
const BUILD=+((document.querySelector('script[src*="login"]')||{}).src||'').replace(/.*[?&]v=(\d+).*/,'$1')||0;
// Inventory and bank share the cancellation-safe longable() handler above.
if(UI.tab)try{renderPanel()}catch(e){}
{const bd=document.createElement('div');bd.id='bwbuild';bd.textContent='v'+BUILD;bd.style.cssText='position:fixed;left:calc(4px + env(safe-area-inset-left));bottom:calc(2px + env(safe-area-inset-bottom));z-index:99;font:11px/1 Verdana,sans-serif;color:#ff0;background:#000a;padding:2px 4px;border-radius:3px;pointer-events:none';document.body.appendChild(bd)}
{const chk=()=>fetch('index.html?ts='+Date.now(),{cache:'no-store'}).then(r=>r.text()).then(h=>{const m=h.match(/login[^"']*\?v=(\d+)/);if(m&&+m[1]>BUILD&&location.protocol.startsWith('http')){const u=new URL(location.href);u.searchParams.set('b',m[1]);location.replace(u.toString())}}).catch(()=>{});setTimeout(chk,4000);setInterval(chk,120000)}
// touch: tapping near a monster attacks it (wider radius); never fall through to a walk when a live monster is under the finger
{const _p=pick;const _v=new THREE.Vector3();pick=function(cx,cy){const r=_p(cx,cy);if(r&&r.k==='mon')return r;if(!(UI.lastPtr==='touch'||matchMedia('(pointer:coarse)').matches))return r;let best=null,bd=56*56;
 for(const m of MON){if(m.dead||!m.r.g.visible)continue;const p=m.vpos(performance.now());const y=hAt(p[0],p[1]);for(const f of[.2,.5,.8,1.1]){_v.set(p[0],y+(m.r.top||1.4)*f,p[1]).project(cam);if(_v.z>1)continue;const sx=(_v.x+1)/2*innerWidth,sy=(1-_v.y)/2*innerHeight,d=(sx-cx)**2+(sy-cy)**2;if(d<bd){bd=d;best={k:'mon',o:m}}}}
 return best&&(!r||r.k==='tile')?best:r}}
window.__OM.BUILD=BUILD;window.__OM.pb9=1;
// ---- v16: Tarnish-style item-on-item: tinderbox+logs lights a ground fire (player steps west), knife+logs fletches, cook on fires ----
STOCK.push(['knife',6],['hammer',1]);
const FIRES=[];window.__FIRES=FIRES;
function lightFire(li){const x=me.x,z=me.z;const ob=objAt.get(I(x,z));if(ob&&ob.kind!=='deco'){msg("You can't light a fire here.");return}
 ST.inv[li]=null;invChanged();swing(me);msg('You attempt to light the logs.');
 setTimeout(()=>{const g=new THREE.Group();const lm=new THREE.MeshLambertMaterial({color:0x5a3a1a});for(let k=0;k<3;k++){const c=new THREE.Mesh(new THREE.CylinderGeometry(.05,.05,.55,6),lm);c.rotation.z=Math.PI/2;c.rotation.y=k*1.05;c.position.y=.05;g.add(c)}
  const fl=new THREE.Mesh(new THREE.ConeGeometry(.2,.55,7),new THREE.MeshBasicMaterial({color:0xff8a1a,transparent:true,opacity:.9}));fl.position.y=.33;g.add(fl);const f2=new THREE.Mesh(new THREE.ConeGeometry(.11,.35,6),new THREE.MeshBasicMaterial({color:0xffe060}));f2.position.y=.26;g.add(f2);
  g.position.set(x+.5,hAt(x+.5,z+.5),z+.5);S.add(g);
  const o={kind:'loc',name:'Fire',acts:['Cook'],x,z,w:1,l:1,alive:1,fire:1,g,fl,end:TICKN+100+rnd(60)};OBJ.push(o);objAt.set(I(x,z),o);FIRES.push(o);task('fire');
  gainXP('Firemaking',40);msg('The fire catches and the logs begin to burn.');
  for(const[dx,dz]of[[-1,0],[1,0],[0,-1],[0,1]])if(stepOK(x,z,dx,dz)){me.path=[];me.act=null;me.moveTo([[x+dx,z+dz]]);break}
  setTimeout(()=>me.faceTo(x,z),650)},1200)}
setInterval(()=>{const n=performance.now();for(let i=FIRES.length-1;i>=0;i--){const f=FIRES[i];const s=1+Math.sin(n/90+i)*.12;f.fl.scale.set(s,1+Math.sin(n/70+i*2)*.18,s);
 if(TICKN>=f.end){S.remove(f.g);if(objAt.get(I(f.x,f.z))===f)objAt.delete(I(f.x,f.z));OBJ.splice(OBJ.indexOf(f),1);FIRES.splice(i,1);dropItem('ashes',1,f.x,f.z)}}},60);
{const _uo=useOn;useOn=function(a,b){const A=ST.inv[a],B=ST.inv[b];if(!A||!B||a===b){UI.use=null;return}const p=[A.id,B.id].sort().join('+');
 if(p==='logs+tinder'){UI.use=null;lightFire(A.id==='logs'?a:b);return}
 if(p==='knife+logs'){UI.use=null;const li=A.id==='logs'?a:b;ST.inv[li]=null;swing(me);addItem('shafts',15);gainXP('Fletching',5);msg('You carefully cut the wood into 15 arrow shafts.');invChanged();return}
 return _uo(a,b)}}
if(!ST.inv.some(s=>s&&s.id==='knife')){const k=ST.inv.findIndex(s=>!s);if(k>=0&&!ST._knife){ST.inv[k]={id:'knife',q:1};ST._knife=1}}
// ---- v17: chat tabs + touch-friendly full map ----
{const hud=document.getElementById('hud');const ct=document.createElement('div');ct.id='ctabs';
 ct.innerHTML=[['All',''],['Game','On'],['Public','On'],['Private','Friends'],['Channel','On'],['Clan','On'],['Trade','On']].map(([a,b],k)=>`<b class="${k===0?'sel':''}">${a}${b?`<i>${b}</i>`:''}</b>`).join('');hud.appendChild(ct);
 ct.querySelectorAll('b').forEach(b=>b.onclick=e=>{e.stopPropagation();ct.querySelectorAll('b').forEach(x=>x.classList.remove('sel'));b.classList.add('sel')});
 const orb=document.createElement('button');orb.id='wmorb';orb.title='World Map';orb.setAttribute('aria-label','Open world map');orb.innerHTML='🗺 <span class="map-word">Map</span>';hud.appendChild(orb);
 const W=document.createElement('div');W.id='wmap';W.className='hidden';W.innerHTML='<div class="t">World map</div><button type="button" class="map-quest" aria-label="Open Quest List"></button><div class="map-legend"><span><i class="player-key"></i>You</span><span><i class="npc-key"></i>People</span><span><i class="quest-key"></i>Quest NPC</span><span><i class="monster-key"></i>Hostile</span><span><i class="elite-key"></i>Elite</span><span><i class="target-key"></i>Quest target</span><span><i class="loot-key"></i>Loot</span><span><i class="service-key"></i>Services</span><span><i class="resource-key"></i>Resources</span></div><div class="map-filters"><button type="button" data-filter="enemies" aria-pressed="true">⚔ Hostiles</button><button type="button" data-filter="loot" aria-pressed="true">✦ Loot</button><button type="button" data-filter="services" aria-pressed="true">◆ Services</button><button type="button" data-filter="resources" aria-pressed="false">♧ Resources</button></div><canvas aria-label="Varrock to Lumbridge cache map. Drag to pan and zoom. Walking routes are available inside the playable Lumbridge area"></canvas><div class="map-route hidden" role="status"><span class="map-route-text">Route preview</span><button type="button" data-route="walk">Walk</button><button type="button" data-route="clear" aria-label="Clear route">Clear</button></div><div class="map-controls"><button type="button" data-map="zoom-out" aria-label="Zoom out">−</button><button type="button" data-map="zoom-in" aria-label="Zoom in">+</button><button type="button" data-map="varrock">Varrock</button><button type="button" data-map="recenter">You</button><button type="button" data-map="close">Close</button></div>';document.body.appendChild(W);
 const cv=W.querySelector('canvas');const box=typeof BOX!=='undefined'?BOX:[0,0,SZ-1,SZ-1],filters={enemies:true,loot:true,services:true,resources:false};let plannedRoute=null;
 const x0=-64,z0=-192,x1=256,z1=192;
 const fullMapImage=new Image();fullMapImage.onload=()=>{if(!W.classList.contains('hidden'))draw()};fullMapImage.src=U('w/map73.png');
 cv.width=(x1-x0)*MMS;cv.height=(z1-z0)*MMS;const X=cv.getContext('2d');let timer=0,mapZoom=1,panX=0,panY=0,drag=null;
 const clampPan=()=>{if(mapZoom<=1){mapZoom=1;panX=panY=0;return}panX=Math.max(cv.width*(1-mapZoom),Math.min(0,panX));panY=Math.max(cv.height*(1-mapZoom),Math.min(0,panY))};
 const zoomAt=(factor,x=cv.width/2,y=cv.height/2)=>{const z=Math.max(1,Math.min(3.5,mapZoom*factor));if(z===mapZoom)return;panX=x-(x-panX)*z/mapZoom;panY=y-(y-panY)*z/mapZoom;mapZoom=z;clampPan();draw()};
 const recenter=()=>{const p=me.vpos(performance.now());panX=cv.width/2-(p[0]-x0)*MMS*mapZoom;panY=cv.height/2-(p[1]-z0)*MMS*mapZoom;clampPan();draw()};
 const dot=(x,z,color,r=2.5)=>{X.fillStyle=color;X.beginPath();X.arc((x-x0)*MMS,(z-z0)*MMS,r,0,Math.PI*2);X.fill()};const star=(x,z,color,r=4)=>{const a=(x-x0)*MMS,b=(z-z0)*MMS;X.beginPath();for(let k=0;k<10;k++){const q=-Math.PI/2+k*Math.PI/5,v=k%2?r*.52:r;X.lineTo(a+Math.cos(q)*v,b+Math.sin(q)*v)}X.closePath();X.fillStyle=color;X.fill()};
 const mapServices=[];for(const o of OBJ){const type=o.kind==='booth'?'BANK':o.kind==='altar'?'ALT':o.name==='Furnace'?'FURN':/anvil/i.test(o.name||'')?'ANVIL':/range/i.test(o.name||'')?'RANGE':o.kind==='fish'?'FISH':null;if(!type||mapServices.some(q=>q.type===type&&Math.hypot(q.x-o.x,q.z-o.z)<(type==='FISH'?7:4)))continue;mapServices.push({x:o.x,z:o.z,type,name:type==='BANK'?'Bank':type==='ALT'?'Altar':type==='FURN'?'Furnace':type==='ANVIL'?'Anvil':type==='RANGE'?'Range':'Fishing'})}
 const draw=()=>{const q=ST.tasks.gs_started&&!ST.tasks.gs_done,progress=Math.min(3,ST.tasks.gs_kills||0),nextTask=TASKS.find(t=>!ST.tasks[t[0]]),questText=q?(ST.tasks.gs_bossSpawned?'Goblin Slayer · Find the Goblin champion':progress>=3?'Goblin Slayer · Clear room for the champion':`Goblin Slayer · Defeat goblins (${progress}/3)`):nextTask?`Guide task · ${nextTask[1]}`:ST.tasks.reward?'Guide tasks complete':'';const questLine=W.querySelector('.map-quest');if(questLine.textContent!==questText)questLine.textContent=questText;X.setTransform(1,0,0,1,0,0);X.clearRect(0,0,cv.width,cv.height);X.save();X.translate(panX,panY);X.scale(mapZoom,mapZoom);if(fullMapImage.complete&&fullMapImage.naturalWidth)X.drawImage(fullMapImage,0,0,cv.width,cv.height);X.drawImage(mapC,64*MMS,192*MMS);const n=performance.now();
  for(const marker of trailMarkers)dot(marker.x,marker.z,'#76deeb',3.5);
  if(plannedRoute){const a=[me.x+.5,me.z+.5],b=[plannedRoute.x+.5,plannedRoute.z+.5];X.beginPath();X.moveTo((a[0]-x0)*MMS,(a[1]-z0)*MMS);for(const[sx,sz]of plannedRoute.path)X.lineTo((sx+.5-x0)*MMS,(sz+.5-z0)*MMS);X.strokeStyle='#17130d';X.lineWidth=5;X.lineJoin='round';X.stroke();X.strokeStyle='#ffd34e';X.lineWidth=2.5;X.setLineDash([5,3]);X.stroke();X.setLineDash([]);const ex=(b[0]-x0)*MMS,ez=(b[1]-z0)*MMS;X.fillStyle='#ffd34e';X.strokeStyle='#21190f';X.lineWidth=2;X.beginPath();X.arc(ex,ez,5,0,Math.PI*2);X.fill();X.stroke()}
  if(filters.services)for(const q of mapServices){if(q.type==='FISH'&&mapZoom<1.35)continue;const x=(q.x+.5-x0)*MMS,z=(q.z+.5-z0)*MMS,color=q.type==='BANK'?'#ffd34e':q.type==='ALT'?'#78d8ff':q.type==='FURN'?'#ff8d3d':q.type==='ANVIL'?'#c6cbd1':q.type==='RANGE'?'#f5a94a':'#5fd7df';X.fillStyle='#1b1711';X.fillRect(x-4,z-4,8,8);X.fillStyle=color;X.fillRect(x-3,z-3,6,6);if(mapZoom>1.45){X.font='bold 9px Verdana';X.textAlign='left';X.lineWidth=3;X.strokeStyle='#21190f';X.strokeText(q.name,x+5,z-4);X.fillStyle='#fff0c8';X.fillText(q.name,x+5,z-4)}}
  if(filters.resources){for(const o of TREES)if(o.alive)dot(o.x+.5,o.z+.5,'#3ed05c',1.7);for(const o of ROCKS)if(o.alive)dot(o.x+.5,o.z+.5,o.ore==='tin'?'#9ea8b3':'#da8a56',2);for(const o of FISH)dot(o.x+.5,o.z+.5,'#38d5db',2)}
  if(filters.loot)for(const g of GI)dot(g.x+.5,g.z+.5,'#ff5b30',2.7);
  if(filters.enemies)for(const m of MON)if(!m.dead){const p=m.vpos(n),elite=m.questBoss||(m.d.lvl||0)>=40,questTarget=ST.tasks.gs_started&&!ST.tasks.gs_done&&(m.type==='goblin'||m.questBoss);if(questTarget)star(p[0],p[1],'#ffcf36',4.5);else if(elite)star(p[0],p[1],'#be70ff',4);else dot(p[0],p[1],'#e84135',3.2);if(UI.target===m){X.strokeStyle='#fff';X.lineWidth=1.5;X.beginPath();X.arc((p[0]-x0)*MMS,(p[1]-z0)*MMS,6,0,Math.PI*2);X.stroke()}if((UI.target===m&&mapZoom>=1.2)||(questTarget&&mapZoom>=1.2)||(mapZoom>=1.7&&(m.questBoss||(m.d.lvl||0)>=60))){const a=(p[0]-x0)*MMS+6,b=(p[1]-z0)*MMS-4;X.font='bold 10px Verdana';X.textAlign='left';X.lineWidth=3;X.strokeStyle='#21190f';X.strokeText(m.d.n,a,b);X.fillStyle='#fff0c8';X.fillText(m.d.n,a,b)}}
  for(const q of NPCS){const x=(q.x+.5-x0)*MMS,z=(q.z+.5-z0)*MMS,quest=/guide|horacio|aereck|cook/i.test(q.name||'');X.fillStyle=quest?'#65e28d':'#ffd34e';X.beginPath();X.moveTo(x,z-3.5);X.lineTo(x+3.5,z);X.lineTo(x,z+3.5);X.lineTo(x-3.5,z);X.closePath();X.fill();if(mapZoom>=1.35&&quest){const a=x+5,b=z-4;X.font='bold 10px Verdana';X.textAlign='left';X.lineWidth=3;X.strokeStyle='#21190f';X.strokeText(q.name,a,b);X.fillStyle='#e9ffe7';X.fillText(q.name,a,b)}}
  const p=me.vpos(n),px=(p[0]-x0)*MMS,pz=(p[1]-z0)*MMS;X.fillStyle='#fff';X.strokeStyle='#182a60';X.lineWidth=2;X.beginPath();X.arc(px,pz,5,0,Math.PI*2);X.fill();X.stroke();for(const [label,lx,lz] of [['Varrock',74,-97],['Lumbridge',86,109]]){const a=(lx-x0)*MMS,b=(lz-z0)*MMS;X.font='bold 12px Verdana';X.textAlign='center';X.lineWidth=3;X.strokeStyle='#1e160d';X.strokeText(label,a,b-10);X.fillStyle='#ffe1a1';X.fillText(label,a,b-10)}X.restore()};
 const routePanel=W.querySelector('.map-route'),routeText=routePanel.querySelector('.map-route-text'),setRoute=(x,z,label='Destination')=>{if(!walkable(x,z)){let bx=-1,bz=-1,bd=99;for(let dx=-4;dx<=4;dx++)for(let dz=-4;dz<=4;dz++){const a=x+dx,b=z+dz,d=Math.abs(dx)+Math.abs(dz);if(d<bd&&inb(a,b)&&walkable(a,b)){bd=d;bx=a;bz=b}}x=bx;z=bz}if(x<0||z<0){msg("You can't reach that destination.");return}const sx=Math.floor(me.x),sz=Math.floor(me.z),path=findPath(sx,sz,(a,b)=>a===x&&b===z,x,z,40000);if(!path){plannedRoute=null;routePanel.classList.add('hidden');msg("You can't reach that destination.");draw();return}plannedRoute={x,z,path};routeText.textContent=`${label} · ${path.length} tiles`;routePanel.classList.remove('hidden');draw()},clearRoute=()=>{plannedRoute=null;routePanel.classList.add('hidden');draw()};
 routePanel.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('[data-route]');if(!b||!plannedRoute)return;if(b.dataset.route==='clear'){clearRoute();return}const target=plannedRoute;plannedRoute=null;routePanel.classList.add('hidden');close();act({t:'walk',x:target.x,z:target.z});msg('You start walking the planned route.')});
 const open=()=>{W.classList.remove('hidden');draw();clearInterval(timer);timer=setInterval(draw,300)},close=()=>{W.classList.add('hidden');clearInterval(timer);drag=null};W.querySelector('.map-quest').addEventListener('click',e=>{e.stopPropagation();close();openTab('quests')});
 orb.onclick=e=>{e.stopPropagation();open()};W.querySelector('[data-map="close"]').onclick=e=>{e.stopPropagation();close()};
 W.querySelector('.map-filters').addEventListener('click',e=>{const b=e.target.closest('[data-filter]');if(!b)return;e.stopPropagation();const k=b.dataset.filter;filters[k]=!filters[k];b.classList.toggle('off',!filters[k]);b.setAttribute('aria-pressed',String(filters[k]));draw()});
 W.querySelector('[data-map="zoom-in"]').onclick=e=>{e.stopPropagation();zoomAt(1.35)};W.querySelector('[data-map="zoom-out"]').onclick=e=>{e.stopPropagation();zoomAt(1/1.35)};W.querySelector('[data-map="recenter"]').onclick=e=>{e.stopPropagation();recenter()};W.querySelector('[data-map="varrock"]').onclick=e=>{e.stopPropagation();mapZoom=2;panX=cv.width/2-(74-x0)*MMS*mapZoom;panY=cv.height/2-(-97-z0)*MMS*mapZoom;clampPan();draw()};
 cv.addEventListener('wheel',e=>{e.preventDefault();const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;zoomAt(e.deltaY<0?1.15:1/1.15,x,y)},{passive:false});
 cv.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();cv.setPointerCapture(e.pointerId);drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,x:e.clientX,y:e.clientY,moved:false}});
 cv.addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const r=cv.getBoundingClientRect(),dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(e.clientX-(drag.sx??e.clientX),e.clientY-(drag.sy??e.clientY))>5)drag.moved=true;if(drag.moved){panX+=dx*cv.width/r.width;panY+=dy*cv.height/r.height;clampPan();draw()}drag.x=e.clientX;drag.y=e.clientY});
 const walkFromMap=(e)=>{const r=cv.getBoundingClientRect(),px=(e.clientX-r.left)*cv.width/r.width,py=(e.clientY-r.top)*cv.height/r.height;let x=Math.floor(x0+(px-panX)/(mapZoom*MMS)),z=Math.floor(z0+(py-panY)/(mapZoom*MMS));if(!inb(x,z)){msg('This area is on the map, but travel beyond Lumbridge is not available yet.');return}if(filters.enemies){const now=performance.now(),hit=MON.filter(m=>!m.dead).map(m=>{const p=m.vpos(now),mx=(p[0]-x0)*MMS*mapZoom+panX,mz=(p[1]-z0)*MMS*mapZoom+panY,screenD=Math.hypot((mx-px)*r.width/cv.width,(mz-py)*r.height/cv.height);return{m,d:screenD}}).filter(q=>q.d<24).sort((a,b)=>a.d-b.d)[0];if(hit){UI.target=hit.m;act({t:'attack',o:hit.m},1);msg('Target: '+esc(hit.m.d.n));close();return}}const nearEntity=(items,get,label)=>{const now=performance.now();return items.map(o=>{const p=get(o,now),sx=(p[0]-x0)*MMS*mapZoom+panX,sz=(p[1]-z0)*MMS*mapZoom+panY;return{o,d:Math.hypot((sx-px)*r.width/cv.width,(sz-py)*r.height/cv.height)}}).filter(v=>v.d<20).sort((a,b)=>a.d-b.d)[0]};const person=nearEntity(NPCS,o=>[o.x+.5,o.z+.5]);if(person){setRoute(person.o.x,person.o.z,'To '+person.o.name);return}if(filters.services){const service=nearEntity(mapServices,o=>[o.x+.5,o.z+.5]);if(service){setRoute(service.o.x,service.o.z,'To '+service.o.name);return}}if(filters.resources){const all=[...TREES.filter(o=>o.alive),...ROCKS.filter(o=>o.alive),...FISH],resource=nearEntity(all,o=>[o.x+.5,o.z+.5]);if(resource){setRoute(resource.o.x,resource.o.z,'To '+(resource.o.name||'resource'));return}}let bx=-1,bz=-1,bd=99;for(let dx=-4;dx<=4;dx++)for(let dz=-4;dz<=4;dz++){const a=x+dx,c=z+dz,d=Math.abs(dx)+Math.abs(dz);if(d<bd&&inb(a,c)&&walkable(a,c)){bd=d;bx=a;bz=c}}if(bx>=0)setRoute(bx,bz);else msg("You can't walk there.")};
 cv.addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;e.stopPropagation();if(!drag.moved)walkFromMap(e);drag=null});cv.addEventListener('pointercancel',()=>{drag=null});
 W.addEventListener('click',e=>{if(e.target===W)close()});addEventListener('keydown',e=>{if(e.key==='Escape'&&!W.classList.contains('hidden'))close()});window.__WMAP={open,close,recenter,zoomIn:()=>zoomAt(1.35),zoomOut:()=>zoomAt(1/1.35),clearRoute}}
// ---- v18: skilling faces target + swing anim each attempt; no 'You swing' when level too low ----
{const _CH={'Oak tree':15,'Willow tree':30,'Maple tree':45,'Yew tree':60};const _sm=startMsg;startMsg=function(a){if(a.t==='chop'&&a.o&&lv('Woodcutting')<(_CH[a.o.name]||1))return;return _sm(a)};
 const _da2=doArrive;doArrive=function(a){if(a&&a.o&&(a.t==='chop'||a.t==='mine'||a.t==='fish')){me.faceTo(a.o.x,a.o.z);if(a.t!=='fish'&&(me._skT=(me._skT||0)+1)%4===1)swing(me)}return _da2(a)}}
// ---- v20: every axe & pickaxe is Wield-able as a weapon (Tarnish bonuses) ----
for(const [k,d] of Object.entries(IT)){if(!d||!d.n||d.slot)continue;if(/(^|\s)(axe|pickaxe)$/i.test(d.n)){const tier=/Steel/.test(d.n)?2:/Iron/.test(d.n)?1:0,pk=/pickaxe/i.test(d.n);d.slot='weapon';d.spd=5;d.b={att:[4,5,8][tier],str:[5,7,9][tier],def:0};d.atkStyle=pk?'stab':'slash';d.ex=d.ex||'';}}

window.__OMd&&Object.assign(window.__OMd,{useOn,openMode});

{if(ST&&!ST.kit37){ST.kit37=1;for(const[id,q]of KIT37){if(id==='bread'||id==='beef'||id==='shrimps'||id==='axe'||id==='net'||id==='pick'||id==='tinder')if(invCount(id))continue;addItem(id,q)}try{invChanged()}catch(_){}msg('<span style="color:#7a0000">Starter kit added: mithril armour, rune scimitar, runes, food, tools and 10,000 coins.</span>')}}
;/*v38 coins top-up*/try{const _t=setInterval(()=>{try{if(typeof ST==='undefined'||!ST||!ST.inv||!ST.kit37)return;clearInterval(_t);if(!ST.kit38){ST.kit38=1;const c=invCount('coins');if(c<10000){addItem('coins',10000-c);msg('Starter coins topped up to 10,000.')}}}catch(e){}},1500)}catch(e){}

// Every existing panel remains reachable when the legacy phone toolbar is collapsed.
initMobileControls({
 tabs:[...LT,...RT],selectedPanel:()=>UI.tab,
 showPanel:id=>{if(UI.tab!==id||UI.mode)openTab(id)},
 runEnabled:()=>ST.run,xpEnabled:()=>ST.xpdrops,
 toggleRun:()=>{ST.run=!ST.run;updOrbs();save();if(UI.tab==='settings')renderPanel()},
 toggleXP:()=>{ST.xpdrops=!ST.xpdrops;$('xpdrops').style.display=ST.xpdrops?'':'none';save();if(UI.tab==='settings')renderPanel()},
 chatVisible:()=>!$('chat').classList.contains('hidden'),
 toggleChat:()=>$('chat').classList.toggle('hidden'),
 openMap:()=>window.__WMAP?.open(),
 openCamera:()=>{closePanel();cameraControls.open=true;cameraControls.querySelector('button')?.focus({preventScroll:true})},
 stopAction:()=>{me.act=null;me.path=[];me.goal=null;UI.use=null;showTool();msg('You stop walking or skilling.')},
 preferenceChanged:()=>{if(UI.tab==='settings')renderPanel()},
 cancelGesture:cancelWorldGesture,closeContextMenu:closeMenu
});
for(const[id,label]of [['orbhp','Eat food'],['orbpr','Open prayers'],['orbrun','Toggle run']]){
 const el=$(id);el.setAttribute('role','button');el.setAttribute('aria-label',label);el.tabIndex=0;
 el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();el.click()}});
}
$('dlg').setAttribute('role','button');$('dlg').tabIndex=0;
$('dlg').addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();$('dlg').click()}});

// v75: landscape mobile controls follow the player's reference layout.
// All fourteen game panels stay directly reachable in the two right columns.
{const strip=$('lstrip'),map=document.createElement('button'),menu=$('mobile-menu-toggle');
 map.className='tab';map.id='mobile-map-shortcut';map.type='button';map.textContent='🗺';
 map.title='World map';map.setAttribute('aria-label','Open world map');
 map.onclick=e=>{e.stopPropagation();window.__WMAP?.open()};
 strip.appendChild(map);
 if(menu){menu.textContent='☰';menu.title='All game controls'}
}
