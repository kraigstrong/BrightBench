import {
  currentTimeValueForInterval,
  formatTimeValue,
} from '@/lib/time';

describe('time helpers', () => {
  it('rounds the current time to the nearest interval', () => {
    expect(
      formatTimeValue(
        currentTimeValueForInterval('15-minute', new Date(2026, 3, 11, 0, 13)),
      ),
    ).toBe('12:15 AM');

    expect(
      formatTimeValue(
        currentTimeValueForInterval('5-minute', new Date(2026, 3, 11, 9, 2)),
      ),
    ).toBe('9:00 AM');

    expect(
      formatTimeValue(
        currentTimeValueForInterval('hours-only', new Date(2026, 3, 11, 23, 29)),
      ),
    ).toBe('11:00 PM');
  });
});
