import React from 'react';
import { Pressable, View, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { appBrand } from '../../theme/appBrand';

type StackBackButtonProps = {
  onPress: () => void;
  accessibilityLabel?: string;
};

/**
 * Circular chevron back — shared across all stack screens (not Home).
 */
export function StackBackButton({
  onPress,
  accessibilityLabel = 'Go back',
}: StackBackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}
      style={({ pressed }) => [styles.hit, pressed && styles.pressed]}>
      <View style={styles.inner}>
        <Icon
          name="chevron-left"
          size={26}
          color={appBrand.main}
          style={styles.icon}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.78,
  },
  inner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: appBrand.card,
    borderWidth: 1.5,
    borderColor: appBrand.border,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: appBrand.ink,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  icon: {
    marginLeft: -1,
  },
});
