import * as React from 'react';
import { Platform } from 'react-native';
import { reloadAllTimelines } from 'react-native-widgetkit';

import { syncWidgetData, type WidgetData, type WidgetHabit } from '../storage';
import { useHabitStore } from '../stores';

function getTodayDate(): string {
  const now = new Date();
  // Use local date, not UTC
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
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
  let streakBroken = false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check consecutive days going backwards
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = getLocalDateString(checkDate);

    // Only check habits that existed on this day
    const habitsForDay = habits.filter((habit) => {
      const createdDate = habit.createdAt.split('T')[0];
      return dateStr >= createdDate;
    });

    // If no habits existed on this day, stop counting
    if (habitsForDay.length === 0) {
      break;
    }

    // Check if all existing habits were completed on this day
    const allCompleted = habitsForDay.every((habit) => {
      const completion = completions.find(
        (c) => c.habitId === habit.id && c.date === dateStr
      );
      return completion?.isComplete ?? false;
    });

    if (allCompleted) {
      if (!streakBroken) {
        streak++;
      }
    } else if (i === 0) {
      // Today not complete yet - don't break streak, just don't count today
    } else {
      // Past day not complete - streak is broken
      streakBroken = true;
    }
  }

  return streak;
}
