export const FEEDBACK_AUDIO_MANIFEST = {
  correct: require('../../assets/audio/ui/correct.mp3'),
  incorrect: require('../../assets/audio/ui/try-again.mp3'),
} as const;

export type FeedbackAudioKey = keyof typeof FEEDBACK_AUDIO_MANIFEST;
