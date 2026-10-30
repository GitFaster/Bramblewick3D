/* Bramblewick mod: emotes.js */
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
if(window.BWEmote)return;
var E={dance:['💃','🎶'],wave:['👋'],bow:['🙇'],cheer:['🎉','🥳'],clap:['👏'],cry:['😭','💧'],laugh:['😂'],think:['🤔','💭'],shrug:['🤷'],angry:['😡','💢'],salute:['🫡'],flex:['💪'],heart:['❤️','💖'],skull:['💀'],party:['🎊','🎉','🪅']};
var fl=[];var cv=document.createElement('canvas');cv.style.cssText='position:fixed;left:0;top:0;pointer-events:none;z-index:52';document.body.appendChild(cv);var g=cv.getContext('2d');
function play(k){var e=E[k];if(!e)return;for(var i=0;i<6;i++)fl.push({e:e[i%e.length],t:performance.now()+i*120,dx:(Math.random()-.5)*50,life:1600});bwSay('You perform the '+k+' emote.');bwSfx('drop');try{var c=BWClues;}catch(_){}}
function fr(){try{var b=window.__bw,P=bwPl(),W=innerWidth,H=innerHeight,d=Math.min(devicePixelRatio||1,2);if(cv.width!==Math.round(W*d)){cv.width=Math.round(W*d);cv.height=Math.round(H*d);cv.style.width=W+'px';cv.style.height=H+'px'}g.setTransform(d,0,0,d,0,0);g.clearRect(0,0,W,H);if(fl.length&&b&&b.proj&&P){var q=b.proj(P.px!=null?P.px:P.x,P.py!=null?P.py:P.y),z=(b.cam&&b.cam.zoom)||36,now=performance.now();fl=fl.filter(function(f){return now-f.t<f.life});fl.forEach(function(f){var k=(now-f.t)/f.life;if(k<0)return;g.globalAlpha=1-k;g.font=Math.round(z*0.7)+'px sans-serif';g.textAlign='center';g.fillText(f.e,q[0]+f.dx*k,q[1]-z*1.6-k*z*2.5)});g.globalAlpha=1}}catch(_){}requestAnimationFrame(fr)}requestAnimationFrame(fr);
if(window.BWEv){Object.keys(E).forEach(function(k){BWEv.cmd(k,function(){play(k)})});BWEv.cmd('emotes',function(){ui.toggle(true)})}
var ui=bwUI('bwEmoP','😀','Emotes');
ui.render=function(){var h='<h3>Emotes</h3><small>Or type ::dance, ::wave …</small><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:3px">';Object.keys(E).forEach(function(k){h+='<button data-e="'+k+'">'+E[k][0]+'<small>'+k+'</small></button>'});ui.panel.innerHTML=h+'</div>'};
ui.panel.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-e]');if(b)play(b.getAttribute('data-e'))});
window.BWEmote={play:play};
}catch(e){try{console.warn('[mods/emotes.js] failed',e)}catch(_){}}})();
