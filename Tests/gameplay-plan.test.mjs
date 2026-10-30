import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as browserRules from '../WebGame/3d/game/rules.js';
import * as legacyRules from '../WebGame/3d/game/rules.mjs';

const data=Object.fromEntries(['items','npcs','drops','shops','nodes'].map(n=>[n,JSON.parse(fs.readFileSync(new URL(`../WebGame/3d/game/${n}.json`,import.meta.url)))]));

for(const [engine,R] of [['browser',browserRules],['legacy',legacyRules]]){
  const DEF=R.defsFromJson(data);
  const state=(opts={})=>R.createState(DEF,{seed:3,walk:()=>true,...opts});

  test(`${engine} / T07 Mudhen combat awards one kill, drops and XP`,()=>{
    const G=state({npcs:[{kind:'mudhen',x:29,y:33,box:[20,20,40,40]}]});
    G.opts.boost=true;
    const before=G.player.xp.attack;
    R.attack(G,0);
    for(let i=0;i<40&&!G.npcs[0].dead;i++)R.tick(G);
    assert.equal(G.npcs[0].dead,true);
    assert.equal(G.events.filter(e=>e.t==='kill').length,1);
    assert.equal(G.events.filter(e=>e.t==='drop').length,2);
    assert.ok(G.player.xp.attack>before);
    assert.equal(G.player.combat,null);
    for(let i=0;i<5;i++)R.tick(G);
    assert.equal(G.events.filter(e=>e.t==='kill').length,1);
  });

  test(`${engine} / QST-01 bulk sale reports every sold item to task tracking`,()=>{
    const G=state();
    R.addItem(G,'logs',3);
    const paid=R.stallSellSupplies(G);
    const sale=G.events.find(e=>e.t==='sell');
    assert.ok(paid>0);
    assert.deepEqual(sale,{t:'sell',n:3,price:paid,bulk:'supplies'});
  });

  test(`${engine} / T09 bank and sale inventory survive save and reload`,()=>{
    const G=state();
    R.addItem(G,'logs',3);
    assert.equal(R.deposit(G,0,2),2);
    assert.ok(R.stallSellOne(G,G.player.inv.findIndex(Boolean))>0);
    const saved=JSON.parse(JSON.stringify(R.toSave(G)));
    const reloaded=state();
    assert.equal(R.fromSave(reloaded,saved),true);
    assert.deepEqual(reloaded.player.inv,saved.inv);
    assert.deepEqual(reloaded.player.bank,saved.bank);
    assert.equal(reloaded.player.bank.logs,2);
    assert.equal(R.invCount(reloaded,'coins'),R.invCount(G,'coins'));
  });
}
