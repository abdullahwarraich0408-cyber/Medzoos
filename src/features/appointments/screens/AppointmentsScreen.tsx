import React, { useMemo, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
import { navigateToServices } from '../../../lib/auth/navigation';
import { appointmentsBrand } from '../appointmentsBrand';
import type { YouStackParamList } from '../../../navigation/types';
import { spacing, TAB_BAR_CLEARANCE, radius } from '../../../theme';

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

  const markedKeys = useMemo(() => {
    const keys = new Set<string>();
    appointments.forEach(item => keys.add(item.dayKey));
    return keys;
  }, [appointments]);

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

  const selectedIsToday = selectedDay === todayKey;

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

  const bookDoctor = useCallback(() => {
    navigateToServices(navigation, 'DoctorsList');
  }, [navigation]);

  const dayHeading =
    forSelectedDay.length > 0
      ? selectedIsToday
        ? 'Today’s visits'
        : 'Scheduled visits'
      : appointments.length === 0
        ? 'No appointments yet'
        : selectedIsToday
          ? 'Nothing today'
          : 'No visits this day';

  return (
    <ScreenLayout
      headerMode="stack"
      title="Appointments"
      showSearch={false}
      showCart={false}
      backgroundColor={appointmentsBrand.page}
      onBackPress={() => {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('YouHome');
      }}>
      <View style={styles.root}>
        <DayCalendarStrip
          selectedKey={selectedDay}
          onSelect={onSelectDay}
          markedKeys={markedKeys}
        />

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
            <ActivityIndicator
              color={appointmentsBrand.accent}
              style={styles.loader}
            />
          ) : (
            <>
              <View style={styles.sectionHead}>
                <View style={styles.sectionTitleRow}>
                  <Text style={styles.sectionLabel}>{dayHeading}</Text>
                  {forSelectedDay.length > 0 ? (
                    <View style={styles.countPill}>
                      <Text style={styles.countPillText}>
                        {forSelectedDay.length}
                      </Text>
                    </View>
                  ) : null}
                </View>
                {forSelectedDay.length > 0 ? (
                  <Text style={styles.hint}>
                    Tap to track · calendar for visit · chat to message
                  </Text>
                ) : null}
              </View>

              {forSelectedDay.length > 0 ? (
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
              ) : (
                <View style={styles.emptyCard}>
                  <View style={styles.emptyIcon}>
                    <Icon
                      name={
                        appointments.length === 0
                          ? 'calendar-blank-outline'
                          : 'calendar-remove'
                      }
                      size={28}
                      color={appointmentsBrand.accent}
                    />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {appointments.length === 0
                      ? 'Book your first visit'
                      : 'Free day'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {appointments.length === 0
                      ? 'Find a doctor and schedule a clinic or video appointment.'
                      : 'No visits on this date. Pick another day or book a new one.'}
                  </Text>
                  {appointments.length === 0 ? (
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={bookDoctor}>
                      <Text style={styles.primaryBtnText}>Find a doctor</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              )}

              <View style={[styles.sectionHead, styles.sectionGap]}>
                <Text style={styles.sectionLabel}>Your doctors</Text>
                <Text style={styles.hint}>
                  Recent specialists you’ve visited
                </Text>
              </View>

              {savedDoctors.length === 0 ? (
                <View style={styles.emptyDoctors}>
                  <Icon
                    name="account-heart-outline"
                    size={22}
                    color={appointmentsBrand.muted}
                  />
                  <Text style={styles.emptyDoctorsText}>
                    Doctors from your visits will appear here
                  </Text>
                </View>
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
  root: {
    flex: 1,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  scroll: { flex: 1 },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xs,
    gap: spacing.md,
  },
  sectionHead: { gap: 4 },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: appointmentsBrand.ink,
  },
  countPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    backgroundColor: appointmentsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: appointmentsBrand.accent,
  },
  hint: {
    fontSize: 12,
    color: appointmentsBrand.muted,
    lineHeight: 17,
  },
  sectionGap: { marginTop: spacing.md },
  list: { gap: spacing.md },
  loader: { marginTop: spacing.xxl },
  emptyCard: {
    backgroundColor: appointmentsBrand.card,
    borderRadius: radius.xxl,
    borderWidth: 1,
    borderColor: appointmentsBrand.border,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: appointmentsBrand.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    marginTop: spacing.md,
    fontSize: 16,
    fontWeight: '700',
    color: appointmentsBrand.ink,
    textAlign: 'center',
  },
  emptySubtitle: {
    marginTop: spacing.sm,
    fontSize: 13,
    lineHeight: 19,
    color: appointmentsBrand.muted,
    textAlign: 'center',
  },
  primaryBtn: {
    marginTop: spacing.lg,
    backgroundColor: appointmentsBrand.accent,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.pill,
  },
  primaryBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: appointmentsBrand.onAccent,
  },
  emptyDoctors: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: appointmentsBrand.soft,
    borderRadius: radius.xl,
    padding: spacing.md,
  },
  emptyDoctorsText: {
    flex: 1,
    fontSize: 13,
    color: appointmentsBrand.muted,
    lineHeight: 18,
  },
});
