import assert from 'node:assert/strict';
import { sign } from 'node:crypto';
import test from 'node:test';
import { signedPayload, verifyGameCenterIdentity } from '../src/lib/apex-identity.ts';
import {
  bucketOf, friendLimits, handleFriendGhost, handleFriends, handleGhost, handleLaps, handleRival, handleStanding, histogram,
  lapUpdates, pickRival, playerKey, playerToken, rivalPick, validateFriends, validateGhost, validateLaps, type ApexStore,
  type FriendTime, type GhostUpload, type LapBatch, type Standing, type StoredGhost,
} from '../src/lib/apex-laps.ts';

// A throwaway self-signed key and certificate standing in for Game Center's, for these tests only.
const testCertificate = Buffer.from('MIIDIzCCAgugAwIBAgIUQlNKnBsUp+rzIR3lCiD9kYQaEcIwDQYJKoZIhvcNAQELBQAwIDEeMBwGA1UEAwwVQXBleCBUZXN0IEdhbWUgQ2VudGVyMCAXDTI2MTAxMzE1NTQwN1oYDzIxMjYwOTE5MTU1NDA3WjAgMR4wHAYDVQQDDBVBcGV4IFRlc3QgR2FtZSBDZW50ZXIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC7gN4++wGQGn4w+Rn7bSe/BuxlUrpkjrZopjNOuGw9JXNQcojNXlK1HC7G9tnNRHadGgIoVOyP0L1mMNLei5lJ+7VAspvYPQUguNSV4nFUdrMSMzsIVMsNCO1ZpuDOVnMHlX0dF84URI46FbDQXoUSh6/D/8sXgnj2Yxu2k1QqD7W8ldEg2Y/l9GrHX8wF9E6Ii1C/8tOq5bKLYqdP95HXKHRwCsTkg9M12765JUePJRe9/SR+z6d+POXtsUQsTKP9ZCAzzNbKk4JqBoPhLeUrtNkmPN+3+pC8EZ9M6dUkUHR8yLc+lBWYY5wE8lRPiPSlpgdW5l9ADIccz6ofj/uHAgMBAAGjUzBRMB0GA1UdDgQWBBSiMKACfygSzt1YANw1aNBftdCCcjAfBgNVHSMEGDAWgBSiMKACfygSzt1YANw1aNBftdCCcjAPBgNVHRMBAf8EBTADAQH/MA0GCSqGSIb3DQEBCwUAA4IBAQCrzRRd7lK23i9yJ0+lPiX9qR1PhwcZvmzLHlE577uz45Dyvj9Jo5VZfFMH2xDuM9oStzxNwsh1oKplyTOlxHAhtUtMHuHKXPK1vMu/7qMChMvmbAa4XC6SIlth8LnnpE6QNOcxIyaa8oBlYH7cnhoFiysEGrz37n8cLokJmaVOIulz/xfM2QloX8yZSOWXE9VAOKOKpQ8XIr9nw81RpKqmhn8ddXRtojX0DawOtIopmopFLoeg+fGO6+D0BEm0eKXM7b+VaSRE+wfAfK2OyWGru+1ZjwSeULigu4RmDVKNf/cC6vs+djMsw+seXkz8O4xUkAyMzQG16+kvhXhqO4ph', 'base64');
const testKey = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7gN4++wGQGn4w
+Rn7bSe/BuxlUrpkjrZopjNOuGw9JXNQcojNXlK1HC7G9tnNRHadGgIoVOyP0L1m
MNLei5lJ+7VAspvYPQUguNSV4nFUdrMSMzsIVMsNCO1ZpuDOVnMHlX0dF84URI46
FbDQXoUSh6/D/8sXgnj2Yxu2k1QqD7W8ldEg2Y/l9GrHX8wF9E6Ii1C/8tOq5bKL
YqdP95HXKHRwCsTkg9M12765JUePJRe9/SR+z6d+POXtsUQsTKP9ZCAzzNbKk4Jq
BoPhLeUrtNkmPN+3+pC8EZ9M6dUkUHR8yLc+lBWYY5wE8lRPiPSlpgdW5l9ADIcc
z6ofj/uHAgMBAAECggEAMBV7qQ4ImBJbMybmdVZIP5JAdDlzaE860vpwJOthgorE
mChPEc9zCVPpYQez0hKREne1fu9MXRMsRvUVVpHZJSJiGG3VTm5TjtEnXyqbYoww
HuY5aMkJ61VTPM7xTqjXxeWdmKTeqc7s5FNkrQLYQGjAd9R0mhpQ9+pxlHASwNgn
BxIzgzcls64nDEz6dCN9lgVicJJB0hnQFz+WNyAZ9UVji8zZZxAzphyio9YJXbgm
t0F91hP4gBJF3eVoQUiMkiDuoZlZjN5N9rAPGXvlYu8AeVD8lZNYY/kaMZV3lnD8
Oiouka3jT12dflL8uUvU9EX1lGcw+mNGYcvdPPsu8QKBgQDla/E9Svp7vXyBtcPU
CmUHWLGi7Y4Pa0RvX8QF5SGQhCP6vWeaez3rJ6vanQqV1Lsxmxbc6IqzywD9fzt0
UhUR7QGQN23G4Dx559Xmi7X7LN5MHfu4nPOxw/+OM/9SQHFLUNjP0WB8NckB2f2k
q6DpxzfFHP2f4y4qXN2zHh32EQKBgQDRObzfHzJglpl0s/3ikHxbM6yN33uSIwOi
+uGrAqh5j8YA17bR2j+sWwtgKUj5Zj90ltvvgXcQkIQCsHEiIkSz8/Q9QGvmkHMI
V1N98Iwqz6KcSkGYk7CWs95V77nJ2clx239L4J/NIAZs7dgxizTgotAsbGRlj2PU
kqQPKpDgFwKBgDx7CVzMMF6ApJsZTOfQWbPnGOVH1OSRtbfaujWHoyKTA10to2th
RACDM9XtAoZfT34TUaKpFy+wu7EYYpcWsIFKRtg7FJCSOr80c/pUKIRv3qaYXOzd
S404i110rcGERZnCVXXrz5DPKQ945VoM+N3IbBZlvyLwZBI86yE2NlXRAoGALRzo
96cvYpo2Xm6M+LQ0zCl5NGISr/Dy0MqNrCT3lLaGeBoLJnaLsiszabmdLYF5fzck
FyFwPdcbT8Uhr7152N9qM2bXnTBaTVse+pHKd1Sr+E0elbqKogQIlbkJ81cNU4qD
iSXW7xDPsd8a9ZvRe/o/LsT0ZN2lJem0jDyeXmMCgYEA1sLpvFrTSB/fCVJ/sTqp
J3CCvq674ZoOsjf7a5B6Cdv6xAF8DlRg0mDGOE+WU1M+u8VCANdvS/thG+Gd+8nB
RHztHIg7V8FhHzD/DsnJLl6r8rz8dtGds/VT9H1bP4rQdYvWGCvgdT2eexJ6vJMA
t5gaYE7G7vg9UGR+OhwnwmU=
-----END PRIVATE KEY-----`;

const lapBatch = (): LapBatch => ({schema: 1, appVersion: '0.1.0', build: '1', channel: 'debug', laps: [
  {track: 'ardennes', revision: 1, physics: 1, ms: 28_598, splits: [10_204, 19_877], walls: 2},
]});
const trace = (ms: number) => {
  const count = Math.floor(ms * 30 / 1000);
  return {s: Array.from({length: count}, (_, i) => i * 140), n: Array(count).fill(-12), psi: Array(count).fill(35)};
};
const now = Date.parse('2027-01-01T00:00:00Z'); // inside the test certificate's validity
function identity(player: string, bundle = 'com.kraigstrong.apex', timestamp = now) {
  const salt = Buffer.from('0123456789abcdef');
  const signature = sign('sha256', signedPayload(player, bundle, timestamp, salt), testKey);
  return {publicKeyURL: 'https://static.gc.apple.com/public-key/gc-prod-10.cer', signature: signature.toString('base64'),
    salt: salt.toString('base64'), timestamp};
}
const upload = (ms = 28_598, player = 'T:_racer1'): GhostUpload => ({schema: 1, track: 'ardennes', revision: 1,
  physics: 1, ms, splits: [10_204, 19_877], player: {id: player, alias: 'Racer One'}, identity: identity(player),
  ghost: trace(ms)});

function memoryStore() {
  const bests = new Map<string, Map<string, number>>();
  const ghosts = new Map<string, StoredGhost>();
  const counted: {day: string; boards: string[]; fields: string[]}[] = [];
  const store: ApexStore = {
    async countLaps(day, boards, updates) { counted.push({day, boards, fields: updates.map(u => u.field)}); return true; },
    async saveBest(board, player, ms, ghost) {
      const times = bests.get(board) ?? new Map<string, number>();
      bests.set(board, times);
      if ((times.get(player) ?? Infinity) <= ms) return;
      times.set(player, ms);
      ghosts.set(`${board}:${player}`, ghost);
    },
    async near(board, targetMs, fromMs, toMs, perSide) {
      const rows = [...(bests.get(board) ?? new Map<string, number>())].filter(([, ms]) => ms >= fromMs && ms <= toMs)
        .map(([player, ms]) => ({player, ms}));
      const slower = rows.filter(r => r.ms >= targetMs).sort((a, b) => a.ms - b.ms).slice(0, perSide);
      const faster = rows.filter(r => r.ms <= targetMs).sort((a, b) => b.ms - a.ms).slice(0, perSide);
      return [...slower, ...faster];
    },
    async ghost(board, player) { return ghosts.get(`${board}:${player}`) ?? null; },
    async rank(board, ms) {
      const times = [...(bests.get(board) ?? new Map<string, number>()).values()];
      return {faster: times.filter(t => t < ms).length, players: times.length};
    },
    async best(board, player) { return bests.get(board)?.get(player) ?? null; },
    async bests(board, players) { return players.map(p => bests.get(board)?.get(p) ?? null); },
    async distribution(board) {
      const counts = new Map<number, number>();
      for (const ms of (bests.get(board) ?? new Map<string, number>()).values()) counts.set(bucketOf(ms), (counts.get(bucketOf(ms)) ?? 0) + 1);
      return counts;
    },
  };
  return {store, bests, counted};
}
const verifyWithTestCertificate = (id: GhostUpload['identity'], player: string, bundle: string) =>
  verifyGameCenterIdentity(id, player, bundle, {fetchCertificate: async () => testCertificate, now: () => now});
const post = (path: string, body: unknown, key = 'key') => new Request(`https://example.test/api/apex/${path}`,
  {method: 'POST', headers: {'X-App-Key': key}, body: JSON.stringify(body)});

