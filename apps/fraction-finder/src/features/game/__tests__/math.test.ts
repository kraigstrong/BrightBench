import { fractionsForMode } from '@/features/game/fractions';
import { closestFraction, compareFractionIds, distractorsForFraction } from '@/features/game/math';

describe('fraction math helpers', () => {
  it('compares fractions by value', () => {
    expect(compareFractionIds('3-4', '1-2')).toBeGreaterThan(0);
    expect(compareFractionIds('1-4', '1-2')).toBeLessThan(0);
  });

  it('finds the closest canonical fraction', () => {
    expect(closestFraction(0.52).id).toBe('1-2');
    expect(closestFraction(0.7).id).toBe('2-3');
    expect(closestFraction(1.42, 'line').id).toBe('3-2');
  });

  it('builds plausible distractors from nearby values', () => {
    const distractors = distractorsForFraction('1-2', fractionsForMode('find', 'hard'), 2);

    expect(distractors).toHaveLength(2);
    expect(distractors).not.toContain('1-2');
  });

  it('filters fraction pools by difficulty level', () => {
    expect(fractionsForMode('find', 'easy').map((fraction) => fraction.id)).toEqual([
      '1-2',
      '1-4',
      '3-4',
    ]);
    expect(fractionsForMode('find', 'medium').map((fraction) => fraction.id)).toEqual([
      '1-2',
      '1-4',
      '3-4',
      '1-3',
      '2-3',
    ]);
    expect(fractionsForMode('pour', 'hard').map((fraction) => fraction.id)).toContain('5-6');
    expect(fractionsForMode('pour', 'hard').map((fraction) => fraction.id)).not.toContain('1-8');
    expect(fractionsForMode('line', 'easy').map((fraction) => fraction.id)).toEqual([
      '1-2',
      '1-4',
      '3-4',
    ]);
    expect(fractionsForMode('line', 'medium').map((fraction) => fraction.id)).toEqual([
      '1-2',
      '1-4',
      '3-4',
      '1-3',
      '2-3',
      '1-6',
      '5-6',
      '1-8',
      '3-8',
      '5-8',
      '7-8',
    ]);
    expect(fractionsForMode('line', 'hard').map((fraction) => fraction.id)).toEqual([
      '1-2',
      '1-4',
      '3-4',
      '1-3',
      '2-3',
      '1-6',
      '5-6',
      '1-8',
      '3-8',
      '5-8',
      '7-8',
      '5-4',
      '3-2',
      '7-4',
    ]);
  });
});
