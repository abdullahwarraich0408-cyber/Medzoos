import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DetectedLocation } from './types';

const PROMPT_KEY = 'medzoos_location_prompt_done';
const LOCATION_KEY = 'medzoos_saved_location';
const LOCATION_DETAIL_KEY = 'medzoos_saved_location_detail';

export const DEFAULT_LOCATION = 'Karachi';

export async function hasSeenLocationPrompt(): Promise<boolean> {
  const value = await AsyncStorage.getItem(PROMPT_KEY);
  return value === 'true';
}

export async function markLocationPromptSeen(): Promise<void> {
  await AsyncStorage.setItem(PROMPT_KEY, 'true');
}

export async function getSavedLocation(): Promise<string | null> {
  return AsyncStorage.getItem(LOCATION_KEY);
}

export async function getSavedLocationDetail(): Promise<DetectedLocation | null> {
  const raw = await AsyncStorage.getItem(LOCATION_DETAIL_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as DetectedLocation;
  } catch {
    return null;
  }
}

export async function saveLocation(location: DetectedLocation): Promise<void> {
  await AsyncStorage.multiSet([
    [LOCATION_KEY, location.label || location.city],
    [LOCATION_DETAIL_KEY, JSON.stringify(location)],
  ]);
}
