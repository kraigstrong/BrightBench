import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

import { useAppState } from '@/state/app-state';

// The OS answer arrives asynchronously, so each screen would otherwise start with
// "motion on" and could begin an animation (such as a route transition) before it
// learns otherwise. The app reads it once at launch and screens start from that.
let systemReduceMotion = false;
let primed = false;

/** Reads the OS reduce-motion preference once and keeps it current. Call early, on the client. */
export function primeSystemReduceMotion() {
  if (primed) {
    return;
  }

  primed = true;
  AccessibilityInfo.isReduceMotionEnabled()
    .then((enabled) => {
      systemReduceMotion = enabled;
    })
    .catch(() => undefined);
  AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
    systemReduceMotion = enabled;
  });
}

/** True when either the in-app Reduced motion setting or the OS preference asks for less motion. */
export function useReduceMotion() {
  const { settings } = useAppState();
  const [system, setSystem] = useState(() => systemReduceMotion);

  useEffect(() => {
    let mounted = true;
    const startedWith = systemReduceMotion;

    // Confirms the cached answer; only a different answer needs a re-render.
    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        systemReduceMotion = enabled;
        if (mounted && enabled !== startedWith) {
          setSystem(enabled);
        }
      })
      .catch(() => undefined);

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setSystem);

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, []);

  return settings.reducedMotion || system;
}
