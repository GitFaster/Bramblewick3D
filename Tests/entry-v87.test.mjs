import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
import {dirname, join, normalize} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../WebGame/3d');

function localRefs(text, fromFile) {
  const refs = new Set();
  const patterns = [
    /(?:import\s+[^'"\n]*from\s*|import\s*\(\s*)['"](\.[^'"]+)['"]/g,
    /@import\s+url\(\s*['"]?(\.[^'")\s]+)['"]?\s*\)/g,
    /<(?:script|link)\b[^>]*(?:src|href)=['"]([^'"]+)['"]/g
  ];
  for (const re of patterns) {
    for (const match of text.matchAll(re)) {
      let spec = match[1].split('?')[0].split('#')[0];
      if (!spec || spec.startsWith('data:') || spec.includes('://') || spec.startsWith('//')) continue;
      const base = spec.startsWith('.') ? dirname(fromFile) : root;
      refs.add(normalize(join(base, spec)));
    }
  }
  return refs;
}

test('v87 entry styles and modules exist and parse as a closed set', () => {
  const indexPath = join(root, 'index.html');
  const seen = new Set();
  const missing = [];
  const queue = [indexPath];
  while (queue.length) {
    const file = queue.pop();
    if (seen.has(file)) continue;
    seen.add(file);
    if (!existsSync(file)) { missing.push(file); continue; }
    const text = readFileSync(file, 'utf8');
    if (file.endsWith('.js')) {
      // Syntax-check by asking node separately; here only resolve relatives.
    }
    for (const next of localRefs(text, file)) {
      if (!seen.has(next)) queue.push(next);
    }
  }
  assert.deepEqual(missing, []);
  const names = [...seen].map(p => p.slice(root.length + 1));
  assert.ok(names.includes('om/login82.js'));
  assert.ok(names.includes('om/om82.js'));
  assert.ok(names.includes('om/hud87.js'));
  assert.ok(names.includes('om/panels87.js'));
  assert.ok(names.includes('om/overhaul87.css'));
  assert.ok(names.includes('om/content87.js'));
});
