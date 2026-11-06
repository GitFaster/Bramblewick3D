// Bramblewick 3D terrain v11: continuous height field + smoothed masks (no tile squares), procedural tiling materials, shader water.
// Everything (mesh, normals, object grounding, hAt) samples the SAME global functions, so chunk joins are seamless by construction.
import * as THREE from './assets/three.module.min.js?v=14';
(globalThis.__B3mods=globalThis.__B3mods||{}).terrain=1;
import {buildField,WL,DECK,hsh,vn} from './world.js?v=1';
export {buildField,WL,DECK};
// ---- tileable procedural textures (fbm value noise with integer period)
function pnoise(x,y,p,seed){const xi=Math.floor(x),yi=Math.floor(y);let fx=x-xi,fy=y-yi;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);const h=(a,b)=>hsh(((a%p)+p)%p+seed*101,((b%p)+p)%p+seed*57);
 const a=h(xi,yi),b=h(xi+1,yi),c=h(xi,yi+1),e=h(xi+1,yi+1);return a+(b-a)*fx+(c-a)*fy+(a-b-c+e)*fx*fy}
function fbm(u,v,base,oct,seed){let s=0,a=.5,n=0;for(let o=0;o<oct;o++){const p=base<<o;s+=a*pnoise(u*p,v*p,p,seed+o);n+=a;a*=.5}return s/n}
function tex(R,N,fn,srgb=true){const c=document.createElement('canvas');c.width=c.height=N;const x=c.getContext('2d'),im=x.createImageData(N,N),d=im.data;
 for(let j=0;j<N;j++)for(let i=0;i<N;i++){const [r,g,b]=fn(i/N,j/N,i,j);const k=(j*N+i)*4;d[k]=r;d[k+1]=g;d[k+2]=b;d[k+3]=255}x.putImageData(im,0,0);
 const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=Math.min(8,R.capabilities.getMaxAnisotropy());if(srgb)t.colorSpace=THREE.SRGBColorSpace;t.generateMipmaps=true;t.minFilter=THREE.LinearMipmapLinearFilter;t.magFilter=THREE.LinearFilter;return t}
const mixc=(a,b,t)=>[a[0]+(b[0]-a[0])*t,a[1]+(b[1]-a[1])*t,a[2]+(b[2]-a[2])*t];
export function makeTextures(R,N=256){
 const grass=tex(R,N,(u,v,i,j)=>{const n=fbm(u,v,4,4,1),f=fbm(u,v,32,2,2),bl=pnoise(u*64,v*16,64,3);let c=mixc([62,92,38],[112,146,60],n*.8+f*.35);const s=.82+.36*bl*bl;c=c.map(q=>q*s);if(hsh(i*3,j*7)<.012)c=mixc(c,[150,160,80],.6);return c});
 const dirt=tex(R,N,(u,v,i,j)=>{const n=fbm(u,v,4,4,11),f=fbm(u,v,32,3,12);let c=mixc([104,80,52],[150,122,84],n*.7+f*.4);const p=pnoise(u*24,v*24,24,13);if(p>.78)c=mixc(c,[160,150,132],(p-.78)*3.5);if(hsh(i*5,j*3)<.02)c=c.map(q=>q*.7);return c});
 const sand=tex(R,N,(u,v,i,j)=>{const n=fbm(u,v,4,3,21),f=hsh(i,j);let c=mixc([182,164,118],[214,198,148],n*.8+f*.2);const p=pnoise(u*20,v*20,20,22);if(p>.82)c=mixc(c,[140,134,122],(p-.82)*4);return c});
 const rock=tex(R,N,(u,v,i,j)=>{const n=fbm(u,v,4,5,31);const r=1-Math.abs(fbm(u,v,8,3,32)*2-1);let c=mixc([96,94,90],[156,152,144],n);c=c.map(q=>q*(.75+.25*Math.min(1,r*3)));return c});
 const noise=tex(R,N,(u,v)=>[fbm(u,v,4,4,41)*255,fbm(u,v,16,3,42)*255,fbm(u,v,2,3,43)*255],false);
 // stored as 0..1 for grass etc: convert
 return {grass,dirt,sand,rock,noise}}
