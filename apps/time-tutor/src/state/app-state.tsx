import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import {
  createEmptyChallengeModeProgress,
  createDefaultChallengeProgress,
  normalizeChallengeProgress,
} from '@/lib/challenge-progression';
import type {
  AppSnapshot,
  ChallengeDifficulty,
  ChallengeProgressSnapshot,
  PlayableMode,
  PracticeInterval,
  SettingsSnapshot,
  StarCount,
  TimeFormat,
} from '@/types/time';

const STORAGE_KEY = 'time-tutor-settings-v1';

type StoredSnapshot = Partial<
  {
    challengeProgress?: Partial<
      Record<
        PlayableMode,
        {
          bestStars?: Partial<AppSnapshot['challengeProgress'][PlayableMode]['bestStars']>;
          lastSelectedDifficulty?: ChallengeDifficulty;
        }
      >
    >;
    practiceInterval?: PracticeInterval;
    settings?: Partial<SettingsSnapshot>;
    timeFormat?: TimeFormat;
  }
>;

type AppStateValue = {
  challengeProgress: ChallengeProgressSnapshot;
  clearChallengeModeProgress: (mode: PlayableMode) => void;
  isHydrated: boolean;
  practiceInterval: PracticeInterval;
  setChallengeBestStars: (
    mode: PlayableMode,
    difficulty: ChallengeDifficulty,
    stars: StarCount
  ) => void;
  setLastSelectedChallengeDifficulty: (
    mode: PlayableMode,
    difficulty: ChallengeDifficulty
  ) => void;
  setPracticeInterval: (value: PracticeInterval) => void;
  setTimeFormat: (value: TimeFormat) => void;
  timeFormat: TimeFormat;
};

const AppStateContext = createContext<AppStateValue | null>(null);

type AppStateProviderProps = {
  children: React.ReactNode;
  initialChallengeProgress?: Partial<ChallengeProgressSnapshot>;
  initialPracticeInterval?: PracticeInterval;
  initialTimeFormat?: TimeFormat;
  skipHydration?: boolean;
};

export const defaultSettings: SettingsSnapshot = {
  practiceInterval: '5-minute',
  timeFormat: '12-hour',
};

export function normalizeSettingsSnapshot(
  settings?: Partial<SettingsSnapshot> | null
): SettingsSnapshot {
  return {
    ...defaultSettings,
    ...settings,
  };
}

export function normalizeStoredSnapshot(snapshot?: StoredSnapshot | null): AppSnapshot {
  if (!snapshot) {
    return {
      challengeProgress: createDefaultChallengeProgress(),
      settings: defaultSettings,
    };
  }

  const settings = snapshot.settings
    ? normalizeSettingsSnapshot(snapshot.settings)
    : normalizeSettingsSnapshot({
        practiceInterval: snapshot.practiceInterval,
        timeFormat: snapshot.timeFormat,
      });

  return {
    challengeProgress: normalizeChallengeProgress(snapshot.challengeProgress),
    settings,
  };
}

export function AppStateProvider({
  children,
  initialChallengeProgress,
  initialPracticeInterval = '5-minute',
  initialTimeFormat = '12-hour',
  skipHydration = false,
}: AppStateProviderProps) {
  const [practiceInterval, setPracticeInterval] =
    useState<PracticeInterval>(initialPracticeInterval);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(initialTimeFormat);
  const [challengeProgress, setChallengeProgress] = useState<ChallengeProgressSnapshot>(
    normalizeChallengeProgress(initialChallengeProgress),
  );
  const [isHydrated, setIsHydrated] = useState(skipHydration);

  useEffect(() => {
    if (skipHydration) {
      return;
    }

    let isMounted = true;

    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const snapshot = normalizeStoredSnapshot(
          raw ? (JSON.parse(raw) as StoredSnapshot) : null
        );

        if (!isMounted) {
          return;
        }

        setPracticeInterval(snapshot.settings.practiceInterval);
        setTimeFormat(snapshot.settings.timeFormat);
        setChallengeProgress(snapshot.challengeProgress);
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    hydrate();

    return () => {
      isMounted = false;
    };
  }, [skipHydration]);

  useEffect(() => {
    if (!isHydrated || skipHydration) {
      return;
    }

    const snapshot: AppSnapshot = {
      challengeProgress,
      settings: {
        practiceInterval,
        timeFormat,
      },
    };

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot)).catch(() => {});
  }, [challengeProgress, isHydrated, practiceInterval, skipHydration, timeFormat]);

  const value = useMemo(
    () => ({
      challengeProgress,
      clearChallengeModeProgress: (mode: PlayableMode) => {
        setChallengeProgress((current) => ({
          ...current,
          [mode]: createEmptyChallengeModeProgress(),
        }));
      },
      isHydrated,
      practiceInterval,
      setChallengeBestStars: (
        mode: PlayableMode,
        difficulty: ChallengeDifficulty,
        stars: StarCount,
      ) => {
        setChallengeProgress((current) => {
          if (stars <= current[mode].bestStars[difficulty]) {
            return current;
          }

          return {
            ...current,
            [mode]: {
              ...current[mode],
              bestStars: {
                ...current[mode].bestStars,
                [difficulty]: stars,
              },
            },
          };
        });
      },
      setLastSelectedChallengeDifficulty: (
        mode: PlayableMode,
        difficulty: ChallengeDifficulty,
      ) => {
        setChallengeProgress((current) => ({
          ...current,
          [mode]: {
            ...current[mode],
            lastSelectedDifficulty: difficulty,
          },
        }));
      },
      setPracticeInterval,
      setTimeFormat,
      timeFormat,
    }),
    [challengeProgress, isHydrated, practiceInterval, timeFormat],
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('useAppState must be used inside AppStateProvider');
  }

  return context;
}
