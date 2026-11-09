// Mobile navigation routes into the existing game panels and manual actions.
const ITEM_MENU_KEY='bwl.mobile.item-menu';
export const mobilePreferences={itemMenu:false};
try{mobilePreferences.itemMenu=localStorage.getItem(ITEM_MENU_KEY)==='1'}catch(_){}
export function setItemTapOptions(enabled){
 mobilePreferences.itemMenu=!!enabled;
 try{localStorage.setItem(ITEM_MENU_KEY,enabled?'1':'0')}catch(_){}
}

export function initMobileControls(actions){
 const media=matchMedia('(pointer:coarse)');
 const toggle=document.createElement('button');
 toggle.id='mobile-menu-toggle';toggle.type='button';toggle.textContent='Menu';
 toggle.setAttribute('aria-label','Open all game controls');
 toggle.setAttribute('aria-haspopup','dialog');toggle.setAttribute('aria-expanded','false');
 toggle.setAttribute('aria-controls','mobile-game-menu');
 const menu=document.createElement('dialog');menu.id='mobile-game-menu';
 menu.setAttribute('aria-labelledby','mobile-menu-title');
 menu.innerHTML=`<header><h2 id="mobile-menu-title">Game menu</h2><button type="button" data-mobile="close" aria-label="Close game menu">×</button></header>
 <div class="mobile-menu-body"><h3>Game panels</h3><div class="mobile-panel-grid"></div>
 <h3>Quick controls</h3><div class="mobile-quick-grid">
 <button type="button" data-mobile="chat">Show chat</button>
 <button type="button" data-mobile="run" aria-pressed="false">Run</button>
 <button type="button" data-mobile="xp" aria-pressed="false">XP drops</button>
 <button type="button" data-mobile="map">World map</button>
 <button type="button" data-mobile="camera">Camera controls</button>
 <button type="button" data-mobile="stop">Stop walking or skilling</button>
 </div><button type="button" class="mobile-item-mode" data-mobile="item-mode" aria-pressed="false">Item taps</button>
 <details class="mobile-help"><summary>How to use touch controls</summary>
 <p>Tap the ground to walk. Tap a person or object to interact. Hold to see its other options.</p>
 <p>Drag the world to turn the camera. Pinch to zoom, or use the Camera buttons.</p>
 <p>Tap an inventory item for its quick action. Hold it for all actions, or turn on item tap menus above.</p>
 <p>In a bank, tap inventory to deposit and bank items to withdraw. Hold for quantity choices. In a shop, choose a buy quantity before tapping stock.</p>
 <p>Use the world map to plan a route. Choose Walk to follow the route or Clear to remove it.</p>
 </details></div>`;
 const grid=menu.querySelector('.mobile-panel-grid');
 for(const[id,icon,label]of actions.tabs){
  const button=document.createElement('button');button.type='button';button.dataset.panel=id;
  const picture=document.createElement('span');picture.textContent=icon;picture.setAttribute('aria-hidden','true');
  const text=document.createElement('span');text.textContent=label;
  button.append(picture,text);button.setAttribute('aria-pressed','false');grid.appendChild(button);
 }
 document.body.append(toggle,menu);
 const refresh=()=>{
  menu.querySelectorAll('[data-panel]').forEach(b=>b.setAttribute('aria-pressed',String(actions.selectedPanel()===b.dataset.panel)));
  const states={run:actions.runEnabled(),xp:actions.xpEnabled(),'item-mode':mobilePreferences.itemMenu};
  for(const[key,on]of Object.entries(states))menu.querySelector(`[data-mobile="${key}"]`).setAttribute('aria-pressed',String(on));
  menu.querySelector('[data-mobile="run"]').textContent='Run: '+(states.run?'On':'Off');
  menu.querySelector('[data-mobile="xp"]').textContent='XP drops: '+(states.xp?'On':'Off');
  menu.querySelector('[data-mobile="item-mode"]').textContent='Item tap: '+(states['item-mode']?'Show all options':'Quick action');
  menu.querySelector('[data-mobile="chat"]').textContent=actions.chatVisible()?'Hide chat':'Show chat';
 };
 const close=()=>{if(menu.open)menu.close()};
 const open=()=>{
  if(!media.matches||menu.open)return;
  actions.cancelGesture();actions.closeContextMenu();refresh();menu.showModal();toggle.setAttribute('aria-expanded','true');
 };
 toggle.addEventListener('click',open);
 menu.addEventListener('close',()=>toggle.setAttribute('aria-expanded','false'));
 menu.addEventListener('keydown',e=>e.stopPropagation());
 menu.addEventListener('click',e=>{
  if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();return}
  const button=e.target.closest('button');if(!button)return;e.stopPropagation();
  if(button.dataset.panel){const id=button.dataset.panel;close();actions.showPanel(id);return}
  switch(button.dataset.mobile){
   case 'close':close();break;
   case 'run':actions.toggleRun();refresh();break;
   case 'xp':actions.toggleXP();refresh();break;
   case 'chat':actions.toggleChat();refresh();break;
   case 'item-mode':setItemTapOptions(!mobilePreferences.itemMenu);actions.preferenceChanged();refresh();break;
   case 'map':close();actions.openMap();break;
   case 'camera':close();actions.openCamera();break;
   case 'stop':close();actions.stopAction();break;
  }
 });
 const sync=()=>{toggle.hidden=!media.matches;if(!media.matches)close()};
 media.addEventListener('change',sync);sync();
 return{open,close,refresh};
}
