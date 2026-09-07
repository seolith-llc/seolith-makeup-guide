import { test } from 'node:test';
import assert from 'node:assert/strict';
import { esc, h, raw } from '../src/js/dom.js';
import { faceSvg, LAYER_ORDER } from '../src/js/face.js';
import { PRODUCTS, CATEGORIES } from '../src/data/products.js';
import { TIPS, TIP_GROUPS } from '../src/data/tips.js';

test('esc neutralises HTML', () => {
  assert.equal(esc('<img src=x onerror="alert(1)">'), '&lt;img src=x onerror=&quot;alert(1)&quot;&gt;');
});

test('h escapes interpolations unless raw', () => {
  const name = '<b>x</b>';
  assert.equal(h`<p>${name}</p>`, '<p>&lt;b&gt;x&lt;/b&gt;</p>');
  assert.equal(h`<p>${raw('<b>x</b>')}</p>`, '<p><b>x</b></p>');
  assert.equal(h`<ul>${['<a>', raw('<b>')]}</ul>`, '<ul>&lt;a&gt;<b></ul>');
});

test('face svg contains every layer and no inline style attributes', () => {
  const svg = faceSvg('deep');
  for (const l of LAYER_ORDER) assert.ok(svg.includes(`layer-${l}`), `missing layer ${l}`);
  assert.ok(!/\sstyle="/.test(svg));
});

test('products reference known categories and have sane ratings', () => {
  const cats = new Set(CATEGORIES.map((c) => c.id));
  const ids = new Set();
  for (const p of PRODUCTS) {
    assert.ok(cats.has(p.category), `${p.id} category ${p.category}`);
    assert.ok(p.rating >= 1 && p.rating <= 5, `${p.id} rating`);
    assert.ok(!ids.has(p.id), `duplicate id ${p.id}`);
    ids.add(p.id);
    assert.ok(p.search.length > 3);
  }
});

test('tips belong to known groups', () => {
  const groups = new Set(TIP_GROUPS.map((g) => g.id));
  for (const t of TIPS) assert.ok(groups.has(t.group), t.id);
});
