import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { LabTest } from '../../../lib/mappers/labTest';
import { addToLabCart } from '../../../lib/labCart';
import { labTestsBrand } from '../labTestsBrand';
import { spacing, radius } from '../../../theme';

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

  const testsLabel =
    typeof test.testsIncluded === 'number'
      ? `${test.testsIncluded} tests`
      : String(test.testsIncluded);

  return (
    <View style={[styles.card, compact && styles.cardCompact]}>
      <View style={styles.accentBar} />

      <View style={styles.body}>
        <View style={styles.top}>
          <View style={styles.iconWrap}>
            <Icon name="flask" size={20} color={labTestsBrand.onAccent} />
          </View>

          <View style={styles.main}>
            <View style={styles.titleRow}>
              <Text style={styles.name} numberOfLines={2}>
                {test.name}
              </Text>
              {test.discount ? (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{test.discount}</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.labRow}>
              <Text style={styles.lab} numberOfLines={1}>
                {test.lab}
              </Text>
              {test.homeCollection ? (
                <View style={styles.homeBadge}>
                  <Icon
                    name="home"
                    size={11}
                    color={labTestsBrand.success}
                  />
                  <Text style={styles.homeText}>Home</Text>
                </View>
              ) : null}
            </View>

            {!compact ? (
              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <View style={styles.metaIcon}>
                    <Icon
                      name="clock-outline"
                      size={12}
                      color={labTestsBrand.accent}
                    />
                  </View>
                  <View style={styles.metaCopy}>
                    <Text style={styles.metaLabel}>Collect</Text>
                    <Text style={styles.metaText} numberOfLines={1}>
                      {test.collectionTime || 'Same day'}
                    </Text>
                  </View>
                </View>
                <View style={styles.metaChip}>
                  <View style={styles.metaIcon}>
                    <Icon
                      name="file-document-outline"
                      size={12}
                      color={labTestsBrand.accent}
                    />
                  </View>
                  <View style={styles.metaCopy}>
                    <Text style={styles.metaLabel}>Report</Text>
                    <Text style={styles.metaText} numberOfLines={1}>
                      {test.reportTime || '24 hours'}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.priceBlock}>
            <Text style={styles.testsCount}>{testsLabel}</Text>
            <Text style={styles.price}>PKR {test.price.toLocaleString()}</Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={styles.cartBtn}
              onPress={handleAddToCart}
              activeOpacity={0.85}
              accessibilityLabel="Add to lab cart">
              <Icon name="cart-outline" size={18} color={labTestsBrand.accent} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.bookBtn}
              onPress={() => onBook(test)}
              activeOpacity={0.85}>
              <Text style={styles.bookText}>Book</Text>
              <Icon
                name="arrow-right"
                size={15}
                color={labTestsBrand.onAccent}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: labTestsBrand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 85, 104, 0.18)',
    overflow: 'hidden',
    flexDirection: 'row',
    ...Platform.select({
      ios: {
        shadowColor: labTestsBrand.ink,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.1,
        shadowRadius: 14,
      },
      android: { elevation: 4 },
    }),
  },
  cardCompact: {},
  accentBar: {
    width: 4,
    backgroundColor: labTestsBrand.accent,
  },
  body: {
    flex: 1,
    minWidth: 0,
    padding: spacing.md,
    gap: spacing.md,
  },
  top: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: labTestsBrand.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  main: {
    flex: 1,
    minWidth: 0,
    gap: 7,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  name: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
    lineHeight: 20,
    color: labTestsBrand.ink,
  },
  discountBadge: {
    backgroundColor: labTestsBrand.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '800',
    color: labTestsBrand.onAccent,
  },
  labRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  lab: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '600',
    color: labTestsBrand.muted,
  },
  homeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: labTestsBrand.successSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  homeText: {
    fontSize: 10,
    fontWeight: '700',
    color: labTestsBrand.success,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: labTestsBrand.soft,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 0,
  },
  metaIcon: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: labTestsBrand.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  metaLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: labTestsBrand.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '700',
    color: labTestsBrand.ink,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: labTestsBrand.soft,
  },
  priceBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  testsCount: {
    fontSize: 11,
    fontWeight: '600',
    color: labTestsBrand.muted,
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: labTestsBrand.accent,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    borderWidth: 1.5,
    borderColor: labTestsBrand.mist,
    backgroundColor: labTestsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bookBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    height: 42,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    backgroundColor: labTestsBrand.accent,
    ...Platform.select({
      ios: {
        shadowColor: labTestsBrand.accent,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.28,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  bookText: {
    fontSize: 13,
    fontWeight: '800',
    color: labTestsBrand.onAccent,
  },
});
