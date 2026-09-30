import assert from 'node:assert/strict';
import test from 'node:test';

import { summarize } from '../src/lib/math-reef-dashboard.ts';
import { levelIds } from '../src/lib/math-reef-ids.ts';

const empty = { milestones: {}, rounds: {} };

test('an empty response gives zeroed worlds with every level in curriculum order', () => {
  const dashboard = summarize(empty);
  assert.equal(dashboard.installs, 0);
  assert.equal(dashboard.rounds, 0);
  assert.deepEqual(dashboard.worlds.map((world) => world.world), ['addition', 'subtraction', 'multiplication', 'division', 'exponents']);
  assert.deepEqual(dashboard.worlds.flatMap((world) => world.levels.map((row) => row.level)), [...levelIds]);
  const first = dashboard.worlds[0]!.levels[0]!;
  assert.equal(first.passRate, null);
  assert.equal(first.averageStars, null);
  assert.deepEqual(first.stopPoints, []);
});

test('milestones become installs, funnels, pass rates, and crowns', () => {
  const dashboard = summarize({
    milestones: {
      first_launch: 10,
      first_round: 8,
      'level_started:add.make10': 8,
      'level_passed:add.make10': 6,
      'level_started:add.doubles': 5,
      'crown:addition:silver': 2,
      'crown:addition:gold': 1,
    },
    rounds: {},
  });
  assert.equal(dashboard.installs, 10);
  assert.equal(dashboard.firstRounds, 8);
  const addition = dashboard.worlds[0]!;
  assert.equal(addition.silver, 2);
  assert.equal(addition.gold, 1);
  const make10 = addition.levels.find((row) => row.level === 'add.make10')!;
  assert.equal(make10.started, 8);
  assert.equal(make10.passed, 6);
  assert.equal(make10.passRate, 0.75);
  const doubles = addition.levels.find((row) => row.level === 'add.doubles')!;
  assert.equal(doubles.passRate, 0);
});

test('rounds become outcome counts, average stars, and stopping points', () => {
  const dashboard = summarize({
    milestones: {},
    rounds: {
      'mul.x7|finished|13|13|3': 2,
      'mul.x7|finished|13|13|1': 1,
      'mul.x7|quit|4|13|-': 3,
      'mul.x7|abandoned|4|13|-': 1,
      'mul.x7|quit|9|13|-': 2,
      'mul.x7|quit|0|13|-': 1,
      'mul.x7|abandoned|11|13|-': 1,
    },
  });
  assert.equal(dashboard.rounds, 11);
  const x7 = dashboard.worlds[2]!.levels.find((row) => row.level === 'mul.x7')!;
  assert.equal(x7.finished, 3);
  assert.equal(x7.quit, 6);
  assert.equal(x7.abandoned, 2);
  assert.equal(x7.averageStars, 7 / 3);
  // Quit and abandoned combine; ties go to the earlier point; at most three.
  assert.deepEqual(x7.stopPoints, [
    { correct: 4, target: 13, count: 4 },
    { correct: 9, target: 13, count: 2 },
    { correct: 0, target: 13, count: 1 },
  ]);
});

test('rounds for a level with no milestones still show, and odd fields are skipped', () => {
  const dashboard = summarize({ milestones: {}, rounds: { 'exp.2|quit|3|12|-': 1, garbage: 5 } });
  const exp2 = dashboard.worlds[4]!.levels.find((row) => row.level === 'exp.2')!;
  assert.equal(exp2.quit, 1);
  assert.equal(exp2.passRate, null);
  assert.equal(dashboard.rounds, 1);
});
