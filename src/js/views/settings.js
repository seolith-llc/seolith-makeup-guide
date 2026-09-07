import { h, raw, toast, download, randomId } from '../dom.js';
import { getPrefs, setPrefs, exportAll, wipeAll, dbClear, dbAll } from '../store.js';
import { CONFIG } from '../config.js';
import { TONES } from '../face.js';
import { track } from '../telemetry.js';
import { installState, promptInstall, checkForUpdate } from '../pwa.js';

const SKIN_TYPES = ['normal', 'dry', 'oily', 'combination', 'sensitive'];

export async function view() {
  const prefs = getPrefs();
  const inst = installState();
  const html = h`
    <section class="section">
      <h1>Settings</h1>
      <div class="card">
        <h2>Your profile</h2>
        <label class="field"><span>Skill level</span>
          <select data-pref="skill">${CONFIG.skillLevels.map((s) => raw(h`<option value="${s}" ${s === prefs.skill ? 'selected' : ''}>${s}</option>`))}</select>
        </label>
        <label class="field"><span>Skin type</span>
          <select data-pref="skinType">${SKIN_TYPES.map((s) => raw(h`<option value="${s}" ${s === prefs.skinType ? 'selected' : ''}>${s}</option>`))}</select>
        </label>
        <label class="field"><span>Skin tone of the illustration</span>
          <select data-pref="skinTone">${Object.entries(TONES).map(([id, t]) => raw(h`<option value="${id}" ${id === prefs.skinTone ? 'selected' : ''}>${t.name}</option>`))}</select>
        </label>
      </div>

      <div class="card">
        <h2>Privacy</h2>
        <label class="check"><input type="checkbox" id="set-telemetry" ${prefs.consent.telemetry ? 'checked' : ''} /> <span>Keep anonymous usage statistics on this device (no personal data, never sent automatically)</span></label>
        <p class="muted small">Install id: <code>${prefs.installId}</code>. <button class="btn btn-small" id="rotate-id">Regenerate</button></p>
        <div class="cta-row">
          <button class="btn" id="export-data">Export my data (JSON)</button>
          <button class="btn" id="export-stats">Export usage statistics</button>
          <button class="btn" id="clear-stats">Delete usage statistics</button>
          <button class="btn btn-danger" id="wipe">Delete all my data</button>
        </div>
        <p class="muted small"><a class="link" href="#/privacy">Privacy Policy</a> · <a class="link" href="#/terms">Terms of use</a></p>
      </div>

      <div class="card">
        <h2>App</h2>
        <p class="muted small">${CONFIG.appName} ${CONFIG.version} · ${inst.installed ? 'installed' : 'running in the browser'} · ${navigator.onLine ? 'online' : 'offline'}</p>
        <div class="cta-row">
          ${inst.canPrompt ? raw('<button class="btn btn-primary" id="install">Install app</button>') : ''}
          <button class="btn" id="update">Check for updates</button>
          <a class="btn" href="#/admin">Admin</a>
        </div>
        ${!inst.installed && !inst.canPrompt ? raw('<p class="muted small">To install: open the browser menu and choose "Add to Home Screen" or "Install app".</p>') : ''}
      </div>
    </section>`;

  return {
    title: 'Settings',
    html,
    mount(root) {
      root.querySelectorAll('[data-pref]').forEach((sel) => sel.addEventListener('change', () => { setPrefs({ [sel.dataset.pref]: sel.value }); toast('Saved'); }));
      root.querySelector('#set-telemetry').addEventListener('change', (e) => {
        const p = getPrefs();
        setPrefs({ consent: { ...p.consent, telemetry: e.target.checked, at: new Date().toISOString() } });
        toast(e.target.checked ? 'Anonymous statistics on' : 'Anonymous statistics off');
      });
      root.querySelector('#rotate-id').addEventListener('click', () => { setPrefs({ installId: randomId(10), inviteCode: randomId(6) }); location.reload(); });
      root.querySelector('#export-data').addEventListener('click', async () => { download(`blendwise-data-${Date.now()}.json`, JSON.stringify(await exportAll(), null, 2)); track('export', { kind: 'all' }); });
      root.querySelector('#export-stats').addEventListener('click', async () => {
        const events = await dbAll('events');
        download(`blendwise-stats-${getPrefs().installId}.json`, JSON.stringify({ app: CONFIG.appName, version: CONFIG.version, exportedAt: new Date().toISOString(), events }, null, 2));
        track('export', { kind: 'stats' });
      });
      root.querySelector('#clear-stats').addEventListener('click', async () => { await dbClear('events'); toast('Usage statistics deleted'); });
      root.querySelector('#wipe').addEventListener('click', async () => {
        if (!confirm('Delete everything this app stored on this device? This cannot be undone.')) return;
        await wipeAll();
        location.hash = '#/';
        location.reload();
      });
      const install = root.querySelector('#install');
      if (install) install.addEventListener('click', async () => { const r = await promptInstall(); if (r === 'accepted') toast('Installed'); });
      root.querySelector('#update').addEventListener('click', async () => { toast((await checkForUpdate()) ? 'Update found, reloading…' : 'You have the latest version'); });
    },
  };
}
