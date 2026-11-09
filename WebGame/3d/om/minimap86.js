// Readable minimap markers backed by the existing live presence session.
export function mountMinimap86(canvas, terrain, actions) {
 const context=canvas.getContext('2d'),size=300,pixelsPerTile=4;let scale=1.3,expanded=false,focus=null,destination=null,suppressClick=0;
 const backdrop=document.createElement('canvas');backdrop.width=terrain.width;backdrop.height=terrain.height;
 const paint=backdrop.getContext('2d');paint.filter='saturate(.75) brightness(1.15) contrast(1.12)';paint.drawImage(terrain,0,0);
 const badge=document.createElement('button');badge.id='minimap-players';badge.type='button';badge.textContent='Connecting…';
 badge.title='Open active player list';badge.onclick=e=>{e.stopPropagation();actions.openPlayers()};
 badge.addEventListener('pointerdown',e=>e.stopPropagation());canvas.parentElement.appendChild(badge);
 let cssSize=canvas.clientWidth||128,frame=null,last=-Infinity,lastStatus='';
 const observer=new ResizeObserver(entries=>{cssSize=entries[0].contentRect.width||128;last=-Infinity});observer.observe(canvas);
 canvas.setAttribute('aria-label','Minimap: gold arrow is you, cyan markers are active players, gold dots are villagers, red diamonds are enemies. Click a player marker to view that player, or terrain to walk.');
 canvas.title='Tap to expand. Cyan: active players · Gold: villagers · Red: enemies';
 const wrap=canvas.parentElement,controls=document.createElement('div');controls.className='mini-controls87';controls.innerHTML='<button type="button" data-mini-out aria-label="Zoom out">−</button><button type="button" data-mini-in aria-label="Zoom in">+</button><button type="button" data-mini-you>You</button><button type="button" data-mini-walk disabled>Walk</button><button type="button" data-mini-clear aria-label="Clear route">Clear</button><button type="button" data-mini-close aria-label="Collapse minimap">×</button>';wrap.appendChild(controls);const caption=document.createElement('span');caption.className='mini-caption87';caption.textContent='Nearby';wrap.appendChild(caption);
 function sizeExpanded(){const extra=innerWidth<260?164:120,side=Math.max(44,Math.floor(Math.min(280,(Math.sqrt(extra*extra+innerWidth*innerHeight)-extra-8)/2,innerHeight-extra-100)));wrap.style.setProperty('--expanded-size87',side+'px');wrap.style.setProperty('--mini-extra87',extra+'px');wrap.style.setProperty('--mini-controls-height87',(extra-24)+'px');wrap.style.setProperty('--mini-columns87',innerWidth<260?'2':'3');last=-Infinity}
 function expand(){expanded=true;sizeExpanded();wrap.classList.add('expanded87');canvas.setAttribute('aria-label','Expanded minimap. Select a point to preview a route, then press Walk. Cyan markers open real player menus.');last=-Infinity}
 function clear(){destination=null;caption.textContent='Nearby';controls.querySelector('[data-mini-walk]').disabled=true;last=-Infinity}
 function collapse(){expanded=false;focus=null;clear();wrap.classList.remove('expanded87');last=-Infinity}
 function zoom(factor){scale=Math.max(.7,Math.min(3,scale*factor));last=-Infinity}
 function preview(x,z,label='Route'){const route=actions.preview?.(x,z);destination=route||null;caption.textContent=route?label+' · '+route.path.length+' tiles':'No reachable route';controls.querySelector('[data-mini-walk]').disabled=!route;last=-Infinity}
 controls.addEventListener('pointerdown',e=>e.stopPropagation());controls.addEventListener('click',e=>{e.stopPropagation();const b=e.target.closest('button');if(!b)return;if(b.hasAttribute('data-mini-out'))zoom(1/1.25);if(b.hasAttribute('data-mini-in'))zoom(1.25);if(b.hasAttribute('data-mini-you')){focus=null;last=-Infinity}if(b.hasAttribute('data-mini-clear'))clear();if(b.hasAttribute('data-mini-close'))collapse();if(b.hasAttribute('data-mini-walk')&&destination){const d=destination;clear();collapse();actions.walk(d.x,d.z)}});
 const touches=new Map();let pinch=null;canvas.addEventListener('pointerdown',e=>{if(!expanded)return;e.preventDefault();canvas.setPointerCapture(e.pointerId);touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(touches.size===2){const [a,b]=[...touches.values()];pinch={distance:Math.hypot(a.x-b.x,a.y-b.y),scale};suppressClick=performance.now()+800}});canvas.addEventListener('pointermove',e=>{if(!touches.has(e.pointerId))return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch&&touches.size===2){e.preventDefault();const[a,b]=[...touches.values()];scale=Math.max(.7,Math.min(3,pinch.scale*Math.hypot(a.x-b.x,a.y-b.y)/Math.max(1,pinch.distance)));suppressClick=performance.now()+800;last=-Infinity}});for(const type of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(type,e=>{touches.delete(e.pointerId);if(pinch)suppressClick=performance.now()+800;if(!touches.size)pinch=null});
 addEventListener('resize',()=>{if(expanded)sizeExpanded()});

 const point=(x,z,f)=>{const dx=(x-f.x)*pixelsPerTile*f.scale,dz=(z-f.z)*pixelsPerTile*f.scale,c=Math.cos(f.yaw),s=Math.sin(f.yaw);return [size/2+dx*c-dz*s,size/2+dx*s+dz*c]};
 function circle(x,y,r,fill,stroke='#172337',width=1){context.beginPath();context.arc(x,y,r,0,Math.PI*2);context.fillStyle=fill;context.fill();context.strokeStyle=stroke;context.lineWidth=width;context.stroke()}
 function label(text,x,y,unit){context.font=`600 ${8*unit}px system-ui`;context.textAlign='center';context.lineWidth=3*unit;context.strokeStyle='#122235';context.strokeText(text,x,y);context.fillStyle='#e3fbff';context.fillText(text,x,y)}
 function draw(x,z,yaw,heading,now){
  if(now-last<66)return;last=now;
  const state=actions.presence(),unit=size/cssSize;
  const ownX=x,ownZ=z;if(expanded&&focus){x=focus.x;z=focus.z}frame={x,z,yaw,scale,unit,peers:[],enemies:[]};
  const text=!state.enabled?'Offline':state.on&&state.online!==null?`${state.online} online`:state.err?'Reconnecting…':'Connecting…';
  if(text!==lastStatus){lastStatus=text;badge.textContent=text;badge.setAttribute('aria-label',text+'. Open active player list.');badge.classList.toggle('connected',state.on)}
  context.clearRect(0,0,size,size);context.save();context.beginPath();context.arc(size/2,size/2,size/2,0,Math.PI*2);context.clip();
  context.fillStyle='#20394b';context.fillRect(0,0,size,size);
  context.save();context.translate(size/2,size/2);context.rotate(yaw);context.scale(scale,scale);context.translate(-x*pixelsPerTile,-z*pixelsPerTile);context.drawImage(backdrop,0,0);context.restore();
  const inside=(x,y,margin=7*unit)=>Math.hypot(x-size/2,y-size/2)<size/2-margin;
  for(const villager of actions.people()){
   const [a,b]=point(villager.x+.5,villager.z+.5,frame);if(inside(a,b))circle(a,b,1.8*unit,'#ffd575','#604a30',.7*unit);
  }
  for(const monster of actions.enemies()){
   if(monster.dead)continue;const p=monster.vpos(now),[a,b]=point(p[0],p[1],frame);if(!inside(a,b))continue;
   const selected=actions.selected()===monster,r=(selected?3.8:2.2)*unit;
   context.beginPath();context.moveTo(a,b-r);context.lineTo(a+r,b);context.lineTo(a,b+r);context.lineTo(a-r,b);context.closePath();context.fillStyle=selected?'#fff0a1':'#ed747c';context.fill();context.strokeStyle='#522d3d';context.lineWidth=unit;context.stroke();frame.enemies.push({entity:monster,x:a,y:b});
  }
  for(const story of (expanded?actions.stories?.()||[]:[])){const [sx,sy]=point(story.x,story.z,frame);if(inside(sx,sy)){circle(sx,sy,4*unit,'#ffdb75','#513a35',unit);label('!',sx,sy+3*unit,unit)}}
  if(expanded&&destination){context.beginPath();const start=point(ownX,ownZ,frame);context.moveTo(...start);for(const [tx,tz]of destination.path)context.lineTo(...point(tx+.5,tz+.5,frame));context.strokeStyle='#fff3a1';context.lineWidth=2*unit;context.stroke();const d=point(destination.x+.5,destination.z+.5,frame);circle(d[0],d[1],4*unit,'#dfaf65','#fff0b5',unit)}
  // Cyan rings stay distinct from villagers and enemies; distant peers show at the rim.
  const peers=[...(state.on?state.players.values():[])].map(row=>({row,p:row.e.vpos(now)})).sort((a,b)=>Math.hypot(a.p[0]-x,a.p[1]-z)-Math.hypot(b.p[0]-x,b.p[1]-z));
  const occupied=[];
  for(let k=0;k<peers.length;k++){
   const {row,p}=peers[k];let [a,b]=point(p[0],p[1],frame);const dx=a-size/2,dy=b-size/2,d=Math.hypot(dx,dy),limit=size/2-10*unit,edge=d>limit;
   if(edge){a=size/2+dx*limit/d;b=size/2+dy*limit/d}
   circle(a,b,(edge?3:4)*unit,'#51e4f4','#102d47',1.5*unit);circle(a,b,1.2*unit,'#ecffff','#ecffff',0);
   frame.peers.push({entity:row.e,x:a,y:b});
   // Limit labels and avoid the centre arrow, compass letters, badge and other names.
   const name=String(row.name||row.e.name||'Player').slice(0,10),ly=b-7*unit,width=Math.max(18,name.length*4.5)*unit;
   const rect={l:a-width/2,r:a+width/2,t:ly-8*unit,b:ly+unit};
   if(k<4&&!edge&&rect.l>8*unit&&rect.r<size-8*unit&&rect.t>16*unit&&rect.b<size-28*unit&&Math.hypot(a-size/2,ly-size/2)>15*unit&&!occupied.some(o=>rect.l<o.r&&rect.r>o.l&&rect.t<o.b&&rect.b>o.t)){
    label(name,a,ly,unit);occupied.push(rect);
   }
  }
  for(const [letter,dx,dz] of [['N',0,-1],['E',1,0],['S',0,1],['W',-1,0]]){
   const c=Math.cos(yaw),s=Math.sin(yaw),r=size/2-9*unit;label(letter,size/2+(dx*c-dz*s)*r,size/2+(dx*s+dz*c)*r+3*unit,unit);
  }
  let [cx,cy]=point(ownX,ownZ,frame);const ownDistance=Math.hypot(cx-size/2,cy-size/2),ownLimit=size/2-10*unit;if(ownDistance>ownLimit){cx=size/2+(cx-size/2)*ownLimit/ownDistance;cy=size/2+(cy-size/2)*ownLimit/ownDistance}circle(cx,cy,7*unit,'#16344bc9','#ffe9a2',1.2*unit);
  const a=heading-yaw;
  context.save();context.translate(cx,cy);context.rotate(-a);context.beginPath();context.moveTo(0,6*unit);context.lineTo(-4*unit,-4*unit);context.lineTo(0,-2*unit);context.lineTo(4*unit,-4*unit);context.closePath();context.fillStyle='#ffe797';context.strokeStyle='#15253d';context.lineWidth=unit;context.fill();context.stroke();context.restore();
  context.restore();
 }
 canvas.addEventListener('pointerdown',e=>e.stopPropagation());
 canvas.addEventListener('click',e=>{
  e.stopPropagation();if(performance.now()<suppressClick)return;if(!expanded){expand();return}if(!frame)return;const r=canvas.getBoundingClientRect();
  const x=(e.clientX-r.left)*size/r.width,y=(e.clientY-r.top)*size/r.height,dx=x-size/2,dy=y-size/2;
  if(Math.hypot(dx,dy)>size/2)return;
  const peer=frame.peers.map(p=>({...p,d:Math.hypot(p.x-x,p.y-y)})).filter(p=>p.d<=8*frame.unit).sort((a,b)=>a.d-b.d)[0];
  if(peer){actions.openPlayer(peer.entity);return}
  const enemy=frame.enemies.map(p=>({...p,d:Math.hypot(p.x-x,p.y-y)})).filter(p=>p.d<=5*frame.unit).sort((a,b)=>a.d-b.d)[0];
  const c=Math.cos(frame.yaw),s=Math.sin(frame.yaw);
  preview(Math.floor(frame.x+(dx*c+dy*s)/(frame.scale*pixelsPerTile)),Math.floor(frame.z+(-dx*s+dy*c)/(frame.scale*pixelsPerTile)));
 });
 return {draw,expand,collapse,showTarget(x,z,label){expand();focus={x:x+.5,z:z+.5};preview(x,z,label||'Story destination')}};
}
