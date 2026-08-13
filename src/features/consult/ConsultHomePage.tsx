import { colors, spacing, radius, shadows, TAB_BAR_CLEARANCE, appIcons, appIconTile } from '../../theme';
import { healthOs } from '../../theme/healthOs';
import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { HealthPackagesPoster } from './components/HealthPackagesPoster';
import type { DoctorsStackParamList } from '../../navigation/types';


type ConsultNav = NativeStackNavigationProp<DoctorsStackParamList>;

const CONSULT_SERVICES = [
  {
    id: 'doctors',
    title: 'Doctors',
    subtitle: 'Browse & book certified doctors',
    icon: 'stethoscope',
    iconColor: appIcons.color,
    iconBg: appIcons.bg,
    screen: 'DoctorsList' as const,
    params: { screenTitle: 'Doctors' },
  },
  {
    id: 'hospitals',
    title: 'Hospitals',
    subtitle: 'Top hospitals & facilities',
    icon: 'hospital-building',
    iconColor: appIcons.color,
    iconBg: appIcons.bg,
    screen: 'HospitalsList' as const,
  },
  {
    id: 'clinics',
    title: 'Clinics',
    subtitle: 'In-clinic appointments near you',
    icon: 'medical-bag',
    iconColor: appIcons.color,
    iconBg: appIcons.bg,
    screen: 'DoctorsList' as const,
    params: {
      consultType: 'in_person' as const,
      screenTitle: 'Clinics',
    },
  },
  {
    id: 'video',
    title: 'Video Consultation',
    subtitle: 'Talk to doctors from home',
    icon: 'video',
    iconColor: appIcons.color,
    iconBg: appIcons.bg,
    screen: 'DoctorsList' as const,
    params: {
      consultType: 'online' as const,
      screenTitle: 'Video Consultation',
      onlineOnly: true,
    },
  },
  {
    id: 'specialties',
    title: 'Specialties',
    subtitle: 'Find doctors by specialty',
    icon: 'shape-outline',
    iconColor: appIcons.color,
    iconBg: appIcons.bg,
    screen: 'Specialties' as const,
  },
  {
    id: 'labs',
    title: 'Lab Tests',
    subtitle: 'Book diagnostic tests & home sampling',
    icon: 'flask-outline',
    iconColor: appIcons.color,
    iconBg: appIcons.bg,
    screen: 'LabTestsList' as const,
  },
];

export function ConsultHomePage() {
  const navigation = useNavigation<ConsultNav>();
  const [carouselActive, setCarouselActive] = useState(true);

  useFocusEffect(
    useCallback(() => {
      setCarouselActive(true);
      return () => setCarouselActive(false);
    }, []),
  );

  return (
    <ScreenLayout title="Consult" showSearch={false} showCart={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <HealthPackagesPoster autoPlay={carouselActive} />

        <View style={styles.grid}>
          {CONSULT_SERVICES.map(item => (
            <Pressable
              key={item.id}
              style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
              onPress={() => {
                if (item.screen === 'DoctorsList' && 'params' in item) {
                  navigation.navigate('DoctorsList', item.params);
                } else {
                  navigation.navigate(item.screen);
                }
              }}>
              <View style={styles.cardIcon}>
                <Icon name={item.icon} size={appIcons.size.xl} color={appIcons.color} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.subtitle}</Text>
              </View>
              <Icon name="chevron-right" size={20} color={colors.neutral500} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: spacing.lg,
  },
  grid: {
    gap: spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: healthOs.cardBorder,
    ...shadows.card,
  },
  cardPressed: {
    opacity: 0.92,
  },
  cardIcon: appIconTile('lg'),
  cardBody: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.inkHeadline,
  },
  cardSub: {
    fontSize: 12,
    color: colors.neutral500,
  },
});