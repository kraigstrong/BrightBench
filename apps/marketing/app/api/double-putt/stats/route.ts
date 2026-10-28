import { handleStats } from '@/lib/double-putt-analytics';
import { doublePuttStore } from '@/lib/double-putt-redis';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  return handleStats(request, {store: doublePuttStore, secret: process.env.STATS_SECRET ?? ''});
}
