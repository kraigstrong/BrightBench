import { getFeatureAvailability } from '@/lib/feature-availability';

describe('feature availability', () => {
  it('disables challenge mode on web', () => {
    expect(getFeatureAvailability('challenge-mode', 'web')).toEqual({
      enabled: false,
      label: 'Challenge',
      reason: 'Available on the App Store',
    });
  });

  it('keeps challenge mode enabled on mobile platforms', () => {
    expect(getFeatureAvailability('challenge-mode', 'ios')).toEqual({
      enabled: true,
      label: 'Challenge',
    });
  });
});
