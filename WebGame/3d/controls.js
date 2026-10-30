// Bramblewick 3D full controls: joystick, WASD, action button, shortcuts, help sheet
(function(){
const css=`#bwjoy{position:fixed;left:calc(14px + env(safe-area-inset-left));bottom:calc(64px + env(safe-area-inset-bottom));width:116px;height:116px;border-radius:50%;background:#2a201566;border:2px solid #5a463099;touch-action:none;z-index:20}
#bwjoy i{position:absolute;left:33px;top:33px;width:50px;height:50px;border-radius:50%;background:#c8a46ecc;border:2px solid #5a4630;pointer-events:none}
.bwcb{position:fixed;z-index:20;width:56px;height:56px;border-radius:50%;border:2px solid #5a4630;background:#2a2015dd;color:#fff;font:800 22px system-ui;touch-action:manipulation;padding:0;cursor:pointer}
#bwact{right:calc(6px + env(safe-area-inset-right));bottom:calc(62px + env(safe-area-inset-bottom));width:64px;height:64px;font-size:26px;background:#6b4a22ee}
#bwhelpb{right:calc(14px + env(safe-area-inset-right));bottom:calc(134px + env(safe-area-inset-bottom));width:48px;height:48px;font-size:20px}
#bwhelp{position:fixed;inset:0;z-index:60;display:none;align-items:center;justify-content:center;background:#0008}
#bwhelp>div{background:#2a2015f4;border:2px solid #5a4630;border-radius:12px;color:#f2e6cc;font:14px/1.45 system-ui;padding:14px 18px;max-width:min(92vw,520px);max-height:86vh;overflow:auto}
#bwhelp b{color:#ffd27a}#bwhelp button{margin-top:10px;min-height:48px;width:100%;font:800 16px system-ui;border-radius:8px;border:2px solid #5a4630;background:#6b4a22;color:#fff}
#mm.bwbig{width:min(80vw,80vh)!important;height:min(80vw,80vh)!important;z-index:40}
@media (hover:hover) and (pointer:fine){#bwjoy{display:none}}
@media (max-width:700px) and (orientation:portrait){#chat{width:min(52vw,380px)!important}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const el=(h)=>{const d=document.createElement('div');d.innerHTML=h;return d.firstChild};
const joy=el('<div id="bwjoy" class="hud" aria-label="Move"><i></i></div>');
const act=el('<button id="bwact" class="bwcb hud" title="Action (Space)">✋</button>');
const hb=el('<button id="bwhelpb" class="bwcb hud" title="Controls (H)">?</button>');
const help=el(`<div id="bwhelp"><div><h3 style="margin:0 0 6px">Controls</h3>
<b>Phone</b><br>Tap ground or thing: walk / default action · Long-press: all options · Joystick (bottom-left): walk · ✋: act on nearest thing · Drag: rotate camera · Pinch: zoom · 🎒: inventory · Run orb: toggle run<br><br>
<b>Desktop</b><br>Left-click: walk / default action · Right-click: all options · WASD: walk · Arrows / drag: rotate camera · Wheel: zoom · Space: action · I inventory · E equipment · K skills · M map · R run · H help · Esc close</div></div>`);
const ok=document.createElement('button');ok.textContent='Close';help.firstChild.appendChild(ok);
let built=false;
function build(){if(built)return;built=true;document.body.append(joy,act,hb,help)}
const B=()=>window.B3;
const showHelp=v=>{help.style.display=v?'flex':'none'};
hb.onclick=()=>showHelp(1);ok.onclick=()=>showHelp(0);help.onclick=e=>{if(e.target===help)showHelp(0)};
// direction in world from screen vector (sx right, sy up)
function worldDir(sx,sy){const b=B();if(!b||!b.cam||!b.Pl)return null;const c=b.cam.position;let fx=(b.Pl.x+.5)-c.x,fz=(b.Pl.y+.5)-c.z;const L=Math.hypot(fx,fz)||1;fx/=L;fz/=L;const rx=-fz,rz=fx;return [fx*sy+rx*sx,fz*sy+rz*sx]}
let mv=null,last=0;
function stepMove(now){if(!mv||now-last<220)return;const b=B();if(!b||!b.GM)return;const d=worldDir(mv[0],mv[1]);if(!d)return;const L=Math.hypot(d[0],d[1]);if(L<.25)return;last=now;
const ux=d[0]/L,uz=d[1]/L,px=b.Pl.x,py=b.Pl.y;for(const n of [3,2,1]){const x=Math.round(px+ux*n),y=Math.round(py+uz*n);if((x!==px||y!==py)&&b.walk(x,y)){b.GM.R.walkTo(b.GM.G,x,y);return}}
// slide along axes
const ax=Math.abs(ux)>Math.abs(uz)?[[Math.sign(ux),0],[0,Math.sign(uz)]]:[[0,Math.sign(uz)],[Math.sign(ux),0]];for(const [dx,dy] of ax){if((dx||dy)&&b.walk(px+dx,py+dy)){b.GM.R.walkTo(b.GM.G,px+dx,py+dy);return}}}
const K={};
function keyVec(){let x=0,y=0;if(K.w)y+=1;if(K.s)y-=1;if(K.d)x+=1;if(K.a)x-=1;return (x||y)?[x,y]:null}
let jv=null;
let pv=0;(function loop(t){mv=jv||keyVec();if(built){const iv=document.getElementById('inv'),o=iv&&iv.style.display==='grid';if(o!==pv){pv=o;act.style.display=hb.style.display=o?'none':''}}stepMove(t);requestAnimationFrame(loop)})(0);
// joystick
let jid=null,jc=null;const knob=joy.firstChild;
joy.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();jid=e.pointerId;try{joy.setPointerCapture(jid)}catch(_){};const r=joy.getBoundingClientRect();jc=[r.left+r.width/2,r.top+r.height/2];jmove(e)});
function jmove(e){if(e.pointerId!==jid)return;let dx=e.clientX-jc[0],dy=e.clientY-jc[1];const L=Math.hypot(dx,dy),M=42;if(L>M){dx*=M/L;dy*=M/L}knob.style.transform=`translate(${dx}px,${dy}px)`;jv=L>12?[dx/M,-dy/M]:null}
joy.addEventListener('pointermove',e=>{e.stopPropagation();jmove(e)});
const jend=e=>{if(e.pointerId!==jid)return;jid=null;jv=null;knob.style.transform=''};joy.addEventListener('pointerup',jend);joy.addEventListener('pointercancel',jend);
// action: nearest interactable default action
// v16: prefer non-combat targets (talk, gather, bank, stations) over creatures unless already fighting
function fighting(G){return !!(G.player&&G.player.combat)||(G.npcs||[]).some(n=>n.target&&!n.dead)}
function opsOf(b,n){const D=(b.GM.DEF&&b.GM.DEF.npcs)||{};return ((D[n.kind]||{}).ops)||[]}
function hostile(b,n){const o=opsOf(b,n);return o.includes('Attack')&&o.length===1}
function nearest(){const b=B();if(!b||!b.GM)return null;const G=b.GM.G,px=b.Pl.x,py=b.Pl.y,cand=[];const dist=o=>Math.max(Math.abs(o.x-px),Math.abs(o.y-py));
for(const n of (G.npcs||[])){if(n.dead)continue;const d=dist(n);if(d<5)cand.push([d,hostile(b,n)?1:0,n])}
for(const o of (G.objs||[])){if(!o||o.dep)continue;const d=dist(o);if(d<5)cand.push([d-.01,0,o])}
const f=fighting(G);cand.sort((p,q)=>f?p[0]-q[0]:(p[1]-q[1])||(p[0]-q[0]));return cand.length?cand[0][2]:null}
function doAct(){const b=B(),t=nearest();if(!b)return;if(!t){window.__B3toast&&__B3toast('Nothing nearby');return}const [sx,sy]=b.proj(t.x+.5,t.y+.5);
const es=(b.ents&&b.ents(sx,sy-6))||[];if(!es.length)return b.tap(sx,sy-6);
const f=fighting(b.GM.G);const L=e=>String(e.label).replace(/<[^>]*>/g,'').trim(),ok=e=>!/^(Walk here|Examine|Cancel)/i.test(L(e));
const pick=(f?es.find(ok):es.find(e=>ok(e)&&!/^Attack/i.test(L(e))))||es.find(ok)||es[0];pick.fn();return L(pick)}
act.addEventListener('pointerdown',e=>e.stopPropagation());act.onclick=e=>{e.stopPropagation();doAct()};
window.__B3ctl={doAct,nearest,worldDir,showHelp};
const clickSel=s=>{const n=document.querySelector(s);n&&n.click()};
function closeAll(){showHelp(0);const b=B();b&&b.GM&&b.GM.close&&b.GM.close();const m=document.getElementById('menu');m&&(m.style.display='none');const mm=document.getElementById('mm');mm&&mm.classList.remove('bwbig');const a=document.getElementById('bwacct');a&&a.style.display!=='none'&&(a.style.display='none')}
addEventListener('keydown',e=>{const tg=e.target;if(tg&&(tg.tagName==='INPUT'||tg.tagName==='TEXTAREA'))return;if(!window.__B3started)return;const k=e.key.toLowerCase();
if('wasd'.includes(k)&&k.length===1){K[k]=1;e.preventDefault();return}
const b=B();const op=m=>b&&b.GM&&b.GM.open(m);
if(k==='i')op('inv');else if(k==='e')op('equip');else if(k==='k')op('skills');else if(k==='m')document.getElementById('mm')?.classList.toggle('bwbig');else if(k==='r')clickSel('#run');else if(k==='h'||k==='?')showHelp(help.style.display!=='flex');else if(k===' '||k==='enter'){e.preventDefault();doAct()}else if(k==='escape')closeAll()});
addEventListener('keyup',e=>{const k=e.key.toLowerCase();if(k in K)K[k]=0});addEventListener('blur',()=>{for(const k in K)K[k]=0});
const iv=setInterval(()=>{if(window.__B3started&&window.B3){clearInterval(iv);build()}},300);
})();
