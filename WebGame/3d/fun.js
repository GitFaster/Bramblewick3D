// Bramblewick 3D "fun layer" (v14): goal tracker + rewards, XP drops, level-up popup/sound, tap feedback.
// Pure presentation + bookkeeping. Game mechanics stay in rules.mjs (rewards go through R.grant; pacing via R.starterBoost / G.opts.boost).
// Tracker progress lives in its own key (b3d-tracker-v1); the shared save key bramblewick-save-v2 is untouched by this file.
(window.__B3mods=window.__B3mods||{}).fun=1;
const TK='b3d-tracker-v1';
const STARTER=[
 {id:'chop3',txt:'Chop 3 logs',need:3,m:e=>e.t==='gather'&&/logs/.test(e.item)?1:0,coins:25},
 {id:'mudhen',txt:'Defeat a Mudhen',need:1,m:e=>e.t==='kill'&&e.kind==='mudhen'?1:0,coins:25},
 {id:'sell1',txt:'Sell an item at the stall',need:1,m:e=>e.t==='sell'?(e.n||1):0,coins:25},
 {id:'bank1',txt:'Bank an item',need:1,m:e=>e.t==='deposit'?e.n:0,coins:25}];
const FINAL={coins:100,item:'leather_cap',txt:'Starter tasks complete! Reward: 100 coins + Leather cap.'};
const BOUNTIES=[
 {txt:'Daily bounty: Chop 5 logs',need:5,skill:'woodcutting',m:e=>e.t==='gather'&&/logs/.test(e.item)?1:0},
 {txt:'Daily bounty: Defeat 3 Mudhens',need:3,skill:'attack',m:e=>e.t==='kill'&&e.kind==='mudhen'?1:0},
 {txt:'Daily bounty: Hunt 2 Ember foxes',need:2,skill:'attack',m:e=>e.t==='kill'&&e.kind==='fox'?1:0},
 {txt:'Daily bounty: Mine 4 ores',need:4,skill:'mining',m:e=>e.t==='gather'&&/ore|clay|coal|essence|opal|jade|topaz|sapphire|emerald|ruby|diamond/.test(e.item)?1:0},
 {txt:'Daily bounty: Cook 3 meals',need:3,skill:'cooking',m:e=>e.t==='cook'&&e.ok?1:0},
 {txt:'Daily bounty: Find 5 drops',need:5,skill:'hitpoints',m:e=>e.t==='pickup'?e.n||1:0}
];
function goalMatcher(t,DEF){const s=t.toLowerCase();let m;
 if(m=/\b(?:chop|cut)\s+(\d+)/.exec(s))return [+m[1],e=>e.t==='gather'&&/logs/.test(e.item)?1:0];
 if(m=/\bmine\s+(\d+)/.exec(s))return [+m[1],e=>e.t==='gather'&&/ore|clay|coal|essence|opal|jade|topaz|sapphire|emerald|ruby|diamond/.test(e.item)?1:0];
 if(m=/\b(?:kill|defeat)\s+(\d+)\s+([a-z ]+?)s?$/.exec(s)){const w=m[2].trim().replace(/\s+/g,'');return [+m[1],e=>{if(e.t!=='kill')return 0;const n=(DEF.npcs[e.kind]?.name||e.kind).toLowerCase().replace(/\s+/g,'');return n.startsWith(w)||e.kind.startsWith(w)?1:0}]}
 if(m=/\bsell\s+(\d+)/.exec(s))return [+m[1],e=>e.t==='sell'?(e.n||1):0];
 if(m=/\bbank\s+(\d+)/.exec(s))return [+m[1],e=>e.t==='deposit'?e.n:0];
 if(m=/\bfish\s+(\d+)/.exec(s))return [+m[1],e=>e.t==='gather'&&/^raw_/.test(e.item)?1:0];
 return [1,null]}
