import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const css = readFileSync(new URL('../WebGame/3d/om/overhaul87.css', import.meta.url), 'utf8');
const hud = readFileSync(new URL('../WebGame/3d/om/hud87.js', import.meta.url), 'utf8');
const players = readFileSync(new URL('../WebGame/3d/om/players82.js', import.meta.url), 'utf8');

test('phase 1 hud is compact, collapsible, and chat stays quiet', () => {
  assert.match(hud, /id="nav-fold87"/);
  assert.match(hud, /nav-collapsed/);
  assert.match(hud, /data-action="attack"/);
  assert.match(hud, /data-action="interact"/);
  assert.match(hud, /data-action="specials"/);
  assert.match(css, /\.v87\.nav-collapsed #nav87 \[data-panel87\]\{display:none/);
  assert.match(css, /\.v87 #chat\{display:none/);
  assert.match(css, /\.v87\.conversation87 #chat\{display:block/);
  assert.match(css, /show-numbers87 \.hero-meter span\{display:block/);
  assert.doesNotMatch(css, /#online82\{display:none/);
  assert.match(players, /classList\.add\('expanded'\)/);
});
