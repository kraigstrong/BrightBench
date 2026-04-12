import React, { type ComponentProps } from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { ChallengeResultsCard } from '@/components/challenge-results-card';

type ChallengeResultsOverlayProps = ComponentProps<typeof ChallengeResultsCard>;

export function ChallengeResultsOverlay(props: ChallengeResultsOverlayProps) {
  return (
    <Modal
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      transparent
      visible>
      <View pointerEvents="box-none" style={styles.resultsOverlay}>
        <View style={styles.resultsCardWrap}>
          <ChallengeResultsCard {...props} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  resultsOverlay: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 20,
  },
  resultsCardWrap: {
    maxWidth: 440,
    width: '100%',
  },
});
