/* Bramblewick mod: levelup.js — OSRS-style level-up popup with fireworks. */
(function(){try{
if(window.BWLevelUp)return;
var NM={};
var css=document.createElement('style');css.textContent='#bwlu{position:fixed;left:50%;top:22%;transform:translateX(-50%) scale(.6);z-index:9500;min-width:240px;max-width:88vw;background:#c8b48c;border:3px solid #3e3529;box-shadow:0 0 0 2px #000,0 6px 20px #000a;color:#000;font:bold 14px sans-serif;text-align:center;padding:10px 14px;border-radius:4px;opacity:0;transition:all .25s;pointer-events:none}#bwlu.on{opacity:1;transform:translateX(-50%) scale(1)}#bwlu .t{color:#00008b;font-size:17px;margin-bottom:4px}#bwfw{position:fixed;inset:0;z-index:9499;pointer-events:none}';document.head.appendChild(css);
var box=document.createElement('div');box.id='bwlu';var cv=document.createElement('canvas');cv.id='bwfw';
function mount(){document.body.appendChild(cv);document.body.appendChild(box)}if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);
var parts=[],raf=0,g=null;
function burst(x,y,col){var c=col||['#ff0','#f80','#0ff','#f0f','#0f0','#fff'][Math.random()*6|0];for(var i=0;i<40;i++){var a=Math.random()*6.283,s=1.5+Math.random()*4;parts.push({x:x,y:y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,l:50+Math.random()*30,c:c})}}
function frame(){try{var w=cv.width,h=cv.height;g.clearRect(0,0,w,h);for(var i=parts.length-1;i>=0;i--){var p=parts[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.07;p.vx*=0.985;p.l--;if(p.l<=0){parts.splice(i,1);continue}g.globalAlpha=Math.min(1,p.l/30);g.fillStyle=p.c;g.fillRect(p.x,p.y,3,3)}g.globalAlpha=1;if(parts.length)raf=requestAnimationFrame(frame);else{raf=0;g.clearRect(0,0,w,h)}}catch(_){raf=0}}
function fireworks(){try{var d=Math.min(window.devicePixelRatio||1,2);cv.width=innerWidth;cv.height=innerHeight;g=g||cv.getContext('2d');if(!g)return;var n=(innerWidth<600)?4:6;for(var i=0;i<n;i++)(function(i){setTimeout(function(){burst(innerWidth*(0.15+Math.random()*0.7),innerHeight*(0.12+Math.random()*0.35));if(!raf)raf=requestAnimationFrame(frame)},i*220)})(i)}catch(_){}}
var tm=0;function show(title,body){box.innerHTML='<div class="t">'+title+'</div>'+body;box.classList.add('on');fireworks();clearTimeout(tm);tm=setTimeout(function(){box.classList.remove('on')},3500)}
window.BWLevelUp={show:show,fireworks:fireworks};
var SKN={hitpoints:'Hitpoints'};if(window.BWEv)BWEv.on('level',function(s,n){var nm=String(s).charAt(0).toUpperCase()+String(s).slice(1);show('Congratulations, you just advanced a'+(/^[AEIOU]/.test(nm)?'n ':' ')+nm+' level!','Your '+nm+' level is now '+n+'.');try{var o=document.getElementById('levelup');if(o)setTimeout(function(){o.className='hidden'},50)}catch(_){}});
}catch(e){try{console.warn('[mods/levelup] failed',e)}catch(_){}}})();
