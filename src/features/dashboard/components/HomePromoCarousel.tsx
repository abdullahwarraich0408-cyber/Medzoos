import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { PROMO_BANNERS } from '../../home/data/homeData';
import { colors, spacing, radius, shadows } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { healthOsTypography } from '../../../theme/healthOs';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - calmLayout.screenPadding * 2;
const SNAP = CARD_W + spacing.md;

type HomePromoCarouselProps = {
  onPressBanner: (banner: (typeof PROMO_BANNERS)[number]) => void;
};

export function HomePromoCarousel({ onPressBanner }: HomePromoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setActiveIndex(Math.round(x / SNAP));
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.row}>
        {PROMO_BANNERS.map(banner => (
          <Pressable
            key={banner.id}
            style={[styles.card, { backgroundColor: banner.bg }]}
            onPress={() => onPressBanner(banner)}>
            <View style={styles.content}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Limited offer</Text>
              </View>
              <Text style={[styles.title, { color: banner.titleColor }]}>
                {banner.title}
              </Text>
              <Text style={styles.subtitle}>{banner.subtitle}</Text>
              {banner.code ? <Text style={styles.code}>{banner.code}</Text> : null}
              <View style={[styles.cta, { backgroundColor: banner.btnColor }]}>
                <Text style={[styles.ctaText, { color: banner.btnTextColor }]}>
                  {banner.cta}
                </Text>
                <Text style={[styles.ctaArrow, { color: banner.btnTextColor }]}>
                  →
                </Text>
              </View>
            </View>
            <Image
              source={{ uri: banner.image }}
              style={styles.image}
              resizeMode="cover"
            />
          </Pressable>
        ))}
      </ScrollView>
      <View style={styles.dots}>
        {PROMO_BANNERS.map((b, i) => (
          <View
            key={b.id}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { gap: spacing.md },
  card: {
    width: CARD_W,
    minHeight: 168,
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 0,
    ...shadows.cardElevated,
  },
  content: {
    padding: spacing.lg,
    paddingRight: 120,
    minHeight: 168,
    justifyContent: 'center',
    gap: 4,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.brandPrimary,
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 24,
  },
  subtitle: {
    ...healthOsTypography.messageCaption,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 13,
  },
  code: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  ctaText: { fontSize: 12, fontWeight: '700' },
  ctaArrow: { fontSize: 12, fontWeight: '700' },
  image: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 112,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingTop: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.neutral300,
  },
  dotActive: { width: 18, backgroundColor: colors.brandBanner },
});
