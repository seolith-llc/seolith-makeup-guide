import { h, raw, stars, toast } from '../dom.js';
import { PRODUCTS, CATEGORIES, TIERS, categoryName, categoryPao } from '../../data/products.js';
import { getPrefs, dbAdd } from '../store.js';
import { CONFIG } from '../config.js';
import { track } from '../telemetry.js';

export function affiliateUrl(product) {
  const base = `${CONFIG.affiliate.amazonDomain}/s?k=${encodeURIComponent(product.search)}`;
  return CONFIG.affiliate.amazonTag ? `${base}&tag=${encodeURIComponent(CONFIG.affiliate.amazonTag)}` : base;
}

export function productCard(p, skinType) {
  const suits = p.bestFor.includes(skinType);
  return h`
    <article class="card product-card" data-category="${p.category}" data-tier="${p.tier}" data-suits="${suits}">
      <div class="product-head">
        <div>
          <p class="muted small">${p.brand} · ${categoryName(p.category)}</p>
          <h3>${p.name}</h3>
        </div>
        <span class="chip chip-${p.tier}">${TIERS[p.tier]}</span>
      </div>
      <p>${stars(p.rating)} <span class="muted small">editorial rating</span></p>
      <p>${p.why}</p>
      <p class="muted small">Best for: ${p.bestFor.join(', ')} skin${suits ? raw(' · <strong>matches your profile</strong>') : ''}. Replace about ${categoryPao(p.category)} months after opening.</p>
      <div class="cta-row">
        <a class="btn btn-primary" href="${affiliateUrl(p)}" target="_blank" rel="sponsored noopener noreferrer" data-product="${p.id}">View on Amazon <span class="paid">Paid link</span></a>
        <button class="btn" data-add-kit="${p.id}">Add to My Kit</button>
      </div>
    </article>`;
}

export async function view({ query }) {
  const prefs = getPrefs();
  const initialCat = query.get('category') || 'all';
  const html = h`
    <section class="section">
      <h1>Products</h1>
      <p class="disclosure"><strong>Disclosure.</strong> As an Amazon Associate I earn from qualifying purchases. Links marked "Paid link" are affiliate links; buying through them may earn this app a commission at no extra cost to you. Ratings are editorial summaries of public reviews as of mid-2026, not live retailer data, and do not affect which products are listed. Always check the current price, ingredients and reviews at the retailer.</p>
      <div class="card filters">
        <label class="field"><span>Category</span>
          <select id="prod-cat"><option value="all">All categories</option>${CATEGORIES.map((c) => raw(h`<option value="${c.id}" ${c.id === initialCat ? 'selected' : ''}>${c.name}</option>`))}</select>
        </label>
        <div class="chips" role="group" aria-label="Price tier">
          <button class="chip chip-btn is-active" data-tier="all" aria-pressed="true">All tiers</button>
          ${Object.entries(TIERS).map(([id, name]) => raw(h`<button class="chip chip-btn" data-tier="${id}" aria-pressed="false">${name}</button>`))}
        </div>
        <label class="check"><input type="checkbox" id="prod-suits" /> <span>Only products suited to ${prefs.skinType} skin</span></label>
      </div>
      <div class="product-list" id="prod-list">
        ${PRODUCTS.map((p) => raw(productCard(p, prefs.skinType)))}
      </div>
      <p class="muted small" id="prod-empty" hidden>No products match these filters.</p>
    </section>`;

  return {
    title: 'Products',
    html,
    mount(root) {
      const catSel = root.querySelector('#prod-cat');
      const suits = root.querySelector('#prod-suits');
      let tier = 'all';
      function filter() {
        let shown = 0;
        root.querySelectorAll('.product-card').forEach((card) => {
          const ok = (catSel.value === 'all' || card.dataset.category === catSel.value) && (tier === 'all' || card.dataset.tier === tier) && (!suits.checked || card.dataset.suits === 'true');
          card.hidden = !ok;
          if (ok) shown++;
        });
        root.querySelector('#prod-empty').hidden = shown > 0;
      }
      catSel.addEventListener('change', filter);
      suits.addEventListener('change', filter);
      root.addEventListener('click', async (e) => {
        const t = e.target.closest('[data-tier]');
        if (t) {
          tier = t.dataset.tier;
          root.querySelectorAll('[data-tier]').forEach((b) => { b.classList.toggle('is-active', b === t); b.setAttribute('aria-pressed', String(b === t)); });
          filter();
        }
        const link = e.target.closest('[data-product]');
        if (link) track('product_click', { product: link.dataset.product, category: catSel.value });
        const add = e.target.closest('[data-add-kit]');
        if (add) {
          const p = PRODUCTS.find((x) => x.id === add.dataset.addKit);
          await dbAdd('kit', { productId: p.id, name: `${p.brand} ${p.name}`, category: p.category, openedAt: new Date().toISOString().slice(0, 10), paoMonths: categoryPao(p.category) });
          track('kit_add', { category: p.category, source: 'catalog' });
          toast('Added to My Kit with today as the opening date', { action: 'Open kit', onAction: () => { location.hash = '#/kit'; } });
        }
      });
      filter();
    },
  };
}
