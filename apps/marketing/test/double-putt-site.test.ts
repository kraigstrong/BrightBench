import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

import { base, beats, courses, faqs, game, storeCta } from '../src/lib/double-putt-site.ts';

const publicFile = (path: string) => new URL(`../public${path}`, import.meta.url);

test('the button: coming soon, then the beta with a link, then the App Store', () => {
  assert.deepEqual(storeCta({}), { betaHref: undefined, kind: 'comingSoon' });
  assert.deepEqual(storeCta({ testFlightUrl: 'https://testflight.apple.com/join/abc' }), {
    betaHref: 'https://testflight.apple.com/join/abc',
    kind: 'comingSoon',
  });
  assert.deepEqual(storeCta({ appStoreUrl: ' https://apps.apple.com/app/id1 ', testFlightUrl: 'https://testflight.apple.com/join/abc' }), {
    href: 'https://apps.apple.com/app/id1',
    kind: 'download',
    label: 'Download on the App Store',
  });
  // Only https links: anything else is treated as not set.
  assert.deepEqual(storeCta({ appStoreUrl: 'http://apps.apple.com/app/id1', testFlightUrl: 'javascript:alert(1)' }), {
    betaHref: undefined,
    kind: 'comingSoon',
  });
});

test('every course, still and loop the page shows is there (Tools/capture/site.sh in kraigstrong/double-putt)', () => {
  assert.equal(courses.length, game.courseCount);
  assert.equal(new Set(courses.map((course) => course.slug)).size, courses.length);
  const files = [
    ...['hero.mp4', 'hero-poster.jpg', 'trailer.mp4', 'trailer-poster.jpg', 'og.png', 'icon-1024.png'].map((f) => `${base}/${f}`),
    ...courses.flatMap((course) => [`${base}/courses/${course.slug}.mp4`, `${base}/courses/${course.slug}-poster.jpg`]),
    ...beats.map((beat) => beat.image),
  ];
  for (const file of files) assert.ok(existsSync(publicFile(file)), `missing public${file}`);
});

test("the site's words follow the game's: a hole is two greens, never a pair, never A and B", () => {
  const copy = JSON.stringify({ beats, courses, faqs, game });
  assert.doesNotMatch(copy, /\bpairs?\b/i);
  assert.doesNotMatch(copy, /\b(hole|green) [AB]\b/);
});
