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
import { labTestsBrand } from '../labTestsBrand';
import { spacing, radius } from '../../../theme';

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
    <ScreenLayout
      headerMode="stack"
      title="Book Lab Test"
      showSearch={false}
      backgroundColor={labTestsBrand.page}>
      {isLoading && !test ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={labTestsBrand.accent} />
          <Text style={styles.loadingText}>Loading lab test…</Text>
        </View>
      ) : !test ? (
        <View style={styles.center}>
          <View style={styles.emptyIcon}>
            <Icon
              name="flask-empty-outline"
              size={28}
              color={labTestsBrand.accent}
            />
          </View>
          <Text style={styles.errorTitle}>Lab test not found</Text>
          <Text style={styles.errorSub}>
            This package may no longer be available.
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}>
            <Text style={styles.retryText}>Browse tests</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(insets.bottom, spacing.xl) + 8 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View style={styles.summaryCard}>
            <View style={styles.summaryTop}>
              <View style={styles.iconWrap}>
                <Icon
                  name="flask-outline"
                  size={22}
                  color={labTestsBrand.accent}
                />
              </View>
              <View style={styles.summaryCopy}>
                <View style={styles.titleRow}>
                  <Text style={styles.testName} numberOfLines={2}>
                    {test.name}
                  </Text>
                  {test.discount ? (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>{test.discount}</Text>
                    </View>
                  ) : null}
                </View>
                <Text style={styles.labName} numberOfLines={1}>
                  {test.lab}
                </Text>
              </View>
            </View>

            {test.description ? (
              <Text style={styles.description} numberOfLines={2}>
                {test.description}
              </Text>
            ) : null}

            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <Icon
                  name="clock-outline"
                  size={13}
                  color={labTestsBrand.accent}
                />
                <View style={styles.metaCopy}>
                  <Text style={styles.metaLabel}>Collection</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>
                    {test.collectionTime || 'Same day'}
                  </Text>
                </View>
              </View>
              <View style={styles.metaChip}>
                <Icon
                  name="file-document-outline"
                  size={13}
                  color={labTestsBrand.accent}
                />
                <View style={styles.metaCopy}>
                  <Text style={styles.metaLabel}>Report</Text>
                  <Text style={styles.metaValue} numberOfLines={1}>
                    {test.reportTime || '24 hours'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.priceRow}>
              <View>
                <Text style={styles.price}>
                  PKR {test.price.toLocaleString()}
                </Text>
                <Text style={styles.testsIncluded}>
                  {test.testsIncluded} parameters included
                </Text>
              </View>
              {test.homeCollection ? (
                <View style={styles.homePill}>
                  <Icon
                    name="home-outline"
                    size={13}
                    color={labTestsBrand.onAccent}
                  />
                  <Text style={styles.homePillText}>Home pickup</Text>
                </View>
              ) : null}
            </View>
          </View>

          <View style={styles.flowCard}>
            <LabBookingFlow test={test} />
          </View>
        </ScrollView>
      )}
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: labTestsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  loadingText: {
    marginTop: spacing.sm,
    fontSize: 14,
    fontWeight: '500',
    color: labTestsBrand.muted,
  },
  errorTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: labTestsBrand.ink,
  },
  errorSub: {
    fontSize: 13,
    color: labTestsBrand.muted,
    textAlign: 'center',
  },
  retryBtn: {
    marginTop: spacing.md,
    paddingHorizontal: spacing.xl,
    paddingVertical: 12,
    borderRadius: radius.pill,
    backgroundColor: labTestsBrand.accent,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '700',
    color: labTestsBrand.onAccent,
  },

  summaryCard: {
    backgroundColor: labTestsBrand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    padding: spacing.md,
    gap: spacing.sm + 2,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm + 2,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: labTestsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  testName: {
    flex: 1,
    minWidth: 0,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.25,
    lineHeight: 22,
    color: labTestsBrand.ink,
  },
  discountBadge: {
    backgroundColor: labTestsBrand.accent,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
  },
  discountText: {
    fontSize: 10,
    fontWeight: '800',
    color: labTestsBrand.onAccent,
  },
  labName: {
    fontSize: 13,
    fontWeight: '600',
    color: labTestsBrand.muted,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    color: labTestsBrand.muted,
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  metaChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: labTestsBrand.page,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    paddingHorizontal: 10,
    paddingVertical: 10,
    minWidth: 0,
  },
  metaCopy: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: labTestsBrand.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: 12,
    fontWeight: '700',
    color: labTestsBrand.ink,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: 4,
  },
  price: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    color: labTestsBrand.accent,
  },
  testsIncluded: {
    fontSize: 12,
    fontWeight: '500',
    color: labTestsBrand.muted,
    marginTop: 2,
  },
  homePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: labTestsBrand.accent,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
  homePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: labTestsBrand.onAccent,
  },

  flowCard: {
    backgroundColor: labTestsBrand.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: labTestsBrand.border,
    padding: spacing.md,
  },
});
