import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import {
  cancelBedtimeReminder,
  requestNotificationPermissions,
  scheduleBedtimeReminder,
} from "@/services/notifications";

export interface SleepEntry {
  id: string;
  date: string;
  sleepTime: string;
  wakeTime: string;
  durationMinutes: number;
  note?: string;
}

export interface AlertnessEntry {
  id: string;
  date: string;
  score: number;
  isStuck?: boolean;
}

export interface CurfewSettings {
  targetBedtime: string;
  isActive: boolean;
  restrictedApps: {
    instagram: boolean;
    tiktok: boolean;
    snapchat: boolean;
    twitter: boolean;
    facebook: boolean;
    email: boolean;
    slack: boolean;
    workApps: boolean;
  };
  delayMinutes: number;
}

export interface AppSettings {
  targetBedtime: string;
  targetWakeTime: string;
  notificationsEnabled: boolean;
  streakGoal: number;
}

export type SleepEntryInput = Omit<SleepEntry, "id" | "durationMinutes">;

interface AppContextType {
  sleepEntries: SleepEntry[];
  curfewNightDates: string[];
  alertnessEntries: AlertnessEntry[];
  curfewSettings: CurfewSettings;
  appSettings: AppSettings;
  currentStreak: number;
  morningPulseShown: boolean;
  addSleepEntry: (entry: SleepEntryInput) => Promise<void>;
  deleteSleepEntry: (id: string) => Promise<void>;
  addAlertnessEntry: (entry: Omit<AlertnessEntry, "id">) => Promise<void>;
  updateCurfewSettings: (settings: Partial<CurfewSettings>) => Promise<void>;
  updateAppSettings: (settings: Partial<AppSettings>) => Promise<void>;
  setMorningPulseShown: (shown: boolean) => Promise<void>;
  startCurfew: () => Promise<void>;
  stopCurfew: () => Promise<void>;
}

const defaultCurfewSettings: CurfewSettings = {
  targetBedtime: "22:00",
  isActive: false,
  restrictedApps: {
    instagram: true,
    tiktok: true,
    snapchat: true,
    twitter: true,
    facebook: true,
    email: false,
    slack: false,
    workApps: false,
  },
  delayMinutes: 0,
};

