import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, cardStyles } from '../../../../theme';
import { healthOsTypography } from '../../../../theme/healthOs';

type RecordFolderSectionProps = {
  title: string;
  icon: string;
  onSeeAll?: () => void;
  children: React.ReactNode;
};

export function RecordFolderSection({
  title,
  icon,
  onSeeAll,
  children,
}: RecordFolderSectionProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Icon name={icon} size={16} color={colors.brandPrimary} />
          </View>
          <Text style={styles.headerTitle}>{title}</Text>
        </View>
        {onSeeAll ? (
          <Pressable
            style={({ pressed }) => [styles.seeAll, pressed && styles.seeAllPressed]}
            onPress={onSeeAll}>
            <Text style={styles.seeAllText}>See all</Text>
          </Pressable>
        ) : null}
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

export function RecordListDivider() {
  return <View style={cardStyles.rowDivider} />;
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(17, 61, 99, 0.12)',
  },
  headerTitle: {
    ...healthOsTypography.sectionTitle,
    fontSize: 16,
  },
  seeAll: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  seeAllPressed: { opacity: 0.7 },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  card: {
    ...cardStyles.grouped,
  },
});
