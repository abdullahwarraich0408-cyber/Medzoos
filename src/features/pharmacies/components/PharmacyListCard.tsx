import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { Pharmacy } from '../../../lib/mappers/vendor';
import { pharmaciesBrand } from '../pharmaciesBrand';
import { spacing, radius } from '../../../theme';

type PharmacyListCardProps = {
  pharmacy: Pharmacy;
  onPress: () => void;
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

export function PharmacyListCard({ pharmacy, onPress }: PharmacyListCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = Boolean(pharmacy.bgImage) && !imageFailed;
  const location =
    pharmacy.city || pharmacy.address?.split(',')[0]?.trim() || 'Nearby';

  return (
    <View style={styles.card}>
      <TouchableOpacity
        style={styles.main}
        activeOpacity={0.88}
        onPress={onPress}>
        {showImage ? (
          <Image
            source={{ uri: pharmacy.bgImage }}
            style={styles.photo}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <View style={[styles.photo, styles.photoFallback]}>
            <Text style={styles.initials}>{getInitials(pharmacy.name)}</Text>
          </View>
        )}

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {pharmacy.name}
            </Text>
            {pharmacy.verified ? (
              <View style={styles.verified}>
                <Icon name="check" size={10} color={pharmaciesBrand.onAccent} />
              </View>
            ) : null}
          </View>

          <Text style={styles.location} numberOfLines={1}>
            {location}
            <Text style={styles.dot}> · </Text>
            {pharmacy.distance}
          </Text>

          <View style={styles.deliveryPill}>
            <Icon
              name="truck-delivery-outline"
              size={12}
              color={pharmaciesBrand.success}
            />
            <Text style={styles.deliveryText}>{pharmacy.deliveryTime}</Text>
          </View>

          <View style={styles.ratingRow}>
            <Icon name="star" size={14} color={pharmaciesBrand.star} />
            <Text style={styles.rating}>{pharmacy.rating.toFixed(1)}</Text>
            <Text style={styles.reviews}>
              ({pharmacy.reviews} Reviews)
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      <View style={styles.side}>
        <View
          style={[
            styles.statusChip,
            !pharmacy.open && styles.statusChipClosed,
          ]}>
          <View
            style={[styles.statusDot, !pharmacy.open && styles.statusDotClosed]}
          />
          <Text
            style={[
              styles.statusText,
              !pharmacy.open && styles.statusTextClosed,
            ]}>
            {pharmacy.open ? 'Open' : 'Closed'}
          </Text>
        </View>

        <View style={styles.sideBottom}>
          {pharmacy.productCount > 0 ? (
            <Text style={styles.itemsHint}>{pharmacy.productCount}+ items</Text>
          ) : (
            <Text style={styles.itemsHint}>Medicines</Text>
          )}

          <TouchableOpacity
            style={styles.orderBtn}
            onPress={onPress}
            activeOpacity={0.85}>
            <Text style={styles.orderBtnText}>Order</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: spacing.sm,
    backgroundColor: pharmaciesBrand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: pharmaciesBrand.border,
    padding: spacing.md,
  },
  main: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
    minWidth: 0,
  },
  photo: {
    width: 88,
    height: 88,
    borderRadius: 16,
    backgroundColor: pharmaciesBrand.soft,
  },
  photoFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pharmaciesBrand.glaze,
  },
  initials: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.4,
    color: pharmaciesBrand.accent,
  },
  info: {
    flex: 1,
    minWidth: 0,
    gap: 5,
    paddingTop: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    flexShrink: 1,
    fontSize: 16,
    fontWeight: '700',
    color: pharmaciesBrand.ink,
    letterSpacing: -0.2,
  },
  verified: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: pharmaciesBrand.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  location: {
    fontSize: 13,
    fontWeight: '500',
    color: pharmaciesBrand.muted,
  },
  dot: {
    color: pharmaciesBrand.mist,
  },
  deliveryPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: pharmaciesBrand.successSoft,
  },
  deliveryText: {
    fontSize: 11,
    fontWeight: '700',
    color: pharmaciesBrand.success,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  rating: {
    fontSize: 13,
    fontWeight: '700',
    color: pharmaciesBrand.ink,
  },
  reviews: {
    fontSize: 12,
    color: pharmaciesBrand.muted,
  },
  side: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    minWidth: 88,
  },
  statusChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.pill,
    backgroundColor: pharmaciesBrand.successSoft,
  },
  statusChipClosed: {
    backgroundColor: pharmaciesBrand.closedSoft,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: pharmaciesBrand.success,
  },
  statusDotClosed: {
    backgroundColor: pharmaciesBrand.closed,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
    color: pharmaciesBrand.success,
  },
  statusTextClosed: {
    color: pharmaciesBrand.closed,
  },
  sideBottom: {
    alignItems: 'flex-end',
    gap: 8,
  },
  itemsHint: {
    fontSize: 11,
    fontWeight: '600',
    color: pharmaciesBrand.muted,
  },
  orderBtn: {
    backgroundColor: pharmaciesBrand.accent,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
  orderBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: pharmaciesBrand.onAccent,
  },
});
