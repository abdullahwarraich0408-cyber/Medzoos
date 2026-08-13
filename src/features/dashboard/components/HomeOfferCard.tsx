import React from 'react';
import { View, Text, Image, Pressable, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { PROMO_BANNERS } from '../../home/data/homeData';
import { colors, spacing, radius, shadows, cardStyles } from '../../../theme';
import { healthOsTypography } from '../../../theme/healthOs';

type HomeOfferCardProps = {
  onPress: (banner: (typeof PROMO_BANNERS)[number]) => void;
};

const OFFER = PROMO_BANNERS[0];

export function HomeOfferCard({ onPress }: HomeOfferCardProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.card,
        pressed && cardStyles.pressed,
      ]}
      onPress={() => onPress(OFFER)}>
      <View style={styles.content}>
        <View style={styles.badge}>
          <Icon name="tag-outline" size={12} color={colors.textPrimary} />
          <Text style={styles.badgeText}>Limited offer</Text>
        </View>
        <Text style={styles.title}>{OFFER.title}</Text>
        <Text style={styles.subtitle}>{OFFER.subtitle}</Text>
        {OFFER.code ? <Text style={styles.code}>{OFFER.code}</Text> : null}
        <View style={styles.cta}>
          <Text style={styles.ctaText}>{OFFER.cta}</Text>
          <Icon name="arrow-right" size={14} color={colors.textPrimary} />
        </View>
      </View>
      <Image
        source={{ uri: OFFER.image }}
        style={styles.image}
        resizeMode="cover"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 168,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    backgroundColor: colors.brandBanner,
    ...shadows.cardElevated,
  },
  content: {
    padding: spacing.lg,
    paddingRight: 120,
    minHeight: 168,
    justifyContent: 'center',
    gap: spacing.xs,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 0.3,
  },
  title: {
    ...healthOsTypography.messageTitle,
    fontSize: 20,
    lineHeight: 24,
    color: colors.white,
  },
  subtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
  },
  code: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.white,
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  image: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 112,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});
