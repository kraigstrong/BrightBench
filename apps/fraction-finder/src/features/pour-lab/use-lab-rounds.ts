import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';

import { DifficultyLevel, RoundEvaluation } from '@/features/game/types';
import {
  checkPour,
  LabMessage,
  LabRound,
  missMessage,
  nextLabRound,
  PourLabConcept,
  successMessage,
} from '@/features/pour-lab/pour-engine';

export type LabPhase = 'playing' | 'missed' | 'solved';

type LabRoundState = {
  round: LabRound | null;
  phase: LabPhase;
  partsRevealed: boolean;
  lastCheckedValue: number | null;
  evaluation: RoundEvaluation | null;
  message: LabMessage | null;
};

const EMPTY_STATE: LabRoundState = {
  round: null,
  phase: 'playing',
  partsRevealed: false,
  lastCheckedValue: null,
  evaluation: null,
  message: null,
};

/**
 * Round flow for the Pour Lab prototype. It reuses the real Pour round generator and
 * evaluator, but deliberately never touches saved progress: no recordRound, no stars.
 */
export function useLabRounds(concept: PourLabConcept, difficultyLevel: DifficultyLevel) {
  const [state, setState] = useState<LabRoundState>(EMPTY_STATE);

  useEffect(() => {
    // Rounds are random, so create the first one after mount to keep the static web
    // render and the hydrated client render identical.
    setState({ ...EMPTY_STATE, round: nextLabRound(difficultyLevel) });
  }, [difficultyLevel]);

  const check = useCallback(
    (value: number) => {
      setState((current) => {
        if (!current.round || current.phase === 'solved') {
          return current;
        }

        const evaluation = checkPour(current.round, value);
        const targetId = current.round.pourRound.targetFractionId;

        return {
          ...current,
          phase: evaluation.isCorrect ? 'solved' : 'missed',
          partsRevealed: true,
          lastCheckedValue: value,
          evaluation,
          message: evaluation.isCorrect
            ? successMessage(concept, targetId)
            : missMessage(concept, targetId, value, evaluation),
        };
      });
    },
    [concept]
  );

  useEffect(() => {
    // Same feedback the real modes get from recordRound, without recording anything.
    if (state.phase === 'solved') {
      playHaptic(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    } else if (state.phase === 'missed') {
      playHaptic(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    }
  }, [state.phase, state.lastCheckedValue]);

  const next = useCallback(() => {
    setState((current) => ({
      ...EMPTY_STATE,
      round: nextLabRound(difficultyLevel, current.round ?? undefined),
    }));
  }, [difficultyLevel]);

  return { ...state, check, next };
}

function playHaptic(fire: () => Promise<void> | undefined) {
  try {
    fire()?.catch(() => undefined);
  } catch {
    // Haptics are optional feedback; some platforms do not support them.
  }
}

export const ADJUST_MESSAGE: LabMessage = {
  title: 'Use the equal parts to fix it.',
  body: 'Then check again.',
  tone: 'adjust',
};
