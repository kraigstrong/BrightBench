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

import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';

import { Card } from './card';
import { CelebrationOverlay } from './celebration-overlay';
import { MasteryCrownBadge } from './mastery-crown-badge';
import { RewardStarGroup, RewardStarIcon } from './reward-star';

export type ChallengeResultsCardProps = {
  accuracy: number;
  accuracyThreshold: number;
  didUnlockMastery: boolean;
  masterySubtitle?: string;
  masteryTitle?: string;
  onBack: () => void;
  onPlayAgain: () => void;
  primaryActionLabel?: string;
  score: number;
  scoreThresholdOne: number;
  scoreThresholdTwo: number;
  secondaryActionLabel?: string;
  subtitle: string;
  title: string;
};

const CARD_POP_DURATION_MS = 220;
const ACCURACY_REVEAL_DURATION_MS = 1420;
const SCORE_REVEAL_DURATION_MS = 1520;
const BAR_HANDOFF_DELAY_MS = 180;
const FINISH_REVEAL_DELAY_MS = 320;
const MASTERY_REVEAL_HOLD_MS = 2400;
const MASTERY_REVEAL_FADE_MS = 280;
const SCORE_THRESHOLD_TWO_POSITION = 0.75;
const MASTERY_SPARKLE_POSITIONS = [
  { left: '20%', top: '26%', travelX: -16, travelY: -18, rotate: '-24deg' },
  { left: '35%', top: '18%', travelX: -8, travelY: -26, rotate: '32deg' },
  { left: '68%', top: '24%', travelX: 14, travelY: -18, rotate: '26deg' },
  { left: '74%', top: '42%', travelX: 18, travelY: 0, rotate: '-28deg' },
  { left: '28%', top: '46%', travelX: -14, travelY: 8, rotate: '30deg' },
  { left: '54%', top: '50%', travelX: 8, travelY: 12, rotate: '-22deg' },
] as const;

