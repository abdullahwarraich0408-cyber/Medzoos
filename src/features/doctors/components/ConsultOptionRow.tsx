import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { doctorsBrand } from '../doctorsBrand';
import { spacing, radius } from '../../../theme';
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
  const icon = isOnline ? 'video-outline' : 'hospital-building';

  return (
    <TouchableOpacity
      style={[styles.row, compact && styles.rowCompact]}
      onPress={() => onPress?.(option)}
      activeOpacity={0.85}
      disabled={!onPress}>
      <View style={[styles.iconWrap, isOnline && styles.iconWrapOnline]}>
        <Icon name={icon} size={compact ? 18 : 20} color={doctorsBrand.accent} />
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {option.title}
        </Text>
        {option.location ? (
          <View style={styles.locationRow}>
            <Icon name="map-marker" size={11} color={doctorsBrand.muted} />
            <Text style={styles.subtitle} numberOfLines={1}>
              {option.location}
            </Text>
          </View>
        ) : option.subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {option.subtitle}
          </Text>
        ) : null}
        <View style={styles.availRow}>
          <View style={styles.availPill}>
            <View style={styles.availDot} />
            <Text style={styles.availability}>{option.availability}</Text>
          </View>
        </View>
      </View>
      <View style={styles.priceCol}>
        <Text style={styles.fee}>PKR {option.fee.toLocaleString()}</Text>
        {onPress ? (
          <View style={styles.chevronWrap}>
            <Icon name="chevron-right" size={16} color={doctorsBrand.accent} />
          </View>
        ) : null}
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
    borderRadius: 16,
    borderWidth: 1,
    borderColor: doctorsBrand.border,
    backgroundColor: doctorsBrand.page,
    ...Platform.select({
      ios: {
        shadowColor: doctorsBrand.ink,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },
  rowCompact: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: spacing.sm,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 11,
    backgroundColor: doctorsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapOnline: {
    backgroundColor: doctorsBrand.glaze,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: doctorsBrand.ink,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  subtitle: {
    fontSize: 11,
    color: doctorsBrand.muted,
    flex: 1,
    marginTop: 2,
  },
  availRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  availPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: doctorsBrand.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  availDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: doctorsBrand.success,
  },
  availability: {
    fontSize: 10,
    fontWeight: '700',
    color: doctorsBrand.success,
  },
  priceCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  fee: {
    fontSize: 13,
    fontWeight: '800',
    color: doctorsBrand.accent,
  },
  chevronWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: doctorsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
