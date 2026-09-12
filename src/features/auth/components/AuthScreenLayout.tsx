import React, { ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAwareScrollView } from '../../../components/keyboard';
import { StackBackButton } from '../../../components/navigation/StackBackButton';
import { authUi } from '../authUi';

const wordmark = require('../../../assets/branding/splash-wordmark.png');

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
      <StatusBar barStyle="dark-content" backgroundColor={authUi.bg} translucent />
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
          <View style={styles.backWrap}>
            <StackBackButton onPress={handleBack} />
          </View>
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
  backWrap: {
    alignSelf: 'flex-start',
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
    backgroundColor: 'rgba(16, 85, 104, 0.08)',
  },
  logoCard: {
    backgroundColor: authUi.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'rgba(16, 85, 104, 0.22)',
    shadowColor: authUi.ink,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 150,
    height: 38,
  },
  portalBadge: {
    marginTop: 10,
    backgroundColor: 'rgba(16, 85, 104, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(16, 85, 104, 0.18)',
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
    fontSize: 22,
    fontWeight: '800',
    color: authUi.ink,
    letterSpacing: -0.55,
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
