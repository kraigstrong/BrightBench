import { createHash, timingSafeEqual } from 'node:crypto';

import { levelIds, worldIds } from './math-reef-ids.ts';

// Math Reef's anonymous analytics: strict validation of the batches the app sends, and the
// counters they become. Only counts are stored, never a payload, an IP, or anything that could
// tell one install from another. The app side is `MathReef/ReefAnalytics.swift` in
// kraigstrong/bigger-fish; its tests pin the exact keys a batch can contain, and so does this file.

export { levelIds, worldIds };

export const channels = ['appstore', 'testflight', 'debug'] as const;
export const outcomes = ['finished', 'quit', 'abandoned'] as const;

export const maxBodyBytes = 32 * 1024;
/** The app's queue holds at most 200 events. */
export const maxEvents = 200;
/**
 * Distinct `channel:appVersion` builds counted per day. The app key is public, so without a cap
 * anyone could invent versions to grow storage and the work a stats read does without bound. Real
 * traffic is a handful of builds (App Store, TestFlight, debug, across a few versions).
 */
export const maxBuildsPerDay = 20;
/**
 * A round is a level's facts plus up to 3 review questions, and at least 10. The largest level
 * today has 13 facts, so no round is over 16; 30 leaves room for new levels while keeping the
 * number of distinct counters someone could create with the (public) app key small.
 */
const minTarget = 10;
const maxTarget = 30;

type Channel = (typeof channels)[number];
type Outcome = (typeof outcomes)[number];

export type MilestoneEvent = { kind: 'milestone'; name: string };
export type RoundEvent = {
  kind: 'round';
  level: string;
  outcome: Outcome;
  correct: number;
  target: number;
  stars?: number;
};
export type AnalyticsBatch = {
  appVersion: string;
  channel: Channel;
  events: (MilestoneEvent | RoundEvent)[];
};

export type ValidationResult = { ok: true; batch: AnalyticsBatch } | { ok: false; reason: string };

const levelSet = new Set<string>(levelIds);
const worldSet = new Set<string>(worldIds);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, allowed: string[]) {
  const keys = Object.keys(value);
  return keys.length === allowed.length && keys.every((key) => allowed.includes(key));
}

function isIntIn(value: unknown, min: number, max: number): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max;
}

export function isMilestoneName(name: string): boolean {
  if (['first_launch', 'first_round', 'paywall_shown', 'unlocked'].includes(name)) return true;
  const level = /^level_(?:started|passed):(.+)$/.exec(name);
  if (level) return levelSet.has(level[1]!);
  const crown = /^crown:([a-z]+):(?:silver|gold)$/.exec(name);
  return crown !== null && worldSet.has(crown[1]!);
}

/** Rejection reasons are fixed strings, so logging one never echoes anything the client sent. */
function validateEvent(event: unknown): string | null {
  if (!isRecord(event)) return 'event is not an object';
  if (event.kind === 'milestone') {
    if (!hasExactKeys(event, ['kind', 'name'])) return 'milestone has unexpected keys';
    if (typeof event.name !== 'string' || !isMilestoneName(event.name)) return 'unknown milestone';
    return null;
  }
  if (event.kind === 'round') {
    const finished = event.outcome === 'finished';
    const keys = ['kind', 'level', 'outcome', 'correct', 'target', ...(finished ? ['stars'] : [])];
    if (!hasExactKeys(event, keys)) return 'round has unexpected or missing keys';
    if (typeof event.level !== 'string' || !levelSet.has(event.level)) return 'unknown level';
    if (!outcomes.includes(event.outcome as Outcome)) return 'unknown outcome';
    if (!isIntIn(event.target, minTarget, maxTarget)) return 'target out of range';
    if (!isIntIn(event.correct, 0, event.target)) return 'correct out of range';
    if (finished && event.correct !== event.target) return 'finished round is incomplete';
    if (finished && !isIntIn(event.stars, 0, 3)) return 'stars out of range';
    return null;
  }
  return 'unknown event kind';
}

