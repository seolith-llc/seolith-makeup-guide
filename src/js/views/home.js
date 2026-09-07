import { h, raw, fmtMinutes } from '../dom.js';
import { LOOKS, getLook } from '../../data/looks.js';
import { getPrefs, dbAll, setPrefs } from '../store.js';
import { estimate, paceModel } from '../estimator.js';
import { CONFIG } from '../config.js';
import { streakDays } from './insights.js';

export function lookCard(look, skill, pace) {
  const est = estimate(look, skill, { pace });
  const trimmed = estimate(look, skill, { pace, includeOptional: false });
  const fav = getPrefs().favorites.includes(look.id);
  return h`
    <article class="card look-card">
      <a class="look-card-main" href="#/look/${look.id}">
        <span class="look-emoji" aria-hidden="true">${look.emoji}</span>
        <span class="look-card-text">
          <span class="look-name">${look.name}</span>
          <span class="muted">${look.occasion}</span>
          <span class="chips">
            <span class="chip chip-${look.difficulty}">${look.difficulty}</span>
            <span class="chip">${trimmed.total === est.total ? fmtMinutes(est.total) : `${fmtMinutes(trimmed.total)} to ${fmtMinutes(est.total)}`}</span>
            <span class="chip">${look.steps.length} steps</span>
          </span>
        </span>
      </a>
      <button class="icon-btn fav-btn" data-fav="${look.id}" aria-pressed="${fav}" aria-label="${fav ? 'Remove from favourites' : 'Add to favourites'}">${fav ? '♥' : '♡'}</button>
    </article>`;
}

export function wireFavorites(root) {
  root.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-fav]');
    if (!btn) return;
    const id = btn.dataset.fav;
    const prefs = getPrefs();
    const favorites = prefs.favorites.includes(id) ? prefs.favorites.filter((x) => x !== id) : [...prefs.favorites, id];
    setPrefs({ favorites });
    const on = favorites.includes(id);
    btn.textContent = on ? '♥' : '♡';
    btn.setAttribute('aria-pressed', String(on));
    btn.setAttribute('aria-label', on ? 'Remove from favourites' : 'Add to favourites');
  });
}

export async function view() {
  const prefs = getPrefs();
  const runs = await dbAll('runs');
  const pace = paceModel(runs);
  const completed = runs.filter((r) => r.completed);
  const streak = streakDays(completed);
  const last = prefs.lastLook ? getLook(prefs.lastLook) : null;
  const favs = prefs.favorites.map(getLook).filter(Boolean);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const recommended = LOOKS.find((l) => l.difficulty === prefs.skill) || LOOKS[2];

  const html = h`
    <section class="hero">
      <h1>${greeting}</h1>
      <p class="lede">${CONFIG.tagline}</p>
      <div class="quick-actions">
        <a class="btn btn-primary" href="#/look/five-minute/play">Start the 5-minute face</a>
        <a class="btn" href="#/estimate">I have N minutes</a>
        <a class="btn" href="#/before-after">See before &amp; after</a>
      </div>
    </section>

    ${last ? raw(h`
      <section class="section">
        <h2>Continue</h2>
        ${raw(lookCard(last, prefs.skill, pace))}
      </section>`) : ''}

    <section class="section stats-row" aria-label="Your progress">
      <div class="stat"><span class="stat-num">${completed.length}</span><span class="stat-label">routines done</span></div>
      <div class="stat"><span class="stat-num">${streak}</span><span class="stat-label">day streak</span></div>
      <div class="stat"><span class="stat-num">${pace.samples >= 3 ? 'on' : 'off'}</span><span class="stat-label">personal pace</span></div>
    </section>

    ${favs.length ? raw(h`<section class="section"><h2>Favourites</h2>${favs.map((l) => raw(lookCard(l, prefs.skill, pace)))}</section>`) : ''}

    <section class="section">
      <h2>Recommended for ${prefs.skill}s</h2>
      ${raw(lookCard(recommended, prefs.skill, pace))}
      <a class="link" href="#/looks">All looks</a>
    </section>

    <section class="section">
      <h2>Best way to use Blendwise</h2>
      <ol class="how-list">
        <li>Pick a look and run it with the timer on. Three timed runs turn on your personal pace.</li>
        <li>Check Insights to see which steps slow you down, then read the tips for those steps.</li>
        <li>Log your products in My Kit so you know when to replace mascara and liner.</li>
      </ol>
      <a class="link" href="#/tips">More tips</a>
    </section>
  `;
  return { title: 'Home', html, mount: wireFavorites };
}