test('lap batches are strict, anonymous and bounded', () => {
  assert.equal(validateLaps(lapBatch()), true);
  for (const key of ['playerID', 'installID', 'timestamp', 'device']) {
    assert.equal(validateLaps({...lapBatch(), [key]: 'private'}), false);
    assert.equal(validateLaps({...lapBatch(), laps: [{...lapBatch().laps[0], [key]: 'private'}]}), false);
  }
  for (const change of [{ms: 9_999}, {ms: 120_001}, {ms: 28_598.5}, {splits: [19_877, 10_204]}, {splits: [10_204, 30_000]},
    {walls: -1}, {track: 'Harbor Park'}, {revision: 0}]) {
    assert.equal(validateLaps({...lapBatch(), laps: [{...lapBatch().laps[0], ...change}]}), false, JSON.stringify(change));
  }
  assert.equal(validateLaps({...lapBatch(), laps: Array(26).fill(lapBatch().laps[0])}), false);
});

test('every lap becomes counters per board, never a record', () => {
  const batch = lapBatch();
  batch.laps.push({...batch.laps[0]!, ms: 28_700, walls: 0});
  const fields = Object.fromEntries(lapUpdates(batch).map(u => [u.field, u.by]));
  assert.deepEqual(fields, {'ardennes.r1.p1|laps': 2, 'ardennes.r1.p1|ms.28500': 2,
    'ardennes.r1.p1|walls.2': 1, 'ardennes.r1.p1|walls.0': 1});
});

