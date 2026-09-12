import React, { useEffect, useRef, useState } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { type HomePromoSlide } from '../../home/data/homeData';
import { colors, spacing, radius } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';
import { homeBrand } from '../homeBrand';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - calmLayout.screenPadding * 2;
const SNAP = CARD_W + spacing.md;

/** Locked frame — every slide uses this exact height */
const CARD_H = 168;
const CONTENT_PAD_V = 14;
const CONTENT_PAD_L = 16;
const CONTENT_PAD_R = 132;
const META_H = 22;
const TITLE_LINE = 22;
const TITLE_H = TITLE_LINE * 2;
const DESC_H = 16;
const CTA_H = 32;
const GAP = 8;
const AUTOPLAY_MS = 4200;

const LABEL_BY_ACTION: Record<string, string> = {
  prescription: 'Pharmacy',
  doctors: 'Consult',
  pharmacy: 'Pharmacy',
  medicines: 'Medicines',
  meds: 'Medicines',
  labs: 'Labs',
  hospitals: 'Hospitals',
  packages: 'Packages',
};

type HomePromoCarouselProps = {
  slides: HomePromoSlide[];
  onPressSlide: (slide: HomePromoSlide) => void;
};

function clampWords(value: string, maxChars: number) {
  const trimmed = (value || '').trim().replace(/\s+/g, ' ');
  if (trimmed.length <= maxChars) return trimmed;
  const cut = trimmed.slice(0, maxChars);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > Math.floor(maxChars * 0.55) ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

function resolveLabel(slide: HomePromoSlide) {
  return (slide.label || LABEL_BY_ACTION[slide.action] || 'Offer').trim();
}

function PromoBannerCard({
  slide,
  onPress,
  dimmed,
}: {
  slide: HomePromoSlide;
  onPress: () => void;
  dimmed: boolean;
}) {
  const label = resolveLabel(slide);
  const title = clampWords(slide.title, 36);
  const description = clampWords(
    slide.description || 'Explore care options on Medzoos.',
    40,
  );
  const cta = clampWords(slide.cta || 'Explore', 18);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.slide,
        dimmed && styles.slideIdle,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${cta}`}>
      <View style={[styles.card, { backgroundColor: slide.bg || homeBrand.main }]}>
        <View style={styles.orbLarge} />
        <View style={styles.orbSmall} />
        <View style={styles.glassSheen} />

        {/* Same circular figure glow on every slide (matches first banner) */}
        <View style={styles.figureGlow} />
        <Image source={slide.image} style={styles.figure} resizeMode="contain" />

        <View style={styles.content}>
          {/* Fixed meta row — always same height */}
          <View style={styles.metaRow}>
            <View style={styles.labelPill}>
              <Text style={styles.labelText} numberOfLines={1}>
                {label}
              </Text>
            </View>
            {slide.badge ? (
              <View style={styles.badgePill}>
                <Text style={styles.badgeText} numberOfLines={1}>
                  {slide.badge}
                </Text>
              </View>
            ) : (
              <View style={styles.badgeSpacer} />
            )}
          </View>

          {/* Fixed 2-line title block */}
          <Text style={styles.title} numberOfLines={2}>
            {title}
          </Text>

          {/* Fixed 1-line description */}
          <Text style={styles.description} numberOfLines={1}>
            {description}
          </Text>

          {/* CTA always sits in the same bottom slot */}
          <View style={styles.ctaSlot}>
            <View style={styles.cta}>
              <Text style={styles.ctaText} numberOfLines={1}>
                {cta}
              </Text>
                    <Icon name="arrow-right" size={14} color={homeBrand.main} />
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export function HomePromoCarousel({
  slides,
  onPressSlide,
}: HomePromoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);
  const slideIds = slides.map(s => s.id).join('|');

  useEffect(() => {
    indexRef.current = 0;
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [slideIds]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const id = setInterval(() => {
      const next = (indexRef.current + 1) % slides.length;
      indexRef.current = next;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * SNAP, animated: true });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slideIds, slides.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / SNAP);
    if (next >= 0 && next < slides.length && next !== indexRef.current) {
      indexRef.current = next;
      setActiveIndex(next);
    }
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        ref={scrollRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP}
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={styles.row}>
        {slides.map((slide, index) => (
          <PromoBannerCard
            key={slide.id}
            slide={slide}
            dimmed={index !== activeIndex}
            onPress={() => onPressSlide(slide)}
          />
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {slides.map((slide, i) => (
          <View
            key={slide.id}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: -calmLayout.screenPadding,
  },
  row: {
    gap: spacing.md,
    paddingHorizontal: calmLayout.screenPadding,
  },
  slide: {
    width: CARD_W,
    height: CARD_H,
  },
  slideIdle: {
    opacity: 0.94,
  },
  pressed: {
    opacity: 0.96,
    transform: [{ scale: 0.985 }],
  },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
    shadowColor: homeBrand.main,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 5,
  },
  orbLarge: {
    position: 'absolute',
    right: -40,
    top: -52,
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  orbSmall: {
    position: 'absolute',
    left: -28,
    bottom: -44,
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  glassSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  figureGlow: {
    position: 'absolute',
    right: 4,
    bottom: 6,
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  figure: {
    position: 'absolute',
    right: 8,
    bottom: 10,
    width: 112,
    height: 112,
    zIndex: 1,
  },
  content: {
    position: 'absolute',
    top: CONTENT_PAD_V,
    bottom: CONTENT_PAD_V,
    left: CONTENT_PAD_L,
    right: CONTENT_PAD_R,
    zIndex: 2,
    flexDirection: 'column',
  },
  metaRow: {
    height: META_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: GAP,
    flexShrink: 0,
  },
  labelPill: {
    maxWidth: '62%',
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.28)',
  },
  labelText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.35,
    color: 'rgba(255,255,255,0.95)',
    textTransform: 'uppercase',
  },
  badgePill: {
    maxWidth: '36%',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.94)',
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: homeBrand.main,
  },
  badgeSpacer: {
    width: 8,
    height: META_H,
  },
  title: {
    height: TITLE_H,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
    lineHeight: TITLE_LINE,
    color: colors.white,
    marginBottom: GAP,
    flexShrink: 0,
  },
  description: {
    height: DESC_H,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: DESC_H,
    color: 'rgba(255,255,255,0.82)',
    flexShrink: 0,
  },
  ctaSlot: {
    flex: 1,
    justifyContent: 'flex-end',
    minHeight: CTA_H,
  },
  cta: {
    alignSelf: 'flex-start',
    height: CTA_H,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  ctaText: {
    fontSize: 12,
    fontWeight: '700',
    color: homeBrand.main,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.sm + 2,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: homeBrand.mist,
  },
  dotActive: {
    width: 18,
    height: 6,
    borderRadius: 3,
    backgroundColor: homeBrand.main,
  },
});
