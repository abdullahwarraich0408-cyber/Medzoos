import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  Pressable,
  StyleSheet,
  Dimensions,
  Platform,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import {
  type HomePromoSlide,
} from '../../home/data/homeData';
import { colors, spacing, radius, shadows } from '../../../theme';
import { calmLayout } from '../../../theme/calmLayout';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_W = SCREEN_W - calmLayout.screenPadding * 2;
const SNAP = CARD_W + spacing.md;
const CARD_H = 158;
const FIGURE_W = 168;
const FIGURE_H = 210;
const POP_TOP = 28;
const AUTOPLAY_MS = 3500;

type HomePromoCarouselProps = {
  slides: HomePromoSlide[];
  onPressSlide: (slide: HomePromoSlide) => void;
};

export function HomePromoCarousel({
  slides,
  onPressSlide,
}: HomePromoCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const indexRef = useRef(0);

  useEffect(() => {
    indexRef.current = 0;
    setActiveIndex(0);
    scrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [slides]);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const id = setInterval(() => {
      const next = (indexRef.current + 1) % slides.length;
      indexRef.current = next;
      setActiveIndex(next);
      scrollRef.current?.scrollTo({ x: next * SNAP, animated: true });
    }, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [slides.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const next = Math.round(x / SNAP);
    if (next !== indexRef.current) {
      indexRef.current = next;
      setActiveIndex(next);
    }
  };

  if (slides.length === 0) {
    return <View style={[styles.wrap, { height: CARD_H + POP_TOP }]} />;
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
        {slides.map(slide => (
          <Pressable
            key={slide.id}
            style={({ pressed }) => [styles.slide, pressed && styles.pressed]}
            onPress={() => onPressSlide(slide)}>
            <View style={[styles.card, { backgroundColor: slide.bg }]}>
              <View style={styles.glow} />
              <View style={styles.content}>
                <Text style={styles.title} numberOfLines={2}>
                  {slide.title}
                </Text>
                <View style={styles.cta}>
                  <Text style={styles.ctaText} numberOfLines={1}>
                    {slide.cta}
                  </Text>
                </View>
              </View>
            </View>
            <Image
              source={slide.image}
              style={styles.figure}
              resizeMode="contain"
            />
          </Pressable>
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
    overflow: 'visible',
  },
  row: {
    gap: spacing.md,
    paddingHorizontal: calmLayout.screenPadding,
    paddingTop: POP_TOP,
    paddingBottom: 0,
  },
  slide: {
    width: CARD_W,
    height: CARD_H + POP_TOP,
    overflow: 'visible',
  },
  pressed: { opacity: 0.96 },
  card: {
    marginTop: POP_TOP,
    height: CARD_H,
    borderRadius: 22,
    overflow: 'hidden',
    ...shadows.card,
  },
  glow: {
    position: 'absolute',
    right: -28,
    top: -56,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: spacing.lg,
    paddingRight: FIGURE_W - 12,
    paddingVertical: spacing.md,
    gap: spacing.md,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    lineHeight: 26,
    color: colors.white,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: radius.pill,
    ...Platform.select({
      ios: {
        shadowColor: '#082B3F',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
    }),
  },
  ctaText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary900,
  },
  figure: {
    position: 'absolute',
    right: -10,
    top: 0,
    width: FIGURE_W,
    height: FIGURE_H,
    zIndex: 2,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary200,
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary700,
  },
});
