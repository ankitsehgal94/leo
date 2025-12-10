import { create } from 'zustand';

import type { JournalEntry } from '@/types';

import { getItem, setItem } from '../storage';
import { createSelectors } from '../utils';

const JOURNAL_KEY = 'journal_entries';

type JournalState = {
  entries: JournalEntry[];
  isLoading: boolean;

  // Actions
  hydrate: () => void;
  addEntry: (text: string, date?: string) => void;
  updateEntry: (id: string, text: string) => void;
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

const _useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  isLoading: true,

  hydrate: () => {
    const entries = getItem<JournalEntry[]>(JOURNAL_KEY) ?? [];
    set({ entries, isLoading: false });
  },

  addEntry: (text, date) => {
    const entryDate = date ?? getTodayDate();

    // Check if entry already exists for this date
    const existingEntry = get().entries.find((e) => e.date === entryDate);

    if (existingEntry) {
      // Update existing entry
      get().updateEntry(existingEntry.id, text);
      return;
    }

    const newEntry: JournalEntry = {
      id: generateId(),
      date: entryDate,
      text,
      createdAt: new Date().toISOString(),
    };

    const entries = [newEntry, ...get().entries];
    set({ entries });
    setItem(JOURNAL_KEY, entries);
  },

  updateEntry: (id, text) => {
    const entries = get().entries.map((entry) =>
      entry.id === id ? { ...entry, text } : entry
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
