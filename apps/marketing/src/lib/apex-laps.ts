import { createHash, timingSafeEqual } from 'node:crypto';

// The Apex lap service. Keep the wire format in sync with Apex/ApexOnline.swift in kraigstrong/apex-rivals.
//
// Three things are stored, all per board (a circuit at one revision, driven with one physics version):
// - every finished lap, as anonymous daily counters (lap-time and wall-hit histograms), never as raw records;
// - each Game Center player's best lap and its ghost, keyed by a salted hash of their team player ID (never the ID),
//   and a quarter-second histogram of those bests for standings;
// - nothing else: no IPs, devices, sessions or timestamps.
// Only the boards in `apexBoards` are accepted, so no client can make the service store anything for other boards.
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
/** Which of a player's Game Center friends have a best on a board: the app sends their tokens (`playerToken`). */
export type FriendsQuery = Board & { schema: 1; players: string[] };
export type FriendTime = { player: string; ms: number };
export type Update = { field: string; by: number };

export const limits = {
  lapBodyBytes: 16 * 1024, ghostBodyBytes: 96 * 1024, lapsPerBatch: 25, minMs: 10_000, maxMs: 120_000,
  boardsPerDay: 50, ghostSamplesPerSecond: 30,
};
export const retentionDays = 90;
/** A friends query names at most this many players (Game Center friend lists are small). */
export const friendLimits = { players: 100, bodyBytes: 8 * 1024 };
/** A rival beats your best by between `nearestMs` and `farthestMs`, as close to `gapMs` as there is. When nobody does
 * (a board with only a few players, like a group of friends), the nearest player who beats you at all, up to
 * `fallbackMs` ahead, is better to chase than a bot. */
export const rivalPick = { gapMs: 400, nearestMs: 150, farthestMs: 800, fallbackMs: 3000, perSide: 25 };
/** Bests are counted into buckets this wide (ms) for standings. */
export const bucketMs = 250;

/** The boards the service accepts: each circuit at its current revision and physics version. Add a board here, and
 * deploy, before an app version that races it ships. Keep in sync with `TrackLayout.all` in the app. */
export const apexBoards: readonly string[] = [
  'ardennes.r1.p1', 'swirl.r1.p1', 'snake.r1.p1', 'mirage.r1.p1', 'island.r1.p1', 'harbor.r1.p1',
  // Physics 2: softer steering (steerRate 1.6). Builds before it still send p1 laps.
  'ardennes.r1.p2', 'swirl.r1.p2', 'snake.r1.p2', 'mirage.r1.p2', 'island.r1.p2', 'harbor.r1.p2',
];

export interface ApexStore {
  /** Atomic daily counters; false when the day's board cap is reached. */
  countLaps(day: string, boards: string[], updates: Update[]): Promise<boolean>;
  /** Keeps the player's faster lap and, when this one is faster, its ghost and the board's histogram, atomically. */
  saveBest(board: string, player: string, ms: number, ghost: StoredGhost): Promise<void>;
  /** Up to `perSide` players' bests on each side of `targetMs` (nearest first), all within [fromMs, toMs]. */
  near(board: string, targetMs: number, fromMs: number, toMs: number, perSide: number): Promise<{ player: string; ms: number }[]>;
  ghost(board: string, player: string): Promise<StoredGhost | null>;
  /** How many players' bests beat `ms` (strictly), and how many players there are. */
  rank(board: string, ms: number): Promise<{ faster: number; players: number }>;
  /** One player's best, or null. */
  best(board: string, player: string): Promise<number | null>;
  /** Each player's best, or null, in the order asked. */
  bests(board: string, players: string[]): Promise<(number | null)[]>;
  /** Every player's best on the board, counted by `bucketMs` bucket (keyed by the bucket's first millisecond). */
  distribution(board: string): Promise<Map<number, number>>;
  /** Each day's lap counters (the `lapUpdates` fields and their totals), in the order asked; {} for a day with none. */
  lapCounts(days: string[]): Promise<Record<string, number>[]>;
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
const knownBoard = (x: Record<string, unknown>) => board(x) && apexBoards.includes(boardKey(x as Board));

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
    && knownBoard(lap) && lapTime(lap.ms, lap.splits) && integer(lap.walls, 0, 10_000));
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
  if (x.schema !== 1 || !knownBoard(x) || !lapTime(x.ms, x.splits)) return false;
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

