import { create } from 'zustand';

import type { Habit, HabitCompletion, TimeOfDay } from '@/types';

import { getItem, setItem } from '../storage';
import { createSelectors } from '../utils';

const HABITS_KEY = 'habits';
const COMPLETIONS_KEY = 'habit_completions';

type HabitState = {
  habits: Habit[];
  completions: HabitCompletion[];
  isLoading: boolean;
  hydrate: () => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  addMultipleHabits: (habits: Omit<Habit, 'id' | 'createdAt'>[]) => void;
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

// Store action creators
function createHabitActions(set: StoreSet, get: StoreGet) {
  return {
    hydrate: () => {
      const habits = getItem<Habit[]>(HABITS_KEY) ?? [];
      const completions = getItem<HabitCompletion[]>(COMPLETIONS_KEY) ?? [];
      set({ habits, completions, isLoading: false });
    },

    addHabit: (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
      const newHabit: Habit = {
        ...habitData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      };
      const habits = [...get().habits, newHabit];
      set({ habits });
      setItem(HABITS_KEY, habits);
    },

    addMultipleHabits: (habitsData: Omit<Habit, 'id' | 'createdAt'>[]) => {
      const newHabits: Habit[] = habitsData.map((habitData) => ({
        ...habitData,
        id: generateId(),
        createdAt: new Date().toISOString(),
      }));
      const habits = [...get().habits, ...newHabits];
      set({ habits });
      setItem(HABITS_KEY, habits);
    },

    updateHabit: (
      id: string,
      updates: Partial<Omit<Habit, 'id' | 'createdAt'>>
    ) => {
      const habits = get().habits.map((h) =>
        h.id === id ? { ...h, ...updates } : h
      );
      set({ habits });
      setItem(HABITS_KEY, habits);
    },

    deleteHabit: (id: string) => {
      const habits = get().habits.filter((h) => h.id !== id);
      const completions = get().completions.filter((c) => c.habitId !== id);
      set({ habits, completions });
      setItem(HABITS_KEY, habits);
      setItem(COMPLETIONS_KEY, completions);
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

      set({ completions });
      setItem(COMPLETIONS_KEY, completions);
    },
  };
}

function createProgressActions(set: StoreSet, get: StoreGet) {
  return {
    updateProgress: (habitId: string, date: string, progress: number) => {
      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) return;

      const completions = handleProgressUpdate(habit, get().completions, {
        habitId,
        date,
        progress,
      });
      set({ completions });
      setItem(COMPLETIONS_KEY, completions);
    },

    incrementProgress: (habitId: string, date: string) => {
      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) return;

      const existing = get().completions.find(
        (c) => c.habitId === habitId && c.date === date
      );
      const currentProgress = existing?.progress ?? 0;
      const newProgress = currentProgress + 1;

      const completions = handleProgressUpdate(habit, get().completions, {
        habitId,
        date,
        progress: newProgress,
      });
      set({ completions });
      setItem(COMPLETIONS_KEY, completions);
    },

    decrementProgress: (habitId: string, date: string) => {
      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) return;

      const existing = get().completions.find(
        (c) => c.habitId === habitId && c.date === date
      );
      const currentProgress = existing?.progress ?? 0;
      const newProgress = Math.max(0, currentProgress - 1);

      const completions = handleProgressUpdate(habit, get().completions, {
        habitId,
        date,
        progress: newProgress,
      });
      set({ completions });
      setItem(COMPLETIONS_KEY, completions);
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
