import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

/** Same badge rules as Sources/GameSource.swift UpdateCheck.gameVersion / choose. */
export function gameVersion(html) {
  const badge = html.match(/id="mbadge"[^>]*>\s*v(\d+)/i);
  if (badge) return Number(badge[1]);
  const title = html.match(/<title>[^<]*\bv(\d+)\b/i);
  return title ? Number(title[1]) : null;
}

export function choose({explicit = null, bundled = null, liveReached = false, live = null}) {
  if (explicit === 'Bundled' && bundled == null) return {source: 'Live', note: 'no-bundle'};
  if (explicit === 'Live' || explicit === 'Bundled') return {source: explicit, note: 'explicit'};
  if (bundled == null) return {source: 'Live', note: 'no-bundle'};
  if (!liveReached) return {source: 'Bundled', note: 'live-down'};
  if (live == null) return {source: 'Live', note: 'unparsed'};
  if (bundled > live) return {source: 'Bundled', note: 'bundled-newer'};
  return {source: 'Live', note: 'live-current'};
}

const index = readFileSync(new URL('../WebGame/3d/index.html', import.meta.url), 'utf8');

test('local index badge is v87', () => {
  assert.equal(gameVersion(index), 87);
  assert.match(index, /Briarhaven v87/);
});

test('a live v86 page loses to the bundled v87 copy', () => {
  const live = '<title>Bramblewick · Briarhaven Mobile v86</title><div id="mbadge">v86 · Mobile · Real Players</div>';
  assert.equal(gameVersion(live), 86);
  assert.deepEqual(choose({bundled: 87, liveReached: true, live: 86}), {source: 'Bundled', note: 'bundled-newer'});
});

test('equal versions stay on the live server', () => {
  assert.deepEqual(choose({bundled: 87, liveReached: true, live: 87}), {source: 'Live', note: 'live-current'});
});

test('a newer live page wins over an older bundle', () => {
  assert.deepEqual(choose({bundled: 86, liveReached: true, live: 87}), {source: 'Live', note: 'live-current'});
});

test('a dead live page opens the bundled copy', () => {
  assert.deepEqual(choose({bundled: 87, liveReached: false, live: null}), {source: 'Bundled', note: 'live-down'});
});

test('an explicit Live choice is not overridden by a newer bundle', () => {
  assert.deepEqual(choose({explicit: 'Live', bundled: 87, liveReached: true, live: 86}), {source: 'Live', note: 'explicit'});
});

test('an explicit Bundled choice is kept even when live is newer', () => {
  assert.deepEqual(choose({explicit: 'Bundled', bundled: 86, liveReached: true, live: 90}), {source: 'Bundled', note: 'explicit'});
});

test('requesting a bundle that is not in the build stays on live', () => {
  assert.deepEqual(choose({explicit: 'Bundled', bundled: null}), {source: 'Live', note: 'no-bundle'});
});
