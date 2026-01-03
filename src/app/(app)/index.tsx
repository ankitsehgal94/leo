import * as React from 'react';
import { ScrollView } from 'react-native';

import { DailyInsight } from '@/components/daily-insight';
import { EmptyState } from '@/components/empty-state';
import { HabitCard } from '@/components/habit-card';
import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { WeekStrip } from '@/components/week-strip';
import { useHabitStore, useUserStore } from '@/lib/stores';
import type { Habit, HabitCompletion, TimeOfDay } from '@/types';

const TIME_OF_DAY_CONFIG: Record<TimeOfDay, { label: string; emoji: string }> =
  {
    morning: { label: 'MORNING', emoji: '☀️' },
    afternoon: { label: 'AFTERNOON', emoji: '☀️' },
    evening: { label: 'EVENING', emoji: '🌙' },
    anytime: { label: 'ANYTIME', emoji: '∞' },
  };

function getToday(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function calculateDailyStreak(
  habits: Habit[],
  completions: HabitCompletion[]
): { current: number; longest: number } {
  if (habits.length === 0) return { current: 0, longest: 0 };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  let currentStreakBroken = false;

  // Check up to 365 days back
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(checkDate.getDate() - i);
    const dateStr = getLocalDateString(checkDate);

    // Only check habits that existed on this day
    const habitsForDay = habits.filter((habit) => {
      const createdDate = habit.createdAt.split('T')[0];
      return dateStr >= createdDate;
    });

    if (habitsForDay.length === 0) break;

    const allCompleted = habitsForDay.every((habit) => {
      const completion = completions.find(
        (c) => c.habitId === habit.id && c.date === dateStr
      );
      return completion?.isComplete ?? false;
    });

    if (allCompleted) {
      tempStreak++;
      if (!currentStreakBroken) {
        currentStreak = tempStreak;
      }
      longestStreak = Math.max(longestStreak, tempStreak);
    } else if (i === 0) {
      // Today not complete yet - don't break current streak, just don't count today
      // Continue checking from yesterday
    } else {
      // Past day not complete - current streak is broken, but keep looking for longest
      currentStreakBroken = true;
      tempStreak = 0; // Reset temp streak to find other streaks in history
    }
  }

  return { current: currentStreak, longest: longestStreak };
}

function formatHeaderDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00');
  return date
    .toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    })
    .toUpperCase();
}

function useUserName(): string | undefined {
  return useUserStore((state) => state.userName);
}

export default function Today(): React.ReactElement {
  const habits = useHabitStore.use.habits();
  const completions = useHabitStore.use.completions();
  const userName = useUserName();

  const [selectedDate, setSelectedDate] = React.useState<string>(getToday());

  const hasHabits = habits.length > 0;

  // Calculate completion stats for selected date
  const completionStats = React.useMemo(() => {
    const totalCount = habits.length;
    const completedCount = habits.filter((habit) => {
      const completion = completions.find(
        (c) => c.habitId === habit.id && c.date === selectedDate
      );
      return completion?.isComplete === true;
    }).length;
    const remainingCount = totalCount - completedCount;
    return { totalCount, completedCount, remainingCount };
  }, [habits, completions, selectedDate]);

  // Calculate daily streak (all habits completed)
  const dailyStreak = React.useMemo(
    () => calculateDailyStreak(habits, completions),
    [habits, completions]
  );

  const habitsByTime = React.useMemo(() => {
    const timeOfDays: TimeOfDay[] = [
      'morning',
      'afternoon',
      'evening',
      'anytime',
    ];
    return timeOfDays
      .map((time) => ({
        timeOfDay: time,
        habits: habits.filter((h) => h.timeOfDay === time),
      }))
      .filter((group) => group.habits.length > 0);
  }, [habits]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-charcoal-950">
      <FocusAwareStatusBar />
      {hasHabits ? (
        <HabitsList
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          habitsByTime={habitsByTime}
          completions={completions}
          completionStats={completionStats}
          dailyStreak={dailyStreak}
          userName={userName}
        />
      ) : (
        <>
          <Header selectedDate={selectedDate} userName={userName} />
          <EmptyState type="habits" />
        </>
      )}
    </SafeAreaView>
  );
}

type HeaderProps = {
  selectedDate: string;
  userName?: string;
};

function Header({ selectedDate, userName }: HeaderProps): React.ReactElement {
  const displayName = userName || 'there';
  const dateLabel = formatHeaderDate(selectedDate);

  return (
    <View className="px-4 py-2">
      <Text className="font-poppins-medium text-xs tracking-wide text-neutral-500 dark:text-neutral-400">
        {dateLabel}
      </Text>
      <Text className="mt-1 font-nunito-extrabold text-2xl text-neutral-800 dark:text-neutral-100">
        Hello, {displayName}
      </Text>
    </View>
  );
}

type CompletionStats = {
  totalCount: number;
  completedCount: number;
  remainingCount: number;
};

type DailyStreakData = {
  current: number;
  longest: number;
};

type HabitsListProps = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  habitsByTime: { timeOfDay: TimeOfDay; habits: Habit[] }[];
  completions: HabitCompletion[];
  completionStats: CompletionStats;
  dailyStreak: DailyStreakData;
  userName?: string;
};

function HabitsList({
  selectedDate,
  setSelectedDate,
  habitsByTime,
  completions,
  completionStats,
  dailyStreak,
  userName,
}: HabitsListProps): React.ReactElement {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Header selectedDate={selectedDate} userName={userName} />
      <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <DailyInsight
        completedCount={completionStats.completedCount}
        totalCount={completionStats.totalCount}
        currentStreak={dailyStreak.current}
        longestStreak={dailyStreak.longest}
      />

      {/* Habits Section */}
      <View className="mt-4 px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-neutral-800 dark:text-neutral-100">
            Your Habits
          </Text>
          <Text className="text-sm text-neutral-500 dark:text-neutral-400">
            {completionStats.remainingCount} Remaining
          </Text>
        </View>
      </View>

      {/* Habit groups by time of day */}
      <View className="px-4 pb-24 pt-2">
        {habitsByTime.map(({ timeOfDay, habits }) => (
          <TimeGroup
            key={timeOfDay}
            timeOfDay={timeOfDay}
            habits={habits}
            selectedDate={selectedDate}
            completions={completions}
          />
        ))}
      </View>
    </ScrollView>
  );
}

type TimeGroupProps = {
  timeOfDay: TimeOfDay;
  habits: Habit[];
  selectedDate: string;
  completions: HabitCompletion[];
};

function TimeGroup({
  timeOfDay,
  habits,
  selectedDate,
  completions,
}: TimeGroupProps): React.ReactElement {
  const config = TIME_OF_DAY_CONFIG[timeOfDay];

  return (
    <View className="mt-4">
      {/* Section header with line */}
      <View className="mb-3 flex-row items-center">
        <Text className="mr-2">{config.emoji}</Text>
        <Text className="text-xs font-semibold tracking-wide text-neutral-400 dark:text-neutral-500">
          {config.label}
        </Text>
        <View className="ml-2 h-px flex-1 bg-neutral-200 dark:bg-charcoal-700" />
      </View>

      {/* Habit cards */}
      {habits.map((habit) => {
        const completion = completions.find(
          (c) => c.habitId === habit.id && c.date === selectedDate
        );
        return (
          <HabitCard
            key={habit.id}
            habit={habit}
            date={selectedDate}
            completion={completion}
          />
        );
      })}
    </View>
  );
}
