import { storage } from './storage';
import { AppSettings, DEFAULT_SETTINGS } from '../../types/user';
import { UserProduct } from '../../types/product';
import { Routine, RoutineItem, UsageLog, Reflection } from '../../types/routine';
import {
  DEMO_USER_PRODUCTS,
  DEMO_ROUTINES,
  DEMO_ROUTINE_ITEMS,
  DEMO_USAGE_LOGS,
  DEMO_REFLECTIONS,
} from '../../data/demo-routines';

// ─── Settings ────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<AppSettings> {
  const s = await storage.getItem<AppSettings>(storage.KEYS.SETTINGS);
  return { ...DEFAULT_SETTINGS, ...(s ?? {}) };
}

export async function saveSettings(settings: Partial<AppSettings>): Promise<void> {
  const current = await getSettings();
  await storage.setItem(storage.KEYS.SETTINGS, { ...current, ...settings });
}

// ─── Onboarding ───────────────────────────────────────────────────────────────

export async function isOnboardingComplete(): Promise<boolean> {
  const s = await getSettings();
  return s.onboardingCompleted;
}

export async function completeOnboarding(categories: string[]): Promise<void> {
  await saveSettings({ onboardingCompleted: true, selectedCategories: categories });
}

// ─── User Products ────────────────────────────────────────────────────────────

export async function getUserProducts(): Promise<UserProduct[]> {
  return (await storage.getItem<UserProduct[]>(storage.KEYS.USER_PRODUCTS)) ?? [];
}

export async function addUserProduct(product: UserProduct): Promise<void> {
  const existing = await getUserProducts();
  if (existing.find((p) => p.productId === product.productId)) return;
  await storage.setItem(storage.KEYS.USER_PRODUCTS, [...existing, product]);
}

export async function removeUserProduct(userProductId: string): Promise<void> {
  const existing = await getUserProducts();
  await storage.setItem(
    storage.KEYS.USER_PRODUCTS,
    existing.filter((p) => p.id !== userProductId)
  );
}

export async function updateUserProduct(updated: UserProduct): Promise<void> {
  const existing = await getUserProducts();
  await storage.setItem(
    storage.KEYS.USER_PRODUCTS,
    existing.map((p) => (p.id === updated.id ? updated : p))
  );
}

// ─── Routines ─────────────────────────────────────────────────────────────────

export async function getRoutines(): Promise<Routine[]> {
  return (await storage.getItem<Routine[]>(storage.KEYS.ROUTINES)) ?? [];
}

export async function saveRoutine(routine: Routine): Promise<void> {
  const existing = await getRoutines();
  const idx = existing.findIndex((r) => r.id === routine.id);
  if (idx === -1) {
    await storage.setItem(storage.KEYS.ROUTINES, [...existing, routine]);
  } else {
    existing[idx] = routine;
    await storage.setItem(storage.KEYS.ROUTINES, existing);
  }
}

export async function deleteRoutine(routineId: string): Promise<void> {
  const existing = await getRoutines();
  await storage.setItem(
    storage.KEYS.ROUTINES,
    existing.filter((r) => r.id !== routineId)
  );
}

// ─── Routine Items ────────────────────────────────────────────────────────────

export async function getRoutineItems(): Promise<RoutineItem[]> {
  return (await storage.getItem<RoutineItem[]>(storage.KEYS.ROUTINE_ITEMS)) ?? [];
}

export async function saveRoutineItem(item: RoutineItem): Promise<void> {
  const existing = await getRoutineItems();
  const idx = existing.findIndex((r) => r.id === item.id);
  if (idx === -1) {
    await storage.setItem(storage.KEYS.ROUTINE_ITEMS, [...existing, item]);
  } else {
    existing[idx] = item;
    await storage.setItem(storage.KEYS.ROUTINE_ITEMS, existing);
  }
}

export async function deleteRoutineItem(itemId: string): Promise<void> {
  const existing = await getRoutineItems();
  await storage.setItem(
    storage.KEYS.ROUTINE_ITEMS,
    existing.filter((r) => r.id !== itemId)
  );
}

// ─── Usage Logs ───────────────────────────────────────────────────────────────

export async function getUsageLogs(): Promise<UsageLog[]> {
  return (await storage.getItem<UsageLog[]>(storage.KEYS.USAGE_LOGS)) ?? [];
}

export async function saveUsageLog(log: UsageLog): Promise<void> {
  const existing = await getUsageLogs();
  const idx = existing.findIndex(
    (l) => l.routineItemId === log.routineItemId && l.date === log.date
  );
  if (idx === -1) {
    await storage.setItem(storage.KEYS.USAGE_LOGS, [...existing, log]);
  } else {
    existing[idx] = log;
    await storage.setItem(storage.KEYS.USAGE_LOGS, existing);
  }
}

export async function getUsageLogForItem(
  routineItemId: string,
  date: string
): Promise<UsageLog | undefined> {
  const logs = await getUsageLogs();
  return logs.find((l) => l.routineItemId === routineItemId && l.date === date);
}

// ─── Reflections ──────────────────────────────────────────────────────────────

export async function getReflections(): Promise<Reflection[]> {
  const r = (await storage.getItem<Reflection[]>(storage.KEYS.REFLECTIONS)) ?? [];
  return r.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export async function saveReflection(reflection: Reflection): Promise<void> {
  const existing = await getReflections();
  const idx = existing.findIndex((r) => r.id === reflection.id);
  if (idx === -1) {
    await storage.setItem(storage.KEYS.REFLECTIONS, [...existing, reflection]);
  } else {
    existing[idx] = reflection;
    await storage.setItem(storage.KEYS.REFLECTIONS, existing);
  }
}

export async function deleteReflection(id: string): Promise<void> {
  const existing = await getReflections();
  await storage.setItem(
    storage.KEYS.REFLECTIONS,
    existing.filter((r) => r.id !== id)
  );
}

// ─── Demo ─────────────────────────────────────────────────────────────────────

export async function isDemoLoaded(): Promise<boolean> {
  return (await storage.getItem<boolean>(storage.KEYS.DEMO_LOADED)) === true;
}

export async function loadDemoData(): Promise<void> {
  await storage.setItem(storage.KEYS.USER_PRODUCTS, DEMO_USER_PRODUCTS);
  await storage.setItem(storage.KEYS.ROUTINES, DEMO_ROUTINES);
  await storage.setItem(storage.KEYS.ROUTINE_ITEMS, DEMO_ROUTINE_ITEMS);
  await storage.setItem(storage.KEYS.USAGE_LOGS, DEMO_USAGE_LOGS);
  await storage.setItem(storage.KEYS.REFLECTIONS, DEMO_REFLECTIONS);
  await storage.setItem(storage.KEYS.DEMO_LOADED, true);
  await saveSettings({ onboardingCompleted: true, isDemoMode: true });
}

export async function resetDemoData(): Promise<void> {
  await storage.clearAll();
  await loadDemoData();
}

export async function clearAllData(): Promise<void> {
  await storage.clearAll();
}
