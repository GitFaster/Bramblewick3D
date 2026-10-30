// Richer world map + minimap icons + full-screen map (pinch/pan). Visual only; no saves.
export function initMap(){
 const B=window.B3,M=B.M,W=M.W,H=M.H,S=8,idx=(x,y)=>y*W+x,T=(x,y)=>(x<0||y<0||x>=W||y>=H)?-1:M.t[idx(x,y)];
 const COL={0:[86,140,62],1:[160,134,94],2:[40,86,140],3:[206,190,130],4:[90,84,78],5:[140,108,72],6:[130,130,128],7:[110,104,96],8:[130,96,60],9:[138,106,62],10:[96,150,74],12:[156,116,72],13:[130,124,112]};
 const WALL=new Set([4,12,13]),WATER=2;
 // base: per-tile colour with soft noise, darker water depth, shore foam, wall outlines, building floors
 const base=document.createElement('canvas');base.width=W*S;base.height=H*S;const c=base.getContext('2d');
 const nz=(x,y)=>{const v=Math.sin(x*12.9898+y*78.233)*43758.5453;return v-Math.floor(v)};
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=T(x,y),k=COL[t]||[85,85,85];let f=.92+nz(x,y)*.14;
  if(t===WATER){let d=0;for(let r=1;r<4;r++){if([[r,0],[-r,0],[0,r],[0,-r]].every(([a,b])=>T(x+a,y+b)===WATER))d=r}f=1.15-d*.12}
  c.fillStyle=`rgb(${k[0]*f|0},${k[1]*f|0},${k[2]*f|0})`;c.fillRect(x*S,y*S,S,S);
  if(t===0&&nz(x+3,y)>.86){c.fillStyle='rgba(40,90,30,.5)';c.fillRect(x*S+2,y*S+2,3,3)}}
 for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=T(x,y);
  if(t===WATER)for(const [a,b,rx,ry,rw,rh] of [[1,0,S-1,0,1,S],[-1,0,0,0,1,S],[0,1,0,S-1,S,1],[0,-1,0,0,S,1]]){const n=T(x+a,y+b);if(n!==WATER&&n!==-1){c.fillStyle='rgba(230,245,255,.75)';c.fillRect(x*S+rx,y*S+ry,rw,rh)}}
  if(WALL.has(t)){c.fillStyle='#2b2622';c.fillRect(x*S+1,y*S+1,S-2,S-2)}}
 // icons
 const ICON={bank:'💰',furnace:'🔥',anvil:'⚒️',stall:'🛒',workbench:'🪚',well:'⛲',board:'📜',campfire:'🏕️',fishing:'🐟',bait_fishing:'🐟',trout_fishing:'🐟',salmon_fishing:'🐟',pike_fishing:'🐟',sign:'🪧'};
 const NPCI={shopkeep:'🛒',banker:'💰',guide:'❓',foreman:'❗',fen:'❗',rook:'❗',pip:'❗'};
 const icons=[];const seen=new Set();const push=(x,y,i,n)=>{const k=i+Math.round(x/3)+','+Math.round(y/3);if(seen.has(k))return;seen.add(k);icons.push({x:x+.5,y:y+.5,i,n})};
 M.objs.forEach(o=>{if(ICON[o.type])push(o.x,o.y,ICON[o.type],(M.ND[o.type]||{}).name||o.type)});
 M.npcs.forEach(n=>{if(NPCI[n.kind]&&!n.extra)push(n.x,n.y,NPCI[n.kind],n.name||n.kind)});
 // rocks/trees as tiny dots on base
 M.objs.forEach(o=>{if(/tree|oak|willow|yew|magic/.test(o.type)){c.fillStyle='#2f5a22';c.beginPath();c.arc((o.x+.5)*S,(o.y+.5)*S,S*.42,0,7);c.fill()}else if(/copper|tin|iron|coal|gold|glim|gem/.test(o.type)){c.fillStyle='#9a948a';c.fillRect(o.x*S+2,o.y*S+2,S-4,S-4)}});
 window.__B3mapC=base;
 // minimap overlay icons (called by main's drawMM inside its world transform)
 window.__B3mmIcons=(mx,rot)=>{for(const q of icons){mx.save();mx.translate(q.x,q.y);mx.rotate(-rot);mx.scale(1/8,1/8);mx.font='22px sans-serif';mx.textAlign='center';mx.textBaseline='middle';mx.fillText(q.i,0,0);mx.restore()}};
 // full-screen map
 const css=document.createElement('style');css.textContent='#b3map{position:fixed;inset:0;z-index:99999;background:#0d0b08f2;display:none;touch-action:none}#b3map canvas{position:absolute;inset:0;width:100%;height:100%}#b3map .x{position:absolute;top:calc(10px + env(safe-area-inset-top));right:calc(10px + env(safe-area-inset-right));width:44px;height:44px;border-radius:22px;border:2px solid #6b5a3a;background:#3a3020;color:#ffd84a;font:22px sans-serif;z-index:2}#b3map .lg{position:absolute;left:calc(8px + env(safe-area-inset-left));bottom:calc(8px + env(safe-area-inset-bottom));background:#2a2418e6;border:1px solid #6b5a3a;border-radius:8px;color:#eee;font:12px sans-serif;padding:5px 8px;z-index:2;line-height:1.5}#b3mapb{position:fixed;z-index:21;width:30px;height:30px;border-radius:15px;border:2px solid #6b5a3a;background:#3a3020e6;font:16px sans-serif;padding:0}';document.head.appendChild(css);
 const ov=document.createElement('div');ov.id='b3map';ov.innerHTML='<canvas></canvas><button class="x" aria-label="Close map">✕</button><div class="lg">💰 Bank · 🛒 Shop · 🔥 Furnace · ⚒️ Anvil · 🐟 Fishing<br>❓ Guide · ❗ Quest/Job · 📜 Job board · ⬜ You</div>';document.body.appendChild(ov);
 const cv=ov.querySelector('canvas'),cx=cv.getContext('2d');let z=1,px=0,py=0,open=false;
 function fit(){const d=devicePixelRatio||1;cv.width=innerWidth*d;cv.height=innerHeight*d;z=Math.min(innerWidth/(W*S),innerHeight/(H*S))*1.6;const P=B.G.player;px=innerWidth/2-(P.x+.5)*S*z;py=innerHeight/2-(P.y+.5)*S*z}
 function draw(){if(!open)return;const d=devicePixelRatio||1;cx.setTransform(d,0,0,d,0,0);cx.fillStyle='#0d0b08';cx.fillRect(0,0,innerWidth,innerHeight);cx.save();cx.translate(px,py);cx.scale(z,z);cx.imageSmoothingEnabled=false;cx.drawImage(base,0,0);
  cx.fillStyle='#ffe23a';for(const n of B.G.npcs)if(!n.dead){cx.beginPath();cx.arc((n.x+.5)*S,(n.y+.5)*S,2.2,0,7);cx.fill()}
  const P=B.G.player;cx.fillStyle='#fff';cx.strokeStyle='#000';cx.lineWidth=1.5;cx.fillRect((P.x+.5)*S-4,(P.y+.5)*S-4,8,8);cx.strokeRect((P.x+.5)*S-4,(P.y+.5)*S-4,8,8);cx.restore();
  cx.textAlign='center';cx.textBaseline='middle';const fs=Math.max(14,Math.min(26,8*z*1.6));cx.font=fs+'px sans-serif';
  for(const q of icons){const sx=px+q.x*S*z,sy=py+q.y*S*z;if(sx<-20||sy<-20||sx>innerWidth+20||sy>innerHeight+20)continue;cx.fillText(q.i,sx,sy);if(z>2.2){cx.font='bold 11px sans-serif';cx.fillStyle='#fff';cx.strokeStyle='#000';cx.lineWidth=3;cx.strokeText(q.n,sx,sy+fs*.8);cx.fillText(q.n,sx,sy+fs*.8);cx.font=fs+'px sans-serif'}}
  requestAnimationFrame(draw)}
 function show(){open=true;ov.style.display='block';fit();draw()}function hide(){open=false;ov.style.display='none'}
 ov.querySelector('.x').addEventListener('click',e=>{e.stopPropagation();hide()});
 const pts=new Map();let p0=null;
 cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);pts.set(e.pointerId,[e.clientX,e.clientY]);p0=null});
 cv.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;const old=pts.get(e.pointerId);const nw=[e.clientX,e.clientY];
  if(pts.size===1){px+=nw[0]-old[0];py+=nw[1]-old[1]}else if(pts.size===2){const o=[...pts.entries()].find(([k])=>k!==e.pointerId)[1];const d0=Math.hypot(old[0]-o[0],old[1]-o[1]),d1=Math.hypot(nw[0]-o[0],nw[1]-o[1]);if(d0>5)zoomAt(d1/d0,(nw[0]+o[0])/2,(nw[1]+o[1])/2)}pts.set(e.pointerId,nw)});
 const up=e=>pts.delete(e.pointerId);cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
 function zoomAt(f,ax,ay){const nz=Math.max(.4,Math.min(8,z*f));f=nz/z;px=ax-(ax-px)*f;py=ay-(ay-py)*f;z=nz}
 cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(e.deltaY<0?1.15:1/1.15,e.clientX,e.clientY)},{passive:false});
 addEventListener('resize',()=>{if(open)fit()});
 const mm=document.getElementById('mm');if(mm){mm.style.cursor='pointer';mm.addEventListener('click',e=>{e.stopPropagation();show()})}
 const mb=document.createElement('button');mb.id='b3mapb';mb.textContent='🗺️';mb.title='World map';mb.setAttribute('aria-label','World map');document.body.appendChild(mb);mb.addEventListener('click',e=>{e.stopPropagation();show()});
 const place=()=>{if(!mm)return;const r=mm.getBoundingClientRect();mb.style.left=(r.left-6)+'px';mb.style.top=(r.top+r.height-28)+'px'};setInterval(place,1000);place();
 return {show,hide,state:()=>({open,icons:icons.length,z})}
}
