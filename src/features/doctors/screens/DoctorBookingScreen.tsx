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
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import { useDoctor } from '../../../lib/hooks/useApi';
import type { DoctorsStackParamList, HospitalsStackParamList } from '../../../navigation/types';
import { colors, spacing, radius } from '../../../theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AppointmentFlow } from '../components/AppointmentFlow';

type BookingRoute = RouteProp<
  DoctorsStackParamList | HospitalsStackParamList,
  'DoctorBooking'
>;

export function DoctorBookingScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<
        DoctorsStackParamList | HospitalsStackParamList,
        'DoctorBooking'
      >
    >();
  const route = useRoute<BookingRoute>();
  const { doctorId, consultType, practiceLocationId, hospitalId } =
    route.params;

  const { data: doctor, isLoading, isError, error } = useDoctor(doctorId);

  return (
    <ScreenLayout headerMode="stack" title="Book Appointment" showSearch={false}>
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.brandPrimary} />
          <Text style={styles.loadingText}>Loading doctor details...</Text>
        </View>
      ) : isError || !doctor ? (
        <View style={styles.center}>
          <Icon name="alert-circle-outline" size={48} color={colors.neutral300} />
          <Text style={styles.errorTitle}>Could not load doctor</Text>
          <Text style={styles.errorSub}>
            {error instanceof Error ? error.message : 'Please try again.'}
          </Text>
          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => navigation.goBack()}>
            <Text style={styles.retryText}>Go back</Text>
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
          <AppointmentFlow
            doctor={doctor}
            initialConsultType={consultType}
            practiceLocationId={practiceLocationId}
            hospitalId={hospitalId}
          />
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
  headerSpacer: {
    width: 40,
  },
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: spacing.lg,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    backgroundColor: 'transparent',
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
  errorSub: {
    fontSize: 14,
    color: colors.neutral500,
    textAlign: 'center',
    marginTop: spacing.sm,
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
});
