import React, { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { goBackOrReplace } from '@education/app-config';
import { palette, radii, spacing } from '@education/design';
import { typography } from '@education/design/native';
import {
  ActionButton,
  Card,
  HeaderBar,
  HeaderBackButton,
  HeaderIconButton,
  SettingsCogIcon,
} from '@education/ui';
import { FindRoundPanel } from '@/features/game/components/find-round-panel';
import { GameScreenShell } from '@/features/game/components/game-screen-shell';
import { MODE_META } from '@/features/game/mode-meta';
import { evaluateFindRound, generateFindRound } from '@/features/game/modes/find';
import { FindRound } from '@/features/game/types';
import { useAppState } from '@/state/app-state';

const CHALLENGE_DURATION_SECONDS = 60;

type RunStatus = 'finished' | 'ready' | 'running';

export function FindChallengeScene() {
  const { settings, progress, recordRound, startSession, completeSession } = useAppState();
  const [runStatus, setRunStatus] = useState<RunStatus>('ready');
  const [timeRemaining, setTimeRemaining] = useState(CHALLENGE_DURATION_SECONDS);
  const [score, setScore] = useState(0);
  const [round, setRound] = useState<FindRound | null>(null);
  const completionRecordedRef = useRef(false);
  const meta = MODE_META.find;
  const highScore = progress.sessionStats.find.challenge.highScore;

  useEffect(() => {
    if (runStatus !== 'running') {
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((current) => {
        if (current <= 1) {
          setRunStatus('finished');
          return 0;
        }

        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [runStatus]);

  useEffect(() => {
    if (runStatus !== 'finished' || completionRecordedRef.current) {
      return;
    }

    completionRecordedRef.current = true;
    completeSession({ mode: 'find', score, sessionType: 'challenge' });
  }, [completeSession, runStatus, score]);

  function nextRound() {
    setRound(generateFindRound({ difficultyLevel: settings.difficultyLevel }));
  }

  function startRun() {
    completionRecordedRef.current = false;
    startSession({ mode: 'find', sessionType: 'challenge' });
    setScore(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setRunStatus('running');
    setRound(generateFindRound({ difficultyLevel: settings.difficultyLevel }));
  }

  function handlePlayAgain() {
    setRunStatus('ready');
    setScore(0);
    setTimeRemaining(CHALLENGE_DURATION_SECONDS);
    setRound(null);
  }

  function submit(answerId: string) {
    if (runStatus !== 'running' || !round) {
      return;
    }

    const evaluation = evaluateFindRound(round, answerId);
    recordRound({
      mode: 'find',
      sessionType: 'challenge',
      targetFractionId: round.targetFractionId,
      scoreBand: evaluation.scoreBand,
      wasCorrect: evaluation.isCorrect,
      feedbackKey: evaluation.feedbackKey,
      createdAt: new Date().toISOString(),
    });

    if (evaluation.isCorrect) {
      setScore((current) => current + 1);
    }

    nextRound();
  }

  return (
    <View style={styles.scene}>
      <HeaderBar
        title={meta.title}
        subtitle="1-Minute Challenge"
        leftAction={
          <HeaderBackButton onPress={() => goBackOrReplace(router, '/mode/find')} />
        }
        rightAction={
          <HeaderIconButton
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={() => router.push('/settings')}>
            <SettingsCogIcon size={24} />
          </HeaderIconButton>
        }
      />

      <View style={styles.statsRow}>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>Time left</Text>
          <Text style={styles.statValue} testID="find-challenge-time-remaining">
            {formatCountdown(timeRemaining)}
          </Text>
        </View>
        <View style={styles.statChip}>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue} testID="find-challenge-score">
            {score}
          </Text>
        </View>
      </View>

      {runStatus === 'running' && round ? (
        <GameScreenShell
          prompt={round.prompt}
          hint="Tap the matching fraction as quickly as you can."
          accent={meta.accent}>
          <FindRoundPanel disabled={false} onSubmit={submit} round={round} />
        </GameScreenShell>
      ) : (
        <Card style={styles.calloutCard}>
          {runStatus === 'ready' ? (
            <>
              <Text style={styles.calloutTitle}>Ready for a fast round?</Text>
              <Text style={styles.calloutBody}>
                You&apos;ll have one minute to answer as many fraction matches as you can.
              </Text>
              <ActionButton label="Start challenge" onPress={startRun} />
            </>
          ) : (
            <>
              <Text style={styles.calloutTitle}>Time&apos;s up!</Text>
              <Text style={styles.calloutScore}>Final score: {score}</Text>
              <Text style={styles.calloutBody}>High score: {Math.max(highScore, score)}</Text>
              <ActionButton label="Play again" onPress={handlePlayAgain} />
            </>
          )}
        </Card>
      )}
    </View>
  );
}

function formatCountdown(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds % 60;
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  scene: {
    gap: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statChip: {
    backgroundColor: palette.surfaceMuted,
    borderColor: palette.ring,
    borderRadius: radii.xl,
    borderWidth: 1,
    flex: 1,
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  statLabel: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 28,
    fontWeight: '700',
  },
  calloutCard: {
    gap: spacing.md,
  },
  calloutTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 28,
    fontWeight: '700',
  },
  calloutScore: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  calloutBody: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 24,
  },
});
