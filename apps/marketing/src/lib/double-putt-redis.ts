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
// Upstash bills the script call plus every redis.call it makes, so a write costs about 5 + one HINCRBY per counter:
// one SISMEMBER (build), one SMISMEMBER (contents), one GET (the day's counter total), one HLEN (the build's counters
// before), and the increments. The rest runs only when something is new to the day (a build, a content, a counter:
// HLEN again and INCRBY) or near the counter cap. Keys expire 90 days after the day's first write to them.
export const doublePuttIncrementScript = `
local unpack = unpack or table.unpack
local builds = KEYS[1]
local contentIndex = KEYS[2]
local counts = KEYS[3]
local fields = KEYS[4]
local build = ARGV[1]
local ttl = tonumber(ARGV[2])
local n = tonumber(ARGV[3])
local names, seenNames = {}, {}
for i=4+n,#ARGV,2 do
  if not seenNames[ARGV[i]] then seenNames[ARGV[i]] = true; names[#names+1] = ARGV[i] end
end
if #names == 0 then return 1 end
local newBuild = redis.call('SISMEMBER', builds, build) == 0
local buildsBefore = -1
if newBuild then
  buildsBefore = redis.call('SCARD', builds)
  if buildsBefore >= 20 then return 0 end
end
local newContents = {}
if n > 0 then
  local list, seen = {}, {}
  for i=1,n do
    local content = build .. '|' .. ARGV[3+i]
    if not seen[content] then seen[content] = true; list[#list+1] = content end
  end
  local present = redis.call('SMISMEMBER', contentIndex, unpack(list))
  for i=1,#list do if present[i] == 0 then newContents[#newContents+1] = list[i] end end
end
local contentsBefore = -1
if #newContents > 0 then
  contentsBefore = redis.call('SCARD', contentIndex)
  if contentsBefore + #newContents > 500 then return 0 end
end
local total = redis.call('GET', fields)
local fieldCount = tonumber(total or '0')
if fieldCount + #names > 20000 then
  -- Near the cap only: count exactly the counters this build's hash doesn't have yet.
  local unseen = #names
  if not newBuild then
    unseen = 0
    for _,name in ipairs(names) do if redis.call('HEXISTS', counts, name) == 0 then unseen = unseen + 1 end end
  end
  if fieldCount + unseen > 20000 then return 0 end
end
local before = 0
if not newBuild then before = redis.call('HLEN', counts) end
if newBuild then
  redis.call('SADD', builds, build)
  if buildsBefore == 0 then redis.call('EXPIRE', builds, ttl) end
end
if #newContents > 0 then
  redis.call('SADD', contentIndex, unpack(newContents))
  if contentsBefore == 0 then redis.call('EXPIRE', contentIndex, ttl) end
end
-- An increment that returns exactly itself may have made a new counter; only then is the hash counted again (exact even
-- for a counter found at 0).
local maybeNew = false
for i=4+n,#ARGV,2 do
  local by = tonumber(ARGV[i+1])
  if redis.call('HINCRBY', counts, ARGV[i], by) == by then maybeNew = true end
end
local added = 0
if maybeNew then added = redis.call('HLEN', counts) - before end
if added > 0 then
  redis.call('INCRBY', fields, added)
  if not total then redis.call('EXPIRE', fields, ttl) end
end
if newBuild then redis.call('EXPIRE', counts, ttl) end
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
