import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import {
  navigateToDrawerScreen,
  navigateToHospitalDetail,
  navigateToHospitalsList,
  navigateToPharmaciesList,
  navigateToPharmacyDetail,
  navigateToServices,
  navigateToTabScreen,
} from '../../../lib/auth/navigation';
import type {
  DrawerParamList,
  DoctorsStackParamList,
  HomeStackParamList,
  MainTabParamList,
} from '../../../navigation/types';

export type HomeDashboardNav = CompositeNavigationProp<
  NativeStackNavigationProp<HomeStackParamList, 'Dashboard'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<MainTabParamList>,
    import('@react-navigation/native').NavigationProp<DrawerParamList>
  >
>;

type ServiceScreen = keyof Pick<
  DoctorsStackParamList,
  | 'DoctorsList'
  | 'LabTestsList'
  | 'LabsList'
  | 'HospitalsList'
  | 'HealthPackages'
  | 'Specialties'
>;

export function useHomeNavigation() {
  const navigation = useNavigation<HomeDashboardNav>();

  const goToServicesScreen = useCallback(
    (screen: ServiceScreen, params?: object) => {
      navigation.navigate('Services', { screen, params });
    },
    [navigation],
  );

  const goToHealth = useCallback(
    (screen: string, params?: object) => {
      navigateToTabScreen(navigation, 'Health', screen, params);
    },
    [navigation],
  );

  const goToDrawer = useCallback(
    (screen: keyof DrawerParamList) => {
      navigateToDrawerScreen(navigation, screen);
    },
    [navigation],
  );

  const goToCopilot = useCallback(
    (initialPrompt?: string) => {
      navigation.getParent()?.navigate('Copilot', {
        screen: 'CopilotHome',
        params: initialPrompt ? { initialPrompt } : undefined,
      });
    },
    [navigation],
  );

  const goToOrders = useCallback(() => {
    navigateToTabScreen(navigation, 'You', 'OrdersList');
  }, [navigation]);

  const goToAppointments = useCallback(() => {
    navigateToTabScreen(navigation, 'You', 'Appointments');
  }, [navigation]);

  const goToNotifications = useCallback(() => {
    navigateToTabScreen(navigation, 'You', 'Notifications');
  }, [navigation]);

  const goToServicesHub = useCallback(() => {
    navigation.navigate('ServicesHub');
  }, [navigation]);

  const goToPharmacies = useCallback(() => {
    navigateToPharmaciesList(navigation);
  }, [navigation]);

  const goToPharmacyDetail = useCallback(
    (params: { vendorId: string; slug?: string; name?: string }) => {
      navigateToPharmacyDetail(navigation, params);
    },
    [navigation],
  );

  const goToHospitals = useCallback(() => {
    navigateToHospitalsList(navigation);
  }, [navigation]);

  const goToHospitalDetail = useCallback(
    (params: { hospitalId: string; consultType?: 'online' | 'in_person' }) => {
      navigateToHospitalDetail(navigation, params);
    },
    [navigation],
  );

  const goToDoctorProfile = useCallback(
    (doctorId: string, params?: { hospitalId?: string; consultType?: 'online' | 'in_person' }) => {
      navigation.navigate('Services', {
        screen: 'DoctorProfile',
        params: { doctorId, ...params },
      });
    },
    [navigation],
  );

  const goToDoctorBooking = useCallback(
    (
      doctorId: string,
      params?: {
        consultType?: 'online' | 'in_person';
        hospitalId?: string;
      },
    ) => {
      navigation.navigate('Services', {
        screen: 'DoctorBooking',
        params: {
          doctorId,
          consultType: params?.consultType ?? 'online',
          hospitalId: params?.hospitalId,
        },
      });
    },
    [navigation],
  );

  const goToLabTest = useCallback(
    (testId?: string) => {
      if (testId) {
        navigation.navigate('Services', {
          screen: 'LabTestBooking',
          params: { testId },
        });
      } else {
        goToServicesScreen('LabTestsList');
      }
    },
    [navigation, goToServicesScreen],
  );

  return {
    navigation,
    goToServicesScreen,
    goToHealth,
    goToDrawer,
    goToCopilot,
    goToOrders,
    goToAppointments,
    goToNotifications,
    goToServicesHub,
    goToPharmacies,
    goToPharmacyDetail,
    goToHospitals,
    goToHospitalDetail,
    goToDoctorProfile,
    goToDoctorBooking,
    goToLabTest,
    navigateToServices: (screen: string, params?: object) =>
      navigateToServices(navigation, screen, params),
  };
}
