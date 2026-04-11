import type { PracticeInterval } from '@/types/time';

export type PracticeIntervalOption = {
  description: string;
  label: string;
  value: PracticeInterval;
};

export const PRACTICE_INTERVAL_OPTIONS: PracticeIntervalOption[] = [
  {
    description: 'Only change the hour hand.',
    label: 'Hours only',
    value: 'hours-only',
  },
  {
    description: 'Round to 15 minutes.',
    label: '15 minutes',
    value: '15-minute',
  },
  {
    description: 'Round to 5 minutes.',
    label: '5 minutes',
    value: '5-minute',
  },
  {
    description: 'Every minute on the clock face.',
    label: '1 minute',
    value: '1-minute',
  },
];

export const DEFAULT_PRACTICE_INTERVAL: PracticeInterval = '5-minute';

export function isPracticeInterval(
  value: string | undefined,
): value is PracticeInterval {
  return PRACTICE_INTERVAL_OPTIONS.some((option) => option.value === value);
}
