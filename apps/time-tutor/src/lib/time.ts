import {
  type DigitalTimeValue,
  type ElapsedDurationValue,
  FIFTEEN_MINUTE_STEPS,
  HOUR_ONLY_MINUTE_STEPS,
  HOURS_12,
  MERIDIEMS,
  MINUTE_STEPS,
  type ExerciseMode,
  type Hour12,
  type HomeMode,
  type Meridiem,
  type MinuteValue,
  type PracticeInterval,
  type TimeFormat,
  type TimeValue,
} from '@/types/time';

export const FULL_CIRCLE_DEGREES = 360;

type TimeFormattingOptions = {
  includeMeridiem?: boolean;
  timeFormat?: TimeFormat;
};

type TimeComparisonOptions = {
  includeMeridiem?: boolean;
};

export function randomTimeValue(random = Math.random): TimeValue {
  return randomTimeValueForInterval('5-minute', random);
}

export function randomTimeValueForInterval(
  interval: PracticeInterval,
  random = Math.random,
): TimeValue {
  const hour12 = HOURS_12[Math.floor(random() * HOURS_12.length)] as Hour12;
  const minuteOptions = getMinuteOptions(interval);
  const minute = minuteOptions[
    Math.floor(random() * minuteOptions.length)
  ] as MinuteValue;
  const meridiem = MERIDIEMS[Math.floor(random() * MERIDIEMS.length)] as Meridiem;

  return {
    hour12,
    minute,
    meridiem,
  };
}

export function nextTimeValue(
  previous: TimeValue,
  random = Math.random,
): TimeValue {
  return nextTimeValueForInterval(previous, '5-minute', random);
}

export function nextTimeValueForInterval(
  previous: TimeValue,
  interval: PracticeInterval,
  random = Math.random,
): TimeValue {
  let candidate = randomTimeValueForInterval(interval, random);
  let attempts = 0;

  while (
    attempts < 24 &&
    areTimesEqual(candidate, previous, { includeMeridiem: false })
  ) {
    candidate = randomTimeValueForInterval(interval, random);
    attempts += 1;
  }

  if (!areTimesEqual(candidate, previous, { includeMeridiem: false })) {
    return candidate;
  }

  return {
    ...candidate,
    hour12: cycleHour(previous.hour12, 1),
    minute: previous.minute,
    meridiem: previous.meridiem,
  };
}

export function formatTimeValue(
  time: TimeValue,
  options: TimeFormattingOptions = {},
): string {
  const timeFormat = options.timeFormat ?? '12-hour';
  const includeMeridiem = options.includeMeridiem ?? true;

  if (timeFormat === '24-hour') {
    return `${String(to24Hour(time)).padStart(2, '0')}:${String(
      time.minute,
    ).padStart(2, '0')}`;
  }

  const base = `${time.hour12}:${String(time.minute).padStart(2, '0')}`;

  return includeMeridiem ? `${base} ${time.meridiem}` : base;
}

export function formatDigitalTimeValue(
  time: DigitalTimeValue,
  timeFormat: TimeFormat = '12-hour',
): string {
  const hourLabel =
    timeFormat === '24-hour'
      ? String(time.hour).padStart(2, '0')
      : String(time.hour);

  return `${hourLabel}:${String(time.minute).padStart(2, '0')}`;
}

export function formatElapsedDurationValue(
  duration: ElapsedDurationValue,
): string {
  return `${duration.hours}:${String(duration.minutes).padStart(2, '0')}`;
}

export function areTimesEqual(
  left: TimeValue,
  right: TimeValue,
  options: TimeComparisonOptions = {},
): boolean {
  const includeMeridiem = options.includeMeridiem ?? true;

  return (
    left.hour12 === right.hour12 &&
    left.minute === right.minute &&
    (!includeMeridiem || left.meridiem === right.meridiem)
  );
}

export function getClockHandAngles(time: TimeValue) {
  return {
    hourAngle: ((time.hour12 % 12) + time.minute / 60) * 30,
    minuteAngle: time.minute * 6,
  };
}

export function snapMinuteFromAngle(angle: number): MinuteValue {
  return snapMinuteFromAngleForInterval(angle, '5-minute');
}

export function snapMinuteFromAngleForInterval(
  angle: number,
  interval: PracticeInterval,
): MinuteValue {
  const minuteOptions = getMinuteOptions(interval);
  const stepSize = FULL_CIRCLE_DEGREES / minuteOptions.length;
  const stepIndex =
    Math.round(normalizeAngle(angle) / stepSize) % minuteOptions.length;

  return minuteOptions[stepIndex] as MinuteValue;
}

