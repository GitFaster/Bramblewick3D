/* Bramblewick mod: core.js — event bus + safe API shims for mods (game code lives in a closure; only window.__bw / BWX are public). */
(function(){try{
if(window.BWEv)return;
var L={},CMD={};function on(e,f){(L[e]=L[e]||[]).push(f)}function emit(e){var a=[].slice.call(arguments,1);(L[e]||[]).forEach(function(f){try{f.apply(null,a)}catch(x){console.warn('[mods] '+e,x)}})}
var xpMult=[];window.BWEv={on:on,emit:emit,cmd:function(n,f){CMD[n]=f},xpMult:function(f){xpMult.push(f)}};
function B(){return window.__bw||{}}
// XP + level events through the game's own BWX hook
function wrapBWX(){var X=window.BWX;if(!X||X.__modwrapped)return!!X;var m=X.mult,a=X.after;X.mult=function(s,v){var r=m?m.apply(X,arguments):v;xpMult.forEach(function(f){try{r=f(s,r)}catch(_){}});return r};X.after=function(s,v,up,n){var r;try{r=a&&a.apply(X,arguments)}catch(_){}emit('xp',s,v);if(up)emit('level',s,n);return r};X.__modwrapped=1;return true}
if(!wrapBWX()){var tw=setInterval(function(){if(wrapBWX())clearInterval(tw)},500)}
// hitpoints xp skips BWX.after, so watch xp object for hitpoints
var lastHpXp=null;
// kills, hurt, items via polling
var lastById=null,dead=new WeakMap(),lastHp=null,lastInv=null;
setInterval(function(){try{var b=B(),P=b.Pl;if(!P)return;
 (b.npcs||[]).forEach(function(n){var d=!!n.dead;if(dead.has(n)&&!dead.get(n)&&d){var dx=Math.abs(n.x-P.x),dy=Math.abs(n.y-P.y);if(Math.max(dx,dy)<=12)emit('kill',n)}dead.set(n,d)});
 if(lastHp!=null&&P.hp<lastHp)emit('hurt',lastHp-P.hp);lastHp=P.hp;
 if(P.inv){var byId={};P.inv.forEach(function(x){if(x)byId[x.id]=(byId[x.id]||0)+(x.n||1)});if(lastById){for(var k in byId){var dlt=byId[k]-(lastById[k]||0);if(dlt>0)emit('gain',k,dlt)}}lastById=byId}
 if(P.inv){var c=0;P.inv.forEach(function(x){if(x)c+=x.n||1});if(lastInv!=null&&c>lastInv)emit('item',c-lastInv);lastInv=c}
}catch(_){}},150);
// commands: capture before the game's own #cmd handler
window.addEventListener('keydown',function(e){try{var t=e.target;if(!t||t.id!=='cmd'||e.key!=='Enter')return;var v=String(t.value||'').trim().toLowerCase();if(!v.startsWith('::'))return;var c=v.slice(2).split(/\s+/);if(CMD[c[0]]){e.preventDefault();e.stopImmediatePropagation();t.value='';t.blur();CMD[c[0]](c.slice(1))}}catch(_){}},true);
// chat feed (game msg() is private) — small overlay above the chatbox
var feed=null;function msg(t,c){try{if(!feed){feed=document.createElement('div');feed.style.cssText='position:fixed;left:50%;transform:translateX(-50%);top:8px;z-index:9400;max-width:92vw;pointer-events:none;font:bold 13px sans-serif;text-align:center';document.body.appendChild(feed)}var d=document.createElement('div');d.textContent=t;d.style.cssText='margin:3px auto;padding:5px 9px;border-radius:5px;background:rgba(0,0,0,.72);color:'+({b:'#ffff00',g:'#7dff8a',r:'#ff6b6b'}[c]||'#fff')+';transition:opacity .6s';feed.appendChild(d);while(feed.children.length>4)feed.removeChild(feed.firstChild);setTimeout(function(){d.style.opacity=0;setTimeout(function(){d.remove()},700)},5000)}catch(_){}}
if(typeof window.msg!=='function')window.msg=msg;
if(typeof window.addXp!=='function')window.addXp=function(s,a){try{B().addXp(s,a)}catch(_){}};
if(typeof window.invCount!=='function')window.invCount=function(id){var c=0;try{B().Pl.inv.forEach(function(x){if(x&&x.id===id)c+=x.n})}catch(_){}return c};
var STACK={coins:1,fishing_bait:1,feather:1};
if(typeof window.addItem!=='function')window.addItem=function(id,n){n=n||1;try{var inv=B().Pl.inv;if(STACK[id]){var s=inv.find(function(x){return x&&x.id===id});if(s){s.n+=n;return n}var e=inv.indexOf(null);if(e<0)return 0;inv[e]={id:id,n:n};return n}var a=0;for(var k=0;k<n;k++){var i=inv.indexOf(null);if(i<0)break;inv[i]={id:id,n:1};a++}return a}catch(_){return 0}};
if(typeof window.addNpc!=='function')window.addNpc=function(kind,x,y,box){var d=B().ND[kind];var n={kind:kind,d:d,x:x,y:y,px:x,py:y,trail:null,sx:x,sy:y,box:box||[x-3,y-3,x+3,y+3],hp:d.hp||1,dead:false,respAt:0,target:null,timer:0,splats:[],say:null,anim:0};B().npcs.push(n);return n};
window.bwTele=function(x,y){try{var P=B().Pl;P.x=P.px=x;P.y=P.py=y;P.path=[];P.trail=null;P.combat=null;P.act=null;return true}catch(_){return false}};
window.bwLv=function(s){try{return B().lv(s)}catch(_){return 1}};

/* v5: inventory redraw — game's setTab() sets dirtyInv; toggling the open Inventory tab triggers renderInv */
var _rq=0;window.bwInvRefresh=function(){if(_rq)return;_rq=setTimeout(function(){_rq=0;try{var b=document.querySelector('#tabbar button[data-t="inv"]'),bk=document.getElementById('bank');if(!b||!b.classList.contains('on'))return;if(bk&&!bk.classList.contains('hidden')&&bk.offsetParent)return;b.click();b.click()}catch(_){}},0)};
var _ai=window.addItem;window.addItem=function(id,n){var r=0;if(typeof id!=='string'||!id){try{console.warn('[mods/core] addItem rejected id',id)}catch(_){}return 0}try{r=_ai(id,n)}catch(_){}try{if(r)window.bwInvRefresh()}catch(_){}return r};
/* v5: spawned NPCs aggro like core monsters (game attacks when n.target===Pl) and don't respawn */
var _an=window.addNpc;window.addNpc=function(k,x,y,box){var n=_an(k,x,y,box);try{if(n){n.bwSpawn=1;n.target=B().Pl;n.timer=2}}catch(_){}return n};
setInterval(function(){try{var b=B(),P=b.Pl,L=b.npcs,now=Date.now();for(var i=L.length-1;i>=0;i--){var n=L[i];if(!n||!n.bwSpawn)continue;if(n.dead){if(!n.bwDeadAt)n.bwDeadAt=now;else if(now-n.bwDeadAt>1500)L.splice(i,1);continue}if(n.bwPassive)continue;if(P.hp>0&&!n.target&&Math.max(Math.abs(n.x-P.x),Math.abs(n.y-P.y))<=10){n.box=[P.x-8,P.y-8,P.x+8,P.y+8];n.target=P}}}catch(_){}},300);
/* v5: keep #bwModBar clear of game UI on the left edge */
function lay(){try{var bar=document.getElementById('bwModBar');if(!bar)return;var H=innerHeight,top=64,bot=H*0.5;['topleft','orbs','topright','mmwrap','chat','side','tabbar','tabpanel','xpdrops','hover','region'].forEach(function(id){var e=document.getElementById(id);if(!e||!e.offsetParent&&getComputedStyle(e).position!=='fixed')return;var r=e.getBoundingClientRect();if(!r.width||!r.height||r.left>8+150||r.right<8)return;if(r.top<H*0.4)top=Math.max(top,r.bottom+6);else bot=Math.min(bot,r.top-6)});var mr=innerWidth-8;['orbs','topright','mmwrap','chat','side','tabbar','tabpanel','hover','region'].forEach(function(id){var e=document.getElementById(id);if(!e)return;var r=e.getBoundingClientRect();if(!r.width||!r.height||getComputedStyle(e).display==='none')return;if(r.bottom>top&&r.top<bot&&r.left>8)mr=Math.min(mr,r.left-6)});var cols=Math.max(1,Math.min(4,Math.floor((mr-8+5)/49)));bar.style.gridAutoFlow='row';bar.style.gridTemplateRows='';bar.style.gridTemplateColumns='repeat('+cols+',44px)';bar.style.gridAutoRows='44px';bar.style.overflowY='auto';bar.style.overflowX='hidden';bar.style.webkitOverflowScrolling='touch';bar.style.top=Math.round(top)+'px';bar.style.maxHeight=Math.max(44,Math.round(bot-top))+'px';bar.style.bottom='auto'}catch(_){}}
lay=function(){};window.bwLayoutBar=lay;addEventListener('resize',function(){setTimeout(lay,50)});setInterval(lay,1500);setTimeout(lay,300);

/* v6: ★ Extras grid menu + panel manager */
(function(){var st=document.createElement('style');st.textContent='#bwModBar{position:fixed!important;left:8px!important;top:var(--bwT,120px)!important;bottom:auto!important;max-height:min(60vh,calc(100vh - var(--bwT,120px) - 16px))!important;display:none!important;grid-template-columns:repeat(4,52px)!important;grid-auto-flow:row!important;grid-auto-rows:52px!important;gap:6px!important;overflow-y:auto!important;padding:8px!important;background:#3e3529;border:3px solid #2a241b;border-radius:8px;z-index:9002!important}#bwModBar.bwOn{display:grid!important}#bwModBar .bwmb{width:52px;height:52px}#bwStar{position:fixed;left:8px;top:calc(var(--bwT,120px) - 50px);z-index:9003;min-width:44px;height:44px;border-radius:8px;border:2px solid #2a241b;background:#5a4c39;color:#ff0;font:bold 14px sans-serif;padding:0 8px;touch-action:manipulation}#bwStar.min{width:44px;padding:0;font-size:20px}.bwmp{left:50%!important;transform:translateX(-50%);top:var(--bwP,170px)!important;width:min(360px,calc(100vw - 24px))!important;max-height:calc(100vh - var(--bwP,170px) - 70px)!important;overflow-y:auto!important;z-index:9004!important;padding-top:4px!important}.bwX{position:sticky;top:0;float:right;width:44px;height:44px;margin:0 0 4px 6px!important;font:bold 22px sans-serif;background:#7a2e1d!important;color:#fff!important;border:2px solid #000!important;border-radius:8px;z-index:2}';document.head.appendChild(st);
var star=document.createElement('button');star.id='bwStar';star.textContent='★ Extras';star.title='Extras menu (hold to collapse)';document.body.appendChild(star);
var mini=bwLoadC('bwStarMin');if(mini)star.classList.add('min'),star.textContent='★';
function bwLoadC(k){try{return localStorage.getItem(k)==='1'}catch(_){return false}}
function bar(){return document.getElementById('bwModBar')}
function pairs(){var B=bar(),bs=B?[].slice.call(B.querySelectorAll('.bwmb')):[],ps=[].slice.call(document.querySelectorAll('.bwmp'));return bs.map(function(b,i){return [b,ps[i]]})}
function vis(p){return p&&p.style.display==='block'}
var busy=0;function closeAll(ex){if(busy)return;busy=1;try{pairs().forEach(function(q){if(q[1]&&q[1]!==ex&&vis(q[1]))q[0].click()})}catch(_){}busy=0}
window.bwCloseAll=function(){closeAll(null);var B=bar();B&&B.classList.remove('bwOn')};
function menu(v){var B=bar();if(!B)return;B.classList.toggle('bwOn',v===undefined?!B.classList.contains('bwOn'):v)}
star.addEventListener('click',function(e){e.stopPropagation();var B=bar();var willOpen=!(B&&B.classList.contains('bwOn'));closeAll(null);menu(willOpen)});
var ht;star.addEventListener('pointerdown',function(e){e.stopPropagation();ht=setTimeout(function(){mini=!mini;star.classList.toggle('min',mini);star.textContent=mini?'★':'★ Extras';try{localStorage.setItem('bwStarMin',mini?'1':'0')}catch(_){}},650)});['pointerup','pointercancel'].forEach(function(t){star.addEventListener(t,function(){clearTimeout(ht)})});
document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('#bwModBar .bwmb');if(!b||busy)return;var q=pairs().find(function(x){return x[0]===b});closeAll(q&&q[1]);menu(false)},true);
function addX(){pairs().forEach(function(q){var p=q[1];if(!p||p.querySelector(':scope>.bwX'))return;var x=document.createElement('button');x.className='bwX';x.textContent='✕';x.title='Close';x.onclick=function(e){e.stopPropagation();if(vis(p))q[0].click();else p.style.display='none'};p.insertBefore(x,p.firstChild)})}
setInterval(addX,250);
addEventListener('keydown',function(e){if(e.key==='Escape')window.bwCloseAll()});
function mapTap(e){if(e.target&&e.target.closest&&e.target.closest('.bwmp,#bwModBar,#bwStar'))return;if(e.target.closest&&e.target.closest('#side,#tabbar,#tabpanel,#chat,#menu,#dialog,#bank,#orbs,#mmwrap,#topright,#worldmap'))return;window.bwCloseAll()}
document.addEventListener('pointerdown',mapTap,true);
function pos(){try{var top=64;['topleft','region','hover'].forEach(function(id){var e=document.getElementById(id);if(!e)return;var r=e.getBoundingClientRect();if(r.width&&r.height&&r.left<160&&r.top<innerHeight*0.4)top=Math.max(top,r.bottom+6)});var T=top+50;document.documentElement.style.setProperty('--bwT',Math.round(T)+'px');document.documentElement.style.setProperty('--bwP',Math.round(T)+'px')}catch(_){}}
pos();setInterval(pos,1500);addEventListener('resize',pos);})();
}catch(e){try{console.warn('[mods/core] failed',e)}catch(_){}}})();
