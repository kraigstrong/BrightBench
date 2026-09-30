import { handleEvents } from '@/lib/math-reef-analytics';
import { redisCounterStore } from '@/lib/math-reef-redis';

// Math Reef's anonymous analytics batches. Validation and counting live in
// src/lib/math-reef-analytics.ts; this only wires in the store and key. Never log the request.

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  return handleEvents(request, {
    store: redisCounterStore,
    appKey: process.env.MATH_REEF_APP_KEY ?? '',
    log: (message) => console.warn(message),
  });
}
