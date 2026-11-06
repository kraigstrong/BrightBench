import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

import { featuredProductCards, productCards } from '../src/lib/site.ts';
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

test('a game on the App Store links to its listing and says so; one that is not has no badge', () => {
  for (const game of games) {
    if (game.appStoreUrl) {
      const url = new URL(game.appStoreUrl);
      assert.equal(url.hostname, 'apps.apple.com', `${game.name}'s badge links to the App Store`);
      assert.match(url.pathname, /\/id\d+$/, `${game.name}'s App Store link ends in its app ID`);
      assert.equal(game.status, 'Live on the App Store', `${game.name} says it's on the store`);
    } else {
      assert.doesNotMatch(game.status, /App Store/, `${game.name} has no App Store link, so it doesn't claim to be there`);
    }
  }
  assert.ok(games.find((game) => game.slug === 'bigger-fish')?.appStoreUrl, 'Bigger Fish is on the App Store');
});

test('every game picture and loop is in public/', () => {
  for (const game of games) {
    for (const path of [game.icon, game.keyArt, game.video.poster, game.video.src]) {
      assert.ok(existsSync(new URL(path.replace(/^\//, ''), publicDir)), `${game.name} is missing ${path}`);
    }
  }
});

test('Learn shows every live app at work: screens in public/, each described for anyone who cannot see it', () => {
  const live = productCards.filter((app) => app.availability === 'live');
  assert.ok(live.length > 0);
  for (const app of live) {
    assert.ok(app.showcase, `${app.name} is live but has no screens on Learn`);
    for (const screen of app.showcase.screens) {
      assert.ok(existsSync(new URL(screen.src.replace(/^\//, ''), publicDir)), `${app.name} is missing ${screen.src}`);
      assert.ok(screen.alt.length > 20 && screen.caption, `${screen.src} needs a description and a caption`);
    }
  }
});

test("the Learn door has every listed app's icon and card, as Play has each game's", () => {
  assert.deepEqual(
    featuredProductCards.map((app) => app.name),
    ['Time Tutor', 'Math Reef'],
  );
  for (const app of featuredProductCards) {
    for (const path of [app.icon, app.keyArt]) {
      assert.ok(path, `${app.name} has no icon or card`);
      assert.ok(existsSync(new URL(path.replace(/^\//, ''), publicDir)), `${app.name} is missing ${path}`);
    }
  }
});
