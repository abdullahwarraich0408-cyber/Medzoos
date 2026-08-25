import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { authUi } from '../authUi';

const wordmark = require('../../../assets/branding/splash-wordmark.png');

type AuthScreenLayoutProps = {
  title: string;
  subtitle?: string;
  /** Portal pill — defaults to PATIENT APP (doctor app uses DOCTOR PANEL). */
  badge?: string;
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  headerGraphic?: ReactNode;
  showBrand?: boolean;
  /** Compatibility aliases from older call sites */
  kicker?: string;
  compact?: boolean;
  showTrust?: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
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
      <StatusBar barStyle="light-content" backgroundColor={authUi.bg} translucent />
      <KeyboardAwareScrollView
        style={styles.flex}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: insets.top + 24,
            paddingBottom: Math.max(insets.bottom, 24) + 180,
          },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        extraScrollHeight={40}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            style={styles.backBtn}
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="arrow-left" size={20} color={authUi.white} />
          </TouchableOpacity>
        ) : (
          <View style={styles.backSpacer} />
        )}

        {showBrand ? (
          <View style={styles.logoContainer}>
            <View style={styles.logoGlow} />
            <View style={styles.logoCard}>
              <Image
                source={wordmark}
                style={styles.logoImage}
                resizeMode="contain"
                accessibilityLabel="Medzoos"
              />
            </View>
            <View style={styles.portalBadge}>
              <Text style={styles.portalBadgeText}>{portalLabel}</Text>
            </View>
          </View>
        ) : null}

        <View style={styles.headerTextWrap}>
          {headerGraphic}
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>

        <View style={styles.formContainer}>{children}</View>
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
  scrollContent: {
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  backBtn: {
    alignSelf: 'flex-start',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(22,169,224,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(22,169,224,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  backSpacer: {
    height: 8,
    alignSelf: 'stretch',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  logoGlow: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(22, 169, 224, 0.15)',
  },
  logoCard: {
    backgroundColor: authUi.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(22, 169, 224, 0.4)',
    shadowColor: authUi.accent,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 150,
    height: 38,
  },
  portalBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(22, 169, 224, 0.18)',
    borderWidth: 1,
    borderColor: 'rgba(22, 169, 224, 0.35)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  portalBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: authUi.accent,
    letterSpacing: 1.2,
  },
  headerTextWrap: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 6,
    width: '100%',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: authUi.white,
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: authUi.muted,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 290,
  },
  formContainer: {
    width: '100%',
    gap: 10,
  },
});
