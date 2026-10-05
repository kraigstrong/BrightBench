import { handleStats } from '@/lib/bigger-fish-analytics';
import { arcadeStore } from '@/lib/bigger-fish-redis';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) {
  return handleStats(request, {store: arcadeStore, secret: process.env.BIGGER_FISH_STATS_SECRET ?? ''});
}
