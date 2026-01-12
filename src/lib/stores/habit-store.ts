import { create } from 'zustand';

import type { DayOfWeek, Habit, HabitCompletion, TimeOfDay } from '@/types';

import {
  cancelHabitNotification,
  cancelTodayHabitNotification,
  scheduleHabitNotification,
} from '../notifications';
import { getItem, setItem } from '../storage';
import { createSelectors } from '../utils';

const HABITS_KEY = 'habits';
const COMPLETIONS_KEY = 'habit_completions';

// Map JS day (0=Sun) to DayOfWeek
const JS_DAY_TO_DAY_OF_WEEK: DayOfWeek[] = [
  'sun',
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
];

// Check if a date is a scheduled day for the habit
function isScheduledDay(habit: Habit, dateStr: string): boolean {
  if (habit.frequency === 'daily') return true;
  const date = new Date(dateStr + 'T12:00:00');
  const dayOfWeek = JS_DAY_TO_DAY_OF_WEEK[date.getDay()];
  return habit.selectedDays?.includes(dayOfWeek) ?? false;
}

// Format date as YYYY-MM-DD (using local timezone)
function formatDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Get previous date string
function getPreviousDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() - 1);
  return formatDate(date);
}

// Calculate current streak for a habit
function calculateCurrentStreak(
  habit: Habit,
  completions: HabitCompletion[],
  fromDate: string
): number {
  const habitCompletions = completions.filter((c) => c.habitId === habit.id);
  const completionMap = new Map(
    habitCompletions.map((c) => [c.date, c.isComplete])
  );

  let streak = 0;
  let currentDate = fromDate;

  // Check if fromDate itself is completed (if it's a scheduled day)
  if (isScheduledDay(habit, currentDate)) {
    if (completionMap.get(currentDate)) {
      streak = 1;
    } else {
      return 0; // Today is scheduled but not completed
    }
  }

  // Walk backward through previous days
  currentDate = getPreviousDate(currentDate);
  const createdDate = habit.createdAt.split('T')[0];

  // Limit search to prevent infinite loops (max 2 years back)
  const maxDays = 730;
  let daysChecked = 0;

  while (daysChecked < maxDays && currentDate >= createdDate) {
    if (isScheduledDay(habit, currentDate)) {
      if (completionMap.get(currentDate)) {
        streak++;
      } else {
        break; // Streak broken
      }
    }
    // Skip non-scheduled days (they don't break the streak)
    currentDate = getPreviousDate(currentDate);
    daysChecked++;
  }

  return streak;
}

// Update habit with new streak values
function updateHabitStreak(
  habit: Habit,
  completions: HabitCompletion[],
  date: string
): Habit {
  const currentStreak = calculateCurrentStreak(habit, completions, date);
  const longestStreak = Math.max(habit.longestStreak, currentStreak);
  return { ...habit, currentStreak, longestStreak };
}

// Get today's date in YYYY-MM-DD format (using local timezone)
function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

type HabitState = {
  habits: Habit[];
  completions: HabitCompletion[];
  isLoading: boolean;
  hydrate: () => void;
  addHabit: (
    habit: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak'>
  ) => void;
  addMultipleHabits: (
    habits: Omit<
      Habit,
      'id' | 'createdAt' | 'currentStreak' | 'longestStreak'
    >[]
  ) => void;
  updateHabit: (
    id: string,
    updates: Partial<Omit<Habit, 'id' | 'createdAt'>>
  ) => void;
  deleteHabit: (id: string) => void;
  toggleHabitComplete: (habitId: string, date: string) => void;
  updateProgress: (habitId: string, date: string, progress: number) => void;
  incrementProgress: (habitId: string, date: string) => void;
  decrementProgress: (habitId: string, date: string) => void;
  getCompletionForDate: (
    habitId: string,
    date: string
  ) => HabitCompletion | undefined;
  getHabitsByTimeOfDay: (timeOfDay: TimeOfDay) => Habit[];
  isAllHabitsCompletedForDate: (date: string) => boolean;
};

type StoreGet = () => HabitState;
type StoreSet = (partial: Partial<HabitState>) => void;

type ToggleContext = {
  habitId: string;
  date: string;
};

const generateId = (): string =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

// Helper: Create new completion
function createNewCompletion(ctx: ToggleContext): HabitCompletion {
  return {
    date: ctx.date,
    habitId: ctx.habitId,
    isComplete: true,
  };
}

// Helper: Toggle existing completion
function toggleExistingCompletion(
  existing: HabitCompletion,
  completions: HabitCompletion[]
): HabitCompletion[] {
  const { habitId, date } = existing;
  if (existing.isComplete) {
    return completions.filter(
      (c) => !(c.habitId === habitId && c.date === date)
    );
  }
  return completions.map((c) =>
    c.habitId === habitId && c.date === date ? { ...c, isComplete: true } : c
  );
}

