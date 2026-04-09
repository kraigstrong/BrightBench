import { fractionsForMode } from '@/features/game/fractions';
import { bandForError, closestFraction, feedbackMessage, getFraction, sample } from '@/features/game/math';
import { DifficultyLevel, GenerateRoundOptions, LineRound, RoundEvaluation } from '@/features/game/types';

function lineSettingsForDifficulty(
  difficultyLevel: DifficultyLevel,
  denominator: number
): Pick<LineRound, 'lineMax' | 'segmentCount' | 'tolerance'> {
  switch (difficultyLevel) {
    case 'easy':
      return {
        lineMax: 1,
        segmentCount: 4,
        tolerance: 0.08,
      };
    case 'medium':
      return {
        lineMax: 1,
        segmentCount: denominator,
        tolerance: 0.08,
      };
    case 'hard':
      return {
        lineMax: 2,
        segmentCount: denominator * 2,
        tolerance: 0.1,
      };
  }
}

export function generateLineRound(options: GenerateRoundOptions): LineRound {
  const target = sample(fractionsForMode('line', options.difficultyLevel));
  const settings = lineSettingsForDifficulty(options.difficultyLevel, target.denominator);

  return {
    id: `line-${Date.now()}`,
    mode: 'line',
    prompt: `Where does ${target.label} go on the number line?`,
    targetFractionId: target.id,
    representation: 'line',
    difficultyLevel: options.difficultyLevel,
    lineMax: settings.lineMax,
    segmentCount: settings.segmentCount,
    tolerance: settings.tolerance,
  };
}

export function evaluateLineRound(round: LineRound, actualValue: number): RoundEvaluation {
  const target = getFraction(round.targetFractionId);
  const nearest = closestFraction(actualValue, 'line');
  const error = Math.abs(actualValue - target.value);
  const scoreBand = bandForError(error);

  return {
    isCorrect: error <= round.tolerance,
    scoreBand,
    feedbackKey: feedbackMessage(scoreBand, round.targetFractionId, nearest.id),
    actualValue,
    nearestFractionId: nearest.id,
    detailLabel:
      scoreBand === 'exact'
        ? `Right on ${target.label}`
        : `${actualValue < target.value ? 'A little under' : 'A little over'} ${target.label}`,
  };
}
