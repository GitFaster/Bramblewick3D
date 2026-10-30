/* Bramblewick 3D — HUD-05 side tabs + CMB-01 combat styles (additive module).
   One "▦" stone in #gtabs opens a 14-stone tab panel (2x7 portrait, 7x2 landscape).
   Existing panels (Skills, Inventory, Equipment, Magic, Prayer, Quests) are opened through their own buttons, unchanged.
   Combat tab: weapon category, 4 style buttons, Auto Retaliate, special bar. Writes only P.style / P.autoRet (already in the save).
   Attack speed per weapon category via globalThis.__B3cmb.spd (rules.js CMB_HOOK). Never calls save(). No localStorage. */
function B(){return window.B3}function G(){const b=B();return b&&(b.GM&&b.GM.G||b.G)}function R(){return B().GM.R}
function say(t){try{R().msg(G(),t)}catch(_){}}
const CAT=[['dagger',/dagger/i,4],['scimitar',/scimitar/i,4],['longsword',/longsword/i,5],['2h',/2h|two.?hand|greatsword/i,7],['battleaxe',/battleaxe|battle axe/i,6],
 ['warhammer',/warhammer/i,6],['mace',/mace/i,5],['spear',/spear|halberd/i,5],['pickaxe',/pickaxe|pick/i,5],['axe',/axe|hatchet/i,5],['staff',/staff|wand/i,5],['bow',/bow/i,4],['sword',/sword|blade/i,4]];
const STY={unarmed:[['Punch','accurate'],['Kick','aggressive'],['Block','defensive']],
 dagger:[['Stab','accurate'],['Lunge','aggressive'],['Slash','aggressive'],['Block','defensive']],
 sword:[['Stab','accurate'],['Lunge','aggressive'],['Slash','aggressive'],['Block','defensive']],
 scimitar:[['Chop','accurate'],['Slash','aggressive'],['Lunge','controlled'],['Block','defensive']],
 longsword:[['Chop','accurate'],['Slash','aggressive'],['Lunge','controlled'],['Block','defensive']],
 '2h':[['Chop','accurate'],['Slash','aggressive'],['Smash','aggressive'],['Block','defensive']],
 battleaxe:[['Chop','accurate'],['Hack','aggressive'],['Smash','aggressive'],['Block','defensive']],
 axe:[['Chop','accurate'],['Hack','aggressive'],['Smash','aggressive'],['Block','defensive']],
 pickaxe:[['Spike','accurate'],['Impale','aggressive'],['Smash','aggressive'],['Block','defensive']],
 mace:[['Pound','accurate'],['Pummel','aggressive'],['Spike','controlled'],['Block','defensive']],
 warhammer:[['Pound','accurate'],['Pummel','aggressive'],['Block','defensive']],
 spear:[['Lunge','controlled'],['Swipe','controlled'],['Pound','controlled'],['Block','defensive']],
 staff:[['Bash','accurate'],['Pound','aggressive'],['Focus','defensive']],
 bow:[['Accurate','accurate'],['Rapid','aggressive'],['Longrange','defensive']]};
const XPT={accurate:'Attack XP',aggressive:'Strength XP',defensive:'Defence XP',controlled:'Shared XP'};
function wep(){const g=G();if(!g)return null;const id=g.player.equip&&g.player.equip.weapon;if(!id)return null;const d=g.defs.items[id]||{};return {id,name:d.name||id.replace(/_/g,' ').replace(/^./,c=>c.toUpperCase()),d}}
function cat(){const w=wep();if(!w)return ['unarmed',4];if(w.d.cat&&STY[w.d.cat])return [w.d.cat,w.d.spd||4];const s=w.name+' '+w.id;for(const c of CAT)if(c[1].test(s))return [c[0],w.d.spd||c[2]];return ['sword',4]}
const H=globalThis.__B3cmb||(globalThis.__B3cmb={parts:{},p(s,n){const o={};for(const k in this.parts){const f=this.parts[k].p;if(!f)continue;const r=f(s,n)||{};for(const x in r)o[x]=(x==='prot'?r[x]:(o[x]||1)*r[x])}return o},after(s,n,d){for(const k in this.parts){const f=this.parts[k].after;if(f)try{f(s,n,d)}catch(_){}}},keep(s){let c=0;for(const k in this.parts){const f=this.parts[k].keep;if(f)c+=f(s)||0}return c}});
H.spd=()=>cat()[1];
const TABS=[['combat','⚔','Combat','F1'],['skills','📊','Skills','F2'],['quests','📜','Quests','F3'],['inventory','🎒','Inventory','F4'],['equipment','🛡','Equipment','F6'],['prayer','🙏','Prayer','F7'],['magic','✦','Magic','F8'],
 ['clan','👥','Clan',''],['friends','🙂','Friends','F9'],['ignore','🚫','Ignore',''],['logout','🚪','Logout',''],['settings','⚙','Settings','F10'],['emotes','💃','Emotes','F11'],['music','🎵','Music','F12']];
