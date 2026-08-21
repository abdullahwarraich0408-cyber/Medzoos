import { colors, spacing } from '../../../theme';
import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ImageBackground,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const authVisual = require('../../../assets/branding/auth-medzoos-healthcare.jpg');
const wordmark = require('../../../assets/branding/splash-wordmark.png');

const SCREEN_H = Dimensions.get('window').height;
const HERO_TALL = Math.min(Math.round(SCREEN_H * 0.34), 292);
const HERO_COMPACT = Math.min(Math.round(SCREEN_H * 0.22), 188);

type AuthScreenLayoutProps = {
  title: string;
  subtitle?: string;
  kicker?: string;
  heroTitle?: string;
  heroSubtitle?: string;
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  compact?: boolean;
  showTrust?: boolean;
};

export function AuthScreenLayout({
  title,
  subtitle,
  kicker,
  heroTitle = 'Care that stays with you.',
  heroSubtitle = 'Medicines, doctors and lab tests — in one trusted place.',
  children,
  showBack = true,
  onBack,
  compact = false,
  showTrust = true,
}: AuthScreenLayoutProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const heroHeight = (compact ? HERO_COMPACT : HERO_TALL) + insets.top;

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0A6B86" translucent />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.hero, { height: heroHeight }]}>
          <ImageBackground
            source={authVisual}
            style={styles.heroImageWrap}
            imageStyle={styles.heroImage}
            accessibilityIgnoresInvertColors>
            <View style={styles.heroWash} pointerEvents="none" />
            <View style={styles.heroFade} pointerEvents="none" />
            <View
              style={[
                styles.heroInner,
                { paddingTop: Math.max(insets.top, 12) + 6 },
              ]}>
              <View style={styles.heroTopRow}>
                {showBack ? (
                  <TouchableOpacity
                    onPress={handleBack}
                    style={styles.backCircle}
                    accessibilityRole="button"
                    accessibilityLabel="Back"
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Icon name="arrow-left" size={20} color="#FFFFFF" />
                  </TouchableOpacity>
                ) : (
                  <View style={styles.backCircleSpacer} />
                )}
                <View style={styles.wordmarkPill}>
                  <Image
                    source={wordmark}
                    style={styles.wordmark}
                    resizeMode="contain"
                    accessibilityLabel="Medzoos"
                  />
                </View>
              </View>
              {compact ? null : (
                <View style={styles.heroCopy}>
                  <Text style={styles.heroEyebrow}>Medzoos care</Text>
                  <Text style={styles.heroTitle}>{heroTitle}</Text>
                  <Text style={styles.heroSubtitle}>{heroSubtitle}</Text>
                </View>
              )}
            </View>
          </ImageBackground>
        </View>

        <View style={styles.sheet}>
          <ScrollView
            style={styles.formScroll}
            contentContainerStyle={[
              styles.form,
              { paddingBottom: Math.max(insets.bottom, 20) + 16 },
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            showsVerticalScrollIndicator={false}>
            {kicker ? <Text style={styles.kicker}>{kicker}</Text> : null}
            <Text style={styles.title}>{title}</Text>
            {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            {children}
            {showTrust ? (
              <View style={styles.trust}>
                <View style={styles.trustIcon}>
                  <Icon name="shield-lock-outline" size={16} color={colors.brandPrimary} />
                </View>
                <Text style={styles.trustText}>
                  Encrypted access. Your health details stay private.
                </Text>
              </View>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
  },
  hero: {
    backgroundColor: '#0A6B86',
  },
  heroImageWrap: {
    flex: 1,
  },
  heroImage: {
    opacity: 0.5,
  },
  heroWash: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(8, 90, 110, 0.48)',
  },
  heroFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 72,
    backgroundColor: 'rgba(8, 90, 110, 0.28)',
  },
  heroInner: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 36,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backCircleSpacer: {
    width: 0,
  },
  wordmarkPill: {
    backgroundColor: colors.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  wordmark: {
    width: 148,
    height: 30,
  },
  heroCopy: {
    paddingBottom: 8,
    maxWidth: 320,
  },
  heroEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.78)',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -0.4,
    lineHeight: 30,
  },
  heroSubtitle: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 19,
    color: 'rgba(255,255,255,0.84)',
  },
  sheet: {
    flex: 1,
    marginTop: -28,
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  formScroll: {
    flex: 1,
  },
  form: {
    paddingHorizontal: 22,
    paddingTop: 24,
    flexGrow: 1,
  },
  kicker: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.brandPrimary,
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.inkHeadline,
    marginBottom: 6,
    letterSpacing: -0.4,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral600,
    marginBottom: 22,
    lineHeight: 21,
  },
  trust: {
    marginTop: 'auto',
    paddingTop: spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  trustIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.brandMist,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 17,
    color: colors.neutral600,
  },
});
