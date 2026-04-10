import { Redirect, Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';

import { AppShell } from '@education/ui';
import { layout } from '@/design/tokens';
import { FindChallengeScene } from '@/features/game/find-challenge-scene';
import { ModePlayScene } from '@/features/game/mode-play-scene';
import { GameMode, SessionType } from '@/features/game/types';

const VALID_MODES: GameMode[] = ['find'];
const VALID_SESSIONS: SessionType[] = ['practice', 'challenge'];

export function generateStaticParams() {
  return VALID_MODES.flatMap((mode) =>
    VALID_SESSIONS.map((session) => ({ mode, session }))
  );
}

export default function SessionScreen() {
  const params = useLocalSearchParams<{ mode?: string; session?: string }>();
  const mode = params.mode as GameMode | undefined;
  const session = params.session as SessionType | undefined;

  if (!mode || !session || !VALID_MODES.includes(mode) || !VALID_SESSIONS.includes(session)) {
    return <Redirect href="/modes" />;
  }

  return (
    <>
      <Stack.Screen
        options={{
          gestureEnabled: false,
        }}
      />
      <AppShell maxWidth={layout.maxContentWidth}>
        {session === 'practice' ? (
          <ModePlayScene mode={mode} sessionType="practice" />
        ) : (
          <FindChallengeScene />
        )}
      </AppShell>
    </>
  );
}
