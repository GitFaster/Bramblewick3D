/* Bramblewick 3D PRAY-01: prayer book + quick-prayer orb. Own module; device-only key b3d.pray.v1 (quick-prayer choice only).
   Uses existing save field P.pp (already in bramblewick-save-v2). Never calls save(). Icons are text glyphs (no OSRS art).
   Combat effects go through rules.js CMB_HOOK (globalThis.__B3cmb); if rules.js is older, prayers still drain but give no bonus. */
(function(){if(window.__B3pray)return;window.__B3pray=1;
const KEY='b3d.pray.v1';
// drain = OSRS-style drain effect; resistance 60 + 2*prayer bonus (numbers only)
const P0=[
 ['thick_skin','Thick Skin',1,1,{d:1.05},'def','🛡'],['burst_str','Burst of Strength',4,1,{s:1.05},'str','💪'],['clarity','Clarity of Thought',7,1,{a:1.05},'att','🎯'],
 ['sharp_eye','Sharp Eye',8,1,{},'off','🏹'],['mystic_will','Mystic Will',9,1,{},'off','✨'],
 ['rock_skin','Rock Skin',10,6,{d:1.10},'def','🛡'],['superhuman','Superhuman Strength',13,6,{s:1.10},'str','💪'],['improved_ref','Improved Reflexes',16,6,{a:1.10},'att','🎯'],
 ['rapid_restore','Rapid Restore',19,1,{},'',"↺"],['rapid_heal','Rapid Heal',22,2,{heal:1},'',"❤"],['protect_item','Protect Item',25,2,{keep:1},'',"🔒"],
 ['hawk_eye','Hawk Eye',26,6,{},'off','🏹'],['mystic_lore','Mystic Lore',27,6,{},'off','✨'],
 ['steel_skin','Steel Skin',28,12,{d:1.15},'def','🛡'],['ultimate_str','Ultimate Strength',31,12,{s:1.15},'str','💪'],['incredible_ref','Incredible Reflexes',34,12,{a:1.15},'att','🎯'],
 ['prot_magic','Protect from Magic',37,12,{prot:'magic'},'prot','🔮'],['prot_missiles','Protect from Missiles',40,12,{prot:'ranged'},'prot','➶'],['prot_melee','Protect from Melee',43,12,{prot:'melee'},'prot','⚔'],
 ['eagle_eye','Eagle Eye',44,12,{},'off','🏹'],['mystic_might','Mystic Might',45,12,{},'off','✨']];
const PR=P0.map(([id,name,lvl,drain,fx,group,ic])=>({id,name,lvl,drain,fx,group,ic}));const BY={};PR.forEach(p=>BY[p.id]=p);
// exclusive groups; ranged/magic boosts ('off') also clash with att and str (OSRS rule)
const CLASH={def:['def'],str:['str','off'],att:['att','off'],off:['off','att','str'],prot:['prot']};
let st={quick:['prot_melee']};try{const j=JSON.parse(localStorage.getItem(KEY)||'null');if(j&&Array.isArray(j.quick))st.quick=j.quick.filter(k=>BY[k])}catch(_){}
function keep(){try{localStorage.setItem(KEY,JSON.stringify({quick:st.quick}))}catch(_){}}
const on=new Set();let cnt=0,lastTick=-1,setup=false;window.__B3prayOn=on;
function B(){return window.B3}function G(){const b=B();return b&&(b.GM&&b.GM.G||b.G)}function R(){return B().GM.R}
function lvl(k){try{return R().lv(G(),k)}catch(_){return 1}}
function say(t){try{R().msg(G(),t)}catch(_){}}
function fx(){const o={};for(const k of on){const f=BY[k].fx;for(const x in f)o[x]=f[x]}return o}
window.__B3prayFx=fx;
// shared combat hook (spec.js adds its part to the same object)
const H=globalThis.__B3cmb||(globalThis.__B3cmb={parts:{},p(s,n){const o={};for(const k in this.parts){const f=this.parts[k].p;if(!f)continue;const r=f(s,n)||{};for(const x in r)o[x]=(x==='prot'?r[x]:(o[x]||1)*r[x])}return o},after(s,n,d){for(const k in this.parts){const f=this.parts[k].after;if(f)try{f(s,n,d)}catch(_){}}},keep(s){let c=0;for(const k in this.parts){const f=this.parts[k].keep;if(f)c+=f(s)||0}return c}});
H.parts.pray={p:(s,n)=>{const f=fx();const o={};if(f.a)o.a=f.a;if(f.s)o.s=f.s;if(f.d)o.d=f.d;if(f.prot)o.prot=f.prot;return o},keep:()=>on.has('protect_item')?1:0};
function toggle(id,quiet){const p=BY[id],P=G().player;if(on.has(id)){on.delete(id);ui();return}
 if(lvl('prayer')<p.lvl){if(!quiet)say('You need a Prayer level of '+p.lvl+' to use '+p.name+'.');return}
 if((P.pp||0)<1){if(!quiet)say('You need to recharge your Prayer at a well or altar.');return}
 const cl=CLASH[p.group]||[];for(const k of [...on])if(cl.indexOf(BY[k].group)>=0)on.delete(k);on.add(id);ui()}
function quick(){const P=G().player;const anyQ=st.quick.some(k=>on.has(k));if(anyQ){st.quick.forEach(k=>on.delete(k));ui();return}
 if(!st.quick.length){openPanel(true);return}if((P.pp||0)<1){say('You have no prayer points left. Pray at the well to recharge.');return}
 let n=0;st.quick.forEach(k=>{if(lvl('prayer')>=BY[k].lvl){toggle(k,true);n++}});if(!n)say('Your quick-prayers need a higher Prayer level.');ui()}
function step(){const g=G();if(!g)return;if(lastTick<0){lastTick=g.tick;return}const P=g.player;
 while(lastTick<g.tick){lastTick++;
  if(on.size){let e=0;for(const k of on)e+=BY[k].drain;cnt+=e;const res=60+2*Math.max(0,(()=>{try{return R().bonus(g,'pb')||0}catch(_){return 0}})());
   while(cnt>res){cnt-=res;P.pp=Math.max(0,(P.pp||0)-1)}
   if((P.pp||0)<=0){P.pp=0;on.clear();cnt=0;say('You have run out of prayer points, you can recharge at a well.')}
   if(on.has('rapid_heal')&&lastTick%100===50){try{if(P.hp>0&&P.hp<R().maxHp(g))P.hp++}catch(_){}}}
  if(P.hp<=0){on.clear()}}
 if(P.pp>lvl('prayer')&&!on.size){}ui(true)}
// ---------- UI ----------
const css=document.createElement('style');css.textContent='#bwpray .ic{font-size:14px;line-height:14px}#bwpray.act{background:#1d3a5acc!important;box-shadow:0 0 8px #7cf}#bwprayTab{position:relative}'+
 '#bwprayP{position:fixed;z-index:60;background:#2a2418f2;border:2px solid #6b5a3a;border-radius:10px;color:#eee;font:12px sans-serif;padding:6px;display:none;box-sizing:border-box;overflow:auto}'+
 '#bwprayP .g{display:grid;grid-template-columns:repeat(auto-fill,minmax(46px,1fr));gap:4px}#bwprayP .p{border:1px solid #5a4630;border-radius:7px;background:#3a2e1e;color:#ffe9a3;text-align:center;padding:3px 1px;font-size:18px;min-height:40px;cursor:pointer;position:relative}'+
 '#bwprayP .p small{display:block;font-size:8px;color:#ccc;line-height:9px}#bwprayP .p.on{background:#2a5a7a;box-shadow:inset 0 0 6px #9df}#bwprayP .p.lk{opacity:.35}#bwprayP .p.q:after{content:"Q";position:absolute;right:2px;top:0;font-size:8px;color:#7f7}'+
 '#bwprayP .hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;font-weight:700;color:#ffe9a3}#bwprayP .hd button{font:700 11px sans-serif;background:#4a3a26;color:#ffe9a3;border:1px solid #1a140c;border-radius:6px;padding:4px 6px}';
document.head.appendChild(css);
const orb=document.createElement('div');orb.className='orb';orb.id='bwpray';orb.title='Prayer: tap = quick-prayers, hold = set up';orb.innerHTML='<small>PRAY</small><span>1</span>';
const tab=document.createElement('button');tab.id='bwprayTab';tab.title='Prayer';tab.textContent='🙏';
const pn=document.createElement('div');pn.id='bwprayP';
function ui(light){const g=G();if(!g)return;const P=g.player,L=lvl('prayer');orb.querySelector('span').textContent=Math.floor(P.pp||0);orb.classList.toggle('act',on.size>0);
 if(light&&pn.style.display!=='block')return;if(pn.style.display!=='block')return;
 let h='<div class="hd"><span>'+(setup?'Pick quick-prayers':'Prayer')+' '+Math.floor(P.pp||0)+'/'+L+'</span><button id="bwprayQ">'+(setup?'Done':'Quick setup')+'</button></div><div class="g">';
 for(const p of PR){const c=['p'];if(on.has(p.id))c.push('on');if(L<p.lvl)c.push('lk');if(st.quick.indexOf(p.id)>=0)c.push('q');h+='<div class="'+c.join(' ')+'" data-k="'+p.id+'" title="'+p.name+' (level '+p.lvl+')">'+p.ic+'<small>'+(L<p.lvl?'Lv '+p.lvl:(/^Protect /.test(p.name)?p.name.split(' ').slice(-1)[0]:p.name.split(' ')[0]))+'</small></div>'}
 h+='</div>';if(pn._h!==h){pn.innerHTML=h;pn._h=h}}
pn.addEventListener('click',e=>{e.stopPropagation();const q=e.target.closest('#bwprayQ');if(q){setup=!setup;ui();return}const t=e.target.closest('.p');if(!t)return;const k=t.dataset.k;
 if(setup){const i=st.quick.indexOf(k);if(i>=0)st.quick.splice(i,1);else{const cl=CLASH[BY[k].group]||[];st.quick=st.quick.filter(x=>cl.indexOf(BY[x].group)<0);st.quick.push(k)}keep();ui();return}
 toggle(k)},true);
function dock(){const gt=document.getElementById('gtabs');if(gt&&tab.parentNode!==gt)gt.insertBefore(tab,gt.firstChild);const ob=document.getElementById('orbs');if(ob&&orb.parentNode!==ob)ob.appendChild(orb);
 if(!gt)return;const ib=document.getElementById('invb')||gt;const g=gt.getBoundingClientRect(),i=ib.getBoundingClientRect(),land=innerWidth>innerHeight;const S=(k,v)=>pn.style.setProperty(k,v,'important');
 S('top','auto');S('left','auto');S('right',Math.max(4,innerWidth-i.right)+'px');S('bottom',(innerHeight-g.top+6)+'px');S('width',Math.min(land?280:300,innerWidth-16)+'px');
 S('max-height',(land?Math.max(120,g.top-60):Math.min(250,innerHeight*0.3))+'px')}
function shut(){pn.style.display='none';tab.classList.remove('on');setup=false}
function openPanel(su){document.querySelectorAll('.gpan').forEach(p=>{if(getComputedStyle(p).display!=='none'){const t=p.id==='inv'?document.getElementById('invb'):null;if(t)t.click();else p.style.display='none'}});
 const b2=document.getElementById('b2p');if(b2&&b2.style.display==='block'){const t=document.getElementById('b2tab');t&&t.click()}
 setup=!!su;dock();pn.style.display='block';tab.classList.add('on');pn._h='';ui()}
window.__B3prayOpen=openPanel;
tab.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();if(pn.style.display==='block'){shut();return}openPanel(false)},true);
document.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('#gtabs button,#invb');if(t&&t!==tab&&pn.style.display==='block')shut()},true);
let lp=null,lpFired=false;
orb.addEventListener('pointerdown',e=>{e.stopPropagation();lpFired=false;lp=setTimeout(()=>{lpFired=true;openPanel(true)},550)},true);
['pointerup','pointercancel','pointerleave'].forEach(ev=>orb.addEventListener(ev,()=>{clearTimeout(lp)},true));
orb.addEventListener('click',e=>{e.stopPropagation();e.preventDefault();if(lpFired){lpFired=false;return}quick()},true);
for(const ev of ['pointerdown','touchstart','mousedown'])pn.addEventListener(ev,e=>e.stopPropagation(),{passive:true});
document.body.appendChild(pn);
window.__B3prayApi={toggle,quick,on,PR,open:openPanel,step};
function go(){if(!window.__B3ready||!G()){return setTimeout(go,400)}dock();setInterval(step,300);setInterval(dock,1000);addEventListener('resize',()=>setTimeout(dock,150));ui()}
go()})();
