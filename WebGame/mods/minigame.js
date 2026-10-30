/* Bramblewick mod: minigame.js */
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
if(window.BWFightCave)return;
var run=null;var WAVES=6;
function kinds(){var ND=window.__bw&&__bw.ND;if(!ND)return[];return Object.keys(ND).filter(function(k){var d=ND[k];return d&&d.hp&&d.ops&&d.ops.indexOf('Attack')>=0}).sort(function(a,b){return(ND[a].lvl||0)-(ND[b].lvl||0)})}
function spawnWave(){var P=bwPl(),ks=kinds();if(!P||!ks.length||typeof window.addNpc!=='function'){bwSay('The Fight Cave is closed right now.');end(false);return}
 var w=run.wave,n=Math.min(1+Math.ceil(w/2),4),idx=Math.min(ks.length-1,Math.floor(ks.length*(w/WAVES)*0.8)),list=[];
 if(w===WAVES){n=1;idx=ks.length-1}
 for(var i=0;i<n;i++){var a=i/n*6.283,x=Math.round(P.x+Math.cos(a)*3),y=Math.round(P.y+Math.sin(a)*3);try{var np=window.addNpc(ks[Math.max(0,idx-(i%2))],x,y,[P.x-6,P.y-6,P.x+6,P.y+6]);np.__fc=1;np.resp=1e12;if(w===WAVES){np.hp=Math.round(np.hp*2);np.say='TzTok-Brambad roars!'}list.push(np)}catch(_){}}
 run.mobs=list;bwSay((w===WAVES?'Final wave: the champion!':'Wave '+w+' of '+WAVES)+' — '+list.length+' foes.','b');bwSfx('hit');ui.render()}
function clean(){try{var arr=window.__bw.npcs;for(var i=arr.length-1;i>=0;i--)if(arr[i].__fc)arr.splice(i,1)}catch(_){}}
function start(){if(run){bwSay('You are already in the Fight Cave.');return}run={wave:1,mobs:[]};bwSay('You enter the Fight Cave. Survive '+WAVES+' waves!','b');spawnWave()}
function end(won){if(!run)return;var w=run.wave;run=null;clean();if(won){bwGive('coins',8000);try{BWDiary.inc('fc_done')}catch(_){}bwSay('You defeated the champion! You are awarded 8,000 coins.','b');bwSfx('quest');bwPop('Fight Cave complete!','All '+WAVES+' waves cleared!<br>+8,000 coins')}else bwSay('You leave the Fight Cave after wave '+w+'.');ui.render()}
setInterval(function(){try{if(!run)return;var P=bwPl();if(P&&P.hp<=0){end(false);return}if(run.mobs.length&&run.mobs.every(function(m){return m.dead||m.hp<=0})){clean();try{BWDiary&&BWDiary.inc('fc_wave')}catch(_){}bwGive('coins',250*run.wave);if(run.wave>=WAVES){end(true);return}run.wave++;setTimeout(function(){run&&spawnWave()},2500)}}catch(_){}},600);
if(window.BWEv){BWEv.cmd('fightcave',start);BWEv.cmd('fc',start);BWEv.cmd('leavecave',function(){end(false)})}
var ui=bwUI('bwFcP','🌋','Fight Cave');
ui.render=function(){ui.panel.innerHTML='<h3>Fight Cave</h3><div class="r"><small>Survive '+WAVES+' waves of ever-stronger monsters, ending with a double-HP champion. Coins every wave, 8,000 for the clear. Command: ::fightcave</small>'+(run?'<small class="ok">In progress: wave '+run.wave+'/'+WAVES+' — '+run.mobs.filter(function(m){return!m.dead&&m.hp>0}).length+' left</small><button data-x="leave">Leave cave</button>':'<button data-x="go">🌀 Enter portal</button>')+'</div>'};
ui.panel.addEventListener('click',function(e){var x=e.target.getAttribute&&e.target.getAttribute('data-x');if(x==='go'){start();ui.toggle(false)}if(x==='leave')end(false)});
setInterval(function(){if(ui.open)ui.render()},1000);
window.BWFightCave={start:start,leave:function(){end(false)}};
}catch(e){try{console.warn('[mods/minigame.js] failed',e)}catch(_){}}})();
