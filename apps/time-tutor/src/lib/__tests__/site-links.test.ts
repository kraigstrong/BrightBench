import { getTimeTutorAppStoreUrl, getTimeTutorWriteReviewUrl } from '@/lib/site-links';

describe('getTimeTutorWriteReviewUrl', () => {
  const originalAppStoreUrl = process.env.EXPO_PUBLIC_TIME_TUTOR_APP_STORE_URL;

  afterEach(() => {
    if (originalAppStoreUrl === undefined) {
      delete process.env.EXPO_PUBLIC_TIME_TUTOR_APP_STORE_URL;
    } else {
      process.env.EXPO_PUBLIC_TIME_TUTOR_APP_STORE_URL = originalAppStoreUrl;
    }
  });

  it('opens the default App Store listing at its write-review sheet', () => {
    delete process.env.EXPO_PUBLIC_TIME_TUTOR_APP_STORE_URL;

    expect(getTimeTutorWriteReviewUrl()).toBe(
      `${getTimeTutorAppStoreUrl()}?action=write-review`,
    );
    expect(getTimeTutorWriteReviewUrl()).toBe(
      'https://apps.apple.com/app/time-tutor-clock-practice/id6761587276?action=write-review',
    );
  });

  it('keeps an override URL’s existing query string', () => {
    process.env.EXPO_PUBLIC_TIME_TUTOR_APP_STORE_URL =
      'https://apps.apple.com/us/app/time-tutor/id123?mt=8&action=view';

    const url = new URL(getTimeTutorWriteReviewUrl());

    expect(url.origin + url.pathname).toBe('https://apps.apple.com/us/app/time-tutor/id123');
    expect(url.searchParams.get('mt')).toBe('8');
    expect(url.searchParams.getAll('action')).toEqual(['write-review']);
  });
});
