import * as Haptics from 'expo-haptics';
import React, { createContext, useContext, useEffect, useReducer } from 'react';

import {
  ChallengeSessionStat,
  FindSessionStats,
  GameMode,
  ProgressSnapshot,
  RecentRoundResult,
  SessionType,
  SettingsSnapshot,
} from '@/features/game/types';
import { loadSnapshot, saveSnapshot } from '@/lib/storage';

type AppState = {
  hydrated: boolean;
  progress: ProgressSnapshot;
  settings: SettingsSnapshot;
  lastResult: RecentRoundResult | null;
};

type ProgressSnapshotInput = {
  modeStats?: Partial<Record<GameMode, Partial<ProgressSnapshot['modeStats'][GameMode]>>>;
  sessionStats?: {
    find?: {
      practice?: Partial<FindSessionStats['practice']>;
      challenge?: Partial<ChallengeSessionStat>;
    };
  };
  recentResults?: ProgressSnapshot['recentResults'];
};

type Action =
  | { type: 'hydrate'; progress: ProgressSnapshot; settings: SettingsSnapshot }
  | { type: 'record-round'; payload: RecentRoundResult }
  | { type: 'start-session'; payload: { mode: 'find'; sessionType: 'challenge' } }
  | {
      type: 'complete-session';
      payload: { mode: 'find'; score: number; sessionType: 'challenge' };
    }
  | { type: 'update-settings'; payload: Partial<SettingsSnapshot> }
  | { type: 'clear-last-result' };

