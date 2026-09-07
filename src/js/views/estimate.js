import { h, raw, fmtMinutes } from '../dom.js';
import { LOOKS, getLook } from '../../data/looks.js';
import { getPrefs, setPrefs, dbAll } from '../store.js';
import { estimate, paceModel, looksThatFit } from '../estimator.js';
import { CONFIG } from '../config.js';
import { track } from '../telemetry.js';

export async function view({ query }) {
  const prefs = getPrefs();
  const pace = paceModel(await dbAll('runs'));
  const initialLook = getLook(query.get('look')) || LOOKS[2];

  const html = h`
    <section class="section">
      <h1>How long will it take?</h1>
      <p class="lede">Pick a look and your skill level. Untick optional steps to see the essential-only time.</p>
      <div class="two-col">
        <div class="card">
          <label class="field"><span>Look</span>
            <select id="est-look">${LOOKS.map((l) => raw(h`<option value="${l.id}" ${l.id === initialLook.id ? 'selected' : ''}>${l.name}</option>`))}</select>
          </label>
          <label class="field"><span>Skill level</span>
            <select id="est-skill">${CONFIG.skillLevels.map((s) => raw(h`<option value="${s}" ${s === prefs.skill ? 'selected' : ''}>${s}</option>`))}</select>
          </label>
          <fieldset class="field" id="est-optional"><legend>Optional steps</legend></fieldset>
          ${pace.samples >= 3 ? raw(h`<p class="muted small">Personalised: your measured pace is ${Math.round(pace.overall * 100)}% of the standard estimate (${pace.samples} timed routines).</p>`) : raw('<p class="muted small">Not yet personalised. Time three routines to switch on your own pace.</p>')}
        </div>
        <div>
          <div class="card result-card" aria-live="polite">
            <p class="muted small">Estimated time</p>
            <p class="hero-num" id="est-total">–</p>
            <div id="est-breakdown"></div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>I have…</h2>
        <label class="field"><span>Minutes available</span>
          <input type="number" id="fit-minutes" min="1" max="180" value="15" inputmode="numeric" />
        </label>
        <div id="fit-list"></div>
      </div>
    </section>`;

  return {
    title: 'Time estimate',
    html,
    mount(root) {
      const lookSel = root.querySelector('#est-look');
      const skillSel = root.querySelector('#est-skill');
      const optWrap = root.querySelector('#est-optional');
      const total = root.querySelector('#est-total');
      const breakdown = root.querySelector('#est-breakdown');
      const fitInput = root.querySelector('#fit-minutes');
      const fitList = root.querySelector('#fit-list');

      function renderOptional() {
        const look = getLook(lookSel.value);
        const opts = look.steps.filter((s) => s.optional);
        optWrap.innerHTML = opts.length
          ? h`<legend>Optional steps</legend>${opts.map((s) => raw(h`<label class="check"><input type="checkbox" data-opt="${s.step}" checked /> <span>${s.step.replace(/-/g, ' ')}</span></label>`))}`
          : '<legend>Optional steps</legend><p class="muted small">This look has no optional steps.</p>';
      }

      function update() {
        const look = getLook(lookSel.value);
        const skill = skillSel.value;
        const excluded = new Set(Array.from(optWrap.querySelectorAll('[data-opt]')).filter((c) => !c.checked).map((c) => c.dataset.opt));
        const est = estimate(look, skill, { pace, excluded });
        total.textContent = fmtMinutes(est.total);
        const max = Math.max(...est.rows.map((r) => r.minutes), 1);
        breakdown.innerHTML = h`<ul class="bars">${est.rows.map((r) => raw(h`<li class="bar-row"><span class="bar-label">${r.title}</span><span class="bar-track"><span class="bar-fill" data-w="${(r.minutes / max) * 100}"></span></span><span class="bar-val">${fmtMinutes(r.minutes)}</span></li>`))}</ul>`;
        breakdown.querySelectorAll('.bar-fill').forEach((b) => { b.style.width = `${b.dataset.w}%`; });
        track('estimate', { look: look.id, skill });
      }

      function updateFit() {
        const mins = Math.max(1, Number(fitInput.value) || 0);
        const rows = looksThatFit(mins, skillSel.value, pace);
        const fits = rows.filter((r) => r.fits || r.fitsTrimmed);
        fitList.innerHTML = fits.length
          ? h`<ul class="plain-list">${fits.map((r) => raw(h`<li><a class="link" href="#/look/${r.look.id}">${r.look.emoji} ${r.look.name}</a> <span class="muted small">${r.fits ? `all steps, ${fmtMinutes(r.full)}` : `essential steps only, ${fmtMinutes(r.trimmed)}`}</span></li>`))}</ul>`
          : h`<p class="muted">Nothing fits in ${mins} minutes at this level. The 5-minute face needs ${fmtMinutes(rows[rows.length - 1].trimmed)}.</p>`;
      }

      lookSel.addEventListener('change', () => { renderOptional(); update(); });
      skillSel.addEventListener('change', () => { setPrefs({ skill: skillSel.value }); update(); updateFit(); });
      optWrap.addEventListener('change', update);
      fitInput.addEventListener('input', updateFit);
      renderOptional();
      update();
      updateFit();
    },
  };
}
