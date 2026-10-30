/* Bramblewick mod: agility.js */
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
if(window.BWAgility)return;
var S=bwLoad('bwAgil',{xp:0,marks:0,laps:0,best:0});function lvl(){return Math.min(99,1+Math.floor(Math.sqrt(S.xp/25)))}
var OBS=['Climb the rough wall','Cross the tightrope','Leap the gap','Balance the ledge','Jump to the chimney','Swing on the washline','Drop to the roof','Vault the crate'];
var run=null,ui=bwUI('bwAgilP','🏃','Rooftop Agility');
function start(){if(run){bwSay('You are already on the course.');return}var P=bwPl();if(!P)return;run={i:0,t0:Date.now(),ox:P.x,oy:P.y,next:null};place();bwSay('🏃 Rooftop run! Tap each ⭐ obstacle tile in order — fast laps earn Marks of Grace.');ui.toggle(true)}
function place(){var P=bwPl();var a=run.i*0.9;run.next={x:run.ox+Math.round(Math.cos(a)*4),y:run.oy+Math.round(Math.sin(a)*4)}}
function step(){if(!run)return;var P=bwPl();if(!P||!run.next)return;if(Math.max(Math.abs(P.x-run.next.x),Math.abs(P.y-run.next.y))<=1){var fail=Math.random()<Math.max(0.03,0.25-lvl()*0.004);if(fail){P.hp=Math.max(1,P.hp-2);bwSay('You slip on '+OBS[run.i].toLowerCase()+'! (-2 HP)','r');run.t0-=3000}else{S.xp+=12+lvl();bwSfx('click');bwSay('✓ '+OBS[run.i]+'.')}run.i++;if(run.i>=OBS.length)lap();else place();ui.render()}}
function lap(){var t=(Date.now()-run.t0)/1000;S.laps++;var m=1+(t<45?2:t<75?1:0)+(Math.random()<0.2?1:0);S.marks+=m;S.xp+=60;if(!S.best||t<S.best)S.best=Math.round(t);try{var P=bwPl();P.energy=Math.min(100,(P.energy||0)+40)}catch(_){}window.__bw&&__bw.addXp&&__bw.addXp('thieving',25);bwSay('🏁 Lap done in '+Math.round(t)+'s! +'+m+' Mark(s) of Grace. Run energy restored.');bwPop('Lap complete!','+'+m+' marks · '+Math.round(t)+'s');bwSave('bwAgil',S);run=null}
var cv=document.createElement('canvas');cv.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:8000';document.body.appendChild(cv);
function draw(){try{var g=cv.getContext('2d');if(cv.width!==innerWidth){cv.width=innerWidth;cv.height=innerHeight}g.clearRect(0,0,cv.width,cv.height);if(run&&run.next&&window.__bw&&__bw.proj){var p=__bw.proj(run.next.x+0.5,run.next.y+0.5);if(p){var s=1+0.15*Math.sin(Date.now()/150);g.font=(28*s|0)+'px sans-serif';g.textAlign='center';g.fillText('⭐',p[0]!=null?p[0]:p.x,(p[1]!=null?p[1]:p.y))}}}catch(_){}requestAnimationFrame(draw)}draw();
setInterval(function(){try{step()}catch(_){}},250);
var SHOP=[['Graceful boost (10 min 2× XP)',12,function(){window.bwGrantBoost&&bwGrantBoost(600)}],['Coin pouch (5,000)',4,function(){bwGive('coins',5000)}],['Full run energy',1,function(){bwPl().energy=100}]];
ui.render=function(){var h='<h3>🏃 Rooftop Agility</h3><div class="r">Agility level <b>'+lvl()+'</b> · Laps '+S.laps+' · Best '+(S.best?S.best+'s':'—')+'<br>Marks of Grace: <b>'+S.marks+'</b></div>';h+=run?'<div class="r">Obstacle '+(run.i+1)+'/'+OBS.length+': <b>'+OBS[run.i]+'</b> — walk to the ⭐</div><button data-a="q">Quit run</button>':'<button data-a="s">Start rooftop lap</button>';SHOP.forEach(function(s,i){h+='<div class="r">'+s[0]+' <button data-b="'+i+'">'+s[1]+' marks</button></div>'});ui.panel.innerHTML=h;ui.panel.querySelectorAll('button').forEach(function(b){b.onclick=function(){try{if(b.dataset.a==='s')start();else if(b.dataset.a==='q'){run=null;bwSay('You leave the course.')}else{var s=SHOP[+b.dataset.b];if(S.marks<s[1]){bwSay('Not enough marks.','r');return}S.marks-=s[1];s[2]();bwSave('bwAgil',S);bwSay('Bought '+s[0]+'.')}ui.render()}catch(_){}}})};
window.BWEv&&BWEv.cmd&&BWEv.cmd('agility',start);window.BWEv&&BWEv.cmd&&BWEv.cmd('rooftop',start);
window.BWAgility={state:S,start:start};
}catch(e){try{console.warn('[mods/agility.js] failed',e)}catch(_){}}})();
