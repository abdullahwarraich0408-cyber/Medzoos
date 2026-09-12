import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ACCOUNT_SETTINGS } from '../data/accountData';
import { spacing } from '../../../theme';
import { youBrand } from '../youBrand';

type AccountSettingsGroupProps = {
  onPressItem: (item: (typeof ACCOUNT_SETTINGS)[number]) => void;
};

export function AccountSettingsGroup({ onPressItem }: AccountSettingsGroupProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Account</Text>
      </View>
      <View style={styles.card}>
        {ACCOUNT_SETTINGS.map((item, index) => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.row,
              index < ACCOUNT_SETTINGS.length - 1 && styles.rowBorder,
              pressed && styles.rowPressed,
            ]}
            onPress={() => onPressItem(item)}>
            <View style={styles.iconWrap}>
              <Icon name={item.icon} size={18} color={youBrand.accent} />
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{item.title}</Text>
              {item.subtitle ? (
                <Text style={styles.subtitle} numberOfLines={1}>
                  {item.subtitle}
                </Text>
              ) : null}
            </View>
            <View style={styles.chevron}>
              <Icon name="chevron-right" size={18} color={youBrand.accent} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: { gap: spacing.sm },
  header: { gap: 2 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: youBrand.ink,
    letterSpacing: -0.2,
  },
  card: {
    backgroundColor: youBrand.card,
    borderRadius: 22,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: youBrand.ink,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 14,
      },
      android: { elevation: 2 },
    }),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: 14,
  },
  rowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: youBrand.border,
  },
  rowPressed: { backgroundColor: youBrand.soft },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: youBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: { flex: 1, gap: 2, minWidth: 0 },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: youBrand.ink,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '500',
    color: youBrand.muted,
  },
  chevron: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: youBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
