import { h, raw, fmtMinutes } from '../dom.js';
import { LOOKS, getLook } from '../../data/looks.js';
import { STEPS } from '../../data/steps.js';
import { getPrefs, dbAll } from '../store.js';
import { paceModel } from '../estimator.js';
import { tipsFor } from '../../data/tips.js';
import { CONFIG } from '../config.js';

export function streakDays(completedRuns) {
  const days = new Set(completedRuns.map((r) => new Date(r.finishedAt || r.startedAt).toDateString()));
  let streak = 0;
  const d = new Date();
  if (!days.has(d.toDateString())) d.setDate(d.getDate() - 1);
  while (days.has(d.toDateString())) { streak++; d.setDate(d.getDate() - 1); }
  return streak;
}

export async function view() {
  const prefs = getPrefs();
  const runs = await dbAll('runs');
  const completed = runs.filter((r) => r.completed);
  const pace = paceModel(runs);
  const totalMin = completed.reduce((a, r) => a + r.totalSeconds, 0) / 60;
  const byLook = new Map();
  for (const r of completed) {
    if (!byLook.has(r.lookId)) byLook.set(r.lookId, { runs: 0, seconds: 0, est: 0 });
    const b = byLook.get(r.lookId);
    b.runs++; b.seconds += r.totalSeconds; b.est += (r.steps || []).reduce((a, s) => a + (s.estimatedMinutes || 0), 0) * 60;
  }
  const lookRows = Array.from(byLook.entries()).map(([id, b]) => ({ look: getLook(id), ...b })).filter((x) => x.look).sort((a, b) => b.runs - a.runs);
  const slowSteps = Array.from(pace.factors.entries()).filter(([, f]) => f.factor > 1.3 && f.samples >= 2).sort((a, b) => b[1].factor - a[1].factor).slice(0, 3);
  const fastSteps = Array.from(pace.factors.entries()).filter(([, f]) => f.factor < 0.75 && f.samples >= 2).slice(0, 3);
  const mostDone = lookRows[0] ? lookRows[0].look : null;
  const nextLevel = mostDone ? CONFIG.skillLevels[Math.min(2, CONFIG.skillLevels.indexOf(mostDone.difficulty) + 1)] : prefs.skill;
  const suggestion = LOOKS.find((l) => l.difficulty === nextLevel && (!mostDone || l.id !== mostDone.id)) || LOOKS[2];
  const tips = tipsFor({ skinType: prefs.skinType, skill: prefs.skill }).filter((t) => t.group === 'skin' || t.group === 'app').slice(0, 4);

  const html = h`
    <section class="section">
      <h1>Insights</h1>
      <p class="lede">What your own timed routines say about the best way to use your time. Everything here is computed on this device.</p>
      <div class="stats-row">
        <div class="stat"><span class="stat-num">${completed.length}</span><span class="stat-label">completed</span></div>
        <div class="stat"><span class="stat-num">${streakDays(completed)}</span><span class="stat-label">day streak</span></div>
        <div class="stat"><span class="stat-num">${fmtMinutes(totalMin)}</span><span class="stat-label">in front of the mirror</span></div>
        <div class="stat"><span class="stat-num">${pace.samples >= 3 ? `${Math.round(pace.overall * 100)}%` : '–'}</span><span class="stat-label">of standard pace</span></div>
      </div>

      ${completed.length === 0 ? raw(h`<div class="card"><h2>No timed routines yet</h2><p>Run any look with the timer on and this page fills in. Start with <a class="link" href="#/look/five-minute/play">the 5-minute face</a>.</p></div>`) : ''}

      ${lookRows.length ? raw(h`<div class="card"><h2>Your looks</h2>
        <table class="table"><thead><tr><th scope="col">Look</th><th scope="col">Runs</th><th scope="col">Avg time</th><th scope="col">vs estimate</th></tr></thead>
        <tbody>${lookRows.map((r) => {
          const avg = r.seconds / r.runs / 60;
          const est = r.est / r.runs / 60;
          const delta = est ? Math.round(((avg - est) / est) * 100) : 0;
          return raw(h`<tr><th scope="row"><a class="link" href="#/look/${r.look.id}">${r.look.name}</a></th><td>${r.runs}</td><td>${fmtMinutes(avg)}</td><td>${delta > 0 ? `+${delta}%` : `${delta}%`}</td></tr>`);
        })}</tbody></table></div>`) : ''}

      ${slowSteps.length ? raw(h`<div class="card"><h2>Steps that slow you down</h2>
        <ul>${slowSteps.map(([id, f]) => raw(h`<li><strong>${STEPS[id].title}</strong> takes ${Math.round(f.factor * 100)}% of the estimate. Tip: ${STEPS[id].tips[0]}</li>`))}</ul></div>`) : ''}
      ${fastSteps.length ? raw(h`<div class="card"><h2>Where you are already quick</h2>
        <ul>${fastSteps.map(([id, f]) => raw(h`<li><strong>${STEPS[id].title}</strong>: ${Math.round(f.factor * 100)}% of the estimate.</li>`))}</ul></div>`) : ''}

      <div class="card">
        <h2>Suggested next</h2>
        <p>${mostDone ? raw(h`You have done <strong>${mostDone.name}</strong> most often. Ready for a step up: <a class="link" href="#/look/${suggestion.id}">${suggestion.emoji} ${suggestion.name}</a>.`) : raw(h`Start with <a class="link" href="#/look/${suggestion.id}">${suggestion.emoji} ${suggestion.name}</a>, which matches your ${prefs.skill} level.`)}</p>
      </div>

      <div class="card">
        <h2>Tips for you</h2>
        <ul>${tips.map((t) => raw(h`<li><strong>${t.title}.</strong> ${t.body}</li>`))}</ul>
        <a class="link" href="#/tips">All tips</a>
      </div>
    </section>`;
  return { title: 'Insights', html };
}
