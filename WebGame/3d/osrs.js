// OSRS-Mobile look pass (runtime, cheap): flat low-poly Lambert, strong ambient, pixel (Nearest) textures,
// no real-time shadows (blob shadows under characters stay), black void instead of sky, ~45-60° follow camera,
// OSRS brown context menu. Disable with ?osrs=0. Terrain/char texture+material changes live in terrain.js/chars.js.
(globalThis.__B3mods=globalThis.__B3mods||{}).osrs=1;
if(new URLSearchParams(location.search).get('osrs')!=='0'){
const B=await new Promise(r=>{const t=setInterval(()=>{if(window.__B3ready&&window.B3&&window.B3.S){clearInterval(t);r(window.B3)}},200)});
const {THREE:T,S,C}=B,R=window.__B3R,sun=window.__B3sun;
R.toneMapping=T.NoToneMapping;
S.background=new T.Color(0x000000);if(S.fog){S.fog.color.setHex(0x000000)}
S.traverse(o=>{if(o.isHemisphereLight)o.intensity=.55;if(o.isDirectionalLight)o.intensity=1.0});S.add(new T.AmbientLight(0xffffff,.95));
const conv=new WeakMap(),PIX=['map','emissiveMap','alphaMap','lightMap','aoMap'];
function pix(t){if(t&&!t.__px&&!t.isRenderTargetTexture){t.__px=1;t.magFilter=T.NearestFilter;t.minFilter=T.NearestFilter;t.generateMipmaps=false;t.anisotropy=1;t.needsUpdate=true}}
function lambert(m){let n=conv.get(m);if(n)return n;
 if(m.isMeshStandardMaterial&&m.onBeforeCompile===T.Material.prototype.onBeforeCompile){n=new T.MeshLambertMaterial({color:m.color,map:m.map,vertexColors:m.vertexColors,transparent:m.transparent,opacity:m.opacity,side:m.side,depthWrite:m.depthWrite,emissive:m.emissive,flatShading:true});}
 else{if(m.isMeshStandardMaterial){m.metalness=0;m.roughness=1;m.envMap=null}if('flatShading' in m&&!m.flatShading&&(m.isMeshLambertMaterial||m.isMeshPhongMaterial)){m.flatShading=true;m.needsUpdate=true}n=m}
 conv.set(m,n);return n}
function pass(){S.traverse(o=>{if(o.isSprite){if(o.scale.x===40&&o.material.fog===false)o.visible=false;return}
 if(o.castShadow)o.castShadow=false;if(!o.isMesh||!o.material)return;
 if(Array.isArray(o.material))o.material=o.material.map(lambert);else o.material=lambert(o.material);
 for(const m of [].concat(o.material))for(const k of PIX)pix(m[k])});
 if(R.shadowMap.enabled||sun.castShadow){R.shadowMap.enabled=false;sun.castShadow=false;S.traverse(o=>{if(o.material)[].concat(o.material).forEach(m=>m.needsUpdate=true)})}}
pass();setInterval(pass,2000);
// camera: start ~52°, keep it between ~40° and ~66° (drag-rotate + pinch-zoom unchanged)
C.pitch=.9;(function cl(){C.pitch=Math.min(1.15,Math.max(.7,C.pitch));requestAnimationFrame(cl)})();
// OSRS context menu + chat font
const st=document.createElement('style');st.textContent=`#menu{background:#5d5447!important;border:2px solid #000!important;outline:1px solid #3e3529;font:bold 14px 'RuneScape UF','Trebuchet MS',Verdana,sans-serif!important;text-shadow:1px 1px 0 #000;border-radius:0;min-width:160px}
#menu .h{background:#000!important;color:#5d5447!important;padding:3px 6px!important;text-shadow:none}#menu div.e{color:#fff;padding:9px 10px!important}#menu div.e:hover{color:#ff0!important;background:transparent!important}
#chat{font-family:'RuneScape UF','Trebuchet MS',Verdana,sans-serif!important;text-shadow:1px 1px 0 #000}`;document.head.appendChild(st);
window.__B3osrs={pass};
}
