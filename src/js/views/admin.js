// Admin dashboard: anonymised usage telemetry and feedback, protected by a local passphrase.

import { h, raw, toast, download } from '../dom.js';
import { getPrefs, setPrefs, dbAll, dbAdd, dbClear, dbDelete } from '../store.js';
import { hashPassphrase, verifyPassphrase } from '../crypto.js';
import { aggregate } from '../telemetry.js';
import { getLook } from '../../data/looks.js';
import { getProduct } from '../../data/products.js';
import { CONFIG } from '../config.js';

const UNLOCK_KEY = 'blendwise:admin-unlocked';
const MIN_LEN = 8;

function unlocked() { try { return sessionStorage.getItem(UNLOCK_KEY) === '1'; } catch { return false; } }
function setUnlocked(v) { try { v ? sessionStorage.setItem(UNLOCK_KEY, '1') : sessionStorage.removeItem(UNLOCK_KEY); } catch {} }

function bars(rows, { label = (k) => k, max = null } = {}) {
  if (!rows.length) return '<p class="muted small">No data yet.</p>';
  const top = max ?? Math.max(...rows.map((r) => r[1]), 1);
  return h`<ul class="bars">${rows.map(([k, v]) => raw(h`<li class="bar-row" title="${label(k)}: ${v}"><span class="bar-label">${label(k)}</span><span class="bar-track"><span class="bar-fill" data-w="${(v / top) * 100}"></span></span><span class="bar-val">${v}</span></li>`))}</ul>`;
}

function setupHtml() {
  return h`<section class="section"><h1>Admin setup</h1>
    <p class="lede">No admin passphrase is set on this device. Choose one (at least ${MIN_LEN} characters). It is hashed with PBKDF2 and stored only here.</p>
    <form id="admin-setup" class="card">
      <label class="field"><span>Passphrase</span><input type="password" id="pp1" minlength="${MIN_LEN}" autocomplete="new-password" required /></label>
      <label class="field"><span>Repeat passphrase</span><input type="password" id="pp2" minlength="${MIN_LEN}" autocomplete="new-password" required /></label>
      <button class="btn btn-primary" type="submit">Set passphrase</button>
    </form>
    <p class="muted small">This gate stops casual access on a shared device. It is not a security boundary against someone with the device and developer tools, because all data lives in the browser.</p></section>`;
}

function loginHtml() {
  return h`<section class="section"><h1>Admin</h1>
    <form id="admin-login" class="card">
      <label class="field"><span>Passphrase</span><input type="password" id="pp" autocomplete="current-password" required /></label>
      <button class="btn btn-primary" type="submit">Unlock</button>
    </form>
    <p class="muted small">Forgot it? Deleting all data in Settings removes the passphrase too (and everything else).</p></section>`;
}

