import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius, shadows } from '../../../../theme';

type HealthSearchBarProps = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  large?: boolean;
};

export function HealthSearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  style,
  large = false,
}: HealthSearchBarProps) {
  return (
    <View style={[styles.wrap, large && styles.wrapLarge, style]}>
      <Icon name="magnify" size={20} color={colors.brandPrimary} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral500}
        style={styles.input}
        returnKeyType="search"
        autoCorrect={false}
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.1)',
    paddingHorizontal: spacing.md,
    height: 48,
    ...shadows.cardSoft,
  },
  wrapLarge: {
    height: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.xl,
    ...shadows.cardElevated,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.inkHeadline,
    paddingVertical: 0,
  },
});
