// Bramblewick 3D characters: one shared humanoid rig + animal rigs. Geometry/material pooled (shared buffers).
// Pivots sit at joints (neck, shoulder, elbow, hip, knee); limb meshes hang below their pivot.
import * as THREE from './assets/three.module.min.js?v=14';
(globalThis.__B3mods=globalThis.__B3mods||{}).chars=1;
const GC=new Map(),MC=new Map();
const geo=(k,f)=>{let g=GC.get(k);if(!g){g=f();g.computeVertexNormals();GC.set(k,g)}return g};
const mt=c=>{let m=MC.get(c);if(!m){m=new THREE.MeshLambertMaterial({color:c,flatShading:true});MC.set(c,m)}return m};
const T=THREE;
const cyl=(rt,rb,h,seg=6,sz=1)=>geo(`c${rt},${rb},${h},${seg},${sz}`,()=>{const g=new T.CylinderGeometry(rt,rb,h,seg);g.scale(1,1,sz);return g});
const box=(w,h,d)=>geo(`b${w},${h},${d}`,()=>new T.BoxGeometry(w,h,d));
const ball=(r,d=1,sx=1,sy=1,sz=1)=>geo(`s${r},${d},${sx},${sy},${sz}`,()=>{const g=new T.IcosahedronGeometry(r,d);g.scale(sx,sy,sz);return g});
const cone=(r,h,seg=5)=>geo(`k${r},${h},${seg}`,()=>new T.ConeGeometry(r,h,seg));
const sph=(r,sx=1,sy=1,sz=1)=>geo(`p${r},${sx},${sy},${sz}`,()=>{const g=new T.SphereGeometry(r,8,6);g.scale(sx,sy,sz);return g});
const MB=new Map();const mb=c=>{let m=MB.get(c);if(!m){m=new T.MeshBasicMaterial({color:c});MB.set(c,m)}return m};
function Mg(g,c,x=0,y=0,z=0,p){const m=new T.Mesh(g,mb(c));m.position.set(x,y,z);if(p)p.add(m);return m}
const cap=(r)=>geo(`h${r}`,()=>new T.SphereGeometry(r,7,4,0,Math.PI*2,0,Math.PI*.55));
function M(g,c,x=0,y=0,z=0,p){const m=new T.Mesh(g,mt(c));m.position.set(x,y,z);if(p)p.add(m);return m}
function piv(p,x,y,z){const g=new T.Group();g.position.set(x,y,z);p.add(g);return g}
// ---------- HUMANOID (outfit params) ----------
// o:{skin,hair,hairStyle,shirt,sleeve,legs,boots,belt,robe,hat,hatC,item,itemC,cape,apron,beard,scale,thin,bulk}
export function humanoid(o){
 const g=new T.Group(),m=piv(g,0,0,0);m.scale.setScalar(o.scale||1);const th=o.thin?.6:o.bulk?1.25:1;
 const L={};
 // pelvis + hips
 const pel=piv(m,0,.92,0);M(box(.3*th,.14,.18*th),o.legs,0,0,0,pel);if(o.belt)M(box(.32*th,.05,.2*th),o.belt,0,.07,0,pel);
 const leg=(sx)=>{const hip=piv(pel,sx*.085*th,-.04,0);M(cyl(.075*th,.06*th,.42,6),o.legs,0,-.21,0,hip);const knee=piv(hip,0,-.42,0);M(cyl(.06*th,.05*th,.36,6),o.boots,0,-.18,0,knee);M(cyl(.06*th,.06*th,.1,6),o.legs,0,-.03,0,knee);M(box(.12*th,.08,.22),o.boots,0,-.4,.04,knee);return [hip,knee]};
 [L.hL,L.kL]=leg(-1);[L.hR,L.kR]=leg(1);
 // torso (tapered tunic)
 const chest=piv(pel,0,.04,0);L.chest=chest;M(cyl(.21*th,.16*th,.5,6,.62),o.shirt,0,.27,0,chest);M(box(.42*th,.1,.18*th),o.shirt,0,.47,0,chest);
 if(o.robe)M(cyl(.18*th,.27*th,.62,7,.75),o.robe,0,-.24,0,chest);else M(cyl(.17*th,.2*th,.18,6,.7),o.shirt,0,-.04,0,chest);
 if(o.apron)M(box(.26*th,.5,.02),o.apron,0,.05,.13*th,chest);
 if(o.cape){const c=M(box(.4*th,.75,.03),o.cape,0,.08,-.14*th,chest);c.rotation.x=.08}
 // neck + head
 const neck=piv(chest,0,.53,0);L.neck=neck;M(cyl(.05,.06,.08,5),o.skin,0,.03,0,neck);const head=piv(neck,0,.07,0);L.head=head;
 M(sph(.135,1,1.12,1.02),o.skin,0,.14,0,head);
 for(const sx of[-1,1]){M(box(.045,.045,.03),0xffffff,sx*.052,.165,.128,head);M(box(.026,.032,.02),0x111111,sx*.052,.163,.146,head);M(box(.06,.014,.02),o.hair||0x3a2a1a,sx*.052,.198,.135,head)}
 M(box(.04,.06,.05),o.skin,0,.125,.148,head);M(box(.07,.016,.02),0x7a3a2a,0,.075,.132,head);
 if(o.beard)M(ball(.1,0,1,1.1,.6),o.beard,0,.05,.09,head);
 if(o.hat==='helm'){M(cap(.16),o.hatC,0,.15,0,head);M(box(.03,.12,.03),o.hatC,0,.13,.15,head)}
 else if(o.hat==='hood'){M(cap(.17),o.hatC,0,.13,-.01,head);M(cone(.08,.16,5),o.hatC,0,.32,-.05,head)}
 else if(o.hat==='wizard'){M(cyl(.22,.22,.02,8),o.hatC,0,.27,0,head);M(cone(.13,.4,6),o.hatC,0,.47,0,head)}
 else if(o.hat==='cap'){M(cap(.15),o.hatC,0,.17,0,head);M(box(.2,.02,.1),o.hatC,0,.22,.13,head)}
 else if(o.hat==='horns'){M(cone(.04,.2,4),0xdddddd,-.1,.3,0,head).rotation.z=.4;M(cone(.04,.2,4),0xdddddd,.1,.3,0,head).rotation.z=-.4}
 if(o.hair&&o.hat!=='helm'&&o.hat!=='hood'&&o.hat!=='wizard'){M(cap(.148),o.hair,0,.165,-.012,head);if(o.hairStyle==='long')M(box(.25,.24,.06),o.hair,0,.06,-.11,head);if(o.hairStyle==='bun')M(ball(.06,0),o.hair,0,.28,-.08,head)}
 // arms
 const arm=sx=>{const sh=piv(chest,sx*.24*th,.46,0);M(ball(.07*th,0),o.sleeve??o.shirt,0,0,0,sh);M(cyl(.06*th,.05*th,.3,5),o.sleeve??o.shirt,0,-.15,0,sh);const el=piv(sh,0,-.3,0);M(cyl(.048*th,.042*th,.27,5),o.skin,0,-.135,0,el);const hand=piv(el,0,-.3,0);M(ball(.05,0,1,1.2,.8),o.skin,0,0,0,hand);return [sh,el,hand]};
 [L.sL,L.eL,L.handL]=arm(-1);[L.sR,L.eR,L.handR]=arm(1);L.sL.rotation.z=-.08;L.sR.rotation.z=.08;
 if(o.item==='sword'){const w=piv(L.handR,0,-.02,0);w.rotation.x=Math.PI/2;M(box(.04,.6,.015),o.itemC||0xc8c8d0,0,.36,0,w);M(box(.16,.03,.04),0x6b4a2a,0,.06,0,w)}
 if(o.item==='spear'){const w=piv(L.handR,0,0,0);M(cyl(.018,.018,1.6,4),0x6b4a2a,0,.3,0,w);M(cone(.04,.16,4),o.itemC||0xc8c8d0,0,1.16,0,w)}
 if(o.item==='staff'){const w=piv(L.handR,0,0,0);M(cyl(.022,.026,1.5,5),0x5a3a1a,0,.35,0,w);M(ball(.06,0),o.itemC||0x66ccff,0,1.12,0,w)}
 if(o.item==='pick'){const w=piv(L.handR,0,0,0);M(cyl(.02,.02,.6,4),0x6b4a2a,0,.15,0,w);M(box(.36,.04,.04),0x888888,0,.43,0,w)}
 if(o.item==='shield'){M(box(.04,.4,.32),o.itemC||0x5a5a6a,-.06,-.05,0,L.handL)}
 g.userData.L=L;g.userData.anim=animHuman;return g}
