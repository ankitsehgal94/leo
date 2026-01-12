import { create } from 'zustand';

import type { UserState } from '@/types';

import { getItem, setItem } from '../storage';
import { createSelectors } from '../utils';

const USER_STATE_KEY = 'user_state';
const MAX_FREE_HABITS = 3;

type UserStoreState = UserState & {
  isLoading: boolean;

  // Actions
  hydrate: () => void;
  setUserName: (name: string) => void;
  setPremium: (isPremium: boolean) => void;
  setOnboardingCompleted: (completed: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  canAddHabit: (currentHabitCount: number) => boolean;
};

const defaultState: UserState = {
  isPremium: false,
  onboardingCompleted: false,
  notificationsEnabled: true,
  userName: undefined,
};

const _useUserStore = create<UserStoreState>((set, get) => ({
  ...defaultState,
  isLoading: true,

  hydrate: () => {
    const savedState = getItem<UserState>(USER_STATE_KEY);
    if (savedState) {
      set({ ...savedState, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },

  setUserName: (name) => {
    set({ userName: name });
    const state = get();
    setItem(USER_STATE_KEY, {
      isPremium: state.isPremium,
      onboardingCompleted: state.onboardingCompleted,
      notificationsEnabled: state.notificationsEnabled,
      userName: name,
    });
  },

  setPremium: (isPremium) => {
    set({ isPremium });
    const state = get();
    setItem(USER_STATE_KEY, {
      isPremium,
      onboardingCompleted: state.onboardingCompleted,
      notificationsEnabled: state.notificationsEnabled,
      userName: state.userName,
    });
  },

  setOnboardingCompleted: (completed) => {
    set({ onboardingCompleted: completed });
    const state = get();
    setItem(USER_STATE_KEY, {
      isPremium: state.isPremium,
      onboardingCompleted: completed,
      notificationsEnabled: state.notificationsEnabled,
      userName: state.userName,
    });
  },

  setNotificationsEnabled: (enabled) => {
    set({ notificationsEnabled: enabled });
    const state = get();
    setItem(USER_STATE_KEY, {
      isPremium: state.isPremium,
      onboardingCompleted: state.onboardingCompleted,
      notificationsEnabled: enabled,
      userName: state.userName,
    });
  },

  canAddHabit: (currentHabitCount) => {
    const { isPremium } = get();
    return isPremium || currentHabitCount < MAX_FREE_HABITS;
  },
}));

export const useUserStore = createSelectors(_useUserStore);

export const hydrateUser = (): void => _useUserStore.getState().hydrate();

export const MAX_FREE_HABITS_COUNT = MAX_FREE_HABITS;
