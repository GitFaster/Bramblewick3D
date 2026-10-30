/* Bramblewick mod: achievements.js */
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
if(window.BWDiary)return;
var S=bwLoad('bw_diary_v1',{c:{},done:{}});function inc(k,n){S.c[k]=(S.c[k]||0)+(n||1)}
function c(k){return S.c[k]||0}function lv(s){try{return window.__bw.lv(s)}catch(_){return 1}}
function qp(){try{return BWQuests.qp()}catch(_){return 0}}
var D=[
 {r:'Thornbury',t:[
  ['Easy',[['Chop 10 logs',function(){return c('woodcutting')>=10}],['Catch 10 fish',function(){return c('fishing')>=10}],['Cook 5 meals',function(){return c('cooking')>=5}]],{coins:1000},'1,000 coins'],
  ['Medium',[['Reach 20 Woodcutting',function(){return lv('woodcutting')>=20}],['Reach 20 Cooking',function(){return lv('cooking')>=20}],['Complete a quest',function(){return qp()>=1}]],{coins:5000},'5,000 coins'],
  ['Hard',[['Reach 40 Fishing',function(){return lv('fishing')>=40}],['Earn 4 quest points',function(){return qp()>=4}],['Own a skilling pet',function(){try{var o=BWPets.state.own;return o.beaver||o.golem||o.heron}catch(_){return false}}]],{coins:25000},'25,000 coins']]},
 {r:'Ashenmoor',t:[
  ['Easy',[['Mine 15 ores',function(){return c('mining')>=15}],['Defeat an Ashen guard',function(){return c('k_guard')>=1}]],{coins:1500},'1,500 coins'],
  ['Medium',[['Reach 25 Mining',function(){return lv('mining')>=25}],['Reach 20 Smithing',function(){return lv('smithing')>=20}],['Steal 20 times',function(){return c('thieving')>=20}]],{coins:7500},'7,500 coins'],
  ['Hard',[['Reach 45 Mining',function(){return lv('mining')>=45}],['Solve 3 clue scrolls',function(){return c('clues')>=3}]],{coins:30000},'30,000 coins']]},
 {r:'Wilderness',t:[
  ['Easy',[['Kill 25 monsters',function(){return c('kills')>=25}],['Bury 10 bones',function(){return c('prayer')>=10}]],{coins:2000},'2,000 coins'],
  ['Medium',[['Reach 30 Attack',function(){return lv('attack')>=30}],['Reach 30 Strength',function(){return lv('strength')>=30}],['Clear Fight Cave wave 3',function(){return c('fc_wave')>=3}]],{coins:10000},'10,000 coins'],
  ['Hard',[['Kill 250 monsters',function(){return c('kills')>=250}],['Complete the Fight Cave',function(){return c('fc_done')>=1}]],{coins:50000},'50,000 coins']]}
];
bwHook('addXp',function(r,s){inc(s)});
bwHook('kill',function(r,n){inc('kills');try{inc('k_'+n.kind)}catch(_){}});
window.BWDiary={inc:inc,state:S};
function check(){var ch=false;D.forEach(function(d){d.t.forEach(function(t){var key=d.r+'/'+t[0];if(S.done[key])return;if(t[1].every(function(x){try{return x[1]()}catch(_){return false}})){S.done[key]=1;ch=true;for(var i in t[2])bwGive(i,t[2][i]);bwSay('Well done! You completed the '+t[0]+' '+d.r+' Diary. Reward: '+t[3],'b');bwSfx('quest');bwPop('Achievement Diary',d.r+' '+t[0]+' complete!<br>'+t[3])}})});bwSave('bw_diary_v1',S);if(ch&&ui.open)ui.render()}
setInterval(check,3000);
var ui=bwUI('bwDiaryP','🏆','Achievement Diary');
ui.render=function(){var h='<h3>Achievement Diary</h3>';D.forEach(function(d){h+='<div class="r"><b>'+d.r+'</b>';d.t.forEach(function(t){var dn=S.done[d.r+'/'+t[0]];h+='<small class="'+(dn?'ok':'')+'"><b>'+t[0]+'</b> — '+t[3]+(dn?' ✔':'')+'</small>';t[1].forEach(function(x){var ok=false;try{ok=x[1]()}catch(_){}h+='<small class="'+(ok?'ok':'no')+'">&nbsp;• '+x[0]+'</small>'})});h+='</div>'});ui.panel.innerHTML=h};
setInterval(function(){if(ui.open)ui.render()},2000);
}catch(e){try{console.warn('[mods/achievements.js] failed',e)}catch(_){}}})();