export function deriveHourFromAngle(angle: number): Hour12 {
  const normalized = normalizeAngle(angle);
  const hourIndex = Math.round(normalized / 30) % HOURS_12.length;

  return (hourIndex === 0 ? 12 : hourIndex) as Hour12;
}

export function angleFromTouch(
  touchX: number,
  touchY: number,
  size: number,
): number {
  const radius = size / 2;
  const deltaX = touchX - radius;
  const deltaY = touchY - radius;
  const radians = Math.atan2(deltaY, deltaX);
  const degrees = (radians * 180) / Math.PI;

  return normalizeAngle(degrees + 90);
}

export function getModeTitle(mode: ExerciseMode): string {
  return mode === 'digital-to-analog' ? 'Set the Clock' : 'Read the Clock';
}

export function getHomeModeTitle(mode: HomeMode): string {
  if (mode === 'explore-time') {
    return 'Explore Time';
  }

  if (mode === 'elapsed-time') {
    return 'Elapsed Time';
  }

  return getModeTitle(mode);
}

export function getModeDescription(mode: ExerciseMode): string {
  return mode === 'digital-to-analog'
    ? 'Drag the clock hands until the analog clock matches the digital time.'
    : 'Read the analog clock, then enter the matching digital time.';
}

export function createInitialAnswer(meridiem: Meridiem = 'AM'): TimeValue {
  return {
    hour12: 12,
    minute: 0,
    meridiem,
  };
}

export function createInitialDigitalAnswer(
  timeFormat: TimeFormat = '12-hour',
): DigitalTimeValue {
  return {
    hour: timeFormat === '24-hour' ? 0 : 12,
    minute: 0,
  };
}

export function createInitialElapsedDuration(): ElapsedDurationValue {
  return {
    hours: 0,
    minutes: 0,
  };
}

export function timeValueToDigitalValue(
  time: TimeValue,
  timeFormat: TimeFormat = '12-hour',
): DigitalTimeValue {
  return {
    hour: timeFormat === '24-hour' ? to24Hour(time) : time.hour12,
    minute: time.minute,
  };
}

export function digitalValueToTimeValue(
  value: DigitalTimeValue,
  timeFormat: TimeFormat = '12-hour',
  currentMeridiem: Meridiem = 'AM',
): TimeValue {
  if (timeFormat === '24-hour') {
    const meridiem: Meridiem = value.hour >= 12 ? 'PM' : 'AM';
    const normalizedHour = value.hour % 12;

    return {
      hour12: (normalizedHour === 0 ? 12 : normalizedHour) as Hour12,
      meridiem,
      minute: value.minute,
    };
  }

  return {
    hour12: value.hour as Hour12,
    meridiem: currentMeridiem,
    minute: value.minute,
  };
}

export function cycleHour(hour: Hour12, delta: number): Hour12 {
  const index = HOURS_12.indexOf(hour);
  const nextIndex = modulo(index + delta, HOURS_12.length);

  return HOURS_12[nextIndex] as Hour12;
}

export function cycleDigitalHour(
  hour: number,
  delta: number,
  timeFormat: TimeFormat = '12-hour',
): number {
  if (timeFormat === '24-hour') {
    return modulo(hour + delta, 24);
  }

  return cycleHour(hour as Hour12, delta);
}

export function cycleElapsedHours(hours: number, delta: number): number {
  return modulo(hours + delta, 13);
}

export function cycleMinute(minute: MinuteValue, delta: number): MinuteValue {
  return cycleMinuteForInterval(minute, delta, '5-minute');
}

export function cycleMinuteForInterval(
  minute: MinuteValue,
  delta: number,
  interval: PracticeInterval,
): MinuteValue {
  const minuteOptions = getMinuteOptions(interval);
  const currentIndex = getClosestMinuteOptionIndex(minute, minuteOptions);
  const nextIndex = modulo(currentIndex + delta, minuteOptions.length);

  return minuteOptions[nextIndex] as MinuteValue;
}

export function stepDigitalTimeValue(
  value: DigitalTimeValue,
  unit: 'hour' | 'minute',
  direction: 1 | -1,
  options: {
    practiceInterval: PracticeInterval;
    timeFormat: TimeFormat;
  },
): DigitalTimeValue {
  if (unit === 'hour') {
    return {
      ...value,
      hour: cycleDigitalHour(value.hour, direction, options.timeFormat),
    };
  }

  const minuteOptions = getMinuteOptions(options.practiceInterval);
  const currentIndex = getClosestMinuteOptionIndex(value.minute, minuteOptions);
  const nextIndex = modulo(currentIndex + direction, minuteOptions.length);
  const wrappedForward = direction > 0 && nextIndex <= currentIndex;
  const wrappedBackward = direction < 0 && nextIndex >= currentIndex;

  return {
    hour:
      wrappedForward || wrappedBackward
        ? cycleDigitalHour(value.hour, direction, options.timeFormat)
        : value.hour,
    minute: minuteOptions[nextIndex] as MinuteValue,
  };
}