test('the laps route fails closed and counts valid batches', async () => {
  const {store, counted} = memoryStore();
  assert.equal((await handleLaps(post('laps', lapBatch()), {store, appKey: ''})).status, 401);
  assert.equal((await handleLaps(post('laps', lapBatch(), 'wrong'), {store, appKey: 'key'})).status, 401);
  assert.equal((await handleLaps(post('laps', {...lapBatch(), schema: 2}), {store, appKey: 'key'})).status, 400);
  assert.equal((await handleLaps(post('laps', 'x'.repeat(20_000)), {store, appKey: 'key'})).status, 413);
  const ok = await handleLaps(post('laps', lapBatch()), {store, appKey: 'key', now: () => new Date('2026-10-13T12:00:00Z')});
  assert.equal(ok.status, 204);
  assert.deepEqual(counted[0]?.boards, ['ardennes.r1.p1']);
  assert.equal(counted[0]?.day, '2026-10-13');
});

test('ghosts must match their lap and stay on the track', () => {
  assert.equal(validateGhost(upload()), true);
  const short = upload(); short.ghost = trace(20_000);
  const backwards = upload(); backwards.ghost.s[10] = 0;
  const offTrack = upload(); offTrack.ghost.n[3] = 5_000;
  const named = upload(); named.player.alias = 'bad\u0000name';
  for (const bad of [short, backwards, offTrack, named, {...upload(), extra: true}]) assert.equal(validateGhost(bad), false);
});

