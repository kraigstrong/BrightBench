import { useEffect, useRef, useState } from 'react';

/** Eases toward `target`; jumps straight there when motion is reduced. */
export function useTween(target: number, durationMs: number, instant: boolean) {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);

  useEffect(() => {
    const from = valueRef.current;

    if (instant || from === target) {
      valueRef.current = target;
      setValue(target);
      return;
    }

    const startedAt = Date.now();
    let frame: ReturnType<typeof requestAnimationFrame> | null = null;

    const step = () => {
      const progress = Math.min(1, (Date.now() - startedAt) / durationMs);
      const eased = 1 - (1 - progress) * (1 - progress);
      const next = from + (target - from) * eased;
      valueRef.current = next;
      setValue(next);

      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);

    return () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [durationMs, instant, target]);

  return value;
}

/** Runs 0 → 1 each time `trigger` changes (for example, cuts sliding in); 1 straight away when motion is reduced. */
export function usePlayOnChange(trigger: unknown, durationMs: number, instant: boolean) {
  const [progress, setProgress] = useState(1);

  useEffect(() => {
    if (instant) {
      setProgress(1);
      return;
    }

    const startedAt = Date.now();
    let frame: ReturnType<typeof requestAnimationFrame> | null = null;

    const step = () => {
      const elapsed = Math.min(1, (Date.now() - startedAt) / durationMs);
      setProgress(1 - (1 - elapsed) * (1 - elapsed));

      if (elapsed < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    setProgress(0);
    frame = requestAnimationFrame(step);

    return () => {
      if (frame !== null) {
        cancelAnimationFrame(frame);
      }
    };
  }, [durationMs, instant, trigger]);

  return progress;
}
