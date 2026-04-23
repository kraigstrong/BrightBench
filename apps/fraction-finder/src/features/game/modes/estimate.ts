import { fractionsForMode } from '@/features/game/fractions';
import { clamp, closestFraction, distractorsForFraction, getFraction, sample, shuffle } from '@/features/game/math';
import { EstimateRound, GenerateRoundOptions, RoundEvaluation } from '@/features/game/types';

function estimateDistractorsForAnswer({
  answerId,
  pool,
  count,
  minGap,
}: {
  answerId: string;
  pool: Array<{ id: string; value: number }>;
  count: number;
  minGap: number;
}) {
  const answer = getFraction(answerId);
  const eligible = pool
    .filter((fraction) => fraction.id !== answerId)
    .filter((fraction) => Math.abs(fraction.value - answer.value) >= minGap);

  // Prefer "near" distractors, but not so near they become indistinguishable in a solid bar.
  if (eligible.length >= count) {
    return eligible
      .slice()
      .sort((left, right) => {
        const leftGap = Math.abs(left.value - answer.value);
        const rightGap = Math.abs(right.value - answer.value);
        return leftGap - rightGap;
      })
      .slice(0, count)
      .map((fraction) => fraction.id);
  }

  // Fallback if the pool is too small (should be rare).
  return distractorsForFraction(answerId, pool as any, count);
}

export function generateEstimateRound(options: GenerateRoundOptions): EstimateRound {
  const pool = fractionsForMode('estimate', options.difficultyLevel);
  const target = sample(pool);
  const drift = Math.random() * 0.08 - 0.04;
  const actualValue = clamp(target.value + drift, 0.08, 0.92);
  const answer = closestFraction(actualValue, 'estimate');
  const distractors = estimateDistractorsForAnswer({
    answerId: answer.id,
    pool,
    count: Math.min(2, pool.length - 1),
    // Prevent pairs like 5/6 vs 7/8 (~0.042 apart) from appearing together.
    minGap: 0.06,
  });

  return {
    id: `estimate-${Date.now()}`,
    mode: 'estimate',
    prompt: 'About how full is it?',
    targetFractionId: answer.id,
    representation: 'bar',
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
