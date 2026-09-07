#!/usr/bin/env node
// Sets the app version in one go: node scripts/bump-version.mjs 1.1.0
// Updates package.json, src/js/config.js and the service worker cache name so
// installed clients pick up the new files.

import fs from 'node:fs';

const v = process.argv[2];
if (!/^\d+\.\d+\.\d+$/.test(v || '')) { console.error('usage: node scripts/bump-version.mjs <major.minor.patch>'); process.exit(1); }

const edit = (file, re, rep) => { const s = fs.readFileSync(file, 'utf8'); if (!re.test(s)) throw new Error(`pattern not found in ${file}`); fs.writeFileSync(file, s.replace(re, rep)); };
edit('package.json', /"version":\s*"[^"]+"/, `"version": "${v}"`);
edit('src/js/config.js', /version:\s*'[^']+'/, `version: '${v}'`);
edit('src/sw.js', /const CACHE_VERSION = '[^']+'/, `const CACHE_VERSION = 'blendwise-v${v}'`);
console.log('version set to', v);
