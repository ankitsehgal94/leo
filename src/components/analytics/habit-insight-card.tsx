import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Pressable } from 'react-native';

import type { HabitInsight } from '@/types';

import { Text, View } from '../ui';
import colors from '../ui/colors';

type Props = {
  insight: HabitInsight;
  onPress?: () => void;
};

function WeeklyProgressDots({
  progress,
  isDark,
}: {
  progress: boolean[];
  isDark: boolean;
}): React.ReactElement {
  return (
    <View className="flex-row gap-1">
      {progress.map((isComplete, index) => (
        <View
          key={index}
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: isComplete
              ? isDark
                ? colors.success[400]
                : colors.success[500]
              : isDark
                ? colors.charcoal[700]
                : colors.neutral[200],
          }}
        />
      ))}
    </View>
  );
}

function StreakBadge({
  streak,
}: {
  streak: number;
}): React.ReactElement | null {
  if (streak === 0) return null;

  return (
    <View className="flex-row items-center rounded-full bg-warning-100 px-2 py-0.5 dark:bg-warning-900/30">
      <Text className="text-xs">🔥</Text>
      <Text className="ml-0.5 font-poppins-semibold text-xs text-warning-700 dark:text-warning-400">
        {streak}
      </Text>
    </View>
  );
}

export function HabitInsightCard({
  insight,
  onPress,
}: Props): React.ReactElement {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Pressable
      onPress={onPress}
      className="mb-3 rounded-xl bg-white p-3 active:opacity-80 dark:bg-charcoal-850"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1 flex-row items-center">
          {insight.emoji ? (
            <Text className="text-2xl">{insight.emoji}</Text>
          ) : (
            <View className="size-8 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900/30">
              <Text className="font-poppins-semibold text-sm text-primary-600 dark:text-primary-400">
                {insight.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View className="ml-3 flex-1">
            <Text
              className="font-poppins-semibold text-base text-neutral-800 dark:text-neutral-100"
              numberOfLines={1}
            >
              {insight.name}
            </Text>
            <View className="mt-1 flex-row items-center">
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                {insight.averageCompletionRate}% avg
              </Text>
              <Text className="mx-2 text-neutral-300 dark:text-charcoal-600">
                •
              </Text>
              <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                {insight.totalCompletions} total
              </Text>
            </View>
          </View>
        </View>
        <StreakBadge streak={insight.currentStreak} />
      </View>

      <View className="mt-3 flex-row items-center justify-between border-t border-neutral-100 pt-3 dark:border-charcoal-700">
        <View>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            Last 7 days
          </Text>
          <View className="mt-1">
            <WeeklyProgressDots
              progress={insight.weeklyProgress}
              isDark={isDark}
            />
          </View>
        </View>
        <View className="items-end">
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            Best streak
          </Text>
          <Text className="font-poppins-semibold text-sm text-neutral-800 dark:text-neutral-100">
            {insight.longestStreak} days
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
