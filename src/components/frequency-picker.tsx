import * as React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text, View } from '@/components/ui';
import { Calendar } from '@/components/ui/icons';
import { cn } from '@/lib';
import type { DayOfWeek, Frequency } from '@/types';
import { ALL_DAYS, DAY_LABELS } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  frequency: Frequency;
  selectedDays: DayOfWeek[];
  onFrequencyChange: (frequency: Frequency) => void;
  onDaysChange: (days: DayOfWeek[]) => void;
};

export function FrequencyPicker({
  frequency,
  selectedDays,
  onFrequencyChange,
  onDaysChange,
}: Props): React.ReactElement {
  const selectedCount = frequency === 'daily' ? 7 : selectedDays.length;

  return (
    <View className="rounded-3xl bg-white p-5">
      {/* Header */}
      <View className="mb-4 flex-row items-center">
        <View className="mr-3 size-10 items-center justify-center rounded-xl bg-primary-50">
          <Calendar color="#FF7B1A" size={20} />
        </View>
        <Text className="font-poppins-semibold text-base text-neutral-800">
          Frequency
        </Text>
      </View>

      {/* Frequency Toggle */}
      <View className="mb-4 flex-row gap-3">
        <FrequencyOption
          label="Daily"
          isSelected={frequency === 'daily'}
          onSelect={() => onFrequencyChange('daily')}
        />
        <FrequencyOption
          label="Custom"
          isSelected={frequency === 'custom'}
          onSelect={() => onFrequencyChange('custom')}
        />
      </View>

      {/* Day Selector - Only show when custom */}
      {frequency === 'custom' && (
        <Animated.View
          entering={FadeInDown.duration(200).springify()}
          exiting={FadeOut.duration(150)}
        >
          <DaySelector
            selectedDays={selectedDays}
            onDaysChange={onDaysChange}
          />
          <Text className="mt-3 text-center font-poppins text-sm text-neutral-400">
            {selectedCount} {selectedCount === 1 ? 'day' : 'days'} per week
          </Text>
        </Animated.View>
      )}
    </View>
  );
}

type FrequencyOptionProps = {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
};

const styles = StyleSheet.create({
  optionBase: {
    flex: 1,
  },
});

function FrequencyOption({
  label,
  isSelected,
  onSelect,
}: FrequencyOptionProps): React.ReactElement {
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

  return (
    <AnimatedPressable
      onPress={onSelect}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={[
        animatedStyle,
        styles.optionBase,
        isSelected && { backgroundColor: '#FF7B1A' },
      ]}
      className={cn(
        'items-center justify-center rounded-2xl border-2 py-3',
        isSelected ? 'border-transparent' : 'border-neutral-200 bg-transparent'
      )}
    >
      <Text
        className={cn(
          'font-poppins-medium text-base',
          isSelected ? 'text-white' : 'text-neutral-500'
        )}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

type DaySelectorProps = {
  selectedDays: DayOfWeek[];
  onDaysChange: (days: DayOfWeek[]) => void;
};

function DaySelector({
  selectedDays,
  onDaysChange,
}: DaySelectorProps): React.ReactElement {
  const toggleDay = (day: DayOfWeek): void => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        onDaysChange(selectedDays.filter((d) => d !== day));
      }
    } else {
      onDaysChange([...selectedDays, day]);
    }
  };

  return (
    <View className="flex-row justify-between">
      {ALL_DAYS.map((day) => (
        <DayChip
          key={day}
          day={day}
          isSelected={selectedDays.includes(day)}
          onToggle={() => toggleDay(day)}
        />
      ))}
    </View>
  );
}

type DayChipProps = {
  day: DayOfWeek;
  isSelected: boolean;
  onToggle: () => void;
};

function DayChip({
  day,
  isSelected,
  onToggle,
}: DayChipProps): React.ReactElement {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = (): void => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    }, 100);
    onToggle();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[animatedStyle, isSelected && { backgroundColor: '#FF7B1A' }]}
      className={cn(
        'size-10 items-center justify-center rounded-full',
        !isSelected && 'bg-neutral-100'
      )}
    >
      <Text
        className={cn(
          'font-poppins-semibold text-sm',
          isSelected ? 'text-white' : 'text-neutral-400'
        )}
      >
        {DAY_LABELS[day].short}
      </Text>
    </AnimatedPressable>
  );
}