export function validateFriends(x: unknown): x is FriendsQuery {
  if (!record(x) || !keys(x, ['schema', 'track', 'revision', 'physics', 'players']) || x.schema !== 1 || !knownBoard(x)) return false;
  const {players} = x;
  return Array.isArray(players) && players.length >= 1 && players.length <= friendLimits.players
    && players.every(p => typeof p === 'string' && validToken(p)) && new Set(players).size === players.length;
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

/** How the app names a player outside a ghost upload: SHA-256 of "apex:" and their team player ID, in hex. It travels
 * in the X-Apex-Player header, so a raw ID never appears in a URL. */
export const playerToken = (id: string) => createHash('sha256').update(`apex:${id}`).digest('hex');
const validToken = (x: string | null): x is string => x !== null && /^[0-9a-f]{64}$/.test(x);

/** Stored in place of a player, so the store never holds an ID or the app's token, only a salted hash of the token. */
export function playerKey(token: string, salt: string) {
  return createHash('sha256').update(`${salt}:${token}`).digest('base64url').slice(0, 32);
}
export const bucketOf = (ms: number) => Math.floor(ms / bucketMs) * bucketMs;

/** The rival to offer someone whose best is `ms`, never themselves: the nearest to `gapMs` faster within the window,
 * or else the nearest faster player up to `fallbackMs` ahead. */
export function pickRival(candidates: { player: string; ms: number }[], ms: number, self?: string) {
  const target = ms - rivalPick.gapMs;
  const faster = candidates.filter(c => c.player !== self && c.ms < ms && c.ms >= ms - rivalPick.fallbackMs);
  const inWindow = faster
    .filter(c => c.ms <= ms - rivalPick.nearestMs && c.ms >= ms - rivalPick.farthestMs)
    .sort((a, b) => Math.abs(a.ms - target) - Math.abs(b.ms - target) || a.ms - b.ms)[0];
  return inWindow ?? faster.sort((a, b) => b.ms - a.ms)[0];
}

export type Histogram = { fromMs: number; widthMs: number; counts: number[] };
export type Standing = { faster: number; players: number; histogram: Histogram };
export const standingLimits = { maxBuckets: 40 };

/** Players' bests (counted per quarter-second bucket) in at most 40 bars of whole quarter-seconds. The slowest 2% fold
 * into the last bar, so one very slow lap doesn't squash everyone else into a few. */
export function histogram(buckets: Map<number, number>): Histogram {
  const filled = [...buckets].filter(([, count]) => count > 0).sort((a, b) => a[0] - b[0]);
  const total = filled.reduce((sum, [, count]) => sum + count, 0);
  if (!total) return {fromMs: 0, widthMs: bucketMs, counts: []};
  const low = filled[0]![0];
  let high = low, seen = 0;
  for (const [start, count] of filled) {
    high = start;
    seen += count;
    if (seen >= Math.ceil(total * 0.98)) break;
  }
  let widthMs = bucketMs;
  while ((high - low) / widthMs + 1 > standingLimits.maxBuckets) widthMs += bucketMs;
  const fromMs = Math.floor(low / widthMs) * widthMs;
  const counts = Array<number>(Math.floor((high - fromMs) / widthMs) + 1).fill(0);
  for (const [start, count] of filled) counts[Math.min(counts.length - 1, Math.floor((start - fromMs) / widthMs))]! += count;
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
    await deps.store.saveBest(boardKey(upload), playerKey(playerToken(upload.player.id), deps.playerSalt), upload.ms,
      {alias: upload.player.alias, ms: upload.ms, splits: upload.splits, ghost: upload.ghost});
    return status(204);
  } catch { return status(503); }
}

/** The board a GET asks about, or null if it isn't one the service accepts. */
function boardOf(request: Request): string | null {
  const params = new URL(request.url).searchParams;
  const query = {track: params.get('track'), revision: Number(params.get('revision')), physics: Number(params.get('physics'))};
  return knownBoard(query) ? boardKey(query as Board) : null;
}

