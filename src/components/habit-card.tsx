import type { BottomSheetModal } from '@gorhom/bottom-sheet';
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

import { HabitStepsSheet } from './habit-steps-sheet';
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
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);

  const hasSubTasks = Boolean(habit.subTasks && habit.subTasks.length > 0);
  const isComplete = completion?.isComplete ?? false;
  const emoji = habit.emoji || getDefaultEmoji(habit.name);

  const handlePress = (): void => {
    if (hasSubTasks) {
      bottomSheetRef.current?.present();
    } else {
      toggleHabitComplete(habit.id, date);
    }
  };

  return (
    <>
      <HabitCardPressable
        habit={habit}
        completion={completion}
        emoji={emoji}
        isComplete={isComplete}
        hasSubTasks={hasSubTasks}
        onPress={handlePress}
        onLongPress={() => router.push(`/habit/${habit.id}?date=${date}`)}
      />
      {hasSubTasks && (
        <HabitStepsSheet
          habit={habit}
          completion={completion}
          date={date}
          bottomSheetRef={bottomSheetRef}
        />
      )}
    </>
  );
}

type HabitCardPressableProps = {
  habit: Habit;
  completion?: HabitCompletion;
  emoji: string;
  isComplete: boolean;
  hasSubTasks: boolean;
  onPress: () => void;
  onLongPress: () => void;
};

function HabitCardPressable({
  habit,
  completion,
  emoji,
  isComplete,
  hasSubTasks,
  onPress,
  onLongPress,
}: HabitCardPressableProps): React.ReactElement {
  const scale = useSharedValue(1);
  const completedCount = completion?.completedSubTasks.length ?? 0;
  const totalCount = habit.subTasks?.length ?? 0;

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
      className="mb-3 flex-row items-center rounded-2xl bg-white p-4"
    >
      <EmojiIcon emoji={emoji} isComplete={isComplete} />
      <View className="ml-3 flex-1">
        <Text
          className={cn(
            'font-poppins-semibold text-base',
            isComplete ? 'text-neutral-400 line-through' : 'text-neutral-800'
          )}
        >
          {habit.name}
        </Text>
        {hasSubTasks && (
          <Text className="mt-0.5 text-sm text-neutral-400">
            {completedCount} of {totalCount} steps
          </Text>
        )}
      </View>
      <CheckIndicator isComplete={isComplete} />
    </AnimatedPressable>
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
        className="size-7 rounded-full border-2 border-neutral-200"
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
