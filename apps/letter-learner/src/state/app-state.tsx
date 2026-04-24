import * as Haptics from 'expo-haptics';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

import {
  createDefaultChallengeProgress,
  normalizeChallengeProgress,
  totalStarsForMode,
} from '@/features/game/challenge-stars';
import {
  ACTIVE_GAME_MODES,
  ChallengeBestStars,
  ChallengeModeKey,
  DifficultyLevel,
  GameMode,
  ModeStat,
  ProgressSnapshot,
  RecentRoundResult,
  SettingsSnapshot,
  StarCount,
} from '@/features/game/types';
import { loadSnapshot, saveSnapshot } from '@/lib/storage';

type AppState = {
  hydrated: boolean;
  progress: ProgressSnapshot;
  settings: SettingsSnapshot;
  lastResult: RecentRoundResult | null;
};

type ProgressSnapshotInput = {
  challengeProgress?: Partial<
    Record<
      keyof ProgressSnapshot['challengeProgress'],
      {
        bestStars?: Partial<ChallengeBestStars>;
        lastSelectedDifficulty?: DifficultyLevel;
        lastSelectedPracticeDifficulty?: DifficultyLevel;
      }
    >
  >;
  modeStats?: Partial<Record<GameMode, Partial<ModeStat>>>;
  recentResults?: ProgressSnapshot['recentResults'];
};

type Action =
  | { type: 'hydrate'; progress: ProgressSnapshot; settings: SettingsSnapshot }
  | { type: 'record-round'; payload: RecentRoundResult }
  | {
      type: 'set-challenge-best-stars';
      payload: { difficultyLevel: DifficultyLevel; mode: ChallengeModeKey; stars: StarCount };
    }
  | {
      type: 'set-last-selected-challenge-difficulty';
      payload: { difficultyLevel: DifficultyLevel; mode: ChallengeModeKey };
    }
  | {
      type: 'set-last-selected-practice-difficulty';
      payload: { difficultyLevel: DifficultyLevel; mode: ChallengeModeKey };
    }
  | { type: 'update-settings'; payload: Partial<SettingsSnapshot> }
  | { type: 'clear-last-result' };

type AppContextValue = AppState & {
  recordRound: (result: RecentRoundResult) => void;
  setChallengeBestStars: (
    mode: ChallengeModeKey,
    difficultyLevel: DifficultyLevel,
    stars: StarCount
  ) => void;
  setLastSelectedChallengeDifficulty: (
    mode: ChallengeModeKey,
    difficultyLevel: DifficultyLevel
  ) => void;
  setLastSelectedPracticeDifficulty: (
    mode: ChallengeModeKey,
    difficultyLevel: DifficultyLevel
  ) => void;
  updateSettings: (settings: Partial<SettingsSnapshot>) => void;
  clearLastResult: () => void;
};

export type ProgressMetric = {
  label: string;
  value: string;
};

export type ProgressSummaryData = {
  hasProgress: boolean;
  metrics: ProgressMetric[];
  emptyText?: string;
};

const defaultModeStat: ModeStat = {
  played: 0,
  correct: 0,
  bestStreak: 0,
  currentStreak: 0,
};

export const defaultProgress: ProgressSnapshot = {
  modeStats: {
    match: { ...defaultModeStat },
    case: { ...defaultModeStat },
    tap: { ...defaultModeStat },
    sound: { ...defaultModeStat },
  },
  challengeProgress: createDefaultChallengeProgress(),
  recentResults: [],
};

export const defaultSettings: SettingsSnapshot = {
  soundEnabled: true,
  reducedMotion: false,
};

const initialState: AppState = {
  hydrated: false,
  progress: defaultProgress,
  settings: defaultSettings,
  lastResult: null,
};

export function normalizeProgressSnapshot(progress?: ProgressSnapshotInput | null): ProgressSnapshot {
  return {
    modeStats: ACTIVE_GAME_MODES.reduce((acc, mode) => {
      acc[mode] = { ...defaultModeStat, ...(progress?.modeStats?.[mode] ?? {}) };
      return acc;
    }, {} as ProgressSnapshot['modeStats']),
    challengeProgress: normalizeChallengeProgress(progress?.challengeProgress),
    recentResults: progress?.recentResults ?? [],
  };
}

