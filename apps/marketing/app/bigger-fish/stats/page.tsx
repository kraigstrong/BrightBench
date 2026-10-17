import type { Metadata } from 'next';

import BiggerFishStats from '@/components/bigger-fish-stats';

// Kraig's view of Bigger Fish's anonymous analytics, behind the stats endpoint's access code. Kept out of search
// and the sitemap.

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Bigger Fish Stats',
};

export default function StatsPage() { return <BiggerFishStats />; }
