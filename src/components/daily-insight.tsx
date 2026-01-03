import { Image as ExpoImage } from 'expo-image';
import * as React from 'react';
import type { ViewStyle } from 'react-native';
import Animated, {
  type AnimatedStyle,
  cancelAnimation,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { useUserStore } from '@/lib/stores';

import {
  CatMood,
  getMoodFromProgress,
  getMoodMessage,
  getMoodSubtitle,
} from './cat-mood';
import { Text, View } from './ui';

// Preload the happy cat GIF for instant display
const HAPPY_CAT_SOURCE = require('@assets/images/happy_cat.gif');
ExpoImage.prefetch(HAPPY_CAT_SOURCE);

type Props = {
  completedCount: number;
  totalCount: number;
  currentStreak: number;
  longestStreak: number;
};

function useUserName(): string | undefined {
  return useUserStore((state) => state.userName);
}

function useCardAnimation(percentage: number) {
  const progressWidth = useSharedValue(0);
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);
  const animatedPercentage = useSharedValue(0);
  const isFirstRender = React.useRef(true);

  React.useEffect(() => {
    // Cancel any running animations first
    cancelAnimation(progressWidth);
    cancelAnimation(animatedPercentage);

    cardScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    cardOpacity.value = withTiming(1, { duration: 300 });

    if (isFirstRender.current) {
      // First render: animate from 0
      isFirstRender.current = false;
      progressWidth.value = withDelay(
        300,
        withTiming(percentage, { duration: 600 })
      );
      animatedPercentage.value = withDelay(
        300,
        withTiming(percentage, { duration: 800 })
      );
    } else {
      // Animate from current value to new value
      progressWidth.value = withTiming(percentage, { duration: 400 });
      animatedPercentage.value = withTiming(percentage, { duration: 400 });
    }
  }, [percentage, cardScale, cardOpacity, progressWidth, animatedPercentage]);

  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const progressAnimatedStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  return { cardAnimatedStyle, progressAnimatedStyle, animatedPercentage };
}

type AnimatedCounterProps = {
  animatedValue: Animated.SharedValue<number>;
};

function AnimatedCounter({
  animatedValue,
}: AnimatedCounterProps): React.ReactElement {
  const [displayValue, setDisplayValue] = React.useState(0);

  useAnimatedReaction(
    () => Math.round(animatedValue.value),
    (current: number) => {
      runOnJS(setDisplayValue)(current);
    },
    [animatedValue]
  );

  return (
    <Text className="font-poppins-bold text-3xl text-neutral-800 dark:text-neutral-100">
      {displayValue}
    </Text>
  );
}

type InsightHeaderProps = {
  message: string;
  subtitle: string;
  progress: number;
};

function InsightHeader({
  message,
  subtitle,
  progress,
}: InsightHeaderProps): React.ReactElement {
  const isComplete = progress >= 1;

  return (
    <>
      <Text className="font-poppins-semibold text-xs uppercase tracking-wide text-primary-500">
        Daily Insight
      </Text>
      <View className="mt-3 flex-row items-center justify-between">
        <View className="flex-1 pr-4">
          <Text className="font-nunito-extrabold text-xl text-neutral-800 dark:text-neutral-100">
            {message}
          </Text>
          <Text className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {subtitle}
          </Text>
        </View>
        <View style={{ width: 80, height: 80 }}>
          {/* Always render both, toggle visibility for instant switching */}
          <ExpoImage
            source={HAPPY_CAT_SOURCE}
            style={{
              width: 80,
              height: 80,
              position: 'absolute',
              opacity: isComplete ? 1 : 0,
            }}
            contentFit="contain"
            cachePolicy="memory-disk"
          />
          {!isComplete && <CatMood progress={progress} size={80} />}
        </View>
      </View>
    </>
  );
}

type ProgressSectionProps = {
  completedCount: number;
  totalCount: number;
  progressAnimatedStyle: AnimatedStyle<ViewStyle>;
  animatedPercentage: Animated.SharedValue<number>;
};

function ProgressSection({
  completedCount,
  totalCount,
  progressAnimatedStyle,
  animatedPercentage,
}: ProgressSectionProps): React.ReactElement {
  return (
    <View className="mt-4">
      <View className="flex-row items-end justify-between">
        <View className="flex-row items-baseline">
          <AnimatedCounter animatedValue={animatedPercentage} />
          <Text className="ml-0.5 font-poppins-bold text-lg text-neutral-400 dark:text-neutral-500">
            %
          </Text>
        </View>
        <Text className="font-poppins text-sm text-neutral-500 dark:text-neutral-400">
          {completedCount} of {totalCount} completed
        </Text>
      </View>
      <View className="mt-2 h-2 overflow-hidden rounded-full bg-neutral-100 dark:bg-charcoal-700">
        <Animated.View
          style={progressAnimatedStyle}
          className="h-full rounded-full bg-primary-500"
        />
      </View>
    </View>
  );
}

type StreakRowProps = {
  currentStreak: number;
  longestStreak: number;
};

function StreakRow({
  currentStreak,
  longestStreak,
}: StreakRowProps): React.ReactElement {
  const streakLabel = currentStreak === 1 ? 'day streak' : 'day streak';

  return (
    <View className="mt-4 flex-row items-center justify-between border-t border-neutral-100 pt-4 dark:border-charcoal-700">
      <View className="flex-row items-center">
        <Text className="text-lg">🔥</Text>
        <Text className="ml-1.5 font-poppins-semibold text-base text-neutral-800 dark:text-neutral-100">
          {currentStreak} {streakLabel}
        </Text>
      </View>
      <Text className="font-poppins text-sm text-neutral-500 dark:text-neutral-400">
        Best: {longestStreak} days
      </Text>
    </View>
  );
}

export function DailyInsight({
  completedCount,
  totalCount,
  currentStreak,
  longestStreak,
}: Props): React.ReactElement {
  const userName = useUserName();
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const percentage = Math.floor(progress * 100);
  const mood = getMoodFromProgress(progress);
  const message = getMoodMessage(mood, userName);
  const subtitle = getMoodSubtitle(mood);

  const { cardAnimatedStyle, progressAnimatedStyle, animatedPercentage } =
    useCardAnimation(percentage);

  return (
    <Animated.View
      style={cardAnimatedStyle}
      className="mx-4 mt-4 rounded-2xl bg-white p-4 dark:bg-charcoal-850"
    >
      <InsightHeader
        message={message}
        subtitle={subtitle}
        progress={progress}
      />
      <ProgressSection
        completedCount={completedCount}
        totalCount={totalCount}
        progressAnimatedStyle={progressAnimatedStyle}
        animatedPercentage={animatedPercentage}
      />
      <StreakRow currentStreak={currentStreak} longestStreak={longestStreak} />
    </Animated.View>
  );
}
