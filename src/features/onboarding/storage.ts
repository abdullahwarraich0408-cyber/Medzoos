import AsyncStorage from '@react-native-async-storage/async-storage';

const ONBOARDING_KEY = 'medzoos_onboarding_complete_v2';

export async function hasCompletedOnboarding(): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    return value === 'true';
  } catch {
    return false;
  }
}

export async function setOnboardingComplete(): Promise<void> {
  await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
}