window.BW_TABS=TABS.map(t=>({id:t[0],icon:t[1],title:t[2],key:t[3]}));
const css=document.createElement('style');css.textContent='#bwtabs{position:relative}#bwtabsP{position:fixed;z-index:60;background:#2a2418f2;border:2px solid #6b5a3a;border-radius:10px;color:#eee;font:12px sans-serif;padding:6px;display:none;box-sizing:border-box;overflow:auto}'+
 '#bwtabsP .st{display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:6px}#bwtabsP .st div{border:1px solid #5a4630;border-radius:6px;background:#3a2e1e;text-align:center;font-size:17px;padding:3px 0;cursor:pointer;min-height:34px}'+
 '#bwtabsP .st div small{display:block;font-size:7px;color:#ccc}#bwtabsP .st div.on{background:#7a5a2a}#bwtabsP .hd{font-weight:700;color:#ffe9a3;margin:2px 0 4px}#bwtabsP button{font:700 11px sans-serif;background:#4a3a26;color:#ffe9a3;border:1px solid #1a140c;border-radius:6px;padding:6px 4px;min-height:36px}'+
 '#bwtabsP .sy{display:grid;grid-template-columns:1fr 1fr;gap:4px}#bwtabsP button.on{background:#7a5a2a;color:#fff;box-shadow:inset 0 0 5px #fd8}#bwtabsP button small{display:block;font-weight:400;font-size:9px;color:#ccc}'+
 '#bwtabsP .bar{height:12px;background:#111;border:1px solid #555;border-radius:4px;overflow:hidden;margin:4px 0}#bwtabsP .bar i{display:block;height:100%;background:#3c9}#bwtabsP .cs{color:#bbb;padding:10px;text-align:center}';
document.head.appendChild(css);
const tab=document.createElement('button');tab.id='bwtabs';tab.title='All tabs';tab.textContent='▦';
const pn=document.createElement('div');pn.id='bwtabsP';let cur='combat',lastN=null;
function closeOthers(){document.querySelectorAll('.gpan').forEach(p=>{if(getComputedStyle(p).display!=='none'){const t=p.id==='inv'?document.getElementById('invb'):null;if(t)t.click();else p.style.display='none'}});
 const b2=document.getElementById('b2p');if(b2&&b2.style.display==='block'){const t=document.getElementById('b2tab');t&&t.click()}
 const pp=document.getElementById('bwprayP');if(pp&&pp.style.display==='block'){const t=document.getElementById('bwprayTab');t&&t.click()}}
function clickEl(sel){const e=document.querySelector(sel);if(e){shut();e.click();return true}return false}
function openTab(id){const t=TABS.find(x=>x[0]===id);if(!t)return;
 if(id==='skills'&&clickEl('#gtabs [data-m="skills"]'))return;if(id==='inventory'&&clickEl('#invb'))return;if(id==='equipment'&&clickEl('#gtabs [data-m="equip"]'))return;
 if(id==='magic'&&clickEl('#b2tab'))return;if(id==='quests'&&clickEl('#bwqBtn'))return;
 if(id==='prayer'&&window.__B3prayApi){shut();window.__B3prayApi.open(false);return}
 cur=id;if(pn.style.display!=='block'){closeOthers();pn.style.display='block';tab.classList.add('on')}dock();pn._h='';ui()}
