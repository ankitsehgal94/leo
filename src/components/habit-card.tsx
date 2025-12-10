import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';

import { cn } from '@/lib';
import { useHabitStore } from '@/lib/stores';
import type { Habit, HabitCompletion } from '@/types';

import { Text, View } from './ui';

type Props = {
  habit: Habit;
  completion?: HabitCompletion;
  date: string;
};

export function HabitCard({
  habit,
  completion,
  date,
}: Props): React.ReactElement {
  const router = useRouter();
  const toggleHabitComplete = useHabitStore.use.toggleHabitComplete();

  const hasSubTasks = Boolean(habit.subTasks && habit.subTasks.length > 0);
  const isComplete = completion?.isComplete ?? false;
  const completedCount = completion?.completedSubTasks.length ?? 0;
  const totalCount = habit.subTasks?.length ?? 0;

  const handlePress = (): void => {
    if (hasSubTasks) {
      router.push(`/habit/${habit.id}?date=${date}`);
    } else {
      toggleHabitComplete(habit.id, date);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      onLongPress={() => router.push(`/habit/${habit.id}?date=${date}`)}
      className={cn(
        'mb-3 rounded-2xl bg-white p-4',
        isComplete && 'bg-success-50'
      )}
    >
      <View className="flex-row items-center justify-between">
        <HabitInfo
          name={habit.name}
          isComplete={isComplete}
          hasSubTasks={hasSubTasks}
          completedCount={completedCount}
          totalCount={totalCount}
        />
        <ProgressIndicator
          isComplete={isComplete}
          hasSubTasks={hasSubTasks}
          completedCount={completedCount}
          subTasks={habit.subTasks}
        />
      </View>
      {hasSubTasks && !isComplete && (
        <ProgressBar completedCount={completedCount} totalCount={totalCount} />
      )}
    </Pressable>
  );
}

type HabitInfoProps = {
  name: string;
  isComplete: boolean;
  hasSubTasks: boolean;
  completedCount: number;
  totalCount: number;
};

function HabitInfo({
  name,
  isComplete,
  hasSubTasks,
  completedCount,
  totalCount,
}: HabitInfoProps): React.ReactElement {
  return (
    <View className="flex-1">
      <Text
        className={cn(
          'text-lg font-semibold',
          isComplete ? 'text-success-700' : 'text-neutral-800'
        )}
      >
        {name}
      </Text>
      {hasSubTasks && (
        <Text className="mt-1 text-sm text-neutral-500">
          {completedCount} of {totalCount} steps
        </Text>
      )}
    </View>
  );
}

type ProgressIndicatorProps = {
  isComplete: boolean;
  hasSubTasks: boolean;
  completedCount: number;
  subTasks?: { id: string }[];
};

function ProgressIndicator({
  isComplete,
  hasSubTasks,
  completedCount,
  subTasks,
}: ProgressIndicatorProps): React.ReactElement {
  if (isComplete) {
    return (
      <View className="ml-4 size-8 items-center justify-center rounded-full bg-success-500">
        <Text className="text-white">✓</Text>
      </View>
    );
  }
  if (hasSubTasks) {
    return (
      <View className="ml-4 flex-row">
        {subTasks?.map((_, index) => (
          <View
            key={index}
            className={cn(
              'mx-0.5 h-2 w-2 rounded-full',
              index < completedCount ? 'bg-primary-500' : 'bg-neutral-200'
            )}
          />
        ))}
      </View>
    );
  }
  return (
    <View className="ml-4 size-8 items-center justify-center rounded-full border-2 border-neutral-200" />
  );
}

type ProgressBarProps = {
  completedCount: number;
  totalCount: number;
};

function ProgressBar({
  completedCount,
  totalCount,
}: ProgressBarProps): React.ReactElement {
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  return (
    <View className="mt-3 h-1.5 overflow-hidden rounded-full bg-neutral-100">
      <View
        className="h-full rounded-full bg-primary-500"
        style={{ width: `${progress}%` }}
      />
    </View>
  );
}
