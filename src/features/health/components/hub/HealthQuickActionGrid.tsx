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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HEALTH_QUICK_ACTIONS } from '../../data/healthHubData';
import type { HealthStackParamList } from '../../../../navigation/types';
import { spacing } from '../../../../theme';
import { calmLayout } from '../../../../theme/calmLayout';
import { healthBrand } from '../../healthBrand';

/** Fixed size for every vault record card (2-column grid). */
const CARD_HEIGHT = 120;
const CARD_GAP = 12;
const CARD_WIDTH_PCT = '48%' as const;

/** Realistic 3D art — same family as Home posters (object on black, no plate). */
const VAULT_ART: Record<string, ImageSourcePropType> = {
  prescriptions: require('../../../../assets/home/poster-3d-prescription.png'),
  medicines: require('../../../../assets/home/poster-3d-pills.png'),
  reports: require('../../../../assets/home/poster-3d-lab.png'),
  consults: require('../../../../assets/home/poster-3d-stethoscope.png'),
  documents: require('../../../../assets/health/vault-icon-documents.png'),
  timeline: require('../../../../assets/health/vault-icon-timeline.png'),
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
 * Vault records — uniform teal cards with realistic 3D icons.
 */
export function HealthQuickActionGrid({
  navigation,
}: HealthQuickActionGridProps) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>My health records</Text>
        <Text style={styles.sectionHint}>
          Prescriptions, labs, visits, and your care journey
        </Text>
      </View>

      <View style={styles.grid}>
        {HEALTH_QUICK_ACTIONS.map(action => {
          const art = VAULT_ART[action.id];
          return (
            <Pressable
              key={action.id}
              style={({ pressed }) => [
                styles.card,
                pressed && styles.pressed,
              ]}
              onPress={() => navigation.navigate(action.screen)}
              accessibilityRole="button"
              accessibilityLabel={`${action.title}. ${action.subtitle}`}>
              <View style={styles.rail} />
              <View style={styles.glow} pointerEvents="none" />

              <View style={styles.cardTop}>
                <View style={styles.artWell}>
                  {art ? (
                    <Image
                      source={art}
                      style={styles.art}
                      resizeMode="contain"
                    />
                  ) : (
                    <Icon
                      name={action.icon}
                      size={22}
                      color={healthBrand.accent}
                    />
                  )}
                </View>
                <View style={styles.arrowChip}>
                  <Icon
                    name="arrow-top-right"
                    size={13}
                    color={healthBrand.accent}
                  />
                </View>
              </View>

              <View style={styles.cardCopy}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {action.title}
                </Text>
                <Text style={styles.cardSub} numberOfLines={2}>
                  {action.subtitle}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: calmLayout.screenPadding,
    gap: spacing.md,
  },
  header: {
    gap: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: healthBrand.ink,
    letterSpacing: -0.3,
  },
  sectionHint: {
    fontSize: 13,
    fontWeight: '500',
    color: healthBrand.muted,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: CARD_GAP,
  },
  card: {
    width: CARD_WIDTH_PCT,
    maxWidth: CARD_WIDTH_PCT,
    height: CARD_HEIGHT,
    minWidth: 0,
    backgroundColor: healthBrand.card,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: healthBrand.mist,
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 14,
    paddingRight: 12,
    overflow: 'hidden',
    justifyContent: 'space-between',
    ...Platform.select({
      ios: {
        shadowColor: healthBrand.ink,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
      },
      android: { elevation: 5 },
    }),
  },
  rail: {
    position: 'absolute',
    left: 0,
    top: 14,
    bottom: 14,
    width: 4,
    borderTopRightRadius: 4,
    borderBottomRightRadius: 4,
    backgroundColor: healthBrand.accent,
  },
  glow: {
    position: 'absolute',
    right: -18,
    top: -22,
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: healthBrand.soft,
    opacity: 0.95,
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
    zIndex: 1,
  },
  /** Dark well hides the black void around 3D objects — same for all six. */
  artWell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#071A20',
    overflow: 'hidden',
  },
  art: {
    width: 40,
    height: 40,
  },
  arrowChip: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: healthBrand.soft,
  },
  cardCopy: {
    gap: 3,
    zIndex: 1,
    paddingRight: 4,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    color: healthBrand.ink,
  },
  cardSub: {
    fontSize: 11,
    fontWeight: '500',
    color: healthBrand.muted,
    lineHeight: 15,
  },
  pressed: {
    opacity: 0.94,
    transform: [{ scale: 0.985 }],
  },
});
