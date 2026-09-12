import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const wordmark = require('../../assets/branding/splash-wordmark.png');

const { width: SCREEN_W } = Dimensions.get('window');
const LOGO_WIDTH = Math.min(SCREEN_W * 0.78, 320);
const LOGO_HEIGHT = LOGO_WIDTH * 0.28;
const TAGLINE = 'Care That Fits Your Life.';
/** Minimum brand hold before leaving splash. */
export const SPLASH_HOLD_MS = 2200;
/** Hard cap waiting on data after hold (prefetch timeout). */
export const SPLASH_DATA_MAX_MS = 1800;

type SplashScreenProps = {
  onFinish: () => void;
  /**
   * When false, splash stays after HOLD_MS until ready (or data max elapses).
   * Guests / unauthenticated flows should pass true immediately.
   */
  ready?: boolean;
};

/**
 * One splash only: centered logo + tagline.
 * Waits for min hold, then until `ready` (with a max wait) before fading out.
 */
export function SplashScreen({ onFinish, ready = true }: SplashScreenProps) {
  const rootOpacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const finishedRef = useRef(false);
  const holdDoneRef = useRef(false);
  const readyRef = useRef(ready);
  readyRef.current = ready;

  const finish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    Animated.timing(rootOpacity, {
      toValue: 0,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => onFinish());
  }, [onFinish, rootOpacity]);

  const tryFinish = useCallback(() => {
    if (holdDoneRef.current && readyRef.current) {
      finish();
    }
  }, [finish]);

  useEffect(() => {
    readyRef.current = ready;
    tryFinish();
  }, [ready, tryFinish]);

  useEffect(() => {
    const pulse = Animated.sequence([
      Animated.timing(scale, {
        toValue: 1.04,
        duration: 550,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 450,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
    ]);
    pulse.start();

    const holdTimer = setTimeout(() => {
      holdDoneRef.current = true;
      tryFinish();
    }, SPLASH_HOLD_MS);

    // Safety: never block splash longer than hold + data max.
    const maxTimer = setTimeout(() => {
      holdDoneRef.current = true;
      readyRef.current = true;
      finish();
    }, SPLASH_HOLD_MS + SPLASH_DATA_MAX_MS);

    return () => {
      clearTimeout(holdTimer);
      clearTimeout(maxTimer);
      pulse.stop();
    };
  }, [finish, scale, tryFinish]);

  return (
    <Animated.View style={[styles.root, { opacity: rootOpacity }]}>
      <Animated.View style={[styles.center, { transform: [{ scale }] }]}>
        <Image source={wordmark} style={styles.wordmark} resizeMode="contain" />
        <Text style={styles.tagline}>{TAGLINE}</Text>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  wordmark: {
    width: LOGO_WIDTH,
    height: LOGO_HEIGHT,
  },
  tagline: {
    marginTop: 18,
    fontSize: 17,
    fontWeight: '700',
    color: '#124362',
    letterSpacing: -0.2,
    textAlign: 'center',
    lineHeight: 24,
  },
});
