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
const HOLD_MS = 2200;

type SplashScreenProps = {
  onFinish: () => void;
};

/**
 * One splash only: centered logo + tagline, then onboarding or auth.
 * Starts fully visible so it matches the native white/brand frame.
 */
export function SplashScreen({ onFinish }: SplashScreenProps) {
  const rootOpacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.96)).current;
  const finishedRef = useRef(false);

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

    const timer = setTimeout(finish, HOLD_MS);
    return () => {
      clearTimeout(timer);
      pulse.stop();
    };
  }, [finish, scale]);

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
