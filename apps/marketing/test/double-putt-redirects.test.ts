import assert from 'node:assert/strict';
import test from 'node:test';

import { getPathMatch } from 'next/dist/shared/lib/router/utils/path-match.js';

import nextConfig from '../next.config.ts';

const redirects = (await nextConfig.redirects?.()) ?? [];

/** Where Next.js sends a request for `path`: the first rule that matches, with its parameters filled in. */
function redirectFor(path: string): string | undefined {
  for (const rule of redirects) {
    const params = getPathMatch(rule.source)(path);
    if (params) return rule.destination.replace(/:(\w+)\*?/g, (_, name: string) => [params[name] ?? []].flat().join('/'));
  }
  return undefined;
}

test("Double Putt's old pages and media go to doubleputt.app", () => {
  assert.equal(redirectFor('/doubleputt'), 'https://doubleputt.app');
  assert.equal(redirectFor('/doubleputt/support'), 'https://doubleputt.app/support');
  assert.equal(redirectFor('/doubleputt/privacy'), 'https://doubleputt.app/privacy');
  assert.equal(redirectFor('/doubleputt/og.png'), 'https://doubleputt.app/og.png');
  assert.equal(redirectFor('/doubleputt/courses/links.mp4'), 'https://doubleputt.app/courses/links.mp4');
  // The addresses from before /doubleputt, which builds already out still link to.
  assert.equal(redirectFor('/double-putt'), 'https://doubleputt.app/');
  assert.equal(redirectFor('/double-putt/privacy'), 'https://doubleputt.app/privacy');
  assert.equal(redirectFor('/double-putt/support'), 'https://doubleputt.app/support');
});

test('the stats report and the analytics endpoint stay on brightbench.app', () => {
  // The report is the Double Putt tab of the stats viewer.
  assert.equal(redirectFor('/doubleputt/stats'), '/stats?game=double-putt');
  assert.equal(redirectFor('/double-putt/stats'), '/stats?game=double-putt');
  assert.equal(redirectFor('/api/double-putt/events'), undefined);
  assert.equal(redirectFor('/api/double-putt/stats'), undefined);
  assert.equal(redirectFor('/'), undefined);
});
