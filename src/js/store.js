// Local persistence. Preferences live in localStorage; larger collections live in IndexedDB.
// Nothing here talks to a network.

import { randomId } from './dom.js';

const PREFS_KEY = 'blendwise:prefs';
const DB_NAME = 'blendwise';
const DB_VERSION = 1;
export const STORES = ['events', 'feedback', 'runs', 'kit', 'imported'];

const defaultPrefs = () => ({
  consent: { terms: false, telemetry: false, at: null, version: 1 },
  skill: 'beginner',
  skinType: 'normal',
  skinTone: 'medium',
  installId: randomId(10),
  inviteCode: randomId(6),
  favorites: [],
  admin: null, // { salt, hash, iterations }
  lastLook: null,
  onboarded: false,
});

let prefsCache = null;

export function getPrefs() {
  if (prefsCache) return prefsCache;
  try {
    const stored = JSON.parse(localStorage.getItem(PREFS_KEY) || 'null');
    prefsCache = stored ? { ...defaultPrefs(), ...stored } : defaultPrefs();
  } catch {
    prefsCache = defaultPrefs();
  }
  return prefsCache;
}

export function setPrefs(patch) {
  const next = { ...getPrefs(), ...patch };
  prefsCache = next;
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(next)); } catch {}
  return next;
}

export function resetPrefs() {
  prefsCache = null;
  try { localStorage.removeItem(PREFS_KEY); } catch {}
}

let dbPromise = null;
function openDb() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('events')) {
        const s = db.createObjectStore('events', { keyPath: 'id', autoIncrement: true });
        s.createIndex('day', 'd');
      }
      if (!db.objectStoreNames.contains('feedback')) db.createObjectStore('feedback', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('runs')) {
        const s = db.createObjectStore('runs', { keyPath: 'id', autoIncrement: true });
        s.createIndex('look', 'lookId');
      }
      if (!db.objectStoreNames.contains('kit')) db.createObjectStore('kit', { keyPath: 'id', autoIncrement: true });
      if (!db.objectStoreNames.contains('imported')) db.createObjectStore('imported', { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(store, mode, fn) {
  return openDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const t = db.transaction(store, mode);
        const s = t.objectStore(store);
        const result = fn(s);
        t.oncomplete = () => resolve(result && 'result' in result ? result.result : result);
        t.onerror = () => reject(t.error);
        t.onabort = () => reject(t.error);
      }),
  ).catch((err) => {
    console.warn('store:', err.message);
    return mode === 'readonly' ? [] : undefined;
  });
}

export function dbAdd(store, value) {
  return tx(store, 'readwrite', (s) => s.add(value));
}

export function dbPut(store, value) {
  return tx(store, 'readwrite', (s) => s.put(value));
}

export function dbDelete(store, key) {
  return tx(store, 'readwrite', (s) => s.delete(key));
}

export function dbClear(store) {
  return tx(store, 'readwrite', (s) => s.clear());
}

export function dbAll(store) {
  return tx(store, 'readonly', (s) => s.getAll());
}

export async function exportAll() {
  const out = { exportedAt: new Date().toISOString(), prefs: { ...getPrefs(), admin: undefined } };
  for (const store of STORES) out[store] = await dbAll(store);
  return out;
}

export async function wipeAll() {
  for (const store of STORES) await dbClear(store);
  resetPrefs();
}
