import { colors, spacing, radius } from '../../../theme';
import { healthOs } from '../../../theme/healthOs';
import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useLabTest } from '../../../lib/hooks/useApi';
import type { LabTestsStackParamList } from '../../../navigation/types';

import { LabBookingFlow } from '../components/LabBookingFlow';

type BookingRoute = RouteProp<LabTestsStackParamList, 'LabTestBooking'>;

export function LabTestBookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<LabTestsStackParamList>>();
  const route = useRoute<BookingRoute>();
  const { testId } = route.params;

  const { data: apiTest, isLoading } = useLabTest(testId);
  const test = apiTest;

  return (
    <ScreenLayout headerMode="stack" title="Book Lab Test" showSearch={false}>
      {isLoading && !test ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandPrimary} />
          <Text style={styles.loadingText}>Loading lab test...</Text>
        </View>
      ) : !test ? (
        <View style={styles.center}>
          <Icon name="flask-empty-outline" size={48} color={colors.neutral300} />
          <Text style={styles.errorTitle}>Lab test not found</Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Browse tests</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, spacing.lg) },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <View style={styles.iconWrap}>
                <Icon name="flask" size={28} color={colors.brandPrimary} />
              </View>
              <View style={styles.infoHeaderText}>
                {test.discount && (
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountText}>{test.discount}</Text>
                  </View>
                )}
                <Text style={styles.testName}>{test.name}</Text>
                <Text style={styles.labName}>{test.lab}</Text>
              </View>
            </View>

            {test.description ? (
              <Text style={styles.description}>{test.description}</Text>
            ) : null}

            <View style={styles.metaRow}>
              <View style={styles.metaBox}>
                <Icon name="clock-outline" size={14} color={colors.neutral500} />
                <Text style={styles.metaLabel}>Collection</Text>
                <Text style={styles.metaValue}>
                  {test.collectionTime || 'Same day'}
                </Text>
              </View>
              <View style={styles.metaBox}>
                <Icon name="file-document-outline" size={14} color={colors.neutral500} />
                <Text style={styles.metaLabel}>Report</Text>
                <Text style={styles.metaValue}>
                  {test.reportTime || '24 hours'}
                </Text>
              </View>
            </View>

            <Text style={styles.price}>PKR {test.price.toLocaleString()}</Text>
            <Text style={styles.testsIncluded}>
              {test.testsIncluded} parameters included
            </Text>

            {test.homeCollection && (
              <View style={styles.homeBanner}>
                <Icon name="home" size={20} color={colors.brandPrimary} />
                <View style={styles.homeBannerText}>
                  <Text style={styles.homeTitle}>
                    Home sample collection included
                  </Text>
                  <Text style={styles.homeSub}>
                    Free phlebotomist visit at your address
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View style={styles.flowCard}>
            <Text style={styles.flowTitle}>Book This Test</Text>
            <LabBookingFlow test={test} />
          </View>
        </ScrollView>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral200,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  headerSpacer: { width: 40 },
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: { padding: spacing.lg, gap: spacing.lg },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: colors.surfaceSubtle,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: colors.neutral500,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginTop: spacing.lg,
  },
  retryBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.brandPrimary,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.white,
  },
  infoCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 14,
    backgroundColor: colors.brandLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoHeaderText: { flex: 1 },
  discountBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.brandPrimary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
    marginBottom: spacing.xs,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.white,
  },
  testName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.inkHeadline,
    lineHeight: 26,
  },
  labName: {
    fontSize: 14,
    color: colors.neutral500,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: colors.neutral600,
    lineHeight: 21,
    marginBottom: spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  metaBox: {
    flex: 1,
    backgroundColor: colors.surfaceSubtle,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: 4,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: colors.neutral500,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.brandPrimary,
    marginBottom: 4,
  },
  testsIncluded: {
    fontSize: 13,
    color: colors.neutral500,
    marginBottom: spacing.md,
  },
  homeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.brandBanner,
    borderRadius: radius.xl,
  },
  homeBannerText: { flex: 1 },
  homeTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.white,
  },
  homeSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  flowCard: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    padding: spacing.lg,
  },
  flowTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.inkHeadline,
    marginBottom: spacing.lg,
  },
});