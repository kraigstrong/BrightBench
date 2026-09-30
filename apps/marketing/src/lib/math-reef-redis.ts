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
  async increment(updates, day, build, maxBuilds) {
    const buildsKey = counterKeys.builds(day);
    // Concurrent new builds can overshoot the cap by a few; it bounds growth, not an exact count.
    const [known, count] = await client().pipeline().sismember(buildsKey, build).scard(buildsKey).exec<[number, number]>();
    if (!known && count >= maxBuilds) return false;
    // A transaction, so a batch is counted whole or not at all.
    const tx = client().multi();
    tx.sadd(buildsKey, build);
    for (const { key, field, by } of updates) tx.hincrby(key, field, by);
    await tx.exec();
    return true;
  },
  async builds(days) {
    if (days.length === 0) return [];
    const pipeline = client().pipeline();
    for (const day of days) pipeline.smembers(counterKeys.builds(day));
    return pipeline.exec<string[][]>();
  },
  async read(keys) {
    if (keys.length === 0) return [];
    const pipeline = client().pipeline();
    for (const key of keys) pipeline.hgetall(key);
    const hashes = await pipeline.exec<(Record<string, number> | null)[]>();
    return hashes.map((hash) => hash ?? {});
  },
};
