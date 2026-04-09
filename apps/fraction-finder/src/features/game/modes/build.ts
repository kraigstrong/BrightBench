import { fractionsForMode } from '@/features/game/fractions';
import { getFraction, sample } from '@/features/game/math';
import { BuildRound, GenerateRoundOptions, RoundEvaluation } from '@/features/game/types';

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

export function evaluateBuildRound(round: BuildRound, filledCount: number): RoundEvaluation {
  const target = getFraction(round.targetFractionId);
  const isCorrect = filledCount === target.numerator;

  return {
    isCorrect,
    scoreBand: isCorrect ? 'exact' : 'almost',
    feedbackKey: isCorrect ? 'build-correct' : 'build-adjust',
    detailLabel: isCorrect
      ? undefined
      : filledCount < target.numerator
        ? 'Try shading a little more.'
        : 'Try shading a little less.',
  };
}
