#!/usr/bin/env node
// Static checks: every file in src/ is precached by the service worker, the manifest is valid
// JSON, and nothing in the app relies on inline scripts or inline styles (they would be blocked
// by the Content Security Policy). Run: npm run check

import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve('src');
let failures = 0;
const fail = (msg) => { failures++; console.error('FAIL', msg); };

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
}

const files = walk(root).map((f) => './' + path.relative(root, f).split(path.sep).join('/'));
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const listed = new Set([...sw.matchAll(/'(\.\/[^']+)'/g)].map((m) => m[1]));
for (const f of files) {
  if (f === './sw.js') continue;
  if (!listed.has(f)) fail(`${f} is not in sw.js PRECACHE`);
}
for (const l of listed) {
  if (l === './') continue;
  if (!files.includes(l)) fail(`sw.js precaches ${l} which does not exist`);
}

try { JSON.parse(fs.readFileSync(path.join(root, 'manifest.webmanifest'), 'utf8')); } catch (e) { fail(`manifest.webmanifest: ${e.message}`); }

for (const f of files.filter((x) => /\.(js|html)$/.test(x))) {
  const src = fs.readFileSync(path.join(root, f), 'utf8');
  if (/\son[a-z]+="/i.test(src)) fail(`${f} contains an inline event handler attribute`);
  if (/\sstyle="/i.test(src)) fail(`${f} contains an inline style attribute (blocked by CSP)`);
  if (/\beval\(|new Function\(/.test(src)) fail(`${f} uses eval or Function`);
  if (f.endsWith('.html') && /<script(?![^>]*\ssrc=)/i.test(src)) fail(`${f} contains an inline script`);
}

const cfg = fs.readFileSync(path.join(root, 'js/config.js'), 'utf8');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const cfgVersion = (cfg.match(/version:\s*'([^']+)'/) || [])[1];
const swVersion = (sw.match(/CACHE_VERSION = 'blendwise-v([^']+)'/) || [])[1];
if (cfgVersion !== pkg.version || swVersion !== pkg.version) fail(`version mismatch: package ${pkg.version}, config ${cfgVersion}, sw ${swVersion}`);

console.log(failures ? `${failures} problem(s)` : `OK: ${files.length} files checked, all precached, CSP-safe, version ${pkg.version}`);
process.exit(failures ? 1 : 0);
