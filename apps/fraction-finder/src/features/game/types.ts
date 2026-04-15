export type RepresentationType = 'bar' | 'container' | 'meter' | 'circle' | 'line';
export type GameMode = 'find' | 'build' | 'compare' | 'estimate' | 'pour' | 'line';
export type SessionType = 'practice' | 'challenge';
export type BenchmarkCategory = 'benchmark' | 'common' | 'stretch';
export type ScoreBand = 'exact' | 'close' | 'almost' | 'far';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type FractionConcept = {
  id: string;
  numerator: number;
  denominator: number;
  label: string;
  value: number;
  benchmarkCategory: BenchmarkCategory;
  eligibleModes: GameMode[];
  representations: RepresentationType[];
};

export type RoundBase = {
  id: string;
  mode: GameMode;
  prompt: string;
  targetFractionId: string;
  representation: RepresentationType;
  difficultyLevel: DifficultyLevel;
};

export type FindRound = RoundBase & {
  mode: 'find';
  options: string[];
};

export type BuildRound = RoundBase & {
  mode: 'build';
  partitions: number;
};

export type CompareRound = RoundBase & {
  mode: 'compare';
  leftFractionId: string;
  rightFractionId: string;
  leftRepresentation: RepresentationType;
  rightRepresentation: RepresentationType;
};

export type EstimateRound = RoundBase & {
  mode: 'estimate';
  actualValue: number;
  options: string[];
};

export type PourRound = RoundBase & {
  mode: 'pour';
  tolerance: number;
};

export type LineRound = RoundBase & {
  mode: 'line';
  lineMax: number;
  segmentCount: number;
  tolerance: number;
};

export type AnyRound = FindRound | BuildRound | CompareRound | EstimateRound | PourRound | LineRound;

export type RoundEvaluation = {
  isCorrect: boolean;
  scoreBand: ScoreBand;
  feedbackKey: string;
  actualValue?: number;
  nearestFractionId?: string;
  detailLabel?: string;
};

export type GenerateRoundOptions = {
  difficultyLevel: DifficultyLevel;
};

export type ModeStat = {
  played: number;
  correct: number;
  bestStreak: number;
  currentStreak: number;
};

export type StarCount = 0 | 1 | 2 | 3;

export type ChallengeBestStars = Record<DifficultyLevel, StarCount>;

export type ChallengeModeProgress = {
  bestStars: ChallengeBestStars;
  lastSelectedDifficulty?: DifficultyLevel;
};

export type ChallengeProgressSnapshot = {
  find: ChallengeModeProgress;
};

export type FindSessionStats = {
  practice: ModeStat;
};

export type RecentRoundResult = {
  mode: GameMode;
  sessionType?: SessionType;
  difficultyLevel?: DifficultyLevel;
  targetFractionId: string;
  scoreBand: ScoreBand;
  wasCorrect: boolean;
  feedbackKey: string;
  createdAt: string;
};

export type ProgressSnapshot = {
  modeStats: Record<GameMode, ModeStat>;
  sessionStats: {
    find: FindSessionStats;
  };
  challengeProgress: ChallengeProgressSnapshot;
  recentResults: RecentRoundResult[];
};

export type SettingsSnapshot = {
  soundEnabled: boolean;
  reducedMotion: boolean;
  difficultyLevel: DifficultyLevel;
  preferredRepresentation: 'mixed' | 'bar' | 'container';
};

export type AppSnapshot = {
  progress: ProgressSnapshot;
  settings: SettingsSnapshot;
};
