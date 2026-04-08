import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

import type { PracticeInterval, TimeFormat } from '@/types/time';

const STORAGE_KEY = 'time-tutor-settings-v1';

type AppStateValue = {
  isHydrated: boolean;
  practiceInterval: PracticeInterval;
  setPracticeInterval: (value: PracticeInterval) => void;
  timeFormat: TimeFormat;
  setTimeFormat: (value: TimeFormat) => void;
};

const AppStateContext = createContext<AppStateValue | null>(null);

type AppStateProviderProps = {
  children: React.ReactNode;
  initialPracticeInterval?: PracticeInterval;
  initialTimeFormat?: TimeFormat;
  skipHydration?: boolean;
};

export function AppStateProvider({
  children,
  initialPracticeInterval = '5-minute',
  initialTimeFormat = '12-hour',
  skipHydration = false,
}: AppStateProviderProps) {
  const [practiceInterval, setPracticeInterval] =
    useState<PracticeInterval>(initialPracticeInterval);
  const [timeFormat, setTimeFormat] = useState<TimeFormat>(initialTimeFormat);
  const [isHydrated, setIsHydrated] = useState(skipHydration);

  useEffect(() => {
    if (skipHydration) {
      return;
    }

    let isMounted = true;

    async function hydrate() {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw || !isMounted) {
          setIsHydrated(true);
          return;
        }

        const parsed = JSON.parse(raw) as {
          practiceInterval?: PracticeInterval;
          timeFormat?: TimeFormat;
        };

        if (parsed.practiceInterval) {
          setPracticeInterval(parsed.practiceInterval);
        }

        if (parsed.timeFormat) {
          setTimeFormat(parsed.timeFormat);
        }
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

    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ practiceInterval, timeFormat }),
    ).catch(() => {});
  }, [isHydrated, practiceInterval, skipHydration, timeFormat]);

  const value = useMemo(
    () => ({
      isHydrated,
      practiceInterval,
      setPracticeInterval,
      timeFormat,
      setTimeFormat,
    }),
    [isHydrated, practiceInterval, timeFormat],
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
