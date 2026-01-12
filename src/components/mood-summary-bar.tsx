import * as React from 'react';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';

import { Text, View } from '@/components/ui';
import type { JournalEntry, MoodLevel } from '@/types';

const MOOD_COLORS: Record<MoodLevel, string> = {
  1: 'bg-danger-400',
  2: 'bg-warning-400',
  3: 'bg-neutral-400',
  4: 'bg-success-400',
  5: 'bg-success-500',
};

const MOOD_LABELS: Record<MoodLevel, string> = {
  1: 'Rough',
  2: 'Low',
  3: 'Okay',
  4: 'Good',
  5: 'Great',
};

const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: '😿',
  2: '😾',
  3: '😐',
  4: '😺',
  5: '😻',
};

type Props = {
  entries: JournalEntry[];
  month: Date;
};

function getMonthName(date: Date): string {
  return date.toLocaleDateString('en-US', { month: 'long' });
}

function getAverageMood(entries: JournalEntry[]): MoodLevel {
  if (entries.length === 0) return 3;
  const sum = entries.reduce((acc, entry) => acc + entry.mood, 0);
  return Math.round(sum / entries.length) as MoodLevel;
}

function getMoodSummaryText(avgMood: MoodLevel): string {
  if (avgMood >= 4) return 'Mostly Good';
  if (avgMood === 3) return 'Balanced';
  return 'Challenging';
}

type HeaderProps = {
  monthName: string;
  avgMood: MoodLevel;
};

function MoodHeader({ monthName, avgMood }: HeaderProps): React.ReactElement {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <View className="flex-row items-center">
        <Text className="font-nunito-semibold text-base text-neutral-800 dark:text-neutral-100">
          {monthName} Mood
        </Text>
        <Text className="ml-2 text-xl">{MOOD_EMOJIS[avgMood]}</Text>
      </View>
      <View className="flex-row items-center rounded-full bg-neutral-100 px-3 py-1 dark:bg-charcoal-700">
        <Text className="font-poppins-medium text-xs text-neutral-600 dark:text-neutral-300">
          {getMoodSummaryText(avgMood)}
        </Text>
      </View>
    </View>
  );
}

type TimelineProps = {
  entries: JournalEntry[];
};

function MoodTimeline({ entries }: TimelineProps): React.ReactElement {
  return (
    <View className="flex-row items-center">
      {entries.slice(0, 14).map((entry, index) => (
        <Animated.View
          key={entry.id}
          entering={FadeInRight.delay(index * 30).springify()}
          className={`mr-1 h-6 w-3 rounded-full ${MOOD_COLORS[entry.mood]}`}
        />
      ))}
      {entries.length > 14 && (
        <Text className="ml-1 font-poppins text-xs text-neutral-400">
          +{entries.length - 14}
        </Text>
      )}
    </View>
  );
}

type StatsProps = {
  totalEntries: number;
  goodDays: number;
  avgMood: MoodLevel;
};

function MoodStats({
  totalEntries,
  goodDays,
  avgMood,
}: StatsProps): React.ReactElement {
  return (
    <View className="mt-3 flex-row justify-around border-t border-neutral-100 pt-3 dark:border-charcoal-700">
      <View className="items-center">
        <Text className="font-nunito-bold text-lg text-primary-500">
          {totalEntries}
        </Text>
        <Text className="font-poppins text-xs text-neutral-500">Entries</Text>
      </View>
      <View className="items-center">
        <Text className="font-nunito-bold text-lg text-success-500">
          {goodDays}
        </Text>
        <Text className="font-poppins text-xs text-neutral-500">Good Days</Text>
      </View>
      <View className="items-center">
        <Text className="font-nunito-bold text-lg text-neutral-600 dark:text-neutral-300">
          {MOOD_LABELS[avgMood]}
        </Text>
        <Text className="font-poppins text-xs text-neutral-500">Average</Text>
      </View>
    </View>
  );
}

export function MoodSummaryBar({ entries, month }: Props): React.ReactElement {
  const monthEntries = React.useMemo(() => {
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date + 'T00:00:00');
      return (
        entryDate.getFullYear() === year && entryDate.getMonth() === monthNum
      );
    });
  }, [entries, month]);

  const sortedEntries = React.useMemo(() => {
    return [...monthEntries].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [monthEntries]);

  const avgMood = getAverageMood(monthEntries);
  const monthName = getMonthName(month);
  const goodDays = monthEntries.filter((e) => e.mood >= 4).length;

  if (monthEntries.length === 0) {
    return (
      <Animated.View
        entering={FadeIn.duration(300)}
        className="mb-4 rounded-2xl bg-white p-4 dark:bg-charcoal-850"
      >
        <Text className="text-center font-poppins text-sm text-neutral-500 dark:text-neutral-400">
          No entries for {monthName} yet
        </Text>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="mb-4 rounded-2xl bg-white p-4 dark:bg-charcoal-850"
    >
      <MoodHeader monthName={monthName} avgMood={avgMood} />
      <MoodTimeline entries={sortedEntries} />
      <MoodStats
        totalEntries={monthEntries.length}
        goodDays={goodDays}
        avgMood={avgMood}
      />
    </Animated.View>
  );
}
