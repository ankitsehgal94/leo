import type {
  AnalyticsSummary,
  CompletionDataPoint,
  DayOfWeek,
  Habit,
  HabitCompletion,
  HabitInsight,
  HeatmapDay,
  TimePeriod,
} from '@/types';

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

// Format date as YYYY-MM-DD (using local timezone)
export function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Get array of date strings for a range
export function getDateRange(endDate: Date, days: number): string[] {
  const dates: string[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(endDate);
    date.setDate(date.getDate() - i);
    dates.push(formatDate(date));
  }
  return dates;
}

// Check if a date is a scheduled day for the habit
function isScheduledDay(habit: Habit, dateStr: string): boolean {
  if (habit.frequency === 'daily') return true;
  const date = new Date(dateStr + 'T12:00:00');
  const dayOfWeek = JS_DAY_TO_DAY_OF_WEEK[date.getDay()];
  return habit.selectedDays?.includes(dayOfWeek) ?? false;
}

// Get week number of the year
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Calculate completion rate for a single day
export function calculateDailyCompletionRate(
  habits: Habit[],
  completions: HabitCompletion[],
  date: string
): { rate: number; completed: number; total: number } {
  const activeHabits = habits.filter((h) => {
    const createdDate = h.createdAt.split('T')[0];
    return createdDate <= date && isScheduledDay(h, date);
  });

  if (activeHabits.length === 0) return { rate: 0, completed: 0, total: 0 };

  const completed = activeHabits.filter((habit) =>
    completions.some(
      (c) => c.habitId === habit.id && c.date === date && c.isComplete
    )
  ).length;

  return {
    rate: Math.round((completed / activeHabits.length) * 100),
    completed,
    total: activeHabits.length,
  };
}

type PeriodStatsInput = {
  habits: Habit[];
  completions: HabitCompletion[];
  dates: string[];
};

// Helper to calculate period stats
function calculatePeriodStats({
  habits,
  completions,
  dates,
}: PeriodStatsInput) {
  const today = new Date();
  let totalRate = 0;
  let totalCompleted = 0;
  let totalHabits = 0;
  let daysWithData = 0;

  for (const dateStr of dates) {
    const date = new Date(dateStr + 'T12:00:00');
    if (date <= today) {
      const { rate, completed, total } = calculateDailyCompletionRate(
        habits,
        completions,
        dateStr
      );
      if (total > 0) {
        totalRate += rate;
        totalCompleted += completed;
        totalHabits += total;
        daysWithData++;
      }
    }
  }

  return { totalRate, totalCompleted, totalHabits, daysWithData };
}

// Calculate daily trends
function calculateDailyTrends(
  habits: Habit[],
  completions: HabitCompletion[]
): CompletionDataPoint[] {
  const dates = getDateRange(new Date(), 7);
  return dates.map((date) => {
    const { rate, completed, total } = calculateDailyCompletionRate(
      habits,
      completions,
      date
    );
    const dateObj = new Date(date + 'T12:00:00');
    return {
      date,
      label: dateObj.toLocaleDateString('en-US', { weekday: 'short' }),
      completionRate: rate,
      completedCount: completed,
      totalCount: total,
    };
  });
}

// Calculate weekly trends
function calculateWeeklyTrends(
  habits: Habit[],
  completions: HabitCompletion[]
): CompletionDataPoint[] {
  const today = new Date();
  const dataPoints: CompletionDataPoint[] = [];

  for (let i = 7; i >= 0; i--) {
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() - i * 7);
    const weekStart = new Date(weekEnd);
    weekStart.setDate(weekStart.getDate() - 6);

    const dates = getDateRange(weekEnd, 7);
    const stats = calculatePeriodStats({ habits, completions, dates });

    dataPoints.push({
      date: formatDate(weekStart),
      label: `W${getWeekNumber(weekStart)}`,
      completionRate:
        stats.daysWithData > 0
          ? Math.round(stats.totalRate / stats.daysWithData)
          : 0,
      completedCount: stats.totalCompleted,
      totalCount: Math.round(
        stats.totalHabits / Math.max(stats.daysWithData, 1)
      ),
    });
  }

  return dataPoints;
}

// Calculate monthly trends
function calculateMonthlyTrends(
  habits: Habit[],
  completions: HabitCompletion[]
): CompletionDataPoint[] {
  const today = new Date();
  const dataPoints: CompletionDataPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const daysInMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    ).getDate();

    const dates: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      dates.push(
        formatDate(new Date(monthDate.getFullYear(), monthDate.getMonth(), d))
      );
    }

    const stats = calculatePeriodStats({ habits, completions, dates });

    dataPoints.push({
      date: formatDate(monthDate),
      label: monthDate.toLocaleDateString('en-US', { month: 'short' }),
      completionRate:
        stats.daysWithData > 0
          ? Math.round(stats.totalRate / stats.daysWithData)
          : 0,
      completedCount: stats.totalCompleted,
      totalCount: Math.round(
        stats.totalHabits / Math.max(stats.daysWithData, 1)
      ),
    });
  }

  return dataPoints;
}

