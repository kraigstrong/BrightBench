import {
  playInstantSound,
  playPooledSound,
  playSound,
  prewarmInstantSounds as prewarmSharedInstantSounds,
  stopSound,
  type RewardSoundKey,
} from '@education/audio';
import * as Haptics from 'expo-haptics';

// The mode tap has to be heard the instant the card is pressed, so it gets the
// package's prewarmed synchronous path rather than the general one.
const INSTANT_SOUND_KEYS = ['modeTap'] as const satisfies readonly RewardSoundKey[];

// Creates the latency-sensitive players and configures the audio session ahead
// of the first press, so nothing has to be built while the user is waiting to
// hear it. Safe to call more than once.
export function prewarmInstantSounds(soundEffectsEnabled: boolean) {
  if (!soundEffectsEnabled) {
    return;
  }

  prewarmSharedInstantSounds(INSTANT_SOUND_KEYS);
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

  playSound(isCorrect ? 'correct' : 'tryAgain').catch(() => undefined);
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

  playSound('roundNone').catch(() => undefined);
}

// Plays one bell per star as it pops in. Uses the package's round-robin pool so
// overlapping dings ring together instead of the newest one rewinding the
// player out from under the previous star.
export async function playStarRevealDing(soundEffectsEnabled: boolean) {
  if (!soundEffectsEnabled) {
    return;
  }

  await playPooledSound('starDing');
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

  playSound('crown').catch(() => undefined);
}

// Starts the drum roll under the results reveal. The roll is authored to run
// the length of the reveal and resolve on the final star, so it plays once
// rather than looping. The exported name is kept for the existing call sites.
export async function startSuspenseLoop(soundEffectsEnabled: boolean) {
  if (!soundEffectsEnabled) {
    return;
  }

  await playSound('suspenseRoll', { loop: false });
}

export async function stopSuspenseLoop() {
  // stopSound() deliberately never creates a player — if sound was off (or the
  // roll was never started), there's nothing to stop. This mainly matters when
  // the player skips the reveal and the roll has to be cut short.
  await stopSound('suspenseRoll');
}