export function toggleMeridiem(current: Meridiem): Meridiem {
  return current === 'AM' ? 'PM' : 'AM';
}

export function to24Hour(time: TimeValue): number {
  const normalizedHour = time.hour12 % 12;

  return time.meridiem === 'PM' ? normalizedHour + 12 : normalizedHour;
}

export function to24HourVariants(time: TimeValue): readonly DigitalTimeValue[] {
  const baseHour = time.hour12 % 12;
  const variants = [baseHour, baseHour + 12];

  return variants.map((hour) => ({
    hour,
    minute: time.minute,
  }));
}

export function isDigitalTimeValueEqual(
  left: DigitalTimeValue,
  right: DigitalTimeValue,
): boolean {
  return left.hour === right.hour && left.minute === right.minute;
}

export function isDigitalAnswerCorrect(
  actual: DigitalTimeValue,
  expected: TimeValue,
  timeFormat: TimeFormat = '12-hour',
): boolean {
  if (timeFormat === '24-hour') {
    return to24HourVariants(expected).some((candidate) =>
      isDigitalTimeValueEqual(actual, candidate),
    );
  }

  return actual.hour === expected.hour12 && actual.minute === expected.minute;
}

export function normalizeAnalogTimeFor24Hour(
  current: TimeValue,
  next: TimeValue,
): TimeValue {
  const currentDigital = timeValueToDigitalValue(current, '24-hour');
  const candidates = to24HourVariants(next);
  const bestMatch = candidates.reduce((closest, candidate) => {
    const closestDistance = getCircularMinuteDistance(currentDigital, closest);
    const candidateDistance = getCircularMinuteDistance(currentDigital, candidate);

    return candidateDistance < closestDistance ? candidate : closest;
  });

  return digitalValueToTimeValue(bestMatch, '24-hour', current.meridiem);
}

export function applyMinuteDrag(
  time: TimeValue,
  nextMinute: MinuteValue,
): TimeValue {
  const wrappedForward = time.minute >= 45 && nextMinute <= 15;
  const wrappedBackward = time.minute <= 15 && nextMinute >= 45;

  if (wrappedForward) {
    const nextHour = cycleHour(time.hour12, 1);

    return {
      hour12: nextHour,
      meridiem: time.hour12 === 11 ? toggleMeridiem(time.meridiem) : time.meridiem,
      minute: nextMinute,
    };
  }

  if (wrappedBackward) {
    const nextHour = cycleHour(time.hour12, -1);

    return {
      hour12: nextHour,
      meridiem: time.hour12 === 12 ? toggleMeridiem(time.meridiem) : time.meridiem,
      minute: nextMinute,
    };
  }

  return {
    ...time,
    minute: nextMinute,
  };
}

export function getMinuteOptions(interval: PracticeInterval): readonly number[] {
  switch (interval) {
    case '1-minute':
      return ONE_MINUTE_VALUES;
    case '15-minute':
      return FIFTEEN_MINUTE_STEPS;
    case 'hours-only':
      return HOUR_ONLY_MINUTE_STEPS;
    case '5-minute':
    default:
      return MINUTE_STEPS;
  }
}

export function getElapsedMinutes(start: TimeValue, end: TimeValue): number {
  return Math.max(0, toAbsoluteMinutes(end) - toAbsoluteMinutes(start));
}

export function elapsedMinutesToDuration(
  elapsedMinutes: number,
): ElapsedDurationValue {
  return {
    hours: Math.floor(elapsedMinutes / 60),
    minutes: elapsedMinutes % 60,
  };
}

export function durationToElapsedMinutes(
  duration: ElapsedDurationValue,
): number {
  return duration.hours * 60 + duration.minutes;
}

export function isElapsedDurationCorrect(
  actual: ElapsedDurationValue,
  start: TimeValue,
  end: TimeValue,
): boolean {
  return durationToElapsedMinutes(actual) === getElapsedMinutes(start, end);
}

