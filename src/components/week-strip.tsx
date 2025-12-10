import * as React from 'react';
import { Pressable } from 'react-native';

import { cn } from '@/lib';
import { useHabitStore } from '@/lib/stores';

import { Text, View } from './ui';

type DayInfo = {
  dayName: string;
  date: number;
  fullDate: string;
  isToday: boolean;
  isCompleted: boolean;
};

function getWeekDays(): DayInfo[] {
  const today = new Date();
  const days: DayInfo[] = [];
  const dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    const fullDate = date.toISOString().split('T')[0];
    days.push({
      dayName: dayNames[i],
      date: date.getDate(),
      fullDate,
      isToday: fullDate === today.toISOString().split('T')[0],
      isCompleted: false,
    });
  }
  return days;
}

type DayButtonProps = {
  day: DayInfo;
  isSelected: boolean;
  onPress: () => void;
};

function DayButton({
  day,
  isSelected,
  onPress,
}: DayButtonProps): React.ReactElement {
  const isSelectedNotToday = isSelected && !day.isToday;

  return (
    <Pressable onPress={onPress} className="flex-1 items-center">
      <Text
        className={cn(
          'text-xs font-medium',
          day.isToday ? 'text-primary-500' : 'text-neutral-400',
          isSelectedNotToday && 'text-primary-600'
        )}
      >
        {day.dayName}
      </Text>
      <View
        className={cn(
          'mt-2 size-10 items-center justify-center rounded-full',
          day.isToday && 'bg-primary-500',
          isSelectedNotToday && 'border-2 border-primary-500',
          !day.isToday && !isSelected && day.isCompleted && 'bg-success-100'
        )}
      >
        <Text
          className={cn(
            'text-base font-semibold',
            day.isToday && 'text-white',
            !day.isToday && 'text-neutral-700',
            isSelectedNotToday && 'text-primary-600'
          )}
        >
          {day.date}
        </Text>
      </View>
      <View className="mt-2 size-2 rounded-full">
        {day.isCompleted && !day.isToday && (
          <View className="size-2 rounded-full bg-success-500" />
        )}
        {day.isToday && day.isCompleted && (
          <View className="size-2 rounded-full bg-primary-300" />
        )}
      </View>
    </Pressable>
  );
}

type Props = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export function WeekStrip({
  selectedDate,
  onSelectDate,
}: Props): React.ReactElement {
  const habits = useHabitStore.use.habits();
  const completions = useHabitStore.use.completions();

  const weekDays = React.useMemo(() => {
    const days = getWeekDays();
    return days.map((day) => {
      if (habits.length === 0) return { ...day, isCompleted: false };
      const allCompleted = habits.every((habit) => {
        const completion = completions.find(
          (c) => c.habitId === habit.id && c.date === day.fullDate
        );
        return completion?.isComplete ?? false;
      });
      return { ...day, isCompleted: allCompleted };
    });
  }, [habits, completions]);

  return (
    <View className="mx-4 rounded-2xl bg-white px-2 py-4">
      <View className="flex-row justify-between">
        {weekDays.map((day) => (
          <DayButton
            key={day.fullDate}
            day={day}
            isSelected={day.fullDate === selectedDate}
            onPress={() => onSelectDate(day.fullDate)}
          />
        ))}
      </View>
    </View>
  );
}