/** The board and lap time a GET asks about, and who's asking (from the X-Apex-Player header), or null if invalid. */
function lookup(request: Request, salt: string) {
  const params = new URL(request.url).searchParams;
  const query = {track: params.get('track'), revision: Number(params.get('revision')), physics: Number(params.get('physics'))};
  const ms = Number(params.get('ms'));
  const token = request.headers.get('x-apex-player');
  if (!knownBoard(query) || !integer(ms, limits.minMs, limits.maxMs) || (token !== null && !validToken(token))) return null;
  return {board: boardKey(query as Board), ms, self: validToken(token) && salt ? playerKey(token, salt) : undefined};
}

/** Where a lap falls among other players' bests on its board: how many beat it, of how many, and their spread. */
export async function handleStanding(request: Request, deps: { store: ApexStore; appKey: string; playerSalt: string }) {
  if (!authorized(request.headers.get('x-app-key') ?? '', deps.appKey)) return status(401);
  const ask = lookup(request, deps.playerSalt);
  if (!ask) return status(400);
  try {
    const [rank, own, buckets] = await Promise.all([deps.store.rank(ask.board, ask.ms),
      ask.self ? deps.store.best(ask.board, ask.self) : null, deps.store.distribution(ask.board)]);
    // Against everyone else: the asker's own best doesn't count.
    if (own !== null) buckets.set(bucketOf(own), (buckets.get(bucketOf(own)) ?? 1) - 1);
    const standing: Standing = {
      faster: rank.faster - (own !== null && own < ask.ms ? 1 : 0),
      players: rank.players - (own !== null ? 1 : 0),
      histogram: histogram(buckets),
    };
    return Response.json(standing, {headers});
  } catch { return status(503); }
}

export async function handleRival(request: Request, deps: { store: ApexStore; appKey: string; playerSalt: string }) {
  if (!authorized(request.headers.get('x-app-key') ?? '', deps.appKey)) return status(401);
  const ask = lookup(request, deps.playerSalt);
  if (!ask) return status(400);
  try {
    // The nearest bests on both sides of the ideal gap, so a crowded board can't hide the best match.
    const candidates = await deps.store.near(ask.board, ask.ms - rivalPick.gapMs, ask.ms - rivalPick.fallbackMs,
      ask.ms - 1, rivalPick.perSide);
    const pick = pickRival(candidates, ask.ms, ask.self);
    const found = pick ? await deps.store.ghost(ask.board, pick.player) : null;
    return found ? Response.json(found, {headers}) : status(204);
  } catch { return status(503); }
}

/** Which of the asker's Game Center friends have a best on the board, fastest first. The app sends each friend's token
 * in the body, so no ID or token appears in a URL. Nothing is stored. */
export async function handleFriends(request: Request, deps: { store: ApexStore; appKey: string; playerSalt: string }) {
  if (!authorized(request.headers.get('x-app-key') ?? '', deps.appKey)) return status(401);
  if (!deps.playerSalt) return status(503);
  const body = await readJSON(request, friendLimits.bodyBytes);
  if (body instanceof Response) return body;
  if (!validateFriends(body.value)) return status(400);
  const {players} = body.value;
  try {
    const bests = await deps.store.bests(boardKey(body.value), players.map(p => playerKey(p, deps.playerSalt)));
    const friends: FriendTime[] = players.flatMap((player, i) => bests[i] == null ? [] : [{player, ms: bests[i]!}])
      .sort((a, b) => a.ms - b.ms);
    return Response.json({friends}, {headers});
  } catch { return status(503); }
}

/** One friend's best lap and ghost on the board, named by their token in the X-Apex-Friend header, or 204. */
export async function handleFriendGhost(request: Request, deps: { store: ApexStore; appKey: string; playerSalt: string }) {
  if (!authorized(request.headers.get('x-app-key') ?? '', deps.appKey)) return status(401);
  if (!deps.playerSalt) return status(503);
  const board = boardOf(request);
  const token = request.headers.get('x-apex-friend');
  if (!board || !validToken(token)) return status(400);
  try {
    const found = await deps.store.ghost(board, playerKey(token, deps.playerSalt));
    return found ? Response.json(found, {headers}) : status(204);
  } catch { return status(503); }
}

/** One board in the stats report: laps in the range, with their lap times (quarter-second buckets, named by their first
 * millisecond) and wall hits per lap (`wallBuckets`), and how many players have a best on it, all time. */
