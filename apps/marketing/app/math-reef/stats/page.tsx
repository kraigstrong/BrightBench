import type { Metadata } from 'next';
import { spacing } from '@education/design';

import { MathReefStatsDashboard } from '@/components/math-reef-stats-dashboard';

// Kraig's view of Math Reef's anonymous analytics. Everything on it comes from the stats endpoint,
// which needs the access code, so the page itself is only a form. Kept out of search and the sitemap.

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: 'Math Reef Stats',
};

export default function MathReefStatsPage() {
  return (
    <main style={{ margin: '0 auto', maxWidth: 1080, paddingTop: spacing.xl }}>
      <MathReefStatsDashboard />
    </main>
  );
}