// Calculate completion trends for charts
export function calculateCompletionTrends(
  habits: Habit[],
  completions: HabitCompletion[],
  period: TimePeriod
): CompletionDataPoint[] {
  if (period === 'daily') return calculateDailyTrends(habits, completions);
  if (period === 'weekly') return calculateWeeklyTrends(habits, completions);
  return calculateMonthlyTrends(habits, completions);
}

// Get completion level for heatmap (0-4)
export function getCompletionLevel(rate: number): 0 | 1 | 2 | 3 | 4 {
  if (rate === 0) return 0;
  if (rate <= 25) return 1;
  if (rate <= 50) return 2;
  if (rate <= 75) return 3;
  return 4;
}

// Generate heatmap data for past N days
export function generateHeatmapData(
  habits: Habit[],
  completions: HabitCompletion[],
  days: number = 91
): HeatmapDay[] {
  const dates = getDateRange(new Date(), days);
  return dates.map((date) => {
    const { rate } = calculateDailyCompletionRate(habits, completions, date);
    return {
      date,
      completionRate: rate,
      completionLevel: getCompletionLevel(rate),
    };
  });
}

type HabitInsightInput = {
  habit: Habit;
  completions: HabitCompletion[];
  dateRanges: { last30Days: string[]; last7Days: string[] };
};

// Calculate insight for a single habit
function calculateSingleHabitInsight({
  habit,
  completions,
  dateRanges,
}: HabitInsightInput): HabitInsight {
  const { last30Days, last7Days } = dateRanges;
  const habitCompletions = completions.filter((c) => c.habitId === habit.id);
  const totalCompletions = habitCompletions.filter((c) => c.isComplete).length;

  let completedDays = 0;
  let scheduledDays = 0;
  for (const date of last30Days) {
    if (isScheduledDay(habit, date) && habit.createdAt.split('T')[0] <= date) {
      scheduledDays++;
      if (habitCompletions.some((c) => c.date === date && c.isComplete)) {
        completedDays++;
      }
    }
  }

  const weeklyProgress = last7Days.map((date) => {
    if (!isScheduledDay(habit, date)) return false;
    return habitCompletions.some((c) => c.date === date && c.isComplete);
  });

  return {
    habitId: habit.id,
    name: habit.name,
    emoji: habit.emoji ?? '',
    currentStreak: habit.currentStreak,
    longestStreak: habit.longestStreak,
    totalCompletions,
    averageCompletionRate:
      scheduledDays > 0 ? Math.round((completedDays / scheduledDays) * 100) : 0,
    weeklyProgress,
  };
}

// Calculate per-habit insights
export function calculateHabitInsights(
  habits: Habit[],
  completions: HabitCompletion[]
): HabitInsight[] {
  const today = new Date();
  const last30Days = getDateRange(today, 30);
  const last7Days = getDateRange(today, 7);
  const dateRanges = { last30Days, last7Days };
  return habits.map((habit) =>
    calculateSingleHabitInsight({ habit, completions, dateRanges })
  );
}

// Calculate daily streak for all habits combined
function calculateAllHabitsDailyStreak(
  habits: Habit[],
  completions: HabitCompletion[],
  fromDate: string
): number {
  if (habits.length === 0) return 0;

  let streak = 0;
  let currentDate = fromDate;

  for (let i = 0; i < 365; i++) {
    const scheduled = habits.filter((h) => {
      const created = h.createdAt.split('T')[0];
      return created <= currentDate && isScheduledDay(h, currentDate);
    });

    if (scheduled.length === 0) {
      const date = new Date(currentDate + 'T12:00:00');
      date.setDate(date.getDate() - 1);
      currentDate = formatDate(date);
      continue;
    }

    const allComplete = scheduled.every((habit) =>
      completions.some(
        (c) => c.habitId === habit.id && c.date === currentDate && c.isComplete
      )
    );

    if (!allComplete) break;
    streak++;

    const date = new Date(currentDate + 'T12:00:00');
    date.setDate(date.getDate() - 1);
    currentDate = formatDate(date);
  }

  return streak;
}

// Calculate overall analytics summary
export function calculateAnalyticsSummary(
  habits: Habit[],
  completions: HabitCompletion[]
): AnalyticsSummary {
  const today = formatDate(new Date());
  const last7Days = getDateRange(new Date(), 7);

  let totalRate = 0;
  let daysWithData = 0;
  for (const date of last7Days) {
    const { rate, total } = calculateDailyCompletionRate(
      habits,
      completions,
      date
    );
    if (total > 0) {
      totalRate += rate;
      daysWithData++;
    }
  }

  return {
    totalHabits: habits.length,
    overallCompletionRate:
      daysWithData > 0 ? Math.round(totalRate / daysWithData) : 0,
    currentDailyStreak: calculateAllHabitsDailyStreak(
      habits,
      completions,
      today
    ),
    longestDailyStreak: calculateAllHabitsDailyStreak(
      habits,
      completions,
      today
    ),
    totalCompletionsAllTime: completions.filter((c) => c.isComplete).length,
  };
}
