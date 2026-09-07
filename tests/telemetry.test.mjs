import { test } from 'node:test';
import assert from 'node:assert/strict';
import { aggregate, minuteBucket } from '../src/js/telemetry.js';

test('minute buckets are coarse', () => {
  assert.equal(minuteBucket(3), '<5');
  assert.equal(minuteBucket(12), '10-20');
  assert.equal(minuteBucket(75), '60+');
});

test('aggregate counts sessions, installs, completion rate and daily sessions', () => {
  const ev = (n, p, s, i, d) => ({ n, p, s, i, h: `${d}T09`, d, o: 'portrait' });
  const events = [
    ev('app_open', { skill: 'beginner' }, 's1', 'i1', '2026-09-01'),
    ev('page_view', { page: '/looks' }, 's1', 'i1', '2026-09-01'),
    ev('look_start', { look: 'everyday' }, 's1', 'i1', '2026-09-01'),
    ev('look_complete', { look: 'everyday', bucket: '20-30' }, 's1', 'i1', '2026-09-01'),
    ev('look_start', { look: 'everyday' }, 's2', 'i2', '2026-09-02'),
    ev('page_view', { page: '/looks' }, 's2', 'i2', '2026-09-02'),
    ev('page_view', { page: '/products' }, 's3', 'i2', '2026-09-02'),
  ];
  const a = aggregate(events);
  assert.equal(a.total, 7);
  assert.equal(a.sessions, 3);
  assert.equal(a.installs, 2);
  assert.equal(a.activeDays, 2);
  assert.equal(a.completionRate, 0.5);
  assert.deepEqual(a.pages[0], ['/looks', 2]);
  assert.deepEqual(a.daily, [{ day: '2026-09-01', sessions: 1 }, { day: '2026-09-02', sessions: 2 }]);
});
