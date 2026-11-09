// Additive v87 content. Existing inventory IDs, skill experience and quest flags stay intact.
export const ITEMS87={
 moonberries:{n:'Moonberries',st:1,v:5,atlas87:0,story87:true,ex:'Sweet berries from the village groves.'},
 wild_honey:{n:'Wildflower Honey',st:1,v:5,atlas87:1,story87:true,ex:'Golden honey from Briarhaven market.'},
 flour87:{n:'Stoneground Flour',st:1,v:5,atlas87:2,story87:true,ex:'Flour for the inn’s famous pie.'},
 cloud_wool:{n:'Cloudsheep Wool',st:1,v:5,atlas87:3,story87:true,ex:'Soft wool for a very comfortable coat.'},
 twine87:{n:'Garden Twine',st:1,v:5,atlas87:4,story87:true,ex:'Strong twine, useful for village crafts.'},
 meadow_flowers:{n:'Meadow Flowers',st:1,v:5,atlas87:5,story87:true,ex:'Flowers gathered by hand in the village.'},
 glow_crystal:{n:'Glow Crystal',st:1,v:5,atlas87:6,story87:true,ex:'A gentle light held in blue stone.'},
 moonberry_pie:{n:'Moonberry Pie',st:1,v:10,heal:6,atlas87:7,ex:'A warm lattice pie, made with care.'},
 cloud_cloth:{n:'Cloudweave Cloth',st:1,v:7,atlas87:8,story87:true,ex:'Woven wool, ready for a village delivery.'},
 trail_lantern:{n:'Trail Lantern',st:1,v:7,atlas87:9,story87:true,ex:'Place at a discovered trail landmark.'},
 calming_mixture:{n:'Calming Mixture',st:1,v:7,atlas87:10,story87:true,ex:'A fragrant mixture for Moss’s garden.'},
 explorer_cap:{n:'Wanderer’s Cap',v:0,slot:'head',b:{def:3},atlas87:11,explorer87:true,unsellable:true,ex:'Explorer set: a feathered cap for curious wanderers.'},
 explorer_tunic:{n:'Traveler’s Tunic',v:0,slot:'body',b:{def:9},atlas87:12,explorer87:true,unsellable:true,ex:'Explorer set: a supple leather and moss-green tunic.'},
 explorer_pants:{n:'Sturdy Hiker Pants',v:0,slot:'legs',b:{def:8},atlas87:13,explorer87:true,unsellable:true,ex:'Explorer set: made for the long way home.'},
 explorer_blade:{n:'Little Adventurer’s Blade',v:0,slot:'weapon',spd:4,b:{att:7,str:6},atlas87:14,explorer87:true,unsellable:true,ex:'Explorer set: a small, reliable blade.'},
 explorer_cape:{n:'Forestfriend Cape',v:0,slot:'cape',b:{def:2},atlas87:15,explorer87:true,unsellable:true,ex:'Explorer set: the forest’s colors, stitched with gold.'},
 explorer_boots:{n:'Explorer Boots',atlas87:12,atlasSheet87:'common',v:0,slot:'feet',b:{def:2},explorer87:true,unsellable:true,ex:'Explorer set: comfortable boots for village paths.'},
 recovered_star:{n:'Recovered Star Crystal',st:1,v:0,atlas87:6,story87:true,unsellable:true,ex:'The three trail lights led you to this sleeping star.'}
};
export const RECIPES87=[
 {id:'pie',name:'Bake Moonberry Pie',output:'moonberry_pie',ingredients:{moonberries:3,wild_honey:1,flour87:1},place:'inn',skill:'Cooking',sparks:30},
 {id:'cloth',name:'Weave Cloudweave Cloth',output:'cloud_cloth',ingredients:{cloud_wool:2,twine87:1},place:'workshop',skill:'Crafting',sparks:25},
 {id:'lantern',name:'Craft Trail Lantern',output:'trail_lantern',ingredients:{logs:1,twine87:1,glow_crystal:1},place:'workshop',skill:'Crafting',sparks:20},
 {id:'mixture',name:'Brew Calming Mixture',output:'calming_mixture',ingredients:{meadow_flowers:2,wild_honey:1},place:'inn',skill:'Herblore',sparks:25}
];
export const STORIES87=[
 {id:'moonberry',name:'The Missing Moonberry',flavor:'Bring a little sweetness back to the Moonberry Inn.',reward:'explorer_cap',coins:150,perk:'health',steps:[['Gather or buy 3 moonberries','gather:moonberries',3],['Bake a Moonberry Pie','craft:pie',1],['Deliver the pie to the inn','deliver',1]],delivery:{place:'inn',item:'moonberry_pie'}},
 {id:'cloudsheep',name:'A Coat for Cloudsheep',flavor:'Help the workshop weave something wonderfully warm.',reward:'explorer_tunic',coins:150,perk:'speed',steps:[['Weave Cloudweave Cloth','craft:cloth',1],['Deliver the cloth to the workshop','deliver',1]],delivery:{place:'workshop',item:'cloud_cloth'}},
 {id:'star',name:'The Sleeping Star',flavor:'Follow three old trail lights to a forgotten crystal.',reward:'explorer_pants',coins:200,perk:'critical',steps:[['Discover 3 trail landmarks','discover',3],['Return the crystal to the Starlit Nook','deliver',1]],delivery:{place:'nook',item:'recovered_star'}},
 {id:'meals',name:'A Very Polite Food Fight',flavor:'Three villagers could use a friendly meal.',reward:'explorer_blade',coins:200,perk:'dodge',steps:[['Share meals with 3 different villagers','meal',3]]},
 {id:'lanterns',name:'Lanterns for Lost Friends',flavor:'Let the old paths shine again.',reward:'explorer_cape',coins:250,requires:'star',steps:[['Craft 3 trail lanterns','craft:lantern',3],['Place lanterns at 3 discovered landmarks','place',3]]},
 {id:'bottle',name:'Mischief in a Bottle',flavor:'Moss has a fragrant answer to a restless garden.',reward:'explorer_boots',coins:250,steps:[['Gather or buy 2 meadow flowers','gather:meadow_flowers',2],['Brew a Calming Mixture','craft:mixture',1],['Deliver the mixture to Moss','deliver',1]],delivery:{place:'moss',item:'calming_mixture'}}
];
export const PATHS87=[
 {id:'combat',name:'Combat',line:'The Way of the Blade',icon:'combat',skills:['Attack','Strength','Defence','Hitpoints','Ranged','Magic','Slayer']},
 {id:'gathering',name:'Gathering',line:'Listening to the forest',icon:'inv',skills:['Mining','Fishing','Woodcutting','Farming','Hunter']},
 {id:'crafting',name:'Crafting',line:'Made with care',icon:'equip',skills:['Smithing','Crafting','Fletching','Runecraft','Construction']},
 {id:'support',name:'Support',line:'A little light for others',icon:'prayer',skills:['Prayer','Herblore','Cooking','Firemaking']},
 {id:'exploration',name:'Exploration',line:'The stories beyond the horizon',icon:'skills',skills:['Agility','Thieving']}
];
export function createContent87(a){
 const s=a.state;
 const raw=s.briar87&&typeof s.briar87==='object'&&!Array.isArray(s.briar87)?s.briar87:{};
 s.briar87={version:1,stories:{},discovered:{},pinned:null};
 const v=s.briar87;
 for(const d of STORIES87){const q=raw.stories?.[d.id];if(q&&typeof q==='object')v.stories[d.id]={accepted:!!q.accepted,stage:Math.max(0,Math.min(d.steps.length,Math.floor(Number(q.stage)||0))),count:Math.max(0,Math.floor(Number(q.count)||0)),claimed:!!q.claimed,unique:q.unique&&typeof q.unique==='object'&&!Array.isArray(q.unique)?q.unique:{}}}
 for(const [k,val]of Object.entries(raw.discovered||{}))if(/^[0-2]$/.test(k)&&val===true)v.discovered[k]=true;
 if(STORIES87.some(d=>d.id===raw.pinned))v.pinned=raw.pinned;
 function commit(){a.save();a.changed()}
 function give(id,n=1){a.reward(id,n)}
 function advance(d,q){q.stage++;q.count=0;if(d.id==='star'&&q.stage===1)give('recovered_star');a.notify(q.stage>=d.steps.length?d.name+' is ready to claim.':'Story updated: '+d.steps[q.stage][0])}
 function event(type,amount=1,unique=null){
  let changed=false;
  for(const d of STORIES87){const q=v.stories[d.id];if(!q?.accepted||q.claimed||q.stage>=d.steps.length)continue;const step=d.steps[q.stage];if(step[1]!==type)continue;
   const key=unique===null?null:step[1]+':'+unique;if(key&&q.unique[key])continue;if(key)q.unique[key]=true;
   q.count=Math.min(step[2],q.count+amount);if(q.count>=step[2])advance(d,q);changed=true;
  }
  if(changed)commit();
 }
 function accept(id){const d=STORIES87.find(d=>d.id===id);if(!d||v.stories[id]?.accepted)return;if(d.requires&&!v.stories[d.requires]?.claimed){a.notify('Complete The Sleeping Star first.');return}v.stories[id]={accepted:true,stage:0,count:0,claimed:false,unique:{}};v.pinned=id;a.notify('Story accepted: '+d.name);commit()}
 function claim(id){const d=STORIES87.find(d=>d.id===id),q=v.stories[id];if(!d||!q?.accepted||q.claimed||q.stage<d.steps.length)return;q.claimed=true;give(d.reward);give('coins',d.coins);a.notify('Story complete: '+d.name+' · '+d.coins+' coins and '+a.items[d.reward].n);commit()}
 function craft(id){const r=RECIPES87.find(r=>r.id===id);if(!r)return;if(!a.near(r.place)){a.notify('Visit the '+(r.place==='inn'?'Moonberry Inn':'Tinkerleaf Workshop')+' to make this.');return}for(const [id,n]of Object.entries(r.ingredients))if(a.count(id)<n){a.notify('You need '+n+' × '+a.items[id].n+'.');return}
  for(const [id,n]of Object.entries(r.ingredients))a.take(id,n);
  give(r.output);a.sparks(r.skill,r.sparks);event('craft:'+r.id);a.notify('Made with care: '+a.items[r.output].n);commit();
 }
 function deliver(id){const d=STORIES87.find(d=>d.id===id),q=v.stories[id];if(!d?.delivery||!q?.accepted||q.stage>=d.steps.length||d.steps[q.stage][1]!=='deliver')return;if(!a.near(d.delivery.place)){a.notify('Move closer to '+a.placeName(d.delivery.place)+'.');return}if(!a.count(d.delivery.item)){a.notify('Bring '+a.items[d.delivery.item].n+' from your Pack or bank.');return}a.take(d.delivery.item,1);q.count=1;advance(d,q);commit()}
 function discover(i){if(!Number.isInteger(i)||i<0||i>2)return;if(!a.nearLandmark(i)){a.notify('Move closer to the trail landmark.');return}v.discovered[i]=true;event('discover',1,String(i));const star=v.stories.star;if(star?.accepted&&star.stage===1&&!a.count('recovered_star')&&!a.bankCount?.('recovered_star'))give('recovered_star');a.notify('Landmark discovered: Trail Light '+(i+1));commit()}
 function place(i){const q=v.stories.lanterns;if(!q?.accepted||q.stage!==1||!v.discovered[i]){a.notify('Discover this landmark and craft your three lanterns first.');return}if(!a.nearLandmark(i)){a.notify('Move closer to the trail light.');return}if(q.unique['place:'+i]){a.notify('This trail light is already lit.');return}if(!a.count('trail_lantern')){a.notify('Bring a Trail Lantern.');return}a.take('trail_lantern',1);event('place',1,String(i))}
 function meal(person){const q=v.stories.meals;if(!q?.accepted||q.stage!==0)return;const key=person.name+':'+person.x+','+person.z;if(q.unique['meal:'+key]){a.notify('You have already shared a meal with this villager.');return}if(!a.nearPerson(person)){a.notify('Move closer to '+person.name+'.');return}const food=s.inv.find(i=>i&&a.items[i.id]?.heal&&!a.items[i.id].story87);if(!food){a.notify('Bring a meal from your Pack.');return}a.take(food.id,1);event('meal',1,key);a.notify('You share a meal with '+person.name+'.');commit()}
 function bonuses(){const pieces=Object.entries(s.eq).filter(([slot,id])=>a.items[id]?.explorer87&&a.items[id].slot===slot).length,done=id=>!!v.stories[id]?.claimed;return{pieces,health:(done('moonberry')?.12:0)+(pieces>=2?.15:0),speed:done('cloudsheep')?.08:0,groundSpeed:pieces>=3?.12:0,critical:done('star')?.1:0,dodge:done('meals')?.05:0,rest:pieces>=5}}
 return{state:v,event,accept,claim,craft,deliver,discover,place,meal,bonuses,pin(id){v.pinned=v.pinned===id?null:id;commit()},view(){return STORIES87.map(d=>({...d,progress:v.stories[d.id]||null}))}};
}
