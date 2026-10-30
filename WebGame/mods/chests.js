/* Bramblewick mod: chests.js */
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
if(window.BWChest)return;
var TIER={bronze:{e:'🟫',c:[200,800],items:['cut_opal','cut_jade','iron_bar','big_bones']},silver:{e:'⬜',c:[1000,4000],items:['cut_sapphire','cut_emerald','steel_sword','iron_sword']},gold:{e:'🟨',c:[5000,15000],items:['cut_ruby','cut_diamond','steel_pickaxe']},crystal:{e:'💎',c:[20000,60000],items:['cut_dragonstone','cut_diamond','dragonstone']}};
var S=bwLoad('bw_chest_v1',{keys:{bronze:0,silver:0,gold:0,crystal:0},opened:0});function sv(){bwSave('bw_chest_v1',S)}
function giveKey(t){if(!TIER[t])return;S.keys[t]++;sv();bwSay('You found a '+t+' key! Open it in the 🗝️ chest tab.','b');bwSfx('drop');if(ui.open)ui.render()}
if(window.BWEv)BWEv.on('kill',function(n){var l=(n&&n.d&&n.d.lvl)||1,r=Math.random();if(r<1/400&&l>=30)giveKey('crystal');else if(r<1/120)giveKey(l>=25?'gold':'silver');else if(r<1/35)giveKey('bronze')});
function open(t){if(!S.keys[t]){bwSay('You need a '+t+' key.');return}S.keys[t]--;S.opened++;var T=TIER[t],c=T.c[0]+Math.floor(Math.random()*(T.c[1]-T.c[0]));bwGive('coins',c);var it=T.items[Math.random()*T.items.length|0],got=bwGive(it,1);try{BWEv.emit('collect','chest_'+t)}catch(_){}sv();anim(T.e,c,got?it:null);bwSfx('quest');bwSay('You open the '+t+' chest: '+c+' coins'+(got?' + '+it.replace(/_/g,' '):'')+'!','b');ui.render()}
function anim(e,c,it){var d=document.createElement('div');d.style.cssText='position:fixed;left:50%;top:40%;transform:translate(-50%,-50%) scale(.3);z-index:9600;font:bold 18px sans-serif;color:#ff0;text-align:center;text-shadow:0 2px 4px #000;transition:transform .4s cubic-bezier(.2,2,.4,1),opacity .6s;pointer-events:none';d.innerHTML='<div style="font-size:64px">'+e+'</div>+'+c.toLocaleString()+' gp'+(it?'<br>'+it.replace(/_/g,' '):'');document.body.appendChild(d);requestAnimationFrame(function(){d.style.transform='translate(-50%,-50%) scale(1)'});try{BWLevelUp.fireworks()}catch(_){}setTimeout(function(){d.style.opacity=0;setTimeout(function(){d.remove()},700)},2200)}
var ui=bwUI('bwChestP','🗝️','Treasure chests');
ui.render=function(){var h='<h3>Treasure chests — opened '+S.opened+'</h3><small>Keys drop from monsters (bronze 1/35, silver/gold 1/120, crystal 1/400 from lvl 30+) and daily chests.</small>';for(var t in TIER)h+='<div class="r">'+TIER[t].e+' <b>'+t+' key × '+S.keys[t]+'</b><small>'+TIER[t].c[0].toLocaleString()+'–'+TIER[t].c[1].toLocaleString()+' gp + item</small><button data-o="'+t+'" style="'+(S.keys[t]?'':'opacity:.4')+'">Open chest</button></div>';ui.panel.innerHTML=h};
ui.panel.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-o]');if(b)open(b.getAttribute('data-o'))});
window.BWChest={giveKey:giveKey,state:S};
}catch(e){try{console.warn('[mods/chests.js] failed',e)}catch(_){}}})();
