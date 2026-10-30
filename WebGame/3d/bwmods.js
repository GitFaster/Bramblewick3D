/* Bramblewick 3D: bridge so the 2D mods (/mods/*.js) run in 3D. Exposes window.__bw/BWX backed by B3 game state.
   Mods keep their own localStorage keys (shared with 2D, same origin). The 3D save format is untouched (toSave picks fields).
   Unsupported: addNpc spawns (mods degrade), ::commands (no #cmd box), 2D-map teleport coords (checked for walkability). */
(function(){if(window.__bwShim)return;window.__bwShim=1;
function go(){var B=window.B3;if(!B||!B.GM||!B.G){return setTimeout(go,400)}
 var GM=B.GM,R=GM.R,G=function(){return B.GM.G||B.G};
 var W=new WeakMap();function wrap(n){var w=W.get(n);if(w)return w;var D=G().defs.npcs;
  w={get x(){return n.x},set x(v){},get y(){return n.y},set y(v){},get dead(){return !!n.dead},get hp(){return n.hp},set hp(v){},get kind(){return n.kind},get d(){var d=D[n.kind]||{};return {name:d.name||n.kind,lvl:d.lvl,hp:d.hp}},get target(){return n.target},set target(v){},box:null,splats:[]};W.set(n,w);return w}
 function lv(s){try{return R.lvlOf((G().player.xp||{})[s]||0)}catch(_){return 1}}
 function save(){try{GM.save&&GM.save()}catch(_){}}
 var ND={};try{var dn=G().defs.npcs;for(var k in dn)ND[k]=dn[k]}catch(_){}
 window.__bw={get Pl(){return G().player},get npcs(){return G().npcs.map(wrap)},ND:ND,objs:[],gitems:[],
  addXp:function(s,a){try{R.addXp(G(),s,+a||0);save()}catch(_){}},lv:lv,proj:function(x,y){try{return B.proj(x,y)}catch(_){return null}},cam:{zoom:1},is3d:true};
 window.msg=function(t){try{R.msg(G(),String(t))}catch(_){}};
 window.addXp=function(s,a){window.__bw.addXp(s,a)};
 window.invCount=function(id){var c=0;try{G().player.inv.forEach(function(x){if(x&&x.id===id)c+=x.n})}catch(_){}return c};
 window.addItem=function(id,n){n=n||1;try{if(!G().defs.items[id]){window.msg('(3D) '+id+' is 2D-only, not added.');return 0}var a=R.addItem(G(),id,n);if(a<n)window.msg('Your inventory is too full.');save();return a}catch(_){return 0}};
 window.addNpc=function(){return null};
 window.bwInvRefresh=function(){};
 var X={mult:function(s,v){return v},after:function(){}};window.BWX=X;
 var last={};try{for(var s in G().player.xp)last[s]=lv(s)}catch(_){}
 var prev=window.__B3fx;window.__B3fx=function(evs){var r;if(prev)r=prev(evs);try{(evs||[]).forEach(function(e){if(e&&e.t==='xp'){var b=last[e.skill]||1,n=lv(e.skill);last[e.skill]=n;try{window.BWX.after(e.skill,e.amount,n>b,n)}catch(_){}}})}catch(_){}return r};
 function tele(x,y){try{var g=G(),P=g.player;x=x|0;y=y|0;if(!R.walkable(g,x,y)){window.msg("You can't teleport there in 3D.");return false}P.x=x;P.y=y;P.path=[];P.combat=null;P.act=null;save();return true}catch(_){return false}}
 function fix(){window.bwTele=tele;window.bwLv=lv;window.addNpc=function(){return null};window.bwInvRefresh=function(){}}
 var st=document.createElement('style');st.textContent='#bwStar{left:auto!important;right:8px!important;top:calc(env(safe-area-inset-top) + 124px)!important;padding:6px 9px!important;font-size:13px!important}#bwModBar{left:auto!important;right:6px!important;top:calc(env(safe-area-inset-top) + 172px)!important;max-height:calc(100vh - 330px)!important;overflow-y:auto!important}';document.head.appendChild(st);
 fetch('/mods/manifest.json',{cache:'no-store'}).then(function(r){return r.json()}).then(function(m){var L=m.modules||[],left=L.length;L.forEach(function(f){var s=document.createElement('script');s.src='/mods/'+f+'?v='+(m.v||1);s.async=false;s.onload=s.onerror=function(e){if(e&&e.type==='error')console.warn('[bwmods] failed '+f);fix();if(--left===0){fix();window.__bwModsReady=1}};document.body.appendChild(s)})}).catch(function(e){console.warn('[bwmods] no manifest',e)});
 setInterval(fix,3000)}
(function w(){if(window.__B3ready)go();else setTimeout(w,500)})()})();
