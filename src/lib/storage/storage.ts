import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  SETTINGS: '@mmritual/settings',
  USER_PRODUCTS: '@mmritual/user_products',
  ROUTINES: '@mmritual/routines',
  ROUTINE_ITEMS: '@mmritual/routine_items',
  USAGE_LOGS: '@mmritual/usage_logs',
  REFLECTIONS: '@mmritual/reflections',
  ONBOARDING: '@mmritual/onboarding',
  DEMO_LOADED: '@mmritual/demo_loaded',
};

async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`[Storage] setItem ${key} failed`, e);
  }
}

async function removeItem(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch {}
}

async function clearAll(): Promise<void> {
  try {
    const allKeys = Object.values(KEYS);
    for (const key of allKeys) {
      await AsyncStorage.removeItem(key);
    }
  } catch {}
}

export const storage = {
  KEYS,
  getItem,
  setItem,
  removeItem,
  clearAll,
};
