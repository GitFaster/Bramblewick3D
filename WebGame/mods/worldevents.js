/* Bramblewick mod: worldevents.js */
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
if(window.BWEvents)return;
var dbl=0;if(window.BWEv)BWEv.xpMult(function(s,a){return Date.now()<dbl?a*2:a});
var ban=null;function banner(t,sub,col){try{if(!ban){ban=document.createElement('div');ban.style.cssText='position:fixed;left:50%;top:64px;transform:translateX(-50%);z-index:9450;padding:8px 16px;border:3px solid #2a241b;border-radius:6px;font:bold 15px sans-serif;text-align:center;pointer-events:none;transition:opacity .5s;max-width:90vw';document.body.appendChild(ban)}ban.style.background=col||'#5a4c39';ban.style.color='#ff0';ban.innerHTML=t+'<div style="font-size:12px;color:#fff">'+(sub||'')+'</div>';ban.style.opacity=1;clearTimeout(banner.t);banner.t=setTimeout(function(){ban.style.opacity=0},7000)}catch(_){}bwSfx('quest');bwSay(t+(sub?' — '+sub:''),'b')}
var EV={
 star:function(){if(typeof window.bwSpawnStar==='function'){window.bwSpawnStar();banner('🌠 A shooting star has crashed nearby!','Find it and mine it for stardust.','#28305a')}else meteor()},
 dxp:function(){dbl=Date.now()+300000;banner('✨ Double XP Weekend… for 5 minutes!','All XP gained is doubled.','#5a2a6b')},
 chicken:function(){var P=bwPl(),ND=window.__bw&&__bw.ND;if(!P||!ND||!ND.mudhen){EV.dxp();return}try{var n=window.addNpc('mudhen',P.x+2,P.y+1,[P.x-5,P.y-5,P.x+5,P.y+5]);n.hp=30;n.say='BWAAAK! You will pay!';n.__evil=1;n.__fc=1;banner('🐔 An EVIL CHICKEN appears!','Defeat it for a reward.','#6b2a2a')}catch(_){}},
 meteor:meteor};
function meteor(){banner('☄️ Meteor shower!','Tap the falling meteors for coins!','#6b3a1a');var n=0,iv=setInterval(function(){if(++n>12){clearInterval(iv);return}var b=document.createElement('button');b.textContent='☄️';var x=20+Math.random()*(innerWidth-80);b.style.cssText='position:fixed;left:'+x+'px;top:-50px;width:48px;height:48px;font-size:30px;background:none;border:none;z-index:9300;transition:top 4s linear,left 4s linear;touch-action:manipulation';document.body.appendChild(b);requestAnimationFrame(function(){b.style.top=(innerHeight*0.75)+'px';b.style.left=(x-60)+'px'});var hit=function(e){e.stopPropagation();e.preventDefault();var c=50+(Math.random()*150|0);bwGive('coins',c);bwSfx('mine');b.textContent='+'+c;b.style.color='#ff0';b.style.fontSize='16px';b.onclick=null;setTimeout(function(){b.remove()},500)};b.addEventListener('click',hit);b.addEventListener('pointerdown',function(e){e.stopPropagation()});setTimeout(function(){b.remove()},4200)},600)}
if(window.BWEv)BWEv.on('kill',function(n){if(n&&n.__evil){bwGive('coins',3000);bwGive('feather',50);banner('🐔 The evil chicken is defeated!','+3,000 coins & 50 feathers');try{var a=__bw.npcs,i=a.indexOf(n);if(i>=0)a.splice(i,1)}catch(_){}}});
var K=Object.keys(EV);function fire(k){k=EV[k]?k:K[Math.random()*K.length|0];try{EV[k]()}catch(_){}}
(function sched(){setTimeout(function(){if(!document.hidden)fire();sched()},(150+Math.random()*150)*1000)})();
if(window.BWEv)BWEv.cmd('event',function(a){fire(a[0])});
// xp-boost badge
var badge=document.createElement('div');badge.style.cssText='position:fixed;right:8px;top:calc(50% - 22px);z-index:9000;background:#5a2a6b;color:#ff0;font:bold 12px sans-serif;padding:4px 7px;border-radius:5px;display:none;pointer-events:none';document.body.appendChild(badge);
setInterval(function(){var l=dbl-Date.now();if(l>0){badge.style.display='block';badge.textContent='2× XP '+Math.floor(l/60000)+':'+('0'+Math.floor(l/1000)%60).slice(-2)}else badge.style.display='none'},1000);
window.BWEvents={fire:fire,list:K};
}catch(e){try{console.warn('[mods/worldevents.js] failed',e)}catch(_){}}})();
