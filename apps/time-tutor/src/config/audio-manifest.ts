export const FEEDBACK_AUDIO_MANIFEST = {
  correct: require('../../assets/audio/ui/correct.mp3'),
  crown: require('../../assets/audio/ui/crown.mp3'),
  incorrect: require('../../assets/audio/ui/try-again.mp3'),
  modeTap: require('../../assets/audio/ui/mode-tap.mp3'),
  roundNone: require('../../assets/audio/ui/round-none.mp3'),
  starDing: require('../../assets/audio/ui/star-ding.mp3'),
  suspenseRoll: require('../../assets/audio/ui/suspense-roll.mp3'),
} as const;

export type FeedbackAudioKey = keyof typeof FEEDBACK_AUDIO_MANIFEST;