type AppContextValue = AppState & {
  recordRound: (result: RecentRoundResult) => void;
  startSession: (payload: { mode: 'find'; sessionType: 'challenge' }) => void;
  completeSession: (payload: { mode: 'find'; score: number; sessionType: 'challenge' }) => void;
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

const defaultModeStat = {
  played: 0,
  correct: 0,
  bestStreak: 0,
  currentStreak: 0,
};

const defaultChallengeStat: ChallengeSessionStat = {
  played: 0,
  correct: 0,
  attempts: 0,
  highScore: 0,
};

function recomputeFindModeStat(sessionStats: FindSessionStats) {
  return {
    played: sessionStats.practice.played + sessionStats.challenge.attempts,
    correct: sessionStats.practice.correct + sessionStats.challenge.correct,
    bestStreak: sessionStats.practice.bestStreak,
    currentStreak: sessionStats.practice.currentStreak,
  };
}

export const defaultProgress: ProgressSnapshot = {
  modeStats: {
    find: { ...defaultModeStat },
    build: { ...defaultModeStat },
    compare: { ...defaultModeStat },
    estimate: { ...defaultModeStat },
    pour: { ...defaultModeStat },
    line: { ...defaultModeStat },
  },
  sessionStats: {
    find: {
      practice: { ...defaultModeStat },
      challenge: { ...defaultChallengeStat },
    },
  },
  recentResults: [],
};

export const defaultSettings: SettingsSnapshot = {
  soundEnabled: false,
  reducedMotion: false,
  difficultyLevel: 'easy',
  preferredRepresentation: 'mixed',
};

const initialState: AppState = {
  hydrated: false,
  progress: defaultProgress,
  settings: defaultSettings,
  lastResult: null,
};

export function normalizeProgressSnapshot(
  progress?: ProgressSnapshotInput | null
): ProgressSnapshot {
  const practice = {
    ...defaultModeStat,
    ...(progress?.sessionStats?.find?.practice ?? progress?.modeStats?.find ?? {}),
  };
  const challenge = {
    ...defaultChallengeStat,
    ...(progress?.sessionStats?.find?.challenge ?? {}),
  };
  const sessionStats = {
    find: {
      practice,
      challenge,
    },
  };

  return {
    modeStats: {
      find: recomputeFindModeStat(sessionStats.find),
      build: { ...defaultModeStat, ...(progress?.modeStats?.build ?? {}) },
      compare: { ...defaultModeStat, ...(progress?.modeStats?.compare ?? {}) },
      estimate: { ...defaultModeStat, ...(progress?.modeStats?.estimate ?? {}) },
      pour: { ...defaultModeStat, ...(progress?.modeStats?.pour ?? {}) },
      line: { ...defaultModeStat, ...(progress?.modeStats?.line ?? {}) },
    },
    sessionStats,
    recentResults: progress?.recentResults ?? [],
  };
}

export function normalizeSettingsSnapshot(
  settings?: Partial<SettingsSnapshot> | null
): SettingsSnapshot {
  return {
    ...defaultSettings,
    ...settings,
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
      if (action.payload.mode === 'find') {
        const sessionType = action.payload.sessionType ?? 'practice';

        if (sessionType === 'challenge') {
          const previousChallenge = state.progress.sessionStats.find.challenge;
          const challenge = {
            ...previousChallenge,
            attempts: previousChallenge.attempts + 1,
            correct: previousChallenge.correct + (action.payload.wasCorrect ? 1 : 0),
          };
          const sessionStats = {
            ...state.progress.sessionStats,
            find: {
              ...state.progress.sessionStats.find,
              challenge,
            },
          };

          return {
            ...state,
            progress: {
              ...state.progress,
              modeStats: {
                ...state.progress.modeStats,
                find: recomputeFindModeStat(sessionStats.find),
              },
              sessionStats,
              recentResults: [action.payload, ...state.progress.recentResults].slice(0, 12),
            },
            lastResult: action.payload,
          };
        }

        const previousPractice = state.progress.sessionStats.find.practice;
        const practice = {
          played: previousPractice.played + 1,
          correct: previousPractice.correct + (action.payload.wasCorrect ? 1 : 0),
          currentStreak: action.payload.wasCorrect ? previousPractice.currentStreak + 1 : 0,
          bestStreak: previousPractice.bestStreak,
        };
        practice.bestStreak = Math.max(practice.bestStreak, practice.currentStreak);

        const sessionStats = {
          ...state.progress.sessionStats,
          find: {
            ...state.progress.sessionStats.find,
            practice,
          },
        };

        return {
          ...state,
          progress: {
            ...state.progress,
            modeStats: {
              ...state.progress.modeStats,
              find: recomputeFindModeStat(sessionStats.find),
            },
            sessionStats,
            recentResults: [action.payload, ...state.progress.recentResults].slice(0, 12),
          },
          lastResult: action.payload,
        };
      }

      const previous = state.progress.modeStats[action.payload.mode];
      const played = previous.played + 1;
      const correct = previous.correct + (action.payload.wasCorrect ? 1 : 0);
      const currentStreak = action.payload.wasCorrect ? previous.currentStreak + 1 : 0;
      const modeStats = {
        ...state.progress.modeStats,
        [action.payload.mode]: {
          played,
          correct,
          currentStreak,
          bestStreak: Math.max(previous.bestStreak, currentStreak),
        },
      };

      return {
        ...state,
        progress: {
          ...state.progress,
          modeStats,
          recentResults: [action.payload, ...state.progress.recentResults].slice(0, 12),
        },
        lastResult: action.payload,
      };
    }
    case 'start-session': {
      const challenge = {
        ...state.progress.sessionStats.find.challenge,
        played: state.progress.sessionStats.find.challenge.played + 1,
      };
      const sessionStats = {
        ...state.progress.sessionStats,
        find: {
          ...state.progress.sessionStats.find,
          challenge,
        },
      };

      return {
        ...state,
        progress: {
          ...state.progress,
          modeStats: {
            ...state.progress.modeStats,
            find: recomputeFindModeStat(sessionStats.find),
          },
          sessionStats,
        },
      };
    }
    case 'complete-session': {
      const challenge = {
        ...state.progress.sessionStats.find.challenge,
        highScore: Math.max(
          state.progress.sessionStats.find.challenge.highScore,
          action.payload.score
        ),
      };
      const sessionStats = {
        ...state.progress.sessionStats,
        find: {
          ...state.progress.sessionStats.find,
          challenge,
        },
      };

      return {
        ...state,
        progress: {
          ...state.progress,
          modeStats: {
            ...state.progress.modeStats,
            find: recomputeFindModeStat(sessionStats.find),
          },
          sessionStats,
        },
      };
    }
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
    startSession: (payload) => dispatch({ type: 'start-session', payload }),
    completeSession: (payload) => dispatch({ type: 'complete-session', payload }),
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
  const challenge = progress.sessionStats.find.challenge;

  return {
    hasProgress: stat.played > 0,
    metrics: [
      { label: 'Played', value: String(stat.played) },
      { label: 'Streak', value: String(stat.bestStreak) },
      { label: 'Accuracy', value: `${accuracyForMode(progress, mode)}%` },
      { label: 'High score', value: String(mode === 'find' ? challenge.highScore : 0) },
    ],
  };
}

export function sessionProgressSummary(
  progress: ProgressSnapshot,
  mode: GameMode,
  sessionType: SessionType
): ProgressSummaryData {
  if (mode !== 'find') {
    return modeProgressSummary(progress, mode);
  }

  if (sessionType === 'practice') {
    const practice = progress.sessionStats.find.practice;

    return {
      hasProgress: practice.played > 0,
      emptyText: 'Ready for your first round.',
      metrics: [
        { label: 'Played', value: String(practice.played) },
        { label: 'Best Streak', value: String(practice.bestStreak) },
      ],
    };
  }

  const challenge = progress.sessionStats.find.challenge;

  return {
    hasProgress: challenge.played > 0,
    emptyText: 'Ready for your first challenge.',
    metrics: [
      { label: 'Played', value: String(challenge.played) },
      { label: 'Accuracy', value: `${accuracyFromCounts(challenge.correct, challenge.attempts)}%` },
      { label: 'High Score', value: String(challenge.highScore) },
    ],
  };
}

export function totalRoundsPlayed(progress: ProgressSnapshot) {
  return Object.values(progress.modeStats).reduce((sum, stat) => sum + stat.played, 0);
}

export function overallAccuracy(progress: ProgressSnapshot) {
  const played = totalRoundsPlayed(progress);

  if (!played) {
    return 0;
  }

  const correct = Object.values(progress.modeStats).reduce((sum, stat) => sum + stat.correct, 0);
  return Math.round((correct / played) * 100);
}