async function dashboardHtml() {
  const local = await dbAll('events');
  const imported = await dbAll('imported');
  const events = local.concat(imported.flatMap((i) => i.events || []));
  const a = aggregate(events);
  const feedback = await dbAll('feedback');
  const lookName = (id) => (getLook(id) ? getLook(id).name : id);
  const prodName = (id) => (getProduct(id) ? `${getProduct(id).brand} ${getProduct(id).name}` : id);
  const completeMap = new Map(a.looksCompleted);
  const lookRows = a.looksStarted.map(([id, started]) => [id, started, completeMap.get(id) || 0]);

  return h`
    <section class="section admin">
      <div class="play-top"><h1>Admin dashboard</h1><button class="btn btn-small" id="admin-lock">Lock</button></div>
      <p class="lede">Anonymous usage statistics from this device (${local.length} events) plus ${imported.length} imported export${imported.length === 1 ? '' : 's'} (${events.length - local.length} events). No personal data is stored anywhere.</p>

      <div class="stats-row">
        <div class="stat"><span class="stat-num">${a.installs}</span><span class="stat-label">devices</span></div>
        <div class="stat"><span class="stat-num">${a.sessions}</span><span class="stat-label">sessions</span></div>
        <div class="stat"><span class="stat-num">${a.activeDays}</span><span class="stat-label">active days</span></div>
        <div class="stat"><span class="stat-num">${Math.round(a.completionRate * 100)}%</span><span class="stat-label">routine completion</span></div>
        <div class="stat"><span class="stat-num">${a.referred}</span><span class="stat-label">referred opens</span></div>
        <div class="stat"><span class="stat-num">${feedback.length}</span><span class="stat-label">feedback items</span></div>
      </div>

      <div class="two-col">
        <div class="card"><h2>Sessions per day (last 14)</h2>${raw(bars(a.daily.map((d) => [d.day.slice(5), d.sessions])))}</div>
        <div class="card"><h2>Page views</h2>${raw(bars(a.pages.slice(0, 12)))}</div>
        <div class="card"><h2>Looks: started vs completed</h2>
          ${lookRows.length ? raw(h`<table class="table"><thead><tr><th scope="col">Look</th><th scope="col">Started</th><th scope="col">Completed</th></tr></thead><tbody>${lookRows.map(([id, s, c]) => raw(h`<tr><th scope="row">${lookName(id)}</th><td>${s}</td><td>${c}</td></tr>`))}</tbody></table>`) : raw('<p class="muted small">No data yet.</p>')}
        </div>
        <div class="card"><h2>Routine duration (minutes)</h2>${raw(bars(a.durationBuckets))}</div>
        <div class="card"><h2>Product link clicks</h2>${raw(bars(a.products.slice(0, 10), { label: prodName }))}</div>
        <div class="card"><h2>Orientation</h2>${raw(bars(a.orientation))}</div>
        <div class="card"><h2>Shares</h2>${raw(bars(a.shares))}</div>
        <div class="card"><h2>Skill level at open</h2>${raw(bars(a.skills))}</div>
        <div class="card"><h2>Hour of day</h2>${raw(bars(a.hours.sort((x, y) => x[0].localeCompare(y[0])), { label: (k) => `${k}:00` }))}</div>
      </div>

      <div class="card">
        <h2>Feedback (${feedback.length})</h2>
        ${feedback.length ? raw(h`<ul class="plain-list">${[...feedback].reverse().map((f) => raw(h`<li class="feedback-item"><p class="muted small">${f.type} · ${new Date(f.createdAt).toLocaleString()} · v${f.version} · ${f.page || 'unknown page'}${f.contact ? ` · contact: ${f.contact}` : ''}</p><p class="prewrap">${f.message}</p><button class="btn btn-small btn-ghost" data-del-fb="${f.id}">Delete</button></li>`))}</ul>`) : raw('<p class="muted small">No feedback on this device.</p>')}
      </div>

      <div class="card">
        <h2>Data</h2>
        <div class="cta-row">
          <button class="btn" id="admin-export">Export aggregate + raw (JSON)</button>
          <label class="btn file-btn">Import a user's statistics export <input type="file" id="admin-import" accept="application/json,.json" hidden /></label>
          <button class="btn btn-ghost" id="admin-clear-imports">Clear imports</button>
        </div>
        <p class="muted small">Users export their statistics from Settings; import the JSON here to aggregate across devices. Imports are stored on this device only.</p>
      </div>

      <div class="card">
        <h2>Passphrase</h2>
        <form id="admin-change" class="form-grid">
          <label class="field"><span>New passphrase</span><input type="password" id="np1" minlength="${MIN_LEN}" autocomplete="new-password" required /></label>
          <label class="field"><span>Repeat</span><input type="password" id="np2" minlength="${MIN_LEN}" autocomplete="new-password" required /></label>
          <button class="btn" type="submit">Change</button>
        </form>
      </div>
    </section>`;
}

