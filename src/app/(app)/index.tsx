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
  };

function getToday(): string {
  return new Date().toISOString().split('T')[0];
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

  const habitsByTime = React.useMemo(() => {
    const timeOfDays: TimeOfDay[] = ['morning', 'afternoon', 'evening'];
    return timeOfDays
      .map((time) => ({
        timeOfDay: time,
        habits: habits.filter((h) => h.timeOfDay === time),
      }))
      .filter((group) => group.habits.length > 0);
  }, [habits]);

  return (
    <SafeAreaView className="flex-1 bg-neutral-100">
      <FocusAwareStatusBar />
      {hasHabits ? (
        <HabitsList
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          habitsByTime={habitsByTime}
          completions={completions}
          completionStats={completionStats}
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
      <Text className="font-poppins-medium text-xs tracking-wide text-neutral-500">
        {dateLabel}
      </Text>
      <Text className="mt-1 font-nunito-extrabold text-2xl text-neutral-800">
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

type HabitsListProps = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  habitsByTime: { timeOfDay: TimeOfDay; habits: Habit[] }[];
  completions: HabitCompletion[];
  completionStats: CompletionStats;
  userName?: string;
};

function HabitsList({
  selectedDate,
  setSelectedDate,
  habitsByTime,
  completions,
  completionStats,
  userName,
}: HabitsListProps): React.ReactElement {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <Header selectedDate={selectedDate} userName={userName} />
      <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      <DailyInsight
        completedCount={completionStats.completedCount}
        totalCount={completionStats.totalCount}
      />

      {/* Habits Section */}
      <View className="mt-4 px-4">
        <View className="flex-row items-center justify-between">
          <Text className="text-lg font-bold text-neutral-800">
            Your Habits
          </Text>
          <Text className="text-sm text-neutral-500">
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
        <Text className="text-xs font-semibold tracking-wide text-neutral-400">
          {config.label}
        </Text>
        <View className="ml-2 h-px flex-1 bg-neutral-200" />
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
