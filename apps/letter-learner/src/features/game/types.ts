export type GameMode = 'match' | 'case' | 'tap' | 'sound';
export const ACTIVE_GAME_MODES = ['match', 'case', 'tap', 'sound'] as const satisfies readonly GameMode[];
export type ChallengeModeKey = (typeof ACTIVE_GAME_MODES)[number];

export type SessionType = 'practice' | 'challenge';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type ScoreBand = 'exact' | 'close' | 'almost' | 'far';
export type StarCount = 0 | 1 | 2 | 3;

export type LetterCase = 'lower' | 'upper' | 'mixed';
export type AudioKey =
  | `name:${string}`
  | `sound:${string}`
  | `digraph:${string}`
  | `ui:${string}`
  | `match:lower:${string}`
  | `match:upper:${string}`;

export type LetterOption = {
  id: string;
  label: string;
  value: string;
};

export type FallingLetter = LetterOption & {
  delayMs: number;
  durationMs: number;
  leftPercent: number;
  size: number;
};

export type RoundBase = {
  id: string;
  mode: GameMode;
  prompt: string;
  hint: string;
  difficultyLevel: DifficultyLevel;
};

export type LetterMatchRound = RoundBase & {
  mode: 'match';
  instructionAudioKey: AudioKey;
  target: LetterOption;
  options: LetterOption[];
};

export type CasePairRound = RoundBase & {
  mode: 'case';
  target: LetterOption;
  answer: LetterOption;
  options: LetterOption[];
};

export type TapLetterRound = RoundBase & {
  mode: 'tap';
  target: LetterOption;
  fallingLetters: FallingLetter[];
};

export type SoundMatchRound = RoundBase & {
  mode: 'sound';
  audioKey: AudioKey;
  acceptedValues: string[];
  options: LetterOption[];
  soundLabel: string;
};

export type AnyRound = LetterMatchRound | CasePairRound | TapLetterRound | SoundMatchRound;

export type RoundEvaluation = {
  isCorrect: boolean;
  scoreBand: ScoreBand;
  feedbackKey: string;
  detailLabel?: string;
};

export type GenerateRoundOptions = {
  difficultyLevel: DifficultyLevel;
  sessionType?: SessionType;
};

export type ModeStat = {
  played: number;
  correct: number;
  bestStreak: number;
  currentStreak: number;
};

export type ChallengeBestStars = Record<DifficultyLevel, StarCount>;

export type ChallengeModeProgress = {
  bestStars: ChallengeBestStars;
  lastSelectedDifficulty?: DifficultyLevel;
  lastSelectedPracticeDifficulty?: DifficultyLevel;
};

export type ChallengeProgressSnapshot = Record<ChallengeModeKey, ChallengeModeProgress>;

export type RecentRoundResult = {
  mode: GameMode;
  sessionType?: SessionType;
  difficultyLevel?: DifficultyLevel;
  targetId: string;
  scoreBand: ScoreBand;
  wasCorrect: boolean;
  feedbackKey: string;
  createdAt: string;
};

export type ProgressSnapshot = {
  modeStats: Record<GameMode, ModeStat>;
  challengeProgress: ChallengeProgressSnapshot;
  recentResults: RecentRoundResult[];
};

export type SettingsSnapshot = {
  soundEnabled: boolean;
  reducedMotion: boolean;
};

export type AppSnapshot = {
  progress: ProgressSnapshot;
  settings: SettingsSnapshot;
};
