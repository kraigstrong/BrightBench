import assert from 'node:assert/strict';
import test from 'node:test';
import {difficultyRamp} from '../src/lib/bigger-fish-ramp.ts';
const row = (world: string, level: number, wins: number, deaths: number, mode = 'campaign', tries: Record<string, number> = {}) =>
  ({context: {world, mode, level}, counts: {'outcome.win': wins, 'outcome.death': deaths, 'outcome.quit': 7,
    'milestone.level_started': wins + deaths, 'milestone.level_cleared': wins, ...tries}});
test('ramp pools builds per world and level, keeps world order, and fills level gaps', () => {
  const ramp = difficultyRamp([row('shallow-reef', 1, 8, 2), row('shallow-reef', 1, 1, 1), row('shallow-reef', 3, 1, 3),
    row('jelly-bloom', 2, 0, 4), row('jelly-bloom', 1, 2, 0, 'endless'), {context: null, counts: {'outcome.win': 1}}]);
  assert.deepEqual(ramp.map(w => w.world), ['shallow-reef', 'jelly-bloom']);
  assert.deepEqual(ramp[0]!.levels.map(({level, wins, deaths, rate, started, cleared}) => ({level, wins, deaths, rate, started, cleared})),
    [{level: 1, wins: 9, deaths: 3, rate: .75, started: 12, cleared: 9},
     {level: 2, wins: 0, deaths: 0, rate: null, started: 0, cleared: 0}, {level: 3, wins: 1, deaths: 3, rate: .25, started: 4, cleared: 1}]);
  assert.deepEqual(ramp[1]!.levels.map(l => l.rate), [null, 0]);
});
test('tries to a first clear group the game\'s buckets and find the median group', () => {
  const ramp = difficultyRamp([row('shallow-reef', 1, 0, 0, 'campaign', {'attempt.1': 2, 'attempt.5': 3, 'attempt.50': 1}),
    row('shallow-reef', 1, 0, 0, 'campaign', {'attempt.10': 1, 'attempt.20': 2, 'attempt.1000': 1}), row('shallow-reef', 2, 0, 0)]);
  const [one, two] = ramp[0]!.levels;
  assert.deepEqual(one!.tries, [2, 0, 0, 3, 1, 2, 2]);
  assert.equal(one!.firstClears, 10); assert.equal(one!.medianTries, '4–5');
  assert.equal(two!.firstClears, 0); assert.equal(two!.medianTries, null);
});
