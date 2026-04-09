import React, { useEffect, useRef, useState } from 'react';
import { Link, router } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

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
import { ChoiceButton } from '@/components/ui/choice-button';
import { fractionPalette } from '@/design/tokens';
import { FRACTION_BY_ID } from '@/features/game/fractions';
import { FractionBar } from '@/features/game/components/fraction-bar';
import { FractionContainer } from '@/features/game/components/fraction-container';
import { FractionMeter } from '@/features/game/components/fraction-meter';
import { GameScreenShell } from '@/features/game/components/game-screen-shell';
import { NumberLine } from '@/features/game/components/number-line';
import { MODE_META } from '@/features/game/mode-meta';
import { generateRound, evaluateRound } from '@/features/game/modes';
import { clamp, getFraction } from '@/features/game/math';
import {
  AnyRound,
  BuildRound,
  CompareRound,
  EstimateRound,
  FindRound,
  GameMode,
  LineRound,
  PourRound,
  RoundEvaluation,
} from '@/features/game/types';
import { useAppState } from '@/state/app-state';

type ModePlaySceneProps = {
  mode: GameMode;
};

function retryFeedbackForMode(mode: GameMode, feedback: RoundEvaluation | null) {
  if (!feedback || feedback.isCorrect) {
    return null;
  }

  switch (mode) {
    case 'find':
      return {
        title: 'Not quite yet',
        body: 'Take another look at how many equal parts are shaded.',
      };
    case 'build':
      return {
        title: 'Keep adjusting',
        body: 'Change the shaded parts and try again.',
        detail: feedback.detailLabel,
      };
    case 'estimate':
      return {
        title: 'Close guess',
        body: 'Use a benchmark like one half to guide your next choice.',
        detail: feedback.detailLabel,
      };
    case 'pour':
      return {
        title: 'Keep pouring',
        body: 'Adjust the fill and check again when it looks right.',
        detail: feedback.detailLabel,
      };
    case 'compare':
      return {
        title: 'Try again',
        body: 'Look for which picture shows more of the whole.',
      };
    case 'line':
      return {
        title: 'Keep going',
        body: 'Move the marker and check again when the spot feels better.',
        detail: feedback.detailLabel,
      };
  }
}

export function ModePlayScene({ mode }: ModePlaySceneProps) {
  const { settings, recordRound } = useAppState();
  const difficultyLevel = settings.difficultyLevel;
  const [round, setRound] = useState<AnyRound>(() => generateRound(mode, { difficultyLevel }));
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

    setRound(generateRound(mode, { difficultyLevel }));
    setFeedback(null);
    setIsCelebrating(false);
  }, [difficultyLevel, mode]);

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
      targetFractionId: round.targetFractionId,
      scoreBand: evaluation.scoreBand,
      wasCorrect: evaluation.isCorrect,
      feedbackKey: evaluation.feedbackKey,
      createdAt: new Date().toISOString(),
    });

    if (evaluation.isCorrect) {
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

    setFeedback(evaluation);
  }

  function nextRound() {
    if (nextRoundTimeoutRef.current) {
      clearTimeout(nextRoundTimeoutRef.current);
      nextRoundTimeoutRef.current = null;
    }
    if (retryFeedbackTimeoutRef.current) {
      clearTimeout(retryFeedbackTimeoutRef.current);
      retryFeedbackTimeoutRef.current = null;
    }

    setRound(generateRound(mode, { difficultyLevel }));
    setFeedback(null);
    setIsCelebrating(false);
  }

  function clearRetryFeedback() {
    if (retryFeedbackTimeoutRef.current) {
      clearTimeout(retryFeedbackTimeoutRef.current);
      retryFeedbackTimeoutRef.current = null;
    }
    setFeedback((current) => (current && !current.isCorrect ? null : current));
  }

  return (
    <View style={styles.scene}>
      <HeaderBar
        title={meta.title}
        leftAction={
          <HeaderBackButton onPress={() => goBackOrReplace(router, '/modes')} />
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

      <GameScreenShell
        prompt={round.prompt}
        hint={meta.promptHint}
        accent={meta.accent}
        retryFeedback={retryFeedback}
        celebrationVisible={isCelebrating}
        successMessage="Nice work!"
        footer={
          <View style={styles.footerRow}>
            <Link href="/progress" asChild>
              <ActionButton compact label="Progress" variant="secondary" />
            </Link>
          </View>
        }>
        {mode === 'find' ? (
          <FindPlay round={round as FindRound} onSubmit={submit} disabled={isCelebrating} />
        ) : null}
        {mode === 'build' ? (
          <BuildPlay
            round={round as BuildRound}
            onSubmit={submit}
            disabled={isCelebrating}
            onInteraction={clearRetryFeedback}
          />
        ) : null}
        {mode === 'estimate' ? (
          <EstimatePlay
            round={round as EstimateRound}
            onSubmit={submit}
            disabled={isCelebrating}
          />
        ) : null}
        {mode === 'pour' ? (
          <PourPlay
            round={round as PourRound}
            onSubmit={submit}
            disabled={isCelebrating}
            onInteraction={clearRetryFeedback}
          />
        ) : null}
        {mode === 'compare' ? (
          <ComparePlay
            round={round as CompareRound}
            onSubmit={submit}
            disabled={isCelebrating}
          />
        ) : null}
        {mode === 'line' ? (
          <LinePlay
            round={round as LineRound}
            onSubmit={submit}
            disabled={isCelebrating}
            onInteraction={clearRetryFeedback}
          />
        ) : null}
      </GameScreenShell>
    </View>
  );
}

