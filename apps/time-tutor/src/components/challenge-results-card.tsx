import { router } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Card } from '@education/ui';

import { ChallengeMasteryCrown } from '@/components/challenge-mastery-crown';
import { ChallengeStarGroup, ChallengeStarIcon } from '@/components/challenge-star-group';
import {
  CHALLENGE_DIFFICULTY_LABELS,
  PERFECT_ACCURACY,
} from '@/config/challenge-thresholds';
import { palette, spacing, typography } from '@/design/theme';
import type { ChallengeDifficulty } from '@/types/time';

type ChallengeResultsCardProps = {
  accuracy: number;
  accuracyThreshold: number;
  didUnlockMastery: boolean;
  difficulty: ChallengeDifficulty;
  intervalLabel: string;
  isNewBest: boolean;
  onPlayAgain: () => void;
  score: number;
  scoreThreshold: number;
};

const CARD_POP_DURATION_MS = 220;
const ACCURACY_REVEAL_DURATION_MS = 950;
const SCORE_REVEAL_DURATION_MS = 950;
const BAR_HANDOFF_DELAY_MS = 180;
const FINISH_REVEAL_DELAY_MS = 240;

export function ChallengeResultsCard({
  accuracy,
  accuracyThreshold,
  didUnlockMastery,
  difficulty,
  intervalLabel,
  isNewBest,
  onPlayAgain,
  score,
  scoreThreshold,
}: ChallengeResultsCardProps) {
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const accuracyProgress = useRef(new Animated.Value(0)).current;
  const scoreProgress = useRef(new Animated.Value(0)).current;
  const accuracyStarScales = useRef([
    new Animated.Value(1),
    new Animated.Value(1),
  ]).current;
  const scoreStarScale = useRef(new Animated.Value(1)).current;
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [accuracyTrackWidth, setAccuracyTrackWidth] = useState(0);
  const [scoreTrackWidth, setScoreTrackWidth] = useState(0);
  const [displayedStars, setDisplayedStars] = useState(0);
  const [isFullyRevealed, setIsFullyRevealed] = useState(false);

  const accuracyNormalized = Math.max(0, Math.min(1, accuracy / 100));
  const scoreVisualMax = Math.max(scoreThreshold + 3, Math.ceil(scoreThreshold * 1.35), score, 1);
  const scoreNormalized = Math.max(0, Math.min(1, score / scoreVisualMax));
  const accuracyEarnedThresholdStar = accuracy >= accuracyThreshold;
  const accuracyEarnedPerfectStar = accuracy === PERFECT_ACCURACY;
  const scoreEarnedStar = score >= scoreThreshold;
  const totalEarnedStars =
    Number(accuracyEarnedThresholdStar) +
    Number(accuracyEarnedPerfectStar) +
    Number(scoreEarnedStar);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      clearTimeout(timer);
    }
    timersRef.current = [];
  }, []);

  const runStarPop = useCallback((value: Animated.Value) => {
    value.setValue(0.8);
    Animated.sequence([
      Animated.timing(value, {
        duration: 150,
        easing: Easing.out(Easing.back(2)),
        toValue: 1.18,
        useNativeDriver: true,
      }),
      Animated.timing(value, {
        duration: 120,
        easing: Easing.inOut(Easing.cubic),
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const finishReveal = useCallback(() => {
    setDisplayedStars(totalEarnedStars);
    setIsFullyRevealed(true);
  }, [totalEarnedStars]);

  const resetReveal = useCallback(() => {
    clearTimers();
    cardScale.setValue(0.96);
    accuracyProgress.setValue(0);
    scoreProgress.setValue(0);
    accuracyStarScales[0].setValue(1);
    accuracyStarScales[1].setValue(1);
    scoreStarScale.setValue(1);
    setDisplayedStars(0);
    setIsFullyRevealed(false);
  }, [
    accuracyProgress,
    accuracyStarScales,
    cardScale,
    clearTimers,
    scoreProgress,
    scoreStarScale,
  ]);

  useEffect(() => {
    resetReveal();

    Animated.timing(cardScale, {
      duration: CARD_POP_DURATION_MS,
      easing: Easing.out(Easing.back(1.2)),
      toValue: 1,
      useNativeDriver: true,
    }).start();

    Animated.timing(accuracyProgress, {
      delay: 80,
      duration: ACCURACY_REVEAL_DURATION_MS,
      easing: Easing.out(Easing.cubic),
      toValue: accuracyNormalized,
      useNativeDriver: false,
    }).start();

    if (accuracyEarnedThresholdStar && accuracyNormalized > 0) {
      const thresholdDelay = Math.round(
        80 + ACCURACY_REVEAL_DURATION_MS * (accuracyThreshold / 100 / accuracyNormalized),
      );
      const timer = setTimeout(() => {
        setDisplayedStars((current) => Math.max(current, 1));
        runStarPop(accuracyStarScales[0]);
      }, Math.min(thresholdDelay, 80 + ACCURACY_REVEAL_DURATION_MS));

      timersRef.current.push(timer);
    }

    if (accuracyEarnedPerfectStar && accuracyNormalized > 0) {
      const timer = setTimeout(() => {
        setDisplayedStars((current) => Math.max(current, 2));
        runStarPop(accuracyStarScales[1]);
      }, 80 + ACCURACY_REVEAL_DURATION_MS);

      timersRef.current.push(timer);
    }

    const scoreStartDelay = 80 + ACCURACY_REVEAL_DURATION_MS + BAR_HANDOFF_DELAY_MS;

    const scoreTimer = setTimeout(() => {
      Animated.timing(scoreProgress, {
        duration: SCORE_REVEAL_DURATION_MS,
        easing: Easing.out(Easing.cubic),
        toValue: scoreNormalized,
        useNativeDriver: false,
      }).start();
    }, scoreStartDelay);

    timersRef.current.push(scoreTimer);

    if (scoreEarnedStar && scoreNormalized > 0) {
      const thresholdDelay = Math.round(
        scoreStartDelay + SCORE_REVEAL_DURATION_MS * ((scoreThreshold / scoreVisualMax) / scoreNormalized),
      );
      const timer = setTimeout(() => {
        setDisplayedStars(totalEarnedStars);
        runStarPop(scoreStarScale);
      }, Math.min(thresholdDelay, scoreStartDelay + SCORE_REVEAL_DURATION_MS));

      timersRef.current.push(timer);
    }

    const finishTimer = setTimeout(
      finishReveal,
      scoreStartDelay + SCORE_REVEAL_DURATION_MS + FINISH_REVEAL_DELAY_MS,
    );

    timersRef.current.push(finishTimer);

    return clearTimers;
  }, [
    accuracyEarnedPerfectStar,
    accuracyEarnedThresholdStar,
    accuracyNormalized,
    accuracyProgress,
    accuracyStarScales,
    accuracyThreshold,
    cardScale,
    clearTimers,
    finishReveal,
    resetReveal,
    runStarPop,
    scoreEarnedStar,
    scoreNormalized,
    scoreProgress,
    scoreStarScale,
    scoreThreshold,
    scoreVisualMax,
    totalEarnedStars,
  ]);

  function skipReveal() {
    if (isFullyRevealed) {
      return;
    }

    clearTimers();
    cardScale.stopAnimation();
    accuracyProgress.stopAnimation();
    scoreProgress.stopAnimation();
    cardScale.setValue(1);
    accuracyProgress.setValue(accuracyNormalized);
    scoreProgress.setValue(scoreNormalized);
    accuracyStarScales[0].setValue(1);
    accuracyStarScales[1].setValue(1);
    scoreStarScale.setValue(1);
    finishReveal();
  }

  function handleAccuracyTrackLayout(event: LayoutChangeEvent) {
    setAccuracyTrackWidth(event.nativeEvent.layout.width);
  }

  function handleScoreTrackLayout(event: LayoutChangeEvent) {
    setScoreTrackWidth(event.nativeEvent.layout.width);
  }

  const animatedAccuracyWidth =
    accuracyTrackWidth > 0 ? Animated.multiply(accuracyProgress, accuracyTrackWidth) : 0;
  const animatedScoreWidth =
    scoreTrackWidth > 0 ? Animated.multiply(scoreProgress, scoreTrackWidth) : 0;

  return (
    <Animated.View style={[styles.cardWrap, { transform: [{ scale: cardScale }] }]}>
      <Card style={styles.card} testID="challenge-summary">
        <Text style={styles.title}>Time&apos;s up!</Text>
        <Text style={styles.body}>
          {CHALLENGE_DIFFICULTY_LABELS[difficulty]} challenge
          {' · '}
          {intervalLabel}
        </Text>

        <View style={styles.barSection}>
          <View style={styles.barHeader}>
            <Text style={styles.barTitle}>Accuracy</Text>
            <Text style={styles.barValue}>{accuracy}%</Text>
          </View>
          <View onLayout={handleAccuracyTrackLayout} style={styles.barTrack}>
            <Animated.View style={[styles.barFill, styles.accuracyFill, { width: animatedAccuracyWidth }]} />

            <View style={[styles.markerWrap, { left: `${accuracyThreshold}%` }]}>
              <Animated.View style={{ transform: [{ scale: accuracyStarScales[0] }] }}>
                <ChallengeStarIcon filled={accuracyEarnedThresholdStar} size={18} />
              </Animated.View>
              <View style={styles.markerLine} />
            </View>

            <View style={[styles.markerWrap, styles.endMarkerWrap]}>
              <Animated.View style={{ transform: [{ scale: accuracyStarScales[1] }] }}>
                <ChallengeStarIcon filled={accuracyEarnedPerfectStar} size={18} />
              </Animated.View>
              <View style={styles.markerLine} />
            </View>
          </View>
        </View>

        <View style={styles.barSection}>
          <View style={styles.barHeader}>
            <Text style={styles.barTitle}>Score</Text>
            <Text style={styles.barValue}>{score}</Text>
          </View>
          <View onLayout={handleScoreTrackLayout} style={styles.barTrack}>
            <Animated.View style={[styles.barFill, styles.scoreFill, { width: animatedScoreWidth }]} />

            <View
              style={[
                styles.markerWrap,
                { left: `${(scoreThreshold / scoreVisualMax) * 100}%` },
              ]}>
              <Animated.View style={{ transform: [{ scale: scoreStarScale }] }}>
                <ChallengeStarIcon filled={scoreEarnedStar} size={18} />
              </Animated.View>
              <View style={styles.markerLine} />
            </View>
          </View>
          <View style={styles.barFooter}>
            <Text style={styles.barHint}>Need {scoreThreshold}</Text>
            <Text style={styles.barHint}>Score {scoreThreshold}</Text>
          </View>
        </View>

        <View style={styles.starsWrap}>
          <ChallengeStarGroup starSize={20} stars={displayedStars as 0 | 1 | 2 | 3} />
          <Text style={styles.starsLabel}>
            {isFullyRevealed
              ? totalEarnedStars === 1
                ? '1 star earned'
                : `${totalEarnedStars} stars earned`
              : 'Revealing your stars...'}
          </Text>
        </View>

        {isFullyRevealed && isNewBest ? (
          <View style={styles.newBestPill}>
            <Text style={styles.newBest}>New Best</Text>
          </View>
        ) : null}

        {isFullyRevealed && didUnlockMastery ? (
          <View style={styles.masteryBanner}>
            <ChallengeMasteryCrown />
            <View style={styles.masteryCopy}>
              <Text style={styles.masteryText}>Mastered!</Text>
              <Text style={styles.masterySubtext}>You unlocked the crown.</Text>
            </View>
          </View>
        ) : null}

        {isFullyRevealed ? (
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              onPress={onPlayAgain}
              style={[styles.actionButton, styles.primaryButton]}
              testID="challenge-play-again-button">
              <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
                Play Again
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => router.back()}
              style={[styles.actionButton, styles.secondaryButton]}
              testID="challenge-summary-back-button">
              <Text style={styles.actionButtonText}>Back</Text>
            </Pressable>
          </View>
        ) : (
          <Text style={styles.skipHint}>Tap anywhere to skip</Text>
        )}
      </Card>

      {!isFullyRevealed ? (
        <Pressable
          accessibilityRole="button"
          onPress={skipReveal}
          style={styles.skipOverlay}
          testID="challenge-results-skip-overlay"
        />
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    width: '100%',
  },
  card: {
    gap: spacing.md,
    overflow: 'hidden',
  },
  title: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 30,
    fontWeight: '700',
  },
  body: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    lineHeight: 22,
  },
  barSection: {
    gap: 10,
  },
  barHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  barValue: {
    color: palette.inkMuted,
    fontFamily: typography.displayFamily,
    fontSize: 20,
    fontWeight: '700',
  },
  barTrack: {
    backgroundColor: '#E9EEF4',
    borderRadius: 999,
    height: 18,
    overflow: 'visible',
    position: 'relative',
  },
  barFill: {
    borderRadius: 999,
    height: '100%',
  },
  accuracyFill: {
    backgroundColor: '#4DAF6F',
  },
  scoreFill: {
    backgroundColor: palette.coral,
  },
  markerWrap: {
    alignItems: 'center',
    marginLeft: -9,
    position: 'absolute',
    top: -16,
  },
  endMarkerWrap: {
    left: undefined,
    marginLeft: 0,
    right: 0,
  },
  markerLine: {
    backgroundColor: '#B9C4D2',
    height: 26,
    marginTop: 2,
    width: 2,
  },
  barFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  barHint: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
  },
  starsWrap: {
    alignItems: 'flex-start',
    gap: 6,
  },
  starsLabel: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  newBestPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF1E7',
    borderColor: '#F2B894',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  newBest: {
    color: palette.coral,
    fontFamily: typography.bodyFamily,
    fontSize: 15,
    fontWeight: '700',
  },
  masteryBanner: {
    alignItems: 'center',
    backgroundColor: '#FFF7E2',
    borderColor: '#EAC66A',
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  masteryCopy: {
    flex: 1,
    gap: 2,
  },
  masteryText: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  masterySubtext: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    lineHeight: 19,
  },
  actions: {
    gap: spacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    justifyContent: 'center',
    minHeight: 54,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  primaryButton: {
    backgroundColor: palette.coral,
    borderColor: palette.coral,
  },
  secondaryButton: {
    backgroundColor: palette.surfaceMuted,
    borderColor: palette.ring,
  },
  actionButtonText: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 20,
    fontWeight: '700',
  },
  primaryButtonText: {
    color: palette.white,
  },
  skipHint: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
  },
  skipOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});
