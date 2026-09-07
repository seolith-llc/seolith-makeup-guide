import { h, raw, toast, copyText } from '../dom.js';
import { dbAll, dbAdd, dbDelete, dbPut } from '../store.js';
import { CONFIG } from '../config.js';
import { track } from '../telemetry.js';

const TYPES = { feature: 'Feature request', bug: 'Bug report', correction: 'Correction to content', other: 'Other' };

function itemText(f) {
  return `[${TYPES[f.type] || f.type}] ${CONFIG.appName} ${f.version} (${f.page})\n${f.message}${f.contact ? `\nContact: ${f.contact}` : ''}`;
}

export async function trySend(item) {
  if (!CONFIG.feedbackEndpoint || !navigator.onLine) return false;
  try {
    const res = await fetch(CONFIG.feedbackEndpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: item.type, message: item.message, contact: item.contact || null, version: item.version, page: item.page, createdAt: item.createdAt }) });
    if (res.ok) { await dbPut('feedback', { ...item, sentAt: new Date().toISOString() }); return true; }
  } catch {}
  return false;
}

export async function flushQueue() {
  if (!CONFIG.feedbackEndpoint) return;
  const all = await dbAll('feedback');
  for (const f of all) if (!f.sentAt) await trySend(f);
}

export async function view({ query }) {
  const fromPage = query.get('from') || '';
  const items = await dbAll('feedback');
  const html = h`
    <section class="section">
      <h1>Feedback</h1>
      <p class="lede">Request a feature, report a bug or correct something in the guides. Feedback is saved on this device; send it with the buttons below.</p>
      <form id="fb-form" class="card">
        <label class="field"><span>Type</span>
          <select id="fb-type">${Object.entries(TYPES).map(([k, v]) => raw(h`<option value="${k}">${v}</option>`))}</select>
        </label>
        <label class="field"><span>What happened, or what would you like?</span>
          <textarea id="fb-message" rows="5" maxlength="2000" required placeholder="Be specific: which look, which step, what you expected."></textarea>
        </label>
        <label class="field"><span>Contact (optional, only if you want a reply)</span>
          <input type="text" id="fb-contact" maxlength="120" autocomplete="off" placeholder="email or handle" />
        </label>
        <p class="muted small">Do not include passwords, payment details or other people's personal information. ${CONFIG.feedbackEndpoint ? 'When online, feedback is sent to the app team automatically.' : 'This build has no server: use Copy, Share or Email to send it.'}</p>
        <button class="btn btn-primary" type="submit">Save feedback</button>
      </form>
      <div id="fb-list">${raw(listHtml(items))}</div>
    </section>`;

  function listHtml(list) {
    if (!list.length) return '';
    return h`<h2>Your feedback</h2><ul class="plain-list">${[...list].reverse().map((f) => raw(h`<li class="card feedback-item">
      <p class="muted small">${TYPES[f.type] || f.type} · ${new Date(f.createdAt).toLocaleString()} · ${f.sentAt ? 'sent' : 'on this device'}</p>
      <p class="prewrap">${f.message}</p>
      <div class="cta-row">
        <button class="btn btn-small" data-copy="${f.id}">Copy</button>
        ${navigator.share ? raw(h`<button class="btn btn-small" data-share="${f.id}">Share</button>`) : ''}
        ${CONFIG.feedbackEmail ? raw(h`<a class="btn btn-small" href="mailto:${CONFIG.feedbackEmail}?subject=${encodeURIComponent(`${CONFIG.appName} feedback: ${TYPES[f.type] || f.type}`)}&body=${encodeURIComponent(itemText(f))}">Email</a>`) : ''}
        <button class="btn btn-small btn-ghost" data-delete="${f.id}">Delete</button>
      </div></li>`))}</ul>`;
  }

  return {
    title: 'Feedback',
    html,
    mount(root) {
      const list = root.querySelector('#fb-list');
      root.querySelector('#fb-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const item = {
          type: root.querySelector('#fb-type').value,
          message: root.querySelector('#fb-message').value.trim().slice(0, 2000),
          contact: root.querySelector('#fb-contact').value.trim().slice(0, 120),
          version: CONFIG.version,
          page: fromPage.slice(0, 60),
          createdAt: new Date().toISOString(),
        };
        if (!item.message) return;
        const id = await dbAdd('feedback', item);
        track('feedback_submit', { type: item.type, page: fromPage.slice(0, 40) });
        const sent = await trySend({ ...item, id });
        toast(sent ? 'Feedback sent. Thank you.' : 'Saved on this device. Use Copy or Share to send it.');
        root.querySelector('#fb-message').value = '';
        list.innerHTML = listHtml(await dbAll('feedback'));
      });
      list.addEventListener('click', async (e) => {
        const all = await dbAll('feedback');
        const get = (el) => all.find((f) => String(f.id) === el.dataset.copy || String(f.id) === el.dataset.share || String(f.id) === el.dataset.delete);
        const copy = e.target.closest('[data-copy]');
        if (copy) toast((await copyText(itemText(get(copy)))) ? 'Copied' : 'Could not copy');
        const share = e.target.closest('[data-share]');
        if (share) { try { await navigator.share({ title: `${CONFIG.appName} feedback`, text: itemText(get(share)) }); } catch {} }
        const del = e.target.closest('[data-delete]');
        if (del) { await dbDelete('feedback', Number(del.dataset.delete)); list.innerHTML = listHtml(await dbAll('feedback')); }
      });
    },
  };
}