function FindPlay({
  round,
  onSubmit,
  disabled,
}: {
  round: FindRound;
  onSubmit: (input: string) => void;
  disabled: boolean;
}) {
  const target = FRACTION_BY_ID[round.targetFractionId];

  return (
    <View style={styles.modeBody}>
      <View style={styles.visualStage}>
        <FractionBar connected numerator={target.numerator} denominator={target.denominator} />
      </View>
      <View style={styles.answerStage}>
        {round.options.map((optionId, index) => (
          <ChoiceButton
            key={optionId}
            disabled={disabled}
            label={FRACTION_BY_ID[optionId].label}
            onPress={() => onSubmit(optionId)}
          />
        ))}
      </View>
    </View>
  );
}

function BuildPlay({
  round,
  onSubmit,
  disabled,
  onInteraction,
}: {
  round: BuildRound;
  onSubmit: (input: number) => void;
  disabled: boolean;
  onInteraction: () => void;
}) {
  const target = FRACTION_BY_ID[round.targetFractionId];
  const [segments, setSegments] = useState<number[]>([]);

  useEffect(() => {
    setSegments([]);
  }, [round.id]);

  function toggle(index: number) {
    onInteraction();
    setSegments((current) =>
      current.includes(index) ? current.filter((value) => value !== index) : [...current, index].sort()
    );
  }

  return (
    <View style={styles.modeBody}>
      <Text style={styles.helperText}>Fill {target.numerator} out of {target.denominator} equal parts.</Text>
      <View style={styles.visualStage}>
        <FractionBar
          numerator={target.numerator}
          denominator={target.denominator}
          interactive
          selectedSegments={segments}
          onToggleSegment={toggle}
          tint={fractionPalette.mint}
        />
      </View>
      <ChoiceButton
        label={segments.length ? 'Check my fraction' : 'Tap parts to shade'}
        onPress={() => onSubmit(segments.length)}
        disabled={disabled || segments.length === 0}
      />
    </View>
  );
}

function EstimatePlay({
  round,
  onSubmit,
  disabled,
}: {
  round: EstimateRound;
  onSubmit: (input: string) => void;
  disabled: boolean;
}) {
  return (
    <View style={styles.modeBody}>
      <View style={styles.visualStage}>
        {round.representation === 'container' ? (
          <FractionContainer fillRatio={round.actualValue} fillColor={fractionPalette.sky} />
        ) : (
          <FractionMeter fillRatio={round.actualValue} fillColor={fractionPalette.plum} />
        )}
      </View>
      <View style={styles.answerStage}>
        {round.options.map((optionId) => (
          <ChoiceButton
            key={optionId}
            disabled={disabled}
            label={FRACTION_BY_ID[optionId].label}
            onPress={() => onSubmit(optionId)}
          />
        ))}
      </View>
    </View>
  );
}

