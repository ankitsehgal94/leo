import { create } from 'zustand';

import type { JournalEntry, MoodLevel } from '@/types';

import { getItem, setItem } from '../storage';
import { createSelectors } from '../utils';

const JOURNAL_KEY = 'journal_entries';

type AddEntryParams = {
  title: string;
  text: string;
  mood: MoodLevel;
  date?: string;
  time?: string;
};

type UpdateEntryParams = {
  id: string;
  title?: string;
  text?: string;
  mood?: MoodLevel;
};

type JournalState = {
  entries: JournalEntry[];
  isLoading: boolean;

  // Actions
  hydrate: () => void;
  addEntry: (params: AddEntryParams) => void;
  updateEntry: (params: UpdateEntryParams) => void;
  deleteEntry: (id: string) => void;
  getEntryForDate: (date: string) => JournalEntry | undefined;
  getRecentEntries: (limit?: number) => JournalEntry[];
};

const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const getTodayDate = (): string => {
  return new Date().toISOString().split('T')[0];
};

const getCurrentTime = (): string => {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

const _useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  isLoading: true,

  hydrate: () => {
    const entries = getItem<JournalEntry[]>(JOURNAL_KEY) ?? [];
    set({ entries, isLoading: false });
  },

  addEntry: (params) => {
    const { title, text, mood, date, time } = params;
    const entryDate = date ?? getTodayDate();
    const entryTime = time ?? getCurrentTime();

    // Check if entry already exists for this date
    const existingEntry = get().entries.find((e) => e.date === entryDate);

    if (existingEntry) {
      // Update existing entry
      get().updateEntry({ id: existingEntry.id, title, text, mood });
      return;
    }

    const newEntry: JournalEntry = {
      id: generateId(),
      date: entryDate,
      time: entryTime,
      title,
      text,
      mood,
      createdAt: new Date().toISOString(),
    };

    const entries = [newEntry, ...get().entries];
    set({ entries });
    setItem(JOURNAL_KEY, entries);
  },

  updateEntry: (params) => {
    const { id, ...updates } = params;
    const entries = get().entries.map((entry) =>
      entry.id === id ? { ...entry, ...updates } : entry
    );
    set({ entries });
    setItem(JOURNAL_KEY, entries);
  },

  deleteEntry: (id) => {
    const entries = get().entries.filter((entry) => entry.id !== id);
    set({ entries });
    setItem(JOURNAL_KEY, entries);
  },

  getEntryForDate: (date) => {
    return get().entries.find((entry) => entry.date === date);
  },

  getRecentEntries: (limit = 10) => {
    return get()
      .entries.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
      .slice(0, limit);
  },
}));

export const useJournalStore = createSelectors(_useJournalStore);

export const hydrateJournal = (): void => _useJournalStore.getState().hydrate();
