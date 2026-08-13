import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import type { ConsultOption } from '../utils/consultOptions';

type ConsultOptionRowProps = {
  option: ConsultOption;
  onPress?: (option: ConsultOption) => void;
  compact?: boolean;
};

export function ConsultOptionRow({
  option,
  onPress,
  compact = false,
}: ConsultOptionRowProps) {
  const isOnline = option.type === 'online';
  const icon = isOnline ? 'video' : 'hospital-building';

  return (
    <TouchableOpacity
      style={[styles.row, compact && styles.rowCompact]}
      onPress={() => onPress?.(option)}
      activeOpacity={0.85}
      disabled={!onPress}>
      <View style={[styles.iconWrap, isOnline && styles.iconWrapOnline]}>
        <Icon name={icon} size={20} color={colors.brandPrimary} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {option.title}
        </Text>
        {option.location ? (
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={11} color={colors.neutral500} />
            <Text style={styles.subtitle} numberOfLines={1}>
              {option.location}
            </Text>
          </View>
        ) : option.subtitle ? (
          <Text style={styles.subtitle}>{option.subtitle}</Text>
        ) : null}
        <View style={styles.availRow}>
          <View style={styles.availDot} />
          <Text style={styles.availability}>{option.availability}</Text>
        </View>
      </View>
      <View style={styles.priceCol}>
        <Text style={styles.fee}>PKR {option.fee.toLocaleString()}</Text>
        {onPress && (
          <Icon name="chevron-right" size={16} color={colors.neutral500} />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    backgroundColor: colors.white,
  },
  rowCompact: {
    padding: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapOnline: {
    backgroundColor: colors.brandMist,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: colors.neutral500,
    flex: 1,
  },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm,
  },
  availDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.statusSuccess,
  },
  availability: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.statusSuccess,
  },
  priceCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  fee: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
});