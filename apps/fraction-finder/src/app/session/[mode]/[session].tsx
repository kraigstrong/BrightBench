import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

import { AppShell } from '@education/ui';
import { layout } from '@/design/tokens';
import {
  CHALLENGE_DIFFICULTIES,
  getDefaultChallengeDifficulty,
} from '@/features/game/challenge-stars';
import { ChallengeScene } from '@/features/game/challenge-scene';
import { ModePlayScene } from '@/features/game/mode-play-scene';
import { ACTIVE_GAME_MODES, DifficultyLevel, GameMode, SessionType } from '@/features/game/types';
import { useAppState } from '@/state/app-state';

const VALID_MODES: GameMode[] = [...ACTIVE_GAME_MODES];
const VALID_SESSIONS: SessionType[] = ['practice', 'challenge'];

export function generateStaticParams() {
  return VALID_MODES.flatMap((mode) =>
    VALID_SESSIONS.map((session) => ({ mode, session }))
  );
}

export default function SessionScreen() {
  const params = useLocalSearchParams<{
    difficulty?: string;
    mode?: string;
    session?: string;
  }>();
  const mode = params.mode as GameMode | undefined;
  const session = params.session as SessionType | undefined;
  const requestedDifficulty = CHALLENGE_DIFFICULTIES.includes(
    params.difficulty as DifficultyLevel
  )
    ? (params.difficulty as DifficultyLevel)
    : undefined;
  const { progress } = useAppState();

  if (!mode || !session || !VALID_MODES.includes(mode) || !VALID_SESSIONS.includes(session)) {
    return <Redirect href="/modes" />;
  }

  const challengeDifficulty =
    requestedDifficulty ?? getDefaultChallengeDifficulty(progress.challengeProgress[mode]);

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: false,
        }}
      />
      <AppShell maxWidth={layout.maxContentWidth} scroll={session !== 'challenge'}>
        {session === 'practice' ? (
          <ModePlayScene mode={mode} sessionType="practice" />
        ) : (
          <ChallengeScene mode={mode} difficultyLevel={challengeDifficulty} />
        )}
      </AppShell>
    </>
  );
}
