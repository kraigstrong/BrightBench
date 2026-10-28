import { readFileSync } from 'fs';
import path from 'path';

import { getWebHead, SITE_URL } from '@/lib/web-head';

const sitemap = readFileSync(path.join(__dirname, '../../../public/sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);

function withoutTrailingSlash(url: string) {
  return url.replace(/\/+$/, '');
}

describe('getWebHead', () => {
  it('gives every sitemap page a canonical pointing at itself', () => {
    expect(sitemapUrls.length).toBeGreaterThan(0);

    for (const url of sitemapUrls) {
      const head = getWebHead(new URL(url).pathname);
      expect(withoutTrailingSlash(head.canonical)).toBe(withoutTrailingSlash(url));
    }
  });

  it('gives every sitemap page its own title and description', () => {
    const heads = sitemapUrls.map((url) => getWebHead(new URL(url).pathname));

    expect(new Set(heads.map((head) => head.title)).size).toBe(heads.length);
    expect(new Set(heads.map((head) => head.description)).size).toBe(heads.length);
  });

  it('matches the exported directory form of a page', () => {
    expect(getWebHead('/privacy/').canonical).toBe(`${SITE_URL}/privacy`);
  });

  it('falls back to the homepage tags for in-app routes', () => {
    expect(getWebHead('/practice/analog-read').canonical).toBe(SITE_URL);
  });
});