function animHuman(L,ph,a,run){const s=Math.sin(ph),c=Math.cos(ph),A=(run?.75:.5)*a;
 L.hL.rotation.x=s*A;L.hR.rotation.x=-s*A;
 L.kL.rotation.x=Math.max(0,-c)*(run?1.3:.8)*a+.04;L.kR.rotation.x=Math.max(0,c)*(run?1.3:.8)*a+.04;
 L.sL.rotation.x=-s*A*.9;L.sR.rotation.x=s*A*.9;L.eL.rotation.x=-(run?1.1:.35)*a-.15*(1-a);L.eR.rotation.x=-(run?1.1:.35)*a-.15*(1-a);
 L.chest.rotation.x=(run?.18:.03)*a;L.chest.position.y=.04+Math.abs(c)*.03*a;L.chest.rotation.y=s*.08*a}
function idleHuman(L,t){L.chest.position.y=.04+Math.sin(t*1.6)*.006;L.head.rotation.set(0,0,0);L.neck.rotation.set(0,0,0)}
// ---------- QUADRUPED ----------
// o:{body,belly,head,legC,len,ht,w,scale,horns,tusks,ears,tail,snout,spots}
export function quad(o){const g=new T.Group(),m=piv(g,0,0,0);m.scale.setScalar(o.scale||1);const L={legs:[]};const ht=o.ht,len=o.len,w=o.w;
 const body=piv(m,0,ht,0);L.body=body;M(ball(.5,1,w,o.bh||.75*w,len),o.body,0,0,0,body);
 if(o.mane){L.mane=piv(body,0,.08,len*.28);M(ball(.28,1,w*1.18,w*1.05,.75),o.mane,0,0,0,L.mane)}
 if(o.spots)for(const [x,y,z] of [[.3,.12,.2],[-.32,.05,-.25],[.25,-.05,-.45]])M(ball(.16,0,.4,1,1.2),o.spots,x*w*1.6,y,z*len,body);
 const nk=piv(body,0,.12*w,len*.45);L.neck=nk;M(cyl(.14*w*1.4,.2*w*1.4,.35,6),o.body,0,.05,.1,nk).rotation.x=1.1;
 const hd=piv(nk,0,.12,.28);L.head=hd;M(ball(.2,0,w*1.1,w*1.0,1.3),o.head||o.body,0,0,.04,hd);
 if(o.snout)M(box(.16*w*1.6,.13*w*1.4,o.snout),o.snoutC||o.head||o.body,0,-.05,.2+o.snout/2,hd);
 M(box(.03,.03,.02),0x111111,-.1*w*1.2,.06,.2,hd);M(box(.03,.03,.02),0x111111,.1*w*1.2,.06,.2,hd);
 for(const sx of[-1,1])Mg(box(.012,.012,.008),0xffffff,sx*.1*w*1.2+.008,.07,.213,hd);
 if(o.snout)for(const sx of[-1,1])Mg(box(.018,.012,.008),0x241818,sx*.04,-.045,.205+o.snout,hd);
 if(o.ears)for(const sx of[-1,1])M(cone(.06,o.ears,4),o.earC||o.head||o.body,sx*.1*w*1.3,.18,0,hd).rotation.z=-sx*.25;
 if(o.horns)for(const sx of[-1,1])M(cone(.04,.18,4),0xe8e0c8,sx*.16,.12,-.02,hd).rotation.z=-sx*1.1;
 if(o.tusks)for(const sx of[-1,1])M(cone(.025,.12,4),0xf0f0e0,sx*.08,-.12,.3,hd).rotation.x=-.5;
 if(o.fangs)for(const sx of[-1,1])M(cone(.018,.09,4),0xf5f0df,sx*.065,-.09,.31,hd).rotation.x=Math.PI;
 if(o.tail){const t=piv(body,0,.1*w,-len*.48);L.tailPivot=t;M(cyl(.025,.012,o.tail,4),o.tailC||o.body,0,-o.tail/2,0,t).parent.rotation.x=.6}
 const lh=ht-.06;for(const [sx,sz] of [[-1,1],[1,1],[-1,-1],[1,-1]]){const h=piv(body,sx*.3*w,-.05,sz*.32*len);const tw=o.legW||.07;M(cyl(tw,tw*.8,lh*.55,5),o.legC||o.body,0,-lh*.27,0,h);const k=piv(h,0,-lh*.55,0);M(cyl(tw*.8,tw*.7,lh*.42,5),o.legC||o.body,0,-lh*.21,0,k);M(box(tw*1.6,.05,tw*1.8),o.hoof||0x2a2420,0,-lh*.42,.01,k);L.legs.push([h,k,sx*sz])}
 g.userData.L=L;g.userData.anim=animQuad;return g}
