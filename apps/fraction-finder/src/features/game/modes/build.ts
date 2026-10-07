import { fractionsForMode } from '@/features/game/fractions';
import { getFraction, sample } from '@/features/game/math';
import { BuildAnswer, BuildRound, GenerateRoundOptions, RoundEvaluation } from '@/features/game/types';

export function generateBuildRound(options: GenerateRoundOptions): BuildRound {
  const target = sample(fractionsForMode('build', options.difficultyLevel));

  return {
    id: `build-${Date.now()}`,
    mode: 'build',
    prompt: `Make ${target.label}.`,
    targetFractionId: target.id,
    representation: 'bar',
    difficultyLevel: options.difficultyLevel,
    partitions: target.denominator,
  };
}

/**
 * Correct when the filled share of the bar equals the target, so an equivalent build
 * (6 of 8 pieces for 3/4) counts as well as the target's own parts (3 of 4).
 */
export function evaluateBuildRound(round: BuildRound, answer: BuildAnswer): RoundEvaluation {
  const target = getFraction(round.targetFractionId);
  const isCorrect = answer.filled * target.denominator === target.numerator * answer.pieces;
  const actualValue = answer.pieces > 0 ? answer.filled / answer.pieces : 0;

  return {
    isCorrect,
    scoreBand: isCorrect ? 'exact' : 'almost',
    feedbackKey: isCorrect ? 'build-correct' : 'build-adjust',
    actualValue,
    detailLabel: isCorrect
      ? undefined
      : actualValue < target.value
        ? 'Try shading a little more.'
        : 'Try shading a little less.',
  };
}
