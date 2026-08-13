import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ACCOUNT_SETTINGS } from '../data/accountData';
import { colors, spacing, cardStyles } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type AccountSettingsGroupProps = {
  onPressItem: (item: (typeof ACCOUNT_SETTINGS)[number]) => void;
};

export function AccountSettingsGroup({ onPressItem }: AccountSettingsGroupProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Account</Text>
      <View style={styles.card}>
        {ACCOUNT_SETTINGS.map((item, index) => (
          <React.Fragment key={item.id}>
            {index > 0 ? <View style={cardStyles.rowDivider} /> : null}
            <Pressable
              style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
              onPress={() => onPressItem(item)}>
              <Text style={styles.title}>{item.title}</Text>
              <View style={cardStyles.chevronWrap}>
                <Icon name="chevron-right" size={18} color={colors.neutral500} />
              </View>
            </Pressable>
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  sectionTitle: {
    ...healthOsTypography.sectionTitle,
  },
  card: {
    ...cardStyles.grouped,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowPressed: { backgroundColor: colors.brandMist },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 15,
    flex: 1,
  },
});
