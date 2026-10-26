import type { Metadata } from 'next';

import { StatsViewer } from '@/components/stats-viewer';
import { parseStatsGame } from '@/lib/stats-games';

// Kraig's view of every game's anonymous analytics, a tab per game. Everything on it comes from the
// stats endpoints, which need the stats key, so the page itself is only a form. `?game=` picks the
// tab it opens on. Kept out of search and the sitemap.

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Stats',
};

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { game } = await searchParams;
  return <StatsViewer initialGame={parseStatsGame(game)} />;
}
