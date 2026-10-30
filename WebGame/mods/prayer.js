/* Bramblewick mod: prayer.js */
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
if(window.BWPrayer)return;
var PR=[{k:'pmelee',n:'Protect from Melee',e:'⚔️',lvl:43,d:3,ov:1},{k:'pmissile',n:'Protect from Missiles',e:'🏹',lvl:40,d:3,ov:1},{k:'pmagic',n:'Protect from Magic',e:'🔮',lvl:37,d:3,ov:1},{k:'eagle',n:'Eagle Eye',e:'🦅',lvl:44,d:4,game:['eye']},{k:'chiv',n:'Chivalry',e:'🛡️',lvl:60,d:6,game:['eye','bull2','skin2']},{k:'piety',n:'Piety',e:'✝️',lvl:70,d:8,game:['eye','bull2','skin2']}];
var on={};function P(){return bwPl()}
function style(){try{var b=window.__bw,Pl=P(),best=null,bd=99;(b.npcs||[]).forEach(function(n){if(n.dead)return;var d=Math.max(Math.abs(n.x-Pl.x),Math.abs(n.y-Pl.y));if(d<bd){bd=d;best=n}});if(!best||bd>10)return'melee';var dd=best.d||{};return dd.magic||/wizard|mage|shaman/i.test(dd.name||'')?'magic':dd.ranged||/archer|ranger|skeleton/i.test(dd.name||'')?'missile':'melee'}catch(_){return'melee'}}
function setGame(){try{var Pl=P();if(!Pl||!Pl.pray)return;var want={};PR.forEach(function(p){if(on[p.k]&&p.game)p.game.forEach(function(g){want[g]=1})});(setGame.prev||[]).forEach(function(g){if(!want[g]&&Pl.pray.__mod&&Pl.pray.__mod[g])delete Pl.pray[g]});Pl.pray.__mod=Pl.pray.__mod||{};Object.keys(want).forEach(function(g){if(!Pl.pray[g]){Pl.pray[g]=true;Pl.pray.__mod[g]=1}});setGame.prev=Object.keys(want)}catch(_){}}
function toggle(k){var p=PR.find(function(x){return x.k===k});if(!p)return;var Pl=P();if(!on[k]){if(window.bwLv('prayer')<p.lvl){bwSay('You need a Prayer level of '+p.lvl+' to use '+p.n+'.');return}if(Pl&&Pl.pp!=null&&Pl.pp<=0){bwSay('You have run out of prayer points.');return}if(p.ov)PR.forEach(function(x){if(x.ov)on[x.k]=false});if(p.game)PR.forEach(function(x){if(x.game)on[x.k]=false})}on[k]=!on[k];bwSfx(on[k]?'drop':'mine');setGame();ui.render()}
// damage reduction: refund part of a hit when the right overhead is up
if(window.BWEv)BWEv.on('hurt',function(dmg){var Pl=P();if(!Pl||Pl.hp<=0)return;var s=style();if(on['p'+s]){var back=Math.round(dmg*0.6);if(back>0){Pl.hp+=back}}});
// drain
setInterval(function(){try{var Pl=P();if(!Pl||Pl.pp==null)return;var d=0;PR.forEach(function(p){if(on[p.k])d+=p.d});if(!d)return;Pl.pp=Math.max(0,Pl.pp-d/12);if(Pl.pp<=0){on={};setGame();bwSay('You have run out of prayer points, you can recharge at an altar.','r');ui.render()}}catch(_){}},1000);
// overhead icon
var cv=document.createElement('canvas');cv.style.cssText='position:fixed;left:0;top:0;pointer-events:none;z-index:51';document.body.appendChild(cv);var g=cv.getContext('2d');
function fr(){try{var b=window.__bw,Pl=P(),ovk=PR.find(function(p){return p.ov&&on[p.k]});var dpr=Math.min(devicePixelRatio||1,2),W=innerWidth,H=innerHeight;if(cv.width!==Math.round(W*dpr)){cv.width=Math.round(W*dpr);cv.height=Math.round(H*dpr);cv.style.width=W+'px';cv.style.height=H+'px'}g.setTransform(dpr,0,0,dpr,0,0);g.clearRect(0,0,W,H);
 if(ovk&&b&&b.proj&&Pl){var q=b.proj(Pl.px!=null?Pl.px:Pl.x,Pl.py!=null?Pl.py:Pl.y),z=(b.cam&&b.cam.zoom)||36;g.font=Math.round(z*0.6)+'px sans-serif';g.textAlign='center';g.fillStyle='rgba(0,0,0,.45)';g.beginPath();g.arc(q[0],q[1]-z*2.1,z*0.42,0,7);g.fill();g.fillText(ovk.e,q[0],q[1]-z*1.9)}}catch(_){}requestAnimationFrame(fr)}requestAnimationFrame(fr);
var ui=bwUI('bwPrayP','🙏','Prayer book');
ui.render=function(){var Pl=P(),pp=Pl&&Pl.pp!=null?Math.ceil(Pl.pp):'?',L=window.bwLv('prayer'),h='<h3>Prayer — '+pp+'/'+L+' pts</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px">';PR.forEach(function(p){var lock=L<p.lvl;h+='<button data-p="'+p.k+'" style="'+(on[p.k]?'background:#6b5a2a;border-color:#ff0':'')+(lock?';opacity:.45':'')+'">'+p.e+'<br><small>'+p.n+'<br>Lvl '+p.lvl+'</small></button>'});ui.panel.innerHTML=h+'</div><small>Overheads refund 60% of damage from the matching attack style (nearest monster). Piety/Chivalry boost Attack, Strength & Defence.</small>'};
ui.panel.addEventListener('click',function(e){var t=e.target.closest&&e.target.closest('[data-p]');if(t)toggle(t.getAttribute('data-p'))});
setInterval(function(){if(ui.open)ui.render()},1500);
window.BWPrayer={toggle:toggle,active:on};
}catch(e){try{console.warn('[mods/prayer.js] failed',e)}catch(_){}}})();
