// Anonymous, on-device usage telemetry.
//
// Rules (also stated in the Privacy Policy):
//  - nothing is recorded unless the user opted in;
//  - events carry only an event name, a small whitelisted property set, a random session id,
//    the install id (random, user-resettable), an hour bucket and the orientation;
//  - no free text, no URLs beyond the app's own page ids, no device fingerprint.

import { dbAdd, dbAll, getPrefs } from './store.js';
import { randomId } from './dom.js';

const ALLOWED_PROPS = new Set(['page', 'look', 'step', 'product', 'category', 'bucket', 'skill', 'type', 'source', 'result', 'kind']);
const sessionId = randomId(8);

export function isEnabled() {
  return !!getPrefs().consent.telemetry;
}

export function orientation() {
  return window.matchMedia('(orientation: landscape)').matches ? 'landscape' : 'portrait';
}

function hourBucket(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}`;
}

export function minuteBucket(minutes) {
  if (minutes < 5) return '<5';
  if (minutes < 10) return '5-10';
  if (minutes < 20) return '10-20';
  if (minutes < 30) return '20-30';
  if (minutes < 45) return '30-45';
  if (minutes < 60) return '45-60';
  return '60+';
}

export function track(name, props = {}) {
  if (!isEnabled()) return;
  const p = {};
  for (const [k, v] of Object.entries(props)) {
    if (!ALLOWED_PROPS.has(k)) continue;
    if (typeof v === 'string') p[k] = v.slice(0, 40);
    else if (typeof v === 'number' || typeof v === 'boolean') p[k] = v;
  }
  const h = hourBucket();
  dbAdd('events', { n: name, p, s: sessionId, i: getPrefs().installId, h, d: h.slice(0, 10), o: orientation(), v: 1 });
}

export function allEvents() {
  return dbAll('events');
}

// Aggregates used by the admin dashboard. Works on this device's events plus any imported exports.
export function aggregate(events) {
  const counts = (key) => {
    const m = new Map();
    for (const e of events) {
      const k = key(e);
      if (k === undefined || k === null) continue;
      m.set(k, (m.get(k) || 0) + 1);
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  };
  const distinct = (key) => new Set(events.map(key).filter(Boolean)).size;
  const byName = (n) => events.filter((e) => e.n === n);
  const lookStarts = byName('look_start').length;
  const lookCompletes = byName('look_complete').length;
  const days = new Map();
  for (const e of events) {
    if (!days.has(e.d)) days.set(e.d, new Set());
    days.get(e.d).add(e.s);
  }
  const daily = Array.from(days.entries())
    .map(([d, s]) => ({ day: d, sessions: s.size }))
    .sort((a, b) => a.day.localeCompare(b.day));
  return {
    total: events.length,
    sessions: distinct((e) => e.s),
    installs: distinct((e) => e.i),
    activeDays: days.size,
    pages: counts((e) => (e.n === 'page_view' ? e.p.page : null)),
    looksStarted: counts((e) => (e.n === 'look_start' ? e.p.look : null)),
    looksCompleted: counts((e) => (e.n === 'look_complete' ? e.p.look : null)),
    completionRate: lookStarts ? lookCompletes / lookStarts : 0,
    durationBuckets: counts((e) => (e.n === 'look_complete' ? e.p.bucket : null)),
    products: counts((e) => (e.n === 'product_click' ? e.p.product : null)),
    shares: counts((e) => (e.n === 'share' ? e.p.kind : null)),
    feedback: counts((e) => (e.n === 'feedback_submit' ? e.p.type : null)),
    orientation: counts((e) => e.o),
    skills: counts((e) => (e.n === 'app_open' ? e.p.skill : null)),
    referred: byName('referred_open').length,
    installs_pwa: byName('pwa_installed').length,
    daily: daily.slice(-14),
    hours: counts((e) => e.h.slice(11)),
  };
}
