// Bramblewick 3D multiplayer: see other online players + world chat. Server relay: /mp/3d/* (Server/app/mp3d.py).
// Short polling once per game tick (600 ms) so it also works through the iOS app's bramblewick:// proxy.
// Disable with ?mp=0. Remote players are visual only (no collision, no combat).
import {makeChar,animate} from './chars.js?v=22';
(globalThis.__B3mods=globalThis.__B3mods||{}).mp=1;
if(new URLSearchParams(location.search).get('mp')!=='0'){
const wait=()=>new Promise(r=>{const t=setInterval(()=>{if(window.__B3ready&&window.B3&&window.B3.Pl&&window.B3.Pl.g){clearInterval(t);r(window.B3)}},250)});
const B=await wait();const {THREE,S,Pl,G,hAt}=B;
const MP=window.__B3mp={on:false,id:null,name:null,players:new Map(),since:0,err:''};
const ls=k=>{try{return localStorage.getItem(k)}catch(e){return null}},lset=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const hsh=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))|0;return h>>>0};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let guest=ls('bw.mpname');if(!guest){guest='Guest'+(1000+Math.floor(Math.random()*9000));lset('bw.mpname',guest)}
const myName=()=>(window.__B3online&&window.__B3online.user)||guest;
// ---- look: outfit colours from a small palette, picked by name hash
const SHIRT=[0x2a5ab0,0xb03a2a,0x3a8a3a,0x8a3ab0,0xc89a2a,0x2a9aa0,0x6a4a2a,0xd0d0d0],LEGS=[0x3a3a5a,0x4a3a2a,0x2a2a2a,0x5a5a4a],HAIR=[0x5a3a1a,0x1a1a1a,0xc08a40,0x8a3a2a,0xbbbbbb];
const lookOf=n=>String(hsh(n)%160);
function dress(g,look){const k=+look||0,sh=SHIRT[k%8],lg=LEGS[(k>>3)%4],hr=HAIR[(k>>5)%5],cl=new Map();
 const sw={[0x2a5ab0]:sh,[0x3a3a5a]:lg,[0x5a3a1a]:hr};g.traverse(o=>{if(!o.isMesh||!o.material||!o.material.color)return;const c=sw[o.material.color.getHex()];if(c==null)return;let m=cl.get(c);if(!m){m=o.material.clone();m.color.setHex(c);cl.set(c,m)}o.material=m})}
// ---- canvas text sprites (name label + overhead chat)
function textSprite(text,color,y){const c=document.createElement('canvas'),x=c.getContext('2d');c.width=256;c.height=48;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;
 const m=new THREE.SpriteMaterial({map:t,depthTest:false,transparent:true});const s=new THREE.Sprite(m);s.scale.set(2.4,.45,1);s.position.y=y;s.renderOrder=999;s.raycast=()=>{};
 s.set=(txt,col)=>{x.clearRect(0,0,256,48);x.font='bold 26px sans-serif';x.textAlign='center';x.textBaseline='middle';x.lineWidth=5;x.strokeStyle='#000';x.strokeText(txt,128,24,250);x.fillStyle=col||color;x.fillText(txt,128,24,250);t.needsUpdate=true};s.set(text,color);return s}
function say(g,text){let s=g.userData.say;if(!s){s=g.userData.say=textSprite('','#ff0',2.75);g.add(s)}s.set(text.length>34?text.slice(0,33)+'…':text,'#ff0');s.visible=true;clearTimeout(s.tm);s.tm=setTimeout(()=>{s.visible=false},5000)}
// ---- remote players
let BLOB=null;function blob(g){if(!BLOB){const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,2,32,32,31);gr.addColorStop(0,'rgba(0,0,0,.6)');gr.addColorStop(.6,'rgba(0,0,0,.3)');gr.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=gr;x.fillRect(0,0,64,64);
 BLOB=[new THREE.PlaneGeometry(.95,.95).rotateX(-Math.PI/2),new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(c),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2})]}const b=new THREE.Mesh(BLOB[0],BLOB[1]);b.position.y=.03;b.renderOrder=2;b.raycast=()=>{};g.add(b)}
