import assert from 'node:assert/strict';
import test from 'node:test';

import { getProductPageBySlug, getPublicSiteOrigin, productCards } from '../src/lib/site.ts';

test('Time Tutor and Math Reef are live, each card and page leading to its App Store listing', () => {
  const liveCards = productCards.filter((card) => card.availability === 'live');

  assert.deepEqual(
    liveCards.map((card) => card.name),
    ['Time Tutor', 'Math Reef'],
  );
  for (const card of liveCards) {
    assert.match(card.appStoreUrl ?? '', /^https:\/\/apps\.apple\.com\//);
    const page = getProductPageBySlug(card.href.replace(/^\/products\//, ''));
    assert.equal(page?.primaryCta.href, card.appStoreUrl, `${card.name}'s page leads with its App Store link`);
    assert.equal(page?.primaryCta.external, true);
  }
  assert.match(liveCards[1]?.appStoreUrl ?? '', /\/id6817532623$/);
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
