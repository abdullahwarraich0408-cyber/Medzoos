import { colors, spacing, radius, shadows } from '../../../../theme';
import { healthOs } from '../../../../theme/healthOs';
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { HealthPackageDef } from '../../data/healthData';


type HealthPackageCardProps = {
  pkg: HealthPackageDef;
  onBook: () => void;
  onCompare?: () => void;
  selected?: boolean;
};

export function HealthPackageCard({
  pkg,
  onBook,
  onCompare,
  selected,
}: HealthPackageCardProps) {
  const savings = pkg.individualPrice - pkg.price;

  return (
    <View style={[styles.card, selected && styles.cardSelected]}>
      <View style={styles.header}>
        <Text style={styles.emoji}>{pkg.emoji}</Text>
        <View style={styles.headerText}>
          <Text style={styles.name}>{pkg.name}</Text>
          <Text style={styles.tagline}>{pkg.tagline}</Text>
        </View>
      </View>

      <View style={styles.benefits}>
        {pkg.benefits.slice(0, 3).map(benefit => (
          <View key={benefit} style={styles.benefitRow}>
            <Icon name="check-circle" size={14} color={colors.statusSuccess} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </View>

      <View style={styles.priceRow}>
        <View>
          <Text style={styles.priceLabel}>Package price</Text>
          <Text style={styles.price}>PKR {pkg.price.toLocaleString()}</Text>
          <Text style={styles.compare}>
            vs PKR {pkg.individualPrice.toLocaleString()} individual
          </Text>
        </View>
        {savings > 0 ? (
          <View style={styles.saveBadge}>
            <Text style={styles.saveText}>Save PKR {savings.toLocaleString()}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.actions}>
        {onCompare ? (
          <TouchableOpacity style={styles.compareBtn} onPress={onCompare} activeOpacity={0.85}>
            <Text style={styles.compareBtnText}>Compare</Text>
          </TouchableOpacity>
        ) : null}
        <TouchableOpacity style={styles.bookBtn} onPress={onBook} activeOpacity={0.85}>
          <Text style={styles.bookBtnText}>Book Package</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.card,
  },
  cardSelected: {
    borderColor: colors.brandPrimary,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  emoji: { fontSize: 32 },
  headerText: { flex: 1 },
  name: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  tagline: {
    fontSize: 13,
    color: colors.neutral500,
    marginTop: 2,
  },
  benefits: { gap: spacing.sm, marginBottom: spacing.md },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  benefitText: {
    flex: 1,
    fontSize: 13,
    color: colors.neutral600,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  priceLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.neutral500,
    textTransform: 'uppercase',
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.brandPrimary,
    marginTop: 2,
  },
  compare: {
    fontSize: 12,
    color: colors.neutral500,
    marginTop: 2,
  },
  saveBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.statusSuccessBg,
  },
  saveText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.statusSuccess,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  compareBtn: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compareBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.neutral600,
  },
  bookBtn: {
    flex: 2,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
});