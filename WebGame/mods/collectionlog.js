/* Bramblewick mod: collectionlog.js */
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
if(window.BWCLog)return;
var S=bwLoad('bw_clog_v1',{got:{},kc:{}});function sv(){bwSave('bw_clog_v1',S)}
var CAT={'Skilling':['logs','oak_logs','willow_logs','copper_ore','tin_ore','iron_ore','coal','gold_ore','raw_shrimp','raw_sardine','raw_herring','raw_trout','raw_pike'],'Gems':['opal','jade','red_topaz','sapphire','emerald','ruby','diamond','dragonstone'],'Monster drops':['bones','big_bones','feather','boar_hide','thorn_barb','toad_leg','grim_key','glimmer_ore','bronze_sword','leather_cap','wooden_shield'],'Farming':['farm_potato','farm_onion','farm_guam','farm_ranarr','farm_snap','farm_magic'],'Pets':['pet_beaver','pet_golem','pet_heron','pet_drake'],'Treasure':['chest_bronze','chest_silver','chest_gold','chest_crystal']};
var ALL=[];for(var c in CAT)ALL=ALL.concat(CAT[c]);
function add(id){if(ALL.indexOf(id)<0||S.got[id])return;S.got[id]=Date.now();sv();bwSay('New item added to your collection log: '+nm(id),'b');bwSfx('drop')}
function nm(id){return id.replace(/^(farm|pet|chest)_/,'').replace(/_/g,' ').replace(/^./,function(x){return x.toUpperCase()})}
if(window.BWEv){BWEv.on('gain',function(id){add(id)});BWEv.on('collect',add);BWEv.on('kill',function(n){try{S.kc[n.kind]=(S.kc[n.kind]||0)+1;sv()}catch(_){}})}
setInterval(function(){try{for(var k in BWPets.state.own)add('pet_'+k)}catch(_){}},5000);
var cur='Skilling',ui=bwUI('bwClogP','📖','Collection log');
ui.render=function(){var n=Object.keys(S.got).length,h='<h3>Collection Log — '+n+'/'+ALL.length+'</h3><div>';for(var c in CAT){var g=CAT[c].filter(function(i){return S.got[i]}).length;h+='<button data-c="'+c+'" style="'+(c===cur?'border-color:#ff0':'')+'">'+c+' '+g+'/'+CAT[c].length+'</button>'}h+='</div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px">';CAT[cur].forEach(function(i){h+='<div class="r" style="margin:0;text-align:center"><small class="'+(S.got[i]?'ok':'no')+'">'+(S.got[i]?'✔ ':'')+nm(i)+'</small></div>'});h+='</div><b>Kill counts</b>';Object.keys(S.kc).sort(function(a,b){return S.kc[b]-S.kc[a]}).slice(0,8).forEach(function(k){h+='<small>'+k+': '+S.kc[k]+'</small>'});ui.panel.innerHTML=h};
ui.panel.addEventListener('click',function(e){var c=e.target.closest&&e.target.closest('[data-c]');if(c){cur=c.getAttribute('data-c');ui.render()}});
window.BWCLog={add:add,state:S};
}catch(e){try{console.warn('[mods/collectionlog.js] failed',e)}catch(_){}}})();
