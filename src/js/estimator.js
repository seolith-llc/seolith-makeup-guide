// Time estimation. Base minutes come from the step library; after the user has timed a few
// runs, the estimate is scaled by their measured pace per step (bounded so one slow run
// cannot distort it).

import { STEPS } from '../data/steps.js';
import { LOOKS } from '../data/looks.js';

export function lookSteps(look, { includeOptional = true, excluded = new Set() } = {}) {
  return look.steps
    .filter((s) => (includeOptional || !s.optional) && !excluded.has(s.step))
    .map((s) => ({ ...STEPS[s.step], minutes: s.minutes || STEPS[s.step].minutes, note: s.note || null, optional: !!s.optional }));
}

export function baseMinutes(step, skill) {
  return step.minutes[skill] ?? step.minutes.intermediate;
}

// Build a per-step pace factor map from completed runs. Factor 1 = matches the estimate.
export function paceModel(runs) {
  const perStep = new Map();
  let completedRuns = 0;
  for (const run of runs || []) {
    if (!run.completed || !Array.isArray(run.steps)) continue;
    completedRuns++;
    for (const s of run.steps) {
      if (!s.seconds || !s.estimatedMinutes) continue;
      const ratio = s.seconds / 60 / s.estimatedMinutes;
      if (!isFinite(ratio) || ratio <= 0) continue;
      if (!perStep.has(s.id)) perStep.set(s.id, []);
      perStep.get(s.id).push(Math.min(4, Math.max(0.25, ratio)));
    }
  }
  const factors = new Map();
  let all = [];
  for (const [id, ratios] of perStep) {
    const avg = ratios.reduce((a, b) => a + b, 0) / ratios.length;
    factors.set(id, { factor: avg, samples: ratios.length });
    all = all.concat(ratios);
  }
  const overall = all.length ? all.reduce((a, b) => a + b, 0) / all.length : 1;
  // `samples` is the number of completed timed runs; personalisation needs at least 3.
  return { factors, overall, samples: completedRuns, stepSamples: all.length };
}

export function estimate(look, skill, { includeOptional = true, excluded = new Set(), pace = null } = {}) {
  const steps = lookSteps(look, { includeOptional, excluded });
  const rows = steps.map((s) => {
    const base = baseMinutes(s, skill);
    let factor = 1;
    if (pace && pace.samples >= 3) {
      const f = pace.factors.get(s.id);
      factor = f && f.samples >= 2 ? f.factor : pace.overall;
    }
    return { id: s.id, title: s.title, area: s.area, base, minutes: base * factor, optional: s.optional, personalised: factor !== 1 };
  });
  const total = rows.reduce((a, r) => a + r.minutes, 0);
  const baseTotal = rows.reduce((a, r) => a + r.base, 0);
  return { rows, total, baseTotal, personalised: rows.some((r) => r.personalised) };
}

export function looksThatFit(minutes, skill, pace = null) {
  return LOOKS.map((look) => {
    const full = estimate(look, skill, { pace });
    const trimmed = estimate(look, skill, { includeOptional: false, pace });
    return { look, full: full.total, trimmed: trimmed.total, fits: full.total <= minutes, fitsTrimmed: trimmed.total <= minutes };
  }).sort((a, b) => b.full - a.full);
}
