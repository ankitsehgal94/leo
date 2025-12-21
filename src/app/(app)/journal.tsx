import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { EmptyState } from '@/components/empty-state';
import { GroupedJournalList } from '@/components/grouped-journal-list';
import { JournalCalendar } from '@/components/journal-calendar';
import { MoodSummaryBar } from '@/components/mood-summary-bar';
import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { useJournalStore } from '@/lib/stores';
import type { JournalEntry } from '@/types';

type ViewMode = 'list' | 'calendar';

type CalendarViewProps = {
  entries: JournalEntry[];
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  onDayPress: (date: string, entryId?: string) => void;
};

function CalendarView({
  entries,
  selectedMonth,
  onMonthChange,
  onDayPress,
}: CalendarViewProps): React.ReactElement {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 32 }}
    >
      <View className="mx-4">
        <MoodSummaryBar entries={entries} month={selectedMonth} />
      </View>
      <JournalCalendar
        entries={entries}
        selectedMonth={selectedMonth}
        onMonthChange={onMonthChange}
        onDayPress={onDayPress}
      />
    </ScrollView>
  );
}

export default function Journal(): React.ReactElement {
  const router = useRouter();
  const entries = useJournalStore.use.entries();
  const [viewMode, setViewMode] = React.useState<ViewMode>('list');
  const [selectedMonth, setSelectedMonth] = React.useState(() => new Date());

  const sortedEntries = React.useMemo(() => {
    return [...entries].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }, [entries]);

  const handleNewEntry = (): void => router.push('/reflection/add');
  const handleEntryPress = (id: string): void =>
    router.push(`/reflection/add?edit=${id}`);
  const handleDayPress = (date: string, entryId?: string): void => {
    router.push(
      entryId
        ? `/reflection/add?edit=${entryId}`
        : `/reflection/add?date=${date}`
    );
  };

  const listHeader = (
    <View className="pb-2">
      <MoodSummaryBar entries={sortedEntries} month={selectedMonth} />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-charcoal-950">
      <FocusAwareStatusBar />
      <JournalHeader
        onNewEntry={handleNewEntry}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />
      {entries.length > 0 ? (
        viewMode === 'list' ? (
          <GroupedJournalList
            entries={sortedEntries}
            onEntryPress={handleEntryPress}
            ListHeaderComponent={listHeader}
          />
        ) : (
          <CalendarView
            entries={sortedEntries}
            selectedMonth={selectedMonth}
            onMonthChange={setSelectedMonth}
            onDayPress={handleDayPress}
          />
        )
      ) : (
        <EmptyState type="journal" />
      )}
    </SafeAreaView>
  );
}

type HeaderProps = {
  onNewEntry: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

function JournalHeader({
  onNewEntry,
  viewMode,
  onViewModeChange,
}: HeaderProps): React.ReactElement {
  return (
    <View className="px-4 py-2">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Text className="text-2xl">📝</Text>
          <Text className="ml-2 font-nunito-bold text-xl text-neutral-800 dark:text-neutral-100">
            Journal
          </Text>
        </View>
        <Pressable
          onPress={onNewEntry}
          className="rounded-full bg-primary-500 px-4 py-2"
        >
          <Text className="font-poppins-semibold text-white">New</Text>
        </Pressable>
      </View>
      <ViewModeToggle viewMode={viewMode} onViewModeChange={onViewModeChange} />
    </View>
  );
}

type ToggleProps = {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
};

function ViewModeToggle({
  viewMode,
  onViewModeChange,
}: ToggleProps): React.ReactElement {
  return (
    <Animated.View
      entering={FadeIn.duration(200)}
      className="mt-3 flex-row rounded-xl bg-neutral-100 p-1 dark:bg-charcoal-850"
    >
      <ToggleButton
        label="List"
        icon="📋"
        isActive={viewMode === 'list'}
        onPress={() => onViewModeChange('list')}
      />
      <ToggleButton
        label="Calendar"
        icon="📅"
        isActive={viewMode === 'calendar'}
        onPress={() => onViewModeChange('calendar')}
      />
    </Animated.View>
  );
}

type ToggleButtonProps = {
  label: string;
  icon: string;
  isActive: boolean;
  onPress: () => void;
};

function ToggleButton({
  label,
  icon,
  isActive,
  onPress,
}: ToggleButtonProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      className={`flex-1 flex-row items-center justify-center rounded-lg py-2 ${
        isActive ? 'bg-white dark:bg-charcoal-700' : 'bg-transparent'
      }`}
    >
      <Text className={`mr-1 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
        {icon}
      </Text>
      <Text
        className={`font-poppins-medium text-sm ${
          isActive
            ? 'text-neutral-800 dark:text-neutral-100'
            : 'text-neutral-500 dark:text-neutral-400'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}