function animQuad(L,ph,a,run,t=0){const s=Math.sin(ph);L.legs.forEach(([h,k,d])=>{h.rotation.x=s*d*(run?.7:.45)*a;k.rotation.x=-Math.max(0,s*d)*.5*a});L.body.rotation.z=s*.03*a;L.body.scale.y=1+Math.sin(t*3.2)*.025;if(L.head)L.head.rotation.x=-.05+Math.abs(s)*.08*a;if(L.tailPivot)L.tailPivot.rotation.z=Math.sin(ph*.5)*.3}
function idleQuad(L,t){L.body.scale.y=1+Math.sin(t*2.2)*.035;L.head.rotation.x=Math.sin(t*.7)*.1;L.neck.rotation.y=Math.sin(t*.38)*.24;if(L.mane)L.mane.rotation.z=Math.sin(t*1.4)*.025;if(L.tailPivot){L.tailPivot.rotation.z=Math.sin(t*2.8)*.38;L.tailPivot.rotation.x=.55+Math.sin(t*1.3)*.12}}
// ---------- BIRD (mudhen) ----------
export function bird(o){const g=new T.Group(),m=piv(g,0,0,0);m.scale.setScalar(o.scale||1);const L={};
 const body=piv(m,0,.32,0);L.body=body;M(ball(.2,1,1,.9,1.25),o.body,0,0,0,body);M(cone(.12,.2,4),o.tailC||o.body,0,.08,-.26,body).rotation.x=-2.3;
 for(const sx of[-1,1]){const wp=piv(body,sx*.17,.03,0);M(ball(.12,0,.3,.7,1.2),o.wing,0,0,0,wp);L[sx<0?'wL':'wR']=wp}
 const hd=piv(body,0,.16,.18);L.head=hd;M(ball(.1,0,1,1.05,1.1),o.head||o.body,0,.06,0,hd);M(cone(.035,.1,4),0xe8b030,0,.05,.13,hd).rotation.x=Math.PI/2;M(box(.025,.08,.08),0xc02020,0,.15,0,hd);M(box(.025,.025,.01),0x111111,-.06,.08,.07,hd);M(box(.025,.025,.01),0x111111,.06,.08,.07,hd);
 for(const sx of[-1,1]){const h=piv(body,sx*.07,-.13,0);M(cyl(.018,.014,.2,4),0xe8b030,0,-.09,0,h);M(box(.08,.015,.1),0xe8b030,0,-.19,.03,h);L[sx<0?'hL':'hR']=h}
 g.userData.L=L;g.userData.anim=(L,ph,a)=>{const s=Math.sin(ph);L.hL.rotation.x=s*.6*a;L.hR.rotation.x=-s*.6*a;L.head.position.z=.18+Math.max(0,s)*.05*a;L.body.position.y=.32+Math.abs(s)*.02*a};
 g.userData.idle=(L,t)=>{const p=(t*.7)%4<.4;L.head.rotation.x=p?.7:0;L.wL.rotation.z=L.wR.rotation.z=0};return g}
