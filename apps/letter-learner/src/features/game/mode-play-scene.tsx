import React, { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { goBackOrReplace } from '@education/app-config';
import { palette, radii, spacing } from '@education/design';
import { typography } from '@education/design/native';
import {
  ActionButton,
  HeaderBar,
  HeaderBackButton,
  HeaderIconButton,
  SettingsCogIcon,
} from '@education/ui';
import { playAudioKey } from '@/features/game/audio/letter-audio';
import { CasePairPanel } from '@/features/game/components/case-pair-panel';
import { GameScreenShell } from '@/features/game/components/game-screen-shell';
import { LetterMatchPanel } from '@/features/game/components/letter-match-panel';
import { SoundMatchPanel } from '@/features/game/components/sound-match-panel';
import { TapLetterPanel } from '@/features/game/components/tap-letter-panel';
import { MODE_META } from '@/features/game/mode-meta';
import { evaluateRound, generateRound } from '@/features/game/modes';
import {
  AnyRound,
  CasePairRound,
  DifficultyLevel,
  GameMode,
  LetterMatchRound,
  RoundEvaluation,
  SessionType,
  SoundMatchRound,
  TapLetterRound,
} from '@/features/game/types';
import { useAppState } from '@/state/app-state';

type ModePlaySceneProps = {
  mode: GameMode;
  sessionType?: SessionType;
  difficultyLevel: DifficultyLevel;
};

function retryFeedbackForMode(mode: GameMode, feedback: RoundEvaluation | null) {
  if (!feedback || feedback.isCorrect) {
    return null;
  }

  switch (mode) {
    case 'match':
      return {
        title: 'Not quite yet',
        body: 'Listen to the clue again, then tap the matching letter.',
        detail: feedback.detailLabel,
      };
    case 'case':
      return {
        title: 'Try the other case',
        body: 'Uppercase and lowercase can look different, but they share the same name.',
        detail: feedback.detailLabel,
      };
    case 'tap':
      return {
        title: 'Keep watching',
        body: 'Wait for the target letter and tap that one.',
        detail: feedback.detailLabel,
      };
    case 'sound':
      return {
        title: 'Listen again',
        body: 'Some sounds can match more than one letter.',
        detail: feedback.detailLabel,
      };
  }
}

export function ModePlayScene({ mode, sessionType, difficultyLevel }: ModePlaySceneProps) {
  const { recordRound, settings } = useAppState();
  const [round, setRound] = useState<AnyRound>(() =>
    generateRound(mode, { difficultyLevel, sessionType })
  );
  const [feedback, setFeedback] = useState<RoundEvaluation | null>(null);
  const [isCelebrating, setIsCelebrating] = useState(false);
  const nextRoundTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryFeedbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const meta = MODE_META[mode];
  const retryFeedback = retryFeedbackForMode(mode, feedback);

  useEffect(() => {
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }
    if (retryFeedbackTimeoutRef.current) {
      clearTimeout(retryFeedbackTimeoutRef.current);
      retryFeedbackTimeoutRef.current = null;
    }

    setRound(generateRound(mode, { difficultyLevel, sessionType }));
    setFeedback(null);
    setIsCelebrating(false);
  }, [difficultyLevel, mode, sessionType]);

  useEffect(() => {
    return () => {
      if (nextRoundTimeoutRef.current) {
        clearTimeout(nextRoundTimeoutRef.current);
      }
      if (retryFeedbackTimeoutRef.current) {
        clearTimeout(retryFeedbackTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (mode === 'sound') {
      playAudioKey((round as SoundMatchRound).audioKey, settings.soundEnabled);
    }

    if (mode === 'match') {
      playAudioKey((round as LetterMatchRound).instructionAudioKey, settings.soundEnabled);
    }
  }, [mode, round, settings.soundEnabled]);

  useEffect(() => {
    if (!feedback || feedback.isCorrect) {
      if (retryFeedbackTimeoutRef.current) {
        clearTimeout(retryFeedbackTimeoutRef.current);
        retryFeedbackTimeoutRef.current = null;
      }
      return;
    }

    if (retryFeedbackTimeoutRef.current) {
      clearTimeout(retryFeedbackTimeoutRef.current);
    }

    retryFeedbackTimeoutRef.current = setTimeout(() => {
      setFeedback((current) => (current && !current.isCorrect ? null : current));
      retryFeedbackTimeoutRef.current = null;
    }, 5000);
  }, [feedback]);

  function submit(input: unknown) {
    const evaluation = evaluateRound(mode, round, input);
    recordRound({
      mode,
      sessionType: sessionType ?? 'practice',
      difficultyLevel,
      targetId: getRoundTargetId(round),
      scoreBand: evaluation.scoreBand,
      wasCorrect: evaluation.isCorrect,
      feedbackKey: evaluation.feedbackKey,
      createdAt: new Date().toISOString(),
    });

    if (evaluation.isCorrect) {
      playAudioKey('ui:correct', settings.soundEnabled);
      setFeedback(null);
      setIsCelebrating(true);

      if (nextRoundTimeoutRef.current) {
        clearTimeout(nextRoundTimeoutRef.current);
      }

      nextRoundTimeoutRef.current = setTimeout(() => {
        nextRound();
      }, 1150);
      return;
    }

    playAudioKey('ui:try-again', settings.soundEnabled);
    setFeedback(evaluation);
  }

  function nextRound() {
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }

    setRound(generateRound(mode, { difficultyLevel, sessionType }));
    setFeedback(null);
    setIsCelebrating(false);
  }

  function renderRound() {
    switch (mode) {
      case 'match':
        return (
          <LetterMatchPanel
            accent={meta.accent}
            onSubmit={(answerValue) => submit(answerValue)}
            round={round as LetterMatchRound}
            soundEnabled={settings.soundEnabled}
          />
        );
      case 'case':
        return (
          <CasePairPanel
            accent={meta.accent}
            onSubmit={(answerValue) => submit(answerValue)}
            round={round as CasePairRound}
          />
        );
      case 'tap':
        return (
          <TapLetterPanel
            accent={meta.accent}
            onSubmit={(answerValue) => submit(answerValue)}
            reducedMotion={settings.reducedMotion}
            round={round as TapLetterRound}
          />
        );
      case 'sound':
        return (
          <SoundMatchPanel
            accent={meta.accent}
            onSubmit={(answerValue) => submit(answerValue)}
            round={round as SoundMatchRound}
            soundEnabled={settings.soundEnabled}
          />
        );
    }
  }

  return (
    <View style={styles.scene}>
      <HeaderBar
        title={meta.title}
        subtitle="Practice"
        leftAction={<HeaderBackButton onPress={() => goBackOrReplace(router, `/mode/${mode}`)} />}
        rightAction={
          <HeaderIconButton
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={() => router.push('/settings')}>
            <SettingsCogIcon size={24} />
          </HeaderIconButton>
        }
      />

      <GameScreenShell
        accent={meta.accent}
        celebrationVisible={isCelebrating}
        hint={round.hint}
        prompt={round.prompt}
        retryFeedback={retryFeedback}
        successMessage="Nice work!">
        {renderRound()}
      </GameScreenShell>

      <ActionButton label="Next Round" onPress={nextRound} variant="secondary" />
    </View>
  );
}

export function SettingsToggleRow({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: boolean) => void;
  value: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch onValueChange={onChange} value={value} />
    </Pressable>
  );
}

function getRoundTargetId(round: AnyRound) {
  switch (round.mode) {
    case 'match':
    case 'tap':
      return round.target.value;
    case 'case':
      return round.answer.value;
    case 'sound':
      return round.audioKey;
  }
}

const styles = StyleSheet.create({
  scene: {
    flex: 1,
    gap: spacing.md,
  },
  toggleRow: {
    alignItems: 'center',
    backgroundColor: palette.surfaceMuted,
    borderRadius: radii.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  toggleLabel: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 17,
    fontWeight: '700',
  },
});