function closeTab(){shut()}
window.__B3tabs={openTab,closeTab,TABS:window.BW_TABS,cat,styles:()=>STY[cat()[0]]};
function shut(){pn.style.display='none';tab.classList.remove('on')}
function body(){const g=G();if(!g)return '';const P=g.player;
 if(cur==='combat'){const [c,spd]=cat(),w=wep(),L=STY[c]||STY.sword;const sp=window.__B3specApi&&window.__B3specApi.state();const v=Math.round(P.spec??100);
  let h='<div class="hd">'+(w?w.name:'Unarmed')+' <small style="color:#bbb">('+c+', speed '+spd+' ticks = '+(spd*0.6).toFixed(1)+'s)</small></div><div class="sy">';
  const pk=(L.find(x=>x[1]===P.style&&x[0]===lastN)||L.find(x=>x[1]===P.style)||[])[0];for(const [n,s] of L)h+='<button data-sy="'+s+'" data-n="'+n+'" class="'+(n===pk?'on':'')+'">'+n+'<small>'+s+' · '+XPT[s]+'</small></button>';
  h+='</div><div style="margin-top:6px;display:flex;gap:4px"><button data-ar class="'+(P.autoRet?'on':'')+'" style="flex:1">Auto Retaliate: '+(P.autoRet?'On':'Off')+'</button>'+(sp&&sp.w?'<button data-sp class="'+(sp.armed?'on':'')+'" style="flex:1">Special '+sp.w.cost+'%</button>':'')+'</div>';
  h+='<div class="bar"><i style="width:'+v+'%"></i></div><small style="color:#bbb">Special energy '+v+'%'+(sp&&sp.w?' — '+sp.w.label:' — no special for this weapon')+'</small>';return h}
 if(cur==='logout')return '<div class="cs">To log out, use the account chip at the top left (Not logged in / your name).</div>';
 const t=TABS.find(x=>x[0]===cur);return '<div class="cs">'+t[1]+' '+t[2]+' — coming soon.</div>'}
function ui(){if(pn.style.display!=='block')return;let h='<div class="st">';for(const t of TABS)h+='<div data-t="'+t[0]+'" class="'+(t[0]===cur?'on':'')+'" title="'+t[2]+(t[3]?' ('+t[3]+')':'')+'">'+t[1]+'<small>'+t[2]+'</small></div>';h+='</div>'+body();if(pn._h!==h){pn.innerHTML=h;pn._h=h}}
pn.addEventListener('click',e=>{e.stopPropagation();const g=G();const t=e.target.closest('[data-t]');if(t){openTab(t.dataset.t);return}
 const s=e.target.closest('[data-sy]');if(s&&g){g.player.style=s.dataset.sy;lastN=s.dataset.n;say('Combat style: '+s.dataset.n+' ('+s.dataset.sy+').');ui();return}
 if(e.target.closest('[data-ar]')&&g){g.player.autoRet=!g.player.autoRet;ui();return}
 if(e.target.closest('[data-sp]')&&window.__B3specApi){window.__B3specApi.arm();ui();return}},true);
for(const ev of ['pointerdown','touchstart','mousedown'])pn.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
function dock(){const gt=document.getElementById('gtabs');if(gt&&tab.parentNode!==gt)gt.insertBefore(tab,gt.firstChild);if(!gt)return;
 const ib=document.getElementById('invb')||gt;const g=gt.getBoundingClientRect(),i=ib.getBoundingClientRect(),land=innerWidth>innerHeight;const S=(k,v)=>pn.style.setProperty(k,v,'important');
 S('top','auto');S('left','auto');S('right',Math.max(4,innerWidth-i.right)+'px');S('bottom',(innerHeight-g.top+6)+'px');S('width',Math.min(land?300:320,innerWidth-16)+'px');
 S('max-height',(land?Math.max(120,g.top-60):Math.min(300,innerHeight*0.36))+'px')}
tab.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();if(pn.style.display==='block'){shut();return}openTab(cur==='combat'||!TABS.find(x=>x[0]===cur)?'combat':cur)},true);
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#gtabs button,#invb');if(t&&t!==tab&&pn.style.display==='block')shut()},true);
const FK={};for(const t of TABS)if(t[3])FK[t[3]]=t[0];
addEventListener('keydown',e=>{if(/INPUT|TEXTAREA/.test((e.target&&e.target.tagName)||''))return;if(e.key==='Escape'&&pn.style.display==='block'){shut();return}
 const id=FK[e.key];if(id){e.preventDefault();if(id===cur&&pn.style.display==='block')shut();else openTab(id)}});
document.body.appendChild(pn);
function go(){if(!window.__B3ready||!G())return setTimeout(go,400);dock();setInterval(()=>{dock();ui()},700);addEventListener('resize',()=>setTimeout(dock,150))}
go();
