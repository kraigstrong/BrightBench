import assert from 'node:assert/strict';
import test from 'node:test';

import { getProductPageBySlug, getPublicSiteOrigin, productCards } from '../src/lib/site.ts';

test('marketing content keeps one live Time Tutor card with an App Store URL', () => {
  const liveCards = productCards.filter((card) => card.availability === 'live');

  assert.equal(liveCards.length, 1);
  assert.equal(liveCards[0]?.name, 'Time Tutor');
  assert.match(liveCards[0]?.appStoreUrl ?? '', /^https:\/\/apps\.apple\.com\//);
});

test('canonical origin has a safe absolute fallback', () => {
  assert.match(getPublicSiteOrigin(), /^https?:\/\//);
});

test('Math Reef has a card and a product page linking to its help and privacy pages', () => {
  const card = productCards.find((product) => product.name === 'Math Reef');
  assert.equal(card?.href, '/products/math-reef');
  const page = getProductPageBySlug('math-reef');
  assert.equal(page?.kind, 'app');
  const links = page?.relatedLinks.map((link) => link.href) ?? [];
  assert.ok(links.includes('/math-reef/support') && links.includes('/math-reef/privacy'));
});

test('every home-page card links to a product page that exists', () => {
  for (const card of productCards) {
    const slug = card.href.replace(/^\/products\//, '');
    assert.ok(getProductPageBySlug(slug), `${card.name} links to missing ${card.href}`);
  }
});

test('Math Reef page copy never falls back to Time Tutor wording', () => {
  const page = getProductPageBySlug('math-reef');
  assert.equal(page?.kind, 'app');
  if (page?.kind !== 'app') return;
  assert.equal(page.heroEyebrow, 'Math Reef');
  assert.doesNotMatch(JSON.stringify(page), /Time Tutor|clock/i);
});
