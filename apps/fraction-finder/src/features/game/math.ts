import { FRACTION_BY_ID, FRACTION_LIBRARY } from '@/features/game/fractions';
import { FractionConcept, GameMode, ScoreBand } from '@/features/game/types';

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function sample<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function shuffle<T>(items: T[]) {
  const clone = [...items];

  for (let index = clone.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[target]] = [clone[target], clone[index]];
  }

  return clone;
}

export function getFraction(id: string) {
  return FRACTION_BY_ID[id];
}

export function compareFractionIds(leftId: string, rightId: string) {
  return getFraction(leftId).value - getFraction(rightId).value;
}

export function closestFraction(value: number, mode?: GameMode) {
  const fractions = mode
    ? FRACTION_LIBRARY.filter((fraction) => fraction.eligibleModes.includes(mode))
    : FRACTION_LIBRARY;

  return fractions.reduce((best, fraction) => {
    const bestError = Math.abs(best.value - value);
    const nextError = Math.abs(fraction.value - value);
    return nextError < bestError ? fraction : best;
  });
}

export function distractorsForFraction(targetId: string, pool: FractionConcept[], count: number) {
  const target = getFraction(targetId);

  return pool
    .filter((fraction) => fraction.id !== targetId)
    .sort((left, right) => {
      const leftGap = Math.abs(left.value - target.value);
      const rightGap = Math.abs(right.value - target.value);
      return leftGap - rightGap;
    })
    .slice(0, count)
    .map((fraction) => fraction.id);
}

export function formatFractionId(id?: string) {
  if (!id) {
    return '';
  }

  return getFraction(id).label;
}

export function bandForError(error: number): ScoreBand {
  if (error <= 0.03) {
    return 'exact';
  }
  if (error <= 0.08) {
    return 'close';
  }
  if (error <= 0.16) {
    return 'almost';
  }
  return 'far';
}

export function feedbackMessage(scoreBand: ScoreBand, targetId: string, nearestId?: string) {
  const target = formatFractionId(targetId);
  const nearest = formatFractionId(nearestId);

  if (scoreBand === 'exact') {
    return `Beautiful job. That was almost exactly ${target}.`;
  }
  if (scoreBand === 'close') {
    return `Very close. You landed right near ${target}.`;
  }
  if (scoreBand === 'almost') {
    return nearest
      ? `Nice try. That looked a little more like ${nearest}.`
      : `Nice try. You were a little off from ${target}.`;
  }
  return nearest
    ? `Keep going. That ended up closer to ${nearest} than ${target}.`
    : `Keep going. That was a bit away from ${target}.`;
}

export function describeFillDifference(actualValue: number, targetValue: number) {
  if (Math.abs(actualValue - targetValue) <= 0.03) {
    return 'Right on target';
  }

  return actualValue < targetValue ? 'A little under' : 'A little over';
}
