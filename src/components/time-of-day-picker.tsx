import * as React from 'react';
import { Pressable } from 'react-native';

import { cn } from '@/lib';
import type { TimeOfDay } from '@/types';

import { Text, View } from './ui';

type Props = {
  value: TimeOfDay;
  onChange: (value: TimeOfDay) => void;
};

const OPTIONS: { value: TimeOfDay; label: string; emoji: string }[] = [
  { value: 'morning', label: 'Morning', emoji: '☀️' },
  { value: 'afternoon', label: 'Afternoon', emoji: '🌤️' },
  { value: 'evening', label: 'Evening', emoji: '🌙' },
];

export function TimeOfDayPicker({
  value,
  onChange,
}: Props): React.ReactElement {
  return (
    <View className="flex-row rounded-xl bg-neutral-100 p-1">
      {OPTIONS.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          className={cn(
            'flex-1 flex-row items-center justify-center rounded-lg py-2',
            value === option.value && 'bg-white'
          )}
        >
          <Text className="mr-1">{option.emoji}</Text>
          <Text
            className={cn(
              'text-sm font-medium',
              value === option.value ? 'text-neutral-800' : 'text-neutral-500'
            )}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
