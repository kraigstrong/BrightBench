import { useCallback, useEffect, useRef, useState } from 'react';

export type ChallengeCountdownValue = 3 | 2 | 1 | 'go';

const CHALLENGE_COUNTDOWN_STEP_DELAY_MS = 1000;
const CHALLENGE_COUNTDOWN_GO_DELAY_MS = 1000;
const CHALLENGE_COUNTDOWN_VALUES: readonly ChallengeCountdownValue[] = [3, 2, 1, 'go'];

type UseChallengeCountdownOptions = {
  onComplete: () => void;
};

export function useChallengeCountdown({ onComplete }: UseChallengeCountdownOptions) {
  const [countdownValue, setCountdownValue] = useState<ChallengeCountdownValue | null>(3);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const clearCountdown = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startCountdown = useCallback(() => {
    clearCountdown();

    let countdownIndex = 0;

    const advanceCountdown = () => {
      const nextValue = CHALLENGE_COUNTDOWN_VALUES[countdownIndex];

      if (nextValue === undefined) {
        setCountdownValue(null);
        onCompleteRef.current();
        timeoutRef.current = null;
        return;
      }

      setCountdownValue(nextValue);
      countdownIndex += 1;

      const delay =
        nextValue === 'go'
          ? CHALLENGE_COUNTDOWN_GO_DELAY_MS
          : CHALLENGE_COUNTDOWN_STEP_DELAY_MS;

      timeoutRef.current = setTimeout(advanceCountdown, delay);
    };

    advanceCountdown();
  }, [clearCountdown]);

  useEffect(() => () => clearCountdown(), [clearCountdown]);

  return {
    clearCountdown,
    countdownValue,
    startCountdown,
  };
}