// ---------- SPIDER ----------
export function spider(o){const g=new T.Group(),m=piv(g,0,0,0);m.scale.setScalar(o.scale||1);const L={legs:[]};const b=piv(m,0,.3,0);L.body=b;
 M(ball(.26,1,1,.8,1.2),o.body,0,.05,-.3,b);M(ball(.15,0,1,.8,1.1),o.body,0,0,.06,b);for(const x of[-.05,.05])M(box(.03,.03,.02),0xcc2222,x,.04,.21,b);
 for(let i=0;i<4;i++)for(const sx of[-1,1]){const h=piv(b,sx*.1,0,.12-i*.08);h.rotation.y=sx*(Math.PI/2)+(i-1.5)*-.35*sx;const up=piv(h,0,0,0);up.rotation.z=0;M(cyl(.022,.02,.34,4),o.leg||o.body,0,0,.17,up).rotation.x=Math.PI/2-.6;const kn=piv(up,0,.19,.27);M(cyl(.02,.012,.42,4),o.leg||o.body,0,-.19,.06,kn).rotation.x=.3;L.legs.push([up,(i+(sx>0?1:0))%2])}
 g.userData.L=L;g.userData.anim=(L,ph,a)=>{L.legs.forEach(([u,p])=>{u.rotation.x=Math.sin(ph*2+p*Math.PI)*.25*a});L.body.position.y=.3+Math.sin(ph*4)*.01*a};g.userData.idle=()=>{};return g}
// ---------- BAT ----------
export function bat(o){const g=new T.Group(),m=piv(g,0,0,0);m.scale.setScalar(o.scale||1);const L={};const b=piv(m,0,1.3,0);L.body=b;
 M(ball(.13,0,1,1.1,1.3),o.body,0,0,0,b);M(ball(.09,0),o.body,0,.06,.14,b);for(const sx of[-1,1])M(cone(.04,.12,3),o.body,sx*.05,.16,.14,b);for(const x of[-.035,.035])M(box(.02,.02,.01),0xff3030,x,.08,.22,b);
 for(const sx of[-1,1]){const w=piv(b,sx*.1,.02,0);const wg=geo('batw'+sx,()=>{const s=new T.Shape();s.moveTo(0,0);s.lineTo(sx*.55,.12);s.lineTo(sx*.5,-.08);s.lineTo(sx*.36,-.02);s.lineTo(sx*.28,-.14);s.lineTo(sx*.15,-.05);s.lineTo(0,-.12);const gg=new T.ShapeGeometry(s);gg.rotateX(-Math.PI/2);return gg});const mm=new T.Mesh(wg,mt(o.wing));mm.material.side=T.DoubleSide;w.add(mm);L[sx<0?'wL':'wR']=w}
 const flap=(L,t,sp)=>{const f=Math.sin(t*sp)*.9;L.wL.rotation.z=-f;L.wR.rotation.z=f;L.body.position.y=1.3+Math.sin(t*sp)*.05};
 g.userData.L=L;g.userData.anim=(L,ph,a,r,t)=>flap(L,t,14);g.userData.idle=(L,t)=>flap(L,t,10);return g}
// ---------- TOAD ----------
export function toad(o){const g=new T.Group(),m=piv(g,0,0,0);m.scale.setScalar(o.scale||1);const L={};const b=piv(m,0,.16,0);L.body=b;
 M(ball(.22,1,1.15,.6,1.1),o.body,0,0,0,b);M(ball(.16,1,1.2,.55,1),o.belly,0,-.05,.06,b);for(const sx of[-1,1]){M(ball(.06,0),o.body,sx*.12,.12,.14,b);M(box(.04,.04,.02),0x111111,sx*.12,.14,.19,b)}
 for(const sx of[-1,1]){const h=piv(b,sx*.2,-.06,-.1);M(ball(.1,0,.7,.5,1.4),o.body,0,-.03,0,h);L[sx<0?'hL':'hR']=h;M(box(.05,.1,.05),o.body,sx*.14,-.1,.15,b)}
 g.userData.L=L;g.userData.anim=(L,ph,a)=>{const s=Math.abs(Math.sin(ph));L.body.position.y=.16+s*.18*a;L.hL.rotation.x=L.hR.rotation.x=-s*.8*a};g.userData.idle=(L,t)=>{L.body.scale.y=1+Math.sin(t*3)*.04};return g}

