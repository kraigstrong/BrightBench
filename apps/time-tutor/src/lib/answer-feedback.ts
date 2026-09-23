import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { FEEDBACK_AUDIO_MANIFEST, type FeedbackAudioKey } from '@/config/audio-manifest';

// Star dings land roughly 0.4-0.6s apart during the results reveal while each
// ding rings out for about a second, so they need separate players to overlap
// instead of cutting one another off.
const STAR_DING_POOL_SIZE = 3;

// The mode tap has to be heard the instant the card is pressed. The general
// playback path awaits the audio-mode setup and a seekTo() bridge round-trip
// before calling play(), and the router starts rendering the next screen in
// between, so the click lands after the transition has already begun. These
// keys get a player created up front and a fully synchronous play path.
const INSTANT_SOUND_KEYS = ['modeTap'] as const satisfies readonly FeedbackAudioKey[];

// A finished player sits at the end of its clip, so it needs rewinding before
// it can sound again. Doing that on the tap itself is what we're avoiding, so
// it happens after playback instead, clear of the clip's length
// (mode-tap.mp3 is 0.2s) plus room for playback to start.
const INSTANT_SOUND_REWIND_DELAY_MS = 300;

// Presses can land faster than a clip finishes — navigating two screens deep in
// quick succession — so each key gets several players and rounds through them.
// A single player would still be sitting at the end of its clip on the second
// press, which plays nothing.
const INSTANT_SOUND_POOL_SIZE = 3;

type Player = ReturnType<typeof createAudioPlayer>;
type InstantSoundKey = (typeof INSTANT_SOUND_KEYS)[number];

const players = new Map<FeedbackAudioKey, Player>();
const starDingPool: Player[] = [];
const instantPools = new Map<InstantSoundKey, Player[]>();
const instantCursors = new Map<InstantSoundKey, number>();
let nextStarDingIndex = 0;
let audioModeConfigured = false;

async function configureAudioMode() {
  if (audioModeConfigured) {
    return;
  }

  audioModeConfigured = true;
  await setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
}

async function getPlayer(key: FeedbackAudioKey) {
  await configureAudioMode();

  let player = players.get(key);

  if (!player) {
    player = createAudioPlayer(FEEDBACK_AUDIO_MANIFEST[key]);
    players.set(key, player);
  }

  return player;
}

async function playFeedbackSound(key: FeedbackAudioKey) {
  const player = await getPlayer(key);

  // Rewind first so rapid-fire correct answers in Challenge mode restart the
  // chime instead of getting silently dropped mid-playback.
  await player.seekTo(0).catch(() => undefined);
  player.play();
}

// Creates the latency-sensitive players and configures the audio session ahead
// of the first press, so nothing has to be built while the user is waiting to
// hear it. Safe to call more than once.
export function prewarmInstantSounds(soundEffectsEnabled: boolean) {
  if (!soundEffectsEnabled) {
    return;
  }

  configureAudioMode().catch(() => undefined);

  for (const key of INSTANT_SOUND_KEYS) {
    if (!instantPools.has(key)) {
      instantPools.set(
        key,
        Array.from({ length: INSTANT_SOUND_POOL_SIZE }, () =>
          createAudioPlayer(FEEDBACK_AUDIO_MANIFEST[key]),
        ),
      );
      instantCursors.set(key, 0);
    }
  }
}

// Schedules the rewind this player needs before it can sound again. Each player
// owns its timer, so a later press on a different player never postpones this
// one — the bug that pattern causes is silence, not a double-click.
function scheduleInstantRewind(player: Player) {
  setTimeout(() => {
    // Detached from any call site, so nothing upstream would catch a throw.
    // Normalize the result rather than assuming seekTo returns a promise.
    try {
      Promise.resolve(player.seekTo(0)).catch(() => undefined);
    } catch {
      // A rewind that fails just means the next press on this player starts
      // where this one ended; never worth taking the app down for.
    }
  }, INSTANT_SOUND_REWIND_DELAY_MS);
}

