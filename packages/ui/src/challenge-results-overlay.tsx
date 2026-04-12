import React from 'react';
import { Modal, StyleSheet, View } from 'react-native';

import { ChallengeResultsCard, type ChallengeResultsCardProps } from './challenge-results-card';

export function ChallengeResultsOverlay(props: ChallengeResultsCardProps) {
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
