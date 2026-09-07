import { h, raw, toast, copyText } from '../dom.js';
import { LOOKS } from '../../data/looks.js';
import { getPrefs } from '../store.js';
import { CONFIG } from '../config.js';
import { track } from '../telemetry.js';

export function shareUrl(hash = '') {
  const base = CONFIG.publicUrl || `${location.origin}${location.pathname}`;
  return `${base}?ref=${getPrefs().inviteCode}${hash}`;
}

export async function view() {
  const prefs = getPrefs();
  const html = h`
    <section class="section">
      <h1>Share and invite</h1>
      <p class="lede">Send a friend the app. Invite links carry a random code (${prefs.inviteCode}) so the app can count invitations without knowing who anyone is.</p>
      <div class="card">
        <h2>Invite a friend</h2>
        <p id="invite-text">Try ${CONFIG.appName}: step-by-step makeup routines with timers and a before-and-after guide. Works offline.</p>
        <p class="muted small break">${shareUrl()}</p>
        <div class="cta-row">
          <button class="btn btn-primary" id="share-app">Share</button>
          <button class="btn" id="copy-app">Copy link</button>
        </div>
      </div>
      <div class="card">
        <h2>Share a look</h2>
        <label class="field"><span>Look</span>
          <select id="share-look">${LOOKS.map((l) => raw(h`<option value="${l.id}">${l.emoji} ${l.name}</option>`))}</select>
        </label>
        <div class="cta-row">
          <button class="btn btn-primary" id="share-look-btn">Share look</button>
          <button class="btn" id="copy-look-btn">Copy link</button>
        </div>
      </div>
      <div class="card">
        <h2>What is shared</h2>
        <p class="muted">Only the text above and the link. No name, no email, no usage data. The person who opens the link is counted once as "referred" in the anonymous statistics if they opt in.</p>
      </div>
    </section>`;

  return {
    title: 'Share',
    html,
    mount(root) {
      const text = root.querySelector('#invite-text').textContent;
      async function share(kind, title, body, url) {
        track('share', { kind });
        if (navigator.share) { try { await navigator.share({ title, text: body, url }); } catch {} }
        else toast((await copyText(`${body} ${url}`)) ? 'Copied to clipboard (this browser has no share sheet)' : 'Could not share');
      }
      root.querySelector('#share-app').addEventListener('click', () => share('app', CONFIG.appName, text, shareUrl()));
      root.querySelector('#copy-app').addEventListener('click', async () => { track('share', { kind: 'copy' }); toast((await copyText(shareUrl())) ? 'Link copied' : 'Could not copy'); });
      root.querySelector('#share-look-btn').addEventListener('click', () => {
        const l = LOOKS.find((x) => x.id === root.querySelector('#share-look').value);
        share('look', l.name, `Try the "${l.name}" routine on ${CONFIG.appName}: ${l.summary}`, shareUrl(`#/look/${l.id}`));
      });
      root.querySelector('#copy-look-btn').addEventListener('click', async () => {
        const id = root.querySelector('#share-look').value;
        track('share', { kind: 'copy-look', look: id });
        toast((await copyText(shareUrl(`#/look/${id}`))) ? 'Link copied' : 'Could not copy');
      });
    },
  };
}
