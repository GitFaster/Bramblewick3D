import test from 'node:test';
import assert from 'node:assert/strict';
import {makeChar,animate} from '../WebGame/3d/chars.js';

for(const kind of ['fox','wolf','boar','rat','mudhen','spider','toad','drake'])test(`${kind} has a lit animated monster model`,()=>{
  const g=makeChar(kind),e={g,amt:0,phase:0};let meshes=0,lit=0;
  g.traverse(o=>{if(o.isMesh){meshes++;if(o.material?.isMeshStandardMaterial)lit++}});
  assert.ok(meshes>=8);assert.ok(lit>0);assert.doesNotThrow(()=>{animate(e,.2,.016,1,false);animate(e,0,.016,2,false)});assert.equal(g.userData.kind,kind);
});
