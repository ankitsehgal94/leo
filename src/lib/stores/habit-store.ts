import { create } from 'zustand';

import type { Habit, HabitCompletion, SubTask, TimeOfDay } from '@/types';

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
  updateHabit: (
    id: string,
    updates: Partial<Omit<Habit, 'id' | 'createdAt'>>
  ) => void;
  deleteHabit: (id: string) => void;
  toggleHabitComplete: (habitId: string, date: string) => void;
  toggleSubTaskComplete: (
    habitId: string,
    subTaskId: string,
    date: string
  ) => void;
  addSubTask: (habitId: string, title: string) => void;
  removeSubTask: (habitId: string, subTaskId: string) => void;
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
function createNewCompletion(
  habit: Habit,
  ctx: ToggleContext
): HabitCompletion {
  return {
    date: ctx.date,
    habitId: ctx.habitId,
    completedSubTasks: habit.subTasks?.map((s) => s.id) ?? [],
    isComplete: true,
  };
}

// Helper: Toggle existing completion
function toggleExistingCompletion(
  habit: Habit,
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
    c.habitId === habitId && c.date === date
      ? {
          ...c,
          isComplete: true,
          completedSubTasks: habit.subTasks?.map((s) => s.id) ?? [],
        }
      : c
  );
}

// Helper: Handle sub-task toggle
type SubTaskToggleContext = ToggleContext & { subTaskId: string };

function handleSubTaskToggle(
  habit: Habit,
  completions: HabitCompletion[],
  ctx: SubTaskToggleContext
): HabitCompletion[] {
  const { habitId, subTaskId, date } = ctx;
  const existing = completions.find(
    (c) => c.habitId === habitId && c.date === date
  );

  if (!existing) {
    return [
      ...completions,
      { date, habitId, completedSubTasks: [subTaskId], isComplete: false },
    ];
  }

  const hasSubTask = existing.completedSubTasks.includes(subTaskId);
  const newCompletedSubTasks = hasSubTask
    ? existing.completedSubTasks.filter((id) => id !== subTaskId)
    : [...existing.completedSubTasks, subTaskId];

  const allSubTasksComplete =
    habit.subTasks?.length === newCompletedSubTasks.length;

  return completions.map((c) =>
    c.habitId === habitId && c.date === date
      ? {
          ...c,
          completedSubTasks: newCompletedSubTasks,
          isComplete: allSubTasksComplete,
        }
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
        ? toggleExistingCompletion(habit, existing, get().completions)
        : [...get().completions, createNewCompletion(habit, ctx)];

      set({ completions });
      setItem(COMPLETIONS_KEY, completions);
    },

    toggleSubTaskComplete: (
      habitId: string,
      subTaskId: string,
      date: string
    ) => {
      const habit = get().habits.find((h) => h.id === habitId);
      if (!habit) return;

      const ctx: SubTaskToggleContext = { habitId, subTaskId, date };
      const completions = handleSubTaskToggle(habit, get().completions, ctx);
      set({ completions });
      setItem(COMPLETIONS_KEY, completions);
    },
  };
}

function createSubTaskActions(set: StoreSet, get: StoreGet) {
  return {
    addSubTask: (habitId: string, title: string) => {
      const newSubTask: SubTask = { id: generateId(), title };
      const habits = get().habits.map((h) =>
        h.id === habitId
          ? { ...h, subTasks: [...(h.subTasks ?? []), newSubTask] }
          : h
      );
      set({ habits });
      setItem(HABITS_KEY, habits);
    },

    removeSubTask: (habitId: string, subTaskId: string) => {
      const habits = get().habits.map((h) =>
        h.id === habitId
          ? { ...h, subTasks: h.subTasks?.filter((s) => s.id !== subTaskId) }
          : h
      );
      set({ habits });
      setItem(HABITS_KEY, habits);
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
  ...createSubTaskActions(set, get),
  ...createSelectors_(get),
}));

export const useHabitStore = createSelectors(_useHabitStore);

export const hydrateHabits = (): void => _useHabitStore.getState().hydrate();
