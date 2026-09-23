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
// it happens after playback instead, comfortably clear of the longest of these
// clips (mode-tap.mp3 is 0.2s).
const INSTANT_SOUND_REWIND_DELAY_MS = 500;

type Player = ReturnType<typeof createAudioPlayer>;

const players = new Map<FeedbackAudioKey, Player>();
const starDingPool: Player[] = [];
const instantRewindTimers = new Map<FeedbackAudioKey, ReturnType<typeof setTimeout>>();
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
    if (!players.has(key)) {
      players.set(key, createAudioPlayer(FEEDBACK_AUDIO_MANIFEST[key]));
    }
  }
}

// Plays a prewarmed one-shot with nothing awaited between the press and the
// sound. Falls back to the general path (and prewarms for next time) if the
// player isn't ready yet.
function playInstantSound(key: (typeof INSTANT_SOUND_KEYS)[number]) {
  const player = players.get(key);

  if (!player) {
    prewarmInstantSounds(true);
    playFeedbackSound(key).catch(() => undefined);
    return;
  }

  player.play();

  const existingTimer = instantRewindTimers.get(key);

  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  instantRewindTimers.set(
    key,
    setTimeout(() => {
      instantRewindTimers.delete(key);

      // This runs detached from any call site, so nothing upstream would catch
      // a throw here. Normalize the result rather than assuming seekTo always
      // hands back a promise.
      try {
        Promise.resolve(player.seekTo(0)).catch(() => undefined);
      } catch {
        // A rewind that fails just means the next press starts where this one
        // ended; never worth taking the app down for.
      }
    }, INSTANT_SOUND_REWIND_DELAY_MS),
  );
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
