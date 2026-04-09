import { fractionsForMode } from '@/features/game/fractions';
import { bandForError, closestFraction, feedbackMessage, getFraction, sample } from '@/features/game/math';
import { GenerateRoundOptions, PourRound, RoundEvaluation } from '@/features/game/types';

export function generatePourRound(options: GenerateRoundOptions): PourRound {
  const target = sample(fractionsForMode('pour', options.difficultyLevel));

  return {
    id: `pour-${Date.now()}`,
    mode: 'pour',
    prompt: `Fill to about ${target.label}.`,
    targetFractionId: target.id,
    representation: 'container',
    difficultyLevel: options.difficultyLevel,
    tolerance: 0.08,
  };
}

export function evaluatePourRound(round: PourRound, actualValue: number): RoundEvaluation {
  const target = getFraction(round.targetFractionId);
  const nearest = closestFraction(actualValue, 'pour');
  const error = Math.abs(actualValue - target.value);
  const scoreBand = bandForError(error);

  return {
    isCorrect: error <= round.tolerance,
    scoreBand,
    feedbackKey: feedbackMessage(scoreBand, round.targetFractionId, nearest.id),
    actualValue,
    nearestFractionId: nearest.id,
    detailLabel: actualValue < target.value ? 'Try a little higher.' : 'Try a little lower.',
  };
}