test('Game Center identity: a genuine signature passes; anything else fails', async () => {
  const good = identity('T:_racer1');
  assert.equal(await verifyWithTestCertificate(good, 'T:_racer1', 'com.kraigstrong.apex'), true);
  assert.equal(await verifyWithTestCertificate(good, 'T:_someoneElse', 'com.kraigstrong.apex'), false);
  assert.equal(await verifyWithTestCertificate(good, 'T:_racer1', 'com.other.app'), false);
  assert.equal(await verifyWithTestCertificate({...good, publicKeyURL: 'https://evil.example/apple.com.cer'}, 'T:_racer1',
    'com.kraigstrong.apex'), false);
  assert.equal(await verifyWithTestCertificate({...good, publicKeyURL: 'http://static.gc.apple.com/key.cer'}, 'T:_racer1',
    'com.kraigstrong.apex'), false);
  const stale = identity('T:_racer1', 'com.kraigstrong.apex', now - 60 * 60 * 1000);
  assert.equal(await verifyWithTestCertificate(stale, 'T:_racer1', 'com.kraigstrong.apex'), false);
  // Apple doesn't document the timestamp's unit: a signature stamped in seconds verifies too.
  const inSeconds = identity('T:_racer1', 'com.kraigstrong.apex', Math.floor(now / 1000));
  assert.equal(await verifyWithTestCertificate(inSeconds, 'T:_racer1', 'com.kraigstrong.apex'), true);
});

test('the ghosts route keeps each player\'s best under a salted key, never their ID', async () => {
  const {store, bests} = memoryStore();
  const deps = {store, appKey: 'key', playerSalt: 'salt', bundleID: 'com.kraigstrong.apex', verify: verifyWithTestCertificate};
  assert.equal((await handleGhost(post('ghosts', upload()), {...deps, playerSalt: ''})).status, 503);
  const forged = upload(); forged.player.id = 'T:_impostor';
  assert.equal((await handleGhost(post('ghosts', forged), deps)).status, 401);
  assert.equal((await handleGhost(post('ghosts', upload(28_598)), deps)).status, 204);
  assert.equal((await handleGhost(post('ghosts', upload(29_100)), deps)).status, 204);
  const times = bests.get('ardennes.r1.p1')!;
  const key = playerKey(playerToken('T:_racer1'), 'salt');
  assert.deepEqual([...times.keys()], [key]);
  assert.equal(times.get(key), 28_598);
  assert.equal(JSON.stringify([...times.keys()]).includes('racer1'), false);
  assert.equal(JSON.stringify([...times.keys()]).includes(playerToken('T:_racer1')), false);
});

test('rivals beat you by a little, as close to 0.4 s as there is, and are never you', () => {
  const me = 'me';
  const field = [{player: 'way-ahead', ms: 27_000}, {player: 'just-ahead', ms: 28_500}, {player: 'right', ms: 28_150},
    {player: 'near', ms: 28_300}, {player: me, ms: 28_190}];
  assert.equal(pickRival(field, 28_598, me)?.player, 'right');
});

test('with only a few players, the nearest one who beats you at all is the rival, up to 3 s ahead', () => {
  // Nobody 0.15-0.8 s ahead: the nearest faster player, whether a hair or seconds ahead.
  assert.equal(pickRival([{player: 'just-ahead', ms: 28_500}, {player: 'way-ahead', ms: 27_000}], 28_598)?.player, 'just-ahead');
  assert.equal(pickRival([{player: 'way-ahead', ms: 27_000}], 28_598)?.player, 'way-ahead');
  // Too far ahead to chase, or slower: a bot instead.
  assert.equal(pickRival([{player: 'gone', ms: 25_000}], 28_598), undefined);
  assert.equal(pickRival([{player: 'slower', ms: 29_000}, {player: 'tied', ms: 28_598}], 28_598), undefined);
  assert.equal(pickRival([{player: 'me', ms: 27_500}], 28_598, 'me'), undefined);
});