// NOTE: tex() expects 0..255 values; texture fns above return 0..255 colours.
export function buildTerrain(M,S,R,F,opt={}){const {W,H}=F,SUB=opt.sub||3,CS=16,TX=opt.tex||makeTextures(R,opt.texN||256);
 const meshes=[];const U={uT:{value:0},tG:{value:TX.grass},tD:{value:TX.dirt},tS:{value:TX.sand},tR:{value:TX.rock},tN:{value:TX.noise}};
 const mat=new THREE.MeshLambertMaterial({color:0xffffff});
 mat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,U);
  sh.vertexShader='attribute vec4 sp0;attribute vec4 sp1;varying vec4 vS0;varying vec4 vS1;varying vec2 vW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvS0=sp0;vS1=sp1;vW=position.xz;');
  sh.fragmentShader='uniform sampler2D tG,tD,tS,tR,tN;varying vec4 vS0;varying vec4 vS1;varying vec2 vW;\n'+sh.fragmentShader
   .replace('#include <color_fragment>',`#include <color_fragment>
   vec3 nz=texture2D(tN,vW*.11).rgb; float nf=texture2D(tN,vW*.9).g; float mac=texture2D(tN,vW*.017).b;
   vec4 a=vS0; vec2 b=vS1.xy;
   a.y+=(nz.r-.5)*.42+(nf-.5)*.18; a.z+=(nz.g-.5)*.3; a.w+=(nf-.5)*.25; b.x+=(nz.r-.5)*.3;
   a=smoothstep(.30,.70,a); b=smoothstep(.32,.68,b);
   float sum=a.x+a.y+a.z+a.w+b.x+b.y+1e-4;
   vec3 cg=texture2D(tG,vW*.42).rgb*mix(.86,1.12,mac), cgf=texture2D(tG,vW*1.7).rgb; cg=mix(cg,cgf,.35);
   vec3 cd=mix(texture2D(tD,vW*.38).rgb,texture2D(tD,vW*1.3).rgb,.35);
   vec3 cs=mix(texture2D(tS,vW*.33).rgb,texture2D(tS,vW*1.6).rgb,.4);
   vec3 cr=texture2D(tR,vW*.35).rgb;
   vec3 cm=cd*vec3(.62,.66,.48)+cg*.18;
   vec2 fl=fract(vW*vec2(1.,2.)); vec3 cf=texture2D(tR,vW*.6).rgb*vec3(1.05,.95,.82)*(.82+.18*step(.06,fl.y)*step(.04,fl.x));
   vec3 col=(cg*a.x+cd*a.y+cs*a.z+cr*a.w+cm*b.x+cf*b.y)/sum;
   float gw=a.x/sum; col=mix(col,col*vec3(1.10,1.04,.78),gw*smoothstep(.45,.85,mac)*.55); col=mix(col,col*vec3(.86,.98,.92),gw*(1.-smoothstep(.15,.5,mac))*.5);  // v16 grass macro hue variation
   float edge=a.x*(a.y+b.x)/(sum*sum); col*=1.-edge*.35;                                   // v16 darker worn edge where grass meets path
   col*=mix(1.,.5,smoothstep(.5,.95,vS1.z));            // wet / underwater darkening
   col=mix(col,col*vec3(.86,.9,.8),smoothstep(.3,.5,vS1.z)*(1.-smoothstep(.5,.6,vS1.z)));
   diffuseColor.rgb=col;`)
   .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   { float e=.03; float h0=texture2D(tN,vW*.9).g, hx=texture2D(tN,vW*.9+vec2(e,0.)).g, hz=texture2D(tN,vW*.9+vec2(0.,e)).g;
     float rk=vS0.w+vS0.y*.6+.35; normal=normalize(normal+(viewMatrix*vec4(-(hx-h0)*rk*1.4,0.,-(hz-h0)*rk*1.4,0.)).xyz); }`)};
 const NCX=Math.ceil(W/CS),NCY=Math.ceil(H/CS);let tris=0;
 for(let cy=0;cy<NCY;cy++)for(let cx=0;cx<NCX;cx++){const x0=cx*CS,z0=cy*CS,x1=Math.min(W,x0+CS),z1=Math.min(H,z0+CS);const nx=(x1-x0)*SUB+1,nz=(z1-z0)*SUB+1;
  const pos=new Float32Array(nx*nz*3),nor=new Float32Array(nx*nz*3),s0=new Float32Array(nx*nz*4),s1=new Float32Array(nx*nz*4);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=x0+i/SUB,z=z0+j/SUB,k=j*nx+i;const h=F.hF(x,z);pos[k*3]=x;pos[k*3+1]=h;pos[k*3+2]=z;
   const e=.12,dx=(F.hF(x+e,z)-F.hF(x-e,z))/(2*e),dz=(F.hF(x,z+e)-F.hF(x,z-e))/(2*e),l=Math.hypot(dx,1,dz);nor[k*3]=-dx/l;nor[k*3+1]=1/l;nor[k*3+2]=-dz/l;
   const w=F.bil(F.wm,x,z);let g=F.bil(F.cg.g,x,z),d=F.bil(F.cg.d,x,z),s=F.bil(F.cg.s,x,z),r=F.bil(F.cg.r,x,z),m=F.bil(F.cg.m,x,z),f=F.bil(F.cg.f,x,z);
   const shore=F.ss(.1,.42,w);s=Math.max(s,shore*.95*(g+m+d>0.05?1:0));if(w>.45){g*=.3;m*=.5;s=Math.max(s,.6)}             // sand/pebble shore band + sandy bed
   const pb=F.ss(.25,.48,w)*(1-F.ss(.5,.62,w));r=Math.max(r,pb*.55*(.5+.5*vn(x*2.3,z*2.3)));                                      // pebbles at the waterline
   s0.set([g,d,s,r],k*4);s1.set([m,f,w,0],k*4)}
  const idx=[];for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){const a=j*nx+i,b=a+1,c=a+nx,d=c+1;idx.push(a,c,b,b,c,d)}tris+=idx.length/3;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('normal',new THREE.BufferAttribute(nor,3));g.setAttribute('sp0',new THREE.BufferAttribute(s0,4));g.setAttribute('sp1',new THREE.BufferAttribute(s1,4));
  g.setIndex(idx);g.computeBoundingSphere();g.computeBoundingBox();const m=new THREE.Mesh(g,mat);m.userData.terrain=true;m.receiveShadow=true;S.add(m);meshes.push(m)}
 // ---- water: one big plane at WL; shoreline = exact intersection with the terrain (terrain is above WL wherever mask<.5)
 const md=new Uint8Array(W*H*4);for(let k=0;k<W*H;k++){md[k*4]=Math.round(F.wm[k]*255);md[k*4+3]=255}const mt=new THREE.DataTexture(md,W,H);mt.magFilter=mt.minFilter=THREE.NearestFilter;mt.needsUpdate=true;
 const wg=new THREE.PlaneGeometry(W,H,1,1).rotateX(-Math.PI/2).translate(W/2,WL,H/2);
 const wmat=new THREE.MeshStandardMaterial({color:0xffffff,roughness:.26,metalness:.03,transparent:true,depthWrite:false});
 const WU={uT:U.uT,tN:{value:TX.noise},tM:{value:mt},uS:{value:new THREE.Vector2(W,H)}};
 wmat.onBeforeCompile=sh=>{Object.assign(sh.uniforms,WU);
  sh.vertexShader='varying vec2 vW;\n'+sh.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvW=position.xz;');
  sh.fragmentShader='uniform float uT;uniform sampler2D tN,tM;uniform vec2 uS;varying vec2 vW;\n'+sh.fragmentShader
   .replace('#include <color_fragment>',`#include <color_fragment>
   float m=texture2D(tM,vW/uS).r; float dp=smoothstep(.5,.97,m);
   vec3 col=mix(vec3(.25,.53,.46),vec3(.055,.19,.28),dp);
   float fn=texture2D(tN,vW*.7+vec2(uT*.03,-uT*.02)).g;
   float foam=(1.-smoothstep(.5,.66,m))*smoothstep(.42,.5,m)*(.55+.45*sin(uT*1.6+fn*9.+vW.x*.6));
   foam+= (1.-smoothstep(.5,.58,m))*.25*smoothstep(.57,.68,fn);
   col=mix(col,vec3(.92,.95,.93),clamp(foam,0.,1.)*.75);
   diffuseColor.rgb=col; diffuseColor.a=clamp(mix(.68,.94,dp)+foam*.2,0.,1.);`)
   .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
   { vec2 p1=vW*.45+vec2(uT*.035,uT*.02), p2=vW*.8-vec2(uT*.025,uT*.04); float e=.02;
     float a0=texture2D(tN,p1).g+texture2D(tN,p2).r, ax=texture2D(tN,p1+vec2(e,0.)).g+texture2D(tN,p2+vec2(e,0.)).r, az=texture2D(tN,p1+vec2(0.,e)).g+texture2D(tN,p2+vec2(0.,e)).r;
     normal=normalize(normal+(viewMatrix*vec4(-(ax-a0)*6.,0.,-(az-a0)*6.,0.)).xyz); }
   float wFr=pow(1.-clamp(dot(normal,normalize(vViewPosition)),0.,1.),3.);
   vec3 wSd=normalize((viewMatrix*vec4(-.49,.81,-.33,0.)).xyz); vec3 wH=normalize(wSd+normalize(vViewPosition));
   float wGl=pow(clamp(dot(normal,wH),0.,1.),220.)*smoothstep(.5,.8,m);`)
   .replace('#include <emissivemap_fragment>',`#include <emissivemap_fragment>
   totalEmissiveRadiance+=vec3(.55,.72,.85)*wFr*.32+vec3(1.,.95,.8)*wGl*1.6;`)};
 const water=new THREE.Mesh(wg,wmat);water.renderOrder=1;S.add(water);water.raycast=()=>{};
 // ---- bridge decks (tile 8): planks aligned with the walk map, posts down into the water
 const br=[];for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(M.t[y*W+x]===8)br.push([x,y]);
 if(br.length){const pg=new THREE.BoxGeometry(1.03,.12,1.03),postG=new THREE.CylinderGeometry(.06,.07,.7,7);
  const wood=tex(R,opt.texN||256,(u,v)=>{const board=Math.floor(v*5),edge=Math.min(v*5-board,1-(v*5-board));const grain=pnoise(u*64,v*8,64,61);const tone=.86+.2*hsh(board,63)+.12*(grain-.5);const seam=edge<.035?.48:edge<.07?.75:1;return [148,109,68].map(c=>c*tone*seam)});
  const pm=new THREE.MeshLambertMaterial({color:0xffffff,map:wood}),pom=new THREE.MeshLambertMaterial({color:0x5a3e26});
  const deck=new THREE.InstancedMesh(pg,pm,br.length),posts=new THREE.InstancedMesh(postG,pom,br.length*2);const D=new THREE.Object3D();let pk=0;
  const isB=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&M.t[y*W+x]===8;
  meshes.push(deck);br.forEach(([x,y],k)=>{const ns=isB(x,y-1)||isB(x,y+1);D.position.set(x+.5,F.hAt(x+.5,y+.5)-.06,y+.5);D.rotation.set(0,ns?Math.PI/2:0,0);D.scale.set(1,1,1);D.updateMatrix();deck.setMatrixAt(k,D.matrix);
   for(const s of[-1,1]){D.position.set(x+.5+(ns?s*.45:0),WL-.15,y+.5+(ns?0:s*.45));D.rotation.set(0,0,0);D.updateMatrix();posts.setMatrixAt(pk++,D.matrix)}});
  deck.castShadow=deck.receiveShadow=true;posts.castShadow=true;deck.raycast=()=>{};posts.raycast=()=>{};S.add(deck,posts)}
 return {meshes,water,U,tris,tex:TX,update:t=>{U.uT.value=t}}}