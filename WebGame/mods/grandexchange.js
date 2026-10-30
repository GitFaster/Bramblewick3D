/* Bramblewick mod: grandexchange.js */
(function(){try{
function bwUI(id,icon,title){var bar=document.getElementById('bwModBar');if(!bar){bar=document.createElement('div');bar.id='bwModBar';bar.style.cssText='position:fixed;left:8px;top:64px;max-height:calc(50% - 74px);z-index:9000;display:grid;grid-auto-flow:column;grid-template-rows:repeat(auto-fill,44px);gap:5px;overflow:hidden';(document.body||document.documentElement).appendChild(bar)}
 if(!document.getElementById('bwModCss')){var c=document.createElement('style');c.id='bwModCss';c.textContent='.bwmb{width:44px;height:44px;border-radius:8px;border:2px solid #3e3529;background:#5a4c39;color:#ff0;font-size:21px;touch-action:manipulation;padding:0}.bwmp{position:fixed;left:58px;top:10%;z-index:9001;width:min(340px,82vw);max-height:74vh;overflow:auto;background:#3e3529;border:3px solid #2a241b;color:#ff981f;font:13px sans-serif;padding:8px;border-radius:6px;display:none;-webkit-overflow-scrolling:touch}.bwmp h3{margin:0 0 6px;color:#ff0}.bwmp .r{padding:6px;margin:3px 0;background:#4b4032;border-radius:4px}.bwmp small{color:#ddd;display:block}.bwmp .ok{color:#0f0}.bwmp .no{color:#f55}.bwmp button{min-height:44px;min-width:44px;background:#2a241b;color:#ff981f;border:1px solid #000;padding:6px 10px;border-radius:4px;margin:3px}';document.head.appendChild(c)}
 var b=document.createElement('button');b.className='bwmb';b.textContent=icon;b.title=title;var p=document.createElement('div');p.className='bwmp';p.id=id;
 var api={btn:b,panel:p,open:false,render:function(){},toggle:function(v){api.open=v===undefined?!api.open:v;document.querySelectorAll('.bwmp').forEach(function(x){if(x!==p)x.style.display='none'});p.style.display=api.open?'block':'none';if(api.open)api.render()}};
 b.addEventListener('click',function(e){e.stopPropagation();api.toggle()});
 ['touchstart','pointerdown','mousedown','click'].forEach(function(t){p.addEventListener(t,function(e){e.stopPropagation()},{passive:true});if(t!=='click')b.addEventListener(t,function(e){e.stopPropagation()},{passive:true})});
 bar.appendChild(b);(document.body||document.documentElement).appendChild(p);return api}
function bwSay(t,c){try{typeof window.msg==='function'&&window.msg(t,c||'g')}catch(_){}}
function bwPl(){return window.__bw&&window.__bw.Pl}
function bwGive(id,n){try{return typeof window.addItem==='function'?window.addItem(id,n):0}catch(_){return 0}}
function bwLoad(k,d){try{return JSON.parse(localStorage.getItem(k)||'null')||d}catch(_){return d}}
function bwSave(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}
function bwHook(name,after){var E=window.BWEv;if(!E)return false;var map={addXp:'xp',kill:'kill',levelUp:'level',addItem:'item'};var ev=map[name];if(!ev)return false;E.on(ev,function(){try{after.apply(null,[null].concat([].slice.call(arguments)))}catch(_){}});return true}
function bwSfx(n){try{window.BWAudio&&BWAudio.sfx(n)}catch(_){}}
function bwPop(t,b){try{window.BWLevelUp&&BWLevelUp.show(t,b)}catch(_){}}
if(window.BWGE)return;
var BASE={logs:8,oak_logs:20,willow_logs:35,raw_shrimp:4,cooked_shrimp:10,raw_trout:14,cooked_trout:28,copper_ore:6,tin_ore:6,iron_ore:25,coal:45,gold_ore:30,bones:3,big_bones:18,feather:2,bronze_bar:40,iron_bar:90,cut_sapphire:180,cut_ruby:360,iron_sword:900,steel_sword:2200};
var NM=function(k){return k.replace(/_/g,' ').replace(/^./,function(c){return c.toUpperCase()})};
var S=bwLoad('bw_ge_v1',{p:{},offers:[],hist:{}});for(var k in BASE)if(!S.p[k])S.p[k]=BASE[k];
function sv(){bwSave('bw_ge_v1',S)}
function inv(){var P=bwPl();return P&&P.inv||[]}
function have(id){return window.invCount?invCount(id):0}
function take(id,n){var a=inv(),t=0;for(var i=0;i<a.length&&t<n;i++){var x=a[i];if(x&&x.id===id){var q=Math.min(x.n,n-t);x.n-=q;t+=q;if(x.n<=0)a[i]=null}}return t}
// market ticks: mean-reverting random walk
setInterval(function(){for(var k in BASE){var p=S.p[k],b=BASE[k];p=p*(1+(Math.random()-.5)*0.06)+(b-p)*0.05;S.p[k]=Math.max(1,Math.round(p*10)/10);(S.hist[k]=S.hist[k]||[]).push(Math.round(S.p[k]));if(S.hist[k].length>20)S.hist[k].shift()}
 S.offers.forEach(function(o){if(o.done)return;var px=S.p[o.id],ok=o.buy?o.price>=px*0.98:o.price<=px*1.02;if(ok&&Math.random()<0.5){var f=Math.min(o.n-o.f,Math.ceil(Math.random()*o.n));o.f+=f;if(o.f>=o.n){o.done=1;bwSay('Grand Exchange: Finished '+(o.buy?'buying':'selling')+' '+o.n+' x '+NM(o.id)+'.','b');bwSfx('drop')}}});sv();if(ui.open)ui.render()},4000);
function place(id,buy,n,price){n=Math.max(1,n|0);price=Math.max(1,Math.round(price));if(S.offers.filter(function(o){return!o.c}).length>=6){bwSay('All 6 GE slots are in use.');return}
 if(buy){if(have('coins')<n*price){bwSay("You don't have enough coins.");return}take('coins',n*price)}else{var h=have(id);if(h<1){bwSay("You don't have any "+NM(id)+'.');return}n=Math.min(n,h);take(id,n)}
 S.offers.push({id:id,buy:buy,n:n,price:price,f:0});sv();bwSay('Offer placed: '+(buy?'Buy ':'Sell ')+n+' x '+NM(id)+' @ '+price+' gp','g');ui.render()}
function collect(i){var o=S.offers[i];if(!o)return;var un=o.n-o.f;if(o.buy){if(o.f)bwGive(o.id,o.f);if(un)bwGive('coins',un*o.price)}else{if(o.f)bwGive('coins',o.f*o.price);if(un)bwGive(o.id,un)}S.offers.splice(i,1);sv();bwSay('Collected from the Grand Exchange.');ui.render()}
var sel='logs';
var ui=bwUI('bwGeP','⚖️','Grand Exchange');
function spark(k){var h=S.hist[k]||[];if(h.length<2)return'';var mn=Math.min.apply(0,h),mx=Math.max.apply(0,h)||1;return'<svg width="120" height="24">'+'<polyline fill="none" stroke="#ff0" stroke-width="1.5" points="'+h.map(function(v,i){return(i*120/(h.length-1)).toFixed(1)+','+(22-(v-mn)/(mx-mn||1)*20).toFixed(1)}).join(' ')+'"/></svg>'}
ui.render=function(){var p=S.p[sel],h='<h3>Grand Exchange</h3><div class="r"><select id="geSel" style="min-height:44px;width:100%;background:#2a241b;color:#ff981f">';for(var k in BASE)h+='<option value="'+k+'"'+(k===sel?' selected':'')+'>'+NM(k)+' — '+Math.round(S.p[k])+' gp</option>';
 h+='</select><small>Guide price: <b>'+Math.round(p)+' gp</b> (base '+BASE[sel]+') · you have '+have(sel)+' · coins '+have('coins')+'</small>'+spark(sel)+'<div><input id="geN" type="number" min="1" value="10" style="width:70px;min-height:40px"> @ <input id="geP" type="number" min="1" value="'+Math.round(p)+'" style="width:80px;min-height:40px"> gp</div><button data-g="buy">Buy</button><button data-g="sell">Sell</button><button data-g="sellall">Sell all @ -5%</button></div><b>Offers</b>';
 S.offers.forEach(function(o,i){var pc=Math.round(o.f/o.n*100);h+='<div class="r"><small class="'+(o.done?'ok':'')+'">'+(o.buy?'Buy ':'Sell ')+o.n+' x '+NM(o.id)+' @ '+o.price+' — '+pc+'%</small><div style="height:6px;background:#200"><div style="height:6px;width:'+pc+'%;background:'+(o.done?'#0a0':'#e80')+'"></div></div><button data-c="'+i+'">'+(o.done?'Collect':'Abort & collect')+'</button></div>'});
 ui.panel.innerHTML=h};
ui.panel.addEventListener('change',function(e){if(e.target.id==='geSel'){sel=e.target.value;ui.render()}});
ui.panel.addEventListener('click',function(e){var t=e.target;if(!t.getAttribute)return;var g=t.getAttribute('data-g'),c=t.getAttribute('data-c');var n=+(document.getElementById('geN')||{}).value||1,pr=+(document.getElementById('geP')||{}).value||S.p[sel];if(g==='buy')place(sel,true,n,pr);if(g==='sell')place(sel,false,n,pr);if(g==='sellall')place(sel,false,have(sel),S.p[sel]*0.95);if(c!==null&&c!==undefined&&c!=='')collect(+c)});
window.BWGE={prices:S.p,place:place};
}catch(e){try{console.warn('[mods/grandexchange.js] failed',e)}catch(_){}}})();
