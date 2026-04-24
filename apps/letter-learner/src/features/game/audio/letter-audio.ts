import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

import { AUDIO_MANIFEST } from '@/features/game/audio/manifest';
import { AudioKey } from '@/features/game/types';

const players = new Map<AudioKey, ReturnType<typeof createAudioPlayer>>();
let configured = false;

export function hasAudioAsset(audioKey: AudioKey) {
  return audioKey in AUDIO_MANIFEST;
}

export async function playAudioKey(audioKey: AudioKey, enabled: boolean) {
  if (!enabled || !hasAudioAsset(audioKey)) {
    return;
  }

  if (!configured) {
    configured = true;
    await setAudioModeAsync({
      playsInSilentMode: true,
    }).catch(() => undefined);
  }

  const source = AUDIO_MANIFEST[audioKey as keyof typeof AUDIO_MANIFEST];

  if (!source) {
    return;
  }

  let player = players.get(audioKey);

  if (!player) {
    player = createAudioPlayer(source);
    players.set(audioKey, player);
  }

  await player.seekTo(0).catch(() => undefined);
  player.play();
}

export function releaseAudioPlayers() {
  for (const player of players.values()) {
    player.remove();
  }

  players.clear();
}