export type BoardStats = {
  board: string; laps: number; players: number; fastestMs: number | null; medianMs: number | null;
  walls: Record<string, number>;
};
export type LapStats = {
  from: string; to: string; boards: BoardStats[]; days: { day: string; laps: Record<string, number> }[]; notes: string[];
};

const physicsOf = (board: string) => Number(board.split('.p').at(-1));

/** Every board the service accepts, and any it has since dropped that still has laps in the range: newest physics
 * first, then in `apexBoards` order. */
export function statsBoards(counts: Record<string, number>[]) {
  const seen = counts.flatMap(day => Object.keys(day).map(field => field.split('|')[0]!));
  return [...new Set([...apexBoards, ...seen])].sort((a, b) => physicsOf(b) - physicsOf(a));
}

/** Sums the range's daily counters per board; `players` holds each board's player count, in `boards` order. */
export function lapStats(days: string[], counts: Record<string, number>[], boards: string[], players: number[]) {
  const totals = new Map<string, number>();
  for (const day of counts) for (const [field, n] of Object.entries(day)) totals.set(field, (totals.get(field) ?? 0) + Number(n));
  const stats: BoardStats[] = boards.map((board, i) => {
    const field = (name: string) => totals.get(`${board}|${name}`) ?? 0;
    const times = [...totals].flatMap(([f, n]) => f.startsWith(`${board}|ms.`) ? [[Number(f.slice(board.length + 4)), n]] : [])
      .sort((a, b) => a[0]! - b[0]!);
    const laps = field('laps');
    let seen = 0;
    const median = times.find(([, n]) => (seen += n!) >= Math.ceil(laps / 2));
    return {board, laps, players: players[i] ?? 0, fastestMs: times[0]?.[0] ?? null, medianMs: median?.[0] ?? null,
      walls: Object.fromEntries(wallBuckets.map(b => [String(b), field(`walls.${b}`)]))};
  });
  const perDay = days.map((day, i) => ({day, laps: Object.fromEntries(Object.entries(counts[i] ?? {})
    .flatMap(([f, n]) => f.endsWith('|laps') ? [[f.slice(0, -5), Number(n)]] : []))}));
  return {boards: stats, days: perDay.reverse()};
}

const isDay = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d))
  && new Date(d).toISOString().slice(0, 10) === d;

/** Kraig's view of the lap counters (the Ghost Thread tab of brightbench.app/stats), behind the stats key every game's
 * stats share: `?from=&to=` are UTC days, the last 30 by default, at most `retentionDays`. */
export async function handleStats(request: Request, deps: { store: ApexStore; secret: string; now?: () => Date }) {
  if (!authorized((request.headers.get('authorization') ?? '').replace(/^Bearer /, ''), deps.secret)) return status(401);
  const params = new URL(request.url).searchParams;
  const to = params.get('to') ?? (deps.now?.() ?? new Date()).toISOString().slice(0, 10);
  const from = params.get('from') ?? (isDay(to) ? new Date(Date.parse(to) - 29 * 86400000).toISOString().slice(0, 10) : '');
  if (!isDay(from) || !isDay(to)) return status(400);
  const count = (Date.parse(to) - Date.parse(from)) / 86400000 + 1;
  if (count < 1 || count > retentionDays) return status(400);
  const days = Array.from({length: count}, (_, i) => new Date(Date.parse(from) + i * 86400000).toISOString().slice(0, 10));
  try {
    const counts = await deps.store.lapCounts(days);
    const boards = statsBoards(counts);
    // A board's player count is everyone with a best on it; rank's `players` counts exactly that.
    const players = await Promise.all(boards.map(async b => (await deps.store.rank(b, limits.minMs)).players));
    const report: LapStats = {from, to, ...lapStats(days, counts, boards, players), notes: [
      'Laps are counted by the UTC day they arrived: laps, not people.',
      'Players are Game Center players with a best on the board, all time; laps from players not signed in count, but they don\'t.',
      'Lap times are quarter-second buckets, shown by their start.',
      'Xcode builds\' laps count too: the counters keep no build or channel. Autopilot laps never upload.',
    ]};
    return Response.json(report, {headers});
  } catch { return status(503); }
}