// Plays a prewarmed one-shot with nothing awaited between the press and the
// sound. Falls back to the general path (and prewarms for next time) if the
// pool isn't built yet.
function playInstantSound(key: InstantSoundKey) {
  // A press can beat the prewarm — a deep link, or sound switched on mid-session.
  // Building the pool here is still synchronous, so the click is not delayed.
  if (!instantPools.has(key)) {
    prewarmInstantSounds(true);
  }

  const pool = instantPools.get(key);

  if (!pool || pool.length === 0) {
    playFeedbackSound(key).catch(() => undefined);
    return;
  }

  const cursor = instantCursors.get(key) ?? 0;
  const player = pool[cursor];

  instantCursors.set(key, (cursor + 1) % pool.length);

  player.play();
  scheduleInstantRewind(player);
}

export function triggerAnswerFeedback(isCorrect: boolean, soundEffectsEnabled: boolean) {
  if (isCorrect) {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
  } else {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
  }

  if (!soundEffectsEnabled) {
    return;
  }

  playFeedbackSound(isCorrect ? 'correct' : 'incorrect').catch(() => undefined);
}

export function triggerRoundCompleteFeedback(
  earnedStars: number,
  soundEffectsEnabled: boolean,
) {
  const type =
    earnedStars > 0
      ? Haptics.NotificationFeedbackType.Success
      : Haptics.NotificationFeedbackType.Warning;

  Haptics.notificationAsync(type).catch(() => undefined);

  if (!soundEffectsEnabled) {
    return;
  }

  // Earning stars is already scored by the per-star dings during the reveal, so
  // only a starless round needs a summary sound.
  if (earnedStars > 0) {
    return;
  }

  playFeedbackSound('roundNone').catch(() => undefined);
}

// Plays one bell per star as it pops in. Uses a small round-robin pool so
// overlapping dings ring together instead of the newest one rewinding the
// player out from under the previous star.
export async function playStarRevealDing(soundEffectsEnabled: boolean) {
  if (!soundEffectsEnabled) {
    return;
  }

  await configureAudioMode();

  try {
    if (starDingPool.length === 0) {
      for (let index = 0; index < STAR_DING_POOL_SIZE; index += 1) {
        starDingPool.push(createAudioPlayer(FEEDBACK_AUDIO_MANIFEST.starDing));
      }
    }

    const player = starDingPool[nextStarDingIndex];
    nextStarDingIndex = (nextStarDingIndex + 1) % starDingPool.length;

    await player.seekTo(0).catch(() => undefined);
    player.play();
  } catch {
    // A missing or busy player must never break the results reveal.
  }
}

export function playModeTapSound(soundEffectsEnabled: boolean) {
  if (!soundEffectsEnabled) {
    return;
  }

  playInstantSound('modeTap');
}

export function playCrownSound(soundEffectsEnabled: boolean) {
  if (!soundEffectsEnabled) {
    return;
  }

  playFeedbackSound('crown').catch(() => undefined);
}

// Starts the drum roll under the results reveal. The roll is authored to run
// the length of the reveal and resolve on the final star, so it plays once
// rather than looping. The exported name is kept for the existing call sites.
export async function startSuspenseLoop(soundEffectsEnabled: boolean) {
  if (!soundEffectsEnabled) {
    return;
  }

  const player = await getPlayer('suspenseRoll');

  player.loop = false;
  await player.seekTo(0).catch(() => undefined);
  player.play();
}

export async function stopSuspenseLoop() {
  // Don't lazily create a player here — if sound was off (or the roll was
  // never started), there's nothing to stop. This mainly matters when the
  // player skips the reveal and the roll has to be cut short.
  const player = players.get('suspenseRoll');

  if (!player) {
    return;
  }

  player.pause();
  await player.seekTo(0).catch(() => undefined);
}
