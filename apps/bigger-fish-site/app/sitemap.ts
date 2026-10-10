import type { MetadataRoute } from 'next';

import { siteOrigin } from '@/lib/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = siteOrigin();
  return [
    { changeFrequency: 'weekly', priority: 1, url: `${origin}/` },
    { changeFrequency: 'monthly', priority: 0.8, url: `${origin}/press` },
    { changeFrequency: 'monthly', priority: 0.5, url: `${origin}/support` },
    { changeFrequency: 'yearly', priority: 0.3, url: `${origin}/privacy` },
  ];
}
