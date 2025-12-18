import * as React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

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
  const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
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

type DayStatusDotProps = {
  isToday: boolean;
  isCompleted: boolean;
};

function DayStatusDot({
  isToday,
  isCompleted,
}: DayStatusDotProps): React.ReactElement {
  return (
    <View className="mt-1 h-1.5">
      {isCompleted && <View className="size-1.5 rounded-full bg-success-500" />}
      {isToday && !isCompleted && (
        <View className="size-1.5 rounded-full bg-primary-500" />
      )}
    </View>
  );
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
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (): void => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <Pressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      className="flex-1 items-center"
    >
      <Text
        className={cn(
          'text-[10px] font-medium tracking-wide',
          isSelected ? 'text-primary-500' : 'text-neutral-400'
        )}
      >
        {day.dayName}
      </Text>
      <Animated.View style={animatedStyle} className="mt-1 items-center">
        <View
          className={cn(
            'items-center justify-center',
            isSelected && 'h-14 w-9 rounded-full bg-primary-500',
            !isSelected && 'size-9'
          )}
        >
          <Text
            className={cn(
              'text-base font-semibold',
              isSelected ? 'text-white' : 'text-neutral-700'
            )}
          >
            {day.date}
          </Text>
          {isSelected && (
            <View className="mt-1 size-1.5 rounded-full bg-white/70" />
          )}
        </View>
        {!isSelected && (
          <DayStatusDot isToday={day.isToday} isCompleted={day.isCompleted} />
        )}
      </Animated.View>
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
    <View className="mx-4 rounded-2xl px-2 py-3">
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
