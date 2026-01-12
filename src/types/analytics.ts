export type TimePeriod = 'daily' | 'weekly' | 'monthly';

export type CompletionDataPoint = {
  date: string;
  label: string;
  completionRate: number;
  completedCount: number;
  totalCount: number;
};

export type HeatmapDay = {
  date: string;
  completionLevel: 0 | 1 | 2 | 3 | 4;
  completionRate: number;
};

export type HabitInsight = {
  habitId: string;
  name: string;
  emoji: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
  averageCompletionRate: number;
  weeklyProgress: boolean[];
};

export type AnalyticsSummary = {
  totalHabits: number;
  overallCompletionRate: number;
  currentDailyStreak: number;
  longestDailyStreak: number;
  totalCompletionsAllTime: number;
};
