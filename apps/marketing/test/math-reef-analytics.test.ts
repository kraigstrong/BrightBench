import assert from 'node:assert/strict';
import test from 'node:test';

import {
  type CounterStore,
  type CounterUpdate,
  counterUpdates,
  handleEvents,
  handleStats,
  isMilestoneName,
  levelIds,
  maxBodyBytes,
  validateBatch,
} from '../src/lib/math-reef-analytics.ts';

// Exactly what the app sends (see MathReef/ReefAnalytics.swift in kraigstrong/bigger-fish).
const sample = () => ({
  appVersion: '0.2',
  channel: 'testflight',
  events: [
    { kind: 'milestone', name: 'first_launch' },
    { kind: 'milestone', name: 'level_started:add.make10' },
    { kind: 'round', level: 'add.make10', outcome: 'finished', correct: 12, target: 12, stars: 3 },
    { kind: 'round', level: 'add.make10', outcome: 'quit', correct: 4, target: 12 },
    { kind: 'round', level: 'mul.x7', outcome: 'abandoned', correct: 0, target: 13 },
    { kind: 'milestone', name: 'crown:addition:silver' },
  ],
});

function rejects(body: unknown, reason: string) {
  const result = validateBatch(body);
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.reason, reason);
}

class MemoryStore implements CounterStore {
  counts = new Map<string, Map<string, number>>();
  seen = new Map<string, Set<string>>();
  failing = false;
  async increment(updates: CounterUpdate[], day: string, build: string) {
    if (this.failing) throw new Error('command was: ["hincrby", ...]');
    this.seen.set(day, (this.seen.get(day) ?? new Set()).add(build));
    for (const { key, field, by } of updates) {
      const hash = this.counts.get(key) ?? new Map<string, number>();
      hash.set(field, (hash.get(field) ?? 0) + by);
      this.counts.set(key, hash);
    }
  }
  async builds(days: string[]) {
    return days.map((day) => [...(this.seen.get(day) ?? [])]);
  }
  async read(keys: string[]) {
    return keys.map((key) => Object.fromEntries(this.counts.get(key) ?? []));
  }
  async hash(key: string) {
    return (await this.read([key]))[0];
  }
}

const appKey = 'test-app-key';
const statsSecret = 'test-stats-secret';
const fixedDay = () => new Date('2026-10-01T15:00:00Z');

function post(body: unknown, key = appKey) {
  return new Request('https://brightbench.app/api/math-reef/events', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-app-key': key },
    body: typeof body === 'string' ? body : JSON.stringify(body),
  });
}

function stats(query = '', secret = statsSecret) {
  return new Request(`https://brightbench.app/api/math-reef/stats${query}`, {
    headers: { authorization: `Bearer ${secret}` },
  });
}

// MARK: Validation

test('the app sample batch is accepted', () => {
  assert.equal(validateBatch(sample()).ok, true);
});

test('unknown keys are rejected at every level', () => {
  rejects({ ...sample(), deviceId: 'x' }, 'batch has unexpected or missing keys');
  rejects({ appVersion: '0.2', channel: 'debug' }, 'batch has unexpected or missing keys');
  const withExtra = sample();
  (withExtra.events[0] as Record<string, unknown>).time = 1;
  rejects(withExtra, 'milestone has unexpected keys');
  const roundExtra = sample();
  (roundExtra.events[3] as Record<string, unknown>).seconds = 5;
  rejects(roundExtra, 'round has unexpected or missing keys');
});

test('__proto__ is just another unexpected key', () => {
  rejects(JSON.parse('{"appVersion":"0.2","channel":"debug","events":[],"__proto__":{}}'), 'batch has unexpected or missing keys');
  const event = '{"kind":"milestone","name":"first_launch","__proto__":{"x":1}}';
  rejects(JSON.parse(`{"appVersion":"0.2","channel":"debug","events":[${event}]}`), 'milestone has unexpected keys');
});

test('batch fields are checked', () => {
  rejects({ ...sample(), appVersion: 'v1' }, 'bad appVersion');
  rejects({ ...sample(), appVersion: '1.0.0.0' }, 'bad appVersion');
  rejects({ ...sample(), appVersion: '100.0' }, 'bad appVersion');
  rejects({ ...sample(), channel: 'beta' }, 'unknown channel');
  rejects({ ...sample(), events: [] }, 'events must be 1-200 items');
  const many = Array.from({ length: 201 }, () => ({ kind: 'milestone', name: 'first_launch' }));
  rejects({ ...sample(), events: many }, 'events must be 1-200 items');
  assert.equal(validateBatch({ ...sample(), events: many.slice(0, 200) }).ok, true);
});

