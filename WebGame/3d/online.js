/* Bramblewick 3D online mode: same account + cloud save as the 2D game (same origin, same /api endpoints,
   same localStorage keys bwl.token / bwl.user / bwl.saveVersion). Local save (bramblewick-save-v2) stays the source
   the game reads; the cloud copy is pulled before the game starts and pushed every 45 s and when the page hides.
   Passwords are only sent to /api/login or /api/register and are never stored. No multiplayer world. */
(function(){'use strict';
var SAVE='bramblewick-save-v2',EXK='bramblewick-extra-v1',TOK='bwl.token',USR='bwl.user',VER='bwl.saveVersion',PLAYK='bw.playSec',GUEST='bw.guest',LBK='bw.localBackup',CBK='bw.cloudBackup';
var A={user:null,state:'offline',sent:null,busy:false,paused:false,msg:''};window.__B3online=A;
function ls(k){try{return localStorage.getItem(k)}catch(e){return null}}function lset(k,v){try{localStorage.setItem(k,v)}catch(e){}}function ldel(k){try{localStorage.removeItem(k)}catch(e){}}
function req(m,p,b,auth){var c=new AbortController(),t=setTimeout(function(){c.abort()},6000);var h={'Content-Type':'application/json'};if(auth!==false&&ls(TOK))h.Authorization='Bearer '+ls(TOK);
 return fetch(p,{method:m,headers:h,signal:c.signal,body:b===undefined?undefined:JSON.stringify(b)}).then(function(r){return r.json().catch(function(){return{}}).then(function(d){if(r.status===401&&auth!==false)ldel(TOK);d.ok=r.ok;d.status=r.status;return d})})
 .catch(function(){return{ok:false,offline:true}}).finally(function(){clearTimeout(t)})}
var canon=function(v){return Array.isArray(v)?'['+v.map(canon).join(',')+']':v&&typeof v==='object'?'{'+Object.keys(v).sort().map(function(k){return JSON.stringify(k)+':'+canon(v[k])}).join(',')+'}':JSON.stringify(v===undefined?null:v)};
var prog=function(d){return canon([d.xp,d.inv,d.bank,d.equip,d.jobs])};
function localData(){try{var d=JSON.parse(ls(SAVE));if(!(d&&d.v===2))return null;try{var x=JSON.parse(ls(EXK));if(x&&typeof x==='object')d.bwEx=x}catch(e){}return d}catch(e){return null}}
function play(){return Math.max(0,Math.floor(+ls(PLAYK)||0))}
function writeCloud(cd){var d=Object.assign({},cd),p=Number(d.bwPlay),ex=d.bwEx;delete d.bwEx;delete d.bwPlay;var prev=ls(SAVE);if(prev)lset(LBK,prev);if(p>play())lset(PLAYK,String(Math.floor(p)));lset(SAVE,JSON.stringify(d));if(ex&&typeof ex==='object')lset(EXK,JSON.stringify(ex))}
// ---- indicator
var pill;function ind(){if(!pill){pill=document.createElement('button');pill.id='bwnet';pill.setAttribute('aria-label','Online status');pill.style.cssText='position:fixed;z-index:60;left:calc(88px + env(safe-area-inset-left));top:calc(34px + env(safe-area-inset-top));max-width:36vw;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;font:600 11px system-ui,sans-serif;padding:4px 10px;min-height:26px;border-radius:15px;border:1px solid #0006;color:#fff;background:#1d2a20d0;cursor:pointer';pill.onclick=function(){sheet()};document.body.appendChild(pill)}
 var t=A.state==='online'?'● Online · '+A.user:A.state==='sync'?'⟳ Syncing…':A.state==='conflict'?'⚠ Choose a save':A.user?'○ Offline · saved here, will retry':ls(GUEST)?'Guest · saved on this device':'○ Not logged in · saved here';pill.textContent=t;pill.style.background=A.state==='online'?'#1f5a2ccc':A.state==='conflict'?'#7a4a10dd':'#2a2a2ad0';pill.title=A.msg||''}
// ---- account sheet (login / register / guest / logout)
function el(h){var d=document.createElement('div');d.innerHTML=h;return d.firstChild}
function css(){if(document.getElementById('bwnetcss'))return;var s=document.createElement('style');s.id='bwnetcss';s.textContent='#bwacct{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:#000a;padding:env(safe-area-inset-top) 12px env(safe-area-inset-bottom)}#bwacct .c{width:min(94vw,360px);background:#22301f;border:1px solid #6a5a30;border-radius:12px;padding:18px;color:#eee;font:14px system-ui,sans-serif}#bwacct h3{margin:0 0 8px;color:#f4ce7d}#bwacct input{width:100%;box-sizing:border-box;font-size:16px;padding:10px;margin:5px 0;border-radius:8px;border:1px solid #555;background:#111;color:#fff}#bwacct button,.bwab{min-height:44px;font-size:15px;padding:8px 14px;margin:4px 4px 0 0;border-radius:8px;border:1px solid #6a5a30;background:#3a4a2a;color:#fff;cursor:pointer}#bwacct .e{color:#ff9a8a;min-height:18px;font-size:13px}#bwacct .k{color:#bbb;font-size:12px}';document.head.appendChild(s)}
function sheet(after){css();var o=document.getElementById('bwacct');if(o)o.remove();
 o=el('<div id="bwacct"><div class="c"></div></div>');var c=o.firstChild;document.body.appendChild(o);
 var close=function(){o.remove();if(after)after()};
 if(A.user){c.innerHTML='<h3>Account</h3><p>Logged in as <b></b>. Your progress saves online and on this device, shared with the 2D game.</p><p class="k" id="bwst"></p><button id="bwsync">Sync now</button><button id="bwout">Log out</button><button id="bwx">Close</button>';c.querySelector('b').textContent=A.user;c.querySelector('#bwst').textContent=A.msg||'';
  c.querySelector('#bwsync').onclick=function(){push(true).then(function(){c.querySelector('#bwst').textContent=A.msg})};c.querySelector('#bwout').onclick=function(){push(true).then(function(){return req('POST','/api/logout')}).then(function(){ldel(TOK);ldel(VER);A.user=null;A.state='offline';ind();close()})};c.querySelector('#bwx').onclick=close;return}
 c.innerHTML='<h3>Play online</h3><p class="k">Use your Bramblewick account (the same one as the 2D game). Your save follows you between devices.</p><input id="bwu" autocomplete="username" placeholder="Username" maxlength="12" autocapitalize="off"><input id="bwp" type="password" autocomplete="current-password" placeholder="Password"><div class="e" id="bwe"></div><button id="bwin">Log in</button><button id="bwreg">Create account</button><button id="bwg">Play as guest</button>';
 var go=function(path){var u=c.querySelector('#bwu').value.trim(),p=c.querySelector('#bwp').value,e=c.querySelector('#bwe');if(!u||!p){e.textContent='Enter a username and password.';return}e.textContent='…';
  req('POST',path,{username:u,password:p},false).then(function(r){c.querySelector('#bwp').value='';if(!r.ok){e.textContent=r.offline?'Server unreachable. You can play as guest; progress stays on this device.':String(r.message||r.error||'Login failed');return}lset(TOK,r.token);lset(USR,r.username);ldel(GUEST);A.user=r.username;ldel(VER);pull().then(function(x){close();if(x==='reload'&&window.__B3started)location.reload()})})};
 c.querySelector('#bwin').onclick=function(){go('/api/login')};c.querySelector('#bwreg').onclick=function(){go('/api/register')};c.querySelector('#bwp').onkeydown=function(ev){if(ev.key==='Enter')go('/api/login')};
 c.querySelector('#bwg').onclick=function(){lset(GUEST,'1');A.state='offline';ind();close()}}
function choose(ld,cd,why){return new Promise(function(res){css();var o=el('<div id="bwacct"><div class="c"><h3>Which save?</h3><p class="k"></p><div id="bwcmp"></div><button id="bwcc">Use online save</button><button id="bwcl">Keep this device</button></div></div>');document.body.appendChild(o);
 var tl=function(d){if(!d||!d.xp)return 'none';var t=0;for(var k in d.xp)t+=+d.xp[k]||0;return Math.round(t).toLocaleString()+' total xp'};o.querySelector('.k').textContent=why||'Your online save and this device differ.';o.querySelector('#bwcmp').textContent='Online: '+tl(cd)+' · This device: '+tl(ld)+'. The other copy is kept as a backup.';
 o.querySelector('#bwcc').onclick=function(){o.remove();res('cloud')};o.querySelector('#bwcl').onclick=function(){o.remove();res('local')}})}
// ---- pull (before the game starts) / push
function pull(){A.state='sync';ind();return req('GET','/api/save').then(function(r){
 if(!r.ok){if(r.status===401){A.user=null;A.msg='Session expired, log in again'}A.state='offline';A.msg=r.offline?'Server unreachable, playing from this device':A.msg;ind();return}
 lset(VER,String(r.version));var cd=r.data,ld=localData();
 if(!cd){A.state='online';A.msg='No online save yet; will upload';ind();return}
 if(ld&&prog(cd)===prog(ld)){A.sent=prog(ld);A.state='online';A.msg='In sync';ind();return}
 if(!ld){writeCloud(cd);A.sent=prog(cd);A.state='online';A.msg='Loaded online save';ind();return 'reload'}
 A.state='conflict';ind();return choose(ld,cd).then(function(p){if(p==='cloud'){writeCloud(cd);A.sent=prog(cd);A.state='online';A.msg='Loaded online save';ind();return 'reload'}lset(CBK,JSON.stringify(cd));A.state='online';ind();return push(true)})})}
function push(force){if(!A.user||A.busy||A.paused)return Promise.resolve(false);try{var gm=window.B3&&window.B3.GM;if(gm&&gm.save)gm.save()}catch(e){}
 var d=localData();if(!d)return Promise.resolve(false);if(!force&&prog(d)===A.sent)return Promise.resolve(true);A.busy=true;d.bwPlay=play();
 return req('PUT','/api/save',{version:parseInt(ls(VER)||'0',10),data:d,force:!!force}).then(function(r){A.busy=false;
  if(r.ok){lset(VER,String(r.version));A.sent=prog(d);A.state='online';A.msg='Saved online '+new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});ind();return true}
  if(r.error==='conflict'){return req('GET','/api/save').then(function(c){if(!c.ok||!c.data)return false;lset(VER,String(c.version));if(prog(c.data)===prog(d)){A.sent=prog(d);return true}A.paused=true;A.state='conflict';ind();
   return choose(d,c.data,'Your online save was changed from another device or tab.').then(function(p){A.paused=false;if(p==='cloud'){writeCloud(c.data);location.reload();return false}lset(CBK,JSON.stringify(c.data));return push(true)})})}
  if(r.status===401){A.user=null;A.msg='Session expired, log in again'}A.state='offline';A.msg=A.msg||(r.offline?'Offline, will retry':String(r.message||'Cloud error'));ind();return false})}
