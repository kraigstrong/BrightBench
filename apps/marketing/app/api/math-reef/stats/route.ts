import { handleStats } from '@/lib/math-reef-analytics';
import { redisCounterStore } from '@/lib/math-reef-redis';

// Math Reef's summed analytics counters, behind STATS_SECRET (every game's stats share it).

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleStats(request, {
    store: redisCounterStore,
    statsSecret: process.env.STATS_SECRET ?? '',
  });
}
