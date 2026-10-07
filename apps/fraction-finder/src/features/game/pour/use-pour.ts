import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { advancePour, PourDirection, settlePour } from '@/features/game/pour/pour-engine';

type ActivePress = {
  direction: PourDirection;
  startValue: number;
  lastTime: number;
};

/**
 * Hold-to-pour engine behind the Pour panel. `value` is the amount in the
 * glass being filled (0..1). Holding moves it steadily; releasing stops immediately;
 * a short tap moves exactly one splash.
 */
export function usePour(initialValue: number) {
  const [value, setValue] = useState(initialValue);
  const [activeDirection, setActiveDirection] = useState<PourDirection | null>(null);
  const valueRef = useRef(initialValue);
  const pressRef = useRef<ActivePress | null>(null);
  const frameRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  const commit = useCallback((next: number) => {
    valueRef.current = next;
    setValue(next);
  }, []);

  const cancelFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const press = pressRef.current;
    if (!press) {
      return;
    }

    const now = Date.now();
    commit(advancePour(valueRef.current, press.direction, now - press.lastTime));
    press.lastTime = now;
    frameRef.current = requestAnimationFrame(tick);
  }, [commit]);

  const finishPress = useCallback(
    (press: ActivePress) => {
      pressRef.current = null;
      cancelFrame();
      const poured = advancePour(valueRef.current, press.direction, Date.now() - press.lastTime);
      commit(settlePour(press.startValue, poured, press.direction));
    },
    [cancelFrame, commit]
  );

  const start = useCallback(
    (direction: PourDirection) => {
      // React Native holds onPressOut until a minimum press duration and drops it when the
      // next press lands first, so fast taps arrive as press-in, press-in. Settle the
      // earlier tap so every tap still counts as one splash.
      if (pressRef.current) {
        finishPress(pressRef.current);
      }

      pressRef.current = { direction, startValue: valueRef.current, lastTime: Date.now() };
      setActiveDirection(direction);
      frameRef.current = requestAnimationFrame(tick);
    },
    [finishPress, tick]
  );

  const stop = useCallback(
    (direction?: PourDirection) => {
      const press = pressRef.current;
      if (!press || (direction !== undefined && press.direction !== direction)) {
        return;
      }

      finishPress(press);
      setActiveDirection(null);
    },
    [finishPress]
  );

  const reset = useCallback(
    (next: number) => {
      pressRef.current = null;
      cancelFrame();
      setActiveDirection(null);
      commit(next);
    },
    [cancelFrame, commit]
  );

  useEffect(() => {
    // If the app is backgrounded mid-pour, the release event may never arrive.
    const subscription = AppState.addEventListener('change', (status) => {
      if (status !== 'active') {
        stop();
      }
    });

    return () => {
      subscription.remove();
      pressRef.current = null;
      cancelFrame();
    };
  }, [cancelFrame, stop]);

  return { value, activeDirection, start, stop, reset };
}
