import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/lib';
import { useHabitStore } from '@/lib/stores';
import type { Habit, HabitCompletion } from '@/types';

import { Text, View } from './ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Default emoji based on habit name keywords
function getDefaultEmoji(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('water') || lowerName.includes('drink')) return '💧';
  if (lowerName.includes('meditat')) return '🧘';
  if (lowerName.includes('read') || lowerName.includes('book')) return '📖';
  if (lowerName.includes('walk') || lowerName.includes('run')) return '🚶';
  if (lowerName.includes('exercise') || lowerName.includes('workout'))
    return '💪';
  if (lowerName.includes('sleep') || lowerName.includes('bed')) return '😴';
  if (lowerName.includes('journal') || lowerName.includes('write')) return '✏️';
  if (lowerName.includes('stretch') || lowerName.includes('yoga')) return '🧘‍♀️';
  if (lowerName.includes('eat') || lowerName.includes('food')) return '🥗';
  if (lowerName.includes('vitamin') || lowerName.includes('supplement'))
    return '💊';
  if (lowerName.includes('gratitude') || lowerName.includes('thank'))
    return '🙏';
  if (lowerName.includes('screen') || lowerName.includes('phone')) return '📱';
  if (lowerName.includes('clean') || lowerName.includes('tidy')) return '🧹';
  if (lowerName.includes('music') || lowerName.includes('practice'))
    return '🎵';
  if (lowerName.includes('code') || lowerName.includes('program')) return '💻';
  return '✨';
}

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
  const incrementProgress = useHabitStore.use.incrementProgress();

  const hasTracking = Boolean(
    habit.tracking && habit.tracking.type !== 'simple'
  );
  const isComplete = completion?.isComplete ?? false;
  const emoji = habit.emoji || getDefaultEmoji(habit.name);

  const handlePress = (): void => {
    if (hasTracking) {
      incrementProgress(habit.id, date);
    } else {
      toggleHabitComplete(habit.id, date);
    }
  };

  return (
    <HabitCardPressable
      habit={habit}
      completion={completion}
      emoji={emoji}
      isComplete={isComplete}
      hasTracking={hasTracking}
      onPress={handlePress}
      onLongPress={() => router.push(`/habit/${habit.id}?date=${date}`)}
    />
  );
}

type HabitCardPressableProps = {
  habit: Habit;
  completion?: HabitCompletion;
  emoji: string;
  isComplete: boolean;
  hasTracking: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function HabitCardPressable({
  habit,
  completion,
  emoji,
  isComplete,
  hasTracking,
  onPress,
  onLongPress,
}: HabitCardPressableProps): React.ReactElement {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (): void => {
    scale.value = withTiming(0.97, { duration: 100 });
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={onLongPress}
      style={animatedStyle}
      className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-charcoal-850"
    >
      <EmojiIcon emoji={emoji} isComplete={isComplete} />
      <View className="ml-3 flex-1">
        <View className="flex-row items-center">
          <Text
            className={cn(
              'font-poppins-semibold text-base',
              isComplete
                ? 'text-neutral-400 line-through dark:text-neutral-500'
                : 'text-neutral-800 dark:text-neutral-100'
            )}
          >
            {habit.name}
          </Text>
          {habit.currentStreak >= 2 && (
            <View className="ml-2 flex-row items-center rounded-full bg-amber-50 px-2 py-0.5 dark:bg-amber-900/30">
              <Text className="text-xs text-amber-600 dark:text-amber-400">
                🔥 {habit.currentStreak}
              </Text>
            </View>
          )}
        </View>
        {hasTracking && habit.tracking && (
          <ProgressIndicator
            progress={completion?.progress ?? 0}
            goal={habit.tracking.goal}
            unit={habit.tracking.unit}
          />
        )}
      </View>
      <CheckIndicator isComplete={isComplete} />
    </AnimatedPressable>
  );
}

type ProgressIndicatorProps = {
  progress: number;
  goal: number;
  unit?: string;
};

function ProgressIndicator({
  progress,
  goal,
  unit,
}: ProgressIndicatorProps): React.ReactElement {
  const percentage = Math.min((progress / goal) * 100, 100);

  return (
    <View className="mt-1.5">
      <Text className="text-sm text-neutral-400 dark:text-neutral-500">
        {progress} / {goal} {unit}
      </Text>
      <View className="mt-1 h-1.5 overflow-hidden rounded-full bg-neutral-100 dark:bg-charcoal-700">
        <View
          className={cn(
            'h-full rounded-full',
            percentage >= 100 ? 'bg-success-500' : 'bg-primary-400'
          )}
          style={{ width: `${percentage}%` }}
        />
      </View>
    </View>
  );
}

type EmojiIconProps = {
  emoji: string;
  isComplete: boolean;
};

function EmojiIcon({ emoji, isComplete }: EmojiIconProps): React.ReactElement {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (isComplete) {
      scale.value = withSequence(
        withTiming(1.2, { duration: 150 }),
        withSpring(1, { damping: 12, stiffness: 400 })
      );
    }
  }, [isComplete, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={animatedStyle}
      className={cn(
        'size-12 items-center justify-center rounded-2xl',
        isComplete ? 'bg-success-50' : 'bg-primary-50'
      )}
    >
      <Text className="text-2xl">{emoji}</Text>
    </Animated.View>
  );
}

type CheckIndicatorProps = {
  isComplete: boolean;
};

function CheckIndicator({
  isComplete,
}: CheckIndicatorProps): React.ReactElement {
  const scale = useSharedValue(isComplete ? 1 : 0);
  const borderOpacity = useSharedValue(isComplete ? 0 : 1);

  React.useEffect(() => {
    if (isComplete) {
      scale.value = withSequence(
        withTiming(1.3, { duration: 150 }),
        withSpring(1, { damping: 12, stiffness: 400 })
      );
      borderOpacity.value = withTiming(0, { duration: 100 });
    } else {
      scale.value = withTiming(0, { duration: 100 });
      borderOpacity.value = withTiming(1, { duration: 150 });
    }
  }, [isComplete, scale, borderOpacity]);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: scale.value,
  }));

  const borderAnimatedStyle = useAnimatedStyle(() => ({
    opacity: borderOpacity.value,
  }));

  return (
    <View className="ml-3 size-7 items-center justify-center">
      {/* Border circle (unchecked state) */}
      <Animated.View
        style={[borderAnimatedStyle, { position: 'absolute' }]}
        className="size-7 rounded-full border-2 border-neutral-200 dark:border-charcoal-600"
      />
      {/* Filled circle with check (checked state) */}
      <Animated.View
        style={checkAnimatedStyle}
        className="size-7 items-center justify-center rounded-full bg-primary-300"
      >
        <Text className="text-sm text-white">✓</Text>
      </Animated.View>
    </View>
  );
}
