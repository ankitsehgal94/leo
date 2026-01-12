import { Platform } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

// App Group identifier for sharing data with iOS widgets
const APP_GROUP = 'group.com.leo.shared';

// Main storage instance for app data
export const storage = new MMKV({
  id: 'leo-storage',
});

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? JSON.parse(value) || null : null;
}

export function setItem<T>(key: string, value: T): void {
  storage.set(key, JSON.stringify(value));
}

export function removeItem(key: string): void {
  storage.delete(key);
}

// Widget-specific data keys
export const WIDGET_KEYS = {
  HABITS_TODAY: 'widget_habits_today',
  COMPLETION_STATS: 'widget_completion_stats',
  LAST_SYNC: 'widget_last_sync',
} as const;

// Type for widget habit data
export type WidgetHabit = {
  id: string;
  name: string;
  emoji?: string;
  timeOfDay: string;
  isComplete: boolean;
  progress?: number;
  goal?: number;
};

export type WidgetData = {
  habits: WidgetHabit[];
  completedCount: number;
  totalCount: number;
  streak: number;
  lastUpdated: string;
};

// Sync data for widgets - writes to UserDefaults so iOS widget can read it
export async function syncWidgetData(data: WidgetData): Promise<void> {
  if (Platform.OS !== 'ios') return;

  try {
    // Write to UserDefaults via SharedGroupPreferences (not MMKV)
    // This allows the iOS widget to read the data
    await SharedGroupPreferences.setItem(
      WIDGET_KEYS.HABITS_TODAY,
      data,
      APP_GROUP
    );
  } catch (error) {
    console.error('Failed to sync widget data:', error);
  }
}
