import * as React from 'react';
import { Pressable } from 'react-native';

import { cn } from '@/lib';
import type { SubTask } from '@/types';

import { Text, View } from './ui';

type Props = {
  subTask: SubTask;
  isCompleted: boolean;
  onToggle: () => void;
};

export function SubTaskItem({
  subTask,
  isCompleted,
  onToggle,
}: Props): React.ReactElement {
  return (
    <Pressable
      onPress={onToggle}
      className="mb-2 flex-row items-center rounded-xl bg-white px-4 py-3"
    >
      <View
        className={cn(
          'mr-3 h-6 w-6 items-center justify-center rounded-full border-2',
          isCompleted
            ? 'border-success-500 bg-success-500'
            : 'border-neutral-300 bg-white'
        )}
      >
        {isCompleted && <Text className="text-xs text-white">✓</Text>}
      </View>
      <Text
        className={cn(
          'flex-1 text-base',
          isCompleted ? 'text-neutral-400 line-through' : 'text-neutral-800'
        )}
      >
        {subTask.title}
      </Text>
    </Pressable>
  );
}
