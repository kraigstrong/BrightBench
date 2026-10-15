import { createHash, timingSafeEqual } from 'node:crypto';

// Content identity only: no user/install/session/device IDs or client wall-clock timestamps.
// The contract is docs/analytics.md in kraigstrong/double-putt (sent by MiniGolf/Game/Analytics.swift): change both together.
export type Context = { course: string; pair: number; slug: string; revision: string };
export const modes = ['round', 'single'] as const;
export const outcomes = ['finished', 'quit', 'abandoned'] as const;
export const medals = ['none', 'bronze', 'silver', 'gold'] as const;
export type Event =
  | { kind: 'milestone'; name: 'first_launch' }
  | { kind: 'milestone'; name: 'course_unlocked'; course: string; revision: string }
  | { kind: 'milestone'; name: 'pair_finished' | 'trophy_won'; context: Context }
  // One per attempt at a pair. `strokes` is hole A then hole B, water penalties included.
  | { kind: 'pair'; context: Context; mode: typeof modes[number]; outcome: typeof outcomes[number]; replay: boolean; attempt: number;
      strokes: [number, number]; par: number; swings: number; mirrorSwings: number; water: number; aces: number; doubleAce: boolean; seconds: number }
  | { kind: 'round'; action: 'started'; course: string; revision: string; first: boolean }
  | { kind: 'round'; action: 'left'; course: string; revision: string; pair: number }
  | { kind: 'round'; action: 'finished'; course: string; revision: string; strokes: number; par: number; medal: typeof medals[number]; best: boolean };
