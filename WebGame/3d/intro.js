// Bramblewick 3D startup instructions (v14). Classic script; runs before main.js and gates game start.
// Text is NEVER executed: lines are parsed as "key: value" against a fixed whitelist; everything else is shown as "not used".
// Supported keys (documented in the panel):
//   goal: <text>            custom tracker goal (max 8). "chop N logs", "kill N <npc>", "sell N", "bank N", "cook N", "mine N ore" auto-count; other text = tap to tick.
//   quality: low | high     renderer quality (low = no shadows, lower resolution)
//   camera: north | east | south | west   starting camera direction
//   zoom: 5..26             starting camera distance
//   tracker: on | off       show the goal tracker
// Lines starting with # are comments.
(function(){
var LS='b3d-instructions-v1',QP=new URLSearchParams(location.search);
var KEYS={goal:'Adds a goal to the tracker',quality:'Graphics quality',camera:'Starting camera direction',zoom:'Starting camera zoom',tracker:'Show or hide the goal tracker'};
function parse(txt){var out={cfg:{goals:[]},rows:[]};String(txt).replace(/\r/g,'').split('\n').slice(0,200).forEach(function(raw,i){var l=raw.trim();if(!l)return;
 if(l[0]==='#'){out.rows.push([l,'comment','skipped']);return}
 var m=/^([A-Za-z_]+)\s*[:=]\s*(.*)$/.exec(l);if(!m){out.rows.push([l,'not used','not a "key: value" line']);return}
 var k=m[1].toLowerCase(),v=m[2].trim().slice(0,120);
 if(k==='goal'){if(!v)return out.rows.push([l,'not used','empty goal']);if(out.cfg.goals.length>=8)return out.rows.push([l,'not used','max 8 goals']);out.cfg.goals.push(v);out.rows.push([l,'used',KEYS.goal+': "'+v+'"'])}
 else if(k==='quality'){v=v.toLowerCase();if(v==='low'||v==='high'){out.cfg.quality=v;out.rows.push([l,'used',KEYS.quality+' = '+v])}else out.rows.push([l,'not used','quality must be low or high'])}
 else if(k==='camera'){v=v.toLowerCase();if(/^(north|east|south|west)$/.test(v)){out.cfg.camera=v;out.rows.push([l,'used',KEYS.camera+' = '+v])}else out.rows.push([l,'not used','camera must be north, east, south or west'])}
 else if(k==='zoom'){var z=+v;if(isFinite(z)&&z>=5&&z<=26){out.cfg.zoom=z;out.rows.push([l,'used',KEYS.zoom+' = '+z])}else out.rows.push([l,'not used','zoom must be a number 5–26'])}
 else if(k==='tracker'){v=v.toLowerCase();if(v==='on'||v==='off'){out.cfg.tracker=v;out.rows.push([l,'used',KEYS.tracker+' = '+v])}else out.rows.push([l,'not used','tracker must be on or off'])}
 else out.rows.push([l,'not used','unknown key "'+k+'"'])});return out}
window.__B3parseInstructions=parse;
var resolveGate;window.__B3gate=new Promise(function(r){resolveGate=r});
function done(cfg,src){window.__B3cfg=cfg||{goals:[]};window.__B3cfgSrc=src||'none';var p=document.getElementById('intro');if(p)p.remove();resolveGate()}
if(QP.get('intro')!=='1'){var saved0=null;try{saved0=localStorage.getItem(LS)}catch(e){}done(saved0?parse(JSON.parse(saved0).text).cfg:{goals:[]},saved0?'saved':'skip');return}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function build(){
 var css='#intro{position:fixed;inset:0;z-index:70;display:flex;align-items:center;justify-content:center;background:#000d;font:14px/1.35 system-ui,sans-serif;color:#ffe9a3;padding:calc(10px + env(safe-area-inset-top)) 10px calc(10px + env(safe-area-inset-bottom))}#intro .bx{width:min(520px,100%);max-height:100%;overflow:auto;box-sizing:border-box;background:#2a2015;border:2px solid #5a4630;border-radius:12px;padding:14px}#intro h2{margin:0 0 6px;font-size:18px}#intro p{margin:6px 0;color:#e8dcc0}#intro button{font:700 14px system-ui,sans-serif;background:#4a3a26;color:#ffe9a3;border:1px solid #1a140c;border-radius:8px;padding:10px 12px;min-height:44px;margin:4px 6px 4px 0;cursor:pointer}#intro button.pri{background:#8a6a2a;color:#fff}#intro textarea{width:100%;box-sizing:border-box;min-height:90px;background:#0006;color:#fff;border:1px solid #5a4630;border-radius:6px;font:12px ui-monospace,monospace;padding:6px}#intro pre{white-space:pre-wrap;background:#0006;border-radius:6px;padding:6px;font:12px ui-monospace,monospace;max-height:120px;overflow:auto;margin:6px 0;color:#ddd}#intro table{width:100%;border-collapse:collapse;font-size:12px}#intro td{border-top:1px solid #5a463066;padding:4px;vertical-align:top}#intro td.u{color:#7f7}#intro td.n{color:#f99}#intro td.c{color:#aaa}#intro code{color:#fff}#intro .k{font-size:12px;color:#cdbf9f}';
 var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 var d=document.createElement('div');d.id='intro';document.body.appendChild(d);return d}
function home(d){var saved=null;try{saved=JSON.parse(localStorage.getItem(LS)||'null')}catch(e){}
 d.innerHTML='<div class="bx"><h2>Bramblewick 3D</h2><p id="iacst" class="k"></p><button id="iacct">Log in / Create account</button><button id="iguest">Play as guest</button><hr style="border:0;border-top:1px solid #fff2;margin:10px 0"><p>Optional: load a plain-text instructions file to set your own goals and a few settings. Nothing in it is run as code.</p>'+
 (saved?'<p>Last file: <code>'+esc(saved.name||'pasted text')+'</code></p><button class="pri" id="iuse">Review &amp; use last file</button><button id="iclr">Clear saved</button><br>':'')+
 '<button id="ipick">Load instructions (.txt)</button><button id="ipaste">Paste text</button><button class="pri" id="iskip">Skip</button><input type="file" id="ifile" accept=".txt,text/plain" style="display:none">'+
 '<div id="ipa" style="display:none"><textarea id="itxt" placeholder="goal: chop 5 logs&#10;quality: low"></textarea><button id="iok">Review</button></div>'+
 '<p class="k">Supported lines: <code>goal: text</code> (up to 8; “chop 3 logs”, “kill 2 rat”, “sell 1”, “bank 1” count automatically), <code>quality: low|high</code>, <code>camera: north|east|south|west</code>, <code>zoom: 5–26</code>, <code>tracker: on|off</code>, <code># comment</code>. Anything else is shown as “not used”.</p>'+
 '<p class="k">Online mode uses your 2D Bramblewick account and cloud save (no shared multiplayer world). <a href="/" style="color:#ffd98a">Back to the 2D game</a></p></div>';
 var $=function(i){return document.getElementById(i)};
 $('iskip').onclick=function(){done({goals:[]},'skip')};var ac=function(){var A=window.__B3online||{};var st=$('iacst');if(st)st.textContent=A.user?'Logged in as '+A.user+' · progress saves online':'Not logged in · progress saves on this device';var b=$('iacct');if(b)b.textContent=A.user?'Account ('+A.user+')':'Log in / Create account';var g=$('iguest');if(g)g.style.display=A.user?'none':''};ac();setTimeout(ac,1500);setTimeout(ac,4000);$('iacct').onclick=function(){if(window.__B3account)window.__B3account();var t=setInterval(function(){if(!document.getElementById('bwacct')){clearInterval(t);ac()}},300)};$('iguest').onclick=function(){try{localStorage.setItem('bw.guest','1')}catch(e){}done({goals:[]},'guest')};
 $('ipick').onclick=function(){$('ifile').click()};
 $('ifile').onchange=function(){var f=this.files&&this.files[0];if(!f)return;if(f.size>65536){alert('File too large (max 64 KB).');return}var r=new FileReader();r.onload=function(){review(d,String(r.result),f.name)};r.readAsText(f)};
 $('ipaste').onclick=function(){$('ipa').style.display='block';$('itxt').focus()};
 $('iok').onclick=function(){review(d,$('itxt').value,'pasted text')};
 if(saved){$('iuse').onclick=function(){review(d,saved.text,saved.name)};$('iclr').onclick=function(){try{localStorage.removeItem(LS)}catch(e){}home(d)}}}
function review(d,text,name){text=String(text).slice(0,65536);var r=parse(text),c=r.cfg,sum=[];
 if(c.goals.length)sum.push(c.goals.length+' custom goal'+(c.goals.length>1?'s':'')+' will appear in the tracker');
 if(c.quality)sum.push('graphics quality set to '+c.quality);if(c.camera)sum.push('camera starts facing '+c.camera);if(c.zoom)sum.push('camera zoom '+c.zoom);if(c.tracker)sum.push('tracker '+c.tracker);
 var nu=r.rows.filter(function(x){return x[1]==='not used'}).length;
 d.innerHTML='<div class="bx"><h2>Review instructions</h2><p>File: <code>'+esc(name)+'</code></p><pre id="iraw">'+esc(text)+'</pre><p><b>How it will be used:</b> '+(sum.length?esc(sum.join('; '))+'.':'nothing in this file changes the game.')+(nu?' '+nu+' line'+(nu>1?'s are':' is')+' not used.':'')+'</p>'+
 '<table id="irows">'+r.rows.map(function(x){return '<tr><td><code>'+esc(x[0])+'</code></td><td class="'+(x[1]==='used'?'u':x[1]==='comment'?'c':'n')+'">'+esc(x[1])+'</td><td>'+esc(x[2])+'</td></tr>'}).join('')+'</table>'+
 '<button class="pri" id="igo">Confirm &amp; continue</button><button id="iback">Back</button><button id="iskip2">Skip (ignore file)</button></div>';
 document.getElementById('igo').onclick=function(){try{localStorage.setItem(LS,JSON.stringify({name:name,text:text,at:Date.now()}))}catch(e){}done(c,'file')};
 document.getElementById('iback').onclick=function(){home(d)};document.getElementById('iskip2').onclick=function(){done({goals:[]},'skip')}}
function start(){home(build())}
if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
