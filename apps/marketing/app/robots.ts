import type { MetadataRoute } from 'next';

import { getPublicSiteOrigin } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = getPublicSiteOrigin();

  return {
    rules: {
      allow: '/',
      disallow: ['/api/', '/math-reef/stats'],
      userAgent: '*',
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
