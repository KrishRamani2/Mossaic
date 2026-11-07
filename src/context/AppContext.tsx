import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AppSettings, DEFAULT_SETTINGS } from '../types/user';
import { UserProduct } from '../types/product';
import { Routine, RoutineItem, UsageLog, Reflection } from '../types/routine';
import {
  getSettings,
  saveSettings,
  getUserProducts,
  addUserProduct,
  removeUserProduct,
  getRoutines,
  saveRoutine,
  deleteRoutine,
  getRoutineItems,
  saveRoutineItem,
  deleteRoutineItem,
  getUsageLogs,
  saveUsageLog,
  getReflections,
  saveReflection,
  deleteReflection,
  loadDemoData,
  resetDemoData,
  clearAllData,
  isDemoLoaded,
} from '../lib/storage/repository';
import { DEMO_PRODUCTS } from '../data/demo-products';
import { Product } from '../types/product';

interface AppContextType {
  // State
  settings: AppSettings;
  userProducts: UserProduct[];
  routines: Routine[];
  routineItems: RoutineItem[];
  usageLogs: UsageLog[];
  reflections: Reflection[];
  isLoading: boolean;

  // Catalogue
  catalogue: Product[];

  // Actions
  updateSettings: (s: Partial<AppSettings>) => Promise<void>;
  addProduct: (p: UserProduct) => Promise<void>;
  removeProduct: (id: string) => Promise<void>;
  upsertRoutine: (r: Routine) => Promise<void>;
  removeRoutine: (id: string) => Promise<void>;
  upsertRoutineItem: (item: RoutineItem) => Promise<void>;
  removeRoutineItem: (id: string) => Promise<void>;
  logActivity: (log: UsageLog) => Promise<void>;
  addReflection: (r: Reflection) => Promise<void>;
  removeReflection: (id: string) => Promise<void>;
  loadDemo: () => Promise<void>;
  resetDemo: () => Promise<void>;
  clearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [routineItems, setRoutineItems] = useState<RoutineItem[]>([]);
  const [usageLogs, setUsageLogs] = useState<UsageLog[]>([]);
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [s, up, rt, ri, ul, ref] = await Promise.all([
      getSettings(),
      getUserProducts(),
      getRoutines(),
      getRoutineItems(),
      getUsageLogs(),
      getReflections(),
    ]);
    setSettings(s);
    setUserProducts(up);
    setRoutines(rt);
    setRoutineItems(ri);
    setUsageLogs(ul);
    setReflections(ref);
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const demoLoaded = await isDemoLoaded();
      if (!demoLoaded) {
        // Auto-load demo on first launch
        await loadDemoData();
      }
      await refresh();
      setIsLoading(false);
    })();
  }, [refresh]);

  const updateSettings = async (s: Partial<AppSettings>) => {
    await saveSettings(s);
    setSettings((prev) => ({ ...prev, ...s }));
  };

  const addProduct = async (p: UserProduct) => {
    await addUserProduct(p);
    setUserProducts((prev) =>
      prev.find((x) => x.productId === p.productId) ? prev : [...prev, p]
    );
  };

  const removeProduct = async (id: string) => {
    await removeUserProduct(id);
    setUserProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const upsertRoutine = async (r: Routine) => {
    await saveRoutine(r);
    setRoutines((prev) => {
      const idx = prev.findIndex((x) => x.id === r.id);
      if (idx === -1) return [...prev, r];
      const updated = [...prev];
      updated[idx] = r;
      return updated;
    });
  };

  const removeRoutine = async (id: string) => {
    await deleteRoutine(id);
    setRoutines((prev) => prev.filter((r) => r.id !== id));
  };

  const upsertRoutineItem = async (item: RoutineItem) => {
    await saveRoutineItem(item);
    setRoutineItems((prev) => {
      const idx = prev.findIndex((x) => x.id === item.id);
      if (idx === -1) return [...prev, item];
      const updated = [...prev];
      updated[idx] = item;
      return updated;
    });
  };

  const removeRoutineItem = async (id: string) => {
    await deleteRoutineItem(id);
    setRoutineItems((prev) => prev.filter((r) => r.id !== id));
  };

  const logActivity = async (log: UsageLog) => {
    await saveUsageLog(log);
    setUsageLogs((prev) => {
      const idx = prev.findIndex(
        (l) => l.routineItemId === log.routineItemId && l.date === log.date
      );
      if (idx === -1) return [...prev, log];
      const updated = [...prev];
      updated[idx] = log;
      return updated;
    });
  };

  const addReflection = async (r: Reflection) => {
    await saveReflection(r);
    setReflections((prev) => {
      const idx = prev.findIndex((x) => x.id === r.id);
      if (idx === -1) return [r, ...prev];
      const updated = [...prev];
      updated[idx] = r;
      return updated;
    });
  };

  const removeReflectionFn = async (id: string) => {
    await deleteReflection(id);
    setReflections((prev) => prev.filter((r) => r.id !== id));
  };

  const loadDemo = async () => {
    await loadDemoData();
    await refresh();
  };

  const resetDemo = async () => {
    await resetDemoData();
    await refresh();
  };

  const clearAll = async () => {
    await clearAllData();
    await refresh();
  };

  return (
    <AppContext.Provider
      value={{
        settings,
        userProducts,
        routines,
        routineItems,
        usageLogs,
        reflections,
        isLoading,
        catalogue: DEMO_PRODUCTS,
        updateSettings,
        addProduct,
        removeProduct,
        upsertRoutine,
        removeRoutine,
        upsertRoutineItem,
        removeRoutineItem,
        logActivity,
        addReflection,
        removeReflection: removeReflectionFn,
        loadDemo,
        resetDemo,
        clearAll,
        refresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