/** Accepts a parsed body only if every part of it is exactly what the app sends. */
export function validateBatch(body: unknown): ValidationResult {
  if (!isRecord(body) || !hasExactKeys(body, ['appVersion', 'channel', 'events'])) {
    return { ok: false, reason: 'batch has unexpected or missing keys' };
  }
  if (typeof body.appVersion !== 'string' || !/^\d{1,2}\.\d{1,2}(\.\d{1,2})?$/.test(body.appVersion)) {
    return { ok: false, reason: 'bad appVersion' };
  }
  if (!channels.includes(body.channel as Channel)) return { ok: false, reason: 'unknown channel' };
  if (!Array.isArray(body.events) || body.events.length < 1 || body.events.length > maxEvents) {
    return { ok: false, reason: `events must be 1-${maxEvents} items` };
  }
  for (const event of body.events) {
    const reason = validateEvent(event);
    if (reason) return { ok: false, reason };
  }
  return { ok: true, batch: body as AnalyticsBatch };
}

// MARK: Counters

/** One counter to increment by `by`: a hash field. */
export type CounterUpdate = { key: string; field: string; by: number };

/** `YYYY-MM-DD` in UTC. The app sends no time, so the server's receive date is the only one. */
export function utcDay(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export const counterKeys = {
  milestones: (day: string, channel: string, appVersion: string) => `mr:m:${day}:${channel}:${appVersion}`,
  rounds: (day: string, channel: string, appVersion: string) => `mr:r:${day}:${channel}:${appVersion}`,
  /** The `channel:appVersion` pairs seen on a day, so reads know which hashes exist. */
  builds: (day: string) => `mr:v:${day}`,
};

/** `level|outcome|correct|target|stars`, with `-` for no stars. */
export function roundField(event: RoundEvent): string {
  return [event.level, event.outcome, event.correct, event.target, event.stars ?? '-'].join('|');
}

/** Repeats within a batch become one increment, so a batch costs one command per distinct counter. */
export function counterUpdates(batch: AnalyticsBatch, day: string): CounterUpdate[] {
  const { appVersion, channel } = batch;
  const updates = new Map<string, CounterUpdate>();
  for (const event of batch.events) {
    const [key, field] =
      event.kind === 'milestone'
        ? [counterKeys.milestones(day, channel, appVersion), event.name]
        : [counterKeys.rounds(day, channel, appVersion), roundField(event)];
    const id = `${key}\n${field}`;
    const existing = updates.get(id);
    if (existing) existing.by += 1;
    else updates.set(id, { key, field, by: 1 });
  }
  return [...updates.values()];
}

/** Where counters live: Upstash Redis in production, a map in tests. */
export interface CounterStore {
  /**
   * Applies every update and records the build as seen on `day`, all at once. Returns false, and
   * counts nothing, when `build` is new for the day and `maxBuilds` builds are already counted.
   */
  increment(updates: CounterUpdate[], day: string, build: string, maxBuilds: number): Promise<boolean>;
  /** The builds seen on each day, in order. One round trip. */
  builds(days: string[]): Promise<string[][]>;
  /** The counters in each hash, in order. One round trip. */
  read(keys: string[]): Promise<Record<string, number>[]>;
}

// MARK: Handlers

/** Hashing both sides first gives equal-length inputs, so the comparison can't leak the length. */
function sameSecret(given: string, expected: string): boolean {
  const digest = (value: string) => createHash('sha256').update(value).digest();
  return expected.length > 0 && timingSafeEqual(digest(given), digest(expected));
}

const noStore = { 'Cache-Control': 'no-store' };

function status(code: number): Response {
  return new Response(null, { status: code, headers: noStore });
}

export type EventsDeps = { store: CounterStore; appKey: string; now?: () => Date; log?: (message: string) => void };

/**
 * `POST /api/math-reef/events`. A batch is counted whole or not at all; the app drops a batch
 * either way, so rejecting one loses nothing that matters.
 */
export async function handleEvents(request: Request, deps: EventsDeps): Promise<Response> {
  const log = deps.log ?? (() => {});
  if (!sameSecret(request.headers.get('x-app-key') ?? '', deps.appKey)) return status(401);

  const declared = Number(request.headers.get('content-length') ?? '0');
  if (declared > maxBodyBytes) return status(413);
  const text = await readLimited(request, maxBodyBytes);
  if (text === null) return status(413);

  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch {
    log('math-reef events rejected: not JSON');
    return status(400);
  }
  const result = validateBatch(body);
  if (!result.ok) {
    log(`math-reef events rejected: ${result.reason}`);
    return status(400);
  }

  const day = utcDay((deps.now ?? (() => new Date()))());
  const { batch } = result;
  let counted: boolean;
  try {
    const build = `${batch.channel}:${batch.appVersion}`;
    counted = await deps.store.increment(counterUpdates(batch, day), day, build, maxBuildsPerDay);
  } catch {
    // Upstash errors quote the command; log a fixed string instead.
    log('math-reef events not counted: store unavailable');
    return status(503);
  }
  if (!counted) {
    log('math-reef events not counted: too many builds today');
    return status(429);
  }
  return status(204);
}

/** The body as text, or null once it passes `limit` bytes, without buffering the rest. */
async function readLimited(request: Request, limit: number): Promise<string | null> {
  if (!request.body) return '';
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > limit) {
      await reader.cancel();
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks).toString('utf8');
}

