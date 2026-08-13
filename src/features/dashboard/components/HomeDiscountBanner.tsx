import React from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { colors, spacing, radius, shadows } from '../../../theme';

const BANNER_IMAGE =
  'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=500';

type HomeDiscountBannerProps = {
  onPress: () => void;
};

export function HomeDiscountBanner({ onPress }: HomeDiscountBannerProps) {
  return (
    <Pressable
      style={({ pressed }) => [styles.banner, pressed && styles.pressed]}
      onPress={onPress}>
      <View pointerEvents="none" style={styles.glow} />

      <View style={styles.content}>
        <Text style={styles.discount}>
          <Text style={styles.discountStrong}>15%</Text>
          <Text style={styles.discountRest}> EXTRA DISCOUNT</Text>
        </Text>
        <Text style={styles.subtitle}>
          Get your first consultation absolutely free!
        </Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Get Now</Text>
        </View>
      </View>

      <Image source={{ uri: BANNER_IMAGE }} style={styles.image} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    minHeight: 156,
    borderRadius: radius.xxl,
    backgroundColor: colors.brandBanner,
    overflow: 'hidden',
    ...shadows.cardElevated,
  },
  pressed: {
    opacity: 0.97,
  },
  glow: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: colors.white,
    opacity: 0.08,
    right: 20,
    top: -40,
  },
  content: {
    width: Dimensions.get('window').width * 0.52,
    paddingVertical: spacing.lg,
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    gap: spacing.sm,
    zIndex: 2,
  },
  discount: {
    color: colors.white,
    letterSpacing: -0.2,
    lineHeight: 28,
  },
  discountStrong: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
  },
  discountRest: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary100,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.primary100,
    lineHeight: 18,
  },
  cta: {
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
    backgroundColor: colors.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  image: {
    position: 'absolute',
    right: -8,
    bottom: 0,
    width: 150,
    height: 168,
    zIndex: 1,
  },
});
