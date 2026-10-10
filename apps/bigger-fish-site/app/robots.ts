import type { MetadataRoute } from 'next';

import { siteOrigin } from '@/lib/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { allow: '/', userAgent: '*' },
    sitemap: `${siteOrigin()}/sitemap.xml`,
  };
}
