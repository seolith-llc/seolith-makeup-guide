import { h, raw } from '../dom.js';
import { LOOKS } from '../../data/looks.js';
import { getPrefs, dbAll } from '../store.js';
import { paceModel } from '../estimator.js';
import { lookCard, wireFavorites } from './home.js';

export async function view() {
  const prefs = getPrefs();
  const pace = paceModel(await dbAll('runs'));
  const html = h`
    <section class="section">
      <h1>Looks</h1>
      <p class="lede">Times are for your skill level (${prefs.skill}). Change it in Settings.</p>
      <div class="chips filter-chips" role="group" aria-label="Filter by difficulty">
        <button class="chip chip-btn is-active" data-filter="all" aria-pressed="true">All</button>
        <button class="chip chip-btn" data-filter="beginner" aria-pressed="false">Beginner</button>
        <button class="chip chip-btn" data-filter="intermediate" aria-pressed="false">Intermediate</button>
        <button class="chip chip-btn" data-filter="advanced" aria-pressed="false">Advanced</button>
      </div>
      <div class="look-list">
        ${LOOKS.map((l) => raw(`<div data-difficulty="${l.difficulty}">${lookCard(l, prefs.skill, pace)}</div>`))}
      </div>
    </section>`;
  return {
    title: 'Looks',
    html,
    mount(root) {
      wireFavorites(root);
      root.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-filter]');
        if (!btn) return;
        root.querySelectorAll('[data-filter]').forEach((b) => { b.classList.toggle('is-active', b === btn); b.setAttribute('aria-pressed', String(b === btn)); });
        const f = btn.dataset.filter;
        root.querySelectorAll('[data-difficulty]').forEach((el) => { el.hidden = f !== 'all' && el.dataset.difficulty !== f; });
      });
    },
  };
}
