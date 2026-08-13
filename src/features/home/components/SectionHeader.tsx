import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, typography, spacing } from '../../../theme';

type SectionHeaderProps = {
  title: string;
  onViewAll?: () => void;
  linkLabel?: string;
};

export function SectionHeader({
  title,
  onViewAll,
  linkLabel = 'View All',
}: SectionHeaderProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.title}>{title}</Text>
      {onViewAll && (
        <TouchableOpacity style={styles.link} onPress={onViewAll} activeOpacity={0.7}>
          <Text style={styles.linkText}>{linkLabel}</Text>
          <Icon name="arrow-right" size={14} color={colors.brandPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.title,
    fontSize: 18,
    color: colors.inkHeadline,
    flex: 1,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  linkText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
});
