import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

/**
 * False for the first web render, true afterwards (and always true on native).
 *
 * The static web export pre-renders each screen once at build time, without the URL's
 * query string and with random rounds that the browser will not reproduce. Content that
 * depends on either must wait for this, or React reports a hydration mismatch.
 */
export function useHasMounted() {
  const [hasMounted, setHasMounted] = useState(Platform.OS !== 'web');

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
}
