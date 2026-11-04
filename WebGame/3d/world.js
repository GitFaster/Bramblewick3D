// Shared world heights and bridge levels. No renderer or browser dependencies.
export const WL=-0.2, DECK=0.05;
const CAT={0:'g',10:'g',9:'g',1:'d',3:'s',6:'r',7:'m',5:'f',4:'f',12:'f',13:'f',2:'w',8:'w'};
export function hsh(x,y){let h=(Math.imul(x|0,374761393)+Math.imul(y|0,668265263))>>>0;h=Math.imul(h^(h>>>13),1274126177)>>>0;return ((h^(h>>>16))>>>0)/4294967296}
export function vn(x,y){const xi=Math.floor(x),yi=Math.floor(y);let fx=x-xi,fy=y-yi;fx=fx*fx*(3-2*fx);fy=fy*fy*(3-2*fy);const a=hsh(xi,yi),b=hsh(xi+1,yi),c=hsh(xi,yi+1),e=hsh(xi+1,yi+1);return a+(b-a)*fx+(c-a)*fy+(a-b-c+e)*fx*fy}
export function buildField(M){const {W,H}=M,T=M.t;const tc=(x,y)=>CAT[T[Math.min(H-1,Math.max(0,y))*W+Math.min(W-1,Math.max(0,x))]]||'g';
 const grid=f=>{const g=new Float32Array(W*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++)g[y*W+x]=f(x,y);return g};
 const blur=(g,c,e,d)=>{const o=new Float32Array(W*H);const at=(x,y)=>g[Math.min(H-1,Math.max(0,y))*W+Math.min(W-1,Math.max(0,x))];for(let y=0;y<H;y++)for(let x=0;x<W;x++)o[y*W+x]=(c*at(x,y)+e*(at(x-1,y)+at(x+1,y)+at(x,y-1)+at(x,y+1))+d*(at(x-1,y-1)+at(x+1,y-1)+at(x-1,y+1)+at(x+1,y+1)))/(c+4*e+4*d);return o};
 const wRaw=grid((x,y)=>tc(x,y)==='w'?1:0);const wm=blur(blur(wRaw,8,1,0),6,1,.5);   // water mask: tile centres ~1, contour .5 rounded
 const gm=blur(blur(grid((x,y)=>tc(x,y)==='g'?1:0),1,1,1),1,1,1);                   // hills only away from roads/buildings
 const cats=['g','d','s','r','m','f'];const cg={};for(const c of cats)cg[c]=grid((x,y)=>tc(x,y)===c?1:0);
 const bil=(g,x,z)=>{x-=.5;z-=.5;const i=Math.floor(x),j=Math.floor(z),fx=x-i,fy=z-j;const at=(a,b)=>g[Math.min(H-1,Math.max(0,b))*W+Math.min(W-1,Math.max(0,a))];
  const a=at(i,j),b=at(i+1,j),c=at(i,j+1),d=at(i+1,j+1);return (a*(1-fx)+b*fx)*(1-fy)+(c*(1-fx)+d*fx)*fy};
 const ss=(a,b,v)=>{const t=Math.min(1,Math.max(0,(v-a)/(b-a)));return t*t*(3-2*t)};
 function hF(x,z){const w=bil(wm,x,z),g=bil(gm,x,z);let h=g*((vn(x/7,z/7)*1.0+vn(x/3,z/3)*.22-.25)*.9)+.025*(vn(x*1.7,z*1.7)-.5);
  if(w>.02){if(w<=.56)h=h+(WL+.04-h)*ss(.04,.56,w);else h=WL+.04-.6*ss(.56,.97,w)}const br=bil(wRaw,x,z);if(br>.5)h=Math.min(h,WL+.04-.34*ss(.5,1,br));return h}
 const tileAt=(x,z)=>T[Math.min(H-1,Math.max(0,Math.floor(z)))*W+Math.min(W-1,Math.max(0,Math.floor(x)))];
 // v12 deck heights: ends meet the land edge, interior relaxed, never below DECK (clearance >= DECK-WL)
 const BH=new Float32Array(W*H);{const isB=i=>T[i]===8;const fix=new Uint8Array(W*H);for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!isB(i))continue;BH[i]=DECK;let m=-9;
   for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X<0||Y<0||X>=W||Y>=H)continue;const t=T[Y*W+X];if(t!==8&&t!==2)m=Math.max(m,hF(x+.5+dx*.5,y+.5+dy*.5))}
   if(m>-9){BH[i]=Math.max(DECK,m);fix[i]=1}}
  for(let it=0;it<40;it++)for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!isB(i)||fix[i])continue;let s=0,c=0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const X=x+dx,Y=y+dy;if(X>=0&&Y>=0&&X<W&&Y<H&&isB(Y*W+X)){s+=BH[Y*W+X];c++}}if(c)BH[i]=Math.max(DECK,s/c)}}
 function hAt(x,z){return tileAt(x,z)===8?BH[Math.min(H-1,Math.max(0,Math.floor(z)))*W+Math.min(W-1,Math.max(0,Math.floor(x)))]:hF(x,z)}
 return {W,H,wm,cg,bil,hF,hAt,ss,tileAt}}
