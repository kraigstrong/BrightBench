import assert from 'node:assert/strict';
import test from 'node:test';

import nextConfig from '../next.config.ts';
import { defaultStatsGame, parseStatsGame, statsGames } from '../src/lib/stats-games.ts';

test('every game has a tab of its own, Bigger Fish first', () => {
  assert.deepEqual(
    statsGames.map((game) => game.id),
    ['bigger-fish', 'double-putt', 'math-reef'],
  );
  assert.equal(new Set(statsGames.map((game) => game.name)).size, statsGames.length);
  assert.equal(defaultStatsGame, 'bigger-fish');
});

test('?game= opens that tab, and anything else opens the default', () => {
  for (const game of statsGames) assert.equal(parseStatsGame(game.id), game.id);
  for (const value of [undefined, null, '', 'tetris', 'Math-Reef', ' math-reef', 'doubleputt', ['math-reef', 'double-putt']]) {
    assert.equal(parseStatsGame(value), defaultStatsGame, JSON.stringify(value));
  }
});

test('the old stats pages redirect to their tab, not permanently', async () => {
  const redirects = (await nextConfig.redirects?.()) ?? [];
  const old: Record<string, string> = {
    '/bigger-fish/stats': 'bigger-fish',
    '/doubleputt/stats': 'double-putt',
    '/math-reef/stats': 'math-reef',
  };
  for (const [source, game] of Object.entries(old)) {
    const rule = redirects.find((r) => r.source === source);
    assert.ok(rule, `${source} redirects`);
    assert.deepEqual({ destination: rule.destination, permanent: rule.permanent }, { destination: `/stats?game=${game}`, permanent: false });
    assert.equal(parseStatsGame(new URL(rule.destination, 'https://brightbench.app').searchParams.get('game')), game);
  }
});
