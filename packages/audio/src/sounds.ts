// The shared reward sound set. These are suite assets, not product identity:
// any BrightBench app that rewards a correct answer or celebrates a result
// should reach for the same clips so the portfolio sounds like one family.
// Product identity — icons, splash, store metadata — stays app-local.
//
// Trimming, normalization, and per-file measurements are recorded in
// `assets/ui/CREDITS.md`.
export const REWARD_SOUNDS = {
  correct: require('../assets/ui/correct.mp3'),
  crown: require('../assets/ui/crown.mp3'),
  modeTap: require('../assets/ui/mode-tap.mp3'),
  roundNone: require('../assets/ui/round-none.mp3'),
  starDing: require('../assets/ui/star-ding.mp3'),
  suspenseRoll: require('../assets/ui/suspense-roll.mp3'),
  tryAgain: require('../assets/ui/try-again.mp3'),
} as const;

export type RewardSoundKey = keyof typeof REWARD_SOUNDS;