function PourPlay({
  round,
  onSubmit,
  disabled,
  onInteraction,
}: {
  round: PourRound;
  onSubmit: (input: number) => void;
  disabled: boolean;
  onInteraction: () => void;
}) {
  const [fill, setFill] = useState(0.12);
  const [trackHeight, setTrackHeight] = useState(1);

  useEffect(() => {
    setFill(0.12);
  }, [round.id]);

  function updateFill(locationY: number) {
    onInteraction();
    const next = clamp(1 - locationY / trackHeight, 0.04, 0.96);
    setFill(next);
  }

  return (
    <View style={styles.modeBody}>
      <View style={styles.visualStage}>
        <View
          onLayout={(event) => setTrackHeight(event.nativeEvent.layout.height)}
          onMoveShouldSetResponder={() => true}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(event) => updateFill(event.nativeEvent.locationY)}
          onResponderMove={(event) => updateFill(event.nativeEvent.locationY)}
          style={styles.pourSurface}>
          <FractionContainer fillRatio={fill} fillColor={fractionPalette.sky} />
        </View>
      </View>
      <ChoiceButton label="This feels right" onPress={() => onSubmit(fill)} disabled={disabled} />
    </View>
  );
}

function ComparePlay({
  round,
  onSubmit,
  disabled,
}: {
  round: CompareRound;
  onSubmit: (input: 'left' | 'right') => void;
  disabled: boolean;
}) {
  const left = getFraction(round.leftFractionId);
  const right = getFraction(round.rightFractionId);

  return (
    <View style={styles.modeBody}>
      <View style={styles.compareRow}>
        <Pressable disabled={disabled} onPress={() => onSubmit('left')} style={styles.compareCard}>
          <Text style={styles.compareLabel}>{left.label}</Text>
          {round.leftRepresentation === 'bar' ? (
            <FractionBar numerator={left.numerator} denominator={left.denominator} tint={palette.gold} />
          ) : (
            <FractionMeter fillRatio={left.value} fillColor={palette.gold} />
          )}
        </Pressable>

        <Pressable disabled={disabled} onPress={() => onSubmit('right')} style={styles.compareCard}>
          <Text style={styles.compareLabel}>{right.label}</Text>
          {round.rightRepresentation === 'bar' ? (
            <FractionBar numerator={right.numerator} denominator={right.denominator} tint={fractionPalette.peach} />
          ) : (
            <FractionMeter fillRatio={right.value} fillColor={fractionPalette.peach} />
          )}
        </Pressable>
      </View>
      <Text style={styles.helperText}>Tap the bigger fraction.</Text>
    </View>
  );
}

function LinePlay({
  round,
  onSubmit,
  disabled,
  onInteraction,
}: {
  round: LineRound;
  onSubmit: (input: number) => void;
  disabled: boolean;
  onInteraction: () => void;
}) {
  const [markerValue, setMarkerValue] = useState(0);
  const target = getFraction(round.targetFractionId);

  useEffect(() => {
    setMarkerValue(0);
  }, [round.id]);

  return (
    <View style={styles.modeBody}>
      <NumberLine
        difficultyLevel={round.difficultyLevel}
        lineMax={round.lineMax}
        markerValue={markerValue}
        onChange={(value) => {
          onInteraction();
          setMarkerValue(value);
        }}
        revealTarget={false}
        segmentCount={round.segmentCount}
        targetValue={target.value}
        disabled={disabled}
      />
      <ChoiceButton label="Check my spot" onPress={() => onSubmit(markerValue)} disabled={disabled} />
    </View>
  );
}

export function SettingsToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Card style={styles.settingRow}>
      <Text style={styles.settingLabel}>{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: palette.teal, false: palette.ring }} />
    </Card>
  );
}

const styles = StyleSheet.create({
  scene: {
    gap: spacing.md,
  },
  modeBody: {
    width: '100%',
    gap: spacing.lg,
    alignItems: 'center',
    justifyContent: 'flex-start',
    minHeight: 260,
  },
  visualStage: {
    width: '100%',
    minHeight: 116,
    justifyContent: 'center',
    alignItems: 'center',
  },
  answerStage: {
    width: '100%',
    gap: spacing.sm,
  },
  choiceGrid: {
    width: '100%',
    gap: spacing.sm,
  },
  helperText: {
    textAlign: 'center',
    color: palette.inkMuted,
    fontSize: 16,
    lineHeight: 22,
    fontFamily: typography.bodyFamily,
  },
  footerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  pourSurface: {
    paddingVertical: spacing.sm,
  },
  compareRow: {
    width: '100%',
    gap: spacing.md,
  },
  compareCard: {
    gap: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: palette.ring,
    padding: spacing.md,
    backgroundColor: palette.surfaceMuted,
  },
  compareLabel: {
    fontSize: 22,
    color: palette.ink,
    fontWeight: '700',
    fontFamily: typography.displayFamily,
    textAlign: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingLabel: {
    flex: 1,
    fontSize: 18,
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontWeight: '600',
  },
});
