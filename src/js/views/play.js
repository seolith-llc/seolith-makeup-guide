// Guided routine player: one step at a time, illustration builds up, per-step timer.

import { h, raw, fmtMinutes, fmtSeconds, toast, copyText } from '../dom.js';
import { getLook } from '../../data/looks.js';
import { getPrefs, setPrefs, dbAdd, dbAll } from '../store.js';
import { estimate, lookSteps, paceModel } from '../estimator.js';
import { track, minuteBucket } from '../telemetry.js';
import { faceSvg, setLayers } from '../face.js';
import { CONFIG } from '../config.js';
import { shareUrl } from './share.js';

export async function view({ params }) {
  const look = getLook(params.id);
  if (!look) return { title: 'Not found', html: h`<section class="section"><h1>Look not found</h1></section>` };
  const prefs = getPrefs();
  const pace = paceModel(await dbAll('runs'));
  const est = estimate(look, prefs.skill, { pace });
  const steps = lookSteps(look);
  const estByStep = new Map(est.rows.map((r) => [r.id, r.minutes]));

  const state = { index: 0, seconds: steps.map(() => 0), running: false, timer: null, startedAt: Date.now(), finished: false, saved: false };

  const html = h`
    <section class="section play">
      <div class="play-top">
        <a class="link back" href="#/look/${look.id}">← ${look.name}</a>
        <span class="muted small" id="play-total">Total 0:00</span>
      </div>
      <div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="${steps.length}" aria-valuenow="0" aria-label="Routine progress"><div class="progress-bar" id="play-progress"></div></div>
      <div class="two-col play-cols">
        <div class="face-wrap sticky">${raw(faceSvg(prefs.skinTone))}<p class="muted small center" id="face-caption">Before</p></div>
        <div id="play-card"></div>
      </div>
    </section>`;

  function stepHtml(i) {
    const s = steps[i];
    const estMin = estByStep.get(s.id) || s.minutes[prefs.skill];
    return h`
      <article class="card step-card" aria-live="polite">
        <p class="muted small">Step ${i + 1} of ${steps.length} · ${s.area}${s.optional ? ' · optional' : ''}</p>
        <h1>${s.title}</h1>
        <p class="lede">${s.note || s.summary}</p>
        <div class="timer-row">
          <span class="timer" id="step-timer">0:00</span>
          <span class="muted small">estimate ${fmtMinutes(estMin)}</span>
          <button class="btn btn-small" id="timer-toggle" aria-pressed="true">Pause</button>
        </div>
        <h2>How</h2>
        <ol class="how-list">${s.how.map((x) => raw(h`<li>${x}</li>`))}</ol>
        <details><summary>Tips</summary><ul>${s.tips.map((x) => raw(h`<li>${x}</li>`))}</ul></details>
        <details><summary>Common mistakes</summary><ul>${s.mistakes.map((x) => raw(h`<li>${x}</li>`))}</ul></details>
        <p class="ba-line"><span class="muted">Before:</span> ${s.before} <span class="muted">After:</span> ${s.after}</p>
        <div class="cta-row">
          <button class="btn" id="prev-step" ${i === 0 ? 'disabled' : ''}>Back</button>
          <button class="btn btn-primary btn-large" id="next-step">${i === steps.length - 1 ? 'Finish' : 'Done, next'}</button>
          ${s.optional ? raw('<button class="btn btn-ghost" id="skip-step">Skip</button>') : ''}
        </div>
      </article>`;
  }

  function finishHtml() {
    const total = state.seconds.reduce((a, b) => a + b, 0);
    const estTotal = est.total * 60;
    const diff = total - estTotal;
    const verdict = Math.abs(diff) < 60 ? 'right on the estimate' : diff < 0 ? `${fmtMinutes(-diff / 60)} faster than the estimate` : `${fmtMinutes(diff / 60)} slower than the estimate`;
    const slow = steps.map((s, i) => ({ s, ratio: (state.seconds[i] / 60) / (estByStep.get(s.id) || 1) })).filter((x) => x.ratio > 1.3).sort((a, b) => b.ratio - a.ratio).slice(0, 2);
    return h`
      <article class="card step-card">
        <h1>Done: ${look.name}</h1>
        <p class="lede">You took <strong>${fmtSeconds(total)}</strong>, ${verdict}.</p>
        <table class="table">
          <thead><tr><th scope="col">Step</th><th scope="col">You</th><th scope="col">Estimate</th></tr></thead>
          <tbody>${steps.map((s, i) => raw(h`<tr><th scope="row">${s.title}</th><td>${fmtSeconds(state.seconds[i])}</td><td>${fmtMinutes(estByStep.get(s.id) || 0)}</td></tr>`))}</tbody>
        </table>
        ${slow.length ? raw(h`<h2>Where to speed up</h2><ul>${slow.map((x) => raw(h`<li><strong>${x.s.title}</strong>: ${x.s.tips[0]}</li>`))}</ul>`) : ''}
        <p class="muted small">This run is saved on your device and improves your personal estimate.</p>
        <div class="cta-row">
          <button class="btn btn-primary" id="share-result">Share result</button>
          <a class="btn" href="#/insights">Insights</a>
          <a class="btn" href="#/looks">Looks</a>
        </div>
      </article>`;
  }

  function mount(root) {
    const svg = root.querySelector('svg.face');
    const card = root.querySelector('#play-card');
    const progress = root.querySelector('#play-progress');
    const progressWrap = root.querySelector('.progress');
    const totalEl = root.querySelector('#play-total');
    const caption = root.querySelector('#face-caption');
    setPrefs({ lastLook: look.id });
    track('look_start', { look: look.id, skill: prefs.skill });

    function tick() {
      if (!state.running || state.finished) return;
      state.seconds[state.index] += 1;
      const t = root.querySelector('#step-timer');
      if (t) t.textContent = fmtSeconds(state.seconds[state.index]);
      totalEl.textContent = `Total ${fmtSeconds(state.seconds.reduce((a, b) => a + b, 0))}`;
    }

    function setRunning(on) {
      state.running = on;
      const btn = root.querySelector('#timer-toggle');
      if (btn) { btn.textContent = on ? 'Pause' : 'Resume'; btn.setAttribute('aria-pressed', String(on)); }
    }

    function show(i) {
      state.index = i;
      card.innerHTML = stepHtml(i);
      const layers = new Set(steps.slice(0, i).map((s) => s.layer));
      setLayers(svg, layers);
      caption.textContent = i === 0 ? 'Before' : `After ${steps[i - 1].title.toLowerCase()}`;
      progress.style.width = `${(i / steps.length) * 100}%`;
      progressWrap.setAttribute('aria-valuenow', String(i));
      root.querySelector('#step-timer').textContent = fmtSeconds(state.seconds[i]);
      setRunning(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    async function finish() {
      state.finished = true;
      state.running = false;
      setLayers(svg, new Set(steps.map((s) => s.layer)));
      caption.textContent = 'After';
      progress.style.width = '100%';
      progressWrap.setAttribute('aria-valuenow', String(steps.length));
      card.innerHTML = finishHtml();
      const total = state.seconds.reduce((a, b) => a + b, 0);
      if (!state.saved) {
        state.saved = true;
        await dbAdd('runs', {
          lookId: look.id, startedAt: state.startedAt, finishedAt: Date.now(), completed: true, skill: prefs.skill, totalSeconds: total,
          steps: steps.map((s, i) => ({ id: s.id, seconds: state.seconds[i], estimatedMinutes: estByStep.get(s.id) || s.minutes[prefs.skill] })),
        });
        track('look_complete', { look: look.id, bucket: minuteBucket(total / 60), skill: prefs.skill });
      }
    }

    state.timer = setInterval(tick, 1000);
    card.addEventListener('click', async (e) => {
      if (e.target.closest('#timer-toggle')) setRunning(!state.running);
      else if (e.target.closest('#prev-step')) show(Math.max(0, state.index - 1));
      else if (e.target.closest('#skip-step')) { state.seconds[state.index] = 0; track('step_skip', { look: look.id, step: steps[state.index].id }); state.index === steps.length - 1 ? finish() : show(state.index + 1); }
      else if (e.target.closest('#next-step')) { track('step_done', { look: look.id, step: steps[state.index].id }); state.index === steps.length - 1 ? finish() : show(state.index + 1); }
      else if (e.target.closest('#share-result')) {
        const total = state.seconds.reduce((a, b) => a + b, 0);
        const text = `I just did the "${look.name}" routine in ${fmtSeconds(total)} with ${CONFIG.appName}.`;
        track('share', { kind: 'result', look: look.id });
        if (navigator.share) { try { await navigator.share({ title: CONFIG.appName, text, url: shareUrl() }); } catch {} }
        else toast((await copyText(`${text} ${shareUrl()}`)) ? 'Copied to clipboard' : 'Could not copy');
      }
    });
    document.addEventListener('visibilitychange', onVis);
    function onVis() { if (document.hidden) setRunning(false); }
    show(0);

    return function unmount() {
      clearInterval(state.timer);
      document.removeEventListener('visibilitychange', onVis);
      if (!state.finished && state.seconds.some((s) => s > 0)) {
        dbAdd('runs', { lookId: look.id, startedAt: state.startedAt, finishedAt: Date.now(), completed: false, skill: prefs.skill, totalSeconds: state.seconds.reduce((a, b) => a + b, 0), steps: steps.map((s, i) => ({ id: s.id, seconds: state.seconds[i], estimatedMinutes: estByStep.get(s.id) })) });
        track('look_abandon', { look: look.id, step: steps[state.index].id });
      }
    };
  }

  return { title: `${look.name} routine`, html, mount };
}