test('the rival route answers with a ghost, or nothing', async () => {
  const {store} = memoryStore();
  const deps = {store, appKey: 'key', playerSalt: 'salt', bundleID: 'com.kraigstrong.apex', verify: verifyWithTestCertificate};
  await handleGhost(post('ghosts', upload(28_150, 'T:_rival')), deps);
  const get = (query: string, player?: string) => new Request(`https://example.test/api/apex/rival?${query}`,
    {headers: {'X-App-Key': 'key', ...(player ? {'X-Apex-Player': playerToken(player)} : {})}});
  const found = await handleRival(get('track=ardennes&revision=1&physics=1&ms=28598', 'T:_me'), deps);
  assert.equal(found.status, 200);
  const ghost = await found.json() as StoredGhost;
  assert.equal(ghost.alias, 'Racer One');
  assert.equal(ghost.ms, 28_150);
  // The rival's own best isn't offered back to them.
  assert.equal((await handleRival(get('track=ardennes&revision=1&physics=1&ms=28598', 'T:_rival'), deps)).status, 204);
  assert.equal((await handleRival(get('track=ardennes&revision=1&physics=1&ms=40000'), deps)).status, 204);
  assert.equal((await handleRival(get('track=../etc&revision=1&physics=1&ms=28598'), deps)).status, 400);
});

const bucketsOf = (times: number[]) => {
  const counts = new Map<number, number>();
  for (const t of times) counts.set(bucketOf(t), (counts.get(bucketOf(t)) ?? 0) + 1);
  return counts;
};

test('histograms use whole quarter-seconds, at most 40 bars, with slow outliers folded into the last', () => {
  assert.deepEqual(histogram(new Map()), {fromMs: 0, widthMs: 250, counts: []});
  assert.deepEqual(histogram(bucketsOf([28_100, 28_300, 28_310, 29_000])), {fromMs: 28_000, widthMs: 250, counts: [1, 2, 0, 0, 1]});
  const field = Array.from({length: 100}, (_, i) => 26_000 + i * 100);
  field.push(115_000);
  const spread = histogram(bucketsOf(field));
  assert.ok(spread.counts.length <= 40);
  assert.equal(spread.widthMs % 250, 0);
  assert.equal(spread.counts.reduce((a, b) => a + b, 0), 101);
  // The 115 s lap didn't stretch the bars out to cover it.
  assert.ok(spread.fromMs + spread.counts.length * spread.widthMs < 40_000);
});

test('standing ranks a lap among other players\' bests, leaving out the asker\'s own', async () => {
  const {store} = memoryStore();
  const deps = {store, appKey: 'key', playerSalt: 'salt', bundleID: 'com.kraigstrong.apex', verify: verifyWithTestCertificate};
  for (const [player, ms] of [['T:_a', 27_400], ['T:_b', 28_100], ['T:_c', 29_900], ['T:_d', 31_500], ['T:_me', 28_400]] as const) {
    await handleGhost(post('ghosts', upload(ms, player)), deps);
  }
  const get = (query: string, player?: string) => new Request(`https://example.test/api/apex/standing?${query}`,
    {headers: {'X-App-Key': 'key', ...(player ? {'X-Apex-Player': playerToken(player)} : {})}});
  const mine = await handleStanding(get('track=ardennes&revision=1&physics=1&ms=28598', 'T:_me'), deps);
  assert.equal(mine.status, 200);
  const standing = await mine.json() as Standing;
  // Of the four others, two are faster than 28.598; the asker's own 28.400 isn't counted.
  assert.equal(standing.faster, 2);
  assert.equal(standing.players, 4);
  assert.equal(standing.histogram.counts.reduce((a, b) => a + b, 0), 4);
  const anonymous = await (await handleStanding(get('track=ardennes&revision=1&physics=1&ms=28598'), deps)).json() as Standing;
  assert.equal(anonymous.faster, 3);
  assert.equal(anonymous.players, 5);
  assert.equal((await handleStanding(get('track=ardennes&revision=1&physics=1&ms=28598'), {...deps, appKey: ''})).status, 401);
  assert.equal((await handleStanding(get('track=ardennes&revision=1&physics=1&ms=abc'), deps)).status, 400);
});

