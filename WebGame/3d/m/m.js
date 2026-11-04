/* Bramblewick 3D merged build (classic engine + OSRS look): cache icons, OSRS store, stone HUD with cache tab sprites. */
(function(){const BUILD=window.__MBUILD||'v21';const V='?v='+BUILD.replace(/\D/g,'');const IC=id=>'m/icons/'+id+'.png'+V,SP=n=>'m/sprites/'+n+'.png'+V;
const b=document.createElement('div');b.id='mbuild';b.textContent=BUILD;document.body.appendChild(b);
function go(){const B=window.B3;if(!B||!B.GM||!B.G||!document.getElementById('inv'))return setTimeout(go,300);
 const GM=B.GM,G=B.G,R=GM.R,D=G.defs,I=D.items,P=()=>G.player,pan=document.getElementById('inv');
 const nm=id=>(I[id]&&I[id].n)||id;const say=t=>{try{R.msg(G,t)}catch(e){}const c=document.getElementById('chat');if(c){const d=document.createElement('div');d.innerHTML=t;c.appendChild(d);while(c.children.length>60)c.firstChild.remove()}};
 const img=id=>`<img class="mi" src="${IC(id)}" alt="" onerror="this.replaceWith(Object.assign(document.createElement('b'),{textContent:${JSON.stringify('')}+this.alt}))">`;
 // ---------- OSRS store ----------
 const stock=()=>D.shops.general_stall.buy;
 const sellP=id=>{const d=I[id];return (D.sellPrices&&D.sellPrices[id])||Math.max(1,Math.floor(((d&&d.v)||1)*.4))};
 function storeHTML(){return `<div class="ph">General Store <span>${R.invCount(G,'coins')} gp</span></div><div class="ostore">`+stock().map((r,k)=>`<div class="si" data-mb="${k}">${img(r.item)}<small>${r.price}</small></div>`).join('')+`</div><div class="ph" style="font-size:11px">Tap stock: Value / Buy 1·5·10 — tap your items: Value / Sell 1·5·10</div>`}
 // ---------- menu ----------
 const mm=document.createElement('div');mm.id='mmenu';document.body.appendChild(mm);let ML=[];
 let mmT=0;function menu(x,y,title,list){ML=list;mmT=performance.now();mm.innerHTML=`<div class="h">${title}</div>`+list.map((e,i)=>`<div class="e" data-i="${i}">${e[0]}</div>`).join('')+'<div class="e" data-i="x">Cancel</div>';mm.style.display='block';mm.style.left=Math.max(4,Math.min(x-85,innerWidth-180))+'px';mm.style.top=Math.max(4,Math.min(y-20,innerHeight-mm.offsetHeight-4))+'px'}
 const closeM=()=>{mm.style.display='none';ML=[]};
 mm.addEventListener('click',e=>{e.stopPropagation();const t=e.target.closest('.e');if(!t)return;const i=t.dataset.i;if(performance.now()-mmT<250)return;const f=i!=='x'&&ML[+i]&&ML[+i][1];closeM();if(f)f()});
 addEventListener('pointerdown',e=>{if(mm.style.display==='block'&&!mm.contains(e.target))closeM()},true);
 addEventListener('contextmenu',e=>e.preventDefault());
 const redraw=()=>{try{GM.save&&GM.save()}catch(e){}GM.open(GM.uiMode()||'inv')};
 function buy(k,n){const r=stock()[k];let c=0;for(let j=0;j<n;j++){if(!R.stallBuy(G,r.item))break;c++}if(c)say(`You buy ${c>1?c+' x ':'a '}${nm(r.item)} for ${c*r.price} coins.`);else say("You don't have enough coins or inventory space.");redraw()}
 function sell(id,n){let c=0,t=0;for(let j=0;j<n;j++){const i=P().inv.findIndex(s=>s&&s.id===id);if(i<0)break;const p=sellP(id);R.removeSlot(G,i,1);R.grant(G,'coins',p);t+=p;c++}if(c)say(`You sell ${c>1?c+' x ':'the '}${nm(id)} for ${t} coins.`);redraw()}
 pan.addEventListener('click',e=>{if(GM.uiMode()==='shop'&&e.target.closest('[data-mb],.slot[data-i]')){e.stopPropagation();e.preventDefault()}},true);
 pan.addEventListener('pointerdown',e=>{if(GM.uiMode()!=='shop')return;const sb=e.target.closest('[data-mb]');const sl=e.target.closest('.slot[data-i]');
  if(sb){e.stopPropagation();e.preventDefault();const k=+sb.dataset.mb,r=stock()[k];menu(e.clientX,e.clientY,nm(r.item),[['Value',()=>say(`${nm(r.item)}: currently costs ${r.price} coins.`)],['Buy 1',()=>buy(k,1)],['Buy 5',()=>buy(k,5)],['Buy 10',()=>buy(k,10)],['Examine',()=>say((I[r.item]&&I[r.item].ex)||'')]]);return}
  if(sl){e.stopPropagation();e.preventDefault();const it=P().inv[+sl.dataset.i];if(!it||it.id==='coins')return;const id=it.id;menu(e.clientX,e.clientY,nm(id),[['Value',()=>say(`${nm(id)}: shop will buy for ${sellP(id)} coins.`)],['Sell 1',()=>sell(id,1)],['Sell 5',()=>sell(id,5)],['Sell 10',()=>sell(id,10)],['Examine',()=>say((I[id]&&I[id].ex)||'')]])}},true);
 // ---------- decorate panel with cache icons ----------
 let busy=0;function deco(){if(busy)return;busy=1;try{
  const sh=pan.querySelector('.shop');pan.classList.toggle('mshop',!!sh||!!pan.querySelector('.mshopw'));if(sh){const ph=sh.previousElementSibling;if(ph&&ph.classList.contains('ph'))ph.remove();sh.remove();const w=document.createElement('div');w.className='mshopw';const L=document.createElement('div');L.className='msL';L.innerHTML=storeHTML();const Rr=document.createElement('div');Rr.className='msR';while(pan.firstChild)Rr.appendChild(pan.firstChild);w.append(L,Rr);pan.appendChild(w)}
  const inv=P().inv;pan.querySelectorAll('.slot[data-i]:not([data-d])').forEach(s=>{const it=inv[+s.dataset.i];s.dataset.d=1;if(!it||s.classList.contains('e'))return;s.title=nm(it.id);s.innerHTML=img(it.id)+(it.n>1?`<i class="q">${it.n>=1e5?Math.floor(it.n/1000)+'K':it.n}</i>`:'')});
  pan.querySelectorAll('.slot[data-b]:not([data-d])').forEach(s=>{const k=s.dataset.b,n=P().bank[k];s.dataset.d=1;s.title=nm(k);s.innerHTML=img(k)+(n>1?`<i class="q">${n}</i>`:'')});
  pan.querySelectorAll('.slot.eq[data-eq]:not([data-d])').forEach(s=>{const id=P().equip[s.dataset.eq];s.dataset.d=1;if(id)s.innerHTML=`<small>${s.dataset.eq}</small>`+img(id)});
 }catch(e){console.warn('deco',e)}busy=0}
 new MutationObserver(deco).observe(pan,{childList:true,subtree:true});deco();
 // ---------- stone tabs with cache sprites ----------
 const TS={'🎒':'tab_inv','🙏':'tab_prayer','⚔️':'tab_equip','📊':'tab_skills','✦✦':'tab_magic','✦':'tab_magic','▦':'tab_combat','📜':'tab_quests','⚙️':'tab_settings'};
 function tabs(){document.querySelectorAll('#gtabs button,#invb').forEach(bt=>{if(bt.dataset.ts)return;const t=[...bt.childNodes].filter(x=>x.nodeType===3).map(x=>x.textContent).join('').trim()||bt.textContent.trim();const k=TS[t]||TS[bt.textContent.trim()];if(!k)return;bt.dataset.ts=1;bt.title=t;[...bt.childNodes].forEach(x=>{if(x.nodeType===3)x.remove()});const im=document.createElement('img');im.className='ts';im.src=SP(k);im.alt='';bt.prepend(im)})}
 tabs();setInterval(tabs,1500);
 // ---------- extra OSRS items: scimitars + bronze armour, stocked in the General Store ----------
 (function addItems(){const X={bronze_scimitar:{v:32,n:'Bronze scimitar',slot:'weapon',ab:7,sb:6,ex:'A vicious, curved sword.',_after:'bronze_axe'},iron_scimitar:{v:112,n:'Iron scimitar',slot:'weapon',ab:11,sb:10,ex:'A vicious, curved sword.',_after:'bronze_scimitar'},bronze_med_helm:{v:24,n:'Bronze med helm',slot:'head',db:3,ex:'A medium sized helmet.',_after:'leather_cap'},bronze_platebody:{v:160,n:'Bronze platebody',slot:'body',db:9,ex:'Provides excellent protection.',_after:'bronze_med_helm'},mithril_scimitar:{v:1040,n:'Mithril scimitar',slot:'weapon',ab:16,sb:15,ex:'A vicious, curved mithril sword.',_after:'iron_scimitar'},mithril_med_helm:{v:520,n:'Mithril med helm',slot:'head',db:9,ex:'A light but strong helmet.',_after:'bronze_platebody'},mithril_platebody:{v:5200,n:'Mithril platebody',slot:'body',db:22,ex:'Light, strong mithril armour.',_after:'mithril_med_helm'}};
  const sets=[GM.DEF&&GM.DEF.items,G.defs&&G.defs.items].filter(Boolean);const shops=[GM.DEF&&GM.DEF.shops,G.defs&&G.defs.shops].filter(Boolean);
  for(const [id,d] of Object.entries(X)){const {_after,...def}=d;def.sellPrice=null;sets.forEach(S=>{if(!S[id])S[id]={...def}});
   shops.forEach(SH=>{const b=SH.general_stall&&SH.general_stall.buy;if(!b||b.some(r=>r.item===id))return;const i=b.findIndex(r=>r.item===_after);b.splice(i<0?b.length:i+1,0,{item:id,price:def.v})})}})();
 // ---------- OSRS-like starter extras (shrimp + logs), once per name ----------
 (function kit2(t){try{if(window.__B3started===undefined||document.getElementById('bwacct')){if(t<60)setTimeout(()=>kit2(t+1),5000);return}const K='m_kit3',nm0=P().name||'guest',f=JSON.parse(localStorage.getItem(K)||'{}');if(f[nm0])return;const got=[];for(const [id,n] of [['mithril_scimitar',1],['mithril_med_helm',1],['mithril_platebody',1],['cooked_trout',4],['raw_shrimp',2],['logs',2]]){if(!(P().inv||[]).some(x=>x&&x.id===id)&&R.addItem(G,id,n))got.push(nm(id))}R.grant(G,'coins',500);got.push('500 coins');f[nm0]=1;localStorage.setItem(K,JSON.stringify(f));if(got.length){say('Starter pack: '+got.join(', ')+'.');if(GM.uiMode())redraw()}}catch(e){console.warn('kit2',e)}})(0);
 // ---------- hide floating buttons over open panel; spell sprites in magic book ----------
 const SPN={wind:'wind_strike',water:'water_strike',earth:'earth_strike',fire:'fire_strike'};
 setInterval(()=>{try{const op=getComputedStyle(pan).display!=='none'&&pan.offsetWidth>0;document.body.classList.toggle('mpanel',op);
  const pr=pan.getBoundingClientRect();document.querySelectorAll('button,.hud').forEach(e=>{if(e.closest('#gtabs,#inv,#mmenu,#menu,#bwacct,#chat')||e.id==='invb')return;if(!op){e.classList.remove('mhide');return}if(e.classList.contains('mhide'))return;const r=e.getBoundingClientRect();if(r.width&&r.right>pr.left&&r.left<pr.right&&r.bottom>pr.top&&r.top<pr.bottom)e.classList.add('mhide')});
  document.querySelectorAll('button,div').forEach(e=>{if(!e.classList.contains('mauto')&&e.childElementCount<3&&/^\s*AUTO\s*(ON|OFF)\s*$/i.test(e.textContent))e.classList.add('mauto')});
  const bp=document.getElementById('b2p');if(bp)bp.querySelectorAll('.s').forEach(r=>{if(r.querySelector('img.msp'))return;const c=r.querySelector('[data-c]');const k=c&&SPN[c.dataset.c];if(!k)return;const im=document.createElement('img');im.className='msp';im.src=SP('sp_'+k);if(r.classList.contains('off'))im.style.opacity='.35';r.prepend(im)})}catch(e){}},500);
 // ---------- v27 mobile: login keyboard handling, small tap targets, context menu clamp ----------
 const vv=window.visualViewport;function fitAcct(){const a=document.getElementById('bwacct');if(!a)return;if(vv){a.style.setProperty('height',vv.height+'px','important');a.style.setProperty('top',vv.offsetTop+'px','important');a.style.setProperty('bottom','auto','important')}}
 if(vv){vv.addEventListener('resize',fitAcct);vv.addEventListener('scroll',fitAcct)}
 document.addEventListener('focusin',e=>{if(e.target.closest&&e.target.closest('#bwacct')&&/INPUT/.test(e.target.tagName)){fitAcct();setTimeout(()=>{fitAcct();e.target.scrollIntoView({block:'center',behavior:'smooth'})},320)}});
 function hits(){document.querySelectorAll('button,#bwnet,#mpb,#b3mapb,[onclick]').forEach(e=>{if(e.classList.contains('mhit')||e.closest('#gtabs,#inv,#mmenu,#menu,#bwacct'))return;const r=e.getBoundingClientRect();if(!r.width||(r.width>=44&&r.height>=44))return;if(getComputedStyle(e).position==='static')return;e.classList.add('mhit')})}
 setInterval(hits,2000);hits();
 const cm=document.getElementById('menu');if(cm){let cl=0;new MutationObserver(()=>{if(cl||getComputedStyle(cm).display==='none')return;cl=1;requestAnimationFrame(()=>{const r=cm.getBoundingClientRect(),m=8;let x=r.left,y=r.top;if(r.right>innerWidth-m)x=innerWidth-m-r.width;if(r.bottom>innerHeight-m)y=innerHeight-m-r.height;x=Math.max(m,x);y=Math.max(m,y);if(Math.abs(x-r.left)>1)cm.style.left=x+'px';if(Math.abs(y-r.top)>1)cm.style.top=y+'px';cl=0})}).observe(cm,{attributes:true,attributeFilter:['style'],childList:true})}
 // ---------- OSRS welcome screen: Existing User / New User ----------
 function welcome(){const a=document.getElementById('bwacct');if(!a||a.dataset.mw)return;const c=a.querySelector('.c'),u=a.querySelector('#bwu'),inb=a.querySelector('#bwin'),rg=a.querySelector('#bwreg'),gs=a.querySelector('#bwg');if(!c||!u||!inb||!rg)return;a.dataset.mw=1;
  const w=document.createElement('div');w.className='mwel';w.innerHTML='<div class="mlogo">Bramblewick</div><h2>Welcome to Bramblewick</h2><div class="mwb"><button type="button" class="mnew">New User</button><button type="button" class="mold">Existing User</button></div>'+'<p class="mreq">An online account is required to play. Your progress saves to the cloud.</p>';
  c.prepend(w);c.classList.add('mstep0');const h3=c.querySelector('h3');
  const back=document.createElement('button');back.type='button';back.className='mback';back.textContent='Back';c.appendChild(back);
  const step=m=>{c.classList.remove('mstep0','mnewu','moldu');c.classList.add(m);if(h3)h3.textContent=m==='mnewu'?'Create a new account':m==='moldu'?'Existing user':h3.textContent;if(m!=='mstep0')setTimeout(()=>u.focus(),50)};
  w.querySelector('.mnew').onclick=()=>step('mnewu');w.querySelector('.mold').onclick=()=>step('moldu');back.onclick=()=>step('mstep0');const g2=w.querySelector('.mgst');if(g2)g2.onclick=()=>gs.click()}
 new MutationObserver(welcome).observe(document.body,{childList:true});welcome();
 /*v34 combat/fire/ring/spell/items/arena*/try{(function(){const B=()=>window.B3,P=()=>G.player,T=()=>B()&&B().THREE;let lastC=null,ring=null,fires=[],deco=false,tSel=false,pdT=0,combo=0,comboUntil=0,comboEl=null;
    const cmbCss=document.createElement('style');cmbCss.textContent='#cmbfun{position:fixed;z-index:35;left:50%;top:calc(env(safe-area-inset-top) + 78px);transform:translate(-50%,-8px) scale(.9);opacity:0;pointer-events:none;padding:5px 12px;border:1px solid #ffcf4a;border-radius:999px;background:linear-gradient(#4b3214dd,#1c120add);box-shadow:0 0 18px #ffae3566;color:#ffe6a0;font:900 13px Georgia,serif;text-shadow:1px 1px #000;transition:opacity .18s,transform .18s;white-space:nowrap}#cmbfun.on{opacity:1;transform:translate(-50%,0) scale(1)}#cmbfun.hot{color:#fff3a6;border-color:#ff7b28;box-shadow:0 0 22px #ff5a2488}';document.head.appendChild(cmbCss);
    function cmbShow(text,hot){if(!comboEl){comboEl=document.createElement('div');comboEl.id='cmbfun';document.body.appendChild(comboEl)}comboEl.textContent=text;comboEl.classList.toggle('hot',!!hot);comboEl.classList.add('on');comboUntil=performance.now()+3500}
    function cmbImpact(id){const en=(B().npcs||[]).find(q=>q.gi===id);if(!en||!en.g)return;en._cmbHit=performance.now();en._cmbBaseScale=en._cmbBaseScale||en.g.scale.clone()}
    function cmbEvents(evs){for(const e of evs||[]){if(e.t==='hit'&&e.by==='player'){if(e.dmg>0){combo++;cmbImpact(e.npc);cmbShow('⚔ '+combo+' hit'+(combo===1?'':'s')+' combo',combo>=3)}else{combo=0;if(comboEl)comboEl.classList.remove('on')}}else if(e.t==='kill'&&e.by===undefined){cmbShow('🏆 Victory! '+(combo?combo+' hit streak':'Enemy defeated'),true);combo=0}else if(e.t==='death'){combo=0;if(comboEl){comboEl.textContent='☠ You were defeated';comboEl.classList.add('on');comboUntil=performance.now()+2500}}}}
    const pf=window.__B3fx;window.__B3fx=ev=>{try{pf&&pf(ev)}catch(e){}try{cmbEvents(ev)}catch(e){}try{for(const e of ev||[])if(e.t==='fire')mkFire(e.x,e.y)}catch(e){}};
const nodeKind=o=>{const g=G.objs[o];return g&&GM.DEF.nodes&&GM.DEF.nodes[g.type]&&GM.DEF.nodes[g.type].kind};
const W=(x,y)=>[x,B().hAt(x,y),y];
function mkFire(x,y){const TH=T(),g=new TH.Group(),bm=new TH.MeshLambertMaterial({color:0x5a3a1e});for(let k=0;k<2;k++){const l=new TH.Mesh(new TH.BoxGeometry(.7,.12,.14),bm);l.rotation.y=k?Math.PI/2.6:-.3;l.position.y=.07;g.add(l)}
const fl=[];[[0xff5a00,.26,.7],[0xffa500,.18,.55],[0xfff060,.1,.4]].forEach(c=>{const m=new TH.Mesh(new TH.ConeGeometry(c[1],c[2],7),new TH.MeshBasicMaterial({color:c[0],transparent:true,opacity:.85,depthWrite:false}));m.position.y=.12+c[2]/2;g.add(m);fl.push(m)});
const p=W(x,y);g.position.set(p[0],p[1],p[2]);B().S.add(g);g.name='mfire';fires.push({g,fl,t0:performance.now()})}
function arena(){const TH=T(),S=B().S,wm=new TH.MeshLambertMaterial({color:0x7a5230}),x0=25.5,x1=38.5,y0=34.5,y1=42.5,g=new TH.Group();g.name='marena';
const post=(x,y)=>{const m=new TH.Mesh(new TH.BoxGeometry(.14,.8,.14),wm);m.position.set(x,B().hAt(x,y)+.4,y);g.add(m)};
const rail=(ax,ay,bx,by)=>{const L=Math.hypot(bx-ax,by-ay),m=new TH.Mesh(new TH.BoxGeometry(L,.08,.06),wm);m.position.set((ax+bx)/2,B().hAt((ax+bx)/2,(ay+by)/2)+.55,(ay+by)/2);m.rotation.y=-Math.atan2(by-ay,bx-ax);g.add(m)};
for(let x=x0;x<=x1;x+=1)[y0,y1].forEach(y=>post(x,y));for(let y=y0+1;y<y1;y+=1)[x0,x1].forEach(x=>{if(!(x===x0&&Math.abs(y-38.5)<1.1))post(x,y)});
for(let x=x0;x<x1;x+=1){rail(x,y0,x+1,y0);rail(x,y1,x+1,y1)}for(let y=y0;y<y1;y+=1){rail(x1,y,x1,y+1);if(!(Math.abs(y+.5-38.5)<1.1))rail(x0,y,x0,y+1)}
[[x0,y0],[x1,y0],[x0,y1],[x1,y1]].forEach(([x,y])=>{const t=new TH.Mesh(new TH.ConeGeometry(.12,.3,6),new TH.MeshBasicMaterial({color:0xffa020}));t.position.set(x,B().hAt(x,y)+1,y);g.add(t)});
const bn=new TH.Mesh(new TH.PlaneGeometry(2.2,.6),new TH.MeshBasicMaterial({color:0x8b1a1a,side:2}));bn.position.set(x0,B().hAt(x0,38.5)+1.5,36.6);bn.rotation.y=Math.PI/2;g.add(bn);
const fc=[0xe84a5f,0xf7d23e,0xffffff,0x9b59b6];for(let i=0;i<60;i++){const x=15+((i*7.3)%22),y=27+((i*5.1)%18);if(x>x0-1&&x<x1+1&&y>y0-1&&y<y1+1)continue;const f=new TH.Mesh(new TH.SphereGeometry(.07,5,4),new TH.MeshBasicMaterial({color:fc[i%4]}));f.position.set(x,B().hAt(x,y)+.06,y);g.add(f)}
g.traverse(o=>{o.raycast=()=>{}});S.add(g)}
function tick(){try{const b=B();if(!b||!b.npcs||!G)return;const p=P(),TH=T(),now=performance.now();if(comboEl&&now>comboUntil)comboEl.classList.remove('on');if(!deco){deco=true;arena()}
if(p.combat!=null)lastC=p.combat;else if(lastC!=null){const n=G.npcs[lastC],o=p.act&&p.act.kind==='obj'?p.act.o:(p.skill&&p.skill.o!=null?p.skill.o:null),k=o!=null&&nodeKind(o);
if(n&&!n.dead&&n.target&&k&&/tree|rock|fish/.test(k)){p.combat=lastC;p.act=null;p.skill=null;if(p.path)p.path.length=0;say('You are in combat! Finish the fight first.')}else if(!n||n.dead||(p.act&&p.act.kind!=='obj'))lastC=null}
for(const e of b.npcs){if(e.gi==null)continue;const g=G.npcs[e.gi];if(!g)continue;
    if(e._cmbHit){const a=(now-e._cmbHit)/220;if(a<1){const k=1+Math.sin(a*Math.PI)*.12;e.g.scale.copy(e._cmbBaseScale).multiplyScalar(k)}else{e.g.scale.copy(e._cmbBaseScale);e._cmbHit=0}}
if(!g.dead&&(p.combat===e.gi||g.target)&&Math.max(Math.abs(g.x-p.x),Math.abs(g.y-p.y))<=2)e.tyaw=Math.atan2(p.x-g.x,p.y-g.y)}
const o=p.act&&p.act.kind==='obj'?p.act.o:(p.skill&&p.skill.o!=null?p.skill.o:null),enemy=p.combat!=null&&G.npcs[p.combat]&&!G.npcs[p.combat].dead?G.npcs[p.combat]:null,focus=enemy||o!=null&&G.objs[o];
if(focus){if(!ring){ring=new TH.Mesh(new TH.RingGeometry(.6,.82,32),new TH.MeshBasicMaterial({color:0xffee33,transparent:true,depthWrite:false,side:2}));ring.rotation.x=-Math.PI/2;ring.raycast=()=>{};ring.renderOrder=3;ring.name='mring';b.S.add(ring)}
const q=W(focus.x,focus.y);ring.position.set(q[0],q[1]+.06,q[2]);ring.visible=true;ring.material.color.setHex(enemy?0xff5a4d:0xffee33);ring.material.opacity=.55+.35*Math.sin(performance.now()/180)}else if(ring)ring.visible=false;
fires=fires.filter(f=>{if(now-f.t0>60000){b.S.remove(f.g);return false}f.fl.forEach((m,i)=>{m.scale.set(1,.8+.35*Math.abs(Math.sin(now/90+i*1.7)),1)});return true})}catch(e){}}
(function lp(){tick();requestAnimationFrame(lp)})();
/* OSRS item taps: tap = primary action; tinderbox -> logs = light */
document.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.slot'))pdT=performance.now()},true);
document.addEventListener('click',e=>{const s=e.target.closest&&e.target.closest('.slot');if(!s||s.dataset.b||s.dataset.i==null||document.body.classList.contains('mshopmode'))return;if(performance.now()-pdT>450){tSel=false;return}
const it=P().inv[+s.dataset.i];if(!it)return;setTimeout(()=>{const mn=document.querySelector('#menu');if(!mn||mn.style.display==='none')return;const es=[...mn.querySelectorAll('.e')],tx=es.map(x=>x.textContent);if(tx.some(t=>/Deposit|Sell/.test(t))){tSel=false;return}
const pick=w=>{const x=es.find(z=>z.textContent===w);if(x){x.click();return true}return false};
if(tSel){tSel=false;document.querySelectorAll('.mtsel').forEach(x=>x.classList.remove('mtsel'));if(pick('Light'))return;say('Nothing interesting happens.');pick('Cancel');return}
if(it.id==='tinderbox'){pick('Cancel');tSel=true;s.classList.add('mtsel');say('Use Tinderbox -> (tap the logs)');return}
for(const w of['Wield','Wear','Eat','Bury'])if(pick(w))return},0)},false);
/* quick spell */
const qb=document.createElement('button');qb.id='mqs';qb.textContent='⚡';qb.title='Quick cast';document.body.appendChild(qb);
let qbT=0;qb.addEventListener('click',e=>{e.stopPropagation();if(performance.now()-qbT<800)return;qbT=performance.now();const p=P();if(p.combat==null){let best=null,bd=9;G.npcs.forEach((n,i)=>{const d=GM.DEF.npcs[n.kind];if(n.dead||!d||!(d.ops||[]).includes('Attack'))return;const dd=Math.max(Math.abs(n.x-p.x),Math.abs(n.y-p.y));if(dd<bd){bd=dd;best=i}});if(best==null){say('No monster nearby to cast at.');return}R.attack(G,best);say('Charging a spell...')}
const t0=performance.now();(function w(){if(P().combat==null&&performance.now()-t0<6000)return setTimeout(w,150);if(P().combat==null){say('Could not reach the target.');return}cast()})();function cast(){setTimeout(()=>{let pn=document.querySelector('#b2p');const vis=pn&&pn.offsetParent;if(!vis){const tb=[...document.querySelectorAll('#gtabs button')].find(b=>(b.title||'').includes('✦'));tb&&tb.click()}
setTimeout(()=>{pn=document.querySelector('#b2p');const bs=pn?[...pn.querySelectorAll('.s:not(.off) [data-c]')]:[];if(!bs.length){say('You need runes to cast.');}else bs[bs.length-1].click();if(!vis){const tb=[...document.querySelectorAll('#gtabs button')].find(b=>(b.title||'').includes('✦'));tb&&tb.click()}},60)},30)}});
})()}catch(e){console.warn('v34',e)}


/*v35 login gate + remembered username + placeholder colours*/try{(function(){const A=()=>window.__B3online||{};
setInterval(()=>{const e=document.getElementById('bwe');if(e){const t=e.textContent;if(/^Server unreachable/.test(t))e.textContent="Can't reach the server (tried 3 times). Check Wi-Fi or cellular, then tap Log in again.";else if(/^Wrong username or password$/.test(t))e.textContent='Wrong username or password. Bramblewick accounts are separate from the OSRS client: tap Create account if you are new.';else if(t==='…'&&window.__mlogTry>1)e.textContent='Connecting… (try '+window.__mlogTry+' of 3)'}},400);
setInterval(()=>{const a=A(),logged=!!a.user;document.body.classList.toggle('mgate',!logged);if(logged)return;if(!document.getElementById('bwacct')){const pill=document.getElementById('bwnet');pill&&pill.click()}
const u=document.querySelector('#bwacct #bwu');if(u&&!u.dataset.mr){u.dataset.mr=1;const v=localStorage.getItem('m.lastUser')||localStorage.getItem('bwl.user');if(v&&!u.value)u.value=v}
document.querySelectorAll('#bwacct #bwin,#bwacct #bwreg').forEach(b=>{if(!b.dataset.mr){b.dataset.mr=1;b.addEventListener('click',()=>{const x=document.querySelector('#bwacct #bwu');if(x&&x.value.trim())localStorage.setItem('m.lastUser',x.value.trim())},true)}})},700);
const PC={goblin:[0x4f8a2b,.82],skeleton:[0xe8e2d0,1],zombie:[0x6f8f5a,1],darkwiz:[0x4b2a7a,1],bknight:[0x2a2a2a,1.05],hillgiant:[0xb08060,1.5],mossgiant:[0x4f7f3a,1.7],demon:[0xb02020,1.4],ashlord:[0x802010,1.6]};
setInterval(()=>{const b=window.B3;if(!b||!b.npcs)return;for(const e of b.npcs){if(e._mt||!e.g)continue;const k=e.d&&e.d.kind,c=PC[k];if(!c){e._mt=1;continue}e._mt=1;if(!e.g.userData.placeholder&&k!=='goblin')continue;e.g.scale.multiplyScalar(c[1]);const TH=b.THREE;e.g.traverse(m=>{if(m.isMesh&&m.material&&m.material.color){m.material=m.material.clone();m.material.color.lerp(new TH.Color(c[0]),.6)}})}},1000);
})()}catch(e){console.warn('v35',e)}
window.__M={G,GM,R,menu,deco,BUILD};}
go()})();

