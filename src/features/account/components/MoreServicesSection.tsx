import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ACCOUNT_MORE_SERVICES } from '../data/accountData';
import { colors, spacing, radius, cardStyles, pastelTileStyle, iconTileStyle, arrowChipStyle, appIcons } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type MoreServicesSectionProps = {
  onPressService: (item: (typeof ACCOUNT_MORE_SERVICES)[number]) => void;
};

const SERVICE_BG: Record<string, string> = {
  'lab-tests': '#F5F3FF',
  consult: '#E8F4FF',
};

export function MoreServicesSection({ onPressService }: MoreServicesSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>More services</Text>
      <View style={styles.grid}>
        {ACCOUNT_MORE_SERVICES.map(item => (
          <Pressable
            key={item.id}
            style={({ pressed }) => [
              styles.card,
              pastelTileStyle(SERVICE_BG[item.id] ?? colors.white),
              pressed && cardStyles.pressed,
            ]}
            onPress={() => onPressService(item)}>
            <View style={styles.topRow}>
              <View style={iconTileStyle()}>
                <Icon name={item.icon} size={appIcons.size.lg} color={appIcons.color} />
              </View>
              <View style={arrowChipStyle()}>
                <Icon name="arrow-top-right" size={14} color={appIcons.color} />
              </View>
            </View>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {item.subtitle}
            </Text>
          </Pressable>
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
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    flex: 1,
    padding: spacing.md,
    minHeight: 118,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 13,
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.neutral500,
    lineHeight: 15,
  },
});