// ---------- THORNLING ('A walking bramble with a bad temper.') same joint names as humanoid -> animHuman
export function thornling(o){const g=new T.Group(),m=piv(g,0,0,0);m.scale.setScalar(o.scale||.85);const L={};const W=0x5a3a20,Lf=0x3a6a2a,Th=0xc8b890;
 const pel=piv(m,0,.62,0);M(ball(.14,0,1.2,.8,1),W,0,0,0,pel);
 const leg=sx=>{const h=piv(pel,sx*.1,-.02,0);M(cyl(.045,.04,.3,5),W,0,-.15,0,h);const k=piv(h,0,-.3,0);M(cyl(.04,.035,.28,5),W,0,-.14,0,k);for(const a of[-.9,0,.9]){const r=M(cone(.035,.18,4),W,Math.sin(a)*.07,-.29,Math.cos(a)*.07,k);r.rotation.set(Math.cos(a)*1.25,0,-Math.sin(a)*1.25)}return[h,k]};
 [L.hL,L.kL]=leg(-1);[L.hR,L.kR]=leg(1);
 const ch=piv(pel,0,.05,0);L.chest=ch;M(cyl(.12,.15,.45,6),W,0,.22,0,ch);
 for(const [x,y,z,r] of[[0,.5,0,.24],[-.16,.4,.05,.16],[.16,.42,-.03,.17],[0,.32,-.14,.15],[.05,.62,-.05,.14]])M(ball(r,0),Lf,x,y,z,ch);
 for(let i=0;i<10;i++){const a=i*2.4,y=.25+(i%4)*.12;const t=M(cone(.025,.12,3),Th,Math.sin(a)*.22,y,Math.cos(a)*.22,ch);t.rotation.set(Math.cos(a)*1.4,0,-Math.sin(a)*1.4)}
 const nk=piv(ch,0,.5,0);L.neck=nk;const hd=piv(nk,0,.05,.12);L.head=hd;for(const sx of[-1,1])Mg(box(.05,.03,.02),0xffd040,sx*.07,.06,.12,hd);
 const arm=sx=>{const sh=piv(ch,sx*.2,.42,0);M(cyl(.035,.03,.3,4),W,0,-.15,0,sh);M(cone(.02,.08,3),Th,sx*.04,-.1,0,sh).rotation.z=-sx*1.4;const el=piv(sh,0,-.3,0);M(cyl(.03,.02,.28,4),W,0,-.14,0,el);const hn=piv(el,0,-.28,0);for(const a of[-.5,0,.5])M(cone(.02,.12,3),W,Math.sin(a)*.04,-.05,0,hn).rotation.set(Math.PI,0,a);M(ball(.06,0),Lf,0,.12,.03,el);return[sh,el,hn]};
 [L.sL,L.eL,L.handL]=arm(-1);[L.sR,L.eR,L.handR]=arm(1);g.userData.L=L;g.userData.anim=animHuman;return g}
// ---------- DRAKE / DRAGON (reptile body, tail, wings, snout)
export function dragon(o){const g=new T.Group(),m=piv(g,0,0,0);m.scale.setScalar(o.scale||1);const L={legs:[],tailJoints:[]};const C=o.body,B=o.belly,ht=.55;
 const body=piv(m,0,ht,0);L.body=body;M(sph(.5,.75,.6,1.3),C,0,0,0,body);M(sph(.42,.6,.4,1.1),B,0,-.12,.05,body);
 for(let i=0;i<5;i++)M(cone(.05,.14,4),o.spine,0,.3,-.4+i*.2,body);
 let nk=piv(body,0,.15,.55);L.neck=nk;M(cyl(.12,.17,.5,6),C,0,.18,.08,nk).rotation.x=.6;
 const hd=piv(nk,0,.42,.3);L.head=hd;M(sph(.17,1,.85,1.2),C,0,0,0,hd);M(box(.18,.12,.3),C,0,-.04,.25,hd);M(box(.16,.04,.26),B,0,-.11,.24,hd);
 for(const sx of[-1,1]){Mg(box(.04,.03,.03),o.eye,sx*.11,.06,.12,hd);M(cone(.035,.24,4),0xe8e0c8,sx*.08,.16,-.1,hd).rotation.x=-1.9;M(box(.02,.02,.02),0x111111,sx*.04,.02,.4,hd)}
 let tp=body;for(let i=0;i<5;i++){const t=piv(tp,0,i?0:.05,i?-.3:-.62);M(cyl(.12-i*.02,.15-i*.025,.32,6),C,0,0,-.15,t).rotation.x=Math.PI/2;L.tailJoints.push(t);tp=t}M(cone(.08,.18,3),o.spine,0,0,-.35,tp).rotation.x=-Math.PI/2;
 for(const sx of[-1,1]){const w=piv(body,sx*.25,.28,.1);const wg=geo('dwing'+sx,()=>{const s=new T.Shape();s.moveTo(0,0);s.lineTo(sx*1.1,.35);s.lineTo(sx*1.0,-.25);s.lineTo(sx*.7,-.05);s.lineTo(sx*.55,-.4);s.lineTo(sx*.3,-.1);s.lineTo(0,-.45);const gg=new T.ShapeGeometry(s);gg.rotateX(-Math.PI/2);return gg});const wm=new T.Mesh(wg,mt(o.wing));wm.material.side=T.DoubleSide;w.add(wm);M(cyl(.025,.02,1.1,4),C,sx*.55,0,-.17,w).rotation.set(0,sx*-.32,Math.PI/2);w.rotation.z=sx*.35;L[sx<0?'wL':'wR']=w}
 const lh=ht-.04;for(const [sx,sz] of[[-1,1],[1,1],[-1,-1],[1,-1]]){const h=piv(body,sx*.3,-.1,sz*.38);M(cyl(.09,.07,lh*.55,5),C,0,-lh*.27,0,h);const k=piv(h,0,-lh*.55,0);M(cyl(.06,.05,lh*.4,5),C,0,-lh*.2,0,k);const f=M(box(.14,.05,.18),C,0,-lh*.42,.04,k);for(const cx of[-.04,0,.04])M(cone(.015,.06,3),0xe8e0c8,cx,-lh*.42,.15,k).rotation.x=Math.PI/2;L.legs.push([h,k,sx*sz])}
 g.userData.L=L;g.userData.anim=(L,ph,a,run,t)=>{animQuad(L,ph,a,run);dragonExtra(L,t,a)};g.userData.idle=(L,t)=>{L.head.rotation.x=Math.sin(t*.6)*.08;dragonExtra(L,t,0)};return g}
