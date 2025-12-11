import * as React from 'react';
import { ScrollView } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { Greeting } from '@/components/greeting';
import { HabitCard } from '@/components/habit-card';
import {
  FocusAwareStatusBar,
  Image,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { WeekStrip } from '@/components/week-strip';
import { useHabitStore } from '@/lib/stores';
import type { Habit, HabitCompletion, TimeOfDay } from '@/types';

const TIME_OF_DAY_CONFIG: Record<TimeOfDay, { label: string; emoji: string }> =
  {
    morning: { label: 'Morning', emoji: '☀️' },
    afternoon: { label: 'Afternoon', emoji: '🌤️' },
    evening: { label: 'Evening', emoji: '🌙' },
  };

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDateLabel(dateStr: string): string {
  const today = getToday();
  if (dateStr === today) return 'Today';

  const date = new Date(dateStr + 'T12:00:00');
  const todayDate = new Date(today + 'T12:00:00');
  const diff = Math.round(
    (todayDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diff === 1) return 'Yesterday';
  if (diff === -1) return 'Tomorrow';

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
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
    <View className="mb-6">
      <View className="mb-3 flex-row items-center">
        <Text className="mr-2 text-lg">{config.emoji}</Text>
        <Text className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
          {config.label}
        </Text>
      </View>
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

export default function Today(): React.ReactElement {
  const habits = useHabitStore.use.habits();
  const completions = useHabitStore.use.completions();

  const [selectedDate, setSelectedDate] = React.useState<string>(getToday());

  const isToday = selectedDate === getToday();
  const hasHabits = habits.length > 0;
  const dateLabel = formatDateLabel(selectedDate);

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
    <SafeAreaView className="flex-1 bg-neutral-50">
      <FocusAwareStatusBar />
      <Header dateLabel={dateLabel} />
      {hasHabits ? (
        <HabitsList
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isToday={isToday}
          dateLabel={dateLabel}
          habitsByTime={habitsByTime}
          completions={completions}
        />
      ) : (
        <EmptyState type="habits" />
      )}
    </SafeAreaView>
  );
}

function Header({ dateLabel }: { dateLabel: string }): React.ReactElement {
  return (
    <View className="flex-row items-center justify-between px-4 py-2">
      <View className="flex-row items-center">
        <Image
          source={require('../../../assets/images/logo.png')}
          style={{ width: 50, height: 50 }}
          contentFit="contain"
          className="mr-2"
        />
        <Text className="text-xl font-bold text-neutral-800">{dateLabel}</Text>
      </View>
    </View>
  );
}

type HabitsListProps = {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  isToday: boolean;
  dateLabel: string;
  habitsByTime: { timeOfDay: TimeOfDay; habits: Habit[] }[];
  completions: HabitCompletion[];
};

function HabitsList({
  selectedDate,
  setSelectedDate,
  isToday,
  dateLabel,
  habitsByTime,
  completions,
}: HabitsListProps): React.ReactElement {
  return (
    <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
      <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
      {isToday && <Greeting />}
      {!isToday && (
        <View className="mx-4 mt-4 rounded-xl bg-neutral-100 p-3">
          <Text className="text-center text-sm text-neutral-600">
            Viewing {dateLabel.toLowerCase()} • Tap habits to edit
          </Text>
        </View>
      )}
      <View className="px-4 pb-8 pt-4">
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
