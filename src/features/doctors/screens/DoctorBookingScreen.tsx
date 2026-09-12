import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDoctor } from '../../../lib/hooks/useApi';
import { navigateToTabScreen } from '../../../lib/auth/navigation';
import type {
  DoctorsStackParamList,
  HospitalsStackParamList,
} from '../../../navigation/types';
import { spacing } from '../../../theme';
import { getStackHeaderPaddingTop } from '../../../theme/layout';
import { stackScreenTitleStyle } from '../../../theme/appBrand';
import { StackBackButton } from '../../../components/navigation/StackBackButton';
import { AppointmentFlow } from '../components/AppointmentFlow';
import { bookingUi, useBookingLayout } from '../utils/bookingUi';

type BookingRoute = RouteProp<
  DoctorsStackParamList | HospitalsStackParamList,
  'DoctorBooking'
>;

export function DoctorBookingScreen() {
  const insets = useSafeAreaInsets();
  const layout = useBookingLayout();
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
    <View style={styles.root}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={bookingUi.gradientTop}
      />
      <View pointerEvents="none" style={styles.gradientWash}>
        <View
          style={[styles.gradientStop, { backgroundColor: bookingUi.gradientTop }]}
        />
        <View
          style={[styles.gradientStop, { backgroundColor: bookingUi.gradientMid }]}
        />
        <View
          style={[
            styles.gradientStop,
            { backgroundColor: bookingUi.gradientBottom, flex: 1.4 },
          ]}
        />
      </View>

      <View
        style={[
          styles.topNav,
          {
            paddingTop: getStackHeaderPaddingTop(insets.top),
            paddingHorizontal: layout.pad,
          },
        ]}>
        <View
          style={[styles.topNavInner, { maxWidth: layout.contentMaxWidth }]}>
          <StackBackButton
            onPress={() => {
              if (navigation.canGoBack()) {
                navigation.goBack();
              }
            }}
          />
          <Text style={styles.topTitle} numberOfLines={1}>
            Booking
          </Text>
          <Pressable
            style={({ pressed }) => [
              styles.navBtn,
              {
                width: layout.navBtn,
                height: layout.navBtn,
                borderRadius: layout.navBtn / 2,
              },
              pressed && styles.pressed,
            ]}
            onPress={() =>
              navigateToTabScreen(navigation as never, 'You', 'Notifications')
            }
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            hitSlop={12}>
            <Icon name="bell-outline" size={22} color={bookingUi.ink} />
          </Pressable>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={bookingUi.accent} />
          <Text style={styles.loadingText}>Loading doctor details...</Text>
        </View>
      ) : isError || !doctor ? (
        <View style={styles.center}>
          <Icon name="alert-circle-outline" size={48} color={bookingUi.muted} />
          <Text style={styles.errorTitle}>Could not load doctor</Text>
          <Text style={styles.errorSub}>
            {error instanceof Error ? error.message : 'Please try again.'}
          </Text>
          <Pressable
            style={styles.retryBtn}
            onPress={() => navigation.goBack()}
            hitSlop={8}>
            <Text style={styles.retryText}>Go back</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingHorizontal: layout.pad,
              paddingBottom: Math.max(insets.bottom, spacing.xl) + 28,
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View
            style={[
              styles.contentColumn,
              { maxWidth: layout.contentMaxWidth },
            ]}>
            <AppointmentFlow
              doctor={doctor}
              initialConsultType={consultType}
              practiceLocationId={practiceLocationId}
              hospitalId={hospitalId}
            />
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: bookingUi.gradientTop,
  },
  gradientWash: {
    ...StyleSheet.absoluteFill,
    zIndex: 0,
  },
  gradientStop: {
    flex: 1,
  },
  topNav: {
    zIndex: 20,
    elevation: 20,
    paddingBottom: 4,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  topNavInner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topTitle: {
    flex: 1,
    ...stackScreenTitleStyle,
    paddingHorizontal: spacing.sm,
  },
  navBtn: {
    backgroundColor: bookingUi.white,
    borderWidth: 1,
    borderColor: 'rgba(23,97,142,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 21,
    elevation: 8,
  },
  pressed: {
    opacity: 0.88,
  },
  scroll: {
    flex: 1,
    zIndex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    paddingTop: 4,
    flexGrow: 1,
    alignItems: 'center',
  },
  contentColumn: {
    width: '100%',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
    zIndex: 1,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 14,
    color: bookingUi.muted,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: bookingUi.ink,
    marginTop: spacing.lg,
  },
  errorSub: {
    fontSize: 14,
    color: bookingUi.muted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryBtn: {
    marginTop: spacing.lg,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: bookingUi.accent,
  },
  retryText: {
    fontSize: 14,
    fontWeight: '600',
    color: bookingUi.white,
  },
});