export async function view() {
  const prefs = getPrefs();
  let html;
  if (!prefs.admin) html = setupHtml();
  else if (!unlocked()) html = loginHtml();
  else html = await dashboardHtml();

  return {
    title: 'Admin',
    html,
    mount(root) {
      root.querySelectorAll('.bar-fill').forEach((b) => { b.style.width = `${b.dataset.w}%`; });
      const setup = root.querySelector('#admin-setup');
      if (setup) setup.addEventListener('submit', async (e) => {
        e.preventDefault();
        const a = root.querySelector('#pp1').value, b = root.querySelector('#pp2').value;
        if (a.length < MIN_LEN) return toast(`Use at least ${MIN_LEN} characters`);
        if (a !== b) return toast('Passphrases do not match');
        setPrefs({ admin: await hashPassphrase(a) });
        setUnlocked(true);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
      const login = root.querySelector('#admin-login');
      if (login) login.addEventListener('submit', async (e) => {
        e.preventDefault();
        const ok = await verifyPassphrase(root.querySelector('#pp').value, getPrefs().admin);
        if (!ok) { toast('Wrong passphrase'); await new Promise((r) => setTimeout(r, 800)); return; }
        setUnlocked(true);
        window.dispatchEvent(new HashChangeEvent('hashchange'));
      });
      const lock = root.querySelector('#admin-lock');
      if (lock) lock.addEventListener('click', () => { setUnlocked(false); window.dispatchEvent(new HashChangeEvent('hashchange')); });
      const exp = root.querySelector('#admin-export');
      if (exp) exp.addEventListener('click', async () => {
        const local = await dbAll('events');
        const imported = await dbAll('imported');
        const events = local.concat(imported.flatMap((i) => i.events || []));
        download(`blendwise-admin-${Date.now()}.json`, JSON.stringify({ app: CONFIG.appName, version: CONFIG.version, exportedAt: new Date().toISOString(), aggregate: aggregate(events), feedback: await dbAll('feedback'), events }, null, 2));
      });
      const imp = root.querySelector('#admin-import');
      if (imp) imp.addEventListener('change', async () => {
        const file = imp.files[0];
        if (!file) return;
        try {
          const data = JSON.parse(await file.text());
          const events = Array.isArray(data.events) ? data.events.filter((e) => e && typeof e.n === 'string' && typeof e.d === 'string').map((e) => ({ n: e.n.slice(0, 40), p: typeof e.p === 'object' && e.p ? e.p : {}, s: String(e.s || '').slice(0, 16), i: String(e.i || '').slice(0, 16), h: String(e.h || '').slice(0, 13), d: e.d.slice(0, 10), o: e.o === 'landscape' ? 'landscape' : 'portrait' })) : [];
          if (!events.length) return toast('No events found in that file');
          await dbAdd('imported', { importedAt: new Date().toISOString(), name: file.name.slice(0, 80), count: events.length, events });
          toast(`Imported ${events.length} events`);
          window.dispatchEvent(new HashChangeEvent('hashchange'));
        } catch { toast('Could not read that file'); }
      });
      const clr = root.querySelector('#admin-clear-imports');
      if (clr) clr.addEventListener('click', async () => { await dbClear('imported'); window.dispatchEvent(new HashChangeEvent('hashchange')); });
      root.addEventListener('click', async (e) => {
        const d = e.target.closest('[data-del-fb]');
        if (d) { await dbDelete('feedback', Number(d.dataset.delFb)); window.dispatchEvent(new HashChangeEvent('hashchange')); }
      });
      const change = root.querySelector('#admin-change');
      if (change) change.addEventListener('submit', async (e) => {
        e.preventDefault();
        const a = root.querySelector('#np1').value, b = root.querySelector('#np2').value;
        if (a.length < MIN_LEN || a !== b) return toast('Check the passphrase and repeat');
        setPrefs({ admin: await hashPassphrase(a) });
        toast('Passphrase changed');
        change.reset();
      });
    },
  };
}