function addRemote(p){const g=makeChar('player');dress(g,p.look);blob(g);const lbl=textSprite(p.name+(p.guest?' (guest)':''),'#fff',2.35);g.add(lbl);S.add(g);
 const e={id:p.id,name:p.name,g,cx:p.x,cy:p.y,tx:p.x,ty:p.y,yaw:p.facing||0,tyaw:p.facing||0,run:false,phase:0,look:p.look};g.position.set(p.x+.5,hAt(p.x+.5,p.y+.5),p.y+.5);MP.players.set(p.id,e);
 msg(`<span style="color:#9f9">${esc(p.name)} is here.</span>`);return e}
function dropRemote(e){S.remove(e.g);e.g.traverse(o=>{if(o.isSprite){o.material.map.dispose();o.material.dispose()}else if(o.isMesh&&o.material&&o.material!==(BLOB&&BLOB[1])&&o.material.userData.mpClone)o.material.dispose()});MP.players.delete(e.id)}
const chatEl=document.getElementById('chat');
function msg(h){if(!chatEl)return;const d=document.createElement('div');d.innerHTML=h;chatEl.appendChild(d);while(chatEl.children.length>30)chatEl.firstChild.remove();if(chatEl.classList.contains('open'))chatEl.scrollTop=1e9}
// ---- networking
let token=null,busy=false,backoff=0;
async function post(path,body){const h={'Content-Type':'application/json'};if(token)h['X-Player-Token']=token;const tk=ls('bwl.token');if(tk)h.Authorization='Bearer '+tk;
 const c=new AbortController(),to=setTimeout(()=>c.abort(),5000);try{const r=await fetch(path,{method:'POST',headers:h,body:JSON.stringify(body),signal:c.signal});const d=await r.json().catch(()=>({}));d.status=r.status;d.ok=r.ok;return d}catch(e){return {ok:false,status:0}}finally{clearTimeout(to)}}
const me=()=>({name:myName(),x:G.player.x|0,y:G.player.y|0,plane:G.player.plane|0||0,facing:+(Pl.tyaw||0).toFixed(3),run:!!G.player.run,look:lookOf(myName())});
async function join(){const d=await post('/mp/3d/join',me());if(!d.ok){MP.err=d.message||('offline '+d.status);return false}token=d.token;MP.id=d.id;MP.name=d.name;MP.since=d.since||0;MP.on=true;MP.err='';badge();return true}
async function pulse(){if(busy||document.hidden)return;if(backoff>0){backoff--;return}busy=true;try{
 if(!token&&!(await join())){backoff=8;return}
 const d=await post('/mp/3d/pulse',Object.assign(me(),{since:MP.since}));
 if(d.status===401){token=null;return}if(!d.ok){MP.on=false;MP.err=d.message||'offline';backoff=d.status===429?3:5;badge();return}MP.on=true;
 const seen=new Set();for(const p of d.players||[]){seen.add(p.id);let e=MP.players.get(p.id)||addRemote(p);e.tx=p.x;e.ty=p.y;e.run=p.run;e.plane=p.plane;e.face=p.facing}
 for(const e of [...MP.players.values()])if(!seen.has(e.id)){msg(`<span style="color:#9f9">${esc(e.name)} left.</span>`);dropRemote(e)}
 for(const m of d.messages||[]){MP.since=Math.max(MP.since,m.id);if(m.player===MP.id)continue;msg(`<span style="color:#7ff">${esc(m.name)}:</span> ${esc(m.text)}`);const e=MP.players.get(m.player);if(e)say(e.g,m.text)}
 badge()}finally{busy=false}}
