import * as Device from 'expo-device';
import { NativeModules } from 'react-native';

import type { ChallengeBestStars, ChallengeDifficulty, StarCount } from '@/types/time';

// Temporary video-capture shortcut.
// Enable only when launching the iOS simulator from Xcode with:
// -DemoRewardShortcut YES
// The simulator gate keeps this off on physical devices and normal archives.
const demoRewardShortcutLaunchArg =
  NativeModules.SettingsManager?.settings?.DemoRewardShortcut;

export const DEMO_VIDEO_REWARD_SHORTCUT =
  false && demoRewardShortcutLaunchArg === 'YES' && !Device.isDevice;

export const DEMO_VIDEO_SEEDED_STARS: ChallengeBestStars = {
  easy: 3,
  medium: 3,
  hard: 0,
};

export type DemoChallengeResultOverride = {
  accuracy: number;
  score: number;
  stars: StarCount;
};

export function getDemoChallengeResultOverride(
  difficulty: ChallengeDifficulty,
): DemoChallengeResultOverride | null {
  if (!DEMO_VIDEO_REWARD_SHORTCUT || difficulty !== 'hard') {
    return null;
  }

  return {
    accuracy: 90,
    score: 10,
    stars: 3,
  };
}
