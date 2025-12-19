import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView } from 'react-native';

import { EmptyState } from '@/components/empty-state';
import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { useJournalStore } from '@/lib/stores';

function formatDate(dateStr: string): string {
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

export default function Journal(): React.ReactElement {
  const router = useRouter();
  const entries = useJournalStore.use.entries();

  // Derive recent entries from the actual entries state
  const recentEntries = React.useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  }, [entries]);

  const hasEntries = entries.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-charcoal-950">
      <FocusAwareStatusBar />

      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-2">
        <View className="flex-row items-center">
          <Text className="text-2xl">📝</Text>
          <Text className="ml-2 text-xl font-bold text-neutral-800 dark:text-neutral-100">
            Journal
          </Text>
        </View>
        <Pressable
          onPress={() => router.push('/reflection/add')}
          className="rounded-full bg-primary-500 px-4 py-2"
        >
          <Text className="font-semibold text-white">New</Text>
        </Pressable>
      </View>

      {hasEntries ? (
        <ScrollView
          className="flex-1 px-4"
          showsVerticalScrollIndicator={false}
        >
          <Text className="mb-3 mt-4 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
            RECENT REFLECTIONS
          </Text>

          {recentEntries.map((entry) => (
            <Pressable
              key={entry.id}
              onPress={() => router.push(`/reflection/add?edit=${entry.id}`)}
              className="mb-3 rounded-2xl bg-white p-4 dark:bg-charcoal-850"
            >
              <Text className="text-sm font-medium text-primary-500">
                {formatDate(entry.date)}
              </Text>
              <Text
                className="mt-2 text-base text-neutral-700 dark:text-neutral-300"
                numberOfLines={3}
              >
                {entry.text}
              </Text>
            </Pressable>
          ))}

          <View className="h-8" />
        </ScrollView>
      ) : (
        <EmptyState type="journal" />
      )}
    </SafeAreaView>
  );
}
