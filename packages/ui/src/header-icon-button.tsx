import React from 'react';
import { Pressable, StyleSheet, View, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';

import { palette, radii } from '@education/design';
import { shadows } from '@education/design/native';

type HeaderIconButtonProps = Omit<PressableProps, 'style'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function HeaderIconButton({
  children,
  style,
  ...rest
}: HeaderIconButtonProps) {
  return (
    <Pressable {...rest} style={[styles.button, style]}>
      <View style={styles.iconWrap}>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: palette.surface,
    borderRadius: radii.pill,
    height: 44,
    justifyContent: 'center',
    width: 44,
    ...shadows.card,
  },
  iconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
