/* Bramblewick mod: pets.js */
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
if(window.BWPets)return;
var PETS={beaver:{n:'Beaver',e:'🦫',sk:'woodcutting',rate:1/600},golem:{n:'Rock golem',e:'🗿',sk:'mining',rate:1/600},heron:{n:'Heron',e:'🦩',sk:'fishing',rate:1/600},drake:{n:'Baby drake',e:'🐉',boss:1,rate:1/40}};
var S=bwLoad('bw_pets_v1',{own:{},active:null});
function win(k){if(S.own[k])return;S.own[k]=1;S.active=k;bwSave('bw_pets_v1',S);bwSay('You have a funny feeling like you\'re being followed. ('+PETS[k].n+')','b');bwSfx('levelup');bwPop('New pet!',PETS[k].e+' '+PETS[k].n+' is now following you.')}
bwHook('addXp',function(r,s){for(var k in PETS){var p=PETS[k];if(p.sk===s&&Math.random()<p.rate)win(k)}});
bwHook('kill',function(r,n){try{var d=n&&n.d||{};if((d.boss||d.lvl>=60||/boss|dragon|king|queen/i.test((d.name||'')+n.kind))&&Math.random()<PETS.drake.rate)win('drake')}catch(_){}});
var ui=bwUI('bwPetP','🐾','Pets');
ui.render=function(){var h='<h3>Pets</h3>';for(var k in PETS){var p=PETS[k],o=S.own[k];h+='<div class="r">'+(o?p.e:'❔')+' <b class="'+(o?'ok':'no')+'">'+p.n+'</b><small>'+(p.boss?'Rare boss drop':'Rare from '+p.sk)+'</small>'+(o?'<button data-p="'+k+'">'+(S.active===k?'Dismiss':'Follow')+'</button>':'')+'</div>'}ui.panel.innerHTML=h};
ui.panel.addEventListener('click',function(e){var k=e.target.getAttribute&&e.target.getAttribute('data-p');if(k){S.active=S.active===k?null:k;bwSave('bw_pets_v1',S);ui.render()}});
// follower overlay
var cv=document.createElement('canvas');cv.style.cssText='position:fixed;pointer-events:none;z-index:50';document.body.appendChild(cv);var g=cv.getContext('2d'),pos=null,trail=[];
function frame(){try{var v=document.documentElement,P=bwPl(),pj=window.__bw&&__bw.proj;if(v&&P&&pj&&S.active&&PETS[S.active]){var r={left:0,top:0,width:innerWidth,height:innerHeight},d=Math.min(devicePixelRatio||1,2);if(cv.width!==Math.round(r.width*d)||cv.height!==Math.round(r.height*d)){cv.width=Math.round(r.width*d);cv.height=Math.round(r.height*d)}cv.style.left=r.left+'px';cv.style.top=r.top+'px';cv.style.width=r.width+'px';cv.style.height=r.height+'px';
 var px=P.px!=null?P.px:P.x,py=P.py!=null?P.py:P.y;trail.push([px,py]);if(trail.length>40)trail.shift();var t=trail[0];if(!pos)pos=[t[0],t[1]];pos[0]+=(t[0]-pos[0]-0.8)*0.08;pos[1]+=(t[1]-pos[1]+0.4)*0.08;
 var sx=1,q=pj(pos[0],pos[1]),z=Math.max(16,Math.min(40,(window.__bw.cam&&__bw.cam.zoom||36)*0.7));g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,r.width,r.height);
 g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(q[0]*sx,q[1]*sx,z*0.35,z*0.12,0,0,7);g.fill();g.font=z+'px sans-serif';g.textAlign='center';g.fillText(PETS[S.active].e,q[0]*sx,q[1]*sx-z*0.15+Math.sin(performance.now()/180)*1.5)}else if(g)g.clearRect(0,0,cv.width,cv.height)}catch(_){}requestAnimationFrame(frame)}
requestAnimationFrame(frame);
window.BWPets={give:win,state:S};
}catch(e){try{console.warn('[mods/pets.js] failed',e)}catch(_){}}})();
