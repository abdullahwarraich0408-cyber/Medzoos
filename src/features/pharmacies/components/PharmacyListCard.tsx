import React from 'react';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Pharmacy } from '../../../lib/mappers/vendor';
import { colors, spacing, radius, shadows, cardStyles } from '../../../theme';
import { healthOs, healthOsTypography } from '../../../theme/healthOs';

type PharmacyListCardProps = {
  pharmacy: Pharmacy;
  onPress: () => void;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

export function PharmacyListCard({ pharmacy, onPress }: PharmacyListCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: pharmacy.bgImage }} style={styles.image} />
        <View style={styles.imageOverlay} />
        <View style={styles.badgesTop}>
          {pharmacy.verified ? (
            <View style={styles.verifiedBadge}>
              <Icon name="shield-check" size={12} color={colors.white} />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          ) : null}
          <View style={[styles.openBadge, !pharmacy.open && styles.closedBadge]}>
            <View style={[styles.openDot, !pharmacy.open && styles.closedDot]} />
            <Text style={styles.openText}>{pharmacy.open ? 'Open' : 'Closed'}</Text>
          </View>
        </View>
        <View style={styles.distancePill}>
          <Icon name="map-marker" size={12} color={colors.brandHighlight} />
          <Text style={styles.distanceText}>{pharmacy.distance}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(pharmacy.name)}</Text>
          </View>
          <View style={styles.titleBlock}>
            <Text style={styles.name} numberOfLines={1}>
              {pharmacy.name}
            </Text>
            <Text style={styles.meta} numberOfLines={1}>
              {pharmacy.city || pharmacy.address || 'Pakistan'} · {pharmacy.deliveryTime}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color={colors.rating} />
            <Text style={styles.rating}>{pharmacy.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>({pharmacy.reviews})</Text>
          </View>
          <View style={styles.productsPill}>
            <Icon name="pill" size={12} color={colors.brandPrimary} />
            <Text style={styles.productsText}>{pharmacy.productCount}+ items</Text>
          </View>
          <Icon name="chevron-right" size={22} color={colors.brandPrimary} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    ...cardStyles.listCard,
    overflow: 'hidden',
  },
  pressed: { opacity: 0.95 },
  imageWrap: { height: 148, backgroundColor: colors.neutral100 },
  image: { width: '100%', height: '100%' },
  imageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  badgesTop: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  verifiedText: { fontSize: 10, fontWeight: '700', color: colors.white },
  openBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  closedBadge: { backgroundColor: colors.neutral100 },
  openDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: healthOs.liveGreen },
  closedDot: { backgroundColor: colors.neutral500 },
  openText: { fontSize: 10, fontWeight: '700', color: colors.neutral800 },
  distancePill: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.55)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.md,
  },
  distanceText: { fontSize: 11, fontWeight: '600', color: colors.white },
  body: { padding: spacing.lg, gap: spacing.md },
  titleRow: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.brandMist,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -28,
    borderWidth: 2,
    borderColor: colors.white,
  },
  avatarText: { fontSize: 13, fontWeight: '800', color: colors.brandPrimary },
  titleBlock: { flex: 1, paddingTop: 2 },
  name: { ...healthOsTypography.messageTitle, fontSize: 17 },
  meta: { fontSize: 12, color: colors.neutral500, marginTop: 2 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1 },
  rating: { fontSize: 13, fontWeight: '700', color: colors.neutral800 },
  reviews: { fontSize: 11, color: colors.neutral500 },
  productsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.brandMist,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  productsText: { fontSize: 10, fontWeight: '600', color: colors.brandPrimary },
});
