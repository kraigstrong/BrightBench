import type { MetadataRoute } from 'next';

import {
  getPublicSiteOrigin,
  learnPages,
  productPages,
} from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicSiteOrigin();
  const now = new Date();

  const staticPaths = ['/', '/support', '/privacy', '/learn'];

  const productPaths = productPages
    .filter((page) => page.kind === 'app')
    .map((page) => `/products/${page.slug}`);

  const learnPaths = learnPages.map((page) => `/learn/${page.slug}`);

  const allPaths = [...staticPaths, ...productPaths, ...learnPaths];

  return allPaths.map((path) => ({
    lastModified: now,
    url: `${base}${path === '/' ? '' : path}`,
  }));
}
