import type { MetadataRoute } from 'next';

import { getPublicSiteOrigin } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  const base = getPublicSiteOrigin();

  return {
    rules: {
      allow: '/',
      userAgent: '*',
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
