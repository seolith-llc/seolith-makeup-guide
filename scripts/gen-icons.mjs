#!/usr/bin/env node
// Generates the PWA icons (PNG + SVG) without any dependency: a rose-coloured rounded
// square with a white "B" made of simple shapes. Run: node scripts/gen-icons.mjs

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const outDir = path.resolve('src/icons');
fs.mkdirSync(outDir, { recursive: true });

const BG = [122, 59, 78]; // #7a3b4e
const BG2 = [156, 84, 110];
const FG = [255, 255, 255];

function crc32(buf) {
  let c, crc = 0xffffffff;
  for (let n = 0; n < buf.length; n++) {
    c = (crc ^ buf[n]) & 0xff;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    crc = (crc >>> 8) ^ c;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
}

function png(width, height, pixel) {
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0;
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixel(x, y);
      const i = y * (width * 4 + 1) + 1 + x * 4;
      raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = a;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

// Shape helpers in a 0..1 coordinate space
function inRoundedRect(u, v, r) {
  const x = Math.max(r - u, u - (1 - r), 0);
  const y = Math.max(r - v, v - (1 - r), 0);
  return x * x + y * y <= r * r;
}
function inCircle(u, v, cx, cy, r) { return (u - cx) ** 2 + (v - cy) ** 2 <= r * r; }

// Letter "B": a vertical stem plus two bowls (circles with holes)
function inB(u, v) {
  const stem = u >= 0.30 && u <= 0.42 && v >= 0.24 && v <= 0.76;
  const topBowl = inCircle(u, v, 0.48, 0.37, 0.15) && !inCircle(u, v, 0.48, 0.37, 0.07) && u >= 0.36;
  const botBowl = inCircle(u, v, 0.50, 0.63, 0.17) && !inCircle(u, v, 0.50, 0.63, 0.08) && u >= 0.36;
  return stem || topBowl || botBowl;
}

function render(size, { maskable = false } = {}) {
  return png(size, size, (x, y) => {
    const u = (x + 0.5) / size, v = (y + 0.5) / size;
    if (!maskable && !inRoundedRect(u, v, 0.22)) return [0, 0, 0, 0];
    const t = (u + v) / 2;
    const bg = BG.map((c, i) => Math.round(c * (1 - t) + BG2[i] * t));
    // scale letter into the safe zone for maskable icons
    const s = maskable ? 0.8 : 1;
    const uu = (u - 0.5) / s + 0.5, vv = (v - 0.5) / s + 0.5;
    const highlight = inCircle(u, v, 0.30, 0.28, 0.16) ? 0.10 : 0;
    const base = bg.map((c) => Math.min(255, Math.round(c + 255 * highlight)));
    return inB(uu, vv) ? [...FG, 255] : [...base, 255];
  });
}

fs.writeFileSync(path.join(outDir, 'icon-192.png'), render(192));
fs.writeFileSync(path.join(outDir, 'icon-512.png'), render(512));
fs.writeFileSync(path.join(outDir, 'maskable-512.png'), render(512, { maskable: true }));

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7a3b4e"/><stop offset="1" stop-color="#9c546e"/></linearGradient></defs>
  <rect width="100" height="100" rx="22" fill="url(#g)"/>
  <circle cx="30" cy="28" r="16" fill="#fff" opacity="0.1"/>
  <rect x="30" y="24" width="12" height="52" fill="#fff"/>
  <path d="M36 22 h13 a15 15 0 0 1 0 30 h-13 z M42 30 v14 h7 a7 7 0 0 0 0 -14 z" fill="#fff" fill-rule="evenodd"/>
  <path d="M36 46 h15 a17 17 0 0 1 0 34 h-15 z M42 54 v18 h9 a9 9 0 0 0 0 -18 z" fill="#fff" fill-rule="evenodd"/>
</svg>
`;
fs.writeFileSync(path.join(outDir, 'icon.svg'), svg);
console.log('icons written to', outDir);
