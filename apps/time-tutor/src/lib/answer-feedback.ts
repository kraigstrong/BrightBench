import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';
import * as Haptics from 'expo-haptics';

import { FEEDBACK_AUDIO_MANIFEST, type FeedbackAudioKey } from '@/config/audio-manifest';

const players = new Map<FeedbackAudioKey, ReturnType<typeof createAudioPlayer>>();
let audioModeConfigured = false;

async function playFeedbackSound(key: FeedbackAudioKey) {
  if (!audioModeConfigured) {
    audioModeConfigured = true;
    await setAudioModeAsync({ playsInSilentMode: true }).catch(() => undefined);
  }

  let player = players.get(key);

  if (!player) {
    player = createAudioPlayer(FEEDBACK_AUDIO_MANIFEST[key]);
    players.set(key, player);
  }

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