function flush(){if(!A.user||A.paused)return;try{var gm=window.B3&&window.B3.GM;if(gm&&gm.save)gm.save()}catch(e){}var d=localData();if(!d||prog(d)===A.sent)return;d.bwPlay=play();
 try{fetch('/api/save',{method:'PUT',keepalive:true,headers:{'Content-Type':'application/json',Authorization:'Bearer '+ls(TOK)},body:JSON.stringify({version:parseInt(ls(VER)||'0',10),data:d})})}catch(e){}}
// ---- boot: validate token, pull before the game reads the local save (main.js awaits __B3sync)
window.__B3sync=new Promise(function(done){var to=setTimeout(function(){done()},9000);
 var start=function(){ind();if(!ls(TOK)){A.state='offline';ind();clearTimeout(to);done();return}
  req('GET','/api/me').then(function(me){if(!me.ok){A.state='offline';A.msg=me.offline?'Server unreachable, playing from this device':'Session expired, log in again';ind();clearTimeout(to);done();return}
   A.user=me.username||ls(USR);pull().then(function(x){clearTimeout(to);if(x==='reload'&&window.__B3started){location.reload();return}done()})})};
 if(document.body)start();else addEventListener('DOMContentLoaded',start)});
setInterval(function(){if(!document.hidden&&A.user&&window.__B3started)push(false)},45000);
addEventListener('pagehide',flush);document.addEventListener('visibilitychange',function(){if(document.hidden)flush()});
window.__B3account=function(){sheet()};
})();
