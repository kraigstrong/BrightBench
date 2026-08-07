import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { FEEDBACK_AUDIO_MANIFEST, type FeedbackAudioKey } from '@/config/audio-manifest';

const players = new Map<FeedbackAudioKey, ReturnType<typeof createAudioPlayer>>();
let audioModeConfigured = false;

async function getPlayer(key: FeedbackAudioKey) {
  if (!audioModeConfigured) {
    audioModeConfigured = true;
    await setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
  }

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

  const soundKey =
    earnedStars >= 3 ? 'roundPerfect' : earnedStars > 0 ? 'roundPartial' : 'roundNone';

  playFeedbackSound(soundKey).catch(() => undefined);
}

// Loops a short tick while the results-reveal bars are counting up, so the
// silence during that ~3.5s animation feels like a buildup instead of a gap.
export async function startSuspenseLoop(soundEffectsEnabled: boolean) {
  if (!soundEffectsEnabled) {
    return;
  }

  const player = await getPlayer('suspenseTick');

  player.loop = true;
  await player.seekTo(0).catch(() => undefined);
  player.play();
}

export async function stopSuspenseLoop() {
  // Don't lazily create a player here — if sound was off (or the loop was
  // never started), there's nothing to stop.
  const player = players.get('suspenseTick');

  if (!player) {
    return;
  }

  player.pause();
  player.loop = false;
  await player.seekTo(0).catch(() => undefined);
}
