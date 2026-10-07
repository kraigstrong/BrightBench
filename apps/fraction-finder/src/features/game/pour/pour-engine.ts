import { PanelMessage } from '@/features/game/components/panel-message';
import { clamp, getFraction } from '@/features/game/math';
import { RoundEvaluation } from '@/features/game/types';

// Product-feel tuning for Pour, not curriculum rules.
export const FULL_POUR_SECONDS = 4;
// 1/24 divides every Pour denominator (2, 3, 4, 6), so taps alone can reach any target.
export const SPLASH_STEP = 1 / 24;
// A long frame (tab switch, slow device) should not dump a big slug of water.
export const MAX_FRAME_MS = 64;
// Glass heights as a share of the tallest glass the stage fits. Changing height every
// round means a remembered screen position never answers the next one.
export const GLASS_HEIGHT_SCALES = [0.66, 0.83, 1] as const;

export type PourDirection = 1 | -1;

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

let lastGlassHeightIndex: number | undefined;

/** Picks a glass height different from the previous round's. */
export function nextGlassHeightIndex() {
  const count = GLASS_HEIGHT_SCALES.length;
  const next =
    lastGlassHeightIndex === undefined
      ? Math.floor(Math.random() * count)
      : (lastGlassHeightIndex + 1 + Math.floor(Math.random() * (count - 1))) % count;

  lastGlassHeightIndex = next;
  return next;
}

export type PourMessage = PanelMessage;

export const ADJUST_MESSAGE: PourMessage = {
  title: 'Use the equal parts to fix it.',
  body: 'Then check again.',
  tone: 'adjust',
};

export function missMessage(
  targetFractionId: string,
  value: number,
  evaluation: RoundEvaluation
): PourMessage {
  const target = getFraction(targetFractionId);
  const isUnder = value < target.value;
  const isFar = evaluation.scoreBand === 'far';

  return {
    title: isUnder
      ? isFar
        ? `Not ${target.label} yet.`
        : `A little under ${target.label}.`
      : isFar
        ? `That's more than ${target.label}.`
        : `A little over ${target.label}.`,
    body: `The lines split the glass into ${target.denominator} equal parts.`,
    tone: 'adjust',
  };
}

export function successMessage(targetFractionId: string): PourMessage {
  const target = getFraction(targetFractionId);

  return {
    title: `That's ${target.label}!`,
    body: `${target.numerator} of ${target.denominator} equal parts.`,
    tone: 'success',
  };
}
