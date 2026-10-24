import type { Metadata } from 'next';
import DoublePuttStats from '@/components/double-putt-stats';
// Everything on it comes from the stats endpoint, which needs the private reporting key, so the page itself is only
// a form. Kept out of search and the sitemap, and out of the site's own layout (doubleputt/(site)): it's a tool.
export const metadata: Metadata = { robots: { follow: false, index: false }, title: 'Double Putt Stats' };
export default function StatsPage() { return <DoublePuttStats />; }
