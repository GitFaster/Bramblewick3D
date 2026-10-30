/* Bramblewick mod: raid.js */
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
if(window.BWRaid)return;
var run=null;
function boss(){var ND=window.__bw&&__bw.ND;if(!ND)return null;var ks=Object.keys(ND).filter(function(k){var d=ND[k];return d&&d.hp&&d.ops&&d.ops.indexOf('Attack')>=0});ks.sort(function(a,b){return(ND[b].lvl||0)-(ND[a].lvl||0)});return ks}
function start(){if(run){bwSay('The raid is already underway.');return}var P=bwPl(),ks=boss();if(!P||!ks||!ks.length){bwSay('The raid portal fizzles.');return}var b=window.addNpc(ks[0],P.x+3,P.y,[P.x-7,P.y-7,P.x+7,P.y+7]);b.__fc=1;b.__raid=1;b.hp=Math.round((b.d.hp||20)*5);b.max=b.hp;b.say='The Bramble Tyrant awakens!';run={b:b,adds:[],ph:1,t:Date.now()};bwSay('🐲 RAID: The Bramble Tyrant awakens! ('+b.hp+' HP)','b');bwSfx('hit');try{BWLevelUp.show('RAID START','Defeat the Bramble Tyrant!')}catch(_){}ui.render()}
function adds(){var P=bwPl(),ks=boss();for(var i=0;i<2;i++){try{var n=window.addNpc(ks[Math.min(ks.length-1,3+i)],P.x-2+i*4,P.y+2,[P.x-7,P.y-7,P.x+7,P.y+7]);n.__fc=1;run.adds.push(n)}catch(_){}}bwSay('The Tyrant summons minions!','r')}
function clean(){try{var a=__bw.npcs;for(var i=a.length-1;i>=0;i--)if(a[i].__raid||(run&&run.adds.indexOf(a[i])>=0))a.splice(i,1)}catch(_){}}
function end(won){if(!run)return;var s=Math.round((Date.now()-run.t)/1000);clean();run=null;if(won){bwGive('coins',15000);try{BWChest.giveKey(Math.random()<0.25?'crystal':'gold')}catch(_){}try{if(Math.random()<0.1)BWPets.give('drake')}catch(_){}var best=bwLoad('bw_raid_best',0);if(!best||s<best)bwSave('bw_raid_best',s);bwSay('🏆 Raid complete in '+s+'s! +15,000 coins and a chest key.','b');bwSfx('quest');try{BWLevelUp.show('Raid complete!','Time '+s+'s · +15,000 gp + key')}catch(_){}}else bwSay('The raid has failed.');ui.render()}
setInterval(function(){try{if(!run)return;var P=bwPl(),b=run.b;if(P&&P.hp<=0)return end(false);if(b.dead||b.hp<=0)return end(true);var f=b.hp/b.max;if(run.ph===1&&f<0.66){run.ph=2;adds()}else if(run.ph===2&&f<0.33){run.ph=3;adds();b.say='ENRAGE!';bwSay('The Tyrant is enraged!','r')}if(ui.open)ui.render()}catch(_){}},500);
if(window.BWEv){BWEv.cmd('raid',start);BWEv.cmd('leaveraid',function(){end(false)})}
var ui=bwUI('bwRaidP','🐲','Raid');
ui.render=function(){var best=bwLoad('bw_raid_best',0),h='<h3>Bramble Tyrant raid</h3><small>Boss with 5× HP, 3 phases and summoned minions. Reward: 15k coins, gold/crystal key, 10% pet chance. Command ::raid</small>'+(best?'<small>Best time: '+best+'s</small>':'');if(run){var f=Math.max(0,run.b.hp/run.b.max);h+='<div class="r"><b>Phase '+run.ph+'</b><div style="height:12px;background:#400;border:1px solid #000"><div style="height:12px;width:'+Math.round(f*100)+'%;background:#0b0"></div></div><small>'+Math.max(0,run.b.hp)+' / '+run.b.max+'</small><button data-x="leave">Flee</button></div>'}else h+='<button data-x="go">🌀 Enter raid portal</button>';ui.panel.innerHTML=h};
ui.panel.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-x]');if(!b)return;if(b.getAttribute('data-x')==='go'){start();ui.toggle(false)}else end(false)});
window.BWRaid={start:start};
}catch(e){try{console.warn('[mods/raid.js] failed',e)}catch(_){}}})();