/* v36: Tarnish cache ground textures (path/sand/rock) */
(function(){let done=0;const iv=setInterval(()=>{const B=window.B3;if(done||!B||!B.THREE)return;let mat=null;let root=null;for(const k in B){const v=B[k];if(v&&v.isScene){root=v;break}}if(!root&&B.cam){let c=B.cam;while(c.parent)c=c.parent;if(c.isScene)root=c}if(!root&&window.__mScene)root=window.__mScene;if(!root&&!window.__mHook&&B.THREE.Object3D){window.__mHook=1;const P=B.THREE.Object3D.prototype,u=P.updateMatrixWorld;P.updateMatrixWorld=function(f){if(this.isScene){window.__mScene=this;P.updateMatrixWorld=u}return u.call(this,f)}}if(!root)return;root.traverse(o=>{if(!mat&&o.isMesh&&o.geometry&&o.geometry.attributes&&o.geometry.attributes.sp0)mat=o.material});if(!mat)return;done=1;clearInterval(iv);const T=B.THREE,L=new T.TextureLoader(),V='?v=36';const ld=n=>{const t=L.load('m/tex/'+n+'.png'+V,()=>{mat.needsUpdate=true});t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;return t};const D=ld(118),Sd=ld(38),R=ld(10);const o=mat.onBeforeCompile;mat.onBeforeCompile=function(sh,r){o&&o.call(this,sh,r);if(sh.uniforms.tD){sh.uniforms.tD.value=D;sh.uniforms.tS.value=Sd;sh.uniforms.tR.value=R}window.__mtex=1};mat.needsUpdate=true},500);setTimeout(()=>clearInterval(iv),60000)})();
