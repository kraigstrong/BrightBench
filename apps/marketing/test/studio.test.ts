import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

import { games } from '../src/lib/studio.ts';

const publicDir = new URL('../public/', import.meta.url);

test('Play lists Bigger Fish and Double Putt, each linking to its own site', () => {
  assert.deepEqual(
    games.map((game) => game.url),
    ['https://biggerfish.app', 'https://doubleputt.app'],
  );
  for (const game of games) {
    assert.equal(new URL(game.url).hostname, game.domain, `${game.name} shows the address it links to`);
    assert.equal(new URL(game.trailerUrl).hostname, game.domain, `${game.name}'s trailer is on its own site`);
  }
});

test('every game picture and loop is in public/', () => {
  for (const game of games) {
    for (const path of [game.icon, game.keyArt, game.video.poster, game.video.src]) {
      assert.ok(existsSync(new URL(path.replace(/^\//, ''), publicDir)), `${game.name} is missing ${path}`);
    }
  }
});
