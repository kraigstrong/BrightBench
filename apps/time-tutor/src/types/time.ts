export const MINUTE_STEPS = [
  0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55,
] as const;
export const FIFTEEN_MINUTE_STEPS = [0, 15, 30, 45] as const;
export const HOUR_ONLY_MINUTE_STEPS = [0] as const;

export const HOURS_12 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

export const MERIDIEMS = ['AM', 'PM'] as const;

export type MinuteValue = number;
export type Hour12 = (typeof HOURS_12)[number];
export type Meridiem = (typeof MERIDIEMS)[number];
export type ExerciseMode = 'digital-to-analog' | 'analog-to-digital';
export type PlayableMode = ExerciseMode | 'elapsed-time';
export type HomeMode = ExerciseMode | 'explore-time' | 'elapsed-time';
export type SessionType = 'practice' | 'challenge';
export type PracticeInterval =
  | '1-minute'
  | '5-minute'
  | '15-minute'
  | 'hours-only';
export type TimeFormat = '12-hour' | '24-hour';

export type TimeValue = {
  hour12: Hour12;
  minute: MinuteValue;
  meridiem: Meridiem;
};

export type DigitalTimeValue = {
  hour: number;
  minute: MinuteValue;
};

export type ElapsedDurationValue = {
  hours: number;
  minutes: MinuteValue;
};

export type SubmissionResult<TExpected = TimeValue, TActual = TimeValue> = {
  actual: TActual;
  expected: TExpected;
  isCorrect: boolean;
};