export function initFun(GM,{msg,cfg}){const {G,R,DEF}=GM;cfg=cfg||{goals:[]};
 let st;try{st=JSON.parse(localStorage.getItem(TK)||'null')}catch(e){}st=st&&st.v===1?st:{v:1,c:{},claimed:[],custom:{}};
 const dayKey=new Date().toISOString().slice(0,10),dayNo=Math.floor(Date.now()/86400000),bounty=BOUNTIES[dayNo%BOUNTIES.length];if(!st.daily||st.daily.day!==dayKey)st.daily={day:dayKey,c:0,claimed:false};
 const goals=(cfg.goals||[]).map((t,i)=>{const [need,m]=goalMatcher(t,DEF);return {id:'g'+i+':'+t,txt:t,need,m,manual:!m}});
 for(const g of goals)if(!(g.id in st.custom))st.custom[g.id]=0;
 const put=()=>{try{localStorage.setItem(TK,JSON.stringify(st))}catch(e){}};
 const starterDone=()=>STARTER.every(t=>st.claimed.includes(t.id));
 G.opts.boost=!starterDone();
 // ---- UI
 const css=document.createElement('style');css.textContent=`#trk{left:calc(8px + var(--sl));top:calc(62px + var(--st));width:min(56vw,230px);background:#2a2015cc;border:1px solid #5a4630;border-radius:8px;padding:4px 7px;font:12px system-ui,sans-serif;color:#fff}
#trk{box-shadow:0 5px 18px #0008;backdrop-filter:blur(7px)}#trk .th{display:flex;justify-content:space-between;font-weight:900;color:#ffe9a3;cursor:pointer;min-height:30px;align-items:center;border-bottom:1px solid #ffe9a322}#trk .r{position:relative;display:grid;grid-template-columns:18px 1fr auto;gap:7px;align-items:center;padding:6px 1px 8px;min-height:30px}#trk .r i{font-style:normal;color:#ffe9a3;margin-left:auto;font-variant-numeric:tabular-nums}#trk .r.ok{color:#9f9;opacity:.82}#trk.min .r{display:none}#trk .cb{display:grid;place-items:center;width:16px;height:16px;border:1px solid #ffe9a3;border-radius:5px;flex:none}#trk .ok .cb{background:#3a3;border-color:#8f8}#trk .bar{position:absolute;left:25px;right:2px;bottom:3px;height:3px;border-radius:3px;background:#ffffff18;overflow:hidden}#trk .bar b{display:block;height:100%;background:linear-gradient(90deg,#e9a83a,#ffe57a);border-radius:inherit}#trk .ok .bar b{background:#70d66d}#trk .r.daily{color:#ffe27a;border-top:1px solid #ffe9a355;margin-top:3px;padding-top:8px;font-weight:800}#trk .r.daily .cb{border-color:#ffca45;color:#ffca45}@media(max-width:600px){#trk{width:min(62vw,245px);font-size:11px}#trk .r{padding-top:5px;padding-bottom:7px}}
#to2d{left:calc(8px + var(--sl));top:calc(34px + var(--st));padding:3px 8px;border-radius:6px;background:#2a2015bb;border:1px solid #5a4630;color:#ffd98a;font:700 11px system-ui,sans-serif;text-decoration:none}
.xpd{position:fixed;z-index:9;right:calc(70px + var(--mm) + var(--sr));font:800 13px system-ui,sans-serif;color:#fff;text-shadow:1px 1px 0 #000;pointer-events:none;transition:transform 1.4s ease-out,opacity 1.4s;white-space:nowrap}
#lvup{position:fixed;z-index:30;left:50%;top:26%;transform:translate(-50%,-50%) scale(.6);opacity:0;transition:all .35s;background:linear-gradient(#5a4320,#2a2015);border:2px solid #ffd23f;border-radius:12px;padding:12px 20px;color:#ffe9a3;font:800 17px system-ui,sans-serif;text-align:center;pointer-events:none;box-shadow:0 0 24px #ffd23f88}#lvup.on{opacity:1;transform:translate(-50%,-50%) scale(1)}
.tapr{position:fixed;z-index:8;width:34px;height:34px;margin:-17px 0 0 -17px;border:3px solid #ffef6a;border-radius:50%;pointer-events:none;animation:tapr .45s ease-out forwards}@keyframes tapr{from{transform:scale(.3);opacity:1}to{transform:scale(1.3);opacity:0}}
.rwd{position:fixed;z-index:31;left:50%;top:40%;transform:translateX(-50%);background:#2a2015ee;border:2px solid #7f7;border-radius:10px;padding:8px 14px;color:#cfc;font:800 14px system-ui,sans-serif;pointer-events:none;animation:rwd 2.6s forwards}@keyframes rwd{0%{opacity:0;transform:translate(-50%,10px)}10%,80%{opacity:1;transform:translate(-50%,0)}100%{opacity:0}}`;document.head.appendChild(css);
 const a2=document.createElement('a');a2.id='to2d';a2.className='hud';a2.href='/2d/';a2.textContent='◂ 2D game';a2.title='Open the 2D game';document.body.appendChild(a2);
 const box=document.createElement('div');box.id='trk';box.className='hud';box.setAttribute('role','status');box.setAttribute('aria-live','polite');if(cfg.tracker==='off')box.style.display='none';document.body.appendChild(box);
 let mini=false;try{mini=localStorage.getItem('b3d-tracker-mini')==='1'}catch(e){}
 const bar=(c,n)=>`<span class="bar"><b style="width:${Math.min(100,Math.round(c/n*100))}%"></b></span>`;
 const draw=()=>{const rows=[];const sd=starterDone();
  if(!sd)for(const t of STARTER){const c=Math.min(t.need,st.c[t.id]||0),ok=st.claimed.includes(t.id);rows.push(`<div class="r${ok?' ok':''}" data-id="${t.id}"><span class="cb">${ok?'✓':''}</span><span>${t.txt}</span><i>${c}/${t.need}</i>${bar(c,t.need)}</div>`)}
  for(const g of goals){const c=Math.min(g.need,st.custom[g.id]||0),ok=c>=g.need;const e=String(g.txt).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));rows.push(`<div class="r${ok?' ok':''}" data-g="${encodeURIComponent(g.id)}"${g.manual?' style="cursor:pointer"':''}><span class="cb">${ok?'✓':''}</span><span>${e}</span><i>${g.manual?(ok?'done':'tap'):c+'/'+g.need}</i>${bar(c,g.need)}</div>`)}
  const bc=Math.min(bounty.need,st.daily.c||0),bd=!!st.daily.claimed;rows.push(`<div class="r daily${bd?' ok':''}"><span class="cb">${bd?'★':'✦'}</span><span>${bounty.txt}</span><i>${bd?'DONE':bc+'/'+bounty.need}</i>${bar(bc,bounty.need)}</div>`);
  const left=(sd?0:STARTER.filter(t=>!st.claimed.includes(t.id)).length)+goals.filter(g=>(st.custom[g.id]||0)<g.need).length+(bd?0:1);
  box.innerHTML=`<div class="th"><span>${sd?'Goals':'Starter tasks'}</span><span>${left?left+' left':'✓'} ${mini?'▸':'▾'}</span></div>`+rows.join('');box.classList.toggle('min',mini);
  if(!rows.length)box.style.display='none'};
 box.addEventListener('click',e=>{const r=e.target.closest('.r');if(r&&r.dataset.g){const g=goals.find(x=>x.id===decodeURIComponent(r.dataset.g));if(g&&g.manual){st.custom[g.id]=st.custom[g.id]?0:1;put();if(st.custom[g.id])reward('Goal done: '+g.txt);draw()}return}if(e.target.closest('.th')){mini=!mini;try{localStorage.setItem('b3d-tracker-mini',mini?'1':'0')}catch(e){}draw()}});
 // ---- audio
 let ac=null;const tone=(fs,dur=.12)=>{try{ac=ac||new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();let t=ac.currentTime;for(const f of fs){const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.value=f;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.18,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g).connect(ac.destination);o.start(t);o.stop(t+dur+.02);t+=dur*.8}}catch(e){}};
 const reward=t=>{const d=document.createElement('div');d.className='rwd';d.textContent=t;document.body.appendChild(d);setTimeout(()=>d.remove(),2700);tone([660,880],.1);window.__B3rewards=(window.__B3rewards||0)+1;window.__B3lastReward={t,ms:Math.round(performance.now())}};
 const lvl=document.createElement('div');lvl.id='lvup';document.body.appendChild(lvl);let lvT=0;
 const levelUp=(sk,n)=>{lvl.innerHTML=`🎉 Level up!<br><span style="font-size:14px;color:#fff">${sk[0].toUpperCase()+sk.slice(1)} is now level ${n}</span>`;lvl.classList.add('on');clearTimeout(lvT);lvT=setTimeout(()=>lvl.classList.remove('on'),2600);tone([523,659,784,1047],.14);window.__B3levelUps=(window.__B3levelUps||0)+1};
 let xpy=0;const xpDrop=(sk,a)=>{const d=document.createElement('div');d.className='xpd';d.textContent=`+${Math.round(a)} ${sk[0].toUpperCase()+sk.slice(1)} XP`;d.style.top=`calc(${60+xpy*18}px + var(--st))`;xpy=(xpy+1)%4;document.body.appendChild(d);requestAnimationFrame(()=>{d.style.transform='translateY(-40px)';d.style.opacity='0'});setTimeout(()=>d.remove(),1500);window.__B3xpDrops=(window.__B3xpDrops||0)+1};
 const lv0={};for(const k of R.SKILLS)lv0[k]=R.lv(G,k);
 // ---- events (called by game3d afterTick before events are cleared)
 window.__B3fx=evs=>{let ch=false;const xpAgg={};
  for(const e of evs){if(e.t==='xp'){xpAgg[e.skill]=(xpAgg[e.skill]||0)+e.amount;const n=R.lv(G,e.skill);if(n>lv0[e.skill]){levelUp(e.skill,n);lv0[e.skill]=n}}
   if(!starterDone())for(const t of STARTER){if(st.claimed.includes(t.id))continue;const k=t.m(e);if(k){st.c[t.id]=(st.c[t.id]||0)+k;ch=true;if(st.c[t.id]>=t.need){st.claimed.push(t.id);R.grant(G,'coins',t.coins);reward(`✓ ${t.txt} — +${t.coins} coins`);if(starterDone()){R.grant(G,'coins',FINAL.coins);R.grant(G,FINAL.item,1);setTimeout(()=>reward(FINAL.txt),900);G.opts.boost=false;msg(FINAL.txt,'y')}}}}
   if(!st.daily.claimed){const k=bounty.m(e);if(k){st.daily.c=Math.min(bounty.need,(st.daily.c||0)+k);ch=true;if(st.daily.c>=bounty.need){st.daily.claimed=true;R.grant(G,'coins',75);R.addXp(G,bounty.skill,60);reward(`Daily bounty complete! +75 coins +60 ${bounty.skill} XP`);msg('Daily bounty complete — 75 coins and bonus XP added!','y')}}}
   for(const g of goals){if(!g.m||(st.custom[g.id]||0)>=g.need)continue;const k=g.m(e);if(k){st.custom[g.id]=(st.custom[g.id]||0)+k;ch=true;if(st.custom[g.id]>=g.need)reward('Goal done: '+g.txt)}}}
  for(const k in xpAgg)xpDrop(k,xpAgg[k]);
  if(ch){put();draw();G.events.push({t:'tracker'})}};
 // ---- instant tap feedback
 const cv=document.getElementById('c');let pd=null;cv.addEventListener('pointerdown',e=>{pd=[e.clientX,e.clientY,performance.now()]},true);
 cv.addEventListener('pointerup',e=>{if(!pd)return;const [x,y,t]=pd;pd=null;if(Math.hypot(e.clientX-x,e.clientY-y)>10||performance.now()-t>450)return;const r=document.createElement('div');r.className='tapr';r.style.left=e.clientX+'px';r.style.top=e.clientY+'px';document.body.appendChild(r);setTimeout(()=>r.remove(),500);window.__B3taps=(window.__B3taps||0)+1},true);
 draw();
 return {state:()=>JSON.parse(JSON.stringify(st)),goals:()=>goals.map(g=>({txt:g.txt,need:g.need,auto:!g.manual,c:st.custom[g.id]||0})),boost:()=>G.opts.boost,STARTER:STARTER.map(t=>t.id)}}
