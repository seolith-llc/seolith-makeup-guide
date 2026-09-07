import { h, raw, fmtMinutes, toast, copyText } from '../dom.js';
import { getLook } from '../../data/looks.js';
import { STEPS } from '../../data/steps.js';
import { categoryName } from '../../data/products.js';
import { getPrefs, dbAll } from '../store.js';
import { estimate, paceModel } from '../estimator.js';
import { CONFIG } from '../config.js';
import { track } from '../telemetry.js';
import { wireFavorites } from './home.js';
import { faceSvg, setLayers } from '../face.js';
import { shareUrl } from './share.js';

export async function view({ params }) {
  const look = getLook(params.id);
  if (!look) return { title: 'Not found', html: h`<section class="section"><h1>Look not found</h1><a class="link" href="#/looks">Back to looks</a></section>` };
  const prefs = getPrefs();
  const pace = paceModel(await dbAll('runs'));
  const fav = prefs.favorites.includes(look.id);
  const cats = new Set();
  look.steps.forEach((s) => STEPS[s.step].categories.forEach((c) => cats.add(c)));
  const allLayers = new Set(look.steps.map((s) => STEPS[s.step].layer));

  const html = h`
    <article class="section look-detail">
      <a class="link back" href="#/looks">← Looks</a>
      <header class="look-header">
        <span class="look-emoji big" aria-hidden="true">${look.emoji}</span>
        <div>
          <h1>${look.name}</h1>
          <p class="muted">${look.occasion} · <span class="chip chip-${look.difficulty}">${look.difficulty}</span></p>
        </div>
        <button class="icon-btn fav-btn" data-fav="${look.id}" aria-pressed="${fav}" aria-label="${fav ? 'Remove from favourites' : 'Add to favourites'}">${fav ? '♥' : '♡'}</button>
      </header>
      <p class="lede">${look.summary}</p>

      <div class="two-col">
        <div class="face-wrap" id="look-face">
          ${raw(faceSvg(prefs.skinTone))}
          <div class="segmented" role="group" aria-label="Preview">
            <button class="seg is-active" data-preview="before" aria-pressed="true">Before</button>
            <button class="seg" data-preview="after" aria-pressed="false">After</button>
          </div>
        </div>
        <div>
          <div class="card">
            <h2>Before and after</h2>
            <p><strong>Before:</strong> ${look.before}</p>
            <p><strong>After:</strong> ${look.after}</p>
          </div>
          <div class="card">
            <h2>How long</h2>
            <table class="table">
              <thead><tr><th scope="col">Skill</th><th scope="col">Essential steps</th><th scope="col">All steps</th></tr></thead>
              <tbody>
                ${CONFIG.skillLevels.map((s) => raw(h`<tr class="${s === prefs.skill ? 'is-you' : ''}"><th scope="row">${s}${s === prefs.skill ? ' (you)' : ''}</th><td>${fmtMinutes(estimate(look, s, { pace, includeOptional: false }).total)}</td><td>${fmtMinutes(estimate(look, s, { pace }).total)}</td></tr>`))}
              </tbody>
            </table>
            ${pace.samples >= 3 ? raw('<p class="muted small">Adjusted to your measured pace.</p>') : raw('<p class="muted small">Time three routines and this becomes your personal estimate.</p>')}
          </div>
        </div>
      </div>

      <div class="cta-row">
        <a class="btn btn-primary btn-large" href="#/look/${look.id}/play">Start guided routine</a>
        <button class="btn" data-share-look>Share this look</button>
      </div>

      <h2>Steps</h2>
      <ol class="steps-list">
        ${look.steps.map((s, i) => {
          const st = STEPS[s.step];
          return raw(h`<li class="step-row">
            <span class="step-num">${i + 1}</span>
            <span>
              <span class="step-title">${st.title}${s.optional ? raw(' <span class="chip">optional</span>') : ''}</span>
              <span class="muted">${s.note || st.summary}</span>
            </span>
            <span class="muted small step-min">${fmtMinutes(st.minutes[prefs.skill])}</span>
          </li>`);
        })}
      </ol>

      <h2>What you need</h2>
      <div class="chips">
        ${Array.from(cats).map((c) => raw(h`<a class="chip chip-link" href="#/products?category=${c}">${categoryName(c)}</a>`))}
      </div>
      <p class="muted small">Product suggestions include paid affiliate links. See Products for the full disclosure.</p>
    </article>`;

  return {
    title: look.name,
    html,
    mount(root) {
      wireFavorites(root);
      const svg = root.querySelector('svg.face');
      root.addEventListener('click', async (e) => {
        const seg = e.target.closest('[data-preview]');
        if (seg) {
          root.querySelectorAll('[data-preview]').forEach((b) => { b.classList.toggle('is-active', b === seg); b.setAttribute('aria-pressed', String(b === seg)); });
          setLayers(svg, seg.dataset.preview === 'after' ? allLayers : new Set());
        }
        if (e.target.closest('[data-share-look]')) {
          const url = shareUrl(`#/look/${look.id}`);
          const text = `Try the "${look.name}" routine on ${CONFIG.appName}: ${look.summary}`;
          track('share', { kind: 'look', look: look.id });
          if (navigator.share) {
            try { await navigator.share({ title: look.name, text, url }); } catch {}
          } else {
            toast((await copyText(`${text} ${url}`)) ? 'Link copied' : 'Could not copy link');
          }
        }
      });
    },
  };
}
