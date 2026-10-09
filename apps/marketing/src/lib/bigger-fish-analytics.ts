import { createHash, timingSafeEqual } from 'node:crypto';

// Content identity only: no user/install/session IDs or client wall-clock timestamps.
// Keep in sync with BiggerFish/ArcadeAnalytics.swift and ArcadeMetrics.swift.
export type Context = { world: string; level: number; setup: number; seed: string; mode: 'campaign' | 'endless'; revision: string };
type Snapshot = { path: 'available' | 'no_path_in_snapshot' | 'unknown'; playerRadius: number; remaining: number; edible: number; largestRatio: number };
export type Summary = {
  seconds: number; circuits: number; playerMeals: number; aiMeals: number; closeMeals: number;
  nearEqualMeals: number; bounces: number; cleanupSeconds: number; longestMealGap: number;
  noPathSeconds: number; firstNoPathSeconds?: number; firstNoPathCircuits?: number;
  pathRecovered: boolean; snapshot: Snapshot; fatalRatio?: number;
};
export type Event =
  | { kind: 'milestone'; name: string; context?: Context }
  | { kind: 'run'; context: Context; outcome: 'win' | 'death' | 'quit' | 'abandoned'; cause: string; replay: boolean; attempt: number; summary: Summary }
  | { kind: 'decision'; name: 'retry' | 'next' | 'leave' | 'unknown'; context: Context; outcome: 'win' | 'death' };
