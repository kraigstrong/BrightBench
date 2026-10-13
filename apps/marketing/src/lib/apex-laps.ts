import { createHash, timingSafeEqual } from 'node:crypto';

// The Apex lap service. Keep the wire format in sync with Apex/ApexOnline.swift in kraigstrong/apex-rivals.
//
// Three things are stored, all per board (a circuit at one revision, driven with one physics version):
// - every finished lap, as anonymous daily counters (lap-time and wall-hit histograms), never as raw records;
// - each Game Center player's best lap and its ghost, keyed by a salted hash of their team player ID (never the ID);
// - nothing else: no IPs, devices, sessions or timestamps.
export type Board = { track: string; revision: number; physics: number };
export type Lap = Board & { ms: number; splits: number[]; walls: number };
export type LapBatch = { schema: 1; appVersion: string; build: string; channel: 'debug' | 'testflight' | 'appstore'; laps: Lap[] };
/** Tenths of a unit along (s) and across (n) the track, the nose's angle in milliradians: 30 samples a second. */
export type Ghost = { s: number[]; n: number[]; psi: number[] };
export type Identity = { publicKeyURL: string; signature: string; salt: string; timestamp: number };
export type GhostUpload = Board & {
  schema: 1; ms: number; splits: number[]; player: { id: string; alias: string }; identity: Identity; ghost: Ghost;
};
export type StoredGhost = { alias: string; ms: number; splits: number[]; ghost: Ghost };
export type Update = { field: string; by: number };

export const limits = {
  lapBodyBytes: 16 * 1024, ghostBodyBytes: 96 * 1024, lapsPerBatch: 25, minMs: 10_000, maxMs: 120_000,
  boardsPerDay: 50, ghostSamplesPerSecond: 30,
};
export const retentionDays = 90;
/** A rival beats your best by between `nearestMs` and `farthestMs`, as close to `gapMs` as there is. */
export const rivalPick = { gapMs: 400, nearestMs: 150, farthestMs: 800 };

export interface ApexStore {
  /** Atomic daily counters; false when the day's board cap is reached. */
  countLaps(day: string, boards: string[], updates: Update[]): Promise<boolean>;
  /** Keeps the player's faster lap and, when this one is faster, its ghost. */
  saveBest(board: string, player: string, ms: number, ghost: StoredGhost): Promise<void>;
  /** Players whose best on the board is within [fromMs, toMs]. */
  near(board: string, fromMs: number, toMs: number): Promise<{ player: string; ms: number }[]>;
  ghost(board: string, player: string): Promise<StoredGhost | null>;
  /** How many players' bests beat `ms` (strictly), and how many players there are. */
  rank(board: string, ms: number): Promise<{ faster: number; players: number }>;
  /** One player's best, or null. */
  best(board: string, player: string): Promise<number | null>;
  /** Up to `limit` players' bests, fastest first. */
  bests(board: string, limit: number): Promise<{ player: string; ms: number }[]>;
}

const record = (x: unknown): x is Record<string, unknown> => typeof x === 'object' && x !== null && !Array.isArray(x);
function keys(x: Record<string, unknown>, required: string[], optional: string[] = []) {
  return required.every(k => Object.hasOwn(x, k)) && Object.keys(x).every(k => [...required, ...optional].includes(k));
}
const integer = (x: unknown, min: number, max: number): x is number =>
  typeof x === 'number' && Number.isInteger(x) && x >= min && x <= max;

function board(x: Record<string, unknown>): boolean {
  return typeof x.track === 'string' && /^[a-z][a-z0-9_]{0,47}$/.test(x.track)
    && integer(x.revision, 1, 1000) && integer(x.physics, 1, 1000);
}
export const boardKey = (b: Board) => `${b.track}.r${b.revision}.p${b.physics}`;

function lapTime(ms: unknown, splits: unknown): boolean {
  if (!integer(ms, limits.minMs, limits.maxMs) || !Array.isArray(splits) || splits.length > 4) return false;
  let previous = 0;
  for (const split of splits) {
    if (!integer(split, previous + 1, ms - 1)) return false;
    previous = split;
  }
  return true;
}

export function validateLaps(x: unknown): x is LapBatch {
  if (!record(x) || !keys(x, ['schema', 'appVersion', 'build', 'channel', 'laps']) || x.schema !== 1) return false;
  if (typeof x.appVersion !== 'string' || !/^\d{1,3}\.\d{1,3}(\.\d{1,3})?$/.test(x.appVersion)) return false;
  if (typeof x.build !== 'string' || !/^\d{1,9}$/.test(x.build)) return false;
  if (!['debug', 'testflight', 'appstore'].includes(String(x.channel))) return false;
  if (!Array.isArray(x.laps) || x.laps.length < 1 || x.laps.length > limits.lapsPerBatch) return false;
  return x.laps.every((lap: unknown) => record(lap) && keys(lap, ['track', 'revision', 'physics', 'ms', 'splits', 'walls'])
    && board(lap) && lapTime(lap.ms, lap.splits) && integer(lap.walls, 0, 10_000));
}