export function normalizeSettingsSnapshot(
  settings?: Partial<SettingsSnapshot> | null
): SettingsSnapshot {
  if (!settings) {
    return { ...defaultSettings };
  }

  return {
    ...defaultSettings,
    soundEnabled: settings.soundEnabled ?? defaultSettings.soundEnabled,
    reducedMotion: settings.reducedMotion ?? defaultSettings.reducedMotion,
  };
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return {
        ...state,
        hydrated: true,
        progress: action.progress,
        settings: action.settings,
      };
    case 'record-round': {
      const previous = state.progress.modeStats[action.payload.mode];
      const played = previous.played + 1;
      const correct = previous.correct + (action.payload.wasCorrect ? 1 : 0);
      const currentStreak = action.payload.wasCorrect ? previous.currentStreak + 1 : 0;

      return {
        ...state,
        progress: {
          ...state.progress,
          modeStats: {
            ...state.progress.modeStats,
            [action.payload.mode]: {
              played,
              correct,
              currentStreak,
              bestStreak: Math.max(previous.bestStreak, currentStreak),
            },
          },
          recentResults: [action.payload, ...state.progress.recentResults].slice(0, 12),
        },
        lastResult: action.payload,
      };
    }
    case 'set-challenge-best-stars': {
      const current =
        state.progress.challengeProgress[action.payload.mode].bestStars[
          action.payload.difficultyLevel
        ];

      if (action.payload.stars <= current) {
        return state;
      }

      return {
        ...state,
        progress: {
          ...state.progress,
          challengeProgress: {
            ...state.progress.challengeProgress,
            [action.payload.mode]: {
              ...state.progress.challengeProgress[action.payload.mode],
              bestStars: {
                ...state.progress.challengeProgress[action.payload.mode].bestStars,
                [action.payload.difficultyLevel]: action.payload.stars,
              },
            },
          },
        },
      };
    }
    case 'set-last-selected-challenge-difficulty':
      return {
        ...state,
        progress: {
          ...state.progress,
          challengeProgress: {
            ...state.progress.challengeProgress,
            [action.payload.mode]: {
              ...state.progress.challengeProgress[action.payload.mode],
              lastSelectedDifficulty: action.payload.difficultyLevel,
            },
          },
        },
      };
    case 'set-last-selected-practice-difficulty':
      return {
        ...state,
        progress: {
          ...state.progress,
          challengeProgress: {
            ...state.progress.challengeProgress,
            [action.payload.mode]: {
              ...state.progress.challengeProgress[action.payload.mode],
              lastSelectedPracticeDifficulty: action.payload.difficultyLevel,
            },
          },
        },
      };
    case 'update-settings':
      return {
        ...state,
        settings: {
          ...state.settings,
          ...action.payload,
        },
      };
    case 'clear-last-result':
      return {
        ...state,
        lastResult: null,
      };
  }
}

const AppStateContext = createContext<AppContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    loadSnapshot()
      .then((snapshot) => {
        dispatch({
          type: 'hydrate',
          progress: normalizeProgressSnapshot(snapshot?.progress),
          settings: normalizeSettingsSnapshot(snapshot?.settings),
        });
      })
      .catch(() => {
        dispatch({
          type: 'hydrate',
          progress: normalizeProgressSnapshot(),
          settings: normalizeSettingsSnapshot(),
        });
      });
  }, []);

  useEffect(() => {
    if (!state.hydrated) {
      return;
    }

    saveSnapshot({
      progress: state.progress,
      settings: state.settings,
    }).catch(() => undefined);
  }, [state.hydrated, state.progress, state.settings]);

  const value: AppContextValue = {
    ...state,
    recordRound: (result) => {
      if (result.wasCorrect) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => undefined);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => undefined);
      }

      dispatch({ type: 'record-round', payload: result });
    },
    setChallengeBestStars: (mode, difficultyLevel, stars) =>
      dispatch({
        type: 'set-challenge-best-stars',
        payload: { difficultyLevel, mode, stars },
      }),
    setLastSelectedChallengeDifficulty: (mode, difficultyLevel) =>
      dispatch({
        type: 'set-last-selected-challenge-difficulty',
        payload: { difficultyLevel, mode },
      }),
    setLastSelectedPracticeDifficulty: (mode, difficultyLevel) =>
      dispatch({
        type: 'set-last-selected-practice-difficulty',
        payload: { difficultyLevel, mode },
      }),
    updateSettings: (settings) => dispatch({ type: 'update-settings', payload: settings }),
    clearLastResult: () => dispatch({ type: 'clear-last-result' }),
  };

  return <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>;
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }

  return context;
}

function accuracyFromCounts(correct: number, attempts: number) {
  if (!attempts) {
    return 0;
  }

  return Math.round((correct / attempts) * 100);
}

export function accuracyForMode(progress: ProgressSnapshot, mode: GameMode) {
  const stat = progress.modeStats[mode];
  return accuracyFromCounts(stat.correct, stat.played);
}

export function modeProgressSummary(
  progress: ProgressSnapshot,
  mode: GameMode
): ProgressSummaryData {
  const stat = progress.modeStats[mode];

  return {
    hasProgress: stat.played > 0,
    emptyText: 'Ready for your first round.',
    metrics: [
      { label: 'Played', value: String(stat.played) },
      { label: 'Streak', value: String(stat.bestStreak) },
      { label: 'Accuracy', value: `${accuracyForMode(progress, mode)}%` },
    ],
  };
}

export function challengeProgressSummary(
  progress: ProgressSnapshot,
  mode: ChallengeModeKey
): ProgressSummaryData {
  const challenge = progress.challengeProgress[mode];

  return {
    hasProgress: totalStarsForMode(challenge) > 0,
    emptyText: 'Pick a challenge to start earning stars.',
    metrics: [{ label: 'Total Stars', value: String(totalStarsForMode(challenge)) }],
  };
}

export function totalRoundsPlayed(progress: ProgressSnapshot) {
  return ACTIVE_GAME_MODES.reduce((sum, mode) => sum + progress.modeStats[mode].played, 0);
}

export function overallAccuracy(progress: ProgressSnapshot) {
  const played = totalRoundsPlayed(progress);

  if (!played) {
    return 0;
  }

  const correct = ACTIVE_GAME_MODES.reduce(
    (sum, mode) => sum + progress.modeStats[mode].correct,
    0
  );
  return Math.round((correct / played) * 100);
}
