import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

import { REWARD_SOUNDS, type RewardSoundKey } from './sounds';

type Player = ReturnType<typeof createAudioPlayer>;

// Overlapping one-shots need separate players or the newest play() rewinds the
// player out from under the one still ringing. Three is enough for the densest
// run we have: star dings land roughly 0.4-0.6s apart during a results reveal
// while each ding rings out for about a second.
export const DEFAULT_POOL_SIZE = 3;

// A finished player sits at the end of its clip, so it needs rewinding before
// it can sound again. Doing that on the press itself is exactly what the
// instant path avoids, so it happens after playback instead, clear of the
// clip's length (the mode-tap clip these constants were tuned against is 0.2s)
// plus room for playback to start.
export const DEFAULT_INSTANT_REWIND_DELAY_MS = 300;

// Module-level caches. Players are cheap to keep and expensive to build on the
// hot path, so they live for the lifetime of the app process.
const players = new Map<RewardSoundKey, Player>();
const overlapPools = new Map<RewardSoundKey, Player[]>();
const overlapCursors = new Map<RewardSoundKey, number>();
const instantPools = new Map<RewardSoundKey, Player[]>();
const instantCursors = new Map<RewardSoundKey, number>();
let audioModeConfigured = false;

// Puts the audio session into a mode that still sounds when the device's
// ringer switch is silenced — reward audio is part of the interaction, not
// background media. Safe to call repeatedly; only the first call does work.
export async function configureAudioMode(): Promise<void> {
  if (audioModeConfigured) {
    return;
  }

  audioModeConfigured = true;
  await setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
}

async function getPlayer(key: RewardSoundKey) {
  await configureAudioMode();

  let player = players.get(key);

  if (!player) {
    player = createAudioPlayer(REWARD_SOUNDS[key]);
    players.set(key, player);
  }

  return player;
}

function createPool(key: RewardSoundKey, size: number) {
  return Array.from({ length: size }, () => createAudioPlayer(REWARD_SOUNDS[key]));
}

/**
 * Plays a sound on the shared lazily-created player for that key. Use this for
 * clips that never need to overlap with themselves.
 *
 * Pass `loop` to set the player's loop flag before playback.
 */
export async function playSound(
  key: RewardSoundKey,
  options?: { loop?: boolean },
): Promise<void> {
  const player = await getPlayer(key);

  if (options?.loop !== undefined) {
    player.loop = options.loop;
  }

  // Rewind first so rapid-fire repeats restart the clip instead of getting
  // silently dropped mid-playback.
  await player.seekTo(0).catch(() => undefined);
  player.play();
}

/**
 * Plays a sound on a small round-robin pool so overlapping plays ring together
 * instead of the newest one rewinding the player out from under the previous.
 *
 * Never rejects: a missing or busy player must not break the flow that is
 * making the sound.
 */
export async function playPooledSound(
  key: RewardSoundKey,
  options?: { poolSize?: number },
): Promise<void> {
  await configureAudioMode();

  try {
    let pool = overlapPools.get(key);

    if (!pool || pool.length === 0) {
      pool = createPool(key, options?.poolSize ?? DEFAULT_POOL_SIZE);
      overlapPools.set(key, pool);
      overlapCursors.set(key, 0);
    }

    const cursor = overlapCursors.get(key) ?? 0;
    const player = pool[cursor];

    overlapCursors.set(key, (cursor + 1) % pool.length);

    await player.seekTo(0).catch(() => undefined);
    player.play();
  } catch {
    // A missing or busy player must never break the caller's flow.
  }
}

/**
 * Creates the latency-sensitive players and configures the audio session ahead
 * of the first press, so nothing has to be built while the user is waiting to
 * hear it. Safe to call more than once.
 *
 * Latency-sensitive sounds need this because the general playback path awaits
 * the audio-mode setup and a `seekTo()` bridge round-trip before calling
 * `play()`. When the same press also navigates, the router starts rendering the
 * next screen in between and the click lands after the transition has begun.
 */
export function prewarmInstantSounds(
  keys: readonly RewardSoundKey[],
  options?: { poolSize?: number },
): void {
  configureAudioMode().catch(() => undefined);

  for (const key of keys) {
    if (!instantPools.has(key)) {
      // Presses can land faster than a clip finishes — navigating two screens
      // deep in quick succession — so each key gets several players and rounds
      // through them. A single player would still be sitting at the end of its
      // clip on the second press, which plays nothing.
      instantPools.set(key, createPool(key, options?.poolSize ?? DEFAULT_POOL_SIZE));
      instantCursors.set(key, 0);
    }
  }
}

// Schedules the rewind this player needs before it can sound again. Each player
// owns its timer, so a later press on a different player never postpones this
// one — the bug that pattern causes is silence, not a double-click.
function scheduleInstantRewind(player: Player, delayMs: number) {
  setTimeout(() => {
    // Detached from any call site, so nothing upstream would catch a throw.
    // Normalize the result rather than assuming seekTo returns a promise.
    try {
      // Pause before seeking. A player that has reached the end of its clip was
      // never paused — it is still nominally playing, just out of audio — so
      // seeking it back to 0 makes it play the clip a second time. That is
      // heard as a double click one rewind-delay after the press. Pausing a
      // finished player is a no-op, so this is safe whatever state it is in.
      player.pause();
      Promise.resolve(player.seekTo(0)).catch(() => undefined);
    } catch {
      // A rewind that fails just means the next press on this player starts
      // where this one ended; never worth taking the app down for.
    }
  }, delayMs);
}

/**
 * Plays a prewarmed one-shot with nothing awaited between the press and the
 * sound — fully synchronous. Falls back to the general path (and prewarms for
 * next time) if the pool isn't built yet.
 */
export function playInstantSound(
  key: RewardSoundKey,
  options?: { poolSize?: number; rewindDelayMs?: number },
): void {
  // A press can beat the prewarm — a deep link, or sound switched on
  // mid-session. Building the pool here is still synchronous, so the press is
  // not delayed.
  if (!instantPools.has(key)) {
    prewarmInstantSounds([key], options);
  }

  const pool = instantPools.get(key);

  if (!pool || pool.length === 0) {
    playSound(key).catch(() => undefined);
    return;
  }

  const cursor = instantCursors.get(key) ?? 0;
  const player = pool[cursor];

  instantCursors.set(key, (cursor + 1) % pool.length);

  player.play();
  scheduleInstantRewind(player, options?.rewindDelayMs ?? DEFAULT_INSTANT_REWIND_DELAY_MS);
}

/**
 * Stops and rewinds the shared player for a key.
 *
 * Deliberately does not create a player: if the sound was never started there
 * is nothing to stop, and building one here would make a silent session
 * allocate audio it will never play.
 */
export async function stopSound(key: RewardSoundKey): Promise<void> {
  const player = players.get(key);

  if (!player) {
    return;
  }

  player.pause();
  await player.seekTo(0).catch(() => undefined);
}
