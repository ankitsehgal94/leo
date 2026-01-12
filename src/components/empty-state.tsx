import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';

import { Text, View } from './ui';

type Props = {
  type: 'habits' | 'journal';
};

export function EmptyState({ type }: Props): React.ReactElement {
  const router = useRouter();

  if (type === 'habits') {
    return (
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-6xl">🐱</Text>
        <Text className="mt-4 text-center text-xl font-semibold text-neutral-800">
          No habits yet
        </Text>
        <Text className="mt-2 text-center text-base text-neutral-500">
          Start building your daily routine by creating your first habit
        </Text>

        <View className="mt-8 w-full">
          <Pressable
            className="mb-3 rounded-2xl bg-primary-500 px-6 py-4"
            onPress={() => router.push('/habit/add')}
          >
            <Text className="text-center text-lg font-semibold text-white">
              Create First Habit
            </Text>
          </Pressable>

          <Pressable
            className="rounded-2xl bg-neutral-100 px-6 py-4"
            onPress={() => router.push('/(app)/discover')}
          >
            <Text className="text-center text-lg font-semibold text-neutral-700">
              Browse Templates
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 items-center justify-center px-8">
      <Text className="text-6xl">📝</Text>
      <Text className="mt-4 text-center text-xl font-semibold text-neutral-800">
        No reflections yet
      </Text>
      <Text className="mt-2 text-center text-base text-neutral-500">
        How are you feeling today? Start journaling your thoughts
      </Text>

      <Pressable
        className="mt-8 rounded-2xl bg-primary-500 px-6 py-4"
        onPress={() => router.push('/reflection/add')}
      >
        <Text className="text-center text-lg font-semibold text-white">
          Write First Reflection
        </Text>
      </Pressable>
    </View>
  );
}
