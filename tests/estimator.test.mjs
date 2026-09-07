import { test } from 'node:test';
import assert from 'node:assert/strict';
import { estimate, paceModel, looksThatFit, lookSteps } from '../src/js/estimator.js';
import { LOOKS, getLook } from '../src/data/looks.js';
import { STEPS } from '../src/data/steps.js';

test('every look step exists in the step library', () => {
  for (const look of LOOKS) for (const s of look.steps) assert.ok(STEPS[s.step], `${look.id} references unknown step ${s.step}`);
});

test('beginner estimates are slower than advanced for every look', () => {
  for (const look of LOOKS) {
    const b = estimate(look, 'beginner').total;
    const a = estimate(look, 'advanced').total;
    assert.ok(b > a, `${look.id}: beginner ${b} should exceed advanced ${a}`);
  }
});

test('five-minute face is under 10 minutes for intermediate and full glam over 45 for beginners', () => {
  assert.ok(estimate(getLook('five-minute'), 'intermediate').total <= 10);
  assert.ok(estimate(getLook('full-glam'), 'beginner').total >= 45);
});

test('optional steps can be excluded', () => {
  const look = getLook('everyday');
  const all = lookSteps(look).length;
  const essential = lookSteps(look, { includeOptional: false }).length;
  assert.ok(essential < all);
  assert.ok(estimate(look, 'beginner', { includeOptional: false }).total < estimate(look, 'beginner').total);
});

test('pace model needs three completed runs and is bounded', () => {
  const runs = [
    { completed: true, steps: [{ id: 'foundation', seconds: 600, estimatedMinutes: 5 }, { id: 'blush', seconds: 30, estimatedMinutes: 2 }] },
    { completed: true, steps: [{ id: 'foundation', seconds: 900, estimatedMinutes: 5 }] },
    { completed: false, steps: [{ id: 'foundation', seconds: 900, estimatedMinutes: 5 }] },
  ];
  const p1 = paceModel(runs);
  assert.equal(p1.samples, 2, 'abandoned runs do not count');
  const est1 = estimate(getLook('everyday'), 'beginner', { pace: p1 });
  assert.equal(est1.personalised, false, 'not personalised below 3 runs');
  runs.push({ completed: true, steps: [{ id: 'foundation', seconds: 1500, estimatedMinutes: 5 }] });
  const p2 = paceModel(runs);
  assert.equal(p2.samples, 3);
  const f = p2.factors.get('foundation');
  assert.ok(f.factor >= 2 && f.factor <= 4, 'ratio is capped between 0.25 and 4');
  const est2 = estimate(getLook('everyday'), 'beginner', { pace: p2 });
  assert.ok(est2.personalised);
  assert.ok(est2.rows.find((r) => r.id === 'foundation').minutes > 5);
});

test('looksThatFit marks the five-minute face as fitting in 15 minutes for a beginner', () => {
  const rows = looksThatFit(15, 'beginner');
  const five = rows.find((r) => r.look.id === 'five-minute');
  assert.ok(five.fits);
  const glam = rows.find((r) => r.look.id === 'full-glam');
  assert.equal(glam.fits, false);
});
