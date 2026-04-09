import { DifficultyLevel, FractionConcept, GameMode } from '@/features/game/types';

export const FRACTION_LIBRARY: FractionConcept[] = [
  {
    id: '1-2',
    numerator: 1,
    denominator: 2,
    label: '1/2',
    value: 0.5,
    benchmarkCategory: 'benchmark',
    eligibleModes: ['find', 'build', 'compare', 'estimate', 'pour', 'line'],
    representations: ['bar', 'container', 'meter', 'line'],
  },
  {
    id: '1-4',
    numerator: 1,
    denominator: 4,
    label: '1/4',
    value: 0.25,
    benchmarkCategory: 'benchmark',
    eligibleModes: ['find', 'build', 'compare', 'estimate', 'pour', 'line'],
    representations: ['bar', 'container', 'meter', 'line'],
  },
  {
    id: '3-4',
    numerator: 3,
    denominator: 4,
    label: '3/4',
    value: 0.75,
    benchmarkCategory: 'benchmark',
    eligibleModes: ['find', 'build', 'compare', 'estimate', 'pour', 'line'],
    representations: ['bar', 'container', 'meter', 'line'],
  },
  {
    id: '1-3',
    numerator: 1,
    denominator: 3,
    label: '1/3',
    value: 1 / 3,
    benchmarkCategory: 'common',
    eligibleModes: ['find', 'build', 'compare', 'estimate', 'pour', 'line'],
    representations: ['bar', 'container', 'meter', 'line'],
  },
  {
    id: '2-3',
    numerator: 2,
    denominator: 3,
    label: '2/3',
    value: 2 / 3,
    benchmarkCategory: 'common',
    eligibleModes: ['find', 'build', 'compare', 'estimate', 'pour', 'line'],
    representations: ['bar', 'container', 'meter', 'line'],
  },
  {
    id: '1-6',
    numerator: 1,
    denominator: 6,
    label: '1/6',
    value: 1 / 6,
    benchmarkCategory: 'stretch',
    eligibleModes: ['find', 'build', 'compare', 'estimate', 'pour', 'line'],
    representations: ['bar', 'container', 'meter', 'line'],
  },
  {
    id: '5-6',
    numerator: 5,
    denominator: 6,
    label: '5/6',
    value: 5 / 6,
    benchmarkCategory: 'stretch',
    eligibleModes: ['find', 'build', 'compare', 'estimate', 'pour', 'line'],
    representations: ['bar', 'container', 'meter', 'line'],
  },
  {
    id: '1-8',
    numerator: 1,
    denominator: 8,
    label: '1/8',
    value: 1 / 8,
    benchmarkCategory: 'stretch',
    eligibleModes: ['find', 'build', 'compare', 'estimate', 'line'],
    representations: ['bar', 'meter', 'line'],
  },
  {
    id: '3-8',
    numerator: 3,
    denominator: 8,
    label: '3/8',
    value: 3 / 8,
    benchmarkCategory: 'stretch',
    eligibleModes: ['find', 'build', 'compare', 'estimate', 'line'],
    representations: ['bar', 'meter', 'line'],
  },
  {
    id: '5-8',
    numerator: 5,
    denominator: 8,
    label: '5/8',
    value: 5 / 8,
    benchmarkCategory: 'stretch',
    eligibleModes: ['find', 'build', 'compare', 'estimate', 'line'],
    representations: ['bar', 'meter', 'line'],
  },
  {
    id: '7-8',
    numerator: 7,
    denominator: 8,
    label: '7/8',
    value: 7 / 8,
    benchmarkCategory: 'stretch',
    eligibleModes: ['find', 'build', 'compare', 'estimate', 'line'],
    representations: ['bar', 'meter', 'line'],
  },
  {
    id: '5-4',
    numerator: 5,
    denominator: 4,
    label: '5/4',
    value: 1.25,
    benchmarkCategory: 'stretch',
    eligibleModes: ['line'],
    representations: ['line'],
  },
  {
    id: '3-2',
    numerator: 3,
    denominator: 2,
    label: '3/2',
    value: 1.5,
    benchmarkCategory: 'stretch',
    eligibleModes: ['line'],
    representations: ['line'],
  },
  {
    id: '7-4',
    numerator: 7,
    denominator: 4,
    label: '7/4',
    value: 1.75,
    benchmarkCategory: 'stretch',
    eligibleModes: ['line'],
    representations: ['line'],
  },
];

export const FRACTION_BY_ID = Object.fromEntries(
  FRACTION_LIBRARY.map((fraction) => [fraction.id, fraction])
) as Record<string, FractionConcept>;

const FRACTION_IDS_BY_DIFFICULTY: Record<DifficultyLevel, string[]> = {
  easy: ['1-2', '1-4', '3-4'],
  medium: ['1-2', '1-4', '3-4', '1-3', '2-3'],
  hard: FRACTION_LIBRARY.map((fraction) => fraction.id),
};

const LINE_FRACTION_IDS_BY_DIFFICULTY: Record<DifficultyLevel, string[]> = {
  easy: ['1-2', '1-4', '3-4'],
  medium: ['1-2', '1-4', '3-4', '1-3', '2-3', '1-6', '5-6', '1-8', '3-8', '5-8', '7-8'],
  hard: ['1-2', '1-4', '3-4', '1-3', '2-3', '1-6', '5-6', '1-8', '3-8', '5-8', '7-8', '5-4', '3-2', '7-4'],
};

export function fractionsForMode(mode: GameMode, difficultyLevel: DifficultyLevel) {
  const allowedIds = new Set(
    mode === 'line'
      ? LINE_FRACTION_IDS_BY_DIFFICULTY[difficultyLevel]
      : FRACTION_IDS_BY_DIFFICULTY[difficultyLevel]
  );

  return FRACTION_LIBRARY.filter(
    (fraction) => fraction.eligibleModes.includes(mode) && allowedIds.has(fraction.id)
  );
}
