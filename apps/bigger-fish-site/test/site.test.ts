import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

import { buildPressKit, factSheet } from '../scripts/build-press-kit.ts';
import { createZip, zipEntryNames } from '../scripts/zip.ts';
import { beats, facts, game, totalLevels, worlds } from '../src/lib/game.ts';
import { pressKitFiles, zipPath } from '../src/lib/press-assets.ts';
import { appStoreId, contactEmail, productionOrigin, siteOrigin, storeCta } from '../src/lib/site.ts';

const publicDir = join(import.meta.dirname, '..', 'public');

test('the canonical origin is the configured one, then biggerfish.app in production, then the preview URL', () => {
  assert.equal(siteOrigin({ siteOrigin: 'https://example.com/' }), 'https://example.com');
  assert.equal(siteOrigin({ vercelEnv: 'production', vercelUrl: 'bigger-fish.vercel.app' }), productionOrigin);
  assert.equal(siteOrigin({ vercelEnv: 'preview', vercelUrl: 'bigger-fish-abc.vercel.app' }), 'https://bigger-fish-abc.vercel.app');
  assert.equal(siteOrigin({}), 'http://localhost:3000');
});

test('before launch it says coming soon, offering the beta only for a real https link', () => {
  assert.deepEqual(storeCta({}), { betaHref: undefined, kind: 'comingSoon' });
  assert.deepEqual(storeCta({ testFlightUrl: 'https://testflight.apple.com/join/abc' }), {
    betaHref: 'https://testflight.apple.com/join/abc',
    kind: 'comingSoon',
  });
  assert.deepEqual(storeCta({ testFlightUrl: 'javascript:alert(1)' }), { betaHref: undefined, kind: 'comingSoon' });
});

test("Apple's badge appears only once there's an App Store link, and a pre-order gets a plain link", () => {
  const url = 'https://apps.apple.com/app/bigger-fish/id123456789';
  assert.equal(storeCta({ appStoreUrl: url }).kind, 'download');
  assert.equal(storeCta({ appStoreUrl: url, preorder: 'true' }).kind, 'preorder');
  assert.equal(storeCta({ appStoreUrl: 'http://apps.apple.com/x' }).kind, 'comingSoon');
});

test('the Smart App Banner takes only a numeric App Store ID, and contact falls back to the support inbox', () => {
  assert.equal(appStoreId({ appStoreId: '123456789' }), '123456789');
  assert.equal(appStoreId({ appStoreId: 'id123' }), undefined);
  assert.equal(contactEmail({}), 'support@brightbench.app');
  assert.equal(contactEmail({ contactEmail: 'press@biggerfish.app' }), 'press@biggerfish.app');
  assert.equal(contactEmail({ contactEmail: 'not an email' }), 'support@brightbench.app');
});

test('the facts match the game: four worlds of ten levels and a five-level Deep End', () => {
  assert.equal(totalLevels, 60);
  assert.deepEqual(
    worlds.map((world) => world.name),
    ['Shallow Reef', 'Jelly Bloom', 'Kelp Forest', 'Midnight Zone'],
  );
  assert.ok(facts.some((fact) => fact.value.includes(`${totalLevels} across 4 worlds`)));
  // Apple asks marketing to say "iPhone", not "iOS", except for system requirements.
  assert.ok(!game.pitch.includes('iOS') && !game.oneLiner.includes('iOS'));
});

test('every image and video the pages use is in public/', () => {
  const files = [
    'media/hero.mp4',
    'media/hero-poster.jpg',
    'media/trailer-poster.jpg',
    ...beats.map((beat) => beat.image.slice(1)),
    ...worlds.flatMap((world) => [
      world.screenshot.slice(1),
      `media/worlds/${world.slug}.mp4`,
      `media/worlds/${world.slug}-poster.jpg`,
    ]),
    ...pressKitFiles.flatMap((asset) => [asset.file, ...(asset.poster ? [asset.poster.slice(1)] : [])]),
  ];
  for (const file of files) assert.ok(existsSync(join(publicDir, file)), `missing public/${file}`);
});

test('the press kit zip holds the fact sheet and every asset, under tidy folders', () => {
  const names = zipEntryNames(buildPressKit());
  assert.equal(names[0], 'Bigger Fish press kit/Fact sheet.txt');
  assert.deepEqual(names.slice(1), pressKitFiles.map(zipPath));
  assert.equal(new Set(names).size, names.length);
  assert.match(factSheet(), /Press contact: \S+@\S+/);
});

test('the zip writer round-trips names and is the same every time', () => {
  const entries = [
    { data: new TextEncoder().encode('hello'), name: 'a/hello.txt' },
    { data: new Uint8Array([0, 1, 2, 255]), name: 'b/bytes.bin' },
  ];
  const zip = createZip(entries);
  assert.deepEqual(zipEntryNames(zip), ['a/hello.txt', 'b/bytes.bin']);
  assert.ok(createZip(entries).equals(zip));
});
