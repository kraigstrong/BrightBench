import { fractionsForMode } from '@/features/game/fractions';
import { getFraction } from '@/features/game/math';
import { DifficultyLevel } from '@/features/game/types';
import {
  advancePour,
  checkPour,
  complementLabel,
  FULL_POUR_SECONDS,
  MAX_FRAME_MS,
  missMessage,
  nextLabRound,
  settlePour,
  SPLASH_STEP,
  successMessage,
} from '@/features/pour-lab/pour-engine';

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
});

describe('lab rounds', () => {
  it.each<DifficultyLevel>(['easy', 'medium', 'hard'])(
    'draws %s targets from the existing Pour pool without back-to-back repeats',
    (difficultyLevel) => {
      const pool = new Set(fractionsForMode('pour', difficultyLevel).map((fraction) => fraction.id));
      let round = nextLabRound(difficultyLevel);

      for (let index = 0; index < 200; index += 1) {
        const next = nextLabRound(difficultyLevel, round);

        expect(pool.has(next.pourRound.targetFractionId)).toBe(true);
        expect(next.number).toBe(round.number + 1);
        expect(next.glassHeightIndex).not.toBe(round.glassHeightIndex);
        if (pool.size > 1) {
          expect(next.pourRound.targetFractionId).not.toBe(round.pourRound.targetFractionId);
        }
        round = next;
      }
    }
  );

  it('uses the existing Pour tolerance to judge a pour', () => {
    const round = nextLabRound('medium');
    const target = getFraction(round.pourRound.targetFractionId).value;

    expect(checkPour(round, target + 0.07).isCorrect).toBe(true);
    expect(checkPour(round, target - 0.07).isCorrect).toBe(true);
    expect(checkPour(round, target + 0.09).isCorrect).toBe(false);
    expect(checkPour(round, target - 0.09).isCorrect).toBe(false);
  });
});

describe('lab copy', () => {
  it('names the rest of the whole', () => {
    expect(complementLabel('2-3')).toBe('1/3');
    expect(complementLabel('1-2')).toBe('1/2');
    expect(complementLabel('5-6')).toBe('1/6');
    expect(complementLabel('1-4')).toBe('3/4');
  });

  it('says which way a miss was off and points to the equal parts', () => {
    const round = nextLabRound('easy');
    const id = round.pourRound.targetFractionId;
    const target = getFraction(id);
    const under = target.value - 0.12;
    const over = target.value + 0.12;

    expect(missMessage('peek', id, under, checkPour(round, under))).toEqual({
      title: `A little under ${target.label}.`,
      body: `The lines split the glass into ${target.denominator} equal parts.`,
      tone: 'adjust',
    });
    expect(missMessage('peek', id, over, checkPour(round, over)).title).toBe(
      `A little over ${target.label}.`
    );
    expect(missMessage('split', id, over, checkPour(round, over)).body).toBe(
      `The lines split each glass into ${target.denominator} equal parts.`
    );
  });

  it('connects the fraction to its parts on success', () => {
    expect(successMessage('peek', '2-3')).toEqual({
      title: "That's 2/3!",
      body: '2 of 3 equal parts.',
      tone: 'success',
    });
    expect(successMessage('split', '3-4').title).toBe('3/4 poured, 1/4 left.');
  });
});
