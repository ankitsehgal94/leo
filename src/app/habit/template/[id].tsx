import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import {
  FocusAwareStatusBar,
  SafeAreaView,
  showSuccessMessage,
  Text,
  View,
} from '@/components/ui';
import { ArrowLeft } from '@/components/ui/icons';
import {
  CATEGORY_COLORS,
  getTemplateById,
  type TemplateHabit,
} from '@/data/templates';
import { cn } from '@/lib';
import { useHabitStore, useUserStore } from '@/lib/stores';

export default function TemplateDetail(): React.ReactElement {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const template = getTemplateById(id ?? '');

  const habits = useHabitStore.use.habits();
  const addMultipleHabits = useHabitStore.use.addMultipleHabits();
  const canAddHabit = useUserStore.use.canAddHabit();

  if (!template) {
    return (
      <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-charcoal-950">
        <View className="flex-1 items-center justify-center">
          <Text className="text-neutral-500">Template not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const colors = CATEGORY_COLORS[template.category] || { bg: 'bg-neutral-100' };
  const habitCount = template.habits.length;
  const newHabitsCount = habits.length + habitCount;

  const handleAddToRoutine = (): void => {
    if (!canAddHabit(newHabitsCount - 1)) {
      router.push('/paywall');
      return;
    }

    const habitsToAdd = template.habits.map((h) => ({
      name: h.name,
      emoji: h.emoji,
      timeOfDay: h.timeOfDay,
      frequency: 'daily' as const,
      reminderEnabled: false,
      tracking: h.tracking,
    }));

    addMultipleHabits(habitsToAdd);
    showSuccessMessage(
      `${habitCount} habits added! 🎉`,
      `"${template.name}" is now part of your routine.`
    );
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-charcoal-950">
      <Stack.Screen options={{ headerShown: false }} />
      <FocusAwareStatusBar />
      <TemplateHeader onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <TemplateHero template={template} colors={colors} />
        <HabitsList habits={template.habits} />
      </ScrollView>

      <AddToRoutineButton
        habitCount={habitCount}
        onPress={handleAddToRoutine}
      />
    </SafeAreaView>
  );
}

type HeaderProps = {
  onBack: () => void;
};

function TemplateHeader({ onBack }: HeaderProps): React.ReactElement {
  return (
    <View className="flex-row items-center px-4 py-3">
      <Pressable
        onPress={onBack}
        className="mr-3 size-10 items-center justify-center rounded-full bg-white dark:bg-charcoal-850"
      >
        <ArrowLeft />
      </Pressable>
      <Text className="font-nunito-bold text-lg text-neutral-800 dark:text-neutral-100">
        Template Details
      </Text>
    </View>
  );
}

type HeroProps = {
  template: NonNullable<ReturnType<typeof getTemplateById>>;
  colors: { bg: string };
};

function TemplateHero({ template, colors }: HeroProps): React.ReactElement {
  return (
    <Animated.View
      entering={FadeIn.duration(300)}
      className="mx-4 items-center rounded-3xl bg-white p-6 dark:bg-charcoal-850"
    >
      <View
        className={cn(
          'mb-4 size-24 items-center justify-center rounded-full',
          colors.bg
        )}
      >
        <Text className="text-5xl">{template.emoji}</Text>
      </View>
      <Text className="text-center font-nunito-bold text-2xl text-neutral-800 dark:text-neutral-100">
        {template.name}
      </Text>
      <Text className="mt-2 text-center font-poppins text-sm text-neutral-500 dark:text-neutral-400">
        {template.description}
      </Text>
      <View className="mt-4 flex-row items-center">
        <View className="rounded-full bg-primary-50 px-3 py-1 dark:bg-primary-900/20">
          <Text className="font-poppins-medium text-xs text-primary-600 dark:text-primary-400">
            {template.habits.length} habits included
          </Text>
        </View>
        {template.duration && (
          <View className="ml-2 rounded-full bg-neutral-100 px-3 py-1 dark:bg-charcoal-700">
            <Text className="font-poppins-medium text-xs text-neutral-600 dark:text-neutral-300">
              {template.duration}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

type HabitsListProps = {
  habits: TemplateHabit[];
};

function HabitsList({ habits }: HabitsListProps): React.ReactElement {
  return (
    <View className="mt-6 px-4">
      <Text className="mb-3 font-poppins-semibold text-xs tracking-wider text-neutral-500 dark:text-neutral-400">
        HABITS INCLUDED
      </Text>
      {habits.map((habit, index) => (
        <HabitItem key={habit.name} habit={habit} index={index} />
      ))}
    </View>
  );
}

type HabitItemProps = {
  habit: TemplateHabit;
  index: number;
};

function HabitItem({ habit, index }: HabitItemProps): React.ReactElement {
  const timeLabel = getTimeLabel(habit.timeOfDay);
  const trackingLabel = habit.tracking
    ? `${habit.tracking.goal} ${habit.tracking.unit ?? ''}`
    : null;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-charcoal-850"
    >
      <View className="mr-3 size-12 items-center justify-center rounded-full bg-neutral-100 dark:bg-charcoal-700">
        <Text className="text-2xl">{habit.emoji}</Text>
      </View>
      <View className="flex-1">
        <Text className="font-nunito-semibold text-base text-neutral-800 dark:text-neutral-100">
          {habit.name}
        </Text>
        <View className="mt-1 flex-row items-center">
          <Text className="font-poppins text-xs text-neutral-400 dark:text-neutral-500">
            {timeLabel}
          </Text>
          {trackingLabel && (
            <>
              <Text className="mx-1 text-neutral-300 dark:text-neutral-600">
                •
              </Text>
              <Text className="font-poppins text-xs text-neutral-400 dark:text-neutral-500">
                Goal: {trackingLabel}
              </Text>
            </>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

function getTimeLabel(timeOfDay: string): string {
  const labels: Record<string, string> = {
    morning: '🌅 Morning',
    afternoon: '☀️ Afternoon',
    evening: '🌙 Evening',
    anytime: '⏰ Anytime',
  };
  return labels[timeOfDay] || timeOfDay;
}

type AddButtonProps = {
  habitCount: number;
  onPress: () => void;
};

function AddToRoutineButton({
  habitCount,
  onPress,
}: AddButtonProps): React.ReactElement {
  return (
    <View className="absolute inset-x-0 bottom-0 bg-neutral-50 px-4 pb-8 pt-4 dark:bg-charcoal-950">
      <Pressable
        onPress={onPress}
        className="items-center rounded-2xl bg-primary-500 py-4"
      >
        <Text className="font-poppins-semibold text-base text-white">
          Add {habitCount} Habits to My Routine
        </Text>
      </Pressable>
    </View>
  );
}
