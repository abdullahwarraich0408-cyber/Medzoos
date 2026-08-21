import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing } from '../../../theme';

export function PasswordRequirements({ password }: { password: string }) {
  const longEnough = String(password || '').length >= 8;

  return (
    <View style={styles.wrap}>
      <Text style={styles.caption}>Your password should include:</Text>
      <View style={styles.row}>
        <Icon
          name={longEnough ? 'check' : 'circle-outline'}
          size={14}
          color={longEnough ? '#15803D' : colors.neutral500}
        />
        <Text style={[styles.item, longEnough && styles.itemMet]}>
          At least 8 characters
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: -12,
    marginBottom: 20,
  },
  caption: {
    fontSize: 12,
    color: colors.neutral600,
    marginBottom: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  item: {
    fontSize: 13,
    color: colors.neutral600,
  },
  itemMet: {
    color: '#15803D',
  },
});
