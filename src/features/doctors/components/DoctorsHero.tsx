import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, spacing, radius } from '../../../theme';
import type { ConsultType } from '../data/mockDoctors';

const CATEGORY_CONFIG = {
  online: {
    badge: 'Online Consult',
    title: 'Consult Certified Doctors Online',
    description:
      'Video consultations in 60 seconds. Chat with your doctor and upload prescriptions from home.',
    features: [
      { icon: 'video', label: 'Video & chat' },
      { icon: 'clock-outline', label: 'Connect in 60 sec' },
    ],
  },
  in_person: {
    badge: 'In-Person Visit',
    title: 'Book Clinic Appointments',
    description:
      'Visit trusted doctors at their hospital or clinic at your scheduled time.',
    features: [
      { icon: 'hospital-building', label: 'Clinic visit' },
      { icon: 'clock-outline', label: 'Scheduled slots' },
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
      <View style={styles.glow} />
      <View style={styles.badge}>
        <Icon name="stethoscope" size={14} color={colors.brandHighlight} />
        <Text style={styles.badgeText}>{config.badge}</Text>
      </View>
      <Text style={styles.title}>{config.title}</Text>
      <Text style={styles.description}>{config.description}</Text>

      <View style={styles.searchBox}>
        <Icon name="magnify" size={20} color={colors.brandPrimary} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={onSearchChange}
          placeholder="Search doctors by name or specialty..."
          placeholderTextColor={colors.neutral500}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => onSearchChange('')}>
            <Icon name="close-circle" size={18} color={colors.neutral500} />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.features}>
        {config.features.map(feature => (
          <View key={feature.label} style={styles.featureItem}>
            <Icon name={feature.icon} size={16} color={colors.brandHighlight} />
            <Text style={styles.featureText}>{feature.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.brandBanner,
    borderRadius: 20,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    overflow: 'hidden',
  },
  glow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.white,
    opacity: 0.08,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    marginBottom: spacing.md,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.white,
    lineHeight: 32,
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.65)',
    lineHeight: 21,
    marginBottom: spacing.lg,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.pill,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.neutral900,
    paddingVertical: spacing.sm,
  },
  features: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  featureText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
});
