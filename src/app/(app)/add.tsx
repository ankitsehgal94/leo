import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';

export default function Add(): React.ReactElement {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <FocusAwareStatusBar />
      <View className="flex-1 items-center justify-center px-6">
        <Text className="mb-8 text-2xl font-semibold text-neutral-800">
          What would you like to add?
        </Text>

        <Pressable
          className="mb-4 w-full rounded-2xl bg-primary-500 px-6 py-4"
          onPress={() => router.push('/habit/add')}
        >
          <Text className="text-center text-lg font-semibold text-white">
            New Habit
          </Text>
          <Text className="mt-1 text-center text-sm text-white/80">
            Create a daily habit to track
          </Text>
        </Pressable>

        <Pressable
          className="w-full rounded-2xl bg-neutral-200 px-6 py-4"
          onPress={() => router.push('/reflection/add')}
        >
          <Text className="text-center text-lg font-semibold text-neutral-800">
            New Reflection
          </Text>
          <Text className="mt-1 text-center text-sm text-neutral-500">
            Write about your day
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
