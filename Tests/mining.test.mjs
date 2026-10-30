import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as browserRules from '../WebGame/3d/game/rules.js';
import * as legacyRules from '../WebGame/3d/game/rules.mjs';
const data=Object.fromEntries(['items','npcs','drops','shops','nodes'].map(n=>[n,JSON.parse(fs.readFileSync(new URL(`../WebGame/3d/game/${n}.json`,import.meta.url)))]));
for(const [engine,R] of [['browser',browserRules],['legacy',legacyRules]]) {
const DEF=R.defsFromJson(data);
function setup(type='tin') {const G=R.createState(DEF,{seed:7,walk:(x,y)=>x>=0&&y>=0&&x<64&&y<64,objs:[{type,x:29,y:33}],npcs:[]});G.player.inv=Array(28).fill(null);R.addItem(G,'bronze_pickaxe');return G}
const ticks=(G,n)=>{for(let i=0;i<n;i++)R.tick(G)};
test(engine+' / '+'T01 eligible tin awards one item and exactly its defined XP per reward',()=>{const G=setup();R.gather(G,0);ticks(G,3);assert.equal(R.invCount(G,'tin_ore'),1);assert.equal(G.player.xp.mining,DEF.nodes.tin.xp*R.RATE(G).s);assert.equal(G.events.filter(e=>e.t==='gather').length,1)});
test(engine+' / '+'T02 locked iron gives a requirement message without ore or XP',()=>{const G=setup('iron');R.gather(G,0);ticks(G,10);assert.equal(R.invCount(G,'iron_ore'),0);assert.equal(G.player.xp.mining,0);assert.ok(G.log.some(m=>m.includes('15')))});
test(engine+' / '+'T03 depleted ore gives no reward and becomes mineable on respawn',()=>{const G=setup();G.objs[0].dep=5;R.gather(G,0);ticks(G,5);assert.equal(R.invCount(G,'tin_ore'),0);assert.equal(G.objs[0].dep,0);R.gather(G,0);ticks(G,3);assert.equal(R.invCount(G,'tin_ore'),1)});
test(engine+' / '+'T04 rapid repeated taps never overlap mining rewards',()=>{const G=setup();for(let i=0;i<50;i++)R.gather(G,0);ticks(G,3);assert.equal(R.invCount(G,'tin_ore'),1);assert.equal(G.events.filter(e=>e.t==='gather').length,1)});
test(engine+' / '+'T05 full inventory gives clear feedback without XP or lost items',()=>{const G=setup();R.addItem(G,'bread',27);const before=JSON.stringify(G.player.inv);R.gather(G,0);ticks(G,5);assert.equal(JSON.stringify(G.player.inv),before);assert.equal(G.player.xp.mining,0);assert.ok(G.log.some(m=>m.includes('full')))});
test(engine+' / '+'T06 moving away cancels mining before the next reward',()=>{const G=setup();R.gather(G,0);ticks(G,1);R.walkTo(G,25,33);ticks(G,5);assert.equal(R.invCount(G,'tin_ore'),0);assert.equal(G.player.skill,null)});
test(engine+' / '+'MIN-02 removing the pickaxe during a swing prevents any late reward',()=>{const G=setup();R.gather(G,0);ticks(G,1);R.removeItem(G,'bronze_pickaxe',1);ticks(G,4);assert.equal(R.invCount(G,'tin_ore'),0);assert.equal(G.player.xp.mining,0);assert.equal(G.player.skill,null);assert.ok(G.log.some(m=>m.includes('tool')))});

}
