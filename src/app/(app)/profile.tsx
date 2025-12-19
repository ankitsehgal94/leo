import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, ScrollView, Switch, TextInput } from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { useHabitStore, useJournalStore, useUserStore } from '@/lib/stores';
import type { Habit, HabitCompletion, JournalEntry } from '@/types';

function useUserName(): string | undefined {
  return useUserStore((state) => state.userName);
}

function StatCard({
  value,
  label,
}: {
  value: string | number;
  label: string;
}): React.ReactElement {
  return (
    <View className="flex-1 items-center rounded-xl bg-white p-4 dark:bg-charcoal-850">
      <Text className="text-2xl font-bold text-primary-500">{value}</Text>
      <Text className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>
    </View>
  );
}

function calculateStats(
  habits: Habit[],
  completions: HabitCompletion[],
  entries: JournalEntry[]
) {
  const totalHabits = habits.length;
  const totalEntries = entries.length;

  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 365; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayCompletions = completions.filter((c) => c.date === dateStr);
    const allHabitsCompleted =
      habits.length > 0 &&
      habits.every((h) =>
        dayCompletions.some((c) => c.habitId === h.id && c.isComplete)
      );
    if (allHabitsCompleted) {
      streak++;
    } else if (i > 0) {
      break;
    }
  }

  const last7Days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }
  const totalPossible = habits.length * 7;
  const totalCompleted = completions.filter(
    (c) => last7Days.includes(c.date) && c.isComplete
  ).length;
  const completionRate =
    totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0;

  return { totalHabits, streak, completionRate, totalEntries };
}

export default function Profile(): React.ReactElement {
  const router = useRouter();
  const userName = useUserName();
  const isPremium = useUserStore.use.isPremium();
  const notificationsEnabled = useUserStore.use.notificationsEnabled();
  const setUserName = useUserStore.use.setUserName();
  const setNotificationsEnabled = useUserStore.use.setNotificationsEnabled();

  const habits = useHabitStore.use.habits();
  const completions = useHabitStore.use.completions();
  const entries = useJournalStore.use.entries();

  const stats = React.useMemo(
    () => calculateStats(habits, completions, entries),
    [habits, completions, entries]
  );

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-charcoal-950">
      <FocusAwareStatusBar />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ProfileHeader
          userName={userName}
          isPremium={isPremium}
          onSetUserName={setUserName}
        />
        <StatsSection stats={stats} />
        <SettingsSection
          notificationsEnabled={notificationsEnabled}
          setNotificationsEnabled={setNotificationsEnabled}
          isPremium={isPremium}
          onUpgrade={() => router.push('/paywall')}
        />
        <DevTools />
        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}

type ProfileHeaderProps = {
  userName: string | undefined;
  isPremium: boolean;
  onSetUserName: (name: string) => void;
};

function ProfileHeader({
  userName,
  isPremium,
  onSetUserName,
}: ProfileHeaderProps): React.ReactElement {
  const [isEditingName, setIsEditingName] = React.useState(false);
  const [editedName, setEditedName] = React.useState(userName ?? '');

  const handleSaveName = (): void => {
    onSetUserName(editedName.trim());
    setIsEditingName(false);
  };

  return (
    <View className="items-center px-4 pt-4">
      <View className="size-24 items-center justify-center rounded-full bg-primary-100">
        <Text className="text-4xl">🐱</Text>
      </View>
      {isEditingName ? (
        <View className="mt-4 flex-row items-center">
          <TextInput
            value={editedName}
            onChangeText={setEditedName}
            placeholder="Your name"
            className="rounded-lg bg-white px-4 py-2 text-lg text-neutral-800 dark:bg-charcoal-850 dark:text-neutral-100"
            autoFocus
            onSubmitEditing={handleSaveName}
          />
          <Pressable onPress={handleSaveName} className="ml-2">
            <Text className="font-semibold text-primary-500">Save</Text>
          </Pressable>
        </View>
      ) : (
        <Pressable onPress={() => setIsEditingName(true)} className="mt-4">
          <Text className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">
            {userName || 'Tap to set name'}
          </Text>
        </Pressable>
      )}
      {isPremium && (
        <View className="mt-2 rounded-full bg-primary-100 px-3 py-1">
          <Text className="text-sm font-medium text-primary-600">
            ✨ Premium
          </Text>
        </View>
      )}
    </View>
  );
}

type StatsData = {
  totalHabits: number;
  streak: number;
  completionRate: number;
};

function StatsSection({ stats }: { stats: StatsData }): React.ReactElement {
  return (
    <View className="mt-6 px-4">
      <Text className="mb-3 text-sm font-semibold text-neutral-500 dark:text-neutral-400">
        YOUR STATS
      </Text>
      <View className="flex-row">
        <StatCard value={stats.totalHabits} label="Habits" />
        <View className="w-2" />
        <StatCard value={stats.streak} label="Day Streak" />
        <View className="w-2" />
        <StatCard value={`${stats.completionRate}%`} label="Completion" />
      </View>
    </View>
  );
}

type SettingsSectionProps = {
  notificationsEnabled: boolean;
  setNotificationsEnabled: (enabled: boolean) => void;
  isPremium: boolean;
  onUpgrade: () => void;
};

function SettingsSection({
  notificationsEnabled,
  setNotificationsEnabled,
  isPremium,
  onUpgrade,
}: SettingsSectionProps): React.ReactElement {
  const handleRestorePurchases = (): void => {
    Alert.alert(
      'Restore Purchases',
      'This feature will be available when IAP is implemented.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View className="mt-6 px-4">
      <Text className="mb-3 text-sm font-semibold text-neutral-500">
        SETTINGS
      </Text>
      <View className="rounded-xl bg-white">
        <View className="flex-row items-center justify-between border-b border-neutral-100 px-4 py-3">
          <Text className="text-base text-neutral-800">Notifications</Text>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#D4D4D4', true: '#FF984C' }}
            thumbColor="#FFFFFF"
          />
        </View>
        {!isPremium && (
          <Pressable
            onPress={onUpgrade}
            className="flex-row items-center justify-between border-b border-neutral-100 px-4 py-3"
          >
            <Text className="text-base text-neutral-800">
              Upgrade to Premium
            </Text>
            <Text className="text-primary-500">→</Text>
          </Pressable>
        )}
        <Pressable
          onPress={handleRestorePurchases}
          className="flex-row items-center justify-between border-b border-neutral-100 px-4 py-3"
        >
          <Text className="text-base text-neutral-800">Restore Purchases</Text>
          <Text className="text-neutral-400">→</Text>
        </Pressable>
        <View className="px-4 py-3">
          <Text className="text-base text-neutral-800">About</Text>
          <Text className="mt-1 text-sm text-neutral-400">
            Leo v1.0.0 • Built with 💜
          </Text>
        </View>
      </View>
    </View>
  );
}

function DevTools(): React.ReactElement | null {
  const isPremium = useUserStore.use.isPremium();
  const setPremium = useUserStore.use.setPremium();

  if (!__DEV__) return null;
  return (
    <View className="mt-6 px-4">
      <Text className="mb-3 text-sm font-semibold text-neutral-500">
        DEV TOOLS
      </Text>
      <View className="rounded-xl bg-white">
        <Pressable onPress={() => setPremium(!isPremium)} className="px-4 py-3">
          <Text className="text-base text-neutral-800">
            Toggle Premium ({isPremium ? 'ON' : 'OFF'})
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
