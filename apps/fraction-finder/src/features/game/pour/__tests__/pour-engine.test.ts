import { fractionsForMode } from '@/features/game/fractions';
import { evaluatePourRound } from '@/features/game/modes/pour';
import {
  advancePour,
  FULL_POUR_SECONDS,
  GLASS_HEIGHT_SCALES,
  MAX_FRAME_MS,
  missMessage,
  nextGlassHeightIndex,
  settlePour,
  SPLASH_STEP,
  successMessage,
} from '@/features/game/pour/pour-engine';
import { PourRound } from '@/features/game/types';

const round: PourRound = {
  id: 'pour-test',
  mode: 'pour',
  prompt: 'Fill to about 2/3.',
  targetFractionId: '2-3',
  representation: 'container',
  difficultyLevel: 'medium',
  tolerance: 0.08,
};

describe('pour engine', () => {
  it('fills a whole glass in FULL_POUR_SECONDS of steady pouring', () => {
    let value = 0;
    for (let elapsed = 0; elapsed < FULL_POUR_SECONDS * 1000; elapsed += 16) {
      value = advancePour(value, 1, 16);
    }

    expect(value).toBeCloseTo(1, 2);
  });

  it('clamps to an empty or full glass', () => {
    expect(advancePour(0.99, 1, 60)).toBe(1);
    expect(advancePour(0.01, -1, 60)).toBe(0);
  });

  it('caps a long stalled frame so water never jumps', () => {
    expect(advancePour(0, 1, 5000)).toBeCloseTo(MAX_FRAME_MS / 1000 / FULL_POUR_SECONDS, 6);
  });

  it('turns a quick tap into exactly one splash in either direction', () => {
    expect(settlePour(0.25, 0.26, 1)).toBeCloseTo(0.25 + SPLASH_STEP, 9);
    expect(settlePour(0.5, 0.49, -1)).toBeCloseTo(0.5 - SPLASH_STEP, 9);
    expect(settlePour(0, 0, -1)).toBe(0);
  });

  it('leaves a real pour where the child stopped it', () => {
    expect(settlePour(0.1, 0.45, 1)).toBe(0.45);
  });

  it('lets taps alone land exactly on every Pour target', () => {
    for (const fraction of fractionsForMode('pour', 'hard')) {
      const taps = fraction.value / SPLASH_STEP;
      expect(Math.abs(taps - Math.round(taps))).toBeLessThan(1e-9);
    }
  });

  it('never repeats the glass height on consecutive rounds', () => {
    let previous = nextGlassHeightIndex();

    for (let index = 0; index < 200; index += 1) {
      const next = nextGlassHeightIndex();
      expect(next).not.toBe(previous);
      expect(next).toBeGreaterThanOrEqual(0);
      expect(next).toBeLessThan(GLASS_HEIGHT_SCALES.length);
      previous = next;
    }
  });
});

describe('pour messages', () => {
  it('says which way a miss was off and points to the equal parts', () => {
    const under = 2 / 3 - 0.12;
    const farOver = 2 / 3 + 0.25;

    expect(missMessage('2-3', under, evaluatePourRound(round, under))).toEqual({
      title: 'A little under 2/3.',
      body: 'The lines split the glass into 3 equal parts.',
      tone: 'adjust',
    });
    expect(missMessage('2-3', farOver, evaluatePourRound(round, farOver)).title).toBe(
      "That's more than 2/3."
    );
  });

  it('connects the fraction to its parts on success', () => {
    expect(successMessage('2-3')).toEqual({
      title: "That's 2/3!",
      body: '2 of 3 equal parts.',
      tone: 'success',
    });
  });
});
