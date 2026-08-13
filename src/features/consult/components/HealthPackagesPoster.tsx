import { colors, spacing, radius, shadows } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  HEALTH_PACKAGES,
  type HealthPackageDef,
} from '../../health/data/healthData';
import type { DoctorsStackParamList } from '../../../navigation/types';


const { width: SCREEN_W } = Dimensions.get('window');
const SLIDE_W = SCREEN_W - spacing.lg * 2;
const SNAP_INTERVAL = SLIDE_W + spacing.md;
const AUTO_INTERVAL_MS = 2500;
const AUTO_PAUSE_AFTER_MANUAL_MS = 8000;

const POSTER_THEMES: Record<
  string,
  { bg: string; btnColor: string; titleColor: string }
> = {
  'full-body': { bg: '#5B829C', btnColor: '#FFFFFF', titleColor: '#FFFFFF' },
  cardiac: { bg: '#5B829C', btnColor: '#FFFFFF', titleColor: '#FFFFFF' },
  womens: { bg: '#5B829C', btnColor: '#FFFFFF', titleColor: '#FFFFFF' },
  mens: { bg: '#5B829C', btnColor: '#FFFFFF', titleColor: '#FFFFFF' },
  child: { bg: '#5B829C', btnColor: '#FFFFFF', titleColor: '#FFFFFF' },
};

type HealthPackagesPosterProps = {
  autoPlay?: boolean;
};

type PackageSlideProps = {
  pkg: HealthPackageDef;
  onPress: () => void;
};

function PackageSlide({ pkg, onPress }: PackageSlideProps) {
  const theme = POSTER_THEMES[pkg.category] ?? POSTER_THEMES['full-body'];
  const savings = Math.round((1 - pkg.price / pkg.individualPrice) * 100);

  return (
    <TouchableOpacity
      style={[styles.slide, { backgroundColor: theme.bg, width: SLIDE_W }]}
      onPress={onPress}
      activeOpacity={0.92}>
      <View style={styles.slideTop}>
        <Text style={styles.emoji}>{pkg.emoji}</Text>
        <View style={styles.savingsBadge}>
          <Text style={styles.savingsText}>Save {savings}%</Text>
        </View>
      </View>
      <Text style={[styles.slideTitle, { color: theme.titleColor }]}>
        {pkg.name}
      </Text>
      <Text style={styles.slideTagline} numberOfLines={2}>
        {pkg.tagline}
      </Text>
      <Text style={styles.testsCount}>{pkg.testsIncluded}+ tests included</Text>
      <View style={styles.slideFooter}>
        <View>
          <Text style={styles.price}>Rs. {pkg.price.toLocaleString()}</Text>
          <Text style={styles.priceStrike}>
            Rs. {pkg.individualPrice.toLocaleString()}
          </Text>
        </View>
        <View style={[styles.slideBtn, { backgroundColor: theme.btnColor }]}>
          <Text style={styles.slideBtnText}>Book Now</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function CarouselSeparator() {
  return <View style={styles.separator} />;
}

export function HealthPackagesPoster({
  autoPlay = true,
}: HealthPackagesPosterProps) {
  const navigation =
    useNavigation<NativeStackNavigationProp<DoctorsStackParamList>>();
  const scrollRef = useRef<ScrollView>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const isUserScrollingRef = useRef(false);
  const pauseUntilRef = useRef(0);

  const openPackages = useCallback(() => {
    navigation.navigate('HealthPackages');
  }, [navigation]);

  const scrollToIndex = useCallback((index: number, animated = true) => {
    scrollRef.current?.scrollTo({
      x: index * SNAP_INTERVAL,
      animated,
    });
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, []);

  const pauseAutoPlay = useCallback((durationMs = AUTO_PAUSE_AFTER_MANUAL_MS) => {
    pauseUntilRef.current = Date.now() + durationMs;
  }, []);

  useEffect(() => {
    if (!autoPlay || HEALTH_PACKAGES.length <= 1) {
      return;
    }

    const timer = setInterval(() => {
      if (isUserScrollingRef.current || Date.now() < pauseUntilRef.current) {
        return;
      }

      const nextIndex =
        (activeIndexRef.current + 1) % HEALTH_PACKAGES.length;
      scrollToIndex(nextIndex);
    }, AUTO_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [autoPlay, scrollToIndex]);

  const onScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = event.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / SNAP_INTERVAL);
      const clamped = Math.min(Math.max(index, 0), HEALTH_PACKAGES.length - 1);
      activeIndexRef.current = clamped;
      setActiveIndex(clamped);
    },
    [],
  );

  const onScrollBeginDrag = useCallback(() => {
    isUserScrollingRef.current = true;
  }, []);

  const onScrollEnd = useCallback(() => {
    isUserScrollingRef.current = false;
    pauseAutoPlay();
  }, [pauseAutoPlay]);

  const onDotPress = useCallback(
    (index: number) => {
      scrollToIndex(index);
      pauseAutoPlay();
    },
    [pauseAutoPlay, scrollToIndex],
  );

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.sectionTitle}>Health Packages</Text>
        <TouchableOpacity onPress={openPackages} hitSlop={8}>
          <Text style={styles.viewAll}>View all</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        nestedScrollEnabled
        showsHorizontalScrollIndicator={false}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="start"
        decelerationRate="fast"
        disableIntervalMomentum
        onScroll={onScroll}
        onScrollBeginDrag={onScrollBeginDrag}
        onScrollEndDrag={onScrollEnd}
        onMomentumScrollEnd={onScrollEnd}
        scrollEventThrottle={16}
        contentContainerStyle={styles.carouselContent}>
        {HEALTH_PACKAGES.map((pkg, index) => (
          <React.Fragment key={pkg.id}>
            {index > 0 ? <CarouselSeparator /> : null}
            <PackageSlide pkg={pkg} onPress={openPackages} />
          </React.Fragment>
        ))}
      </ScrollView>

      <View style={styles.dots}>
        {HEALTH_PACKAGES.map((pkg, index) => (
          <TouchableOpacity
            key={pkg.id}
            hitSlop={8}
            onPress={() => onDotPress(index)}>
            <View
              style={[styles.dot, index === activeIndex && styles.dotActive]}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.inkHeadline,
  },
  viewAll: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.brandPrimary,
  },
  carouselContent: {
    paddingRight: spacing.lg,
  },
  separator: {
    width: spacing.md,
  },
  slide: {
    borderRadius: radius.xxl,
    padding: spacing.lg,
    borderWidth: 0,
    minHeight: 180,
    ...shadows.card,
  },
  slideTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  emoji: {
    fontSize: 36,
  },
  savingsBadge: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.pill,
  },
  savingsText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.brandPrimary,
  },
  slideTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  slideTagline: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    marginBottom: spacing.xs,
  },
  testsCount: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
    marginBottom: spacing.md,
  },
  slideFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto',
  },
  price: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.white,
  },
  priceStrike: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
  },
  slideBtn: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
  },
  slideBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.neutral300,
  },
  dotActive: {
    width: 20,
    backgroundColor: colors.brandPrimary,
  },
});