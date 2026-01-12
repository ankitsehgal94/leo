import * as React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CloudSun, Moon, Sun } from '@/components/ui/icons';
import { cn } from '@/lib';
import type { TimeOfDay } from '@/types';

import { Text, View } from './ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  value: TimeOfDay;
  onChange: (value: TimeOfDay) => void;
};

type TimeOptionType = {
  value: TimeOfDay;
  label: string;
  Icon: React.ComponentType<{ color?: string; size?: number }>;
  activeColor: string;
  activeBg: string;
};

const OPTIONS: TimeOptionType[] = [
  {
    value: 'morning',
    label: 'Morning',
    Icon: Sun,
    activeColor: '#F59E0B',
    activeBg: 'bg-amber-50',
  },
  {
    value: 'afternoon',
    label: 'Afternoon',
    Icon: CloudSun,
    activeColor: '#64748B',
    activeBg: 'bg-slate-50',
  },
  {
    value: 'evening',
    label: 'Evening',
    Icon: Moon,
    activeColor: '#6366F1',
    activeBg: 'bg-indigo-50',
  },
];

export function TimeOfDayPicker({
  value,
  onChange,
}: Props): React.ReactElement {
  return (
    <View className="flex-row gap-3">
      {OPTIONS.map((option) => (
        <TimeOption
          key={option.value}
          option={option}
          isSelected={value === option.value}
          onSelect={() => onChange(option.value)}
        />
      ))}
    </View>
  );
}

type TimeOptionProps = {
  option: TimeOptionType;
  isSelected: boolean;
  onSelect: () => void;
};

function TimeOption({
  option,
  isSelected,
  onSelect,
}: TimeOptionProps): React.ReactElement {
  const { Icon, label, activeColor, activeBg } = option;
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (): void => {
    scale.value = withTiming(0.95, { duration: 100 });
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = (): void => {
    scale.value = withSequence(
      withTiming(0.92, { duration: 50 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );
    onSelect();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className={cn(
        'flex-1 items-center rounded-2xl border-2 bg-white py-4',
        isSelected ? 'border-neutral-300' : 'border-transparent'
      )}
    >
      {/* Icon container */}
      <View
        className={cn(
          'mb-2 size-12 items-center justify-center rounded-xl',
          isSelected ? activeBg : 'bg-neutral-50'
        )}
      >
        <Icon color={isSelected ? activeColor : '#A3A3A3'} size={24} />
      </View>

      {/* Label */}
      <Text
        className={cn(
          'font-poppins text-sm',
          isSelected ? 'text-neutral-800' : 'text-neutral-400'
        )}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
