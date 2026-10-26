import type { Metadata } from 'next';
import DoublePuttStats from '@/components/double-putt-stats';
// Everything on it comes from the stats endpoint, which needs the private reporting key, so the page itself is only
// a form. Kept out of search and the sitemap: it's a tool. Double Putt's site itself is doubleputt.app
// (apps/double-putt-site); this report stays here, beside the endpoint.
export const metadata: Metadata = { robots: { follow: false, index: false }, title: 'Double Putt Stats' };
export default function StatsPage() { return <DoublePuttStats />; }