function dragonExtra(L,t,a){L.tailJoints.forEach((s,i)=>s.rotation.y=Math.sin(t*1.5-i*.6)*(.12+a*.1));const f=.35+Math.sin(t*(a>.5?5:1.2))*(a>.5?.25:.06);L.wL.rotation.z=-f;L.wR.rotation.z=f}
// ---------- FIRE ELEMENTAL ('A living flame.') glowing stacked flame body, floats
export function fireEl(o){const g=new T.Group(),m=piv(g,0,0,0);m.scale.setScalar(o.scale||1);const L={fl:[]};const b=piv(m,0,.35,0);L.body=b;
 const cols=[0xff3a00,0xff7a10,0xffb030,0xffe070];
 [[0,0,0,.32,.9,0],[0,.35,0,.24,.8,1],[.12,.55,.04,.12,.45,2],[-.12,.6,-.04,.12,.5,2],[0,.75,0,.13,.55,3]].forEach(([x,y,z,r,h,c])=>{const f=Mg(cone(r,h,6),cols[c],x,y+h/2,z,b);L.fl.push(f)});
 Mg(sph(.07),0xffffff,0,.85,.1,b);for(const sx of[-1,1])Mg(box(.05,.05,.02),0x401000,sx*.07,.9,.14,b);
 for(const sx of[-1,1]){const a=piv(b,sx*.25,.55,0);Mg(cone(.08,.45,5),cols[1],sx*.12,-.05,0,a).rotation.z=sx*1.9;L[sx<0?'aL':'aR']=a}
 for(let i=0;i<4;i++)L.fl.push(Mg(cone(.04,.18,4),cols[3],Math.sin(i*1.6)*.2,1.1,Math.cos(i*1.6)*.15,b));
 const fl=(L,t,a)=>{L.body.position.y=.35+Math.sin(t*2.2)*.06;L.fl.forEach((f,i)=>{f.scale.y=1+Math.sin(t*9+i*1.7)*.15;f.rotation.y=t*(i%2?1.5:-1.2)});L.aL.rotation.x=Math.sin(t*3)*.3+a*.3;L.aR.rotation.x=-Math.sin(t*3)*.3+a*.3};
 g.userData.L=L;g.userData.anim=(L,ph,a,r,t)=>fl(L,t,a);g.userData.idle=(L,t)=>fl(L,t,0);return g}
// ---------- LAVA GOLEM KING (molten rock golem, crowned) humanoid joint names -> animHuman
export function lavaGolem(o){const g=new T.Group(),m=piv(g,0,0,0);m.scale.setScalar(o.scale||1.6);const L={};const R=0x3a2a28,R2=0x2a1e1c,G=0xff5a10,Y=0xffb020;
 const rock=(r,x,y,z,p,sx=1,sy=1,sz=1)=>M(geo(`dd${r},${sx},${sy},${sz}`,()=>{const q=new T.DodecahedronGeometry(r,0);q.scale(sx,sy,sz);return q}),R,x,y,z,p);
 const pel=piv(m,0,.85,0);rock(.22,0,0,0,pel,1.3,.6,.9);
 const leg=sx=>{const h=piv(pel,sx*.16,-.05,0);rock(.13,0,-.2,0,h,1,1.6,1);const k=piv(h,0,-.42,0);rock(.12,0,-.18,0,k,1,1.5,1);M(box(.22,.1,.3),R2,0,-.37,.04,k);Mg(box(.05,.12,.02),G,0,-.2,.11,k);return[h,k]};
 [L.hL,L.kL]=leg(-1);[L.hR,L.kR]=leg(1);
 const ch=piv(pel,0,.05,0);L.chest=ch;rock(.34,0,.35,0,ch,1.25,1,.85);rock(.16,-.32,.55,0,ch);rock(.16,.32,.55,0,ch);
 for(const [x,y,w,h] of[[0,.35,.06,.36],[-.12,.28,.04,.22],[.13,.42,.04,.2],[0,.18,.22,.04]])Mg(box(w,h,.02),G,x,y,.29,ch);Mg(sph(.07),Y,0,.4,.27,ch);
 const nk=piv(ch,0,.68,0);L.neck=nk;const hd=piv(nk,0,.05,0);L.head=hd;rock(.16,0,.1,0,hd,1,.9,1);for(const sx of[-1,1])Mg(box(.06,.03,.02),Y,sx*.07,.12,.15,hd);
 for(let i=0;i<5;i++){const a=i/5*Math.PI*2;M(cone(.04,.14,4),0xd8a020,Math.sin(a)*.12,.28,Math.cos(a)*.12,hd)}M(cyl(.14,.15,.05,8),0xd8a020,0,.22,0,hd);
 const arm=sx=>{const sh=piv(ch,sx*.42,.55,0);rock(.12,0,-.18,0,sh,1,1.6,1);const el=piv(sh,0,-.4,0);rock(.11,0,-.16,0,el,1,1.5,1);Mg(box(.02,.15,.05),G,sx*.1,-.15,0,el);const hn=piv(el,0,-.36,0);rock(.12,0,0,0,hn);return[sh,el,hn]};
 [L.sL,L.eL,L.handL]=arm(-1);[L.sR,L.eR,L.handR]=arm(1);g.userData.L=L;g.userData.anim=animHuman;return g}