setInterval(pulse,600);pulse();
addEventListener('pagehide',()=>{if(token)try{fetch('/mp/3d/leave',{method:'POST',keepalive:true,headers:{'Content-Type':'application/json','X-Player-Token':token},body:'{}'})}catch(e){}});
// ---- per-frame glide (same feel as local player: 1 tile/tick walking, 2 running)
let last=performance.now();
function frame(now){requestAnimationFrame(frame);const dt=Math.min(.1,(now-last)/1000);last=now;const P=G.player;
 for(const e of MP.players.values()){let dx=e.tx-e.cx,dy=e.ty-e.cy;const d=Math.hypot(dx,dy);let step=0;
  if(d>8){e.cx=e.tx;e.cy=e.ty}else if(d>1e-3){let sp=(e.run?2:1)/.6;if(d>sp*.9)sp=d/.6;step=Math.min(d,sp*dt);e.cx+=dx/d*step;e.cy+=dy/d*step;e.tyaw=Math.atan2(dx,dy)}else if(e.face!=null)e.tyaw=e.face;
  const x=e.cx+.5,z=e.cy+.5;e.g.position.set(x,hAt(x,z),z);let a=e.tyaw-e.yaw;a=Math.atan2(Math.sin(a),Math.cos(a));e.yaw+=a*Math.min(1,dt*12);e.g.rotation.y=e.yaw;
  e.g.visible=(e.plane|0)===(P.plane|0)&&Math.max(Math.abs(e.cx-P.x),Math.abs(e.cy-P.y))<26;animate(e,step,dt,now/1000,e.run)}}
requestAnimationFrame(frame);
// ---- minimap dots (white) chained onto map.js icons
setInterval(()=>{const cur=window.__B3mmIcons;if(cur&&cur.__mp)return;const prev=cur;const f=(mx,rot)=>{if(prev)prev(mx,rot);mx.fillStyle='#fff';for(const e of MP.players.values())if(e.g.visible)mx.fillRect(e.g.position.x-.4,e.g.position.z-.4,.8,.8)};f.__mp=1;window.__B3mmIcons=f},1000);
// ---- chat button + input (Enter also opens it on keyboards)
const css=document.createElement('style');css.textContent='#mpb{position:fixed;z-index:60;left:50%;transform:translateX(-50%);top:calc(8px + env(safe-area-inset-top));font:600 12px system-ui,sans-serif;padding:4px 10px;min-height:30px;border-radius:15px;border:1px solid #0006;color:#fff;background:#2a2a2ad0;cursor:pointer}#mpb.on{background:#1f4a5acc}#mpin{position:fixed;z-index:61;left:50%;transform:translateX(-50%);bottom:calc(120px + env(safe-area-inset-bottom));width:min(86vw,420px);display:none;gap:6px}#mpin input{flex:1;font-size:16px;padding:10px;border-radius:8px;border:1px solid #5a4630;background:#111e;color:#fff}#mpin button{min-height:44px;padding:0 14px;border-radius:8px;border:1px solid #5a4630;background:#3a4a2a;color:#fff;font-size:15px}';document.head.appendChild(css);
const btn=document.createElement('button');btn.id='mpb';btn.setAttribute('aria-label','World chat');document.body.appendChild(btn);
const box=document.createElement('div');box.id='mpin';box.innerHTML='<input maxlength="120" placeholder="Say something to everyone…" enterkeyhint="send"><button>Send</button>';document.body.appendChild(box);
const inp=box.querySelector('input');
function badge(){btn.textContent=MP.on?`💬 Chat · ${MP.players.size+1} online`:'💬 Chat · offline';btn.classList.toggle('on',MP.on);btn.title=MP.err||''}badge();
const openBox=()=>{box.style.display='flex';inp.focus()},closeBox=()=>{box.style.display='none';inp.blur()};
async function send(){const t=inp.value.trim();if(!t){closeBox();return}inp.value='';closeBox();
 if(!token&&!(await join())){msg('<span class="r">Chat is offline right now.</span>');return}
 const d=await post('/mp/3d/chat',{text:t});if(!d.ok){msg(`<span class="r">${esc(d.message||'Chat is offline right now.')}</span>`);return}
 MP.since=Math.max(MP.since,0);msg(`<span style="color:#7ff">${esc(MP.name||myName())}:</span> ${esc(t)}`);say(Pl.g,t)}
btn.onclick=()=>box.style.display==='flex'?closeBox():openBox();box.querySelector('button').onclick=send;
inp.addEventListener('keydown',e=>{e.stopPropagation();if(e.key==='Enter'){e.preventDefault();send()}else if(e.key==='Escape')closeBox()});inp.addEventListener('keyup',e=>e.stopPropagation());
addEventListener('keydown',e=>{const tg=e.target;if(tg&&/INPUT|TEXTAREA/.test(tg.tagName))return;if(e.key==='Enter'&&box.style.display!=='flex'){e.preventDefault();openBox()}});
}
