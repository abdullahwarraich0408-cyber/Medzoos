import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ScreenLayout } from '../../components/layout/ScreenLayout';
import { CollapsibleSection, SimpleRow, SimpleSection } from '../../design-system';
import { servicesCopy } from '../../lib/copy/uiMessages';
import { colors, TAB_BAR_CLEARANCE } from '../../theme';
import { calmLayout } from '../../theme/calmLayout';
import { healthOsTypography } from '../../theme/healthOs';
import type { HomeStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<HomeStackParamList, 'ServicesHub'>;

const PRIMARY_CARE = [
  {
    icon: 'stethoscope',
    title: 'Doctors',
    message: 'Book online or in-clinic consultations',
    screen: 'DoctorsList' as const,
  },
  {
    icon: 'flask',
    title: 'Lab tests',
    message: 'Book tests with home sample pickup',
    screen: 'LabTestsList' as const,
  },
];

const MORE_CARE = [
  {
    icon: 'medical-bag',
    title: 'Specialists',
    message: 'Find the right doctor for your condition',
    screen: 'Specialties' as const,
  },
  {
    icon: 'package-variant-closed',
    title: 'Health packages',
    message: 'Preventive checkup bundles',
    screen: 'HealthPackages' as const,
  },
  {
    icon: 'hospital-building',
    title: 'Hospitals',
    message: 'Browse hospitals near you',
    screen: 'HospitalsList' as const,
  },
];

export function ServicesHubScreen() {
  const navigation = useNavigation<Nav>();

  const goToMedicines = () => {
    navigation.getParent()?.getParent()?.navigate('Health', {
      screen: 'MedicinesList',
    });
  };

  return (
    <ScreenLayout title={servicesCopy.title} headerMode="stack" showSearch={false}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <Text style={styles.hint}>{servicesCopy.pageHint}</Text>

        <SimpleSection title="Most booked" />
        <View style={styles.list}>
          {PRIMARY_CARE.map(item => (
            <SimpleRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              message={item.message}
              onPress={() => navigation.navigate('Services', { screen: item.screen })}
            />
          ))}
        </View>

        <SimpleRow
          icon="pill"
          title={servicesCopy.pharmacyTitle}
          message={servicesCopy.pharmacyMessage}
          onPress={goToMedicines}
        />

        <CollapsibleSection title="More care options">
          {MORE_CARE.map(item => (
            <SimpleRow
              key={item.title}
              icon={item.icon}
              title={item.title}
              message={item.message}
              onPress={() => navigation.navigate('Services', { screen: item.screen })}
            />
          ))}
        </CollapsibleSection>
      </ScrollView>
    </ScreenLayout>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: 'transparent' },
  scrollContent: {
    paddingHorizontal: calmLayout.screenPadding,
    paddingBottom: TAB_BAR_CLEARANCE + calmLayout.contentBottom,
    gap: calmLayout.sectionGap,
  },
  hint: { ...healthOsTypography.sectionHint },
  list: { gap: calmLayout.blockGap },
});
