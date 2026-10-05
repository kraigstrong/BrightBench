import { Redis } from '@upstash/redis';
import { retentionDays, type ArcadeStore } from './bigger-fish-analytics.ts';
let redis: Redis | undefined;
function client() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Bigger Fish store unavailable');
  redis ??= new Redis({url,token}); return redis;
}
const buildsKey = (day: string) => `bf:v1:builds:${day}`;
const countsKey = (day: string, build: string) => `bf:v1:counts:${day}:${build}`;
// Fixed bounded daily cardinality, enforced atomically even with a public app key.
// These are ingest limits, not a finite world/level registry; beyond-limit batches are discarded.
const increment = `
local builds = KEYS[1]
local contexts = KEYS[2]
local counts = KEYS[3]
local build = ARGV[1]
local ttl = tonumber(ARGV[2])
local n = tonumber(ARGV[3])
if redis.call('SISMEMBER', builds, build) == 0 and redis.call('SCARD', builds) >= 20 then return 0 end
local newContexts = 0
for i=1,n do if redis.call('SISMEMBER', contexts, ARGV[3+i]) == 0 then newContexts = newContexts + 1 end end
if redis.call('SCARD', contexts) + newContexts > 500 then return 0 end
redis.call('SADD', builds, build)
for i=1,n do redis.call('SADD', contexts, ARGV[3+i]) end
for i=4+n,#ARGV,2 do redis.call('HINCRBY', counts, ARGV[i], ARGV[i+1]) end
redis.call('EXPIRE', builds, ttl)
redis.call('EXPIRE', contexts, ttl)
redis.call('EXPIRE', counts, ttl)
return 1`;
export const arcadeStore: ArcadeStore = {
  async write(day, build, contexts, updates) {
    const args = [build, String(retentionDays*86400), String(contexts.length), ...contexts, ...updates.flatMap(u => [u.field,String(u.by)])];
    const result = await client().eval(increment, [buildsKey(day),`bf:v1:contexts:${day}`,countsKey(day,build)], args);
    return result === 1;
  },
  async read(days) {
    const pipeline = client().pipeline(); for (const day of days) pipeline.smembers(buildsKey(day));
    const builds = await pipeline.exec<string[][]>();
    const pairs = days.flatMap((day,i) => (builds[i] ?? []).map(build => ({day,build})));
    const rows: {day:string;build:string;counts:Record<string,number>}[] = [];
    // Avoid giant Upstash pipelines for multi-day reads.
    for (let offset=0; offset<pairs.length; offset+=100) {
      const group = pairs.slice(offset,offset+100), p = client().pipeline();
      for (const {day,build} of group) p.hgetall(countsKey(day,build));
      const hashes = await p.exec<(Record<string,number>|null)[]>();
      group.forEach((pair,i) => rows.push({...pair,counts:hashes[i] ?? {}}));
    }
    return rows;
  },
};