// ---------- SOURCE MODELS (decoded client cache, see assets/src/*.json). unit 128 = 1 tile for ALL models (no auto-fit).
// Procedural model stays as fallback (visible until load, kept hidden for picking afterwards).
const SRC={},TICK=.02; // client cycle 20 ms: Client.java tick%40<20 cursor blink; Npc seqCycle++ per cycle
function loadSrc(name){return SRC[name]||(SRC[name]=fetch('./assets/src/'+name+'.json?v=1').then(r=>{if(!r.ok)throw Error(name+' '+r.status);return r.json()}).then(d=>{const n=d.f.length,col=new Float32Array(n*3),c=new T.Color();
 for(let i=0;i<n;i++){c.setHex(d.rgb[(i/3)|0]);col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b}
 const V=d.v.length/3;for(const a of Object.values(d.anims)){a.frames.forEach((fr,j)=>{if(fr.length!==V*3)throw Error(name+' frame '+j+' vcount '+fr.length/3+'!='+V)});a.total=a.ticks.reduce((x,y)=>x+y,0)*TICK}
 d.col=new T.BufferAttribute(col,3);d.mat=new T.MeshLambertMaterial({vertexColors:true,flatShading:true});return d}))}
function fillPos(d,arr,A,B,u){const f=d.f,s=1/d.unit;for(let i=0;i<f.length;i++){const k=f[i]*3;for(let j=0;j<3;j++)arr[i*3+j]=(A[k+j]+(B[k+j]-A[k+j])*u)*s}}
export function srcModel(name,fallback){const g=fallback();const fb=g.userData;const root=new T.Group();root.add(g);
 const u={L:fb.L,src:null,anim:(L,ph,a,run,t)=>{fb.anim(L,ph,a,run,t);if(u.src)srcFrame(u,a>.3?'walk':'stand',t)},idle:(L,t)=>{if(fb.idle)fb.idle(L,t);if(u.src)srcFrame(u,'stand',t)},fallbackAnim:fb};
 root.userData=u;
 loadSrc(name).then(d=>{const geo=new T.BufferGeometry();const pos=new Float32Array(d.f.length*3);fillPos(d,pos,d.v,d.v,0);geo.setAttribute('position',new T.BufferAttribute(pos,3));geo.setAttribute('color',d.col);geo.computeBoundingSphere();
  const m=new T.Mesh(geo,d.mat);m.userData=Object.assign({},g.children[0]?.userData||{});m.userData.src=d.src;root.add(m);g.visible=false;u.src={d,m,pos};u.srcMeta=d.src}).catch(e=>{console.warn('source model fallback:',e.message);u.srcError=e.message});
 return root}
function srcFrame(u,an,t){const {d,m,pos}=u.src,a=d.anims[an];if(!a)return;let x=(t%a.total)/TICK,i=0;while(x>=a.ticks[i]){x-=a.ticks[i];i++}const j=(i+1)%a.ticks.length;
 fillPos(d,pos,a.frames[i],a.frames[j],x/a.ticks[i]);m.geometry.attributes.position.needsUpdate=true;u.srcState=[an,i]}
