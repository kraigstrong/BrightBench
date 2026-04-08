import AsyncStorage from '@react-native-async-storage/async-storage';

import { AppSnapshot } from '@/features/game/types';

const APP_STORAGE_KEY = 'fraction-finder::snapshot';

export async function loadSnapshot() {
  const raw = await AsyncStorage.getItem(APP_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AppSnapshot) : null;
}

export async function saveSnapshot(snapshot: AppSnapshot) {
  await AsyncStorage.setItem(APP_STORAGE_KEY, JSON.stringify(snapshot));
}
