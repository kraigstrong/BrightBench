import { fractionsForMode } from '@/features/game/fractions';
import { bandForError, closestFraction, feedbackMessage, getFraction, sample } from '@/features/game/math';
import {
  DifficultyLevel,
  GenerateRoundOptions,
  LineAnswer,
  LineRound,
  RoundEvaluation,
} from '@/features/game/types';

// Hard rounds include fractions past 1 (5/4, 3/2, 7/4), so their line runs to 2.
function lineMaxForDifficulty(difficultyLevel: DifficultyLevel) {
  return difficultyLevel === 'hard' ? 2 : 1;
}

export function generateLineRound(options: GenerateRoundOptions): LineRound {
  const target = sample(fractionsForMode('line', options.difficultyLevel));

  return {
    id: `line-${Date.now()}`,
    mode: 'line',
    prompt: `Hop the frog to ${target.label}.`,
    targetFractionId: target.id,
    representation: 'line',
    difficultyLevel: options.difficultyLevel,
    lineMax: lineMaxForDifficulty(options.difficultyLevel),
  };
}

/**
 * Correct only when the frog lands exactly on the target, so an equivalent landing
 * (6 eighth-hops for 3/4) counts and a nearby one (3 eighth-hops for 1/3) does not.
 */
export function evaluateLineRound(round: LineRound, answer: LineAnswer): RoundEvaluation {
  const target = getFraction(round.targetFractionId);
  const isCorrect = answer.hops * target.denominator === target.numerator * answer.parts;
  const actualValue = answer.parts > 0 ? answer.hops / answer.parts : 0;
  const nearest = closestFraction(actualValue, 'line');
  const band = bandForError(Math.abs(actualValue - target.value));
  // A wrong landing can sit very near the target (1/7 for 1/6) but is never "exact".
  const scoreBand = isCorrect ? 'exact' : band === 'exact' ? 'close' : band;

  return {
    isCorrect,
    scoreBand,
    feedbackKey: feedbackMessage(scoreBand, round.targetFractionId, nearest.id),
    actualValue,
    nearestFractionId: nearest.id,
    detailLabel: isCorrect
      ? undefined
      : actualValue < target.value
        ? 'Try a little farther right.'
        : 'Try a little farther left.',
  };
}
