/* Bramblewick mod: hiscores.js */
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
if(window.BWHiscores)return;
var SK=['attack','strength','defence','hitpoints','ranged','prayer','magic','cooking','woodcutting','fletching','fishing','firemaking','crafting','smithing','mining','herblore','agility','thieving','slayer','farming','runecraft','hunter','construction'];
var IC={attack:'⚔️',strength:'💪',defence:'🛡️',hitpoints:'❤️',ranged:'🏹',prayer:'🙏',magic:'🔮',cooking:'🍳',woodcutting:'🪓',fletching:'🪶',fishing:'🎣',firemaking:'🔥',crafting:'🧵',smithing:'🔨',mining:'⛏️',herblore:'🌿',agility:'🏃',thieving:'💰',slayer:'💀',farming:'🌱',runecraft:'🌀',hunter:'🐾',construction:'🏠'};
function skills(){var P=bwPl();if(!P||!P.xp)return[];return Object.keys(P.xp).filter(function(s){return typeof P.xp[s]==='number'}).sort(function(a,b){var i=SK.indexOf(a),j=SK.indexOf(b);return(i<0?99:i)-(j<0?99:j)})}
function me(){var P=bwPl()||{},t=0,x=0;skills().forEach(function(s){t+=window.bwLv(s);x+=P.xp[s]});return{n:P.name||'You',tot:t,xp:Math.round(x),cb:cmb()}}
function cmb(){var l=window.bwLv;try{var b=.25*(l('defence')+l('hitpoints')+Math.floor(l('prayer')/2)),m=.325*(l('attack')+l('strength'));return Math.floor(b+m)}catch(_){return 3}}
var RIV=bwLoad('bw_hs_riv',null);if(!RIV){RIV=['Zezima','Lynx Titan','Woox','B0aty','Settled','Torvesta','Framed','Mmorpg','Sick Nerd','Swampletics'].map(function(n,i){return{n:n,xp:Math.round(4e6/(i+1)*(0.6+Math.random()*0.8)),g:0.4+Math.random()}});bwSave('bw_hs_riv',RIV)}
setInterval(function(){RIV.forEach(function(r){r.xp+=Math.round(r.g*40*Math.random())});bwSave('bw_hs_riv',RIV)},10000);
var best=bwLoad('bw_hs_best',{xp:0,tot:0});
var tab='board',ui=bwUI('bwHsP','📊','Hiscores');
function fmt(n){return n.toLocaleString()}
ui.render=function(){var m=me();if(m.xp>best.xp){best.xp=m.xp;best.tot=m.tot;bwSave('bw_hs_best',best)}var h='<h3>Hiscores</h3><button data-t="board">🏅 Overall</button><button data-t="card">🪪 Stats card</button>';
 if(tab==='board'){var all=RIV.map(function(r){return{n:r.n,xp:r.xp,tot:Math.min(2277,Math.round(Math.pow(r.xp,0.42)))}}).concat([{n:m.n+' (you)',xp:m.xp,tot:m.tot,me:1}]).sort(function(a,b){return b.xp-a.xp});
  h+='<div class="r"><table style="width:100%;font-size:12px;color:#fff;border-collapse:collapse"><tr style="color:#ff981f"><td>#</td><td>Name</td><td>Total</td><td>XP</td></tr>';all.forEach(function(r,i){h+='<tr style="'+(r.me?'color:#ff0;font-weight:bold':'')+'"><td>'+(i+1)+'</td><td>'+r.n+'</td><td>'+r.tot+'</td><td>'+fmt(r.xp)+'</td></tr>'});h+='</table></div>'}
 else{h+='<div class="r" style="text-align:center"><b style="color:#ff0;font-size:16px">'+m.n+'</b><small>Combat '+m.cb+' · Total '+m.tot+' · '+fmt(m.xp)+' XP</small><small>Quest points: '+(window.BWQuests?BWQuests.qp():0)+' · Clues: '+(window.BWClues?BWClues.state.solved:0)+' · Pets: '+(window.BWPets?Object.keys(BWPets.state.own).length:0)+'</small></div><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:3px">';
  skills().forEach(function(s){h+='<div class="r" style="margin:0;text-align:center">'+(IC[s]||'⭐')+' <b style="color:#ff0">'+window.bwLv(s)+'</b><small style="font-size:10px">'+fmt(Math.floor(bwPl().xp[s]))+'</small></div>'});h+='</div><button data-t="share">📋 Copy stats</button>'}
 ui.panel.innerHTML=h};
ui.panel.addEventListener('click',function(e){var t=e.target.getAttribute&&e.target.getAttribute('data-t');if(!t)return;if(t==='share'){var m=me(),s='Bramblewick — '+m.n+': Combat '+m.cb+', Total '+m.tot+', '+fmt(m.xp)+' XP';try{navigator.clipboard.writeText(s);bwSay('Stats copied!')}catch(_){bwSay(s)}return}tab=t;ui.render()});
setInterval(function(){if(ui.open)ui.render()},3000);
window.BWHiscores={me:me};
}catch(e){try{console.warn('[mods/hiscores.js] failed',e)}catch(_){}}})();
