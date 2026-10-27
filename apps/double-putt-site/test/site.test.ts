import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import test from 'node:test';

import { beats, courses, faqs, game, productionOrigin, siteOrigin, storeCta } from '../src/lib/site.ts';

const publicFile = (path: string) => new URL(`../public${path}`, import.meta.url);

test('the canonical origin is the configured one, then doubleputt.app in production, then the preview URL', () => {
  assert.equal(siteOrigin({ siteOrigin: 'https://example.com/' }), 'https://example.com');
  assert.equal(siteOrigin({ vercelEnv: 'production', vercelUrl: 'double-putt.vercel.app' }), productionOrigin);
  assert.equal(siteOrigin({ vercelEnv: 'preview', vercelUrl: 'double-putt-abc.vercel.app' }), 'https://double-putt-abc.vercel.app');
  assert.equal(siteOrigin({}), 'http://localhost:3000');
});

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
    ...['hero.mp4', 'hero-poster.jpg', 'trailer.mp4', 'trailer-poster.jpg', 'og.png', 'icon-1024.png'].map((f) => `/${f}`),
    ...courses.flatMap((course) => [`/courses/${course.slug}.mp4`, `/courses/${course.slug}-poster.jpg`]),
    ...beats.map((beat) => beat.image),
  ];
  for (const file of files) assert.ok(existsSync(publicFile(file)), `missing public${file}`);
});

test('support says what is free, what All Courses opens, and where to restore it; no beta questions', () => {
  const copy = JSON.stringify(faqs);
  assert.match(copy, /all of Daybreak, plus one hole from every other course/);
  assert.match(copy, /All Courses for \$4\.99, opens all 81 holes, and every course added later/);
  assert.match(copy, /Settings, then Restore Purchase\./);
  assert.match(copy, /Family Sharing/);
  assert.doesNotMatch(copy, /beta|TestFlight/i);
});

test("the site's words follow the game's: a hole is two greens, never a pair, never A and B", () => {
  const copy = JSON.stringify({ beats, courses, faqs, game });
  assert.doesNotMatch(copy, /\bpairs?\b/i);
  assert.doesNotMatch(copy, /\b(hole|green) [AB]\b/);
});