export type Batch = { schema: 1; appVersion: string; build: string; channel: 'debug' | 'testflight' | 'appstore'; events: Event[] };
export const maxBodyBytes = 64 * 1024;
export const retentionDays = 90;
export type Update = { field: string; by: number };
export interface DoublePuttStore {
  // Atomic counters only. Builds/contexts are bounded per receive-day, not hardcoded course catalogs.
  write(day: string, build: string, contexts: string[], updates: Update[]): Promise<boolean>;
  read(days: string[]): Promise<{ day: string; build: string; counts: Record<string, number> }[]>;
}
const record = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
function keys(x: Record<string, unknown>, required: string[]) {
  return required.every(k => Object.hasOwn(x, k)) && Object.keys(x).every(k => required.includes(k));
}
const oneOf = (x: unknown, values: readonly string[]) => typeof x === 'string' && values.includes(x);
const integer = (x: unknown, min: number, max: number): x is number => typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max;
const matches = (x: unknown, pattern: RegExp) => typeof x === 'string' && pattern.test(x);
// Bounded slugs, not a fixed list: new courses and pairs need no server change.
const course = /^[a-z][a-z0-9-]{0,31}$/, slug = /^[a-z][a-z0-9-]{0,47}$/, revision = /^[a-zA-Z0-9.-]{1,48}$/;
function context(x: unknown): x is Context {
  return record(x) && keys(x, ['course','pair','slug','revision']) && matches(x.course, course) && integer(x.pair, 1, 9)
    && matches(x.slug, slug) && matches(x.revision, revision);
}
function pair(e: Record<string, unknown>) {
  if (!keys(e, ['kind','context','mode','outcome','replay','attempt','strokes','par','swings','mirrorSwings','water','aces','doubleAce','seconds'])) return false;
  if (!context(e.context) || !oneOf(e.mode, modes) || !oneOf(e.outcome, outcomes) || typeof e.replay !== 'boolean') return false;
  const finished = e.outcome === 'finished', strokes = e.strokes;
  if (!Array.isArray(strokes) || strokes.length !== 2 || !strokes.every(s => integer(s, finished ? 1 : 0, 99))) return false;
  return integer(e.attempt, 0, 1000) && (e.replay ? e.attempt === 0 : e.attempt > 0)
    && integer(e.par, 2, 12) && integer(e.swings, 0, 200) && integer(e.mirrorSwings, 0, e.swings as number)
    && integer(e.water, 0, 200) && integer(e.aces, 0, 2)
    && typeof e.doubleAce === 'boolean' && (!e.doubleAce || (finished && strokes[0] === 1 && strokes[1] === 1))
    && integer(e.seconds, 0, 3600);
}
function round(e: Record<string, unknown>) {
  const base = ['kind','action','course','revision'];
  if (!matches(e.course, course) || !matches(e.revision, revision)) return false;
  if (e.action === 'started') return keys(e, [...base,'first']) && typeof e.first === 'boolean';
  if (e.action === 'left') return keys(e, [...base,'pair']) && integer(e.pair, 1, 9);
  return e.action === 'finished' && keys(e, [...base,'strokes','par','medal','best'])
    && integer(e.strokes, 9, 999) && integer(e.par, 18, 108) && oneOf(e.medal, medals) && typeof e.best === 'boolean';
}
export function validateBatch(x: unknown): x is Batch {
  if (!record(x) || !keys(x, ['schema','appVersion','build','channel','events']) || x.schema !== 1) return false;
  if (!matches(x.appVersion, /^\d{1,3}\.\d{1,3}(\.\d{1,3})?$/) || !matches(x.build, /^\d{1,9}$/)) return false;
  if (!oneOf(x.channel, ['debug','testflight','appstore']) || !Array.isArray(x.events) || x.events.length < 1 || x.events.length > 25) return false;
  return x.events.every((e: unknown) => {
    if (!record(e)) return false;
    if (e.kind === 'pair') return pair(e);
    if (e.kind === 'round') return round(e);
    if (e.kind !== 'milestone') return false;
    if (e.name === 'first_launch') return keys(e, ['kind','name']);
    if (e.name === 'course_unlocked') return keys(e, ['kind','name','course','revision']) && matches(e.course, course) && matches(e.revision, revision);
    return oneOf(e.name, ['pair_finished','trophy_won']) && keys(e, ['kind','name','context']) && context(e.context);
  });
}
// Canonical order independent of request JSON key ordering. This is game content, never an attempt or install key.
const token = (parts: (string | number)[]) => Buffer.from(JSON.stringify(parts)).toString('base64url');
export function contentToken(e: Event) {
  if ('context' in e) return token([e.context.course, e.context.revision, e.context.pair, e.context.slug]);
  if ('course' in e) return token([e.course, e.revision]);
  return 'install';
}
// Upper bucket bounds for tries to a first finish, and the clamp for a first finish's strokes over par.
const attemptBuckets = [1,2,3,4,5,7,10,15,20,50,100,1000], overPar = { min: -3, max: 10 };
const bucket = (value: number, boundaries: number[]) => String(boundaries.find(v => value <= v) ?? boundaries.at(-1));
export function counterUpdates(batch: Batch): Update[] {
  const totals = new Map<string, number>();
  // Zero sums are skipped: a missing field reads as 0 and never spends the daily field budget.
  function add(c: string, metric: string, by = 1) { if (by) { const field = `${c}|${metric}`; totals.set(field, (totals.get(field) ?? 0) + by); } }
  for (const e of batch.events) {
    const c = contentToken(e);
    if (e.kind === 'milestone') { add(c, `milestone.${e.name}`); continue; }
    if (e.kind === 'round') {
      if (e.action === 'started') { add(c, 'round.started'); if (e.first) add(c, 'round.started.first'); }
      if (e.action === 'left') add(c, `round.left.${e.pair}`);
      if (e.action === 'finished') {
        add(c, 'round.finished'); add(c, `medal.${e.medal}`); if (e.best) add(c, 'round.best');
        add(c, 'sum.round.strokes', e.strokes); add(c, 'sum.round.par', e.par);
      }
      continue;
    }
    add(c, `outcome.${e.outcome}`); if (e.replay) add(c, `replay.${e.outcome}`); if (e.mode === 'single') add(c, `single.${e.outcome}`);
    for (const field of ['swings','mirrorSwings','water','aces'] as const) add(c, `sum.${field}`, e[field]);
    add(c, `sum.${e.outcome}.seconds`, e.seconds);
    if (e.outcome !== 'finished') continue;
    // A first finish (not a replay) is the difficulty signal; replays are mostly players chasing the trophy.
    const finish = e.replay ? 'replay' : 'first', [a,b] = e.strokes;
    add(c, `sum.${finish}.strokesA`, a); add(c, `sum.${finish}.strokesB`, b); add(c, `sum.${finish}.par`, e.par);
    if (a + b <= e.par) add(c, `${finish}.atOrUnderPar`);
    if (e.doubleAce) add(c, `${finish}.doubleAce`);
    if (e.replay) continue;
    add(c, `first.overPar.${Math.min(overPar.max, Math.max(overPar.min, a + b - e.par))}`);
    add(c, `attempt.${bucket(e.attempt, attemptBuckets)}`); add(c, 'sum.first.attempt', e.attempt);
  }
  return [...totals].map(([field,by]) => ({field,by}));
}
function authorized(given: string, expected: string) {
  if (!expected) return false;
  return timingSafeEqual(createHash('sha256').update(given).digest(), createHash('sha256').update(expected).digest());
}
const headers = { 'Cache-Control': 'no-store' };
const status = (code: number) => new Response(null, {status: code, headers});
export async function handleEvents(request: Request, deps: { store: DoublePuttStore; appKey: string; now?: () => Date }): Promise<Response> {
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
    const ok = await deps.store.write(day, build, [...new Set(value.events.map(contentToken))], counterUpdates(value));
    return status(ok ? 204 : 429);
  } catch { return status(503); } // Never log errors or requests that may contain bodies/network metadata.
}
// Display order only, not a registry: courses not listed here sort after these, alphabetically.
const courseOrder = ['daybreak', 'nightfall', 'thunderhead', 'midway', 'bigtop', 'fireworks'];
const courseRank = (c: string) => { const i = courseOrder.indexOf(c); return i < 0 ? courseOrder.length : i; };
// Same course: newest revision first (`2026-10-15.10` after `.9`).
const byCourse = (a: {course: string; revision: string}, b: {course: string; revision: string}) =>
  courseRank(a.course) - courseRank(b.course) || a.course.localeCompare(b.course) || b.revision.localeCompare(a.revision, 'en', {numeric: true});
