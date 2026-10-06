import { router } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { goBackOrReplace } from '@education/app-config';
import { palette, spacing } from '@education/design';
import { typography } from '@education/design/native';
import {
  ActionButton,
  AppShell,
  HeaderBackButton,
  HeaderBar,
  HeaderIconButton,
  SettingsCogIcon,
} from '@education/ui';
import { CHALLENGE_DIFFICULTIES, CHALLENGE_DIFFICULTY_LABELS } from '@/features/game/challenge-stars';
import { DifficultyLevel } from '@/features/game/types';
import { PourAndPeek } from '@/features/pour-lab/pour-and-peek';
import { PourLabConcept } from '@/features/pour-lab/pour-engine';
import { SplitTheGlass } from '@/features/pour-lab/split-the-glass';
import { useReduceMotion } from '@/features/pour-lab/use-lab-motion';

const CONCEPT_LABELS: Record<PourLabConcept, string> = {
  peek: 'A · Pour & Peek',
  split: 'B · Split the Glass',
};

// Narrower than the app default so the play card stays close to the glass on tablets.
const LAB_MAX_WIDTH = 560;

export function PourLabScene({ initialConcept }: { initialConcept: PourLabConcept }) {
  const [concept, setConcept] = useState(initialConcept);
  const [difficultyLevel, setDifficultyLevel] = useState<DifficultyLevel>('medium');
  const reduceMotion = useReduceMotion();

  return (
    <AppShell maxWidth={LAB_MAX_WIDTH}>
      <HeaderBar
        title="Pour Lab"
        subtitle="Prototype · progress is not saved"
        leftAction={<HeaderBackButton onPress={() => goBackOrReplace(router, '/mode/pour')} />}
        rightAction={
          <HeaderIconButton
            accessibilityLabel="Open settings"
            accessibilityRole="button"
            onPress={() => router.push('/settings')}>
            <SettingsCogIcon size={24} />
          </HeaderIconButton>
        }
      />

      <View style={styles.controls}>
        <View accessibilityRole="tablist" style={styles.row}>
          {(Object.keys(CONCEPT_LABELS) as PourLabConcept[]).map((key) => (
            <ActionButton
              accessibilityRole="tab"
              compact
              key={key}
              label={CONCEPT_LABELS[key]}
              onPress={() => setConcept(key)}
              selected={concept === key}
              style={styles.flex}
            />
          ))}
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Level</Text>
          {CHALLENGE_DIFFICULTIES.map((difficulty) => (
            <ActionButton
              compact
              key={difficulty}
              label={CHALLENGE_DIFFICULTY_LABELS[difficulty]}
              onPress={() => setDifficultyLevel(difficulty)}
              selected={difficultyLevel === difficulty}
              style={styles.flex}
            />
          ))}
        </View>
      </View>

      {concept === 'peek' ? (
        <PourAndPeek key="peek" difficultyLevel={difficultyLevel} reduceMotion={reduceMotion} />
      ) : (
        <SplitTheGlass key="split" difficultyLevel={difficultyLevel} reduceMotion={reduceMotion} />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  controls: {
    gap: spacing.sm,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
  },
  rowLabel: {
    color: palette.inkMuted,
    fontFamily: typography.bodyFamily,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginRight: spacing.xs,
    textTransform: 'uppercase',
  },
  flex: {
    flex: 1,
  },
});
