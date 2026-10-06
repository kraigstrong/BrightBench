import { FRACTION_BY_ID } from '@/features/game/fractions';
import { clamp, getFraction } from '@/features/game/math';
import { evaluatePourRound, generatePourRound } from '@/features/game/modes/pour';
import { DifficultyLevel, PourRound, RoundEvaluation } from '@/features/game/types';

// Prototype tuning. These are product-feel defaults, not curriculum rules.
export const FULL_POUR_SECONDS = 4;
// 1/24 divides every Pour denominator (2, 3, 4, 6), so taps alone can reach any target.
export const SPLASH_STEP = 1 / 24;
// A long frame (tab switch, slow device) should not dump a big slug of water.
export const MAX_FRAME_MS = 64;
export const GLASS_HEIGHT_COUNT = 3;

export type PourDirection = 1 | -1;
export type PourLabConcept = 'peek' | 'split';

export const POUR_LAB_CONCEPTS: PourLabConcept[] = ['peek', 'split'];

export function isPourLabConcept(value: string | undefined): value is PourLabConcept {
  return POUR_LAB_CONCEPTS.some((concept) => concept === value);
}

export function advancePour(value: number, direction: PourDirection, elapsedMs: number) {
  const elapsed = clamp(elapsedMs, 0, MAX_FRAME_MS);
  return clamp(value + (direction * elapsed) / 1000 / FULL_POUR_SECONDS, 0, 1);
}

// A quick tap always moves exactly one splash, so children who cannot hold steadily
// can still build any amount without precision timing.
export function settlePour(startValue: number, endValue: number, direction: PourDirection) {
  if (Math.abs(endValue - startValue) >= SPLASH_STEP - 1e-9) {
    return endValue;
  }

  return clamp(startValue + direction * SPLASH_STEP, 0, 1);
}

export type LabRound = {
  number: number;
  pourRound: PourRound;
  glassHeightIndex: number;
};

function pickDifferent(count: number, previous: number | undefined) {
  if (count <= 1 || previous === undefined) {
    return Math.floor(Math.random() * count);
  }

  const offset = 1 + Math.floor(Math.random() * (count - 1));
  return (previous + offset) % count;
}

export function nextLabRound(difficultyLevel: DifficultyLevel, previous?: LabRound): LabRound {
  let pourRound = generatePourRound({ difficultyLevel });

  // The pool is unchanged; this only avoids the same target twice in a row.
  for (
    let attempt = 0;
    attempt < 6 && previous && pourRound.targetFractionId === previous.pourRound.targetFractionId;
    attempt += 1
  ) {
    pourRound = generatePourRound({ difficultyLevel });
  }

  return {
    number: (previous?.number ?? 0) + 1,
    pourRound,
    glassHeightIndex: pickDifferent(GLASS_HEIGHT_COUNT, previous?.glassHeightIndex),
  };
}

export function checkPour(round: LabRound, value: number): RoundEvaluation {
  return evaluatePourRound(round.pourRound, value);
}

export function complementLabel(targetFractionId: string) {
  const target = getFraction(targetFractionId);
  const restId = `${target.denominator - target.numerator}-${target.denominator}`;

  return FRACTION_BY_ID[restId]?.label ?? `${target.denominator - target.numerator}/${target.denominator}`;
}

export type LabMessage = {
  title: string;
  body?: string;
  tone: 'hint' | 'adjust' | 'success';
};

export function missMessage(
  concept: PourLabConcept,
  targetFractionId: string,
  value: number,
  evaluation: RoundEvaluation
): LabMessage {
  const target = getFraction(targetFractionId);
  const isUnder = value < target.value;
  const isFar = evaluation.scoreBand === 'far';
  const partsBody = `The lines split ${concept === 'split' ? 'each glass' : 'the glass'} into ${target.denominator} equal parts.`;

  if (concept === 'split') {
    return {
      title: isUnder
        ? isFar
          ? `The new glass needs more to be ${target.label}.`
          : `A little less than ${target.label} so far.`
        : isFar
          ? `That's more than ${target.label} in the new glass.`
          : `A little more than ${target.label}.`,
      body: partsBody,
      tone: 'adjust',
    };
  }

  return {
    title: isUnder
      ? isFar
        ? `Not ${target.label} yet.`
        : `A little under ${target.label}.`
      : isFar
        ? `That's more than ${target.label}.`
        : `A little over ${target.label}.`,
    body: partsBody,
    tone: 'adjust',
  };
}

export function successMessage(concept: PourLabConcept, targetFractionId: string): LabMessage {
  const target = getFraction(targetFractionId);

  if (concept === 'split') {
    return {
      title: `${target.label} poured, ${complementLabel(targetFractionId)} left.`,
      body: 'Together they make 1 whole.',
      tone: 'success',
    };
  }

  return {
    title: `That's ${target.label}!`,
    body: `${target.numerator} of ${target.denominator} equal parts.`,
    tone: 'success',
  };
}