// Helper: Handle progress update for tracked habits
function handleProgressUpdate(
  habit: Habit,
  completions: HabitCompletion[],
  ctx: ToggleContext & { progress: number }
): HabitCompletion[] {
  const { habitId, date, progress } = ctx;
  const goal = habit.tracking?.goal ?? 1;
  const isComplete = progress >= goal;

  const existing = completions.find(
    (c) => c.habitId === habitId && c.date === date
  );

  if (!existing) {
    if (progress <= 0) return completions;
    return [...completions, { date, habitId, isComplete, progress }];
  }

  if (progress <= 0) {
    return completions.filter(
      (c) => !(c.habitId === habitId && c.date === date)
    );
  }

  return completions.map((c) =>
    c.habitId === habitId && c.date === date
      ? { ...c, progress, isComplete }
      : c
  );
}

// Helper: Create a new habit with default fields
function createNewHabit(
  habitData: Omit<Habit, 'id' | 'createdAt' | 'currentStreak' | 'longestStreak'>
): Habit {
  return {
    ...habitData,
    id: generateId(),
    createdAt: new Date().toISOString(),
    currentStreak: 0,
    longestStreak: 0,
  };
}

// Helper: Migrate habits without streak fields
function migrateHabits(
  storedHabits: Habit[],
  completions: HabitCompletion[]
): Habit[] {
  const today = getToday();
  return storedHabits.map((habit) => {
    const needsMigration =
      habit.currentStreak === undefined || habit.longestStreak === undefined;
    if (needsMigration) {
      const currentStreak = calculateCurrentStreak(habit, completions, today);
      return { ...habit, currentStreak, longestStreak: currentStreak };
    }
    return habit;
  });
}

// Helper: Schedule notifications for new habits
function scheduleNotificationsForHabits(habits: Habit[]): void {
  for (const habit of habits) {
    if (habit.reminderEnabled && habit.reminderTime) {
      void scheduleHabitNotification(habit, 0);
    }
  }
}

// Helper: Handle notification updates when habit reminder settings change
function handleReminderUpdate(
  updatedHabit: Habit,
  existingHabit: Habit,
  updates: Partial<Omit<Habit, 'id' | 'createdAt'>>
): void {
  const reminderChanged =
    updates.reminderEnabled !== undefined ||
    updates.reminderTime !== undefined ||
    updates.frequency !== undefined ||
    updates.selectedDays !== undefined;

  if (reminderChanged) {
    if (updatedHabit.reminderEnabled && updatedHabit.reminderTime) {
      void scheduleHabitNotification(updatedHabit, existingHabit.currentStreak);
    } else {
      void cancelHabitNotification(updatedHabit.id);
    }
  }
}

// Store action creators
function createHabitActions(set: StoreSet, get: StoreGet) {
  return {
    hydrate: () => {
      const storedHabits = getItem<Habit[]>(HABITS_KEY) ?? [];
      const completions = getItem<HabitCompletion[]>(COMPLETIONS_KEY) ?? [];
      const habits = migrateHabits(storedHabits, completions);

      const hasMigrations = storedHabits.some(
        (h) => h.currentStreak === undefined || h.longestStreak === undefined
      );
      if (hasMigrations) {
        setItem(HABITS_KEY, habits);
      }

      set({ habits, completions, isLoading: false });
    },

    addHabit: (
      habitData: Omit<
        Habit,
        'id' | 'createdAt' | 'currentStreak' | 'longestStreak'
      >
    ) => {
      const newHabit = createNewHabit(habitData);
      const habits = [...get().habits, newHabit];
      set({ habits });
      setItem(HABITS_KEY, habits);
      scheduleNotificationsForHabits([newHabit]);
    },

    addMultipleHabits: (
      habitsData: Omit<
        Habit,
        'id' | 'createdAt' | 'currentStreak' | 'longestStreak'
      >[]
    ) => {
      const newHabits = habitsData.map(createNewHabit);
      const habits = [...get().habits, ...newHabits];
      set({ habits });
      setItem(HABITS_KEY, habits);
      scheduleNotificationsForHabits(newHabits);
    },

    updateHabit: (
      id: string,
      updates: Partial<Omit<Habit, 'id' | 'createdAt'>>
    ) => {
      const existingHabit = get().habits.find((h) => h.id === id);
      if (!existingHabit) return;

      const updatedHabit = { ...existingHabit, ...updates };
      const habits = get().habits.map((h) => (h.id === id ? updatedHabit : h));
      set({ habits });
      setItem(HABITS_KEY, habits);
      handleReminderUpdate(updatedHabit, existingHabit, updates);
    },

    deleteHabit: (id: string) => {
      const habits = get().habits.filter((h) => h.id !== id);
      const completions = get().completions.filter((c) => c.habitId !== id);
      set({ habits, completions });
      setItem(HABITS_KEY, habits);
      setItem(COMPLETIONS_KEY, completions);
      void cancelHabitNotification(id);
    },
  };
}

