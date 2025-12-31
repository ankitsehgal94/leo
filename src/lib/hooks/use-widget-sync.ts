import * as React from 'react';
import { Platform } from 'react-native';
import { reloadAllTimelines } from 'react-native-widgetkit';

import { syncWidgetData, type WidgetData, type WidgetHabit } from '../storage';
import { useHabitStore } from '../stores';

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Hook that syncs habit data with iOS widgets
 * Call this in your root layout or main screen
 */
export function useWidgetSync(): void {
  const habits = useHabitStore.use.habits();
  const completions = useHabitStore.use.completions();

  React.useEffect(() => {
    // Only sync on iOS
    if (Platform.OS !== 'ios') return;

    const today = getTodayDate();

    // Transform habits for widget consumption
    const widgetHabits: WidgetHabit[] = habits.map((habit) => {
      const completion = completions.find(
        (c) => c.habitId === habit.id && c.date === today
      );

      return {
        id: habit.id,
        name: habit.name,
        emoji: habit.emoji,
        timeOfDay: habit.timeOfDay,
        isComplete: completion?.isComplete ?? false,
        progress: completion?.progress,
        goal: habit.tracking?.goal,
      };
    });

    // Calculate stats
    const completedCount = widgetHabits.filter((h) => h.isComplete).length;
    const totalCount = widgetHabits.length;

    // TODO: Calculate actual streak from completions
    const streak = calculateStreak(habits, completions);

    const widgetData: WidgetData = {
      habits: widgetHabits,
      completedCount,
      totalCount,
      streak,
      lastUpdated: new Date().toISOString(),
    };

    // Sync data and refresh widget
    const syncAndRefresh = async () => {
      await syncWidgetData(widgetData);
      // Tell iOS to refresh the widget immediately
      reloadAllTimelines();
    };

    void syncAndRefresh();
  }, [habits, completions]);
}

function calculateStreak(
  habits: ReturnType<typeof useHabitStore.use.habits>,
  completions: ReturnType<typeof useHabitStore.use.completions>
): number {
  if (habits.length === 0) return 0;

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check consecutive days going backwards
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];

    // Check if all habits were completed on this day
    const allCompleted = habits.every((habit) => {
      const completion = completions.find(
        (c) => c.habitId === habit.id && c.date === dateStr
      );
      return completion?.isComplete ?? false;
    });

    if (allCompleted) {
      streak++;
    } else if (i > 0) {
      // Don't break on today (might not have completed yet)
      break;
    }
  }

  return streak;
}
