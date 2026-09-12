import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { pharmaciesBrand } from '../pharmaciesBrand';
import { spacing } from '../../../theme';

type PharmaciesHeroProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function PharmaciesHero({
  search,
  onSearchChange,
}: PharmaciesHeroProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.orbLarge} />
      <View style={styles.orbSmall} />

      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Icon name="pharmacy" size={14} color={pharmaciesBrand.onAccent} />
          <Text style={styles.badgeText}>Medicine delivery</Text>
        </View>
        <View style={styles.featureRow}>
          <View style={styles.featureChip}>
            <Icon
              name="shield-check-outline"
              size={12}
              color={pharmaciesBrand.onAccent}
            />
            <Text style={styles.featureText}>Verified</Text>
          </View>
          <View style={styles.featureChip}>
            <Icon name="truck-fast-outline" size={12} color={pharmaciesBrand.onAccent} />
            <Text style={styles.featureText}>Fast delivery</Text>
          </View>
        </View>
      </View>

      <Text style={styles.title}>Order from trusted pharmacies</Text>
      <Text style={styles.description}>
        Browse verified partners near you — authentic medicines with clear
        delivery times.
      </Text>

      <View style={styles.searchBox}>
        <View style={styles.searchIcon}>
          <Icon name="magnify" size={18} color={pharmaciesBrand.accent} />
        </View>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search by name or city..."
          placeholderTextColor={pharmaciesBrand.muted}
          returnKeyType="search"
        />
        {search.length > 0 ? (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={8}
            style={styles.clearBtn}>
            <Icon name="close-circle" size={18} color={pharmaciesBrand.muted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: pharmaciesBrand.accent,
    borderRadius: 24,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  orbLarge: {
    position: 'absolute',
    top: -48,
    right: -36,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  orbSmall: {
    position: 'absolute',
    bottom: -28,
    left: -20,
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.md,
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: pharmaciesBrand.onAccent,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
  },
  featureText: {
    fontSize: 11,
    fontWeight: '600',
    color: pharmaciesBrand.onAccent,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.35,
    lineHeight: 28,
    color: pharmaciesBrand.onAccent,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.82)',
    marginBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: pharmaciesBrand.card,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: pharmaciesBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: pharmaciesBrand.ink,
    padding: 0,
    minWidth: 0,
  },
  clearBtn: {
    padding: 2,
  },
});
