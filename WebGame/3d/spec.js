/* Bramblewick 3D CMB-03: special attacks + spec orb. Own module. Uses existing save field P.spec (0-100, already in bramblewick-save-v2).
   Never calls save(). Effects go through rules.js CMB_HOOK (globalThis.__B3cmb). Regenerates 10% every 50 ticks (30 s). */
(function(){if(window.__B3spec)return;window.__B3spec=1;
// [name test, label, cost %, accuracy x, damage x, hits]  (numbers loosely after OSRS; own text)
const SP=[[/dragon dagger|dagger/i,'Puncture: two quick stabs',25,1.15,1.15,2],[/scimitar/i,'Sever: a precise slash',55,1.25,1.0,1],[/longsword/i,'Cleave: a heavy blow',25,1.0,1.25,1],
 [/2h|two-handed|godsword/i,'Smash: crushing swing',50,1.0,1.375,1],[/mace/i,'Shatter: armour-piercing hit',25,1.25,1.5,1],[/battleaxe/i,'Rampage: wild strike',100,1.0,1.2,1],
 [/warhammer|hammer/i,'Crush: heavy smash',50,1.0,1.5,1],[/spear|hasta/i,'Shove: forceful thrust',25,1.1,1.1,1],[/sword/i,'Lunge: accurate thrust',25,1.25,1.1,1]];
function B(){return window.B3}function G(){const b=B();return b&&(b.GM&&b.GM.G||b.G)}function R(){return B().GM.R}
function say(t){try{R().msg(G(),t)}catch(_){}}
function specOf(){const g=G();if(!g)return null;const w=g.player.equip.weapon;if(!w)return null;const d=g.defs.items[w]||{};const nm=(d.name||w)+'';if(/pickaxe|\baxe\b|hatchet/i.test(nm)&&!/battle/i.test(nm))return null;
 for(const s of SP)if(s[0].test(nm))return {label:s[1],cost:s[2],acc:s[3],dmg:s[4],hits:s[5],name:nm};return null}
let armed=false,busy=false,lastTick=-1;
const H=globalThis.__B3cmb||(globalThis.__B3cmb={parts:{},p(s,n){const o={};for(const k in this.parts){const f=this.parts[k].p;if(!f)continue;const r=f(s,n)||{};for(const x in r)o[x]=(x==='prot'?r[x]:(o[x]||1)*r[x])}return o},after(s,n,d){for(const k in this.parts){const f=this.parts[k].after;if(f)try{f(s,n,d)}catch(_){}}},keep(s){let c=0;for(const k in this.parts){const f=this.parts[k].keep;if(f)c+=f(s)||0}return c}});
let cur=null;
H.parts.spec={p:(s,n)=>{if(!n||!armed)return {};const sp=specOf();if(!sp||(s.player.spec||0)<sp.cost){armed=false;return {}}cur=sp;return {acc:sp.acc,dmg:sp.dmg}},
 after:(s,n,dmg)=>{if(!cur||busy)return;const sp=cur;cur=null;armed=false;s.player.spec=Math.max(0,(s.player.spec||0)-sp.cost);s.events.push({t:'spec',npc:n.id,dmg,tick:s.tick});
  say('Special attack! '+sp.label+(dmg?' — '+dmg+' damage.':' — missed.'));
  if(sp.hits>1&&!n.dead&&n.hp>0){busy=true;try{armed=true;cur=null;const keepS=s.player.spec;s.player.spec=100;H.parts.spec._extra=sp;R().playerAttack(s,n);s.player.spec=keepS}catch(_){}armed=false;busy=false;cur=null}ui()}};
// second hit of a double-hit spec uses the same multipliers without paying again
const p0=H.parts.spec.p;H.parts.spec.p=(s,n)=>{if(busy&&H.parts.spec._extra){const sp=H.parts.spec._extra;H.parts.spec._extra=null;return {acc:sp.acc,dmg:sp.dmg}}return p0(s,n)};
function arm(){const g=G();if(!g)return;const sp=specOf();if(!sp){say('Your weapon has no special attack.');armed=false;ui();return}
 if(armed){armed=false;ui();return}if((g.player.spec||0)<sp.cost){say('You need '+sp.cost+'% special energy for '+sp.label.split(':')[0]+'.');ui();return}armed=true;say('Special attack ready: '+sp.label+' ('+sp.cost+'%).');ui()}
function step(){const g=G();if(!g)return;if(lastTick<0){lastTick=g.tick;return}const P=g.player;
 while(lastTick<g.tick){lastTick++;if(lastTick%50===0&&(P.spec??100)<100)P.spec=Math.min(100,(P.spec||0)+10)}
 if(P.hp<=0)armed=false;ui()}
const css=document.createElement('style');css.textContent='#bwspec{position:relative}#bwspec .bar{position:absolute;left:5px;right:5px;bottom:5px;height:3px;background:#222;border-radius:2px;overflow:hidden}#bwspec .bar i{display:block;height:100%;background:#5c5}#bwspec.arm{background:#1f4a1fcc!important;box-shadow:0 0 8px #7f7}#bwspec.na{opacity:.55}';document.head.appendChild(css);
const orb=document.createElement('div');orb.className='orb';orb.id='bwspec';orb.title='Special attack';orb.innerHTML='<small>SPEC</small><span>100</span><div class="bar"><i></i></div>';
function ui(){const g=G();if(!g)return;const v=Math.round(g.player.spec??100),sp=specOf();orb.querySelector('span').textContent=v;orb.querySelector('.bar i').style.width=v+'%';orb.classList.toggle('arm',armed);orb.classList.toggle('na',!sp||v<sp.cost);orb.title=sp?('Special attack: '+sp.label+' ('+sp.cost+'%)'):'This weapon has no special attack'}
orb.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();arm()},true);
for(const ev of ['pointerdown','touchstart','mousedown'])orb.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
function dock(){const ob=document.getElementById('orbs');if(ob&&orb.parentNode!==ob)ob.appendChild(orb)}
window.__B3specApi={arm,specOf,state:()=>({armed,spec:G()&&G().player.spec,w:specOf()})};
function go(){if(!window.__B3ready||!G())return setTimeout(go,400);dock();setInterval(step,300);setInterval(dock,1000);ui()}
go()})();