export type StatsDeps = { store: CounterStore; statsSecret: string; now?: () => Date };

const maxStatsDays = 366;

/** Midnight UTC for a real `YYYY-MM-DD` date, or null (so `2026-02-30` doesn't roll over). */
function parseDay(day: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) return null;
  const time = Date.parse(`${day}T00:00:00Z`);
  return Number.isNaN(time) || utcDay(new Date(time)) !== day ? null : time;
}

function daysBetween(from: string, to: string): string[] | null {
  const start = parseDay(from);
  const end = parseDay(to);
  if (start === null || end === null || end < start) return null;
  const days: string[] = [];
  for (let t = start; t <= end; t += 86_400_000) {
    days.push(utcDay(new Date(t)));
    if (days.length > maxStatsDays) return null;
  }
  return days;
}

/**
 * `GET /api/math-reef/stats?from=YYYY-MM-DD&to=YYYY-MM-DD[&channel=][&appVersion=]`, behind
 * `Authorization: Bearer <MATH_REEF_STATS_SECRET>`. Sums the counters over the range; defaults to
 * the last 30 days.
 */
export async function handleStats(request: Request, deps: StatsDeps): Promise<Response> {
  const auth = request.headers.get('authorization') ?? '';
  const given = auth.startsWith('Bearer ') ? auth.slice('Bearer '.length) : '';
  if (!sameSecret(given, deps.statsSecret)) return status(401);

  const url = new URL(request.url);
  const to = url.searchParams.get('to') ?? utcDay((deps.now ?? (() => new Date()))());
  const end = parseDay(to);
  if (end === null) return status(400);
  const from = url.searchParams.get('from') ?? utcDay(new Date(end - 29 * 86_400_000));
  const days = daysBetween(from, to);
  if (!days) return status(400);
  const channel = url.searchParams.get('channel');
  const appVersion = url.searchParams.get('appVersion');

  const milestones: Record<string, number> = {};
  const rounds: Record<string, number> = {};
  const add = (into: Record<string, number>, counts: Record<string, number>) => {
    for (const [field, count] of Object.entries(counts)) into[field] = (into[field] ?? 0) + Number(count);
  };
  // Two round trips however long the range: the builds for every day, then every hash.
  const buildsByDay = await deps.store.builds(days);
  const keys: { milestones: string; rounds: string }[] = [];
  days.forEach((day, index) => {
    for (const build of buildsByDay[index] ?? []) {
      const [buildChannel, buildVersion] = build.split(':') as [string, string];
      if ((channel && buildChannel !== channel) || (appVersion && buildVersion !== appVersion)) continue;
      keys.push({
        milestones: counterKeys.milestones(day, buildChannel, buildVersion),
        rounds: counterKeys.rounds(day, buildChannel, buildVersion),
      });
    }
  });
  const hashes = await deps.store.read(keys.flatMap((pair) => [pair.milestones, pair.rounds]));
  hashes.forEach((counts, index) => add(index % 2 === 0 ? milestones : rounds, counts));
  return Response.json(
    { from, to, channel: channel ?? 'all', appVersion: appVersion ?? 'all', milestones, rounds },
    { headers: noStore },
  );
}
