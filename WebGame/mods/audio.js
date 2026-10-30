/* Bramblewick mod: audio.js — WebAudio ambient music + SFX, no files. */
(function(){try{
if(window.BWAudio)return;
var AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
var ctx=null,master=null,musicG=null,muted=false;try{muted=localStorage.getItem('bw_mute')==='1'}catch(_){}
function init(){if(ctx)return ctx;try{ctx=new AC();master=ctx.createGain();master.gain.value=muted?0:0.5;master.connect(ctx.destination);musicG=ctx.createGain();musicG.gain.value=0.18;musicG.connect(master)}catch(_){ctx=null}return ctx}
function unlock(){init();try{ctx&&ctx.state==='suspended'&&ctx.resume()}catch(_){}}
['touchend','pointerdown','keydown','click'].forEach(function(t){document.addEventListener(t,unlock,{passive:true,capture:true})});
function tone(f,d,type,vol,when,dest,slide){if(!ctx)return;try{var t=ctx.currentTime+(when||0),o=ctx.createOscillator(),g=ctx.createGain();o.type=type||'sine';o.frequency.setValueAtTime(f,t);if(slide)o.frequency.exponentialRampToValueAtTime(slide,t+d);g.gain.setValueAtTime(0.0001,t);g.gain.exponentialRampToValueAtTime(vol||0.3,t+0.01);g.gain.exponentialRampToValueAtTime(0.0001,t+d);o.connect(g);g.connect(dest||master);o.start(t);o.stop(t+d+0.05)}catch(_){}}
function noise(d,vol,fq,when){if(!ctx)return;try{var t=ctx.currentTime+(when||0),n=Math.floor(ctx.sampleRate*d),b=ctx.createBuffer(1,n,ctx.sampleRate),a=b.getChannelData(0);for(var i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);var s=ctx.createBufferSource();s.buffer=b;var f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.value=fq||1000;var g=ctx.createGain();g.gain.value=vol||0.4;s.connect(f);f.connect(g);g.connect(master);s.start(t)}catch(_){}}
var SFX={
 chop:function(){noise(0.12,0.6,700);tone(180,0.1,'triangle',0.2)},
 mine:function(){tone(1400,0.15,'square',0.12,0,0,900);noise(0.06,0.5,3000)},
 hit:function(){noise(0.1,0.7,400);tone(120,0.12,'sawtooth',0.15,0,0,60)},
 drop:function(){tone(660,0.08,'sine',0.2);tone(990,0.12,'sine',0.18,0.07)},
 levelup:function(){[523,659,784,1047].forEach(function(f,i){tone(f,0.35,'triangle',0.25,i*0.13)});tone(1319,0.7,'triangle',0.2,0.55)},
 quest:function(){[392,523,659,784,659,784,1047].forEach(function(f,i){tone(f,0.3,'square',0.12,i*0.15)})}
};
var last={};function sfx(n){if(muted)return;init();var now=Date.now();if(last[n]&&now-last[n]<90)return;last[n]=now;try{SFX[n]&&SFX[n]()}catch(_){}}
// region music: scale/tempo by area of map
var SC={town:[262,294,330,392,440],wild:[220,233,277,294,330],forest:[196,220,262,294,330],desert:[247,262,311,330,370]};
function region(){try{var p=window.__bw&&__bw.Pl;if(!p)return'town';var r=window.__bwRegionName;if(typeof r==='function'){var nm=String(r(p.x,p.y)||'').toLowerCase();if(/wild|lava|dark/.test(nm))return'wild';if(/wood|forest|tree/.test(nm))return'forest';if(/desert|sand/.test(nm))return'desert';if(nm)return'town'}
 var d=Math.hypot(p.x-(window.__bwHome||p.x),0);return p.y<40?'wild':(p.x>150?'desert':(p.x<40?'forest':'town'))}catch(_){return'town'}}
var step=0;setInterval(function(){try{if(!ctx||muted||document.hidden||ctx.state!=='running')return;var r=region(),s=SC[r]||SC.town;var f=s[(step*3+(step>>2))%s.length];var slow=r==='wild';if(step%2===0||!slow)tone(f*(step%8<4?1:0.5),slow?1.6:1.1,r==='wild'?'sawtooth':'sine',0.25,0,musicG);if(step%4===0)tone(s[0]/2,2.2,'triangle',0.3,0,musicG);step++}catch(_){}},600);
function setMute(m){muted=!!m;try{localStorage.setItem('bw_mute',muted?'1':'0')}catch(_){}if(master)master.gain.value=muted?0:0.5;btn.textContent=muted?'🔇':'🔊'}
window.BWAudio={sfx:sfx,mute:setMute,get muted(){return muted}};
// hooks
if(window.BWEv){BWEv.on('xp',function(s){if(s==='woodcutting')sfx('chop');else if(s==='mining')sfx('mine');else if(s==='hitpoints')sfx('hit')});BWEv.on('level',function(){sfx('levelup')});BWEv.on('item',function(){sfx('drop')});BWEv.on('hurt',function(){sfx('hit')})}
var btn=document.createElement('button');btn.textContent=muted?'🔇':'🔊';btn.title='Mute';btn.style.cssText='position:fixed;left:8px;top:calc(50% + 52px);z-index:9000;width:44px;height:44px;border-radius:8px;border:2px solid #3e3529;background:#5a4c39;color:#fff;font-size:20px;touch-action:manipulation';
btn.addEventListener('click',function(e){e.stopPropagation();unlock();setMute(!muted)});
['touchstart','pointerdown','mousedown'].forEach(function(t){btn.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
function mount(){document.body.appendChild(btn)}if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);
}catch(e){try{console.warn('[mods/audio] failed',e)}catch(_){}}})();
