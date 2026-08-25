import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScreenLayout } from '../../../components/layout/ScreenLayout';
import {
  AppointmentCard,
  mapOrderToAppointmentCard,
  type AppointmentCardModel,
} from '../components/AppointmentCard';
import {
  DayCalendarStrip,
  type DayItem,
} from '../components/DayCalendarStrip';
import { CompactDoctorRow } from '../components/CompactDoctorRow';
import { localDayKey } from '../data/localDay';
import { useAllOrders } from '../../../lib/hooks/useApi';
import type { YouStackParamList } from '../../../navigation/types';
import { colors, spacing, TAB_BAR_CLEARANCE } from '../../../theme';

type AppointmentListItem = AppointmentCardModel & {
  dayKey: string;
  isOnline: boolean;
};

function dayKeyFromSortDate(value?: string) {
  if (!value) return localDayKey();
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return localDayKey();
  return localDayKey(date);
}

export function AppointmentsScreen() {
  const insets = useSafeAreaInsets();
  const navigation =
    useNavigation<NativeStackNavigationProp<YouStackParamList>>();
  const todayKey = useMemo(() => localDayKey(), []);
  const [selectedDay, setSelectedDay] = useState(todayKey);
  const { data: allOrders = [], isLoading } = useAllOrders();

  const appointments = useMemo((): AppointmentListItem[] => {
    return allOrders
      .filter(order => order.type === 'doctor')
      .map(order => ({
        ...mapOrderToAppointmentCard(order),
        dayKey: dayKeyFromSortDate(order.sortDate || order.date),
        isOnline: Boolean(order.isOnline),
      }));
  }, [allOrders]);

  const forSelectedDay = useMemo(
    () => appointments.filter(item => item.dayKey === selectedDay),
    [appointments, selectedDay],
  );

  const savedDoctors = useMemo(() => {
    const seen = new Set<string>();
    return appointments.filter(item => {
      const key = item.doctorName.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [appointments]);

  const onSelectDay = useCallback((day: DayItem) => {
    setSelectedDay(day.key);
  }, []);

  const openTrack = useCallback(
    (item: AppointmentCardModel) => {
      navigation.navigate('AppointmentDetail', {
        appointmentId: item.sourceId,
      });
    },
    [navigation],
  );

  const openChat = useCallback(
    (item: AppointmentCardModel) => {
      navigation.navigate('AppointmentChat', {
        appointmentId: item.sourceId,
        doctorName: item.doctorName,
      });
    },
    [navigation],
  );

  const openVideo = useCallback(
    (item: AppointmentListItem) => {
      if (!item.isOnline) {
        openTrack(item);
        return;
      }
      navigation.navigate('AppointmentVideo', {
        appointmentId: item.sourceId,
        doctorName: item.doctorName,
        doctorImage: item.image,
        slot: item.slot,
      });
    },
    [navigation, openTrack],
  );

  return (
    <ScreenLayout
      headerMode="stack"
      title="Appointments"
      showSearch={false}
      showCart={false}
      onBackPress={() => {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('YouHome');
      }}>
      <View style={styles.root}>
        <DayCalendarStrip selectedKey={selectedDay} onSelect={onSelectDay} />

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            {
              paddingBottom:
                Math.max(insets.bottom, TAB_BAR_CLEARANCE) + spacing.lg,
            },
          ]}
          showsVerticalScrollIndicator={false}>
          {isLoading && appointments.length === 0 ? (
            <ActivityIndicator color={colors.brandPrimary} style={styles.loader} />
          ) : (
            <>
              <Text style={styles.sectionLabel}>
                {forSelectedDay.length > 0
                  ? 'Scheduled'
                  : appointments.length === 0
                    ? 'No appointments yet'
                    : 'No visits this day'}
              </Text>
              <Text style={styles.hint}>
                Tap card to track · calendar for visit · chat bubble to message
              </Text>
              <View style={styles.list}>
                {forSelectedDay.map(item => (
                  <AppointmentCard
                    key={item.id}
                    item={item}
                    onPress={() => openTrack(item)}
                    onCalendarPress={() => openTrack(item)}
                    onChatPress={() => openChat(item)}
                  />
                ))}
              </View>

              <Text style={[styles.sectionLabel, styles.sectionGap]}>
                Saved doctors
              </Text>
              {savedDoctors.length === 0 ? (
                <Text style={styles.hint}>No saved doctors yet</Text>
              ) : (
                <View style={styles.list}>
                  {savedDoctors.map(item => (
                    <CompactDoctorRow
                      key={`saved-${item.id}`}
                      item={item}
                      onPress={() => openTrack(item)}
                      onCalendarPress={() => openVideo(item)}
                      onChatPress={() => openChat(item)}
                    />
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: -spacing.sm,
  },
  sectionGap: { marginTop: spacing.lg },
  list: { gap: spacing.lg },
  loader: { marginTop: spacing.xxl },
});