test('only known boards are accepted, so nobody can make the store grow with made-up ones', async () => {
  const {store, bests, counted} = memoryStore();
  const deps = {store, appKey: 'key', playerSalt: 'salt', bundleID: 'com.kraigstrong.apex', verify: verifyWithTestCertificate};
  const madeUp = upload(); madeUp.track = 'made_up_circuit';
  assert.equal((await handleGhost(post('ghosts', madeUp), deps)).status, 400);
  const futurePhysics = upload(); futurePhysics.physics = 3;
  assert.equal((await handleGhost(post('ghosts', futurePhysics), deps)).status, 400);
  assert.equal(bests.size, 0);
  assert.equal((await handleLaps(post('laps', {...lapBatch(), laps: [{...lapBatch().laps[0], track: 'made_up_circuit'}]}),
    {store, appKey: 'key'})).status, 400);
  assert.equal(counted.length, 0);
  for (const track of ['swirl', 'snake', 'mirage', 'island', 'harbor']) assert.equal(validateLaps({...lapBatch(), laps: [{...lapBatch().laps[0], track}]}), true);
  for (const track of ['ardennes', 'swirl', 'snake', 'mirage', 'island', 'harbor']) {
    assert.equal(validateLaps({...lapBatch(), laps: [{...lapBatch().laps[0], track, physics: 2}]}), true, `${track} p2`);
  }
  const get = (path: string) => new Request(`https://example.test/api/apex/${path}?track=made_up_circuit&revision=1&physics=1&ms=28598`,
    {headers: {'X-App-Key': 'key'}});
  assert.equal((await handleRival(get('rival'), deps)).status, 400);
  assert.equal((await handleStanding(get('standing'), deps)).status, 400);
});

test('players are named by a header token, never a raw ID in the URL', async () => {
  const {store} = memoryStore();
  const deps = {store, appKey: 'key', playerSalt: 'salt', bundleID: 'com.kraigstrong.apex', verify: verifyWithTestCertificate};
  await handleGhost(post('ghosts', upload(28_150, 'T:_rival')), deps);
  const ask = (headers: Record<string, string>, query = '') => handleRival(new Request(
    `https://example.test/api/apex/rival?track=ardennes&revision=1&physics=1&ms=28598${query}`,
    {headers: {'X-App-Key': 'key', ...headers}}), deps);
  // The token excludes the player's own ghost; a raw ID anywhere doesn't identify them.
  assert.equal((await ask({'X-Apex-Player': playerToken('T:_rival')})).status, 204);
  assert.equal((await ask({}, '&player=T:_rival')).status, 200);
  assert.equal((await ask({'X-Apex-Player': 'T:_rival'})).status, 400);
});

test('a crowded board still offers the rival nearest the ideal gap', async () => {
  const {store} = memoryStore();
  const deps = {store, appKey: 'key', playerSalt: 'salt', bundleID: 'com.kraigstrong.apex', verify: verifyWithTestCertificate};
  // Far more players just inside the window's fast end than one query side holds, and one right on the target.
  for (let i = 0; i < rivalPick.perSide * 3; i++) {
    await store.saveBest('ardennes.r1.p1', `fast-${i}`, 27_800 + (i % 10), {alias: `Fast ${i}`, ms: 27_800, splits: [], ghost: trace(27_800)});
  }
  await store.saveBest('ardennes.r1.p1', 'ideal', 28_198, {alias: 'Ideal', ms: 28_198, splits: [], ghost: trace(28_198)});
  const found = await handleRival(new Request('https://example.test/api/apex/rival?track=ardennes&revision=1&physics=1&ms=28598',
    {headers: {'X-App-Key': 'key'}}), deps);
  assert.equal(((await found.json()) as StoredGhost).alias, 'Ideal');
});

