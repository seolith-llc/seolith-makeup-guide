import { h, raw } from '../dom.js';
import { CATEGORIES, PRODUCTS, categoryName, categoryPao } from '../../data/products.js';
import { dbAll, dbAdd, dbDelete } from '../store.js';
import { track } from '../telemetry.js';

function status(item) {
  const opened = new Date(item.openedAt);
  const months = (Date.now() - opened.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
  const pct = months / item.paoMonths;
  const replaceOn = new Date(opened);
  replaceOn.setMonth(replaceOn.getMonth() + item.paoMonths);
  if (pct >= 1) return { key: 'replace', label: 'Replace now', icon: '⛔', pct: 1, replaceOn };
  if (pct >= 0.7) return { key: 'soon', label: 'Replace soon', icon: '⚠️', pct, replaceOn };
  return { key: 'fresh', label: 'Fresh', icon: '✅', pct, replaceOn };
}

export async function view() {
  const items = await dbAll('kit');
  const today = new Date().toISOString().slice(0, 10);
  const html = h`
    <section class="section">
      <h1>My Kit</h1>
      <p class="lede">Log when you open a product and the app tells you when to replace it, based on typical period-after-opening (the open-jar symbol on the packaging).</p>
      <div class="card">
        <h2>Add a product</h2>
        <form id="kit-form" class="form-grid">
          <label class="field"><span>From the catalogue</span>
            <select id="kit-product"><option value="">Custom item</option>${PRODUCTS.map((p) => raw(h`<option value="${p.id}">${p.brand} ${p.name}</option>`))}</select>
          </label>
          <label class="field"><span>Name</span><input type="text" id="kit-name" maxlength="80" placeholder="e.g. Brown pencil liner" /></label>
          <label class="field"><span>Category</span>
            <select id="kit-category">${CATEGORIES.map((c) => raw(h`<option value="${c.id}">${c.name} (${c.pao} months)</option>`))}</select>
          </label>
          <label class="field"><span>Opened on</span><input type="date" id="kit-opened" value="${today}" max="${today}" required /></label>
          <label class="field"><span>Months until replacement</span><input type="number" id="kit-pao" min="1" max="36" value="12" inputmode="numeric" /></label>
          <button class="btn btn-primary" type="submit">Add</button>
        </form>
      </div>
      <div id="kit-list">${raw(listHtml(items))}</div>
      <div class="card">
        <h2>Typical replacement times</h2>
        <table class="table"><thead><tr><th scope="col">Category</th><th scope="col">Months after opening</th></tr></thead>
          <tbody>${CATEGORIES.map((c) => raw(h`<tr><th scope="row">${c.name}</th><td>${c.pao}</td></tr>`))}</tbody></table>
        <p class="muted small">Guidance only. Follow the manufacturer's label, and discard anything that changes smell, colour or texture. Never add water or saliva to a product.</p>
      </div>
    </section>`;

  function listHtml(list) {
    if (!list.length) return '<p class="muted">Nothing in your kit yet.</p>';
    const sorted = [...list].sort((a, b) => status(b).pct - status(a).pct);
    return h`<ul class="plain-list kit-list">${sorted.map((it) => {
      const s = status(it);
      return raw(h`<li class="card kit-item status-${s.key}">
        <div class="kit-item-main">
          <strong>${it.name}</strong>
          <span class="muted small">${categoryName(it.category)} · opened ${it.openedAt} · replace by ${s.replaceOn.toISOString().slice(0, 10)}</span>
          <span class="bar-track"><span class="bar-fill" data-w="${Math.round(s.pct * 100)}"></span></span>
        </div>
        <span class="kit-status">${s.icon} ${s.label}</span>
        <button class="icon-btn" data-remove="${it.id}" aria-label="Remove ${it.name}">✕</button>
      </li>`);
    })}</ul>`;
  }

  return {
    title: 'My Kit',
    html,
    mount(root) {
      const list = root.querySelector('#kit-list');
      const prodSel = root.querySelector('#kit-product');
      const catSel = root.querySelector('#kit-category');
      const nameInput = root.querySelector('#kit-name');
      const paoInput = root.querySelector('#kit-pao');
      function paint() { list.querySelectorAll('.bar-fill').forEach((b) => { b.style.width = `${b.dataset.w}%`; }); }
      paint();
      prodSel.addEventListener('change', () => {
        const p = PRODUCTS.find((x) => x.id === prodSel.value);
        if (p) { nameInput.value = `${p.brand} ${p.name}`; catSel.value = p.category; paoInput.value = String(categoryPao(p.category)); }
      });
      catSel.addEventListener('change', () => { paoInput.value = String(categoryPao(catSel.value)); });
      root.querySelector('#kit-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = nameInput.value.trim() || categoryName(catSel.value);
        const item = { productId: prodSel.value || null, name: name.slice(0, 80), category: catSel.value, openedAt: root.querySelector('#kit-opened').value, paoMonths: Math.max(1, Math.min(36, Number(paoInput.value) || 12)) };
        await dbAdd('kit', item);
        track('kit_add', { category: item.category, source: item.productId ? 'catalog' : 'custom' });
        list.innerHTML = listHtml(await dbAll('kit'));
        paint();
        nameInput.value = '';
        prodSel.value = '';
      });
      list.addEventListener('click', async (e) => {
        const btn = e.target.closest('[data-remove]');
        if (!btn) return;
        await dbDelete('kit', Number(btn.dataset.remove));
        list.innerHTML = listHtml(await dbAll('kit'));
        paint();
      });
    },
  };
}
