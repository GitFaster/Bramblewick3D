// In-memory gameplay/save soak. No localStorage, accounts, network, or player files.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as R from '../WebGame/3d/game/rules.js';
import {initAutoEq} from '../WebGame/3d/autoeq.js';
const data=Object.fromEntries(['items','npcs','drops','shops','nodes'].map(n=>[n,JSON.parse(fs.readFileSync(new URL(`../WebGame/3d/game/${n}.json`,import.meta.url)))]));
const defs=R.defsFromJson(data);
const opts={seed:14531,walk:(x,y)=>x>=0&&y>=0&&x<64&&y<64,objs:[{type:'tree',x:29,y:33},{type:'copper',x:29,y:34}],npcs:[{kind:'mudhen',x:29,y:32}]};
let G=R.createState(defs,opts),auto;
const storage=new Map();globalThis.localStorage={getItem:k=>storage.get(k)||null};
function bind(){globalThis.window={B3:{G,GM:{R,uiMode:()=>null,uiItemAction:i=>R.equip(G,i)}}};auto=initAutoEq()}
R.fromSave(G,null);bind();
const started=Date.now(),duration=Number(process.argv[2]||2040)*1000;
let steps=0,reloads=0,gathers=0,kills=0,equips=0;
function possessions(){const out={};const add=(id,n)=>out[id]=(out[id]||0)+n;G.player.inv.forEach(i=>{if(i)add(i.id,i.n)});Object.entries(G.player.bank).forEach(([id,n])=>add(id,n));Object.values(G.player.equip).forEach(id=>{if(id)add(id,1)});return out}
function roundtrip(){const xp={...G.player.xp},before=possessions(),save=JSON.parse(JSON.stringify(R.toSave(G)));auto.stop();G=R.createState(defs,{...opts,seed:14531+reloads});assert.equal(R.fromSave(G,save),true);assert.deepEqual(G.player.xp,xp);assert.deepEqual(possessions(),before);bind();reloads++}
const timer=setInterval(()=>{
 try{
  const P=G.player;
  // Alternate real gathering and combat, with banking and reloads between sessions.
  if(steps%100===0){R.setAct(G,null);for(let i=0;i<28;i++)if(P.inv[i]&&!defs.items[P.inv[i].id].pick&&!defs.items[P.inv[i].id].axe)R.deposit(G,i,P.inv[i].n);for(const id of ['bronze_axe','bronze_pickaxe'])if(!R.invCount(G,id))R.addItem(G,id);P.x=28;P.y=33;R.gather(G,0)}
  if(steps%100===40){R.setAct(G,null);P.x=28;P.y=33;R.gather(G,1)}
  if(steps%100===70){R.setAct(G,null);P.x=28;P.y=33;R.attack(G,0)}
  if(steps%100===10){R.addItem(G,steps%200?'iron_sword':'steel_sword');auto.check()}
  R.tick(G);auto.check();steps++;
  for(const e of G.events){if(e.t==='gather')gathers++;if(e.t==='kill')kills++;if(e.t==='equip')equips++}
  G.events.length=0;G.log.length=0;
  if(steps%50===0)roundtrip();
  if(steps%75===0)console.log(JSON.stringify({elapsedSeconds:Math.round((Date.now()-started)/1000),ticks:steps,reloads,gathers,kills,equips,totalXp:Math.floor(Object.values(G.player.xp).reduce((a,b)=>a+b,0)),heapMB:Math.round(process.memoryUsage().heapUsed/1048576),position:[G.player.x,G.player.y],skill:G.player.skill,freeSlots:R.freeSlots(G),tree:G.objs[0].dep,tools:G.player.inv.filter(i=>i&&(defs.items[i.id].pick||defs.items[i.id].axe)).map(i=>i.id)}));
  if(Date.now()-started>=duration){clearInterval(timer);auto.stop();roundtrip();auto.stop();assert.ok(gathers>0);assert.ok(reloads>0);console.log('SOAK PASSED '+JSON.stringify({steps,reloads,gathers,kills,equips,seconds:Math.round((Date.now()-started)/1000)}))}
 }catch(e){console.error(e);clearInterval(timer);auto.stop();process.exitCode=1}
},process.env.BW_SOAK_FAST?1:R.TICK_MS);