test('standings count every player, however many there are', async () => {
  const {store} = memoryStore();
  const deps = {store, appKey: 'key', playerSalt: 'salt', bundleID: 'com.kraigstrong.apex', verify: verifyWithTestCertificate};
  for (let i = 0; i < 6_000; i++) {
    await store.saveBest('ardennes.r1.p1', `p${i}`, 26_000 + (i % 80) * 100, {alias: 'P', ms: 0, splits: [], ghost: trace(28_000)});
  }
  const response = await handleStanding(new Request('https://example.test/api/apex/standing?track=ardennes&revision=1&physics=1&ms=30000',
    {headers: {'X-App-Key': 'key'}}), deps);
  const standing = await response.json() as Standing;
  assert.equal(standing.players, 6_000);
  assert.equal(standing.histogram.counts.reduce((a, b) => a + b, 0), 6_000);
});

const friendsQuery = (players: string[], track = 'ardennes') => ({schema: 1, track, revision: 1, physics: 1, players});

test('a friends query names friends by token, a bounded few at a time, on a known board', () => {
  const tokens = ['T:_a', 'T:_b'].map(playerToken);
  assert.equal(validateFriends(friendsQuery(tokens)), true);
  assert.equal(validateFriends(friendsQuery(['T:_a'])), false);
  assert.equal(validateFriends(friendsQuery([tokens[0]!, tokens[0]!])), false);
  assert.equal(validateFriends(friendsQuery([])), false);
  const many = Array.from({length: friendLimits.players + 1}, (_, i) => playerToken(`T:_${i}`));
  assert.equal(validateFriends(friendsQuery(many)), false);
  assert.equal(validateFriends(friendsQuery(tokens, 'made_up_circuit')), false);
  assert.equal(validateFriends({...friendsQuery(tokens), ms: 28_000}), false);
});

test('the friends route says which friends have a best, fastest first, and stores nothing', async () => {
  const {store, bests} = memoryStore();
  const deps = {store, appKey: 'key', playerSalt: 'salt', bundleID: 'com.kraigstrong.apex', verify: verifyWithTestCertificate};
  await handleGhost(post('ghosts', upload(29_200, 'T:_slow')), deps);
  await handleGhost(post('ghosts', upload(28_150, 'T:_quick')), deps);
  await handleGhost(post('ghosts', upload(27_000, 'T:_stranger')), deps);
  const before = JSON.stringify([...bests.get('ardennes.r1.p1')!]);
  const query = friendsQuery(['T:_slow', 'T:_never', 'T:_quick'].map(playerToken));
  const response = await handleFriends(post('friends', query), deps);
  assert.equal(response.status, 200);
  const {friends} = await response.json() as {friends: FriendTime[]};
  assert.deepEqual(friends, [{player: playerToken('T:_quick'), ms: 28_150}, {player: playerToken('T:_slow'), ms: 29_200}]);
  assert.equal(JSON.stringify([...bests.get('ardennes.r1.p1')!]), before);
  assert.equal((await handleFriends(post('friends', query, 'wrong'), deps)).status, 401);
  assert.equal((await handleFriends(post('friends', query), {...deps, playerSalt: ''})).status, 503);
  assert.equal((await handleFriends(post('friends', friendsQuery(['T:_quick'])), deps)).status, 400);
  assert.equal((await handleFriends(post('friends', 'x'.repeat(10_000)), deps)).status, 413);
});

test('a friend\'s ghost is fetched by their token in a header, never an ID in the URL', async () => {
  const {store} = memoryStore();
  const deps = {store, appKey: 'key', playerSalt: 'salt', bundleID: 'com.kraigstrong.apex', verify: verifyWithTestCertificate};
  await handleGhost(post('ghosts', upload(28_150, 'T:_friend')), deps);
  const get = (friend: string | null, track = 'ardennes') => handleFriendGhost(new Request(
    `https://example.test/api/apex/ghosts?track=${track}&revision=1&physics=1`,
    {headers: {'X-App-Key': 'key', ...(friend ? {'X-Apex-Friend': friend} : {})}}), deps);
  const found = await get(playerToken('T:_friend'));
  assert.equal(found.status, 200);
  const ghost = await found.json() as StoredGhost;
  assert.equal(ghost.alias, 'Racer One');
  assert.equal(ghost.ms, 28_150);
  assert.equal((await get(playerToken('T:_nobody'))).status, 204);
  assert.equal((await get('T:_friend')).status, 400);
  assert.equal((await get(null)).status, 400);
  assert.equal((await get(playerToken('T:_friend'), 'made_up_circuit')).status, 400);
});
