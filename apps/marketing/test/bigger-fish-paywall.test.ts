import assert from 'node:assert/strict';
import test from 'node:test';
import {paywallFunnel} from '../src/lib/bigger-fish-paywall.ts';
const level = (world: string, counts: Record<string, number>, mode = 'campaign') => ({context: {world, mode}, counts});
test('funnel pools offers, purchases and restores across builds, by where the unlock\'s screen opened', () => {
  const funnel = paywallFunnel([
    {context: null, counts: {'offer.shown.padlocked_level': 5, 'offer.first.padlocked_level': 3, 'purchase.cancelled.padlocked_level': 2, 'milestone.first_launch': 9}},
    {context: null, counts: {'offer.shown.padlocked_level': 1, 'purchase.unlocked.conquered': 1, 'restore.not_found.settings': 2}},
  ]);
  const by = Object.fromEntries(funnel.sources.map(s => [s.source, s]));
  assert.deepEqual(funnel.sources.map(s => s.source), ['padlocked_level', 'next_level', 'unlock_all', 'locked_world', 'conquered', 'settings']);
  assert.equal(by.padlocked_level!.shown, 6); assert.equal(by.padlocked_level!.first, 3);
  assert.equal(by.padlocked_level!.purchases.cancelled, 2); assert.equal(by.conquered!.purchases.unlocked, 1);
  assert.equal(by.settings!.restores.not_found, 2); assert.equal(by.next_level!.shown, 0);
});
test('conquests and runs with and without the unlock add up per world, campaign only', () => {
  const funnel = paywallFunnel([
    level('shallow-reef', {'milestone.world_conquered': 2, 'free.win': 3, 'free.death': 1, 'free.quit': 2, 'unlocked.win': 1}),
    level('shallow-reef', {'milestone.world_conquered': 1, 'unlocked.death': 1}),
    level('jelly-bloom', {'free.death': 4}),
    level('jelly-bloom', {'milestone.world_conquered': 5, 'unlocked.win': 9}, 'endless'),
  ]);
  assert.deepEqual(funnel.conquered, [{world: 'shallow-reef', installs: 3}, {world: 'jelly-bloom', installs: 0}]);
  assert.deepEqual(funnel.runs[0], {world: 'shallow-reef', free: {runs: 6, wins: 3, deaths: 1, rate: .75}, unlocked: {runs: 2, wins: 1, deaths: 1, rate: .5}});
  assert.deepEqual(funnel.runs[1], {world: 'jelly-bloom', free: {runs: 4, wins: 0, deaths: 4, rate: 0}, unlocked: {runs: 0, wins: 0, deaths: 0, rate: null}});
});
