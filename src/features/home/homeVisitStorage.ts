import AsyncStorage from '@react-native-async-storage/async-storage';

const HOME_SEEN_KEY = 'medzoos_home_posters_seen';

export async function hasSeenHomePosters(): Promise<boolean> {
  const value = await AsyncStorage.getItem(HOME_SEEN_KEY);
  return value === 'true';
}

export async function markHomePostersSeen(): Promise<void> {
  await AsyncStorage.setItem(HOME_SEEN_KEY, 'true');
}
