// App shell: routing, consent gate, onboarding, navigation, online state.

import { CONFIG } from './config.js';
import { h, raw, qs, toast } from './dom.js';
import { route, match, currentPath, currentQuery } from './router.js';
import { getPrefs, setPrefs } from './store.js';
import { track, orientation } from './telemetry.js';
import { initPwa } from './pwa.js';
import { LEGAL_META } from '../data/legal.js';
import { legalHtml } from './views/legal.js';
import { TONES } from './face.js';
import { flushQueue } from './views/feedback.js';
import { ICONS } from './icons.js';

import * as home from './views/home.js';
import * as looks from './views/looks.js';
import * as look from './views/look.js';
import * as play from './views/play.js';
import * as beforeafter from './views/beforeafter.js';
import * as estimateView from './views/estimate.js';
import * as products from './views/products.js';
import * as kit from './views/kit.js';
import * as insights from './views/insights.js';
import * as tips from './views/tips.js';
import * as feedback from './views/feedback.js';
import * as share from './views/share.js';
import * as settings from './views/settings.js';
import * as admin from './views/admin.js';
import * as legal from './views/legal.js';
import * as more from './views/more.js';

route('/', home);
route('/looks', looks);
route('/look/:id', look);
route('/look/:id/play', play);
route('/before-after', beforeafter);
route('/estimate', estimateView);
route('/products', products);
route('/kit', kit);
route('/insights', insights);
route('/tips', tips);
route('/feedback', feedback);
route('/share', share);
route('/settings', settings);
route('/admin', admin);
route('/terms', legal);
route('/privacy', legal);
route('/more', more);

const NAV = [
  { href: '#/', icon: 'home', label: 'Home', match: (p) => p === '/' },
  { href: '#/looks', icon: 'looks', label: 'Looks', match: (p) => p.startsWith('/look') },
  { href: '#/products', icon: 'bag', label: 'Products', match: (p) => p.startsWith('/products') },
  { href: '#/insights', icon: 'chart', label: 'Insights', match: (p) => p.startsWith('/insights') },
  { href: '#/more', icon: 'more', label: 'More', match: (p) => ['/more', '/before-after', '/estimate', '/kit', '/tips', '/share', '/feedback', '/settings', '/admin', '/terms', '/privacy'].some((x) => p.startsWith(x)) },
];

let unmountCurrent = null;
let openTracked = false;

function trackOpenOnce() {
  if (openTracked) return;
  openTracked = true;
  track('app_open', { skill: getPrefs().skill, kind: orientation() });
  let ref = null;
  try { ref = sessionStorage.getItem('blendwise:ref'); } catch {}
  if (ref) { track('referred_open', { source: 'invite' }); try { sessionStorage.removeItem('blendwise:ref'); } catch {} }
}

function renderNav(path) {
  const nav = qs('#nav');
  nav.innerHTML = NAV.map((n) => h`<a class="nav-item ${n.match(path) ? 'is-active' : ''}" href="${n.href}" ${n.match(path) ? raw('aria-current="page"') : ''}><span class="nav-icon" aria-hidden="true">${raw(ICONS[n.icon])}</span><span>${n.label}</span></a>`).join('');
}

async function render() {
  const path = currentPath();
  const query = currentQuery();
  const m = match(path);
  const view = qs('#view');
  if (typeof unmountCurrent === 'function') { try { unmountCurrent(); } catch {} }
  unmountCurrent = null;
  if (!m) {
    view.innerHTML = h`<section class="section"><h1>Page not found</h1><a class="link" href="#/">Home</a></section>`;
    document.title = `Not found · ${CONFIG.appName}`;
    renderNav(path);
    return;
  }
  trackOpenOnce();
  try {
    const result = await m.view.view({ params: m.params, query, path });
    view.innerHTML = result.html;
    document.title = `${result.title} · ${CONFIG.appName}`;
    renderNav(path);
    qs('#fb-link').href = `#/feedback?from=${encodeURIComponent(path)}`;
    if (result.mount) unmountCurrent = result.mount(view) || null;
    window.scrollTo(0, 0);
    track('page_view', { page: path.split('/').slice(0, 2).join('/') || '/' });
  } catch (err) {
    console.error(err);
    view.innerHTML = h`<section class="section"><h1>Something went wrong</h1><p class="muted">${err.message}</p><a class="link" href="#/">Home</a></section>`;
  }
}

function consentNeeded() {
  const c = getPrefs().consent;
  return !c.terms || (c.version || 0) < LEGAL_META.version;
}

