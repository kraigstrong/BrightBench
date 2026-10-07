import { PanelMessage } from '@/features/game/components/panel-message';
import { canMakeTarget, capitalize, partName } from '@/features/game/equal-parts';
import { getFraction } from '@/features/game/math';

// The most pieces a bar can be cut into. Eight covers every Build denominator and the
// equivalent builds the curriculum pool allows (2/4, 3/6, 4/8, 2/8, 6/8, 2/6, 4/6).
export const MAX_PIECES = 8;

/** Moves every filled piece to the left so the filled share reads as one stretch from 0. */
export function packFilled(pieces: number, filledCount: number) {
  return Array.from({ length: pieces }, (_, index) => index < filledCount);
}

export const ADJUST_MESSAGE: PanelMessage = {
  title: 'Use the dashed lines to fix it.',
  body: 'Then check again.',
  tone: 'adjust',
};

export function missMessage(
  targetFractionId: string,
  pieces: number,
  filledCount: number
): PanelMessage {
  const target = getFraction(targetFractionId);
  const guide = `The dashed lines show ${partName(target.denominator)}.`;

  if (!canMakeTarget(targetFractionId, pieces)) {
    const cut = pieces === 1 ? 'One whole piece' : capitalize(partName(pieces));

    return {
      title: `${cut} can't make exactly ${target.label}.`,
      body: `${guide} Try a cut that lines up with them.`,
      tone: 'adjust',
    };
  }

  return {
    title: filledCount / pieces < target.value ? `Less than ${target.label}.` : `More than ${target.label}.`,
    body: guide,
    tone: 'adjust',
  };
}

export function successMessage(
  targetFractionId: string,
  pieces: number,
  filledCount: number
): PanelMessage {
  const target = getFraction(targetFractionId);

  if (pieces === target.denominator) {
    return {
      title: `That's ${target.label}!`,
      body: `${target.numerator} of ${target.denominator} equal parts.`,
      tone: 'success',
    };
  }

  return {
    title: `${filledCount} ${partName(pieces)} is the same as ${target.label}!`,
    body: `${filledCount} of ${pieces} equal parts fill the same space as ${target.numerator} of ${target.denominator}.`,
    tone: 'success',
  };
}