function ghost(x: unknown, ms: number): x is Ghost {
  if (!record(x) || !keys(x, ['s', 'n', 'psi'])) return false;
  const {s, n, psi} = x;
  if (!Array.isArray(s) || !Array.isArray(n) || !Array.isArray(psi) || s.length !== n.length || s.length !== psi.length) return false;
  const expected = Math.floor(ms * limits.ghostSamplesPerSecond / 1000);
  if (s.length < expected - 2 || s.length > expected + 3) return false;
  let previous = 0;
  for (let i = 0; i < s.length; i++) {
    // Along the lap only ever increases; offsets and angles stay on the track.
    if (!integer(s[i], previous, 200_000) || !integer(n[i], -1000, 1000) || !integer(psi[i], -3142, 3142)) return false;
    previous = s[i] as number;
  }
  return true;
}

export function validateGhost(x: unknown): x is GhostUpload {
  if (!record(x) || !keys(x, ['schema', 'track', 'revision', 'physics', 'ms', 'splits', 'player', 'identity', 'ghost'])) return false;
  if (x.schema !== 1 || !board(x) || !lapTime(x.ms, x.splits)) return false;
  const {player, identity} = x;
  if (!record(player) || !keys(player, ['id', 'alias']) || typeof player.id !== 'string' || !/^[A-Za-z0-9:_.-]{1,80}$/.test(player.id)) return false;
  if (typeof player.alias !== 'string' || player.alias.length < 1 || player.alias.length > 40 || /\p{C}/u.test(player.alias)) return false;
  if (!record(identity) || !keys(identity, ['publicKeyURL', 'signature', 'salt', 'timestamp'])) return false;
  if (typeof identity.publicKeyURL !== 'string' || identity.publicKeyURL.length > 300) return false;
  if (typeof identity.signature !== 'string' || !/^[A-Za-z0-9+/=]{1,2048}$/.test(identity.signature)) return false;
  if (typeof identity.salt !== 'string' || !/^[A-Za-z0-9+/=]{1,256}$/.test(identity.salt)) return false;
  if (!integer(identity.timestamp, 0, Number.MAX_SAFE_INTEGER)) return false;
  return ghost(x.ghost, x.ms as number);
}

const msBucket = (ms: number) => Math.floor(ms / 250) * 250;
const wallBuckets = [0, 1, 2, 3, 5, 10, 20, 10_000];
const wallBucket = (walls: number) => String(wallBuckets.find(b => walls <= b) ?? wallBuckets.at(-1));

/** Every lap becomes counts per board: laps, a 250 ms lap-time histogram, and wall hits. Bounded by construction. */
export function lapUpdates(batch: LapBatch): Update[] {
  const totals = new Map<string, number>();
  const add = (field: string) => totals.set(field, (totals.get(field) ?? 0) + 1);
  for (const lap of batch.laps) {
    const b = boardKey(lap);
    add(`${b}|laps`);
    add(`${b}|ms.${msBucket(lap.ms)}`);
    add(`${b}|walls.${wallBucket(lap.walls)}`);
  }
  return [...totals].map(([field, by]) => ({field, by}));
}

/** Stored in place of a Game Center ID, so the store never holds one. */
export function playerKey(id: string, salt: string) {
  return createHash('sha256').update(`${salt}:${id}`).digest('base64url').slice(0, 32);
}

/** The rival to offer someone whose best is `ms`: the nearest to `gapMs` faster, within the window, never themselves. */
export function pickRival(candidates: { player: string; ms: number }[], ms: number, self?: string) {
  const target = ms - rivalPick.gapMs;
  return candidates
    .filter(c => c.player !== self && c.ms <= ms - rivalPick.nearestMs && c.ms >= ms - rivalPick.farthestMs)
    .sort((a, b) => Math.abs(a.ms - target) - Math.abs(b.ms - target) || a.ms - b.ms)[0];
}

export type Histogram = { fromMs: number; widthMs: number; counts: number[] };
export type Standing = { faster: number; players: number; histogram: Histogram };
export const standingLimits = { maxBuckets: 40, sampled: 5000 };

/** Players' bests in at most 40 buckets of whole quarter-seconds. The slowest 2% fold into the last bucket, so one
 * very slow lap doesn't squash everyone else into a few bars. */
export function histogram(times: number[]): Histogram {
  if (!times.length) return {fromMs: 0, widthMs: 250, counts: []};
  const sorted = [...times].sort((a, b) => a - b);
  const low = sorted[0]!, high = sorted[Math.max(0, Math.ceil(sorted.length * 0.98) - 1)]!;
  let widthMs = 250;
  while ((high - low) / widthMs + 1 > standingLimits.maxBuckets) widthMs += 250;
  const fromMs = Math.floor(low / widthMs) * widthMs;
  const counts = Array<number>(Math.floor((high - fromMs) / widthMs) + 1).fill(0);
  for (const t of sorted) counts[Math.min(counts.length - 1, Math.floor((t - fromMs) / widthMs))]! += 1;
  return {fromMs, widthMs, counts};
}

