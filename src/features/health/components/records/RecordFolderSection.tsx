import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors, spacing } from '../../../../theme';

type RecordFolderSectionProps = {
  title: string;
  icon: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
};

export function RecordFolderSection({
  title,
  onSeeAll,
  children,
}: RecordFolderSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll} hitSlop={8}>
            <Text style={styles.seeAllText}>See all</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.list}>{children}</View>
    </View>
  );
}

export function RecordListDivider() {
  return null;
}

const styles = StyleSheet.create({
  section: { gap: spacing.md },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary700,
  },
  list: { gap: spacing.sm },
});
