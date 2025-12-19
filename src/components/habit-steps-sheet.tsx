import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { useColorScheme } from 'nativewind';
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
import type { Habit, HabitCompletion, SubTask } from '@/types';

import { Text, View } from './ui';
import colors from './ui/colors';
import { renderBackdrop } from './ui/modal';

type Props = {
  habit: Habit;
  completion?: HabitCompletion;
  date: string;
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
};

export function HabitStepsSheet({
  habit,
  completion,
  date,
  bottomSheetRef,
}: Props): React.ReactElement {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const toggleSubTaskComplete = useHabitStore.use.toggleSubTaskComplete();
  const completedSubTasks = completion?.completedSubTasks ?? [];
  const subTasks = habit.subTasks ?? [];
  const isComplete = completion?.isComplete ?? false;

  const handleToggle = (subTaskId: string): void => {
    toggleSubTaskComplete(habit.id, subTaskId, date);
  };

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: isDark ? colors.charcoal[600] : '#D1D5DB',
        width: 40,
      }}
      backgroundStyle={{
        backgroundColor: isDark ? colors.charcoal[900] : '#FAFAFA',
      }}
    >
      <BottomSheetView className="pb-8">
        <SheetHeader
          habit={habit}
          completedCount={completedSubTasks.length}
          totalCount={subTasks.length}
          isComplete={isComplete}
        />
        <StepsList
          subTasks={subTasks}
          completedSubTasks={completedSubTasks}
          onToggle={handleToggle}
        />
      </BottomSheetView>
    </BottomSheetModal>
  );
}

type SheetHeaderProps = {
  habit: Habit;
  completedCount: number;
  totalCount: number;
  isComplete: boolean;
};

function SheetHeader({
  habit,
  completedCount,
  totalCount,
  isComplete,
}: SheetHeaderProps): React.ReactElement {
  return (
    <View className="border-b border-neutral-100 px-5 pb-4 pt-2 dark:border-charcoal-700">
      <View className="flex-row items-center justify-between">
        <Text className="font-nunito-bold text-xl text-neutral-800 dark:text-neutral-100">
          {habit.name}
        </Text>
        {isComplete && (
          <View className="rounded-full bg-success-100 px-3 py-1">
            <Text className="font-poppins-medium text-xs text-success-600">
              Completed
            </Text>
          </View>
        )}
      </View>
      <View className="mt-2 flex-row items-center">
        <View className="mr-3 h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-200 dark:bg-charcoal-700">
          <View
            className="h-full rounded-full bg-primary-500"
            style={{ width: `${(completedCount / totalCount) * 100}%` }}
          />
        </View>
        <Text className="font-poppins-medium text-sm text-neutral-500 dark:text-neutral-400">
          {completedCount}/{totalCount}
        </Text>
      </View>
    </View>
  );
}

type StepsListProps = {
  subTasks: SubTask[];
  completedSubTasks: string[];
  onToggle: (id: string) => void;
};

function StepsList({
  subTasks,
  completedSubTasks,
  onToggle,
}: StepsListProps): React.ReactElement {
  return (
    <View className="px-5 pt-4">
      {subTasks.map((subTask, index) => (
        <StepItem
          key={subTask.id}
          subTask={subTask}
          index={index}
          isCompleted={completedSubTasks.includes(subTask.id)}
          onToggle={() => onToggle(subTask.id)}
        />
      ))}
    </View>
  );
}

type StepItemProps = {
  subTask: SubTask;
  index: number;
  isCompleted: boolean;
  onToggle: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function StepItem({
  subTask,
  index,
  isCompleted,
  onToggle,
}: StepItemProps): React.ReactElement {
  const scale = useSharedValue(1);

  const handlePressIn = (): void => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onToggle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="mb-3 flex-row items-center rounded-2xl bg-white p-4 dark:bg-charcoal-850"
    >
      <View className="mr-3 size-8 items-center justify-center rounded-full bg-neutral-100 dark:bg-charcoal-700">
        <Text className="font-poppins-medium text-sm text-neutral-400 dark:text-neutral-500">
          {index + 1}
        </Text>
      </View>
      <Text
        className={cn(
          'flex-1 font-poppins text-base',
          isCompleted
            ? 'text-neutral-400 line-through dark:text-neutral-500'
            : 'text-neutral-800 dark:text-neutral-100'
        )}
      >
        {subTask.title}
      </Text>
      <StepCheckbox isCompleted={isCompleted} />
    </AnimatedPressable>
  );
}

function StepCheckbox({
  isCompleted,
}: {
  isCompleted: boolean;
}): React.ReactElement {
  const checkScale = useSharedValue(isCompleted ? 1 : 0);

  React.useEffect(() => {
    checkScale.value = isCompleted
      ? withSequence(
          withTiming(1.2, { duration: 150 }),
          withSpring(1, { damping: 12, stiffness: 400 })
        )
      : withTiming(0, { duration: 100 });
  }, [isCompleted, checkScale]);

  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));

  return (
    <View className="ml-3 size-6 items-center justify-center">
      <View
        className={cn(
          'absolute size-6 rounded-full border-2',
          isCompleted
            ? 'border-success-500'
            : 'border-neutral-200 dark:border-charcoal-600'
        )}
      />
      <Animated.View
        style={checkAnimatedStyle}
        className="size-6 items-center justify-center rounded-full bg-success-500"
      >
        <Text className="text-xs text-white">✓</Text>
      </Animated.View>
    </View>
  );
}
