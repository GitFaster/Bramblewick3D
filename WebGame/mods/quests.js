/* Bramblewick mod: quests.js — OSRS-style quests. Self-contained, fails safe. */
(function(){try{
if(window.__bwQuests)return;window.__bwQuests=1;
var KEY='bw_quests_v1';
var Q=[
 {k:'cook',n:"Cook's Assistant",qp:1,desc:"The Thornbury cook needs help. Bring 3 raw shrimp and 3 logs, then cook 3 meals.",
  steps:[{t:'Hold 3 Raw shrimp and 3 Logs',chk:function(){return ic('raw_shrimp')>=3&&ic('logs')>=3}},{t:'Cook 3 meals',ev:'cooking',need:3}],
  rw:{xp:{cooking:300},items:{coins:500},txt:'300 Cooking XP, 500 coins'}},
 {k:'rune',n:'Rune Mysteries',qp:1,desc:"Carry a sealed parcel far from Thornbury (40+ tiles away) and bring it back home.",
  steps:[{t:'Travel 40 tiles from Thornbury',chk:function(s){return dist()>=40}},{t:'Return to Thornbury square',chk:function(){return dist()<=8}}],
  rw:{xp:{magic:250,prayer:150},items:{coins:750},txt:'250 Magic XP, 150 Prayer XP, 750 coins'}},
 {k:'dragon',n:'Dragon Slayer (Lite)',qp:2,desc:"Prove yourself: land 30 successful hits, then defeat a champion (earn 400 combat XP after the trial).",
  steps:[{t:'Land 30 hits in combat',ev:'hit',need:30},{t:'Slay the champion (gain 400 combat XP)',ev:'cxp',need:400}],
  rw:{xp:{attack:500,strength:500,defence:500},items:{coins:2500},txt:'500 Atk/Str/Def XP, 2,500 coins'}}
];
var S={};try{S=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(_){S={}}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(_){}}
function bw(){return window.__bw||{}}
function ic(id){try{return typeof window.invCount==='function'?window.invCount(id):0}catch(_){return 0}}
function say(t,c){try{if(typeof window.msg==='function')window.msg(t,c||'g')}catch(_){}}
var home=null;function pl(){return bw().Pl}
function dist(){var p=pl();if(!p)return 0;if(!home)home={x:p.x,y:p.y};return Math.max(Math.abs(p.x-home.x),Math.abs(p.y-home.y))}
function st(k){return S[k]||(S[k]={s:0,step:0,c:0})}
function qp(){var t=0;Q.forEach(function(q){if(st(q.k).s===2)t+=q.qp});return t}
function start(q){var s=st(q.k);if(s.s)return;s.s=1;s.step=0;s.c=0;save();say('Quest started: '+q.n,'b');render()}
function adv(q){var s=st(q.k);s.step++;s.c=0;if(s.step>=q.steps.length)finish(q);else say(q.n+': '+q.steps[s.step].t,'g');save();render()}
function finish(q){var s=st(q.k);s.s=2;save();
 try{var b=bw();for(var sk in q.rw.xp){try{(b.addXp||window.addXp)(sk,q.rw.xp[sk])}catch(_){}}}catch(_){}
 for(var it in q.rw.items){try{window.addItem&&window.addItem(it,q.rw.items[it])}catch(_){}}
 say('Congratulations! Quest complete: '+q.n+' (+'+q.qp+' QP)','b');
 try{window.BWAudio&&BWAudio.sfx('quest')}catch(_){}
 try{window.BWLevelUp&&BWLevelUp.show('Quest complete!',q.n+'<br>Reward: '+q.rw.txt,'#3a7')}catch(_){}}
function ev(name,amt){Q.forEach(function(q){var s=st(q.k);if(s.s!==1)return;var p=q.steps[s.step];if(p&&p.ev===name){s.c+=amt||1;if(s.c>=p.need)adv(q);else save()}})}
window.BWQuests={event:ev,list:Q,state:S,qp:qp};
// hook XP for events
var CB={attack:1,strength:1,defence:1,hitpoints:1,ranged:1,magic:1};
if(window.BWEv)BWEv.on('xp',function(s,a){try{if(s==='cooking')ev('cooking',1);if(s==='hitpoints')ev('hit',1);if(CB[s])ev('cxp',a)}catch(_){}});
setInterval(function(){try{dist();Q.forEach(function(q){var s=st(q.k);if(s.s!==1)return;var p=q.steps[s.step];if(p&&p.chk&&p.chk(s))adv(q)})}catch(_){}},1000);
// UI
var css=document.createElement('style');css.textContent='#bwqBtn{position:fixed;left:8px;top:50%;z-index:9000;width:44px;height:44px;border-radius:8px;border:2px solid #3e3529;background:#5a4c39;color:#ff0;font-size:22px;touch-action:manipulation}#bwqP{position:fixed;left:58px;top:12%;z-index:9001;width:min(330px,80vw);max-height:72vh;overflow:auto;background:#3e3529;border:3px solid #2a241b;color:#ff981f;font:13px sans-serif;padding:8px;border-radius:6px;display:none;-webkit-overflow-scrolling:touch}#bwqP h3{margin:0 0 6px;color:#ff0}.bwq{padding:6px;margin:3px 0;background:#4b4032;border-radius:4px}.bwq b{display:block}.bwq.s0 b{color:#f33}.bwq.s1 b{color:#ff0}.bwq.s2 b{color:#0f0}.bwq small{color:#ddd;display:block;margin:3px 0}.bwq button{background:#2a241b;color:#ff981f;border:1px solid #000;padding:6px 10px;border-radius:4px}';document.head.appendChild(css);
var btn=document.createElement('button');btn.id='bwqBtn';btn.textContent='📜';btn.title='Quests';
var P=document.createElement('div');P.id='bwqP';
btn.onclick=function(e){e.stopPropagation();P.style.display=P.style.display==='block'?'none':'block';render()};
P.addEventListener('click',function(e){e.stopPropagation();var k=e.target.getAttribute&&e.target.getAttribute('data-q');if(k){Q.forEach(function(q){if(q.k===k)start(q)})}});
['touchstart','pointerdown','mousedown'].forEach(function(t){P.addEventListener(t,function(e){e.stopPropagation()},{passive:true});btn.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
function render(){if(P.style.display!=='block')return;var h='<h3>Quests — QP: '+qp()+'/'+Q.reduce(function(a,q){return a+q.qp},0)+'</h3>';
 Q.forEach(function(q){var s=st(q.k);h+='<div class="bwq s'+s.s+'"><b>'+q.n+'</b><small>'+q.desc+'</small>';
  if(s.s===0)h+='<button data-q="'+q.k+'">Start quest</button>';
  else if(s.s===1){var p=q.steps[s.step];h+='<small>➤ '+p.t+(p.need?' ('+Math.min(Math.floor(s.c),p.need)+'/'+p.need+')':'')+'</small>'}
  else h+='<small>✔ Completed — '+q.rw.txt+'</small>';h+='</div>'});
 P.innerHTML=h}
setInterval(render,1500);
function mount(){document.body.appendChild(btn);document.body.appendChild(P)}
if(document.body)mount();else document.addEventListener('DOMContentLoaded',mount);
}catch(e){try{console.warn('[mods/quests] failed',e)}catch(_){}}})();
