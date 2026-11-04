// Bramblewick login / register screen (styled after the Gary OSRS register page). Accounts are the
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
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
if(!document.querySelector('link[href*="Cinzel"]')){const l=document.createElement('link');l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Cinzel:wght@600;900&display=swap';document.head.appendChild(l)}
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const el=document.createElement('div');el.id='lg';
async function api(path,opt={}){const h={'Content-Type':'application/json'};const t=opt.tok||LS.get('bwl.token');if(t)h.Authorization='Bearer '+t;
 let r,le;for(let n=1;n<=3;n++){const c=new AbortController(),tt=setTimeout(()=>c.abort(),15000);try{if(n>1&&opt.onTry)opt.onTry(n);r=await fetch(path,{method:opt.m||'GET',headers:h,body:opt.b?JSON.stringify(opt.b):undefined,signal:c.signal,cache:'no-store'});clearTimeout(tt);if(r.status<500)break}catch(e){clearTimeout(tt);le=e;r=null}if(n<3)await new Promise(k=>setTimeout(k,900*n))}
 if(!r){const e=new Error("Can't reach the server (tried 3 times). Check Wi-Fi or cellular, then tap Login again.");e.status=0;throw e}let j={};try{j=await r.json()}catch(e){}if(!r.ok){const e=new Error(j.message||('Error '+r.status));e.status=r.status;throw e}return j}
let started=false;
async function start(acct){if(started)return;started=true;
 if(acct){try{const s=await api('/api/osrs/save');let local=null;try{local=JSON.parse(LS.get('om.save.v3')||'null')}catch(e){}
   if(s.data&&s.data.v===1)LS.set('om.save.v3',JSON.stringify(s.data));
   else if(!(local&&(!local.acct||local.acct===acct)))LS.set('om.save.v3',null); // never carry another account's progress over
  }catch(e){if(e.status===401){LS.set('bwl.token',null);LS.set('bwl.user',null);started=false;render('Your session expired. Please log in again.');return}}
  window.__ACCT={name:acct}}
 else{window.__ACCT=null;try{const l=JSON.parse(LS.get('om.save.v3')||'null');if(l&&l.acct)LS.set('om.save.v3',null)}catch(e){}}
 el.remove();import('./om.js?v='+V)}
function render(msg,ok){const user=LS.get('bwl.user'),tok=LS.get('bwl.token');
 el.innerHTML=`<div class=hero><h1>BRAMBLEWICK</h1><p>Lumbridge &mdash; an Old School adventure</p></div><div class=wrap>
 ${tok&&user?`<div class=card><h2>Welcome back</h2><p>Logged in as <b style="color:#ffb000">${esc(user)}</b>.</p><button id=lgplay>Play</button><button class=g id=lgsw>Switch account</button></div>`:''}
 <form class=card id=lgin><h2>Login</h2><div class="msg ${msg?(ok?'ok':'e'):''}">${esc(msg||'')}</div>
 <label>Username</label><input name=u maxlength=12 autocomplete=username autocapitalize=none required>
 <label>Password</label><input name=p type=password maxlength=128 autocomplete=current-password required>
 <button>Login</button></form>
 <form class=card id=lgreg><h2>Create Account</h2><div class=msg id=regmsg></div>
 <label>Username (3&ndash;12 letters, numbers, spaces, _ or -)</label><input name=u maxlength=12 pattern="[A-Za-z0-9 _-]{3,12}" autocomplete=username autocapitalize=none required>
 <label>Password (8+ characters)</label><input name=p type=password minlength=8 maxlength=128 autocomplete=new-password required>
 <label>Confirm password</label><input name=c type=password minlength=8 maxlength=128 autocomplete=new-password required>
 <button>Register</button></form></div><footer>Your progress saves to your account automatically.</footer>`;
 const q=s=>el.querySelector(s);
 if(q('#lgplay'))q('#lgplay').onclick=()=>start(user);
 if(q('#lgsw'))q('#lgsw').onclick=async()=>{try{await api('/api/logout',{m:'POST'})}catch(e){}LS.set('bwl.token',null);LS.set('bwl.user',null);render()};
 {const lu=LS.get('m.lastUser')||LS.get('bwl.user');if(lu)q('#lgin').u.value=lu}
 q('#lgin').onsubmit=async e=>{e.preventDefault();const f=e.target;const b=f.querySelector('button');b.disabled=true;b.textContent='Logging in…';LS.set('m.lastUser',f.u.value.trim());
  try{const j=await api('/api/login',{m:'POST',b:{username:f.u.value.trim(),password:f.p.value},tok:'-',onTry:n=>{b.textContent='Logging in… (try '+n+' of 3)'}});LS.set('bwl.token',j.token);LS.set('bwl.user',j.username);start(j.username)}
  catch(err){b.disabled=false;b.textContent='Login';const m=f.querySelector('.msg');m.className='msg e';if(err.status!==401){m.textContent=err.message;return}
   m.innerHTML='No Bramblewick account matches. Using your OSRS client account? <button type=button id=lglink style="margin-top:6px;width:100%">Use my OSRS client login</button><small style="display:block;margin-top:4px">Makes your Bramblewick account with the same username and password, in one tap.</small>';
   q('#lglink').onclick=async()=>{const lb=q('#lglink');lb.disabled=true;lb.textContent='Linking…';
    try{const j=await api('/api/register',{m:'POST',b:{username:f.u.value.trim(),password:f.p.value},tok:'-'});LS.set('bwl.token',j.token);LS.set('bwl.user',j.username);LS.set('om.save.v3',null);start(j.username)}
    catch(e2){lb.disabled=false;lb.textContent='Use my OSRS client login';m.className='msg e';const t=String(e2.message||'');m.textContent=/taken|exist/i.test(t)?'That username already has a Bramblewick account with a different password. Check the password, or pick another username.':t}}}};
 q('#lgreg').onsubmit=async e=>{e.preventDefault();const f=e.target,m=q('#regmsg');if(f.p.value!==f.c.value){m.className='msg e';m.textContent='Passwords do not match.';return}
  const b=f.querySelector('button');b.disabled=true;b.textContent='Creating…';
  try{const j=await api('/api/register',{m:'POST',b:{username:f.u.value.trim(),password:f.p.value},tok:'-'});LS.set('bwl.token',j.token);LS.set('bwl.user',j.username);LS.set('om.save.v3',null);start(j.username)}
  catch(err){b.disabled=false;b.textContent='Register';m.className='msg e';m.textContent=err.message}};
}
const go=()=>{document.body.appendChild(el);render()};document.body?go():addEventListener('DOMContentLoaded',go);
})();
