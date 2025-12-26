import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { ArrowRight } from '@/components/ui/icons';
import { cn } from '@/lib';
import { useHabitStore } from '@/lib/stores';
import type { Habit, HabitCompletion, TrackingConfig } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const TIME_OF_DAY_CONFIG = {
  morning: { label: 'Morning', emoji: '☀️' },
  afternoon: { label: 'Afternoon', emoji: '🌤️' },
  evening: { label: 'Evening', emoji: '🌙' },
  anytime: { label: 'Anytime', emoji: '∞' },
};

function getToday(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDateLabel(dateStr: string): string {
  const today = getToday();
  if (dateStr === today) return 'Today';
  const date = new Date(dateStr + 'T12:00:00');
  const todayDate = new Date(today + 'T12:00:00');
  const diff = Math.round(
    (todayDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 1) return 'Yesterday';
  if (diff === -1) return 'Tomorrow';
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

type HistoryDayData = {
  date: string;
  dayName: string;
  isComplete: boolean;
  isSelected: boolean;
};

function HistoryDay({
  dayName,
  isComplete,
  isSelected,
}: HistoryDayData): React.ReactElement {
  return (
    <View className="items-center">
      <Text className="text-xs text-neutral-400">{dayName}</Text>
      <View
        className={`mt-2 size-8 items-center justify-center rounded-full ${
          isComplete
            ? 'bg-success-500'
            : isSelected
              ? 'border-2 border-primary-500'
              : 'bg-neutral-100'
        }`}
      >
        {isComplete && <Text className="text-xs text-white">✓</Text>}
      </View>
    </View>
  );
}

function useHabitHistory(habitId: string | undefined, selectedDate: string) {
  const completions = useHabitStore.use.completions();

  return React.useMemo(() => {
    if (!habitId) return [];
    const days: HistoryDayData[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const dayCompletion = completions.find(
        (c) => c.habitId === habitId && c.date === dateStr
      );
      days.push({
        date: dateStr,
        dayName: date
          .toLocaleDateString('en-US', { weekday: 'short' })
          .charAt(0),
        isComplete: dayCompletion?.isComplete ?? false,
        isSelected: dateStr === selectedDate,
      });
    }
    return days;
  }, [habitId, completions, selectedDate]);
}

function useHabitDetailData(params: { id: string; date?: string }) {
  const habits = useHabitStore.use.habits();
  const completions = useHabitStore.use.completions();

  const habit = habits.find((h) => h.id === params.id);
  const selectedDate = params.date ?? getToday();
  const isToday = selectedDate === getToday();
  const completion = habit
    ? completions.find((c) => c.habitId === habit.id && c.date === selectedDate)
    : undefined;
  const last7Days = useHabitHistory(habit?.id, selectedDate);

  return { habit, selectedDate, isToday, completion, last7Days };
}

export default function HabitDetail(): React.ReactElement {
  const params = useLocalSearchParams<{ id: string; date?: string }>();
  const router = useRouter();
  const toggleHabitComplete = useHabitStore.use.toggleHabitComplete();
  const incrementProgress = useHabitStore.use.incrementProgress();
  const decrementProgress = useHabitStore.use.decrementProgress();
  const deleteHabit = useHabitStore.use.deleteHabit();

  const { habit, selectedDate, isToday, completion, last7Days } =
    useHabitDetailData(params);

  if (!habit) return <HabitNotFound onBack={() => router.back()} />;

  const hasTracking = Boolean(
    habit.tracking && habit.tracking.type !== 'simple'
  );
  const isComplete = completion?.isComplete ?? false;
  const timeConfig = TIME_OF_DAY_CONFIG[habit.timeOfDay];
  const dateLabel = formatDateLabel(selectedDate);

  const handleDelete = (): void => {
    Alert.alert('Delete Habit', `Delete "${habit.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteHabit(habit.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <HabitDetailView
      habit={habit}
      timeConfig={timeConfig}
      isToday={isToday}
      dateLabel={dateLabel}
      last7Days={last7Days}
      completion={completion}
      hasTracking={hasTracking}
      isComplete={isComplete}
      selectedDate={selectedDate}
      onBack={() => router.back()}
      onToggleComplete={() => toggleHabitComplete(habit.id, selectedDate)}
      onIncrement={() => incrementProgress(habit.id, selectedDate)}
      onDecrement={() => decrementProgress(habit.id, selectedDate)}
      onDelete={handleDelete}
    />
  );
}

type HabitDetailViewProps = {
  habit: Habit;
  timeConfig: { label: string; emoji: string };
  isToday: boolean;
  dateLabel: string;
  last7Days: HistoryDayData[];
  completion?: HabitCompletion;
  hasTracking: boolean;
  isComplete: boolean;
  selectedDate: string;
  onBack: () => void;
  onToggleComplete: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onDelete: () => void;
};

function HabitDetailView(props: HabitDetailViewProps): React.ReactElement {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <FocusAwareStatusBar />
      <HabitHeader
        habit={props.habit}
        timeConfig={props.timeConfig}
        onBack={props.onBack}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {!props.isToday && <DateIndicator dateLabel={props.dateLabel} />}
        <HistorySection last7Days={props.last7Days} />
        <HabitActions
          habit={props.habit}
          completion={props.completion}
          hasTracking={props.hasTracking}
          isComplete={props.isComplete}
          isToday={props.isToday}
          dateLabel={props.dateLabel}
          onToggleComplete={props.onToggleComplete}
          onIncrement={props.onIncrement}
          onDecrement={props.onDecrement}
        />
        {props.isComplete && (
          <SuccessState isToday={props.isToday} dateLabel={props.dateLabel} />
        )}
        <ActionButtons habitId={props.habit.id} onDelete={props.onDelete} />
      </ScrollView>
    </SafeAreaView>
  );
}

function HabitNotFound({ onBack }: { onBack: () => void }): React.ReactElement {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <FocusAwareStatusBar />
      <View className="flex-1 items-center justify-center">
        <Text className="text-neutral-500">Habit not found</Text>
        <Pressable onPress={onBack} className="mt-4">
          <Text className="text-primary-500">Go back</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

type HabitHeaderProps = {
  habit: Habit;
  timeConfig: { label: string; emoji: string };
  onBack: () => void;
};

function HabitHeader({
  habit,
  timeConfig,
  onBack,
}: HabitHeaderProps): React.ReactElement {
  return (
    <View className="flex-row items-center border-b border-neutral-100 px-4 py-3">
      <Pressable onPress={onBack} className="mr-4">
        <View className="rotate-180">
          <ArrowRight color="#737373" />
        </View>
      </Pressable>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-neutral-800">
          {habit.name}
        </Text>
        <View className="flex-row items-center">
          <Text className="mr-1">{timeConfig.emoji}</Text>
          <Text className="text-sm text-neutral-500">{timeConfig.label}</Text>
        </View>
      </View>
    </View>
  );
}

function DateIndicator({
  dateLabel,
}: {
  dateLabel: string;
}): React.ReactElement {
  return (
    <View className="mx-4 mt-4 rounded-xl bg-neutral-100 p-3">
      <Text className="text-center text-sm text-neutral-600">
        Editing for {dateLabel.toLowerCase()}
      </Text>
    </View>
  );
}

function HistorySection({
  last7Days,
}: {
  last7Days: HistoryDayData[];
}): React.ReactElement {
  return (
    <View className="mx-4 mt-4 rounded-2xl bg-white p-4">
      <Text className="mb-3 text-sm font-semibold text-neutral-500">
        7-DAY HISTORY
      </Text>
      <View className="flex-row justify-between">
        {last7Days.map((day) => (
          <HistoryDay key={day.date} {...day} />
        ))}
      </View>
    </View>
  );
}

type HabitActionsProps = {
  habit: Habit;
  completion?: HabitCompletion;
  hasTracking: boolean;
  isComplete: boolean;
  isToday: boolean;
  dateLabel: string;
  onToggleComplete: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
};

function HabitActions({
  habit,
  completion,
  hasTracking,
  isComplete,
  isToday,
  dateLabel,
  onToggleComplete,
  onIncrement,
  onDecrement,
}: HabitActionsProps): React.ReactElement {
  const completedLabel = isToday ? 'Today' : dateLabel;
  const buttonText = isComplete
    ? `✓ Completed for ${completedLabel}`
    : 'Mark as Complete';

  if (hasTracking && habit.tracking) {
    return (
      <View className="mt-4 px-4">
        <ProgressTracker
          tracking={habit.tracking}
          progress={completion?.progress ?? 0}
          isComplete={isComplete}
          onIncrement={onIncrement}
          onDecrement={onDecrement}
        />
      </View>
    );
  }

  return (
    <View className="mt-4 px-4">
      <Pressable
        onPress={onToggleComplete}
        className={`rounded-2xl p-4 ${isComplete ? 'bg-success-500' : 'bg-white'}`}
      >
        <Text
          className={`text-center text-lg font-semibold ${
            isComplete ? 'text-white' : 'text-neutral-800'
          }`}
        >
          {buttonText}
        </Text>
      </Pressable>
    </View>
  );
}

type ProgressTrackerProps = {
  tracking: TrackingConfig;
  progress: number;
  isComplete: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
};

function useProgressDirection(progress: number): {
  direction: 'up' | 'down';
  setDirection: (dir: 'up' | 'down') => void;
} {
  const [direction, setDirection] = React.useState<'up' | 'down'>('up');
  const prevProgress = React.useRef(progress);

  React.useEffect(() => {
    if (progress > prevProgress.current) setDirection('up');
    else if (progress < prevProgress.current) setDirection('down');
    prevProgress.current = progress;
  }, [progress]);

  return { direction, setDirection };
}

function ProgressTracker({
  tracking,
  progress,
  isComplete,
  onIncrement,
  onDecrement,
}: ProgressTrackerProps): React.ReactElement {
  const percentage = Math.min((progress / tracking.goal) * 100, 100);
  const { direction, setDirection } = useProgressDirection(progress);

  const handleIncrement = (): void => {
    setDirection('up');
    onIncrement();
  };

  const handleDecrement = (): void => {
    setDirection('down');
    onDecrement();
  };

  return (
    <View className="rounded-2xl bg-white p-4">
      <Text className="mb-4 text-sm font-semibold text-neutral-500">
        DAILY PROGRESS
      </Text>
      <ProgressDisplay
        progress={progress}
        goal={tracking.goal}
        unit={tracking.unit}
        direction={direction}
      />
      <ProgressBar percentage={percentage} isComplete={isComplete} />
      <ProgressControls
        progress={progress}
        isComplete={isComplete}
        onIncrement={handleIncrement}
        onDecrement={handleDecrement}
      />
      {isComplete && (
        <Text className="mt-4 text-center text-sm font-medium text-success-600">
          🎉 Goal reached!
        </Text>
      )}
    </View>
  );
}

type ProgressDisplayProps = {
  progress: number;
  goal: number;
  unit?: string;
  direction: 'up' | 'down';
};

function ProgressDisplay({
  progress,
  goal,
  unit,
  direction,
}: ProgressDisplayProps): React.ReactElement {
  return (
    <View className="mb-4 items-center">
      <View className="flex-row items-baseline">
        <TickerNumber value={progress} direction={direction} />
        <Text className="font-poppins-bold text-2xl text-neutral-400">
          /{goal}
        </Text>
      </View>
      <Text className="mt-1 text-sm text-neutral-500">{unit}</Text>
    </View>
  );
}

function ProgressBar({
  percentage,
  isComplete,
}: {
  percentage: number;
  isComplete: boolean;
}): React.ReactElement {
  return (
    <View className="mb-6 h-3 overflow-hidden rounded-full bg-neutral-100">
      <Animated.View
        className={cn(
          'h-full rounded-full',
          isComplete ? 'bg-success-500' : 'bg-primary-400'
        )}
        style={{ width: `${percentage}%` }}
      />
    </View>
  );
}

type ProgressControlsProps = {
  progress: number;
  isComplete: boolean;
  onIncrement: () => void;
  onDecrement: () => void;
};

function ProgressControls({
  progress,
  isComplete,
  onIncrement,
  onDecrement,
}: ProgressControlsProps): React.ReactElement {
  return (
    <View className="flex-row items-center justify-center gap-6">
      <ProgressButton icon="−" onPress={onDecrement} disabled={progress <= 0} />
      <ProgressButton
        icon="+"
        onPress={onIncrement}
        isPrimary
        isComplete={isComplete}
      />
    </View>
  );
}

type TickerNumberProps = {
  value: number;
  direction: 'up' | 'down';
};

function TickerNumber({
  value,
  direction,
}: TickerNumberProps): React.ReactElement {
  const key = `${value}-${Date.now()}`;

  // Subtle, gentle animations
  const enteringAnimation =
    direction === 'up'
      ? FadeInDown.duration(200).withInitialValues({
          transform: [{ translateY: -10 }],
        })
      : FadeInDown.duration(200).withInitialValues({
          transform: [{ translateY: 10 }],
        });

  const exitingAnimation = FadeOut.duration(100);

  return (
    <View className="h-12 items-center justify-center">
      <Animated.Text
        key={key}
        entering={enteringAnimation}
        exiting={exitingAnimation}
        className="font-poppins-bold text-4xl text-neutral-800"
      >
        {value}
      </Animated.Text>
    </View>
  );
}

type ProgressButtonProps = {
  icon: string;
  onPress: () => void;
  disabled?: boolean;
  isPrimary?: boolean;
  isComplete?: boolean;
};

function ProgressButton({
  icon,
  onPress,
  disabled,
  isPrimary,
  isComplete,
}: ProgressButtonProps): React.ReactElement {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = (): void => {
    if (disabled) return;
    scale.value = withSequence(
      withTiming(0.85, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    onPress();
  };

  const getBackgroundClass = (): string => {
    if (disabled) return 'bg-neutral-100';
    if (isPrimary) return isComplete ? 'bg-success-500' : 'bg-primary-500';
    return 'bg-neutral-200';
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      style={animatedStyle}
      className={cn(
        'size-14 items-center justify-center rounded-full',
        getBackgroundClass()
      )}
    >
      <Text
        className={cn(
          'text-2xl font-bold',
          disabled
            ? 'text-neutral-300'
            : isPrimary
              ? 'text-white'
              : 'text-neutral-600'
        )}
      >
        {icon}
      </Text>
    </AnimatedPressable>
  );
}

function SuccessState({
  isToday,
  dateLabel,
}: {
  isToday: boolean;
  dateLabel: string;
}): React.ReactElement {
  const message = isToday
    ? "You've completed this habit for today"
    : `You completed this habit on ${dateLabel.toLowerCase()}`;

  return (
    <View className="mx-4 mt-6 items-center rounded-2xl bg-success-50 p-6">
      <Text className="text-4xl">🎉</Text>
      <Text className="mt-2 text-lg font-semibold text-success-700">
        {isToday ? 'Great job!' : 'Completed!'}
      </Text>
      <Text className="mt-1 text-center text-success-600">{message}</Text>
    </View>
  );
}

function ActionButtons({
  habitId,
  onDelete,
}: {
  habitId: string;
  onDelete: () => void;
}): React.ReactElement {
  const router = useRouter();
  return (
    <View className="mt-8 px-4 pb-8">
      <Pressable
        onPress={() => router.push(`/habit/add?edit=${habitId}`)}
        className="mb-3 rounded-2xl bg-white px-4 py-3"
      >
        <Text className="text-center text-base text-neutral-800">
          Edit Habit
        </Text>
      </Pressable>
      <Pressable onPress={onDelete} className="rounded-2xl px-4 py-3">
        <Text className="text-center text-base text-danger-500">
          Delete Habit
        </Text>
      </Pressable>
    </View>
  );
}