function createCompletionActions(set: StoreSet, get: StoreGet) {
  return {
    toggleHabitComplete: (habitId: string, date: string) => {
      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) return;

      const ctx: ToggleContext = { habitId, date };
      const existing = get().completions.find(
        (c) => c.habitId === habitId && c.date === date
      );
      const completions = existing
        ? toggleExistingCompletion(existing, get().completions)
        : [...get().completions, createNewCompletion(ctx)];

      // Check if we're completing (not un-completing) the habit
      const isCompleting = !existing || !existing.isComplete;

      // Update streak for this habit
      const updatedHabit = updateHabitStreak(habit, completions, getToday());
      const habits = get().habits.map((h) =>
        h.id === habitId ? updatedHabit : h
      );

      set({ completions, habits });
      setItem(COMPLETIONS_KEY, completions);
      setItem(HABITS_KEY, habits);

      // Cancel today's notification if completing the habit
      if (isCompleting && date === getToday() && habit.reminderEnabled) {
        void cancelTodayHabitNotification(habitId);
      }
    },
  };
}

// Helper: Cancel notification if habit is completed today
function cancelNotificationIfComplete(
  habit: Habit,
  ctx: ToggleContext & { progress: number }
): void {
  const goal = habit.tracking?.goal ?? 1;
  const isNowComplete = ctx.progress >= goal;
  if (isNowComplete && ctx.date === getToday() && habit.reminderEnabled) {
    void cancelTodayHabitNotification(ctx.habitId);
  }
}

function createProgressActions(set: StoreSet, get: StoreGet) {
  // Helper: Update progress and streak for a habit
  function updateProgressAndStreak(
    habit: Habit,
    completions: HabitCompletion[],
    ctx: ToggleContext & { progress: number }
  ): void {
    const updatedCompletions = handleProgressUpdate(habit, completions, ctx);
    const updatedHabit = updateHabitStreak(
      habit,
      updatedCompletions,
      getToday()
    );
    const habits = get().habits.map((h) =>
      h.id === ctx.habitId ? updatedHabit : h
    );

    set({ completions: updatedCompletions, habits });
    setItem(COMPLETIONS_KEY, updatedCompletions);
    setItem(HABITS_KEY, habits);
    cancelNotificationIfComplete(habit, ctx);
  }

  return {
    updateProgress: (habitId: string, date: string, progress: number) => {
      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) return;
      updateProgressAndStreak(habit, get().completions, {
        habitId,
        date,
        progress,
      });
    },

    incrementProgress: (habitId: string, date: string) => {
      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) return;

      const existing = get().completions.find(
        (c) => c.habitId === habitId && c.date === date
      );
      const newProgress = (existing?.progress ?? 0) + 1;

      updateProgressAndStreak(habit, get().completions, {
        habitId,
        date,
        progress: newProgress,
      });
    },

    decrementProgress: (habitId: string, date: string) => {
      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) return;

      const existing = get().completions.find(
        (c) => c.habitId === habitId && c.date === date
      );
      const newProgress = Math.max(0, (existing?.progress ?? 0) - 1);

      updateProgressAndStreak(habit, get().completions, {
        habitId,
        date,
        progress: newProgress,
      });
    },
  };
}

function createSelectors_(get: StoreGet) {
  return {
    getCompletionForDate: (habitId: string, date: string) =>
      get().completions.find((c) => c.habitId === habitId && c.date === date),

    getHabitsByTimeOfDay: (timeOfDay: TimeOfDay) =>
      get().habits.filter((h) => h.timeOfDay === timeOfDay),

    isAllHabitsCompletedForDate: (date: string) => {
      const habits = get().habits;
      if (habits.length === 0) return false;
      return habits.every((h) => {
        const completion = get().completions.find(
          (c) => c.habitId === h.id && c.date === date
        );
        return completion?.isComplete ?? false;
      });
    },
  };
}

const _useHabitStore = create<HabitState>((set, get) => ({
  habits: [],
  completions: [],
  isLoading: true,
  ...createHabitActions(set, get),
  ...createCompletionActions(set, get),
  ...createProgressActions(set, get),
  ...createSelectors_(get),
}));

export const useHabitStore = createSelectors(_useHabitStore);

export const hydrateHabits = (): void => _useHabitStore.getState().hydrate();
