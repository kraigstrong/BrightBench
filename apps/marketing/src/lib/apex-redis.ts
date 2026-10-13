import { Redis } from '@upstash/redis';
import { bucketMs, limits, retentionDays, type ApexStore, type StoredGhost } from './apex-laps.ts';

let redis: Redis | undefined;
function client() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) throw new Error('Apex store unavailable');
  redis ??= new Redis({url, token});
  return redis;
}

const boardsKey = (day: string) => `apex:v1:boards:${day}`;
const countsKey = (day: string) => `apex:v1:laps:${day}`;
const bestKey = (board: string) => `apex:v1:best:${board}`;
const ghostKey = (board: string, player: string) => `apex:v1:ghost:${board}:${player}`;
const histogramKey = (board: string) => `apex:v1:histogram:${board}`;

// A bounded number of boards a day, enforced atomically; each board's fields are bounded by its histogram buckets.
export const countScript = `
local boards = KEYS[1]
local counts = KEYS[2]
local ttl = tonumber(ARGV[1])
local cap = tonumber(ARGV[2])
local n = tonumber(ARGV[3])
local fresh = 0
for i=1,n do
  if redis.call('SISMEMBER', boards, ARGV[3+i]) == 0 then fresh = fresh + 1 end
end
if redis.call('SCARD', boards) + fresh > cap then return 0 end
for i=1,n do redis.call('SADD', boards, ARGV[3+i]) end
for i=4+n,#ARGV,2 do redis.call('HINCRBY', counts, ARGV[i], ARGV[i+1]) end
redis.call('EXPIRE', boards, ttl)
redis.call('EXPIRE', counts, ttl)
return 1`;

// Keeps a player's lowest time (LT). When it improved (CH counts the change), replaces their ghost and moves them to
// their new bucket in the board's histogram, so standings always count every player.
export const bestScript = `
local width = tonumber(ARGV[4])
local old = redis.call('ZSCORE', KEYS[1], ARGV[2])
local changed = redis.call('ZADD', KEYS[1], 'LT', 'CH', ARGV[1], ARGV[2])
if changed == 1 then
  redis.call('SET', KEYS[2], ARGV[3])
  if old then redis.call('HINCRBY', KEYS[3], tostring(math.floor(tonumber(old) / width) * width), -1) end
  redis.call('HINCRBY', KEYS[3], tostring(math.floor(tonumber(ARGV[1]) / width) * width), 1)
end
return changed`;

export const apexStore: ApexStore = {
  async countLaps(day, boards, updates) {
    const args = [String(retentionDays * 86400), String(limits.boardsPerDay), String(boards.length), ...boards,
      ...updates.flatMap(u => [u.field, String(u.by)])];
    return await client().eval(countScript, [boardsKey(day), countsKey(day)], args) === 1;
  },
  async saveBest(board, player, ms, ghost) {
    await client().eval(bestScript, [bestKey(board), ghostKey(board, player), histogramKey(board)],
      [String(ms), player, JSON.stringify(ghost), String(bucketMs)]);
  },
  async near(board, targetMs, fromMs, toMs, perSide) {
    const [slower, faster] = await Promise.all([
      client().zrange<(string | number)[]>(bestKey(board), targetMs, toMs,
        {byScore: true, withScores: true, offset: 0, count: perSide}),
      client().zrange<(string | number)[]>(bestKey(board), targetMs, fromMs,
        {byScore: true, rev: true, withScores: true, offset: 0, count: perSide}),
    ]);
    const rows: { player: string; ms: number }[] = [];
    for (const flat of [slower, faster]) {
      for (let i = 0; i + 1 < flat.length; i += 2) rows.push({player: String(flat[i]), ms: Number(flat[i + 1])});
    }
    return rows;
  },
  async ghost(board, player) {
    return await client().get<StoredGhost>(ghostKey(board, player));
  },
  async rank(board, ms) {
    const [faster, players] = await Promise.all([client().zcount(bestKey(board), '-inf', `(${ms}`),
      client().zcard(bestKey(board))]);
    return {faster, players};
  },
  async best(board, player) {
    const ms = await client().zscore(bestKey(board), player);
    return ms === null ? null : Number(ms);
  },
  async distribution(board) {
    const counts = await client().hgetall<Record<string, number>>(histogramKey(board)) ?? {};
    return new Map(Object.entries(counts).map(([bucket, count]) => [Number(bucket), Number(count)]));
  },
};
