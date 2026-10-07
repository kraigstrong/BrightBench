import { PanelMessage } from '@/features/game/components/panel-message';
import { canMakeTarget, capitalize, partName } from '@/features/game/equal-parts';
import { getFraction } from '@/features/game/math';

// The most equal hops a whole can be split into. Eight covers every Number Line
// denominator and the equivalent landings its pool allows (2/4, 6/8, 10/8, ...).
export const MAX_HOP_PARTS = 8;

/** "1/4" for a whole split into 4 hops; "1 whole" when it is not split. */
export function hopSizeLabel(parts: number) {
  return parts === 1 ? '1 whole' : `1/${parts}`;
}

export function hopsLabel(hops: number) {
  return hops === 1 ? '1 hop' : `${hops} hops`;
}

export const ADJUST_MESSAGE: PanelMessage = {
  title: 'Hop to the flag.',
  body: 'Then check again.',
  tone: 'adjust',
};

export function missMessage(targetFractionId: string, parts: number, hops: number): PanelMessage {
  const target = getFraction(targetFractionId);

  if (!canMakeTarget(targetFractionId, parts)) {
    const size = parts === 1 ? 'Whole hops' : capitalize(partName(parts));

    return {
      title: `${size} can't land exactly on ${target.label}.`,
      body: `The dashed marks show ${partName(target.denominator)}. Try hops that line up with them.`,
      tone: 'adjust',
    };
  }

  return {
    title: hops / parts < target.value ? `Not quite to ${target.label}.` : `That's past ${target.label}.`,
    body: `The flag shows where ${target.label} is.`,
    tone: 'adjust',
  };
}

export function successMessage(targetFractionId: string, parts: number, hops: number): PanelMessage {
  const target = getFraction(targetFractionId);
  const made = `${hopsLabel(hops)} of ${hopSizeLabel(parts)}`;

  if (parts === target.denominator) {
    return {
      title: `That's ${target.label}!`,
      body: `${made}.`,
      tone: 'success',
    };
  }

  return {
    title: `${hops} ${partName(parts)} is the same as ${target.label}!`,
    body: `${capitalize(made)} land on the same spot as ${hopsLabel(target.numerator)} of 1/${target.denominator}.`,
    tone: 'success',
  };
}