export function ChallengeResultsCard({
  accuracy,
  accuracyThreshold,
  didUnlockMastery,
  masterySubtitle = 'You mastered this challenge.',
  masteryTitle = 'Crown Unlocked!',
  onBack,
  onPlayAgain,
  primaryActionLabel = 'Play Again',
  score,
  scoreThresholdOne,
  scoreThresholdTwo,
  secondaryActionLabel = 'Back',
  subtitle,
  title,
}: ChallengeResultsCardProps) {
  const cardScale = useRef(new Animated.Value(0.96)).current;
  const accuracyProgress = useRef(new Animated.Value(0)).current;
  const scoreProgress = useRef(new Animated.Value(0)).current;
  const masteryOverlayOpacity = useRef(new Animated.Value(0)).current;
  const masteryCrownOpacity = useRef(new Animated.Value(0)).current;
  const masteryCrownScale = useRef(new Animated.Value(0.45)).current;
  const masteryTextOpacity = useRef(new Animated.Value(0)).current;
  const masterySparkleValues = useRef(
    Array.from({ length: 6 }, () => new Animated.Value(0)),
  ).current;
  const accuracyStarScale = useRef(new Animated.Value(1)).current;
  const scoreStarScales = useRef([new Animated.Value(1), new Animated.Value(1)]).current;
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const accuracyThresholdTriggeredRef = useRef(false);
  const scoreThresholdOneTriggeredRef = useRef(false);
  const scoreThresholdTwoTriggeredRef = useRef(false);

  const [accuracyTrackWidth, setAccuracyTrackWidth] = useState(0);
  const [scoreTrackWidth, setScoreTrackWidth] = useState(0);
  const [displayedStars, setDisplayedStars] = useState(0);
  const [isFullyRevealed, setIsFullyRevealed] = useState(false);
  const [revealCycle, setRevealCycle] = useState(0);
  const [showMasteryReveal, setShowMasteryReveal] = useState(false);
  const [showAccuracyPlayerMarker, setShowAccuracyPlayerMarker] = useState(false);
  const [showScorePlayerMarker, setShowScorePlayerMarker] = useState(false);
  const [showAccuracyThresholdStar, setShowAccuracyThresholdStar] = useState(false);
  const [showScoreThresholdOneStar, setShowScoreThresholdOneStar] = useState(false);
  const [showScoreThresholdTwoStar, setShowScoreThresholdTwoStar] = useState(false);

  const accuracyNormalized = Math.max(0, Math.min(1, accuracy / 100));
  const scoreVisualMax = Math.max(scoreThresholdTwo / SCORE_THRESHOLD_TWO_POSITION, 1);
  const scoreNormalized = Math.max(0, Math.min(1, score / scoreVisualMax));
  const accuracyEarnedThresholdStar = accuracy >= accuracyThreshold;
  const scoreEarnedThresholdOneStar = score >= scoreThresholdOne;
  const scoreEarnedThresholdTwoStar = score >= scoreThresholdTwo;
  const totalEarnedStars =
    Number(accuracyEarnedThresholdStar) +
    Number(scoreEarnedThresholdOneStar) +
    Number(scoreEarnedThresholdTwoStar);

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      clearTimeout(timer);
    }
    timersRef.current = [];
  }, []);

  const suspenseEasing = useRef(Easing.bezier(0.12, 0.72, 0.16, 1)).current;

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
    masteryOverlayOpacity.setValue(0);
    masteryCrownOpacity.setValue(0);
    masteryCrownScale.setValue(0.45);
    masteryTextOpacity.setValue(0);
    masterySparkleValues.forEach((value) => value.setValue(0));
    accuracyStarScale.setValue(1);
    scoreStarScales[0].setValue(1);
    scoreStarScales[1].setValue(1);
    setDisplayedStars(0);
    setIsFullyRevealed(false);
    setShowMasteryReveal(false);
    setShowAccuracyPlayerMarker(false);
    setShowScorePlayerMarker(false);
    setShowAccuracyThresholdStar(false);
    setShowScoreThresholdOneStar(false);
    setShowScoreThresholdTwoStar(false);
    accuracyThresholdTriggeredRef.current = false;
    scoreThresholdOneTriggeredRef.current = false;
    scoreThresholdTwoTriggeredRef.current = false;
  }, [
    accuracyProgress,
    accuracyStarScale,
    cardScale,
    clearTimers,
    masteryCrownOpacity,
    masteryCrownScale,
    masteryOverlayOpacity,
    masterySparkleValues,
    masteryTextOpacity,
    scoreProgress,
    scoreStarScales,
  ]);

  const startReveal = useCallback(() => {
    resetReveal();

    Animated.timing(cardScale, {
      duration: CARD_POP_DURATION_MS,
      easing: Easing.out(Easing.back(1.2)),
      toValue: 1,
      useNativeDriver: true,
    }).start();

    const accuracyStartDelay = 80;
    const accuracyTotalDuration = ACCURACY_REVEAL_DURATION_MS;

    const accuracyTimer = setTimeout(() => {
      Animated.timing(accuracyProgress, {
        duration: ACCURACY_REVEAL_DURATION_MS,
        easing: suspenseEasing,
        toValue: accuracyNormalized,
        useNativeDriver: false,
      }).start();
    }, accuracyStartDelay);

    timersRef.current.push(accuracyTimer);

    const accuracyMarkerTimer = setTimeout(() => {
      setShowAccuracyPlayerMarker(true);
    }, accuracyStartDelay + accuracyTotalDuration);

    timersRef.current.push(accuracyMarkerTimer);

    const scoreStartDelay = accuracyStartDelay + accuracyTotalDuration + BAR_HANDOFF_DELAY_MS;
    const scoreTotalDuration = SCORE_REVEAL_DURATION_MS;

    const scoreTimer = setTimeout(() => {
      Animated.timing(scoreProgress, {
        duration: SCORE_REVEAL_DURATION_MS,
        easing: suspenseEasing,
        toValue: scoreNormalized,
        useNativeDriver: false,
      }).start();
    }, scoreStartDelay);

    timersRef.current.push(scoreTimer);

    const scoreMarkerTimer = setTimeout(() => {
      setShowScorePlayerMarker(true);
    }, scoreStartDelay + scoreTotalDuration);

    timersRef.current.push(scoreMarkerTimer);

    const finishTimer = setTimeout(
      finishReveal,
      scoreStartDelay + scoreTotalDuration + FINISH_REVEAL_DELAY_MS,
    );

    timersRef.current.push(finishTimer);
  }, [
    accuracyNormalized,
    accuracyProgress,
    cardScale,
    finishReveal,
    resetReveal,
    scoreNormalized,
    scoreProgress,
    suspenseEasing,
  ]);

  useEffect(() => {
    const accuracyThresholdPoint = accuracyThreshold / 100;

    const listenerId = accuracyProgress.addListener(({ value }) => {
      if (
        accuracyEarnedThresholdStar &&
        !accuracyThresholdTriggeredRef.current &&
        value >= accuracyThresholdPoint
      ) {
        accuracyThresholdTriggeredRef.current = true;
        setShowAccuracyThresholdStar(true);
        setDisplayedStars((current) => Math.max(current, 1));
        runStarPop(accuracyStarScale);
      }
    });

    return () => {
      accuracyProgress.removeListener(listenerId);
    };
  }, [
    accuracyEarnedThresholdStar,
    accuracyProgress,
    accuracyStarScale,
    accuracyThreshold,
    runStarPop,
  ]);

  useEffect(() => {
    const listenerId = scoreProgress.addListener(({ value }) => {
      if (
        scoreEarnedThresholdOneStar &&
        !scoreThresholdOneTriggeredRef.current &&
        value >= scoreThresholdOne / scoreVisualMax
      ) {
        scoreThresholdOneTriggeredRef.current = true;
        setShowScoreThresholdOneStar(true);
        setDisplayedStars((current) => Math.max(current, 2));
        runStarPop(scoreStarScales[0]);
      }

      if (
        scoreEarnedThresholdTwoStar &&
        !scoreThresholdTwoTriggeredRef.current &&
        value >= scoreThresholdTwo / scoreVisualMax
      ) {
        scoreThresholdTwoTriggeredRef.current = true;
        setShowScoreThresholdTwoStar(true);
        setDisplayedStars(totalEarnedStars);
        runStarPop(scoreStarScales[1]);
      }
    });

    return () => {
      scoreProgress.removeListener(listenerId);
    };
  }, [
    runStarPop,
    scoreEarnedThresholdOneStar,
    scoreEarnedThresholdTwoStar,
    scoreProgress,
    scoreStarScales,
    scoreThresholdOne,
    scoreThresholdTwo,
    scoreVisualMax,
    totalEarnedStars,
  ]);

  useEffect(() => {
    startReveal();
    return clearTimers;
  }, [clearTimers, revealCycle, startReveal]);

  useEffect(() => {
    if (!didUnlockMastery || !isFullyRevealed) {
      return;
    }

    setShowMasteryReveal(true);
    masteryOverlayOpacity.setValue(0);
    masteryCrownOpacity.setValue(0);
    masteryCrownScale.setValue(0.45);
    masteryTextOpacity.setValue(0);
    masterySparkleValues.forEach((value) => value.setValue(0));

    Animated.parallel([
      Animated.timing(masteryOverlayOpacity, {
        duration: 220,
        easing: Easing.out(Easing.quad),
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(140),
        Animated.parallel([
          Animated.timing(masteryCrownOpacity, {
            duration: 160,
            easing: Easing.out(Easing.quad),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.spring(masteryCrownScale, {
            friction: 6,
            tension: 110,
            toValue: 1.16,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(masteryCrownScale, {
          friction: 7,
          tension: 105,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.delay(280),
        Animated.timing(masteryTextOpacity, {
          duration: 220,
          easing: Easing.out(Easing.quad),
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
      ...masterySparkleValues.map((value, index) =>
        Animated.sequence([
          Animated.delay(170 + index * 35),
          Animated.timing(value, {
            duration: 700,
            easing: Easing.out(Easing.cubic),
            toValue: 1,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();

    const hideTimer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(masteryOverlayOpacity, {
          duration: MASTERY_REVEAL_FADE_MS,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(masteryTextOpacity, {
          duration: MASTERY_REVEAL_FADE_MS,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.timing(masteryCrownOpacity, {
          duration: MASTERY_REVEAL_FADE_MS,
          easing: Easing.inOut(Easing.quad),
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setShowMasteryReveal(false);
      });
    }, MASTERY_REVEAL_HOLD_MS);

    timersRef.current.push(hideTimer);
  }, [
    clearTimers,
    didUnlockMastery,
    isFullyRevealed,
    masteryCrownOpacity,
    masteryCrownScale,
    masteryOverlayOpacity,
    masterySparkleValues,
    masteryTextOpacity,
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
    masteryOverlayOpacity.setValue(didUnlockMastery ? 1 : 0);
    masteryCrownOpacity.setValue(didUnlockMastery ? 1 : 0);
    masteryCrownScale.setValue(1);
    masteryTextOpacity.setValue(didUnlockMastery ? 1 : 0);
    masterySparkleValues.forEach((value) => value.setValue(didUnlockMastery ? 1 : 0));
    accuracyStarScale.setValue(1);
    scoreStarScales[0].setValue(1);
    scoreStarScales[1].setValue(1);
    setShowMasteryReveal(didUnlockMastery);
    setShowAccuracyThresholdStar(accuracyEarnedThresholdStar);
    setShowScoreThresholdOneStar(scoreEarnedThresholdOneStar);
    setShowScoreThresholdTwoStar(scoreEarnedThresholdTwoStar);
    setShowAccuracyPlayerMarker(true);
    setShowScorePlayerMarker(true);
    finishReveal();
  }

  function handleReanimate() {
    setRevealCycle((current) => current + 1);
  }

  function handlePlayAgainPress() {
    if (!isFullyRevealed) {
      skipReveal();
      return;
    }

    onPlayAgain();
  }

  function handleBackPress() {
    if (!isFullyRevealed) {
      skipReveal();
      return;
    }

    onBack();
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
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.body}>{subtitle}</Text>

        <View style={styles.barSection}>
          <View style={styles.barHeader}>
            <Text style={styles.barTitle}>Accuracy</Text>
          </View>
          <View onLayout={handleAccuracyTrackLayout} style={styles.barTrack}>
            <Animated.View
              style={[styles.barFill, styles.accuracyFill, { width: animatedAccuracyWidth }]}
            />

            <View style={[styles.markerWrap, { left: `${accuracyThreshold}%` }]}>
              <Text style={styles.markerValueLabel}>{accuracyThreshold}%</Text>
              <Animated.View style={{ transform: [{ scale: accuracyStarScale }] }}>
                <RewardStarIcon filled={showAccuracyThresholdStar} size={22} />
              </Animated.View>
            </View>

            {showAccuracyPlayerMarker ? (
              <View style={[styles.playerMarkerWrap, { left: `${accuracyNormalized * 100}%` }]}>
                <View style={styles.playerMarkerLine} />
                <Text style={styles.playerMarkerLabel}>{accuracy}%</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.barSection}>
          <View style={styles.barHeader}>
            <Text style={styles.barTitle}>Score</Text>
          </View>
          <View onLayout={handleScoreTrackLayout} style={styles.barTrack}>
            <Animated.View
              style={[styles.barFill, styles.scoreFill, { width: animatedScoreWidth }]}
            />

            <View
              style={[
                styles.markerWrap,
                { left: `${(scoreThresholdOne / scoreVisualMax) * 100}%` },
              ]}>
              <Text style={styles.markerValueLabel}>{scoreThresholdOne}</Text>
              <Animated.View style={{ transform: [{ scale: scoreStarScales[0] }] }}>
                <RewardStarIcon filled={showScoreThresholdOneStar} size={22} />
              </Animated.View>
            </View>

            <View
              style={[
                styles.markerWrap,
                { left: `${(scoreThresholdTwo / scoreVisualMax) * 100}%` },
              ]}>
              <Text style={styles.markerValueLabel}>{scoreThresholdTwo}</Text>
              <Animated.View style={{ transform: [{ scale: scoreStarScales[1] }] }}>
                <RewardStarIcon filled={showScoreThresholdTwoStar} size={22} />
              </Animated.View>
            </View>

            {showScorePlayerMarker ? (
              <View style={[styles.playerMarkerWrap, { left: `${scoreNormalized * 100}%` }]}>
                <View style={styles.playerMarkerLine} />
                <Text style={styles.playerMarkerLabel}>{score}</Text>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.starsWrap}>
          <RewardStarGroup starSize={20} stars={displayedStars} />
          <Text style={styles.starsLabel}>
            {isFullyRevealed
              ? totalEarnedStars === 1
                ? '1 star earned'
                : `${totalEarnedStars} stars earned`
              : 'Revealing your stars...'}
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            onPress={handlePlayAgainPress}
            style={[styles.actionButton, styles.primaryButton]}
            testID="challenge-play-again-button">
            <Text style={[styles.actionButtonText, styles.primaryButtonText]}>
              {primaryActionLabel}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={handleBackPress}
            style={[styles.actionButton, styles.secondaryButton]}
            testID="challenge-summary-back-button">
            <Text style={styles.actionButtonText}>{secondaryActionLabel}</Text>
          </Pressable>
        </View>

        {showMasteryReveal ? (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.masteryOverlay,
              { opacity: masteryOverlayOpacity },
            ]}>
            <Animated.View style={styles.masteryGlow} />

            {masterySparkleValues.map((value, index) => {
              const piece = MASTERY_SPARKLE_POSITIONS[index];

              return (
                <Animated.View
                  key={`mastery-sparkle-${index}`}
                  style={[
                    styles.masterySparkle,
                    { left: piece.left, top: piece.top },
                    {
                      opacity: value.interpolate({
                        inputRange: [0, 0.14, 0.88, 1],
                        outputRange: [0, 1, 1, 0],
                      }),
                      transform: [
                        {
                          translateX: value.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, piece.travelX],
                          }),
                        },
                        {
                          translateY: value.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, piece.travelY],
                          }),
                        },
                        {
                          rotate: value.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', piece.rotate],
                          }),
                        },
                        {
                          scale: value.interpolate({
                            inputRange: [0, 0.25, 1],
                            outputRange: [0.5, 1.15, 0.82],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              );
            })}

            <Animated.View
              style={[
                styles.masteryCrownWrap,
                {
                  opacity: masteryCrownOpacity,
                  transform: [{ scale: masteryCrownScale }],
                },
              ]}>
              <MasteryCrownBadge size={72} />
            </Animated.View>

            <Animated.View
              style={[
                styles.masteryTextWrap,
                { opacity: masteryTextOpacity },
              ]}>
              <Text style={styles.masteryTitle}>{masteryTitle}</Text>
              <Text style={styles.masterySubtitle}>{masterySubtitle}</Text>
            </Animated.View>

            <CelebrationOverlay
              showMessage={false}
              visible={showMasteryReveal}
            />
          </Animated.View>
        ) : null}
      </Card>

      {!isFullyRevealed ? (
        <Pressable
          accessibilityRole="button"
          onPress={skipReveal}
          style={styles.skipOverlay}
          testID="challenge-results-skip-overlay"
        />
      ) : null}

      {__DEV__ && isFullyRevealed ? (
        <View pointerEvents="box-none" style={styles.devOverlay}>
          <Pressable
            accessibilityRole="button"
            onPress={handleReanimate}
            style={styles.devOverlayButton}
            testID="challenge-reanimate-button">
            <Text style={styles.devButtonText}>Reanimate</Text>
          </Pressable>
        </View>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    position: 'relative',
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
    justifyContent: 'flex-start',
  },
  barTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 22,
    fontWeight: '700',
  },
  barTrack: {
    backgroundColor: '#E9EEF4',
    borderRadius: 999,
    height: 18,
    marginBottom: 34,
    marginTop: 18,
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
    marginLeft: -24,
    position: 'absolute',
    top: -25,
    width: 48,
  },
  markerValueLabel: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  playerMarkerWrap: {
    alignItems: 'center',
    bottom: -30,
    marginLeft: -24,
    position: 'absolute',
    width: 48,
  },
  playerMarkerLine: {
    backgroundColor: palette.ink,
    height: 16,
    width: 2,
  },
  playerMarkerLabel: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
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
  masteryOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    zIndex: 5,
  },
  masteryGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 248, 225, 0.86)',
  },
  masterySparkle: {
    backgroundColor: palette.gold,
    borderRadius: 5,
    height: 12,
    marginLeft: -6,
    marginTop: -6,
    position: 'absolute',
    width: 12,
  },
  masteryCrownWrap: {
    marginTop: -22,
  },
  masteryTextWrap: {
    alignItems: 'center',
    gap: 4,
    marginTop: 12,
  },
  masteryTitle: {
    color: palette.ink,
    fontFamily: typography.displayFamily,
    fontSize: 30,
    fontWeight: '700',
    textAlign: 'center',
  },
  masterySubtitle: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 22,
    textAlign: 'center',
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
  skipOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  devOverlay: {
    position: 'absolute',
    right: 10,
    top: 10,
    zIndex: 20,
  },
  devOverlayButton: {
    alignItems: 'center',
    backgroundColor: '#EEF3FA',
    borderColor: '#B9C7DA',
    borderRadius: 999,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 34,
    paddingHorizontal: 12,
  },
  devButtonText: {
    color: palette.ink,
    fontFamily: typography.bodyFamily,
    fontSize: 16,
    fontWeight: '700',
  },
});