const defaultAppSettings: AppSettings = {
  targetBedtime: "22:00",
  targetWakeTime: "06:30",
  notificationsEnabled: true,
  streakGoal: 7,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

function calcDurationMinutes(sleepTime: string, wakeTime: string): number {
  const [sh, sm] = sleepTime.split(":").map(Number);
  const [wh, wm] = wakeTime.split(":").map(Number);
  let sleepMins = sh * 60 + sm;
  let wakeMins = wh * 60 + wm;
  if (wakeMins <= sleepMins) wakeMins += 24 * 60;
  return wakeMins - sleepMins;
}

function calcStreak(dateStrings: string[]): number {
  if (dateStrings.length === 0) return 0;
  const sorted = [...dateStrings].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const mostRecent = new Date(sorted[0] + "T00:00:00");
  if (mostRecent < yesterday) {
    return 0;
  }

  let streak = 0;
  let lastDate: Date | null = null;
  for (const dateStr of sorted) {
    const entryDate = new Date(dateStr + "T00:00:00");
    if (!lastDate) {
      streak = 1;
      lastDate = entryDate;
    } else {
      const diff =
        (lastDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24);
      if (Math.round(diff) === 1) {
        streak++;
        lastDate = entryDate;
      } else {
        break;
      }
    }
  }
  return streak;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [alertnessEntries, setAlertnessEntries] = useState<AlertnessEntry[]>(
    []
  );
  const [curfewSettings, setCurfewSettings] = useState<CurfewSettings>(
    defaultCurfewSettings
  );
  const [appSettings, setAppSettings] =
    useState<AppSettings>(defaultAppSettings);
  const [morningPulseShown, setMorningPulseShownState] = useState(false);
  const [curfewNightDates, setCurfewNightDates] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    if (!appSettings.targetBedtime) return;
    if (appSettings.notificationsEnabled) {
      requestNotificationPermissions().then((granted) => {
        if (granted) {
          const streak = calcStreak(curfewNightDates);
          const screenTimeContext =
            streak > 0
              ? `You're on a ${streak}-night screen-free streak — keep it going!`
              : undefined;
          scheduleBedtimeReminder(appSettings.targetBedtime, screenTimeContext);
        }
      });
    } else {
      cancelBedtimeReminder();
    }
  }, [isLoaded, appSettings.notificationsEnabled, appSettings.targetBedtime, curfewNightDates]);

  async function loadData() {
    try {
      const [sleepRaw, alertnessRaw, curfewRaw, settingsRaw, pulseRaw, curfewNightsRaw] =
        await Promise.all([
          AsyncStorage.getItem("sleepEntries"),
          AsyncStorage.getItem("alertnessEntries"),
          AsyncStorage.getItem("curfewSettings"),
          AsyncStorage.getItem("appSettings"),
          AsyncStorage.getItem("morningPulseDate"),
          AsyncStorage.getItem("curfewNightDates"),
        ]);

      if (sleepRaw) setSleepEntries(JSON.parse(sleepRaw));
      if (alertnessRaw) setAlertnessEntries(JSON.parse(alertnessRaw));
      if (curfewRaw)
        setCurfewSettings({ ...defaultCurfewSettings, ...JSON.parse(curfewRaw) });
      if (settingsRaw)
        setAppSettings({ ...defaultAppSettings, ...JSON.parse(settingsRaw) });
      if (curfewNightsRaw) setCurfewNightDates(JSON.parse(curfewNightsRaw));

      const today = new Date().toISOString().split("T")[0];
      if (pulseRaw === today) {
        setMorningPulseShownState(true);
      } else {
        setMorningPulseShownState(false);
      }
    } catch (_) {}
    setIsLoaded(true);
  }

  const addSleepEntry = useCallback(async (entry: SleepEntryInput) => {
    const newEntry: SleepEntry = {
      ...entry,
      id: generateId(),
      durationMinutes: calcDurationMinutes(entry.sleepTime, entry.wakeTime),
    };
    setSleepEntries((prev) => {
      const updated = [newEntry, ...prev];
      AsyncStorage.setItem("sleepEntries", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteSleepEntry = useCallback(async (id: string) => {
    setSleepEntries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      AsyncStorage.setItem("sleepEntries", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const addAlertnessEntry = useCallback(
    async (entry: Omit<AlertnessEntry, "id">) => {
      const newEntry: AlertnessEntry = { ...entry, id: generateId() };
      setAlertnessEntries((prev) => {
        const updated = [newEntry, ...prev.filter((e) => e.date !== entry.date)];
        AsyncStorage.setItem("alertnessEntries", JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const updateCurfewSettings = useCallback(
    async (settings: Partial<CurfewSettings>) => {
      setCurfewSettings((prev) => {
        const updated = { ...prev, ...settings };
        AsyncStorage.setItem("curfewSettings", JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const updateAppSettings = useCallback(
    async (settings: Partial<AppSettings>) => {
      setAppSettings((prev) => {
        const updated = { ...prev, ...settings };
        AsyncStorage.setItem("appSettings", JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  const setMorningPulseShown = useCallback(async (shown: boolean) => {
    const today = new Date().toISOString().split("T")[0];
    await AsyncStorage.setItem("morningPulseDate", shown ? today : "");
    setMorningPulseShownState(shown);
  }, []);

  const startCurfew = useCallback(async () => {
    setCurfewSettings((prev) => {
      const updated = { ...prev, isActive: true };
      AsyncStorage.setItem("curfewSettings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const stopCurfew = useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];
    setCurfewNightDates((prev) => {
      if (prev.includes(today)) return prev;
      const updated = [today, ...prev];
      AsyncStorage.setItem("curfewNightDates", JSON.stringify(updated));
      return updated;
    });
    setCurfewSettings((prev) => {
      const updated = { ...prev, isActive: false };
      AsyncStorage.setItem("curfewSettings", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const currentStreak = calcStreak(curfewNightDates);

  return (
    <AppContext.Provider
      value={{
        sleepEntries,
        curfewNightDates,
        alertnessEntries,
        curfewSettings,
        appSettings,
        currentStreak,
        morningPulseShown,
        addSleepEntry,
        deleteSleepEntry,
        addAlertnessEntry,
        updateCurfewSettings,
        updateAppSettings,
        setMorningPulseShown,
        startCurfew,
        stopCurfew,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
