import * as React from 'react';
import { Pressable, SectionList, type SectionListData } from 'react-native';
import Animated, { FadeInDown, FadeInLeft } from 'react-native-reanimated';

import { Text, View } from '@/components/ui';
import type { JournalEntry, MoodLevel } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const MOOD_EMOJIS: Record<MoodLevel, string> = {
  1: '😿',
  2: '😾',
  3: '😐',
  4: '😺',
  5: '😻',
};

type Section = {
  title: string;
  icon: string;
  data: JournalEntry[];
};

type Props = {
  entries: JournalEntry[];
  onEntryPress: (id: string) => void;
  ListHeaderComponent?: React.ReactElement;
};

function getStartOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day;
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function formatDateForCard(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const entryDate = new Date(dateStr + 'T00:00:00');
  entryDate.setHours(0, 0, 0, 0);

  if (entryDate.getTime() === today.getTime()) {
    return 'Today';
  }
  if (entryDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

type CategorizedEntries = {
  thisWeek: JournalEntry[];
  lastWeek: JournalEntry[];
  byMonth: Record<string, JournalEntry[]>;
};

function categorizeEntries(
  entries: JournalEntry[],
  startOfThisWeek: Date,
  startOfLastWeek: Date
): CategorizedEntries {
  const thisWeek: JournalEntry[] = [];
  const lastWeek: JournalEntry[] = [];
  const byMonth: Record<string, JournalEntry[]> = {};

  entries.forEach((entry) => {
    const entryDate = new Date(entry.date + 'T00:00:00');
    entryDate.setHours(0, 0, 0, 0);

    if (entryDate >= startOfThisWeek) {
      thisWeek.push(entry);
    } else if (entryDate >= startOfLastWeek) {
      lastWeek.push(entry);
    } else {
      const monthKey = entryDate.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      });
      if (!byMonth[monthKey]) byMonth[monthKey] = [];
      byMonth[monthKey].push(entry);
    }
  });

  return { thisWeek, lastWeek, byMonth };
}

function buildSections({
  thisWeek,
  lastWeek,
  byMonth,
}: CategorizedEntries): Section[] {
  const sections: Section[] = [];

  if (thisWeek.length > 0) {
    sections.push({ title: 'This Week', icon: '📅', data: thisWeek });
  }
  if (lastWeek.length > 0) {
    sections.push({ title: 'Last Week', icon: '📆', data: lastWeek });
  }

  Object.entries(byMonth)
    .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
    .forEach(([monthKey, monthEntries]) => {
      sections.push({ title: monthKey, icon: '🗓️', data: monthEntries });
    });

  return sections;
}

function groupEntriesByTimePeriod(entries: JournalEntry[]): Section[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const startOfThisWeek = getStartOfWeek(today);
  const startOfLastWeek = new Date(startOfThisWeek);
  startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

  const sortedEntries = [...entries].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const categorized = categorizeEntries(
    sortedEntries,
    startOfThisWeek,
    startOfLastWeek
  );
  return buildSections(categorized);
}

export function GroupedJournalList({
  entries,
  onEntryPress,
  ListHeaderComponent,
}: Props): React.ReactElement {
  const sections = React.useMemo(
    () => groupEntriesByTimePeriod(entries),
    [entries]
  );

  const renderSectionHeader = ({
    section,
  }: {
    section: SectionListData<JournalEntry, Section>;
  }): React.ReactElement => (
    <Animated.View
      entering={FadeInLeft.duration(300)}
      className="flex-row items-center bg-neutral-50 pb-2 pt-4 dark:bg-charcoal-950"
    >
      <Text className="mr-2 text-lg">{section.icon}</Text>
      <Text className="font-nunito-bold text-base text-neutral-700 dark:text-neutral-200">
        {section.title}
      </Text>
      <View className="ml-3 h-px flex-1 bg-neutral-200 dark:bg-charcoal-700" />
      <View className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 dark:bg-charcoal-700">
        <Text className="font-poppins-medium text-xs text-neutral-500 dark:text-neutral-400">
          {section.data.length}
        </Text>
      </View>
    </Animated.View>
  );

  const renderItem = ({
    item,
    index,
  }: {
    item: JournalEntry;
    index: number;
  }): React.ReactElement => (
    <JournalEntryCard
      entry={item}
      index={index}
      onPress={() => onEntryPress(item.id)}
    />
  );

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderSectionHeader={renderSectionHeader}
      renderItem={renderItem}
      stickySectionHeadersEnabled
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={<View className="h-8" />}
    />
  );
}

type CardProps = {
  entry: JournalEntry;
  index: number;
  onPress: () => void;
};

function JournalEntryCard({
  entry,
  index,
  onPress,
}: CardProps): React.ReactElement {
  const moodEmoji = entry.mood ? MOOD_EMOJIS[entry.mood] : '😺';
  const displayTitle = entry.title || 'Untitled Entry';
  const displayText = entry.text || '';

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 40).springify()}
      onPress={onPress}
      className="mb-2 flex-row rounded-2xl bg-white p-4 dark:bg-charcoal-850"
    >
      {/* Mood Emoji */}
      <View className="mr-3 size-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-charcoal-700">
        <Text className="text-2xl">{moodEmoji}</Text>
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-center justify-between">
          <Text
            className="flex-1 font-nunito-semibold text-base text-neutral-800 dark:text-neutral-100"
            numberOfLines={1}
          >
            {displayTitle}
          </Text>
          <Text className="ml-2 font-poppins text-xs text-primary-500">
            {formatDateForCard(entry.date)}
          </Text>
        </View>
        {displayText ? (
          <Text
            className="mt-1 font-poppins text-sm text-neutral-500 dark:text-neutral-400"
            numberOfLines={2}
          >
            {displayText}
          </Text>
        ) : null}
        {entry.time && (
          <Text className="mt-1 font-poppins text-xs text-neutral-400 dark:text-neutral-500">
            {entry.time}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}