function authorized(given: string, expected: string) {
  if (!expected) return false;
  return timingSafeEqual(createHash('sha256').update(given).digest(), createHash('sha256').update(expected).digest());
}
const headers = { 'Cache-Control': 'no-store' };
const status = (code: number) => new Response(null, {status: code, headers});

async function readJSON(request: Request, maxBytes: number): Promise<{ value: unknown } | Response> {
  if (Number(request.headers.get('content-length') ?? 0) > maxBytes) return status(413);
  try {
    const reader = request.body?.getReader();
    if (!reader) return status(400);
    let bytes = 0;
    const chunks: Uint8Array[] = [];
    for (;;) {
      const {done, value} = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) { await reader.cancel(); return status(413); }
      chunks.push(value);
    }
    return {value: JSON.parse(Buffer.concat(chunks).toString('utf8'))};
  } catch { return status(400); }
}

// Never log requests, bodies or errors from these routes.
export async function handleLaps(request: Request, deps: { store: ApexStore; appKey: string; now?: () => Date }) {
  if (!authorized(request.headers.get('x-app-key') ?? '', deps.appKey)) return status(401);
  const body = await readJSON(request, limits.lapBodyBytes);
  if (body instanceof Response) return body;
  if (!validateLaps(body.value)) return status(400);
  const day = (deps.now?.() ?? new Date()).toISOString().slice(0, 10);
  try {
    const boards = [...new Set(body.value.laps.map(boardKey))];
    return status(await deps.store.countLaps(day, boards, lapUpdates(body.value)) ? 204 : 429);
  } catch { return status(503); }
}

export type VerifyIdentity = (identity: Identity, playerID: string, bundleID: string) => Promise<boolean>;

export async function handleGhost(request: Request, deps: {
  store: ApexStore; appKey: string; playerSalt: string; bundleID: string; verify: VerifyIdentity;
}) {
  if (!authorized(request.headers.get('x-app-key') ?? '', deps.appKey)) return status(401);
  if (!deps.playerSalt) return status(503);
  const body = await readJSON(request, limits.ghostBodyBytes);
  if (body instanceof Response) return body;
  if (!validateGhost(body.value)) return status(400);
  const upload = body.value;
  try {
    if (!await deps.verify(upload.identity, upload.player.id, deps.bundleID)) return status(401);
    await deps.store.saveBest(boardKey(upload), playerKey(upload.player.id, deps.playerSalt), upload.ms,
      {alias: upload.player.alias, ms: upload.ms, splits: upload.splits, ghost: upload.ghost});
    return status(204);
  } catch { return status(503); }
}

/** Where a lap falls among other players' bests on its board: how many beat it, of how many, and their spread. */
export async function handleStanding(request: Request, deps: { store: ApexStore; appKey: string; playerSalt: string }) {
  if (!authorized(request.headers.get('x-app-key') ?? '', deps.appKey)) return status(401);
  const params = new URL(request.url).searchParams;
  const query = {track: params.get('track'), revision: Number(params.get('revision')), physics: Number(params.get('physics'))};
  const ms = Number(params.get('ms'));
  const player = params.get('player');
  if (!board(query) || !integer(ms, limits.minMs, limits.maxMs)) return status(400);
  if (player !== null && !/^[A-Za-z0-9:_.-]{1,80}$/.test(player)) return status(400);
  try {
    const b = boardKey(query as Board);
    const self = player && deps.playerSalt ? playerKey(player, deps.playerSalt) : undefined;
    const [rank, own, bests] = await Promise.all([deps.store.rank(b, ms), self ? deps.store.best(b, self) : null,
      deps.store.bests(b, standingLimits.sampled)]);
    // Against everyone else: the asker's own best doesn't count.
    const standing: Standing = {
      faster: rank.faster - (own !== null && own < ms ? 1 : 0),
      players: rank.players - (own !== null ? 1 : 0),
      histogram: histogram(bests.filter(row => row.player !== self).map(row => row.ms)),
    };
    return Response.json(standing, {headers});
  } catch { return status(503); }
}

export async function handleRival(request: Request, deps: { store: ApexStore; appKey: string; playerSalt: string }) {
  if (!authorized(request.headers.get('x-app-key') ?? '', deps.appKey)) return status(401);
  const params = new URL(request.url).searchParams;
  const query = {track: params.get('track'), revision: Number(params.get('revision')), physics: Number(params.get('physics'))};
  const ms = Number(params.get('ms'));
  const player = params.get('player');
  if (!board(query) || !integer(ms, limits.minMs, limits.maxMs)) return status(400);
  if (player !== null && !/^[A-Za-z0-9:_.-]{1,80}$/.test(player)) return status(400);
  try {
    const b = boardKey(query as Board);
    const candidates = await deps.store.near(b, ms - rivalPick.farthestMs, ms - rivalPick.nearestMs);
    const self = player && deps.playerSalt ? playerKey(player, deps.playerSalt) : undefined;
    const pick = pickRival(candidates, ms, self);
    const found = pick ? await deps.store.ghost(b, pick.player) : null;
    return found ? Response.json(found, {headers}) : status(204);
  } catch { return status(503); }
}
