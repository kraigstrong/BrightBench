import assert from 'node:assert/strict';
import test from 'node:test';
import {difficultyRamp} from '../src/lib/bigger-fish-ramp.ts';
const row = (world: string, level: number, wins: number, deaths: number, mode = 'campaign') =>
  ({context: {world, mode, level}, counts: {'outcome.win': wins, 'outcome.death': deaths, 'outcome.quit': 7}});
test('ramp pools builds per world and level, keeps world order, and fills level gaps', () => {
  const ramp = difficultyRamp([row('shallow-reef', 1, 8, 2), row('shallow-reef', 1, 1, 1), row('shallow-reef', 3, 1, 3),
    row('jelly-bloom', 2, 0, 4), row('jelly-bloom', 1, 2, 0, 'endless'), {context: null, counts: {'outcome.win': 1}}]);
  assert.deepEqual(ramp.map(w => w.world), ['shallow-reef', 'jelly-bloom']);
  assert.deepEqual(ramp[0]!.levels, [{level: 1, wins: 9, deaths: 3, rate: .75}, {level: 2, wins: 0, deaths: 0, rate: null}, {level: 3, wins: 1, deaths: 3, rate: .25}]);
  assert.deepEqual(ramp[1]!.levels.map(l => l.rate), [null, 0]);
});
