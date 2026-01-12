import * as React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import type { MoodLevel } from '@/types';

import { Text, View } from './ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedText = Animated.createAnimatedComponent(Text);

type MoodOption = {
  level: MoodLevel;
  emoji: string;
  label: string;
};

const MOODS: MoodOption[] = [
  { level: 1, emoji: '😿', label: 'Terrible' },
  { level: 2, emoji: '😾', label: 'Bad' },
  { level: 3, emoji: '😐', label: 'Okay' },
  { level: 4, emoji: '😺', label: 'Good' },
  { level: 5, emoji: '😻', label: 'Amazing' },
];

const MOOD_LABELS: Record<MoodLevel, string> = {
  1: 'FEELING DOWN',
  2: 'NOT GREAT',
  3: 'FEELING OKAY',
  4: 'FEELING GOOD',
  5: 'FEELING AMAZING',
};

type Props = {
  value: MoodLevel;
  onChange: (mood: MoodLevel) => void;
};

export function MoodSelector({ value, onChange }: Props): React.ReactElement {
  return (
    <View className="mt-2">
      <MoodHeader value={value} />
      <View className="mt-3 flex-row items-center justify-around rounded-2xl bg-neutral-100 px-2 py-3 dark:bg-charcoal-800">
        {MOODS.map((mood) => (
          <MoodButton
            key={mood.level}
            mood={mood}
            isSelected={value === mood.level}
            onPress={() => onChange(mood.level)}
          />
        ))}
      </View>
    </View>
  );
}

type MoodHeaderProps = {
  value: MoodLevel;
};

function MoodHeader({ value }: MoodHeaderProps): React.ReactElement {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const prevValue = React.useRef(value);

  React.useEffect(() => {
    if (prevValue.current !== value) {
      // Animate when mood changes
      scale.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withSpring(1.1, { damping: 8, stiffness: 300 }),
        withSpring(1, { damping: 10, stiffness: 200 })
      );
      translateY.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withSpring(0, { damping: 10, stiffness: 200 })
      );
      prevValue.current = value;
    }
  }, [value, scale, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: translateY.value }],
  }));

  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-poppins-semibold text-xs tracking-wider text-neutral-400 dark:text-neutral-500">
        DAILY MOOD
      </Text>
      <Animated.View
        style={animatedStyle}
        className="rounded-full bg-primary-100 px-3 py-1 dark:bg-primary-900/30"
      >
        <AnimatedText className="font-poppins-bold text-xs tracking-wider text-primary-600 dark:text-primary-400">
          {MOOD_LABELS[value]}
        </AnimatedText>
      </Animated.View>
    </View>
  );
}

type MoodButtonProps = {
  mood: MoodOption;
  isSelected: boolean;
  onPress: () => void;
};

function MoodButton({
  mood,
  isSelected,
  onPress,
}: MoodButtonProps): React.ReactElement {
  const scale = useSharedValue(1);
  const bgOpacity = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    bgOpacity.value = withSpring(isSelected ? 1 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [isSelected, bgOpacity]);

  const handlePress = (): void => {
    scale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1.15, { damping: 8, stiffness: 300 }),
      withSpring(1, { damping: 10, stiffness: 200 })
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const bgAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
    transform: [{ scale: bgOpacity.value * 0.2 + 0.8 }],
  }));

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={animatedStyle}
      className="items-center justify-center"
    >
      <View className="relative size-14 items-center justify-center">
        {/* Background circle for selected state */}
        <Animated.View
          style={bgAnimatedStyle}
          className="absolute size-14 rounded-full bg-primary-500"
        />
        {/* Emoji */}
        <Text className="text-3xl" style={{ opacity: isSelected ? 1 : 0.4 }}>
          {mood.emoji}
        </Text>
      </View>
    </AnimatedPressable>
  );
}