function showConsent() {
  const overlay = qs('#overlay');
  overlay.hidden = false;
  document.body.classList.add('has-overlay');
  const tabs = [['summary', 'Summary'], ['terms', 'Terms'], ['privacy', 'Privacy']];
  overlay.innerHTML = h`
    <div class="overlay-card" role="dialog" aria-modal="true" aria-labelledby="consent-title">
      <h1 id="consent-title">Welcome to ${CONFIG.appName}</h1>
      <div class="segmented" role="tablist">${tabs.map(([id, label], i) => raw(h`<button class="seg ${i === 0 ? 'is-active' : ''}" role="tab" data-tab="${id}" aria-selected="${i === 0}">${label}</button>`))}</div>
      <div class="overlay-body" data-panel="summary">
        <ul class="tips">
          <li><strong>Everything stays on your device.</strong> No account, no server, no cookies, no ads.</li>
          <li><strong>Educational, not medical.</strong> Patch-test new products and see a professional for skin conditions.</li>
          <li><strong>Product links are affiliate links.</strong> As an Amazon Associate I earn from qualifying purchases. Ratings are editorial, not live.</li>
          <li><strong>You must be ${CONFIG.minimumAge} or older</strong> (16 where required for analytics consent).</li>
        </ul>
        <label class="check"><input type="checkbox" id="consent-terms" /> <span>I have read and agree to the Terms of use and Privacy Policy.</span></label>
        <label class="check"><input type="checkbox" id="consent-telemetry" /> <span>Keep anonymous usage statistics on this device to help improve the app (optional, never sent automatically).</span></label>
        <button class="btn btn-primary btn-large" id="consent-continue" disabled>Continue</button>
      </div>
      <div class="overlay-body legal" data-panel="terms" hidden>${raw(legalHtml('terms'))}</div>
      <div class="overlay-body legal" data-panel="privacy" hidden>${raw(legalHtml('privacy'))}</div>
    </div>`;
  const cb = qs('#consent-terms');
  cb.addEventListener('change', () => { qs('#consent-continue').disabled = !cb.checked; });
  overlay.addEventListener('click', (e) => {
    const tab = e.target.closest('[data-tab]');
    if (tab) {
      overlay.querySelectorAll('[data-tab]').forEach((t) => { t.classList.toggle('is-active', t === tab); t.setAttribute('aria-selected', String(t === tab)); });
      overlay.querySelectorAll('[data-panel]').forEach((p) => { p.hidden = p.dataset.panel !== tab.dataset.tab; });
    }
    if (e.target.closest('#consent-continue') && cb.checked) {
      setPrefs({ consent: { terms: true, telemetry: qs('#consent-telemetry').checked, at: new Date().toISOString(), version: LEGAL_META.version } });
      showOnboarding();
    }
  });
}

function showOnboarding() {
  const overlay = qs('#overlay');
  if (getPrefs().onboarded) return hideOverlay();
  overlay.innerHTML = h`
    <div class="overlay-card" role="dialog" aria-modal="true" aria-labelledby="ob-title">
      <h1 id="ob-title">About you</h1>
      <p class="muted">Used only to pick times, tips and the illustration. Change any time in Settings.</p>
      <label class="field"><span>How experienced are you with makeup?</span>
        <select id="ob-skill"><option value="beginner">Beginner: I own a few products</option><option value="intermediate">Intermediate: I do a full face sometimes</option><option value="advanced">Advanced: I can do a wing without thinking</option></select></label>
      <label class="field"><span>Skin type</span>
        <select id="ob-skin"><option value="normal">Normal</option><option value="dry">Dry</option><option value="oily">Oily</option><option value="combination">Combination</option><option value="sensitive">Sensitive</option></select></label>
      <label class="field"><span>Skin tone for the illustration</span>
        <select id="ob-tone">${Object.entries(TONES).map(([id, t]) => raw(h`<option value="${id}" ${id === 'medium' ? 'selected' : ''}>${t.name}</option>`))}</select></label>
      <button class="btn btn-primary btn-large" id="ob-done">Start</button>
    </div>`;
  qs('#ob-done').addEventListener('click', () => {
    setPrefs({ skill: qs('#ob-skill').value, skinType: qs('#ob-skin').value, skinTone: qs('#ob-tone').value, onboarded: true });
    hideOverlay();
    track('onboarded', { skill: getPrefs().skill });
  });
}

function hideOverlay() {
  const overlay = qs('#overlay');
  overlay.hidden = true;
  overlay.innerHTML = '';
  document.body.classList.remove('has-overlay');
  render();
}

function handleReferral() {
  const params = new URLSearchParams(location.search);
  const ref = params.get('ref');
  if (!ref) return;
  try { sessionStorage.setItem('blendwise:ref', ref.slice(0, 12)); } catch {}
  history.replaceState(null, '', location.pathname + location.hash);
}

function updateOnline() {
  const el = qs('#online');
  el.textContent = navigator.onLine ? 'Online' : 'Offline';
  el.classList.toggle('is-offline', !navigator.onLine);
  if (navigator.onLine) flushQueue();
}

function boot() {
  qs('#brand').textContent = CONFIG.appName;
  handleReferral();
  initPwa();
  updateOnline();
  window.addEventListener('online', updateOnline);
  window.addEventListener('offline', () => { updateOnline(); toast('You are offline. Everything still works.'); });
  window.addEventListener('hashchange', render);
  window.matchMedia('(orientation: landscape)').addEventListener('change', () => track('orientation_change', { kind: orientation() }));

  if (consentNeeded()) showConsent();
  else if (!getPrefs().onboarded) { qs('#overlay').hidden = false; document.body.classList.add('has-overlay'); showOnboarding(); }
  else render();
}

boot();