// Builds are `channel:version:build`; newer versions first (1.2 = 1.2.0), then newer build numbers.
function newerBuildFirst(a: string, b: string) {
  const parts = (x: string) => { const [,version = '',build = ''] = x.split(':'); return {version: version.split('.').map(Number), build: Number(build)}; };
  const [pa,pb] = [parts(a),parts(b)];
  for (let i = 0; i < Math.max(pa.version.length,pb.version.length); i++) { const d = (pb.version[i] ?? 0) - (pa.version[i] ?? 0); if (d) return d; }
  return pb.build - pa.build || a.localeCompare(b);
}
type Content = { kind: 'pair'; context: Context } | { kind: 'course'; course: string; revision: string } | { kind: 'install' };
function decode(t: string): Content | null {
  if (t === 'install') return {kind: 'install'};
  try {
    const p: unknown = JSON.parse(Buffer.from(t, 'base64url').toString());
    if (Array.isArray(p) && p.length === 4) return {kind: 'pair', context: {course: String(p[0]), revision: String(p[1]), pair: Number(p[2]), slug: String(p[3])}};
    if (Array.isArray(p) && p.length === 2) return {kind: 'course', course: String(p[0]), revision: String(p[1])};
  } catch { /* not a token this file wrote */ }
  return null;
}
const ratio = (n: number, d: number) => d ? n/d : null;
function pairRow(context: Context, counts: Record<string, number>) {
  const n = (k: string) => counts[k] ?? 0;
  const finished = n('outcome.finished'), quits = n('outcome.quit'), abandoned = n('outcome.abandoned');
  const attempts = finished + quits + abandoned, replayFinishes = n('replay.finished'), firstFinishes = finished - replayFinishes;
  const over = (f: string) => n(`sum.${f}.strokesA`) + n(`sum.${f}.strokesB`) - n(`sum.${f}.par`);
  return {...context, attempts, finished, firstFinishes, replayFinishes, quits, abandoned,
    single: n('single.finished') + n('single.quit') + n('single.abandoned'),
    overPar: ratio(over('first') + over('replay'), finished), firstOverPar: ratio(over('first'), firstFinishes),
    atOrUnderPar: ratio(n('first.atOrUnderPar') + n('replay.atOrUnderPar'), finished),
    doubleAces: n('first.doubleAce') + n('replay.doubleAce'),
    triesToFirstFinish: ratio(n('sum.first.attempt'), firstFinishes),
    firstHoleStrokes: firstFinishes ? [n('sum.first.strokesA')/firstFinishes, n('sum.first.strokesB')/firstFinishes] : null,
    waterPerAttempt: ratio(n('sum.water'), attempts), mirrorShare: ratio(n('sum.mirrorSwings'), n('sum.swings')),
    secondsToFinish: ratio(n('sum.finished.seconds'), finished),
    installsFinished: n('milestone.pair_finished'), trophies: n('milestone.trophy_won'), counts};
}
function courseRow(course: string, revision: string, counts: Record<string, number>) {
  const n = (k: string) => counts[k] ?? 0, finished = n('round.finished');
  return {course, revision, started: n('round.started'), firstStarts: n('round.started.first'),
    left: Array.from({length: 9}, (_,i) => n(`round.left.${i+1}`)), finished, best: n('round.best'),
    medals: Object.fromEntries(medals.map(m => [m, n(`medal.${m}`)])) as Record<typeof medals[number], number>,
    overPar: ratio(n('sum.round.strokes') - n('sum.round.par'), finished), unlocks: n('milestone.course_unlocked'), counts};
}
export type PairRow = ReturnType<typeof pairRow>;
export type CourseRow = ReturnType<typeof courseRow>;
export type BuildRow = { build: string; firstLaunches: number; attempts: number; roundsStarted: number; roundsFinished: number };
// Every build in `rows` pooled per pair and per course at one revision, so counts never mix two versions of a pair;
// `builds` keeps a few totals per build. Pairs sort by course (game order), newest revision, then pair.
export function report(rows: Awaited<ReturnType<DoublePuttStore['read']>>) {
  const contents = new Map<string, Record<string, number>>(), builds = new Map<string, BuildRow>();
  for (const row of rows) {
    const b = builds.get(row.build) ?? {build: row.build, firstLaunches: 0, attempts: 0, roundsStarted: 0, roundsFinished: 0};
    builds.set(row.build, b);
    for (const [field,value] of Object.entries(row.counts)) {
      const [t,metric] = field.split('|'); if (!t || !metric) continue;
      const counts = contents.get(t) ?? {}; contents.set(t, counts);
      counts[metric] = (counts[metric] ?? 0) + value;
      if (metric === 'milestone.first_launch') b.firstLaunches += value;
      if (metric.startsWith('outcome.')) b.attempts += value;
      if (metric === 'round.started') b.roundsStarted += value;
      if (metric === 'round.finished') b.roundsFinished += value;
    }
  }
  const pairs: PairRow[] = [], courses: CourseRow[] = [];
  for (const [t,counts] of contents) {
    const c = decode(t);
    if (c?.kind === 'pair') pairs.push(pairRow(c.context, counts));
    if (c?.kind === 'course') courses.push(courseRow(c.course, c.revision, counts));
  }
  return {
    builds: [...builds.values()].sort((a,b) => newerBuildFirst(a.build,b.build)),
    firstLaunches: contents.get('install')?.['milestone.first_launch'] ?? 0,
    pairs: pairs.sort((a,b) => byCourse(a,b) || a.pair - b.pair || a.slug.localeCompare(b.slug)),
    courses: courses.sort(byCourse),
  };
}
export type Report = ReturnType<typeof report> & { from: string; to: string; notes: string[] };
export async function handleStats(request: Request, deps: {store: DoublePuttStore; secret: string; now?: () => Date}): Promise<Response> {
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
    const body: Report = {from,to, notes: ['Anonymous aggregate attempts, not unique people; installs are counted only by once-per-install reports (first launches, first starts, first finishes, trophies, unlocks).', 'Every build in this selection is pooled; filter by build to compare builds. Content revisions stay separate.', 'Strokes over par and tries to a first finish count finished attempts only; read them beside quits.', 'Failed deliveries are dropped; receive-day is not play-day.'], ...report(selected)};
    return Response.json(body, {headers});
  } catch { return status(503); }
}
