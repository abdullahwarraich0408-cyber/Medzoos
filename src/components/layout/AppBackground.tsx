import React, { ReactNode } from 'react';
import { View, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { colors } from '../../theme/colors';

type AppBackgroundProps = {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** Soft healthcare screen wash — matches Home (#FFFFFF) */
export function AppBackground({ children, style }: AppBackgroundProps) {
  return <View style={[styles.root, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
