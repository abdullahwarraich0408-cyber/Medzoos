import React, { ReactNode, useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Image,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { StackBackButton } from '../../../components/navigation/StackBackButton';
import { authLayout } from '../authLayout';
import { authUi } from '../authUi';
import { AuthGradientHeader } from './AuthGradientHeader';

const wordmark = require('../../../assets/branding/splash-wordmark.png');

/** Matches DoctorApp header bottom radius (radius.xl = 20). */
const HEADER_RADIUS = 20;

type AuthScreenLayoutProps = {
  title: string;
  subtitle?: string;
  badge?: string;
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  headerGraphic?: ReactNode;
  showBrand?: boolean;
  kicker?: string;
  compact?: boolean;
  showTrust?: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  headerAction?: { label: string; onPress: () => void };
};

export function AuthScreenLayout({
  title,
  subtitle,
  badge = 'PATIENT APP',
  children,
  showBack = true,
  onBack,
  headerGraphic,
  showBrand = true,
  kicker,
}: AuthScreenLayoutProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const portalLabel = (kicker || badge).toUpperCase();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { s, pagePad, logoWidth, logoHeight, isCompact } = authLayout;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 460,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, slideAnim]);

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Slightly taller header for brand presence
  const headerPadTop = insets.top + (isCompact ? 12 : 16);
  const headerPadBottom = isCompact ? 20 : 26;

  return (
    <View style={styles.root}>
      <AuthGradientHeader
        style={[
          styles.header,
          {
            paddingTop: headerPadTop,
            paddingBottom: headerPadBottom,
            borderBottomLeftRadius: HEADER_RADIUS,
            borderBottomRightRadius: HEADER_RADIUS,
          },
        ]}>
        <View style={[styles.headerInner, { paddingHorizontal: pagePad }]}>
          {showBack ? (
            <View style={styles.headerTopRow}>
              <StackBackButton onPress={handleBack} light />
            </View>
          ) : null}

          {showBrand ? (
            <Animated.View
              style={[
                styles.brandBlock,
                {
                  gap: s(12),
                  marginTop: showBack ? 0 : s(6),
                  opacity: fadeAnim,
                  transform: [
                    {
                      translateY: fadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [6, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <View
                style={[
                  styles.logoCard,
                  {
                    paddingHorizontal: s(20),
                    paddingVertical: s(12),
                  },
                ]}>
                <Image
                  source={wordmark}
                  style={{ width: logoWidth, height: logoHeight }}
                  resizeMode="contain"
                  accessibilityLabel="Medzoos"
                />
              </View>
              <Text style={[styles.portalBadgeText, { fontSize: s(11) }]}>
                {portalLabel}
              </Text>
            </Animated.View>
          ) : null}
        </View>
      </AuthGradientHeader>

      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: pagePad,
            paddingTop: s(isCompact ? 16 : 18),
            paddingBottom: Math.max(insets.bottom, 16) + s(24),
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={56}>
        <Animated.View
          style={[
            styles.content,
            {
              paddingHorizontal: s(18),
              paddingTop: s(22),
              paddingBottom: s(18),
              opacity: slideAnim,
              transform: [
                {
                  translateY: slideAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [14, 0],
                  }),
                },
              ],
            },
          ]}>
          <View
            style={[
              styles.headerTextWrap,
              { marginBottom: s(22), gap: s(5) },
            ]}>
            {headerGraphic}
            <Text
              style={[
                styles.title,
                {
                  fontSize: s(isCompact ? 22 : 24),
                  lineHeight: s(isCompact ? 28 : 30),
                  letterSpacing: -0.55,
                },
              ]}
              numberOfLines={2}>
              {title}
            </Text>
            {subtitle ? (
              <Text
                style={[
                  styles.subtitle,
                  {
                    fontSize: s(13),
                    lineHeight: s(19),
                    marginTop: s(1),
                  },
                ]}>
                {subtitle}
              </Text>
            ) : null}
          </View>

          <View style={[styles.formContainer, { gap: s(15) }]}>{children}</View>
        </Animated.View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: authUi.bg,
  },
  flex: {
    flex: 1,
  },
  header: {
    width: '100%',
    zIndex: 1,
  },
  headerInner: {
    width: '100%',
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 36,
    marginBottom: 2,
  },
  brandBlock: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 4,
    gap: 8,
  },
  logoCard: {
    backgroundColor: authUi.white,
    borderRadius: 18,
    ...Platform.select({
      ios: {
        shadowColor: '#003E42',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.16,
        shadowRadius: 12,
      },
      android: { elevation: 5 },
    }),
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalBadgeText: {
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
    letterSpacing: 1.7,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    width: '100%',
    backgroundColor: authUi.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: authUi.inputBorder,
    ...Platform.select({
      ios: {
        shadowColor: authUi.ink,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 2 },
    }),
  },
  headerTextWrap: {
    alignItems: 'flex-start',
    width: '100%',
  },
  title: {
    fontWeight: Platform.OS === 'ios' ? '700' : '700',
    color: authUi.ink,
    ...(Platform.OS === 'android' ? { includeFontPadding: false } : null),
  },
  subtitle: {
    fontWeight: '400',
    color: authUi.muted,
    letterSpacing: 0.15,
  },
  formContainer: {
    width: '100%',
  },
});