test('milestone names must be known', () => {
  for (const name of ['first_launch', 'first_round', 'level_started:exp.3', 'level_passed:div.mixed', 'crown:exponents:gold']) {
    assert.equal(isMilestoneName(name), true, name);
  }
  for (const name of ['second_launch', 'level_started:add.nope', 'level_passed:', 'crown:algebra:gold', 'crown:addition:bronze']) {
    assert.equal(isMilestoneName(name), false, name);
  }
  rejects({ ...sample(), events: [{ kind: 'milestone', name: 'level_started:add.nope' }] }, 'unknown milestone');
});

test('round fields are checked', () => {
  const round = (fields: Record<string, unknown>) => ({
    ...sample(),
    events: [{ kind: 'round', level: 'add.make10', outcome: 'quit', correct: 4, target: 12, ...fields }],
  });
  rejects(round({ level: 'add.nope' }), 'unknown level');
  rejects(round({ outcome: 'paused' }), 'unknown outcome');
  rejects(round({ target: 9 }), 'target out of range');
  rejects(round({ target: 31 }), 'target out of range');
  rejects(round({ target: '12' }), 'target out of range');
  rejects(round({ correct: 13 }), 'correct out of range');
  rejects(round({ correct: 1.5 }), 'correct out of range');
  rejects(round({ correct: -1 }), 'correct out of range');
  rejects(round({ stars: 2 }), 'round has unexpected or missing keys');
  rejects(round({ outcome: 'finished' }), 'round has unexpected or missing keys');
  rejects(round({ outcome: 'finished', correct: 11, stars: 2 }), 'finished round is incomplete');
  rejects(round({ outcome: 'finished', correct: 12, stars: 4 }), 'stars out of range');
  rejects(round({ outcome: 'finished', correct: 12, stars: '3' }), 'stars out of range');
  assert.equal(validateBatch(round({ outcome: 'finished', correct: 12, stars: 0 })).ok, true);
});

test('the level list has 64 unique IDs', () => {
  assert.equal(levelIds.length, 64);
  assert.equal(new Set(levelIds).size, 64);
});

// MARK: Counters

test('counters are bucketed by day, channel, and version', () => {
  const result = validateBatch(sample());
  assert.ok(result.ok);
  if (!result.ok) return;
  assert.deepEqual(counterUpdates(result.batch, '2026-10-01'), [
    { key: 'mr:m:2026-10-01:testflight:0.2', field: 'first_launch', by: 1 },
    { key: 'mr:m:2026-10-01:testflight:0.2', field: 'level_started:add.make10', by: 1 },
    { key: 'mr:r:2026-10-01:testflight:0.2', field: 'add.make10|finished|12|12|3', by: 1 },
    { key: 'mr:r:2026-10-01:testflight:0.2', field: 'add.make10|quit|4|12|-', by: 1 },
    { key: 'mr:r:2026-10-01:testflight:0.2', field: 'mul.x7|abandoned|0|13|-', by: 1 },
    { key: 'mr:m:2026-10-01:testflight:0.2', field: 'crown:addition:silver', by: 1 },
  ]);
});

test('repeats in a batch become one increment', () => {
  const quit = { kind: 'round', level: 'add.make10', outcome: 'quit', correct: 4, target: 12 };
  const result = validateBatch({ ...sample(), events: [quit, quit, quit] });
  assert.ok(result.ok);
  if (!result.ok) return;
  assert.deepEqual(counterUpdates(result.batch, '2026-10-01'), [
    { key: 'mr:r:2026-10-01:testflight:0.2', field: 'add.make10|quit|4|12|-', by: 3 },
  ]);
});

// MARK: Events endpoint

test('a valid batch is counted and returns 204', async () => {
  const store = new MemoryStore();
  const response = await handleEvents(post(sample()), { store, appKey, now: fixedDay });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('cache-control'), 'no-store');
  assert.deepEqual(await store.hash('mr:m:2026-10-01:testflight:0.2'), {
    first_launch: 1,
    'level_started:add.make10': 1,
    'crown:addition:silver': 1,
  });
  assert.deepEqual(await store.builds(['2026-10-01']), [['testflight:0.2']]);
});

test('a wrong or missing app key is 401 and nothing is counted', async () => {
  const store = new MemoryStore();
  assert.equal((await handleEvents(post(sample(), 'nope'), { store, appKey })).status, 401);
  assert.equal((await handleEvents(post(sample(), ''), { store, appKey })).status, 401);
  // An unset key on the server never lets anything in.
  assert.equal((await handleEvents(post(sample(), ''), { store, appKey: '' })).status, 401);
  assert.equal(store.counts.size, 0);
});

