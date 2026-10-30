/* Bramblewick mod: dailies.js */
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
if(window.BWDaily)return;
var POOL=[['Chop 25 logs','xp','woodcutting',25],['Mine 25 ores','xp','mining',25],['Catch 20 fish','xp','fishing',20],['Cook 15 meals','xp','cooking',15],['Kill 15 monsters','kill','',15],['Steal 10 times','xp','thieving',10],['Bury 10 bones','xp','prayer',10],['Smith 10 bars','xp','smithing',10],['Earn 5,000 XP','xpamt','',5000]];
function day(){var d=new Date();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()}
var S=bwLoad('bw_daily_v1',{d:'',t:[],streak:0,last:''});
function roll(){var td=day();if(S.d===td)return;var y=new Date(Date.now()-864e5),yd=y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate();if(S.last!==yd&&S.last!==td)S.streak=0;S.d=td;var p=POOL.slice().sort(function(){return Math.random()-.5}).slice(0,3);S.t=p.map(function(x){return{n:x[0],ty:x[1],s:x[2],need:x[3],c:0,done:0}});S.claimed=0;bwSave('bw_daily_v1',S)}
roll();setInterval(roll,60000);
function prog(ty,s,a){var ch=0;S.t.forEach(function(t){if(t.done)return;if(t.ty===ty&&(!t.s||t.s===s)){t.c+=(ty==='xpamt'?a:1);ch=1;if(t.c>=t.need){t.done=1;bwSay('Daily task complete: '+t.n+'!','b');bwSfx('levelup');bwGive('coins',500)}}});if(ch){bwSave('bw_daily_v1',S);if(ui.open)ui.render()}}
if(window.BWEv){BWEv.on('xp',function(s,a){prog('xp',s);prog('xpamt','',a)});BWEv.on('kill',function(){prog('kill','')})}
function claim(){if(S.claimed||!S.t.every(function(t){return t.done}))return;S.claimed=1;S.streak++;S.last=day();var r=1000*Math.min(10,S.streak);bwGive('coins',r);if(S.streak%7===0){bwGive('coins',25000);bwPop('7-day streak!','+25,000 bonus coins')}bwSay('Daily chest claimed! Streak '+S.streak+' — +'+r+' coins.','b');bwSfx('quest');try{BWChest&&BWChest.giveKey(S.streak>=5?'gold':'silver')}catch(_){}bwSave('bw_daily_v1',S);ui.render()}
var ui=bwUI('bwDailyP','📅','Daily tasks');
ui.render=function(){var h='<h3>Daily tasks — 🔥 streak '+S.streak+'</h3>';S.t.forEach(function(t){h+='<div class="r"><b class="'+(t.done?'ok':'')+'">'+t.n+(t.done?' ✔':'')+'</b><small>'+Math.min(Math.floor(t.c),t.need)+'/'+t.need+' · 500 coins</small></div>'});var all=S.t.every(function(t){return t.done});h+=S.claimed?'<small class="ok">Claimed today. New tasks at midnight.</small>':'<button data-c="1" style="'+(all?'':'opacity:.4')+'">🎁 Claim daily chest ('+1000*Math.min(10,S.streak+1)+' gp + key)</button>';h+='<small>Every 7th day: +25,000 bonus.</small>';ui.panel.innerHTML=h};
ui.panel.addEventListener('click',function(e){if(e.target.closest&&e.target.closest('[data-c]'))claim()});
window.BWDaily={state:S};
}catch(e){try{console.warn('[mods/dailies.js] failed',e)}catch(_){}}})();
