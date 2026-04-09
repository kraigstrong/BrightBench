import { fractionsForMode } from '@/features/game/fractions';
import { clamp, closestFraction, distractorsForFraction, sample, shuffle } from '@/features/game/math';
import { EstimateRound, GenerateRoundOptions, RoundEvaluation } from '@/features/game/types';

export function generateEstimateRound(options: GenerateRoundOptions): EstimateRound {
  const pool = fractionsForMode('estimate', options.difficultyLevel);
  const target = sample(pool);
  const drift = Math.random() * 0.08 - 0.04;
  const actualValue = clamp(target.value + drift, 0.08, 0.92);
  const answer = closestFraction(actualValue, 'estimate');
  const distractors = distractorsForFraction(answer.id, pool, Math.min(2, pool.length - 1));

  return {
    id: `estimate-${Date.now()}`,
    mode: 'estimate',
    prompt: 'About how full is it?',
    targetFractionId: answer.id,
    representation: sample(['container', 'meter']),
    difficultyLevel: options.difficultyLevel,
    actualValue,
    options: shuffle([answer.id, ...distractors]),
  };
}

export function evaluateEstimateRound(round: EstimateRound, answerId: string): RoundEvaluation {
  return {
    isCorrect: answerId === round.targetFractionId,
    scoreBand: answerId === round.targetFractionId ? 'exact' : 'close',
    feedbackKey: answerId === round.targetFractionId ? 'estimate-correct' : 'estimate-nearby',
    actualValue: round.actualValue,
    nearestFractionId: round.targetFractionId,
    detailLabel:
      answerId === round.targetFractionId
        ? undefined
        : 'Check whether the picture looks less than half, about half, or more than half.',
  };
}