export function randomElapsedTimePairForInterval(
  interval: PracticeInterval,
  random = Math.random,
): readonly [TimeValue, TimeValue] {
  const stepSize = getDurationStep(interval);
  const minimumDuration = stepSize;
  const maximumDuration = 6 * 60;
  let attempts = 0;

  while (attempts < 100) {
    const start = randomTimeValueForInterval(interval, random);
    const startMinutes = toAbsoluteMinutes(start);
    const maxDurationForStart = Math.min(
      maximumDuration,
      23 * 60 + 59 - startMinutes,
    );
    const validDurations = [];

    for (
      let duration = minimumDuration;
      duration <= maxDurationForStart;
      duration += stepSize
    ) {
      validDurations.push(duration);
    }

    if (validDurations.length > 0) {
      const duration =
        validDurations[Math.floor(random() * validDurations.length)];
      const end = absoluteMinutesToTimeValue(startMinutes + duration);

      return [start, end] as const;
    }

    attempts += 1;
  }

  const fallbackStart = {
    hour12: 8 as Hour12,
    meridiem: 'AM' as Meridiem,
    minute: 0,
  };

  return [
    fallbackStart,
    absoluteMinutesToTimeValue(
      toAbsoluteMinutes(fallbackStart) + minimumDuration,
    ),
  ] as const;
}

export function nextElapsedTimePairForInterval(
  previous: readonly [TimeValue, TimeValue],
  interval: PracticeInterval,
  random = Math.random,
): readonly [TimeValue, TimeValue] {
  let candidate = randomElapsedTimePairForInterval(interval, random);
  let attempts = 0;

  while (attempts < 40 && areTimePairsEqual(candidate, previous)) {
    candidate = randomElapsedTimePairForInterval(interval, random);
    attempts += 1;
  }

  if (!areTimePairsEqual(candidate, previous)) {
    return candidate;
  }

  const fallbackStart = nextTimeValueForInterval(previous[0], interval, random);
  const fallbackDurationMinutes = Math.max(
    getDurationStep(interval),
    getElapsedMinutes(previous[0], previous[1]),
  );

  return [
    fallbackStart,
    absoluteMinutesToTimeValue(
      toAbsoluteMinutes(fallbackStart) + fallbackDurationMinutes,
    ),
  ] as const;
}

function normalizeAngle(angle: number): number {
  return (
    ((angle % FULL_CIRCLE_DEGREES) + FULL_CIRCLE_DEGREES) %
    FULL_CIRCLE_DEGREES
  );
}

function areTimePairsEqual(
  left: readonly [TimeValue, TimeValue],
  right: readonly [TimeValue, TimeValue],
): boolean {
  return areTimesEqual(left[0], right[0]) && areTimesEqual(left[1], right[1]);
}

function toAbsoluteMinutes(time: TimeValue): number {
  return to24Hour(time) * 60 + time.minute;
}

function absoluteMinutesToTimeValue(totalMinutes: number): TimeValue {
  const normalizedTotalMinutes = modulo(totalMinutes, 24 * 60);
  const hour24 = Math.floor(normalizedTotalMinutes / 60);
  const minute = normalizedTotalMinutes % 60;
  const meridiem: Meridiem = hour24 >= 12 ? 'PM' : 'AM';
  const normalizedHour = hour24 % 12;

  return {
    hour12: (normalizedHour === 0 ? 12 : normalizedHour) as Hour12,
    meridiem,
    minute,
  };
}

function modulo(value: number, divisor: number): number {
  return ((value % divisor) + divisor) % divisor;
}

function getClosestMinuteOptionIndex(
  minute: MinuteValue,
  minuteOptions: readonly number[],
): number {
  const exactIndex = minuteOptions.indexOf(minute);

  if (exactIndex >= 0) {
    return exactIndex;
  }

  return minuteOptions.reduce((closestIndex, option, index) => {
    const closestDistance = Math.abs(minuteOptions[closestIndex] - minute);
    const optionDistance = Math.abs(option - minute);

    return optionDistance < closestDistance ? index : closestIndex;
  }, 0);
}

function getCircularMinuteDistance(
  left: DigitalTimeValue,
  right: DigitalTimeValue,
): number {
  const leftTotalMinutes = left.hour * 60 + left.minute;
  const rightTotalMinutes = right.hour * 60 + right.minute;
  const forwardDistance = modulo(rightTotalMinutes - leftTotalMinutes, 24 * 60);
  const backwardDistance = modulo(leftTotalMinutes - rightTotalMinutes, 24 * 60);

  return Math.min(forwardDistance, backwardDistance);
}

function getDurationStep(interval: PracticeInterval): number {
  switch (interval) {
    case 'hours-only':
      return 60;
    case '15-minute':
      return 15;
    case '5-minute':
      return 5;
    case '1-minute':
    default:
      return 1;
  }
}

const ONE_MINUTE_VALUES = Array.from({ length: 60 }, (_, minute) => minute);
