import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React, { ReactNode } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useSafeAreaInsets } from 'react-native-safe-area-context';


type AuthScreenLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  showBack?: boolean;
  onBack?: () => void;
};

export function AuthScreenLayout({
  title,
  subtitle,
  children,
  showBack = true,
  onBack,
}: AuthScreenLayoutProps) {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

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
    <ScreenLayout
      headerMode="stack"
      title={title}
      showSearch={false}
      showCart={false}
      showBack={showBack}
      onBackPress={handleBack}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View style={styles.brandBanner}>
            <View style={styles.brandIcon}>
              <Icon name="medical-bag" size={24} color={colors.brandPrimary} />
            </View>
            <Text style={styles.brandTitle}>Medzoos</Text>
            <Text style={styles.brandSub}>
              Your trusted healthcare partner
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>{title}</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
            {children}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: spacing.lg,
  },
  brandBanner: {
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingVertical: spacing.lg,
  },
  brandIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  brandSub: {
    fontSize: 13,
    color: colors.neutral500,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.xl,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.inkHeadline,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.neutral500,
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
});