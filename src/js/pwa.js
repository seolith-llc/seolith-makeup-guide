// Service worker registration, install prompt and update flow.

import { toast } from './dom.js';
import { track } from './telemetry.js';

let deferredPrompt = null;
let registration = null;

export function installState() {
  const installed = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  return { installed, canPrompt: !!deferredPrompt };
}

export async function promptInstall() {
  if (!deferredPrompt) return 'unavailable';
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  return outcome;
}

export async function checkForUpdate() {
  if (!registration) return false;
  try {
    await registration.update();
    if (registration.waiting) { registration.waiting.postMessage({ type: 'SKIP_WAITING' }); return true; }
  } catch {}
  return false;
}

export function initPwa() {
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; track('pwa_installed'); });

  if (!('serviceWorker' in navigator)) return;
  navigator.serviceWorker.register('./sw.js').then((reg) => {
    registration = reg;
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      if (!sw) return;
      sw.addEventListener('statechange', () => {
        if (sw.state === 'installed' && navigator.serviceWorker.controller) {
          toast('A new version is ready.', { action: 'Reload', duration: 15000, onAction: () => sw.postMessage({ type: 'SKIP_WAITING' }) });
        }
      });
    });
  }).catch((err) => console.warn('sw:', err.message));

  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    refreshing = true;
    location.reload();
  });
}
