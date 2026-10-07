import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

import { AppShell } from '@education/ui';
import { layout } from '@/design/tokens';
import {
  CHALLENGE_DIFFICULTIES,
  getDefaultChallengeDifficulty,
  getDefaultPracticeDifficulty,
} from '@/features/game/challenge-stars';
import { ChallengeScene } from '@/features/game/challenge-scene';
import { ModePlayScene } from '@/features/game/mode-play-scene';
import {
  ACTIVE_GAME_MODES,
  DifficultyLevel,
  isChallengeModeKey,
  SessionType,
} from '@/features/game/types';
import { useHasMounted } from '@/lib/use-has-mounted';
import { useAppState } from '@/state/app-state';

const VALID_SESSIONS: SessionType[] = ['practice', 'challenge'];

export function generateStaticParams() {
  return ACTIVE_GAME_MODES.flatMap((mode) =>
    VALID_SESSIONS.map((session) => ({ mode, session }))
  );
}

export default function SessionScreen() {
  const params = useLocalSearchParams<{
    difficulty?: string;
    mode?: string;
    session?: string;
  }>();
  const mode = params.mode;
  const session = params.session as SessionType | undefined;
  const requestedDifficulty = CHALLENGE_DIFFICULTIES.includes(
    params.difficulty as DifficultyLevel
  )
    ? (params.difficulty as DifficultyLevel)
    : undefined;
  const { progress } = useAppState();
  const hasMounted = useHasMounted();

  if (!isChallengeModeKey(mode) || !session || !VALID_SESSIONS.includes(session)) {
    return <Redirect href="/modes" />;
  }

  const challengeDifficulty =
    requestedDifficulty ?? getDefaultChallengeDifficulty(progress.challengeProgress[mode]);
  const practiceDifficulty =
    requestedDifficulty ?? getDefaultPracticeDifficulty(progress.challengeProgress[mode]);

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: false,
        }}
      />
      <AppShell maxWidth={layout.maxContentWidth} scroll={session !== 'challenge'}>
        {/* Rounds are random and the difficulty comes from the query string, so the game
            renders only in the browser; the static web page ships the empty shell. */}
        {!hasMounted ? null : session === 'practice' ? (
          <ModePlayScene mode={mode} sessionType="practice" difficultyLevel={practiceDifficulty} />
        ) : (
          <ChallengeScene mode={mode} difficultyLevel={challengeDifficulty} />
        )}
      </AppShell>
    </>
  );
}
