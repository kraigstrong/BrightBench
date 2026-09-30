import { Redis } from '@upstash/redis';

import { counterKeys, type CounterStore } from './math-reef-analytics.ts';

// Math Reef's counters in Upstash Redis (connected through the Vercel Marketplace, which sets the
// KV_REST_API_* variables). Only hash counters and the set of builds seen per day are written.

let redis: Redis | undefined;

function client(): Redis {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Math Reef analytics: Upstash Redis is not configured');
  redis ??= new Redis({ url, token });
  return redis;
}

export const redisCounterStore: CounterStore = {
  async increment(updates, day, build) {
    const pipeline = client().multi();
    pipeline.sadd(counterKeys.builds(day), build);
    for (const { key, field } of updates) pipeline.hincrby(key, field, 1);
    await pipeline.exec();
  },
  async builds(day) {
    return client().smembers(counterKeys.builds(day));
  },
  async read(key) {
    return (await client().hgetall<Record<string, number>>(key)) ?? {};
  },
};
