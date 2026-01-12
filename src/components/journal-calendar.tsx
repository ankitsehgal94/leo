import * as React from 'react';
import { Pressable } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { Text, View } from '@/components/ui';
import type { JournalEntry, MoodLevel } from '@/types';

const MOOD_COLORS: Record<MoodLevel, string> = {
  1: 'bg-danger-400',
  2: 'bg-warning-400',
  3: 'bg-neutral-400',
  4: 'bg-success-400',
  5: 'bg-success-500',
};

const MOOD_COLORS_LIGHT: Record<MoodLevel, string> = {
  1: 'bg-danger-100',
  2: 'bg-warning-100',
  3: 'bg-neutral-200',
  4: 'bg-success-100',
  5: 'bg-success-200',
};

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type Props = {
  entries: JournalEntry[];
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  onDayPress: (date: string, entryId?: string) => void;
};

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function formatMonthYear(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatDateString(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function generateCalendarWeeks(
  year: number,
  month: number
): (number | null)[][] {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  const calendarDays: (number | null)[] = [];

  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);
  while (calendarDays.length % 7 !== 0) calendarDays.push(null);

  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }
  return weeks;
}

type MonthHeaderProps = {
  selectedMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
};

function MonthHeader({
  selectedMonth,
  onPrevMonth,
  onNextMonth,
}: MonthHeaderProps): React.ReactElement {
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Pressable
        onPress={onPrevMonth}
        className="size-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-charcoal-700"
      >
        <Text className="text-lg text-neutral-600 dark:text-neutral-300">
          ‹
        </Text>
      </Pressable>
      <Text className="font-nunito-bold text-lg text-neutral-800 dark:text-neutral-100">
        {formatMonthYear(selectedMonth)}
      </Text>
      <Pressable
        onPress={onNextMonth}
        className="size-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-charcoal-700"
      >
        <Text className="text-lg text-neutral-600 dark:text-neutral-300">
          ›
        </Text>
      </Pressable>
    </View>
  );
}

function WeekdayHeaders(): React.ReactElement {
  return (
    <View className="mb-2 flex-row">
      {WEEKDAYS.map((day, index) => (
        <View key={index} className="flex-1 items-center">
          <Text className="font-poppins-medium text-xs text-neutral-400 dark:text-neutral-500">
            {day}
          </Text>
        </View>
      ))}
    </View>
  );
}

type DayCellProps = {
  day: number;
  dateStr: string;
  entry: JournalEntry | undefined;
  isToday: boolean;
  isFuture: boolean;
  animationDelay: number;
  onDayPress: (date: string, entryId?: string) => void;
};

function DayCell({
  day,
  dateStr,
  entry,
  isToday,
  isFuture,
  animationDelay,
  onDayPress,
}: DayCellProps): React.ReactElement {
  const bgClass = isToday
    ? 'border-2 border-primary-500'
    : entry
      ? MOOD_COLORS_LIGHT[entry.mood]
      : '';
  const textClass = isFuture
    ? 'text-neutral-300 dark:text-neutral-600'
    : isToday
      ? 'text-primary-500'
      : 'text-neutral-700 dark:text-neutral-200';

  return (
    <Pressable
      onPress={() => onDayPress(dateStr, entry?.id)}
      disabled={isFuture}
      className="flex-1 items-center p-1"
    >
      <Animated.View
        entering={FadeInDown.delay(animationDelay).springify()}
        className={`size-10 items-center justify-center rounded-full ${bgClass}`}
      >
        <Text className={`font-poppins-medium text-sm ${textClass}`}>
          {day}
        </Text>
        {entry && (
          <View
            className={`absolute bottom-1 size-1.5 rounded-full ${MOOD_COLORS[entry.mood]}`}
          />
        )}
      </Animated.View>
    </Pressable>
  );
}

type CalendarGridProps = {
  weeks: (number | null)[][];
  year: number;
  month: number;
  today: Date;
  entryMap: Record<string, JournalEntry>;
  onDayPress: (date: string, entryId?: string) => void;
};

function CalendarGrid({
  weeks,
  year,
  month,
  today,
  entryMap,
  onDayPress,
}: CalendarGridProps): React.ReactElement {
  return (
    <>
      {weeks.map((week, weekIndex) => (
        <View key={weekIndex} className="flex-row">
          {week.map((day, dayIndex) => {
            if (day === null) {
              return <View key={dayIndex} className="flex-1 p-1" />;
            }
            const dateStr = formatDateString(year, month, day);
            const isToday =
              today.getFullYear() === year &&
              today.getMonth() === month &&
              today.getDate() === day;
            return (
              <DayCell
                key={dayIndex}
                day={day}
                dateStr={dateStr}
                entry={entryMap[dateStr]}
                isToday={isToday}
                isFuture={new Date(dateStr + 'T00:00:00') > today}
                animationDelay={weekIndex * 50 + dayIndex * 10}
                onDayPress={onDayPress}
              />
            );
          })}
        </View>
      ))}
    </>
  );
}

const LEGEND_ITEMS = [
  { color: 'bg-success-500', label: 'Great' },
  { color: 'bg-success-400', label: 'Good' },
  { color: 'bg-neutral-400', label: 'Okay' },
  { color: 'bg-warning-400', label: 'Low' },
  { color: 'bg-danger-400', label: 'Bad' },
];

function MoodLegend(): React.ReactElement {
  return (
    <View className="mt-4 flex-row items-center justify-center gap-2 space-x-4">
      {LEGEND_ITEMS.map((item) => (
        <View key={item.label} className="flex-row items-center">
          <View className={`mr-1 size-2 rounded-full ${item.color}`} />
          <Text className="font-poppins text-xs text-neutral-500">
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function JournalCalendar({
  entries,
  selectedMonth,
  onMonthChange,
  onDayPress,
}: Props): React.ReactElement {
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();

  const today = React.useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const entryMap = React.useMemo(() => {
    const map: Record<string, JournalEntry> = {};
    entries.forEach((entry) => (map[entry.date] = entry));
    return map;
  }, [entries]);

  const weeks = React.useMemo(
    () => generateCalendarWeeks(year, month),
    [year, month]
  );

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="mx-4 rounded-2xl bg-white p-4 dark:bg-charcoal-850"
    >
      <MonthHeader
        selectedMonth={selectedMonth}
        onPrevMonth={() => onMonthChange(new Date(year, month - 1, 1))}
        onNextMonth={() => onMonthChange(new Date(year, month + 1, 1))}
      />
      <WeekdayHeaders />
      <CalendarGrid
        weeks={weeks}
        year={year}
        month={month}
        today={today}
        entryMap={entryMap}
        onDayPress={onDayPress}
      />
      <MoodLegend />
    </Animated.View>
  );
}
