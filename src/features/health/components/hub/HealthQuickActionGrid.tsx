import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Platform,
  type ImageSourcePropType,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HEALTH_QUICK_ACTIONS } from '../../data/healthHubData';
import type { HealthStackParamList } from '../../../../navigation/types';
import { spacing } from '../../../../theme';
import { healthBrand } from '../../healthBrand';

/** Photo / hero art — same image-led treatment as Home Healthcare Services. */
const VAULT_ART: Record<
  string,
  { source: ImageSourcePropType; fit: 'cover' | 'contain' }
> = {
  prescriptions: {
    source: require('../../../../assets/home/hero-upload-prescription.png'),
    fit: 'cover',
  },
  medicines: {
    source: require('../../../../assets/home/hero-buy-medicine.png'),
    fit: 'cover',
  },
  reports: {
    source: require('../../../../assets/home/hero-lab-test.png'),
    fit: 'cover',
  },
  consults: {
    source: require('../../../../assets/home/hero-consult-doctor.png'),
    fit: 'cover',
  },
  documents: {
    source: require('../../../../assets/health/vault-3d-documents-v2.png'),
    fit: 'contain',
  },
  timeline: {
    source: require('../../../../assets/branding/auth-medzoos-healthcare.jpg'),
    fit: 'cover',
  },
};

type HealthQuickActionGridProps = {
  navigation: NativeStackNavigationProp<HealthStackParamList>;
  badges: {
    reports: string;
    prescriptions: string;
    family: string;
  };
};

/**
 * Vault records — image-led 2-column cards matching Home Healthcare Services.
 */
export function HealthQuickActionGrid({
  navigation,
  badges,
}: HealthQuickActionGridProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.heading}>My health records</Text>
        <Text style={styles.subheading}>
          Prescriptions, labs, visits, and your care journey
        </Text>
      </View>

      <View style={styles.grid}>
        {HEALTH_QUICK_ACTIONS.map(action => {
          const art = VAULT_ART[action.id];
          const badgeLabel =
            action.badgeKey === 'reports'
              ? badges.reports
              : action.badgeKey === 'prescriptions'
                ? badges.prescriptions
                : action.badgeFallback;

          return (
            <Pressable
              key={action.id}
              style={({ pressed }) => [
                styles.cardPress,
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.navigate(action.screen)}
              accessibilityRole="button"
              accessibilityLabel={`${action.title}. ${action.subtitle}`}>
              <View style={styles.card}>
                <View
                  style={[
                    styles.imageFrame,
                    art?.fit === 'contain' && styles.imageFrameSoft,
                  ]}>
                  {art ? (
                    <Image
                      source={art.source}
                      style={
                        art.fit === 'contain' ? styles.imageContain : styles.image
                      }
                      resizeMode={art.fit}
                    />
                  ) : (
                    <View style={styles.imageFallback} />
                  )}
                  <View style={styles.imageScrim} />
                  {badgeLabel ? (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText} numberOfLines={1}>
                        {badgeLabel}
                      </Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.copy}>
                  <Text style={styles.title} numberOfLines={1}>
                    {action.title}
                  </Text>
                  <Text style={styles.subtitle} numberOfLines={1}>
                    {action.subtitle}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.md,
  },
  header: {
    gap: 2,
  },
  heading: {
    fontSize: 16,
    fontWeight: '700',
    color: healthBrand.accent,
    letterSpacing: -0.2,
  },
  subheading: {
    fontSize: 12,
    fontWeight: '500',
    color: healthBrand.muted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardPress: {
    width: '48.1%',
  },
  card: {
    borderRadius: 18,
    backgroundColor: healthBrand.page,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: healthBrand.border,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#10233F',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 14,
      },
      android: { elevation: 3 },
    }),
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
  imageFrame: {
    height: 118,
    backgroundColor: healthBrand.soft,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageFrameSoft: {
    backgroundColor: '#0B2A30',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageContain: {
    width: '78%',
    height: '78%',
  },
  imageFallback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: healthBrand.mist,
  },
  imageScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 61, 66, 0.06)',
  },
  badge: {
    position: 'absolute',
    top: 8,
    left: 8,
    maxWidth: '78%',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: healthBrand.accent,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: healthBrand.onAccent,
    letterSpacing: 0.1,
  },
  copy: {
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 12,
    gap: 2,
    alignItems: 'center',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: healthBrand.accent,
    letterSpacing: -0.1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: healthBrand.muted,
    textAlign: 'center',
  },
});
