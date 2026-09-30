import { handleStats } from '@/lib/math-reef-analytics';
import { redisCounterStore } from '@/lib/math-reef-redis';

// Math Reef's summed analytics counters, behind MATH_REEF_STATS_SECRET.

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  return handleStats(request, {
    store: redisCounterStore,
    statsSecret: process.env.MATH_REEF_STATS_SECRET ?? '',
  });
}
