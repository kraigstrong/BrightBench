import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useAppState } from '@/state/app-state';

/** True when either the in-app Reduced motion setting or the OS preference asks for less motion. */
export function useReduceMotion() {
  const { settings } = useAppState();
  const [systemReduceMotion, setSystemReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        // Starts false, so only an enabled preference needs a re-render.
        if (mounted && enabled) {
          setSystemReduceMotion(true);
        }
      })
      .catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystemReduceMotion);

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return settings.reducedMotion || systemReduceMotion;
}
