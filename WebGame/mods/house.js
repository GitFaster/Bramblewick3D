/* Bramblewick mod: house.js */
(function(){try{
function bwUI(id,icon,title){var bar=document.getElementById('bwModBar');if(!bar){bar=document.createElement('div');bar.id='bwModBar';bar.style.cssText='position:fixed;left:8px;top:64px;max-height:calc(50% - 74px);z-index:9000;display:grid;grid-auto-flow:column;grid-template-rows:repeat(auto-fill,44px);gap:5px;overflow:hidden';(document.body||document.documentElement).appendChild(bar)}
 if(!document.getElementById('bwModCss')){var c=document.createElement('style');c.id='bwModCss';c.textContent='.bwmb{width:44px;height:44px;border-radius:8px;border:2px solid #3e3529;background:#5a4c39;color:#ff0;font-size:21px;touch-action:manipulation;padding:0}.bwmp{position:fixed;left:58px;top:10%;z-index:9001;width:min(340px,82vw);max-height:74vh;overflow:auto;background:#3e3529;border:3px solid #2a241b;color:#ff981f;font:13px sans-serif;padding:8px;border-radius:6px;display:none;-webkit-overflow-scrolling:touch}.bwmp h3{margin:0 0 6px;color:#ff0}.bwmp .r{padding:6px;margin:3px 0;background:#4b4032;border-radius:4px}.bwmp small{color:#ddd;display:block}.bwmp .ok{color:#0f0}.bwmp .no{color:#f55}.bwmp button{min-height:44px;min-width:44px;background:#2a241b;color:#ff981f;border:1px solid #000;padding:6px 10px;border-radius:4px;margin:3px}';document.head.appendChild(c)}
 var b=document.createElement('button');b.className='bwmb';b.textContent=icon;b.title=title;var p=document.createElement('div');p.className='bwmp';p.id=id;
 var api={btn:b,panel:p,open:false,render:function(){},toggle:function(v){api.open=v===undefined?!api.open:v;document.querySelectorAll('.bwmp').forEach(function(x){if(x!==p)x.style.display='none'});p.style.display=api.open?'block':'none';if(api.open)api.render()}};
 b.addEventListener('click',function(e){e.stopPropagation();api.toggle()});
 ['touchstart','pointerdown','mousedown','click'].forEach(function(t){p.addEventListener(t,function(e){e.stopPropagation()},{passive:true});if(t!=='click')b.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
 bar.appendChild(b);(document.body||document.documentElement).appendChild(p);return api}
function bwSay(t,c){try{typeof window.msg==='function'&&window.msg(t,c||'g')}catch(_){}}
function bwPl(){return window.__bw&&window.__bw.Pl}
function bwGive(id,n){try{return typeof window.addItem==='function'?window.addItem(id,n):0}catch(_){return 0}}
function bwLoad(k,d){try{return JSON.parse(localStorage.getItem(k)||'null')||d}catch(_){return d}}
function bwSave(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}
function bwHook(name,after){var E=window.BWEv;if(!E)return false;var map={addXp:'xp',kill:'kill',levelUp:'level',addItem:'item'};var ev=map[name];if(!ev)return false;E.on(ev,function(){try{after.apply(null,[null].concat([].slice.call(arguments)))}catch(_){}});return true}
function bwSfx(n){try{window.BWAudio&&BWAudio.sfx(n)}catch(_){}}
function bwPop(t,b){try{window.BWLevelUp&&BWLevelUp.show(t,b)}catch(_){}}
if(window.BWHouse)return;
var R=[{k:'portal',n:'Portal chamber',e:'🌀',cost:5000,d:'Set a teleport spot and return to it anytime.'},{k:'altar',n:'Gilded altar',e:'⛪',cost:12000,d:'Restore all prayer points.'},{k:'pool',n:'Rejuvenation pool',e:'💧',cost:20000,d:'Restore HP, prayer and run energy.'},{k:'buff',n:'Training room',e:'🏋️',cost:30000,d:'+10% XP for 10 minutes (once per 30 min).'},{k:'garden',n:'Superior garden',e:'🌳',cost:8000,d:'+1 supercompost every visit (5 min cooldown).'}];
var S=bwLoad('bw_poh_v1',{own:{},spot:null,cd:{}});function sv(){bwSave('bw_poh_v1',S)}var buffT=0;
if(window.BWEv)BWEv.xpMult(function(s,a){return Date.now()<buffT?a*1.1:a});
function coins(){return window.invCount?invCount('coins'):0}function pay(n){var P=bwPl(),t=0;P.inv.forEach(function(x,i){if(x&&x.id==='coins'&&t<n){var q=Math.min(x.n,n-t);x.n-=q;t+=q;if(!x.n)P.inv[i]=null}})}
function cd(k,ms){var n=Date.now();if(S.cd[k]&&n-S.cd[k]<ms){bwSay('Ready in '+Math.ceil((ms-(n-S.cd[k]))/60000)+' min.');return false}S.cd[k]=n;sv();return true}
function use(k){var P=bwPl();if(!S.own[k]){var r=R.find(function(x){return x.k===k});if(coins()<r.cost){bwSay('You need '+r.cost.toLocaleString()+' coins to build that.');return}pay(r.cost);S.own[k]=1;sv();bwSay('You build a '+r.n+'!','b');bwSfx('quest');ui.render();return}
 if(k==='altar'){if(P)P.pp=window.bwLv('prayer');bwSay('You recharge your prayer at the altar.','g')}
 if(k==='pool'&&P){P.hp=window.bwLv('hitpoints');P.pp=window.bwLv('prayer');P.energy=100;bwSay('You feel rejuvenated.','g')}
 if(k==='buff'&&cd('buff',18e5)){buffT=Date.now()+6e5;bwSay('Training room: +10% XP for 10 minutes!','b')}
 if(k==='garden'&&cd('garden',3e5)){try{BWFarm.state.comp++;bwSave('bw_farm_v1',BWFarm.state)}catch(_){}bwSay('You collect a bucket of supercompost.','g')}
 bwSfx('drop');ui.render()}
function tele(){if(!S.own.portal)return;if(!S.spot){bwSay('Set a portal spot first.');return}if(window.bwTele&&bwTele(S.spot[0],S.spot[1]))bwSay('You teleport through your house portal.','g');bwSfx('levelup')}
if(window.BWEv)BWEv.cmd('home',tele);
var ui=bwUI('bwPohP','🏠','Player-owned house');
ui.render=function(){var h='<h3>Your house</h3><small>Coins: '+coins().toLocaleString()+(Date.now()<buffT?' · <span class="ok">+10% XP active</span>':'')+'</small>';R.forEach(function(r){var o=S.own[r.k];h+='<div class="r">'+r.e+' <b class="'+(o?'ok':'')+'">'+r.n+'</b><small>'+r.d+'</small><button data-u="'+r.k+'">'+(o?'Use':'Build '+r.cost.toLocaleString()+' gp')+'</button>'+(o&&r.k==='portal'?'<button data-s="1">📍 Set spot here</button><button data-t="1">Teleport (::home)</button>':'')+'</div>'});ui.panel.innerHTML=h};
ui.panel.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('button');if(!b)return;var u=b.getAttribute('data-u');if(u&&!(u==='portal'&&S.own.portal))use(u);if(b.getAttribute('data-s')){var P=bwPl();if(P){S.spot=[P.x,P.y];sv();bwSay('Portal spot set.')}}if(b.getAttribute('data-t'))tele()});
window.BWHouse={state:S};
}catch(e){try{console.warn('[mods/house.js] failed',e)}catch(_){}}})();
