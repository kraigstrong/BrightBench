import React from 'react';
import { StyleSheet, View, type StyleProp, type ViewProps, type ViewStyle } from 'react-native';

import { palette, radii, spacing } from '@education/design';
import { shadows } from '@education/design/native';

type CardProps = ViewProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Card({ children, style, ...rest }: CardProps) {
  return (
    <View {...rest} style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: palette.surface,
    borderColor: palette.ring,
    borderRadius: radii.xl,
    borderWidth: 1.5,
    padding: spacing.lg,
    ...shadows.card,
  },
});
