import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

import { games } from '../src/lib/studio.ts';

const publicDir = new URL('../public/', import.meta.url);

test('Play lists Bigger Fish, Double Putt and Ghost Thread, each linking to its own site', () => {
  assert.deepEqual(
    games.map((game) => game.url),
    ['https://biggerfish.app', 'https://doubleputt.app', '/ghost-thread'],
  );
  for (const game of games) {
    const url = new URL(game.url, 'https://brightbench.app');
    assert.equal(`${url.hostname}${url.pathname.replace(/\/$/, '')}`, game.domain, `${game.name} shows the address it links to`);
    if (game.trailerUrl) {
      assert.equal(new URL(game.trailerUrl).hostname, url.hostname, `${game.name}'s trailer is on its own site`);
    }
  }
});

test('every game picture and loop is in public/', () => {
  for (const game of games) {
    for (const path of [game.icon, game.keyArt, game.video.poster, game.video.src]) {
      assert.ok(existsSync(new URL(path.replace(/^\//, ''), publicDir)), `${game.name} is missing ${path}`);
    }
  }
});
