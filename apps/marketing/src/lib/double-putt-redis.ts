import { Redis } from '@upstash/redis';
import { retentionDays, type DoublePuttStore } from './double-putt-analytics.ts';
let redis: Redis | undefined;
function client() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Double Putt store unavailable');
  redis ??= new Redis({url,token}); return redis;
}
const buildsKey = (day: string) => `dp:v1:builds:${day}`;
const countsKey = (day: string, build: string) => `dp:v1:counts:${day}:${build}`;
// Fixed bounded daily cardinality, enforced atomically even with a public app key.
// These are ingest limits, not a finite course/hole registry; beyond-limit batches are discarded.
// A "content" here is one build's hole, course or install counters (`build|token`).
export const doublePuttIncrementScript = `
local builds = KEYS[1]
local contentIndex = KEYS[2]
local counts = KEYS[3]
local fields = KEYS[4]
local build = ARGV[1]
local ttl = tonumber(ARGV[2])
local n = tonumber(ARGV[3])
if redis.call('SISMEMBER', builds, build) == 0 and redis.call('SCARD', builds) >= 20 then return 0 end
local newContents = 0
local seenContents = {}
for i=1,n do
  local content = build .. '|' .. ARGV[3+i]
  if not seenContents[content] then
    seenContents[content] = true
    if redis.call('SISMEMBER', contentIndex, content) == 0 then newContents = newContents + 1 end
  end
end
if redis.call('SCARD', contentIndex) + newContents > 500 then return 0 end
local newFields = 0
local seenFields = {}
for i=4+n,#ARGV,2 do
  local field = ARGV[i]
  if not seenFields[field] then
    seenFields[field] = true
    if redis.call('HEXISTS', counts, field) == 0 then newFields = newFields + 1 end
  end
end
local fieldCount = tonumber(redis.call('GET', fields) or '0')
if fieldCount + newFields > 20000 then return 0 end
redis.call('SADD', builds, build)
for content,_ in pairs(seenContents) do redis.call('SADD', contentIndex, content) end
redis.call('INCRBY', fields, newFields)
for i=4+n,#ARGV,2 do redis.call('HINCRBY', counts, ARGV[i], ARGV[i+1]) end
redis.call('EXPIRE', builds, ttl)
redis.call('EXPIRE', contentIndex, ttl)
redis.call('EXPIRE', fields, ttl)
redis.call('EXPIRE', counts, ttl)
return 1`;
export const doublePuttStore: DoublePuttStore = {
  async write(day, build, contexts, updates) {
    const args = [build, String(retentionDays*86400), String(contexts.length), ...contexts, ...updates.flatMap(u => [u.field,String(u.by)])];
    const result = await client().eval(doublePuttIncrementScript, [buildsKey(day),`dp:v1:contents:${day}`,countsKey(day,build),`dp:v1:fields:${day}`], args);
    return result === 1;
  },
  async read(days) {
    const pipeline = client().pipeline(); for (const day of days) pipeline.smembers(buildsKey(day));
    const builds = await pipeline.exec<string[][]>();
    const dayBuilds = days.flatMap((day,i) => (builds[i] ?? []).map(build => ({day,build})));
    const rows: {day:string;build:string;counts:Record<string,number>}[] = [];
    // Avoid giant Upstash pipelines for multi-day reads.
    for (let offset=0; offset<dayBuilds.length; offset+=100) {
      const group = dayBuilds.slice(offset,offset+100), p = client().pipeline();
      for (const {day,build} of group) p.hgetall(countsKey(day,build));
      const hashes = await p.exec<(Record<string,number>|null)[]>();
      group.forEach((dayBuild,i) => rows.push({...dayBuild,counts:hashes[i] ?? {}}));
    }
    return rows;
  },
};
