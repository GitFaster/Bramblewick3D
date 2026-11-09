// Bramblewick login / register screen (Bramblewick account screen). Accounts are the
// existing bramblewick-link accounts (Argon2 on the server); the game state is saved per account at /api/osrs/save.
(function(){
const V=(document.currentScript.src.match(/v=(\d+)/)||[])[1]||'0';
const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}};
const css=`#lg{position:fixed;inset:0;z-index:9999;overflow:auto;-webkit-overflow-scrolling:touch;background:#0e0b07 radial-gradient(ellipse at top,#2a2012 0%,#0e0b07 70%);color:#e8d9b0;font-family:Georgia,serif}
#lg *{box-sizing:border-box}#lg .hero{text-align:center;padding:44px 16px 26px;background:linear-gradient(180deg,rgba(0,0,0,.2),#0e0b07),repeating-linear-gradient(45deg,#1d160d 0 14px,#181209 14px 28px);border-bottom:3px solid #5c4a2a}
#lg h1{font-family:Cinzel,Georgia,serif;font-weight:900;font-size:clamp(38px,8vw,72px);margin:0;color:#ffb000;text-shadow:0 0 22px rgba(255,150,0,.5),3px 3px 0 #000;letter-spacing:4px}
#lg .hero p{font-size:17px;color:#c8b48a;margin:8px 0 0}
#lg .wrap{display:flex;flex-wrap:wrap;gap:22px;justify-content:center;padding:26px 14px 30px}
#lg .card{background:linear-gradient(#3a2f1f,#251d12);border:2px solid #6b5631;outline:1px solid #000;border-radius:6px;padding:22px 24px;width:min(380px,100%);box-shadow:0 10px 30px #000}
#lg h2{font-family:Cinzel,Georgia,serif;color:#ffb000;margin:0 0 14px;border-bottom:1px solid #6b5631;padding-bottom:10px;font-size:22px}
#lg label{font-size:14px;color:#c8b48a}#lg input{width:100%;padding:11px;margin:6px 0 14px;background:#120f0b;color:#fff;border:1px solid #6b5631;border-radius:3px;font-size:16px}
#lg input:focus{outline:none;border-color:#ffb000}
#lg button{display:block;width:100%;min-height:46px;padding:12px;background:linear-gradient(#ffc233,#d48a00);border:1px solid #000;color:#1a1208;font-family:Cinzel,Georgia,serif;font-size:16px;font-weight:900;cursor:pointer;border-radius:3px;margin-bottom:10px}
#lg button.g{background:linear-gradient(#5a4a30,#3a2f1f);color:#e8d9b0}
#lg .msg{padding:10px;margin-bottom:12px;border-radius:3px;background:#0006;display:none}#lg .msg.e{display:block;color:#f88}#lg .msg.ok{display:block;color:#9f9}
#lg footer{text-align:center;color:#6b5a3a;padding:10px 10px 30px;font-size:13px}
@media (max-height:520px){#lg .hero{padding:8px 12px 6px}#lg .hero h1{font-size:24px!important;margin:0}#lg .hero p{font-size:12px;margin:2px 0 0}#lg .wrap{padding:10px 10px 16px;gap:12px}}`;
const css43=`@keyframes lgfade{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
@keyframes lgember{0%{transform:translateY(0);opacity:0}10%{opacity:.9}100%{transform:translateY(-110vh) translateX(40px);opacity:0}}
@keyframes lgglow{0%,100%{box-shadow:0 0 14px rgba(255,176,0,.45),inset 0 1px 0 rgba(255,255,255,.5)}50%{box-shadow:0 0 28px rgba(255,176,0,.85),inset 0 1px 0 rgba(255,255,255,.5)}}
#lg{background:#0b0a09 radial-gradient(ellipse at 50% 0%,#2b2416 0%,#121010 55%,#070606 100%)!important}
#lg::before,#lg::after{content:'';position:fixed;left:0;right:0;bottom:-20px;height:100vh;pointer-events:none;z-index:0;background-image:radial-gradient(2px 2px at 8% 90%,#ffb347,transparent),radial-gradient(2px 2px at 23% 80%,#ffd27a,transparent),radial-gradient(3px 3px at 41% 95%,#ff9a2e,transparent),radial-gradient(2px 2px at 57% 85%,#ffc86b,transparent),radial-gradient(2px 2px at 72% 92%,#ffb347,transparent),radial-gradient(3px 3px at 88% 82%,#ff8c1a,transparent),radial-gradient(2px 2px at 95% 97%,#ffd27a,transparent);animation:lgember 9s linear infinite}
#lg::after{animation-duration:13s;animation-delay:-5s;left:-30px}
#lg .hero,#lg .wrap,#lg footer{position:relative;z-index:1}
#lg .hero{background:none!important;border-bottom:0!important;animation:lgfade .8s ease both}
#lg h1{font-family:Cinzel,Georgia,serif;font-size:clamp(30px,9vw,84px)!important;letter-spacing:3px;white-space:nowrap;background:linear-gradient(180deg,#fff2c2 0%,#ffcf4a 45%,#b87400 100%);-webkit-background-clip:text;background-clip:text;color:transparent!important;text-shadow:none!important;filter:drop-shadow(0 0 18px rgba(255,170,0,.45)) drop-shadow(2px 3px 0 #000)}
#lg .hero p{color:#bfa874!important;letter-spacing:3px;text-transform:uppercase;font-size:12px!important}
#lg .card{background:linear-gradient(160deg,rgba(52,46,38,.92),rgba(24,21,18,.95))!important;border:1px solid #7a6334!important;outline:0!important;border-radius:16px!important;box-shadow:0 18px 40px rgba(0,0,0,.7),inset 0 1px 0 rgba(255,220,150,.08)!important;animation:lgfade .8s ease both .15s}
#lg #lgreg{animation-delay:.3s}
#lg h2{border-bottom:1px solid rgba(255,176,0,.25)!important;letter-spacing:2px}
#lg input{border-radius:12px!important;background:rgba(10,9,8,.85)!important;border:1px solid #5a4a2a!important;padding:13px 14px!important;transition:border-color .2s,box-shadow .2s}
#lg input:focus{border-color:#ffb000!important;box-shadow:0 0 0 3px rgba(255,176,0,.2)}
#lg button{border-radius:12px!important;letter-spacing:1px}
#lg button:active{transform:scale(.98)}
#lg #lgin button:not(.g),#lg #lgplay,#lg #lgreg button{background:linear-gradient(180deg,#ffd54d,#e09200)!important;border:1px solid #6b4500!important;animation:lgglow 2.4s ease-in-out infinite}
#lg button.g{background:transparent!important;color:#ffcf4a!important;border:1px solid #c08a1a!important;box-shadow:none!important;animation:none!important}
#lg footer{color:#7d6b47!important}
@media (prefers-reduced-motion:reduce){#lg::before,#lg::after,#lg *{animation:none!important}}
@keyframes lgleaf{0%{transform:translate(0,-10vh) rotate(0);opacity:0}10%{opacity:.7}100%{transform:translate(-30vw,110vh) rotate(540deg);opacity:0}}
@keyframes lgpulse{0%,100%{opacity:1}50%{opacity:.35}}
@keyframes lgtitle{0%,100%{filter:drop-shadow(0 0 14px rgba(255,170,0,.35)) drop-shadow(2px 3px 0 #000)}50%{filter:drop-shadow(0 0 30px rgba(255,190,40,.8)) drop-shadow(2px 3px 0 #000)}}
@keyframes ldspin{to{transform:rotate(360deg)}}
#lg h1{animation:lgtitle 4s ease-in-out infinite}
#lg .leaf{position:fixed;top:0;width:12px;height:7px;border-radius:0 80% 0 80%;background:linear-gradient(135deg,#c98a2a,#6b4a12);pointer-events:none;z-index:0;opacity:0;animation:lgleaf linear infinite}
#lg .pill{display:inline-flex;align-items:center;gap:8px;margin-top:14px;padding:6px 14px;border-radius:999px;border:1px solid #5a4a2a;background:rgba(0,0,0,.45);font:600 12px system-ui,sans-serif;letter-spacing:1px;color:#d8c69a}
#lg .pill i{width:9px;height:9px;border-radius:50%;background:#c9a422;animation:lgpulse 1.2s infinite}
#lg .pill.on i{background:#3ddc6a;box-shadow:0 0 8px #3ddc6a;animation:none}#lg .pill.on{border-color:#2f7a45}
#lg .pill.off i{background:#ff4a3d;box-shadow:0 0 8px #ff4a3d}#lg .pill.off{border-color:#8a2a22;color:#ffb0a8}
#lg .feat{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin:16px auto 0;max-width:560px}
#lg .feat div{flex:1 1 140px;max-width:170px;padding:10px 8px;border:1px solid rgba(255,176,0,.2);border-radius:12px;background:rgba(30,25,18,.6);font-size:12px;color:#bfa874}
#lg .feat b{display:block;font-family:Cinzel,Georgia,serif;color:#ffcf4a;font-size:14px;margin-top:3px}
#lg #lgfree{display:inline-block;width:auto;min-width:220px;margin:18px auto 0;font-size:19px;padding:14px 34px}
#ld{position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;background:#070606 radial-gradient(ellipse at 50% 30%,#2b2416,#070606 70%);color:#e8d9b0;font-family:Georgia,serif;transition:opacity .7s;padding:20px;text-align:center}
#ld.out{opacity:0;pointer-events:none}
#ld .crest{width:96px;height:96px;border-radius:50%;border:3px solid #c08a1a;display:flex;align-items:center;justify-content:center;font:900 46px Cinzel,Georgia,serif;color:#ffcf4a;background:radial-gradient(#3a2f1f,#120f0b);box-shadow:0 0 30px rgba(255,170,0,.4);position:relative}
#ld .crest::after{content:'';position:absolute;inset:-9px;border-radius:50%;border:2px dashed rgba(255,176,0,.45);animation:ldspin 9s linear infinite}
#ld h2{font-family:Cinzel,Georgia,serif;color:#ffb000;letter-spacing:4px;margin:0;font-size:26px}
#ld .bar{width:min(320px,80vw);height:10px;border-radius:6px;background:#1a1510;border:1px solid #5a4a2a;overflow:hidden}
#ld .bar i{display:block;height:100%;width:3%;background:linear-gradient(90deg,#b87400,#ffd54d);box-shadow:0 0 12px #ffb000;transition:width .4s}
#ld ul{list-style:none;padding:0;margin:0;font-size:14px;text-align:left}
#ld li{margin:5px 0;color:#7d6b47}#ld li::before{content:'○ ';color:#7d6b47}
#ld li.go{color:#ffcf4a}#ld li.go::before{content:'◌ ';animation:lgpulse 1s infinite}
#ld li.ok{color:#9fe0a8}#ld li.ok::before{content:'✓ ';color:#3ddc6a}
#ld li.bad{color:#ff8a80}#ld li.bad::before{content:'✕ ';color:#ff4a3d}
#ld .err{color:#ff8a80;max-width:320px;font-size:14px}
#ld button{min-height:44px;padding:10px 26px;border-radius:12px;border:1px solid #6b4500;background:linear-gradient(#ffd54d,#e09200);font:900 15px Cinzel,Georgia,serif;cursor:pointer;margin:0 5px}
#ld button.g{background:transparent;color:#ffcf4a;border-color:#c08a1a}
@media (prefers-reduced-motion:reduce){#ld *,#lg .leaf{animation:none!important}}`;const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);const st43=document.createElement('style');st43.textContent=css43;document.head.appendChild(st43);
if(!document.querySelector('link[href*="Cinzel"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@600;900&display=swap';document.head.appendChild(l)}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const el=document.createElement('div');el.id='lg';
async function api(path,opt={}){const h={'Content-Type':'application/json'};const t=opt.tok||LS.get('bwl.token');if(t)h.Authorization='Bearer '+t;
 let r,le;for(let n=1;n<=3;n++){const c=new AbortController(),tt=setTimeout(()=>c.abort(),15000);try{if(n>1&&opt.onTry)opt.onTry(n);r=await fetch(path,{method:opt.m||'GET',headers:h,body:opt.b?JSON.stringify(opt.b):undefined,signal:c.signal,cache:'no-store'});clearTimeout(tt);if(r.status<500)break}catch(e){clearTimeout(tt);le=e;r=null}if(n<3)await new Promise(k=>setTimeout(k,900*n))}
 if(!r){const e=new Error("Can't reach the server (tried 3 times). Check Wi-Fi or cellular, then tap Login again.");e.status=0;throw e}let j={};try{j=await r.json()}catch(e){}if(!r.ok){const e=new Error(j.message||('Error '+r.status));e.status=r.status;throw e}return j}

async function health(){try{const c=new AbortController(),t=setTimeout(()=>c.abort(),6000);const r=await fetch('/health?ts='+Date.now(),{cache:'no-store',signal:c.signal});clearTimeout(t);if(!r.ok)return false;const j=await r.json().catch(()=>({}));return j.ok!==false}catch(e){return false}}
let pillT=0;async function pill(){const p=el.querySelector('#lgpill');if(!p)return;p.className='pill';p.lastChild.textContent='Checking game server…';const ok=await health();const q=el.querySelector('#lgpill');if(!q)return;q.className='pill '+(ok?'on':'off');q.lastChild.textContent=ok?'Game server online':'Game server offline · retrying…';clearTimeout(pillT);if(!ok)pillT=setTimeout(pill,5000)}
const LD={el:null,pct:0,
 show(){if(this.el)this.el.remove();const d=document.createElement('div');d.id='ld';d.innerHTML='<div class=crest>B</div><h2>BRAMBLEWICK</h2><div class=bar><i></i></div><ul><li id=ld1>Connecting to game server…</li><li id=ld2>Loading world…</li><li id=ld3>Loading your adventurer…</li></ul><div class=err></div><div class=btns></div>';document.body.appendChild(d);this.el=d;this.pct=0;this.set(3)},
 set(p){this.pct=Math.max(this.pct,p);const i=this.el&&this.el.querySelector('.bar i');if(i)i.style.width=this.pct+'%'},
 step(n,c){const l=this.el&&this.el.querySelector('#ld'+n);if(l)l.className=c},
 fail(msg,retry,back){if(!this.el)return;this.el.querySelector('.err').textContent=msg;const b=this.el.querySelector('.btns');b.innerHTML='<button>&#8635; Retry</button><button class=g>Back</button>';b.children[0].onclick=retry;b.children[1].onclick=back},
 hide(){const d=this.el;if(!d)return;this.el=null;this.set(100);d.classList.add('out');setTimeout(()=>d.remove(),800)}};
function watchWorld(){const need=['world.json','terrain.bin','models.bin'],got=new Set();const of=window.fetch;let done=false;
 const fin=()=>{if(done)return;done=true;window.fetch=of;LD.step(2,'ok');LD.set(95);requestAnimationFrame(()=>requestAnimationFrame(()=>setTimeout(()=>LD.hide(),500)))};
 window.fetch=function(u){const p=of.apply(this,arguments);try{const s=String(u&&u.url||u);const k=need.find(n=>s.indexOf(n)>=0);if(k){p.then(()=>{got.add(k);LD.set(55+got.size*13);if(got.size>=need.length)fin()},()=>{})}}catch(e){}return p};
 setTimeout(()=>{if(!done){done=true;if(window.fetch!==of)window.fetch=of;LD.step(2,'bad');LD.fail('World files are taking too long to load. Check your connection and tap Retry.',()=>location.reload(),()=>{LD.hide();render()})}},45000)}
let started=false;
async function start(acct){if(started)return;started=true;
 LD.show();LD.step(1,'go');
 if(!(await health())){LD.step(1,'bad');LD.fail("The game server isn't answering right now. Check your connection and try again.",()=>{started=false;start(acct)},()=>{started=false;LD.hide();render();});return}
 LD.step(1,'ok');LD.set(25);LD.step(3,'go');
 if(acct){try{const s=await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Object.assign(new Error('Save load timed out'),{status:408})),7000);api('/api/osrs/save').then(v=>{clearTimeout(t);resolve(v)},e=>{clearTimeout(t);reject(e)})});let local=null;try{local=JSON.parse(LS.get('om.save.v3')||'null')}catch(e){}
   if(s.data&&s.data.v===1)LS.set('om.save.v3',JSON.stringify(s.data));
   else if(!(local&&(!local.acct||local.acct===acct)))LS.set('om.save.v3',null); // never carry another account's progress over
  }catch(e){if(e.status===401){LS.set('bwl.token',null);LS.set('bwl.user',null);started=false;LD.hide();render('Your session expired. Please log in again.');return}}
  window.__ACCT={name:acct}}
 else{window.__ACCT=null;try{const l=JSON.parse(LS.get('om.save.v3')||'null');if(l&&l.acct)LS.set('om.save.v3',null)}catch(e){}}
  LD.step(3,'ok');LD.set(45);LD.step(2,'go');el.remove();clearTimeout(pillT);watchWorld();import('./om74.js?v='+V).catch(()=>{LD.step(2,'bad');LD.fail('The game failed to load. Tap Retry to reload.',()=>location.reload(),()=>location.reload())})}
