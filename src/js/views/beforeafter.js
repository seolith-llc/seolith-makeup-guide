import { h, raw } from '../dom.js';
import { faceSvg, setLayers, LAYER_ORDER, LAYER_LABELS, TONES } from '../face.js';
import { STEPS } from '../../data/steps.js';
import { getPrefs, setPrefs } from '../store.js';

const LAYER_STEP = {
  prep: 'prep', primer: 'primer', corrector: 'corrector', foundation: 'foundation', concealer: 'concealer', powder: 'powder', bronzer: 'bronzer', contour: 'contour',
  blush: 'blush', highlight: 'highlight', brows: 'brows', eyeshadow: 'eyeshadow-blend', eyeliner: 'eyeliner-wing', mascara: 'mascara', lashes: 'lashes', lipliner: 'lipliner', lips: 'lips', setting: 'setting',
};

export async function view() {
  const prefs = getPrefs();
  const html = h`
    <section class="section">
      <h1>Before and after</h1>
      <p class="lede">Drag the slider to add one step at a time and see what each product changes. The drawing is stylised; it shows the effect, not a prediction of your face.</p>
      <div class="two-col">
        <div class="face-wrap sticky" id="ba-face">${raw(faceSvg(prefs.skinTone))}</div>
        <div>
          <div class="card">
            <label class="field"><span>Skin tone of the drawing</span>
              <select id="ba-tone">${Object.entries(TONES).map(([id, t]) => raw(h`<option value="${id}" ${id === prefs.skinTone ? 'selected' : ''}>${t.name}</option>`))}</select>
            </label>
            <label class="field"><span>Steps applied: <strong id="ba-count">0</strong> of ${LAYER_ORDER.length}</span>
              <input type="range" id="ba-slider" min="0" max="${LAYER_ORDER.length}" value="0" step="1" aria-valuetext="Before" />
            </label>
            <div class="segmented"><button class="seg" data-jump="0">Before</button><button class="seg" data-jump="${LAYER_ORDER.length}">After</button></div>
          </div>
          <div class="card" id="ba-desc" aria-live="polite">
            <h2>Before</h2>
            <p>Uneven tone with redness on the cheeks and nose, shadows under the eyes, a few blemishes, sparse brows and pale lips. Everything that follows changes one of these.</p>
          </div>
          <div class="card">
            <h2>Toggle individual steps</h2>
            <div class="chips" id="ba-chips">
              ${LAYER_ORDER.map((l) => raw(h`<button class="chip chip-btn" data-layer="${l}" aria-pressed="false">${LAYER_LABELS[l]}</button>`))}
            </div>
          </div>
        </div>
      </div>
    </section>`;

  return {
    title: 'Before and after',
    html,
    mount(root) {
      const wrap = root.querySelector('#ba-face');
      let svg = wrap.querySelector('svg');
      const slider = root.querySelector('#ba-slider');
      const count = root.querySelector('#ba-count');
      const desc = root.querySelector('#ba-desc');
      const active = new Set();

      function describe(layer) {
        if (!layer) {
          desc.innerHTML = h`<h2>Before</h2><p>Uneven tone with redness on the cheeks and nose, shadows under the eyes, a few blemishes, sparse brows and pale lips.</p>`;
          return;
        }
        const s = STEPS[LAYER_STEP[layer]];
        desc.innerHTML = h`<h2>${LAYER_LABELS[layer]}</h2><p><strong>Before:</strong> ${s.before}</p><p><strong>After:</strong> ${s.after}</p><p class="muted">${s.summary}</p>`;
      }

      function apply(lastChanged) {
        setLayers(svg, active);
        count.textContent = String(active.size);
        root.querySelectorAll('[data-layer]').forEach((b) => b.setAttribute('aria-pressed', String(active.has(b.dataset.layer))));
        root.querySelectorAll('[data-layer]').forEach((b) => b.classList.toggle('is-active', active.has(b.dataset.layer)));
        describe(lastChanged);
      }

      function setCount(n) {
        active.clear();
        LAYER_ORDER.slice(0, n).forEach((l) => active.add(l));
        slider.value = String(n);
        slider.setAttribute('aria-valuetext', n === 0 ? 'Before' : `After ${LAYER_LABELS[LAYER_ORDER[n - 1]]}`);
        apply(n ? LAYER_ORDER[n - 1] : null);
      }

      slider.addEventListener('input', () => setCount(Number(slider.value)));
      root.addEventListener('click', (e) => {
        const jump = e.target.closest('[data-jump]');
        if (jump) setCount(Number(jump.dataset.jump));
        const chip = e.target.closest('[data-layer]');
        if (chip) {
          const l = chip.dataset.layer;
          active.has(l) ? active.delete(l) : active.add(l);
          slider.value = String(active.size);
          apply(l);
        }
      });
      root.querySelector('#ba-tone').addEventListener('change', (e) => {
        setPrefs({ skinTone: e.target.value });
        wrap.querySelector('svg').remove();
        wrap.insertAdjacentHTML('afterbegin', faceSvg(e.target.value));
        svg = wrap.querySelector('svg');
        setLayers(svg, active);
      });
    },
  };
}