test('bad bodies are 400 or 413, count nothing, and log no payload', async () => {
  const store = new MemoryStore();
  const logs: string[] = [];
  const deps = { store, appKey, log: (message: string) => logs.push(message) };
  assert.equal((await handleEvents(post('{not json'), deps)).status, 400);
  const bad = sample();
  (bad.events[2] as Record<string, unknown>).level = 'secret-looking-value';
  assert.equal((await handleEvents(post(bad), deps)).status, 400);
  assert.equal((await handleEvents(post('x'.repeat(maxBodyBytes + 1)), deps)).status, 413);
  assert.equal(store.counts.size, 0);
  assert.deepEqual(logs, ['math-reef events rejected: not JSON', 'math-reef events rejected: unknown level']);
});

test('oversized bodies are cut off by Content-Length or while streaming', async () => {
  const store = new MemoryStore();
  const declared = new Request('https://brightbench.app/api/math-reef/events', {
    method: 'POST',
    headers: { 'x-app-key': appKey, 'content-length': String(maxBodyBytes + 1) },
    body: '{}',
  });
  assert.equal((await handleEvents(declared, { store, appKey })).status, 413);

  let pulled = 0;
  const chunk = new Uint8Array(8 * 1024);
  const endless = new ReadableStream<Uint8Array>({
    pull(controller) {
      pulled += 1;
      controller.enqueue(chunk);
    },
  });
  const streamed = new Request('https://brightbench.app/api/math-reef/events', {
    method: 'POST',
    headers: { 'x-app-key': appKey },
    body: endless,
    duplex: 'half',
  } as RequestInit);
  assert.equal((await handleEvents(streamed, { store, appKey })).status, 413);
  assert.ok(pulled <= 6, `read ${pulled} chunks of an endless body`);
  assert.equal(store.counts.size, 0);
});

test('a store failure is 503 with a fixed log line', async () => {
  const store = new MemoryStore();
  store.failing = true;
  const logs: string[] = [];
  const response = await handleEvents(post(sample()), { store, appKey, log: (message) => logs.push(message) });
  assert.equal(response.status, 503);
  assert.deepEqual(logs, ['math-reef events not counted: store unavailable']);
});

// MARK: Stats endpoint

test('stats need the secret', async () => {
  const store = new MemoryStore();
  assert.equal((await handleStats(stats('', 'nope'), { store, statsSecret })).status, 401);
  assert.equal((await handleStats(stats(''), { store, statsSecret: '' })).status, 401);
});

test('stats sum counters across days and filter by channel and version', async () => {
  const store = new MemoryStore();
  const on = (iso: string) => () => new Date(iso);
  await handleEvents(post(sample()), { store, appKey, now: on('2026-10-01T10:00:00Z') });
  await handleEvents(post(sample()), { store, appKey, now: on('2026-10-02T10:00:00Z') });
  await handleEvents(post({ ...sample(), channel: 'debug' }), { store, appKey, now: on('2026-10-02T11:00:00Z') });

  const all = await (await handleStats(stats('?from=2026-10-01&to=2026-10-02'), { store, statsSecret })).json();
  assert.equal(all.milestones.first_launch, 3);
  assert.equal(all.rounds['add.make10|quit|4|12|-'], 3);

  const testflight = await (
    await handleStats(stats('?from=2026-10-01&to=2026-10-02&channel=testflight'), { store, statsSecret })
  ).json();
  assert.equal(testflight.milestones.first_launch, 2);

  const otherVersion = await (
    await handleStats(stats('?from=2026-10-01&to=2026-10-02&appVersion=0.3'), { store, statsSecret })
  ).json();
  assert.deepEqual(otherVersion.milestones, {});
});

test('stats reject bad or huge ranges', async () => {
  const store = new MemoryStore();
  for (const query of [
    '?from=2026-10-05&to=2026-10-01',
    '?from=yesterday&to=2026-10-01',
    '?from=2020-01-01&to=2026-10-01',
    '?to=bad',
    '?to=2026-13-01',
    '?from=2026-02-30&to=2026-03-05',
  ]) {
    assert.equal((await handleStats(stats(query), { store, statsSecret })).status, 400, query);
  }
  const defaults = await (await handleStats(stats(), { store, statsSecret, now: fixedDay })).json();
  assert.equal(defaults.from, '2026-09-02');
  assert.equal(defaults.to, '2026-10-01');
});
