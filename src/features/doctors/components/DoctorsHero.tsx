import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { doctorsBrand } from '../doctorsBrand';
import { spacing, radius } from '../../../theme';
import type { ConsultType } from '../data/mockDoctors';

const CATEGORY_CONFIG = {
  online: {
    badge: 'Online consult',
    title: 'Talk to a doctor from home',
    description: 'Video, chat, and prescriptions — usually within a minute.',
    features: [
      { icon: 'video-outline', label: 'Video & chat' },
      { icon: 'clock-fast', label: 'Under 60 sec' },
    ],
  },
  in_person: {
    badge: 'Clinic visit',
    title: 'Book trusted clinic visits',
    description: 'See specialists at hospitals and clinics near you.',
    features: [
      { icon: 'hospital-building', label: 'In-clinic' },
      { icon: 'calendar-check', label: 'Fixed slots' },
    ],
  },
};

type DoctorsHeroProps = {
  search: string;
  onSearchChange: (value: string) => void;
  category: ConsultType;
};

export function DoctorsHero({ search, onSearchChange, category }: DoctorsHeroProps) {
  const config = CATEGORY_CONFIG[category];

  return (
    <View style={styles.wrap}>
      <View style={styles.orbLarge} />
      <View style={styles.orbSmall} />

      <View style={styles.topRow}>
        <View style={styles.badge}>
          <Icon name="stethoscope" size={14} color={doctorsBrand.onAccent} />
          <Text style={styles.badgeText}>{config.badge}</Text>
        </View>
        <View style={styles.featureRow}>
          {config.features.map(feature => (
            <View key={feature.label} style={styles.featureChip}>
              <Icon name={feature.icon} size={12} color={doctorsBrand.onAccent} />
              <Text style={styles.featureText}>{feature.label}</Text>
            </View>
          ))}
        </View>
      </View>

      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.description}>{config.description}</Text>

      <View style={styles.searchBox}>
        <View style={styles.searchIcon}>
          <Icon name="magnify" size={18} color={doctorsBrand.accent} />
        </View>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search by name or specialty..."
          placeholderTextColor={doctorsBrand.muted}
          returnKeyType="search"
        />
        {search.length > 0 ? (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={8}
            style={styles.clearBtn}>
            <Icon name="close-circle" size={18} color={doctorsBrand.muted} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: doctorsBrand.accent,
    borderRadius: 24,
    padding: spacing.lg,
    marginBottom: spacing.md,
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
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: doctorsBrand.onAccent,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 6,
  },
  featureChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  featureText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: doctorsBrand.onAccent,
    lineHeight: 28,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  description: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.78)',
    lineHeight: 19,
    marginBottom: spacing.md,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: doctorsBrand.card,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
  },
  searchIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: doctorsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: doctorsBrand.ink,
    paddingVertical: spacing.sm,
  },
  clearBtn: {
    padding: 4,
  },
});