export type Batch = { schema: 1; appVersion: string; build: string; channel: 'debug' | 'testflight' | 'appstore'; events: Event[] };
export const maxBodyBytes = 64 * 1024;
export const retentionDays = 90;
export type Update = { field: string; by: number };
export interface ArcadeStore {
  // Atomic counters only. Builds/contexts are bounded per receive-day, not hardcoded game catalogs.
  write(day: string, build: string, contexts: string[], updates: Update[]): Promise<boolean>;
  read(days: string[]): Promise<{ day: string; build: string; counts: Record<string, number> }[]>;
}
const record = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
function keys(x: Record<string, unknown>, required: string[], optional: string[] = []) {
  return required.every(k => Object.hasOwn(x, k)) && Object.keys(x).every(k => [...required, ...optional].includes(k));
}
const number = (x: unknown, max: number, integer = false): x is number => typeof x === 'number' && Number.isFinite(x) && x >= 0 && x <= max && (!integer || Number.isInteger(x));
function context(x: unknown): x is Context {
  return record(x) && keys(x, ['world','level','setup','seed','mode','revision'])
    && typeof x.world === 'string' && /^[a-z][a-z0-9-]{0,47}$/.test(x.world)
    && number(x.level, 1_000_000_000, true) && number(x.setup, 1_000_000_000, true)
    && typeof x.seed === 'string' && /^\d{1,20}$/.test(x.seed)
    && ['campaign','endless'].includes(String(x.mode))
    && typeof x.revision === 'string' && /^[a-zA-Z0-9.-]{1,48}$/.test(x.revision);
}
function summary(x: unknown): x is Summary {
  if (!record(x) || !keys(x, ['seconds','circuits','playerMeals','aiMeals','closeMeals','nearEqualMeals','bounces','cleanupSeconds','longestMealGap','noPathSeconds','pathRecovered','snapshot'], ['firstNoPathSeconds','firstNoPathCircuits','fatalRatio'])) return false;
  if (!['seconds','cleanupSeconds','longestMealGap','noPathSeconds'].every(k => number(x[k], 3600)) || !number(x.circuits, 100)) return false;
  if (!['playerMeals','aiMeals','closeMeals','nearEqualMeals','bounces'].every(k => number(x[k], 10000, true))) return false;
  if (typeof x.pathRecovered !== 'boolean') return false;
  for (const k of ['cleanupSeconds','longestMealGap','noPathSeconds']) if ((x[k] as number) > (x.seconds as number)) return false;
  if ((x.nearEqualMeals as number) > (x.closeMeals as number) || (x.closeMeals as number) > (x.playerMeals as number)) return false;
  if (Object.hasOwn(x, 'firstNoPathSeconds') !== Object.hasOwn(x, 'firstNoPathCircuits')) return false;
  if (Object.hasOwn(x, 'firstNoPathSeconds') && (!number(x.firstNoPathSeconds, x.seconds as number) || !number(x.firstNoPathCircuits, x.circuits as number))) return false;
  if (Object.hasOwn(x, 'fatalRatio') && !number(x.fatalRatio, 1000)) return false;
  const s = x.snapshot;
  return record(s) && keys(s, ['path','playerRadius','remaining','edible','largestRatio'])
    && ['available','no_path_in_snapshot','unknown'].includes(String(s.path)) && number(s.playerRadius, 100000)
    && number(s.remaining, 10000, true) && number(s.edible, s.remaining as number, true) && number(s.largestRatio, 1000);
}
export function validateBatch(x: unknown): x is Batch {
  if (!record(x) || !keys(x, ['schema','appVersion','build','channel','events']) || x.schema !== 1) return false;
  if (typeof x.appVersion !== 'string' || !/^\d{1,3}\.\d{1,3}(\.\d{1,3})?$/.test(x.appVersion) || typeof x.build !== 'string' || !/^\d{1,9}$/.test(x.build)) return false;
  if (!['debug','testflight','appstore'].includes(String(x.channel)) || !Array.isArray(x.events) || x.events.length < 1 || x.events.length > 25) return false;
  return x.events.every((e: unknown) => {
    if (!record(e)) return false;
    if (e.kind === 'milestone') {
      return keys(e, ['kind','name'], ['context']) && (e.name === 'first_launch' ? !Object.hasOwn(e, 'context')
        : ['level_started','world_started','level_cleared','world_cleared'].includes(String(e.name)) && context(e.context));
    }
    if (e.kind === 'decision') return keys(e, ['kind','name','context','outcome']) && context(e.context)
      && ['retry','next','leave','unknown'].includes(String(e.name)) && ['win','death'].includes(String(e.outcome));
    if (e.kind !== 'run' || !keys(e, ['kind','context','outcome','cause','replay','attempt','summary']) || !context(e.context) || !summary(e.summary)) return false;
    return ['win','death','quit','abandoned'].includes(String(e.outcome)) && typeof e.replay === 'boolean'
      && number(e.attempt, 1000, true) && (e.replay ? e.attempt === 0 : e.attempt > 0)
      && (e.outcome === 'death' ? ['predator','tentacles','urchin'].includes(String(e.cause)) : e.cause === 'none')
      && (e.outcome === 'death' && e.cause === 'predator' ? number(e.summary.fatalRatio, 1000) : !Object.hasOwn(e.summary, 'fatalRatio'));
  });
}
export function contentToken(c?: Context) {
  // Canonical order independent of request JSON key ordering. This is game content, never a run key.
  return c ? Buffer.from(JSON.stringify([c.world,c.mode,c.level,c.setup,c.seed,c.revision])).toString('base64url') : 'install';
}
const buckets = {
  seconds: [2,5,10,20,40,80,160,320,640,1200,3600], circuits: [.25,.5,1,1.5,2,3,5,10,25,100],
  attempt: [1,2,3,5,10,20,50,100,250,1000], ratio: [.5,.7,.85,.95,1,1.01,1.1,1.25,1.5,2,3,5,10,1000], count: [0,1,2,3,5,10,20,50,100,500,10000],
};
function bucket(value: number, boundaries: number[]) { return String(boundaries.find(v => value <= v) ?? boundaries.at(-1)); }
export function counterUpdates(batch: Batch): Update[] {
  const totals = new Map<string, number>();
  function add(c: string, metric: string, by = 1) { const field = `${c}|${metric}`; totals.set(field, (totals.get(field) ?? 0) + by); }
  for (const e of batch.events) {
    const c = contentToken(e.context);
    if (e.kind === 'milestone') { add(c, `milestone.${e.name}`); continue; }
    if (e.kind === 'decision') { add(c, `decision.${e.outcome}.${e.name}`); continue; }
    add(c, `outcome.${e.outcome}`); add(c, `${e.replay ? 'replay' : 'learning'}.${e.outcome}`);
    const s = e.summary;
    if (e.outcome === 'win' && !e.replay) add(c, `attempt.${bucket(e.attempt,buckets.attempt)}`);
    if (e.outcome === 'death') {
      add(c, `death.${e.cause}`); add(c, `deathPath.${s.snapshot.path}`);
      add(c, `deathCombined.${e.cause}.${s.snapshot.path}`);
    }
    for (const field of ['seconds','circuits','cleanupSeconds','longestMealGap','noPathSeconds','playerMeals','aiMeals','closeMeals','nearEqualMeals','bounces'] as const) {
      add(c, `sum.${e.outcome}.${field}`, Math.round(s[field] * 1000));
      const boundaries = field === 'circuits' ? buckets.circuits : field.endsWith('Seconds') || field === 'seconds' || field === 'longestMealGap' ? buckets.seconds : buckets.count;
      add(c, `hist.${e.outcome}.${field}.${bucket(s[field],boundaries)}`);
    }
    if (s.firstNoPathSeconds !== undefined) {
      add(c, `firstPathLoss.seconds.${bucket(s.firstNoPathSeconds,buckets.seconds)}`);
      add(c, `firstPathLoss.circuits.${bucket(s.firstNoPathCircuits!,buckets.circuits)}`);
    }
    if (s.pathRecovered) add(c, 'pathRecovered');
    if (s.fatalRatio !== undefined) add(c, `fatalRatio.${bucket(s.fatalRatio,buckets.ratio)}`);
    add(c, `remaining.${bucket(s.snapshot.remaining,buckets.count)}`);
    add(c, `edible.${bucket(s.snapshot.edible,buckets.count)}`);
    add(c, `largestRatio.${bucket(s.snapshot.largestRatio,buckets.ratio)}`);
  }
  return [...totals].map(([field,by]) => ({field,by}));
}
function authorized(given: string, expected: string) {
  if (!expected) return false;
  return timingSafeEqual(createHash('sha256').update(given).digest(), createHash('sha256').update(expected).digest());
}
const headers = { 'Cache-Control': 'no-store' };
const status = (code: number) => new Response(null, {status: code, headers});
export async function handleEvents(request: Request, deps: { store: ArcadeStore; appKey: string; now?: () => Date }): Promise<Response> {
  if (!authorized(request.headers.get('x-app-key') ?? '', deps.appKey)) return status(401);
  if (Number(request.headers.get('content-length') ?? 0) > maxBodyBytes) return status(413);
  let value: unknown;
  try {
    const reader = request.body?.getReader(); let bytes = 0; const chunks: Uint8Array[] = [];
    if (!reader) return status(400);
    for (;;) {
      const {done,value: chunk} = await reader.read(); if (done) break;
      bytes += chunk.byteLength;
      if (bytes > maxBodyBytes) { await reader.cancel(); return status(413); }
      chunks.push(chunk);
    }
    value = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch { return status(400); }
  if (!validateBatch(value)) return status(400);
  const build = `${value.channel}:${value.appVersion}:${value.build}`;
  const day = (deps.now?.() ?? new Date()).toISOString().slice(0,10);
  try {
    const ok = await deps.store.write(day, build, [...new Set(value.events.map(e => contentToken(e.context)))], counterUpdates(value));
    return status(ok ? 204 : 429);
  } catch { return status(503); } // Never log errors or requests that may contain bodies/network metadata.
}
// Display order only, not a registry: worlds not listed here sort after these, alphabetically.
const worldOrder = ['shallow-reef', 'jelly-bloom', 'kelp-forest'];
const worldRank = (world: string) => { const i = worldOrder.indexOf(world); return i < 0 ? worldOrder.length : i; };
// Builds are `channel:version:build`; newer versions and build numbers first.
function newerBuildFirst(a: string, b: string) {
  const parts = (x: string) => { const [,version = '',build = ''] = x.split(':'); return [...version.split('.'), build].map(Number); };
  const [pa,pb] = [parts(a),parts(b)];
  for (let i = 0; i < Math.max(pa.length,pb.length); i++) { const d = (pb[i] ?? 0) - (pa[i] ?? 0); if (d) return d; }
  return a.localeCompare(b);
}
type ReportContext = {world:string;mode:string;level:number;setup:number;seed:string;revision:string};
function reportOrder(a: {build: string; context: unknown}, b: {build: string; context: unknown}) {
  const [ca,cb] = [a.context as ReportContext | null, b.context as ReportContext | null];
  if (!ca || !cb) return Number(!ca) - Number(!cb) || newerBuildFirst(a.build,b.build);
  return worldRank(ca.world) - worldRank(cb.world) || ca.world.localeCompare(cb.world)
    || Number(ca.mode !== 'campaign') - Number(cb.mode !== 'campaign') || ca.mode.localeCompare(cb.mode)
    || ca.level - cb.level || newerBuildFirst(a.build,b.build)
    || ca.setup - cb.setup || ca.revision.localeCompare(cb.revision) || ca.seed.localeCompare(cb.seed);
}
// Rows sorted by world (campaign order), mode, level, then newest build first.
export function report(rows: Awaited<ReturnType<ArcadeStore['read']>>) {
  // Keep builds and content distinct; do not link individual attempts.
  const groups = new Map<string, { build: string; context: unknown; counts: Record<string, number> }>();
  for (const row of rows) for (const [field,value] of Object.entries(row.counts)) {
    const [token,metric] = field.split('|'); if (!token || !metric) continue;
    const id = `${row.build}|${token}`;
    let group = groups.get(id);
    if (!group) {
      const parts = token === 'install' ? null : JSON.parse(Buffer.from(token,'base64url').toString());
      group = {build: row.build, context: parts ? {world:parts[0],mode:parts[1],level:parts[2],setup:parts[3],seed:parts[4],revision:parts[5]} : null, counts: {}};
      groups.set(id,group);
    }
    group.counts[metric] = (group.counts[metric] ?? 0) + value;
  }
  return [...groups.values()].sort(reportOrder).map(g => {
    const wins = g.counts['outcome.win'] ?? 0, deaths = g.counts['outcome.death'] ?? 0;
    const ended = wins + deaths + (g.counts['outcome.quit'] ?? 0) + (g.counts['outcome.abandoned'] ?? 0);
    return {...g, attempts: ended, completedAttempts: wins+deaths,
      successRate: wins+deaths ? wins/(wins+deaths) : null, allEndedSuccessRate: ended ? wins/ended : null,
      deathsWithGrowthPathRate: deaths ? (g.counts['deathPath.available'] ?? 0)/deaths : null};
  });
}
export async function handleStats(request: Request, deps: {store: ArcadeStore; secret: string; now?: () => Date}): Promise<Response> {
  if (!authorized((request.headers.get('authorization') ?? '').replace(/^Bearer /,''), deps.secret)) return status(401);
  const url = new URL(request.url); const end = deps.now?.() ?? new Date();
  const to = url.searchParams.get('to') ?? end.toISOString().slice(0,10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(to) || Number.isNaN(Date.parse(to))) return status(400);
  const from = url.searchParams.get('from') ?? new Date(Date.parse(to) - 29*86400000).toISOString().slice(0,10);
  const start = Date.parse(from), stop = Date.parse(to);
  if (![from,to].every(d => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d)) && new Date(d).toISOString().slice(0,10) === d) || stop < start || (stop-start)/86400000 >= retentionDays) return status(400);
  const days = Array.from({length: (stop-start)/86400000+1}, (_,i) => new Date(start+i*86400000).toISOString().slice(0,10));
  try {
    const rows = await deps.store.read(days);
    const selected = rows.filter(r => {
      const [channel,version,build] = r.build.split(':');
      return (url.searchParams.get('channel') ?? 'testflight') === channel && (!url.searchParams.has('appVersion') || url.searchParams.get('appVersion') === version) && (!url.searchParams.has('build') || url.searchParams.get('build') === build);
    });
    return Response.json({from,to, notes: ['Anonymous aggregate attempts, not unique people.', 'Growth paths are optimistic size budgets, not proven winnability.', 'Histograms use upper bucket bounds; sums are thousandths of displayed units.', 'First-clear distributions exclude installs that have not cleared; consult starts and quits too.', 'Failed deliveries are dropped; receive-day is not play-day.'], rows: report(selected)}, {headers});
  } catch { return status(503); }
}
