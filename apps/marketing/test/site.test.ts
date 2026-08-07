import assert from 'node:assert/strict';
import test from 'node:test';

import { getPublicSiteOrigin, productCards } from '../src/lib/site.ts';

test('marketing content keeps one live Time Tutor card with an App Store URL', () => {
  const liveCards = productCards.filter((card) => card.availability === 'live');

  assert.equal(liveCards.length, 1);
  assert.equal(liveCards[0]?.name, 'Time Tutor');
  assert.match(liveCards[0]?.appStoreUrl ?? '', /^https:\/\/apps\.apple\.com\//);
});

test('canonical origin has a safe absolute fallback', () => {
  assert.match(getPublicSiteOrigin(), /^https?:\/\//);
});
