// Bramblewick login / register screen (Bramblewick account screen). Accounts are the
// existing bramblewick-link accounts (Argon2 on the server); the game state is saved per account at /api/osrs/save.
(function(){
const V=(document.currentScript.src.match(/v=(\d+)/)||[])[1]||'0';
const LS={get:k=>{try{return localStorage.getItem(k)}catch(e){return null}},set:(k,v)=>{try{v==null?localStorage.removeItem(k):localStorage.setItem(k,v)}catch(e){}}};
const css=`
#lg{--cream:#fff8ef;--gold:#e7b34d;--moss:#6f9a62;--ink:#3a3150;--lavender:#c9b7e2;position:fixed;inset:0;z-index:9999;overflow:auto;-webkit-overflow-scrolling:touch;color:var(--ink);font-family:Georgia,"Iowan Old Style",Palatino,serif;
 padding:max(28px,env(safe-area-inset-top)) max(18px,env(safe-area-inset-right)) max(28px,env(safe-area-inset-bottom)) max(18px,env(safe-area-inset-left));
 background:
  radial-gradient(520px 220px at 18% 8%,rgba(255,248,239,.7),transparent 70%),
  radial-gradient(640px 280px at 88% 0%,rgba(201,183,226,.85),transparent 62%),
  radial-gradient(800px 360px at 50% 120%,#d7e7c8 0%,transparent 60%),
  linear-gradient(180deg,#f4e9ff 0%,#efe4f6 38%,#e7f0df 100%)}
#lg *{box-sizing:border-box}
#lg .hero{text-align:center;max-width:460px;margin:0 auto 6px}
#lg .mark{width:76px;height:76px;margin:0 auto 14px;border-radius:28px;display:grid;place-items:center;background:#fffaf3;border:1px solid #e7d3a4;box-shadow:0 10px 24px rgba(90,70,120,.12)}
#lg .mark svg{display:block}
#lg h1{margin:0;font-size:clamp(42px,7vw,60px);font-weight:700;letter-spacing:.02em;line-height:1;color:#3a3150}
#lg .tag{margin:12px 0 0;font:500 16px/1.45 Georgia,serif;letter-spacing:.01em;color:#5d6b52}
#lg .pill{display:inline-flex;align-items:center;gap:8px;margin:16px 0 0;padding:8px 14px;border-radius:999px;border:1px solid #e4d3ae;background:#fffaf3cc;font:600 13px/1.3 system-ui,sans-serif;color:#4d4460}
#lg .pill i{width:9px;height:9px;border-radius:50%;background:#e7b34d}
#lg .pill.on{border-color:#8fbf7a}#lg .pill.on i{background:#6f9a62}
#lg .pill.off{border-color:#e3b0b0;color:#7a3e48}#lg .pill.off i{background:#d26b6b}
#lg .stage{max-width:440px;margin:22px auto 0}
#lg [data-panel]{display:none}
#lg[data-view="welcome"] [data-panel="welcome"],#lg[data-view="login"] [data-panel="login"],#lg[data-view="register"] [data-panel="register"]{display:block}
#lg .card{background:#fffaf3;border:1px solid #ead9b4;border-radius:28px;padding:26px 22px 18px;box-shadow:0 16px 40px rgba(74,58,110,.12)}
#lg h2{margin:2px 0 8px;font-size:30px;font-weight:700;color:#3a3150}
#lg .lead{margin:0 0 18px;font:16px/1.5 system-ui,sans-serif;color:#5c5470}
#lg label{display:block;margin:14px 0 6px;font:700 14px/1.3 system-ui,sans-serif;color:#3a3150}
#lg .help{margin:4px 0 2px;font:14px/1.45 system-ui,sans-serif;color:#5f6a58}
#lg input{width:100%;min-height:48px;margin:0;padding:12px 14px;border-radius:16px;border:1px solid #e3d2ae;background:#fff;color:#2c2640;font:16px/1.3 system-ui,sans-serif}
#lg input:focus{outline:3px solid #c9b7e2;outline-offset:2px;border-color:#b79ad4}
#lg button{display:block;width:100%;min-height:48px;margin:12px 0 0;padding:12px 16px;border-radius:999px;border:0;background:linear-gradient(#ffe7ad,#e7b34d);color:#3a2a12;font:700 16px/1.2 system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 0 #c8922e}
#lg button.g,#lg button.back{background:#fff;color:#3f5d42;border:1.5px solid #b7d3ae;box-shadow:none}
#lg button:focus-visible{outline:3px solid #7d6aa8;outline-offset:3px}
#lg button:disabled{opacity:.6;cursor:default}
#lg .msg{min-height:0;margin:10px 0 0;padding:0;border-radius:14px;font:15px/1.4 system-ui,sans-serif;display:none}
#lg .msg.e,#lg .msg.ok{display:block;padding:10px 12px}
#lg .msg.e{color:#6d2430;background:#ffe4e2;border:1px solid #e7b0aa}
#lg .msg.ok{color:#1d4a32;background:#e5f6ea;border:1px solid #b7d3ae}
#ld{position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;padding:24px;text-align:center;color:#3a3150;font-family:Georgia,serif;background:linear-gradient(180deg,#f4e9ff,#e7f0df)}
#ld .crest{width:76px;height:76px;border-radius:28px;display:grid;place-items:center;background:#fffaf3;border:1px solid #ead9b4;color:#3a3150;font:700 28px Georgia,serif}
#ld h2{margin:0;letter-spacing:.08em;font-size:22px;color:#3a3150}
#ld .bar{width:min(320px,86vw);height:12px;border-radius:999px;background:#fff;border:1px solid #ead9b4;overflow:hidden}
#ld .bar i{display:block;height:100%;width:4%;background:linear-gradient(90deg,#8fbf7a,#e7b34d)}
#ld ul{list-style:none;margin:0;padding:0;text-align:left;font:15px/1.5 system-ui,sans-serif}
#ld li{color:#5c5470}#ld li.go{color:#8a6230}#ld li.ok{color:#2f6a45}#ld li.bad{color:#8a3040}
#ld .err{max-width:340px;color:#6d2430;font:15px/1.4 system-ui,sans-serif}
#ld button{min-height:48px;min-width:120px;margin:4px;padding:10px 18px;border-radius:999px;border:0;background:linear-gradient(#ffe7ad,#e7b34d);color:#3a2a12;font:700 16px system-ui,sans-serif}
#ld button.g{background:#fff;color:#3f5d42;border:1.5px solid #b7d3ae}
#ld.out{opacity:0;transition:opacity .4s}
@media (min-width:800px){#lg .card{padding:28px 28px 20px}#lg h1{font-size:68px}}
@media (max-width:380px){#lg h1{font-size:34px;letter-spacing:.04em}#lg .card{padding:18px 14px}}
@media (prefers-reduced-motion:reduce){#lg *,#ld,#ld *{animation:none!important;transition:none!important;scroll-behavior:auto!important}}
`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
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
function watchWorld(){const need=['world80.json','terrain80.bin'],got=new Set();const of=window.fetch;let done=false;
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
  LD.step(3,'ok');LD.set(45);LD.step(2,'go');el.remove();clearTimeout(pillT);watchWorld();import('./om82.js?v=87').catch(()=>{LD.step(2,'bad');LD.fail('The game failed to load. Tap Retry to reload.',()=>location.reload(),()=>location.reload())})}
function showView(name){el.dataset.view=name;const panel=el.querySelector('[data-panel="'+name+'"]');const focus=panel&&panel.querySelector('input,button');if(focus)setTimeout(()=>focus.focus(),30)}
function render(msg,ok){const user=LS.get('bwl.user'),tok=LS.get('bwl.token');
 const signed=!!(tok&&user);
 el.innerHTML=`<div class=hero><div class=mark aria-hidden=true><svg viewBox="0 0 64 64" width="42" height="42"><path fill="#7eaa6c" d="M34 52C24 36 28 20 46 12 42 30 36 42 18 50c8 2 12 2 16 2z"/><path fill="none" stroke="#fffaf3" stroke-width="2.2" d="M30 48c6-8 8-18 8-30"/></svg></div><h1>Bramblewick</h1><p class=tag>Briarhaven — a world of little wonders</p><p id=lgpill class=pill role=status><i aria-hidden=true></i><span>Checking game server…</span></p></div>
 <div class=stage>
 <section class=card data-panel=welcome id=lgwelcome aria-labelledby=lg-welcome-title>
  <h2 id=lg-welcome-title>${signed?'Welcome back':'Welcome'}</h2>
  <p class=lead>${signed?'Signed in as <b>'+esc(user)+'</b>. Continue with this adventurer, or enter as a guest on this device.':'One clear way in. Play on this device as a guest, or open a separate screen to sign in or create an account.'}</p>
  ${signed?'<button type=button id=lgplay>Play</button><button type=button class=g id=lgsw>Switch account</button>':''}
  <button type=button id=lgguest class=${signed?'g':''}>Play as guest</button>
  <p class=help>Guest progress stays on this device only. It is not kept on an account.</p>
  ${signed?'':'<button type=button class=g data-viewto=login>Sign in</button><button type=button class=g data-viewto=register>Create an account</button>'}
 </section>
 <form class=card data-panel=login id=lgin aria-labelledby=lg-login-title>
  <button type=button class="back g" data-viewto=welcome>Back</button>
  <h2 id=lg-login-title>Sign in</h2>
  <p class=lead>Use the Bramblewick account you already have. The same name works on this device and another.</p>
  <div class="msg ${msg?(ok?'ok':'e'):''}" role=alert>${esc(msg||'')}</div>
  <label for=lg-user>Username</label>
  <input id=lg-user name=u maxlength=12 autocomplete=username autocapitalize=none required aria-describedby=lg-user-help>
  <p class=help id=lg-user-help>3–12 letters, numbers, spaces, _ or -.</p>
  <label for=lg-pass>Password</label>
  <input id=lg-pass name=p type=password maxlength=128 autocomplete=current-password required>
  <button type=submit>Log in &amp; play</button>
  <button type=button class=g data-viewto=register>Create an account instead</button>
 </form>
 <form class=card data-panel=register id=lgreg aria-labelledby=lg-reg-title>
  <button type=button class="back g" data-viewto=welcome>Back</button>
  <h2 id=lg-reg-title>Create an account</h2>
  <p class=lead>An account keeps this adventurer’s progress when you sign in later. Guest play does not.</p>
  <div class=msg id=regmsg role=alert></div>
  <label for=lg-reg-user>Username</label>
  <input id=lg-reg-user name=u maxlength=12 pattern="[A-Za-z0-9 _-]{3,12}" autocomplete=username autocapitalize=none required aria-describedby=lg-reg-help>
  <p class=help id=lg-reg-help>3–12 letters, numbers, spaces, _ or -.</p>
  <label for=lg-reg-pass>Password</label>
  <input id=lg-reg-pass name=p type=password minlength=8 maxlength=128 autocomplete=new-password required aria-describedby=lg-pass-help>
  <p class=help id=lg-pass-help>At least 8 characters.</p>
  <label for=lg-reg-confirm>Confirm password</label>
  <input id=lg-reg-confirm name=c type=password minlength=8 maxlength=128 autocomplete=new-password required>
  <button type=submit>Create account &amp; play</button>
  <button type=button class=g data-viewto=login>I already have an account</button>
 </form>
 </div>`;
 const q=s=>el.querySelector(s);
 function openView(name){showView(name)}
 el.querySelectorAll('[data-viewto]').forEach(b=>b.addEventListener('click',()=>openView(b.dataset.viewto)));
 pill();
 if(q('#lgguest'))q('#lgguest').onclick=()=>start(null);
 if(q('#lgplay'))q('#lgplay').onclick=()=>{if(tok&&user)start(user)};
 if(q('#lgsw'))q('#lgsw').onclick=async()=>{try{await api('/api/logout',{m:'POST'})}catch(e){}LS.set('bwl.token',null);LS.set('bwl.user',null);render()};
 {const lu=LS.get('m.lastUser')||LS.get('bwl.user');if(lu)q('#lgin').u.value=lu}
 const submit=f=>f.querySelector('button[type="submit"]');
 q('#lgin').onsubmit=async e=>{e.preventDefault();const f=e.target;const b=submit(f);b.disabled=true;b.textContent='Signing in…';LS.set('m.lastUser',f.u.value.trim());
  try{const j=await api('/api/login',{m:'POST',b:{username:f.u.value.trim(),password:f.p.value},tok:'-',onTry:n=>{b.textContent='Signing in… (try '+n+' of 3)'}});LS.set('bwl.token',j.token);LS.set('bwl.user',j.username);start(j.username)}
  catch(err){b.disabled=false;b.textContent='Log in & play';const m=f.querySelector('.msg');m.className='msg e';m.textContent=err.status===401?'Wrong adventurer name or password.':(err.message||'Login failed');openView('login')}};
 q('#lgreg').onsubmit=async e=>{e.preventDefault();const f=e.target,m=q('#regmsg');if(f.p.value!==f.c.value){m.className='msg e';m.textContent='Those passwords don\u2019t match — try again.';openView('register');return}
  const b=submit(f);b.disabled=true;b.textContent='Creating your account…';
  try{const j=await api('/api/register',{m:'POST',b:{username:f.u.value.trim(),password:f.p.value},tok:'-'});LS.set('bwl.token',j.token);LS.set('bwl.user',j.username);LS.set('om.save.v3',null);start(j.username)}
  catch(err){b.disabled=false;b.textContent='Create account & play';m.className='msg e';m.textContent=/taken|exist/i.test(String(err.message))?'That adventurer name is taken — pick another.':err.message;openView('register')}};
 const want=/register/.test(location.hash)||/[?&]register=1/.test(location.search)?'register':/[?&]signin=1/.test(location.search)?'login':'welcome';
 openView(msg&&!ok?'login':want);
}
const go=()=>{document.body.appendChild(el);const qs=new URLSearchParams(location.search);if(qs.has('guest')){start(null);return}render()};document.body?go():addEventListener('DOMContentLoaded',go);
})();