function render(msg,ok){const user=LS.get('bwl.user'),tok=LS.get('bwl.token');
 el.innerHTML=`<i class=leaf style="left:12%;animation-duration:14s;animation-delay:-2s"></i><i class=leaf style="left:30%;animation-duration:18s;animation-delay:-9s"></i><i class=leaf style="left:48%;animation-duration:16s;animation-delay:-5s"></i><i class=leaf style="left:66%;animation-duration:20s;animation-delay:-12s"></i><i class=leaf style="left:82%;animation-duration:15s;animation-delay:-7s"></i><i class=leaf style="left:95%;animation-duration:19s;animation-delay:-3s"></i><div class=hero><h1>BRAMBLEWICK</h1><p>Wander the briars. Carve your legend.</p><div class=pill id=lgpill><i></i><span>Checking game server…</span></div><div class=feat><div>&#128506;&#65039;<b>Open map</b>Roam towns, woods &amp; caves</div><div>&#9876;&#65039;<b>Combat</b>Styles, prayers &amp; specials</div><div>&#128296;<b>Craft</b>Gather, smith &amp; cook</div></div>${tok&&user?'':'<button id=lgfree>&#9654; Play free</button>'}</div><div class=wrap>
 ${tok&&user?`<div class=card><h2>Welcome back, adventurer</h2><p>Playing as <b style="color:#ffb000">${esc(user)}</b>.</p><button id=lgplay>&#9654; Play free</button><button class=g id=lgsw>Switch account</button></div>`:''}
 <form class=card id=lgin><h2>Log in</h2><div class="msg ${msg?(ok?'ok':'e'):''}">${esc(msg||'')}</div>
 <label>Adventurer name</label><input name=u maxlength=12 autocomplete=username autocapitalize=none required>
 <label>Password</label><input name=p type=password maxlength=128 autocomplete=current-password required>
 <button>Log in &amp; play</button><button type=button class=g id=lgguest>Play as guest</button><small style="display:block;color:#9c8a62">Guest progress stays on this device only.</small></form>
 <form class=card id=lgreg><h2>Name your adventurer</h2><div class=msg id=regmsg></div>
 <label>Adventurer name <small style="color:#9c8a62">(3&ndash;12 letters, numbers, spaces, _ or -)</small></label><input name=u maxlength=12 pattern="[A-Za-z0-9 _-]{3,12}" placeholder="e.g. Briarthorn" autocomplete=username autocapitalize=none required>
 <label>Password (8+ characters)</label><input name=p type=password minlength=8 maxlength=128 autocomplete=new-password required>
 <label>Confirm password</label><input name=c type=password minlength=8 maxlength=128 autocomplete=new-password required>
 <button>&#10022; Create free account</button></form></div><footer>Your progress saves to your account automatically.</footer>`;
 const q=s=>el.querySelector(s);pill();
 if(q('#lgfree'))q('#lgfree').onclick=()=>{const r=q('#lgreg');r.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>r.u.focus(),350)};
 if(q('#lgguest'))q('#lgguest').onclick=()=>start(null);
 if(/register/.test(location.hash)||/[?&]register=1/.test(location.search)){setTimeout(()=>{const r=q('#lgreg');if(r){r.scrollIntoView({behavior:'smooth',block:'center'});r.u.focus()}},60)}
 if(q('#lgplay'))q('#lgplay').onclick=()=>start(user);
 if(q('#lgsw'))q('#lgsw').onclick=async()=>{try{await api('/api/logout',{m:'POST'})}catch(e){}LS.set('bwl.token',null);LS.set('bwl.user',null);render()};
 {const lu=LS.get('m.lastUser')||LS.get('bwl.user');if(lu)q('#lgin').u.value=lu}
 q('#lgin').onsubmit=async e=>{e.preventDefault();const f=e.target;const b=f.querySelector('button');b.disabled=true;b.textContent='Entering the realm…';LS.set('m.lastUser',f.u.value.trim());
  try{const j=await api('/api/login',{m:'POST',b:{username:f.u.value.trim(),password:f.p.value},tok:'-',onTry:n=>{b.textContent='Logging in… (try '+n+' of 3)'}});LS.set('bwl.token',j.token);LS.set('bwl.user',j.username);start(j.username)}
  catch(err){b.disabled=false;b.innerHTML='Log in &amp; play';const m=f.querySelector('.msg');m.className='msg e';m.textContent=err.status===401?'Wrong adventurer name or password.':(err.message||'Login failed');}};
 q('#lgreg').onsubmit=async e=>{e.preventDefault();const f=e.target,m=q('#regmsg');if(f.p.value!==f.c.value){m.className='msg e';m.textContent='Those passwords don\u2019t match — try again.';return}
  const b=f.querySelector('button');b.disabled=true;b.textContent='Forging your adventurer…';
  try{const j=await api('/api/register',{m:'POST',b:{username:f.u.value.trim(),password:f.p.value},tok:'-'});LS.set('bwl.token',j.token);LS.set('bwl.user',j.username);LS.set('om.save.v3',null);start(j.username)}
  catch(err){b.disabled=false;b.innerHTML='&#10022; Create free account';m.className='msg e';m.textContent=/taken|exist/i.test(String(err.message))?'That adventurer name is taken — pick another.':err.message}};
}
const go=()=>{document.body.appendChild(el);const qs=new URLSearchParams(location.search),user=LS.get('bwl.user'),token=LS.get('bwl.token');if(qs.has('guest')||(!qs.has('login')&&!qs.has('register')&&!(user&&token))){start(null);return}if(!qs.has('login')&&!qs.has('register')&&user&&token){start(user);return}render()};document.body?go():addEventListener('DOMContentLoaded',go);
})();
