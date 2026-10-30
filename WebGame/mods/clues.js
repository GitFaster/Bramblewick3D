/* Bramblewick mod: clues.js */
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
if(window.BWClues)return;
var S=bwLoad('bw_clue_v1',{clue:null,solved:0});function sv(){bwSave('bw_clue_v1',S)}
var EM=['Wave','Bow','Dance','Cheer','Clap','Think','Shrug','Salute'];
var DIR=['north','north-east','east','south-east','south','south-west','west','north-west'],DV=[[0,-1],[1,-1],[1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1]];
function newStep(){var P=bwPl()||{x:0,y:0};var d=Math.random()*8|0,dist=10+(Math.random()*20|0);var s={x:Math.round(P.x+DV[d][0]*dist),y:Math.round(P.y+DV[d][1]*dist),hint:'about '+dist+' tiles '+DIR[d]+' of where you read it'};
 if(Math.random()<0.5){s.t='dig';s.txt='Dig '+s.hint+'.'}else{s.t='emote';s.em=EM[Math.random()*EM.length|0];s.txt='Perform the '+s.em+' emote '+s.hint+'.'}return s}
function give(tier){S.clue={tier:tier,left:tier==='hard'?4:tier==='medium'?3:2,step:newStep()};sv();bwSay('You find a clue scroll ('+tier+')! Open the 🗺️ Clue tab.','b');bwSfx('drop')}
bwHook('kill',function(r,n){if(S.clue)return;var l=(n&&n.d&&n.d.lvl)||1,p=Math.random();if(p<1/30)give(l>=40?'hard':l>=12?'medium':'easy')});
function near(s){var P=bwPl();return P&&Math.max(Math.abs(P.x-s.x),Math.abs(P.y-s.y))<=3}
function stepDone(){var c=S.clue;c.left--;if(c.left<=0){S.clue=null;S.solved++;sv();casket(c.tier)}else{c.step=newStep();sv();bwSay('You found another clue! '+c.step.txt,'g');bwSfx('drop')}ui.render()}
function casket(t){var m=t==='hard'?5:t==='medium'?2.5:1,co=Math.round((400+Math.random()*1200)*m);bwGive('coins',co);var pool=t==='hard'?['cut_diamond','cut_ruby','cut_dragonstone']:t==='medium'?['cut_sapphire','cut_emerald','steel_sword']:['cut_opal','cut_jade','fishing_bait'];var it=pool[Math.random()*pool.length|0],got=bwGive(it,it==='fishing_bait'?25:1);try{window.BWDiary&&BWDiary.inc('clues')}catch(_){}
 bwSay('You open the reward casket: '+co+' coins'+(got?' and a '+it.replace(/_/g,' '):'')+'. Clues solved: '+S.solved,'b');bwSfx('quest');bwPop('Treasure Trail complete!','Casket ('+t+'): '+co+' coins'+(got?'<br>+ '+it.replace(/_/g,' '):''))}
function act(kind,em){var c=S.clue;if(!c){bwSay('You have no clue scroll.');return}var s=c.step;
 if(kind==='dig'){bwSfx('chop');if(s.t==='dig'&&near(s)){bwSay('You dig and find something!','g');stepDone()}else bwSay('Nothing interesting happens.')}
 else{bwSay('You perform the '+em+' emote.');if(s.t==='emote'&&s.em===em&&near(s)){bwSay('A Clue Master appears and hands you something!','g');stepDone()}}}
var ui=bwUI('bwClueP','🗺️','Clue scroll');
ui.render=function(){var c=S.clue,P=bwPl(),h='<h3>Treasure Trails</h3><small>Solved: '+S.solved+'</small>';if(!c)h+='<div class="r"><small>No clue. Monsters drop clue scrolls (1/30).</small></div>';else{var s=c.step,dx=P?s.x-P.x:0,dy=P?s.y-P.y:0,dd=Math.max(Math.abs(dx),Math.abs(dy));h+='<div class="r"><b>Clue scroll ('+c.tier+')</b><small>'+s.txt+'</small><small>Steps left: '+c.left+' — '+(dd<=3?'<span class="ok">You are here!</span>':'distance '+dd+' tiles')+'</small></div>'}
 h+='<button data-a="dig">⛏️ Dig</button><div>';EM.forEach(function(e){h+='<button data-e="'+e+'">'+e+'</button>'});ui.panel.innerHTML=h+'</div>'};
ui.panel.addEventListener('click',function(e){var t=e.target;if(!t.getAttribute)return;if(t.getAttribute('data-a'))act('dig');var em=t.getAttribute('data-e');if(em)act('emote',em)});
setInterval(function(){if(ui.open)ui.render()},1000);
window.BWClues={give:give,state:S};
}catch(e){try{console.warn('[mods/clues.js] failed',e)}catch(_){}}})();
