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
