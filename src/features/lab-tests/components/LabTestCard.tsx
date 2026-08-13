import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { LabTest } from '../../../lib/mappers/labTest';
import { addToLabCart } from '../../../lib/labCart';
import { colors, spacing, radius, shadows, cardStyles } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';

type LabTestCardProps = {
  test: LabTest;
  compact?: boolean;
  onBook: (test: LabTest) => void;
  onCartUpdate?: () => void;
};

export function LabTestCard({
  test,
  compact = false,
  onBook,
  onCartUpdate,
}: LabTestCardProps) {
  const handleAddToCart = async () => {
    await addToLabCart(test);
    onCartUpdate?.();
    Alert.alert('Added to cart', `${test.name} added to your lab cart.`);
  };

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          {test.discount && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{test.discount}</Text>
            </View>
          )}
          <Text style={styles.name} numberOfLines={2}>
            {test.name}
          </Text>
        </View>
        <View style={styles.iconWrap}>
          <Icon name="flask" size={20} color={colors.brandPrimary} />
        </View>
      </View>

      <View style={styles.labRow}>
        <Text style={styles.lab}>{test.lab}</Text>
        {test.homeCollection && (
          <View style={styles.homeBadge}>
            <Icon name="home" size={10} color={colors.brandPrimary} />
            <Text style={styles.homeText}>Home</Text>
          </View>
        )}
      </View>

      {!compact && (
        <View style={styles.metaRow}>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Collection</Text>
            <Text style={styles.metaValue}>{test.collectionTime || 'Same day'}</Text>
          </View>
          <View style={styles.metaBox}>
            <Text style={styles.metaLabel}>Report</Text>
            <Text style={styles.metaValue}>{test.reportTime || '24 hours'}</Text>
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View>
          <Text style={styles.testsCount}>{test.testsIncluded} tests</Text>
          <Text style={styles.price}>PKR {test.price.toLocaleString()}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cartBtn}
            onPress={handleAddToCart}
            activeOpacity={0.85}>
            <Icon name="cart-outline" size={18} color={colors.brandPrimary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.bookBtn}
            onPress={() => onBook(test)}
            activeOpacity={0.85}>
            <Text style={styles.bookText}>Book</Text>
            <Icon name="arrow-right" size={14} color={colors.white} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.listCard,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardCompact: {
    marginBottom: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  headerText: {
    flex: 1,
  },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.inkHeadline,
    lineHeight: 20,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  labRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  lab: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.neutral600,
  },
  homeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.brandLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  homeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaBox: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.sm,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral500,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.neutral800,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.neutral100,
  },
  testsCount: {
    fontSize: 11,
    color: colors.neutral500,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  cartBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    height: 38,
    paddingHorizontal: spacing.md,
    borderRadius: 10,
    backgroundColor: colors.brandPrimary,
  },
  bookText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.white,
  },
});