// ---------- kind table (explicit n.kind -> model) ----------
const SK=0xe0b48c,SK2=0xc89870,SK3=0x9a6a48;
const H=(o)=>()=>humanoid(Object.assign({skin:SK,hair:0x4a3020,shirt:0x777777,legs:0x4a4038,boots:0x3a2a1a},o));
export const KINDS={
 player:H({hair:0x5a3a1a,shirt:0x2a5ab0,sleeve:0x2a5ab0,legs:0x3a3a5a,boots:0x4a3020,belt:0x6b4a2a}),
 pip:H({scale:.72,hair:0xc08a40,shirt:0x6aa040,legs:0x6b5a3a,boots:0x5a3a1a,hat:'cap',hatC:0xb04030}),            // 'A curious village kid.'
 fen:H({skin:SK2,hair:0xcfcfcf,beard:0xd8d8d8,shirt:0x6b5a40,legs:0x4a4038,hat:'helm',hatC:0x9a9070,item:'pick'}), // retired miner
 banker:H({hair:0x2a2a2a,shirt:0x2a2a40,sleeve:0x2a2a40,legs:0x2a2a2a,boots:0x111111,belt:0xc8a040,apron:0xc8a040}),
 shopkeep:H({hair:0x8a3a2a,hairStyle:'bun',shirt:0x8a5a2a,legs:0x5a4030,apron:0xe8e0c8}),
 guide:H({hair:0xe0c060,hairStyle:'long',shirt:0x3a7a3a,robe:0x3a7a3a,legs:0x3a5a2a,item:'staff',itemC:0x88ff88}),
 rook:H({skin:SK2,hair:0x222222,beard:0x222222,shirt:0x8a1a1a,legs:0x2a2a2a,boots:0x111111,cape:0x5a1010,belt:0xc8a040,item:'sword'}),
 foreman:H({skin:SK3,hair:0x3a2a1a,shirt:0xc87a20,legs:0x3a3a5a,hat:'helm',hatC:0xd8b820,item:'pick',bulk:1}),
 guard:H({shirt:0x6a6a70,sleeve:0x5a5a60,legs:0x4a4a50,boots:0x2a2a2a,hat:'helm',hatC:0x8a8a90,item:'spear',cape:0x5a5a5a}),
 warden:H({shirt:0x3a4a3a,legs:0x2a3a2a,hat:'helm',hatC:0x5a6a5a,item:'sword',itemC:0x9ab0a0,cape:0x2a3a2a,bulk:1}),
 bknight:H({skin:0x222222,shirt:0x1a1a1e,sleeve:0x1a1a1e,legs:0x1a1a1e,boots:0x111111,hat:'helm',hatC:0x1a1a1e,item:'sword',itemC:0x333338,bulk:1}),
 darkwiz:H({shirt:0x2a1a40,robe:0x2a1a40,sleeve:0x2a1a40,hat:'wizard',hatC:0x2a1a40,item:'staff',itemC:0xaa33ff,beard:0x888888}),
 fanatic:H({shirt:0x5a2a1a,robe:0x5a2a1a,hat:'hood',hatC:0x3a1a10,item:'staff',itemC:0xff6622}),
 skeleton:H({skin:0xe8e4d0,hair:null,shirt:0xe8e4d0,legs:0xe8e4d0,boots:0xe8e4d0,thin:1,item:'sword',itemC:0x9a9a9a}),
 zombie:H({skin:0x7a9a5a,hair:0x2a2a1a,shirt:0x5a4a3a,legs:0x3a3a4a,boots:0x3a3a3a}),
 wight:H({skin:0xb0b8c0,hair:null,shirt:0x50505a,robe:0x40404a,hat:'hood',hatC:0x30303a,thin:1}),
 hillgiant:H({scale:1.6,skin:SK2,hair:0x5a3a1a,shirt:0x7a5a30,legs:0x6a4a28,item:'pick',bulk:1}),
 mossgiant:H({scale:1.6,skin:0x6a8a4a,hair:0x3a6a2a,beard:0x3a6a2a,shirt:0x4a6a3a,legs:0x3a5a2a,bulk:1}),
 ogre:H({scale:1.5,skin:0x8a8a6a,hair:null,shirt:0x6a5a4a,legs:0x5a4a3a,bulk:1}),
 demon:H({scale:1.4,skin:0xa02020,hair:null,shirt:0xa02020,sleeve:0xa02020,legs:0x801818,boots:0x401010,hat:'horns',bulk:1}),
 ashlord:H({scale:1.3,skin:0x5a3a3a,shirt:0x2a2a2a,robe:0x3a1a1a,hat:'horns',item:'staff',itemC:0xff4400,cape:0x8a2010}),
 cow:()=>srcModel('cow',()=>quad({body:0xf0ece0,spots:0x2a2a2a,head:0xf0ece0,snout:.12,snoutC:0xe0a0a0,len:1.25,ht:.75,w:.95,ears:.1,horns:1,tail:.55,tailC:0x2a2a2a,legW:.07})),
 fox:()=>quad({body:0xd86b28,mane:0xf0d2a6,head:0xe47a31,snout:.18,snoutC:0xf3d8bd,len:.78,ht:.38,w:.48,bh:.48,ears:.18,earC:0x8b351f,tail:.72,tailC:0xf0d2a6,legW:.035,hoof:0x34251f,fangs:1}),
 wolf:()=>quad({body:0x66717d,mane:0x4b5560,head:0x84909b,snout:.2,snoutC:0x444b52,len:.95,ht:.55,w:.6,bh:.5,ears:.14,tail:.45,legW:.045,hoof:0x30343a,fangs:1}),
 boar:()=>quad({body:0x65432f,mane:0x3d2a20,head:0x513522,snout:.14,snoutC:0xb8786e,len:.95,ht:.45,w:.75,ears:.09,tusks:1,tail:.2,legW:.06}),
 rat:()=>quad({body:0x524650,head:0x695b66,snout:.1,snoutC:0xd0959f,len:.5,ht:.17,w:.32,bh:.25,ears:.07,earC:0xd0959f,tail:.45,tailC:0xd0959f,legW:.025,hoof:0xb87f89}),
 mudhen:()=>bird({body:0x8a6a40,wing:0x6a4a28,head:0x7a5a38,tailC:0x4a3018}),
 spider:()=>spider({body:0x2a2228,leg:0x3a3036,scale:1.3}),
 bat:()=>bat({body:0x3a2a2a,wing:0x2a1e1e}),
 toad:()=>toad({body:0x5a7a3a,belly:0xc8c890}),
 thornling:()=>thornling({}),
 drake:()=>dragon({scale:.75,body:0x8a3a1a,belly:0xd08040,spine:0x3a1a10,wing:0x6a2a14,eye:0xffa020}),   // 'small dragon-kin with smouldering scales'
 gdragon:()=>dragon({scale:1.35,body:0x2f7a34,belly:0xa8b860,spine:0x1a4a1e,wing:0x24602a,eye:0xff3020}), // 'A young green dragon.'
 fireel:()=>fireEl({}),
 lavaking:()=>lavaGolem({scale:1.6}),
};
// All map kinds now have real models; PLACEHOLDER kept only as fallback for unknown future kinds.
export const PLACEHOLDER={};
export function makeChar(kind){const f=KINDS[kind];let g;if(f)g=f();else{g=H(PLACEHOLDER[kind]||{shirt:0x888888})();g.userData.placeholder=true}
 const u=g.userData;if(!u.idle)u.idle=u.anim===animHuman?idleHuman:u.anim===animQuad?idleQuad:()=>{};u.kind=kind;return g}
// distance-driven animation: phase advances by distance/strideLen; blends to idle when stopped, phase resets cleanly
export function animate(e,dist,dt,t,running){const u=e.g.userData;const moving=dist>1e-4;
 e.amt=(e.amt||0)+((moving?1:0)-(e.amt||0))*Math.min(1,dt*(moving?10:7));
 if(moving)e.phase=(e.phase||0)+dist*Math.PI*2/(running?1.7:1.15);else if(e.amt<.05)e.phase=0;
 const tt=t+(u.tOff||0);u.anim(u.L,e.phase||0,e.amt,running,tt);if(!moving&&e.amt<.5)u.idle(u.L,tt)}
export const poolStats=()=>({geometries:GC.size,materials:MC.size});
