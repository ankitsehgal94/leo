import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { DailyTargetPicker } from '@/components/daily-target-picker';
import { FrequencyPicker } from '@/components/frequency-picker';
import { HabitSummaryCard } from '@/components/habit-summary-card';
import { HabitTitleInput } from '@/components/habit-title-input';
import { ReminderPicker } from '@/components/reminder-picker';
import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { ArrowLeft } from '@/components/ui/icons';
import { cn } from '@/lib';
import { requestNotificationPermissions } from '@/lib/notifications';
import { useHabitStore, useUserStore } from '@/lib/stores';
import type { DayOfWeek, Frequency, TimeOfDay, TrackingConfig } from '@/types';
import { ALL_DAYS, deriveTimeOfDay, suggestTracking } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function useHabitData(editId?: string) {
  const habits = useHabitStore.use.habits();
  const existingHabit = editId
    ? habits.find((h) => h.id === editId)
    : undefined;
  return { habits, existingHabit, isEditing: !!existingHabit };
}

type HabitFormState = {
  name: string;
  setName: (name: string) => void;
  frequency: Frequency;
  setFrequency: (frequency: Frequency) => void;
  selectedDays: DayOfWeek[];
  setSelectedDays: (days: DayOfWeek[]) => void;
  reminderEnabled: boolean;
  setReminderEnabled: (enabled: boolean) => void;
  reminderTime: string;
  setReminderTime: (time: string) => void;
  timeOfDay: TimeOfDay;
  setTimeOfDay: (timeOfDay: TimeOfDay) => void;
  tracking: TrackingConfig;
  setTracking: (tracking: TrackingConfig) => void;
};

function useHabitForm(
  existingHabit: ReturnType<typeof useHabitData>['existingHabit'],
  isEditing: boolean
): HabitFormState {
  const [name, setName] = React.useState(existingHabit?.name ?? '');
  const [frequency, setFrequency] = React.useState<Frequency>(
    existingHabit?.frequency ?? 'daily'
  );
  const [selectedDays, setSelectedDays] = React.useState<DayOfWeek[]>(
    existingHabit?.selectedDays ?? ALL_DAYS
  );
  const [reminderEnabled, setReminderEnabled] = React.useState(
    existingHabit?.reminderEnabled ?? false
  );
  const [reminderTime, setReminderTime] = React.useState(
    existingHabit?.reminderTime ?? '08:00'
  );
  const [timeOfDay, setTimeOfDay] = React.useState<TimeOfDay>(
    existingHabit?.timeOfDay ?? 'morning'
  );
  const [tracking, setTracking] = React.useState<TrackingConfig>(
    existingHabit?.tracking ?? { type: 'simple', goal: 1 }
  );
  const [hasAppliedSuggestion, setHasAppliedSuggestion] = React.useState(false);

  React.useEffect(() => {
    if (reminderEnabled) setTimeOfDay(deriveTimeOfDay(reminderTime));
  }, [reminderEnabled, reminderTime]);

  React.useEffect(() => {
    if (!isEditing && name.trim().length > 2 && !hasAppliedSuggestion) {
      const suggested = suggestTracking(name);
      if (suggested.type !== 'simple') {
        setTracking(suggested);
        setHasAppliedSuggestion(true);
      }
    }
  }, [name, isEditing, hasAppliedSuggestion]);

  return {
    name,
    setName,
    frequency,
    setFrequency,
    selectedDays,
    setSelectedDays,
    reminderEnabled,
    setReminderEnabled,
    reminderTime,
    setReminderTime,
    timeOfDay,
    setTimeOfDay,
    tracking,
    setTracking,
  };
}

export default function AddHabit(): React.ReactElement {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const { habits, existingHabit, isEditing } = useHabitData(edit);
  const form = useHabitForm(existingHabit, isEditing);

  const addHabit = useHabitStore.use.addHabit();
  const updateHabit = useHabitStore.use.updateHabit();
  const canAddHabit = useUserStore.use.canAddHabit();

  const canSave = form.name.trim().length > 0;

  const handleSave = (): void => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }
    const habitData = {
      name: form.name.trim(),
      timeOfDay: form.timeOfDay,
      frequency: form.frequency,
      selectedDays: form.frequency === 'custom' ? form.selectedDays : undefined,
      reminderEnabled: form.reminderEnabled,
      reminderTime: form.reminderEnabled ? form.reminderTime : undefined,
      tracking: form.tracking.type !== 'simple' ? form.tracking : undefined,
    };
    if (isEditing && existingHabit) {
      updateHabit(existingHabit.id, habitData);
    } else {
      if (!canAddHabit(habits.length)) {
        router.push('/paywall');
        return;
      }
      addHabit(habitData);
    }
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <FocusAwareStatusBar />
      <AddHabitHeader
        isEditing={isEditing}
        canSave={canSave}
        onBack={() => router.back()}
        onSave={handleSave}
      />
      <AddHabitScrollContent
        form={form}
        isEditing={isEditing}
        habitsCount={habits.length}
      />
    </SafeAreaView>
  );
}

type AddHabitScrollContentProps = {
  form: HabitFormState;
  isEditing: boolean;
  habitsCount: number;
};

function AddHabitScrollContent({
  form,
  isEditing: _isEditing,
  habitsCount: _habitsCount,
}: AddHabitScrollContentProps): React.ReactElement {
  return (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      {/* <FreeTierInfo isEditing={isEditing} habitsCount={habitsCount} /> */}

      {/* Habit Name Input - Journal style */}
      <HabitTitleInput
        value={form.name}
        onChangeText={form.setName}
        placeholder="Name your habit..."
      />

      {/* Leo Tip Card */}
      {/* {!isEditing && (
        <LeoTipCard
          message="Small steps lead to big purrs! Try starting with a quantity you can easily achieve."
          delay={100}
        />
      )} */}

      <HabitFormSections form={form} />

      {/* Summary Card */}
      <HabitSummaryCard
        tracking={form.tracking}
        frequency={form.frequency}
        selectedDaysCount={
          form.frequency === 'daily' ? 7 : form.selectedDays.length
        }
        reminderEnabled={form.reminderEnabled}
        reminderTime={form.reminderTime}
      />
    </ScrollView>
  );
}

function HabitFormSections({
  form,
}: {
  form: HabitFormState;
}): React.ReactElement {
  const handleReminderEnabledChange = async (
    enabled: boolean
  ): Promise<void> => {
    if (enabled) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        Alert.alert(
          'Notifications Required',
          'Please enable notifications in Settings to receive habit reminders.',
          [{ text: 'OK' }]
        );
        return;
      }
    }
    form.setReminderEnabled(enabled);
  };

  return (
    <View className="px-4">
      {/* Daily Target */}
      <Animated.View
        entering={FadeInDown.delay(150).springify()}
        className="mb-4"
      >
        <DailyTargetPicker value={form.tracking} onChange={form.setTracking} />
      </Animated.View>

      {/* Frequency */}
      <Animated.View
        entering={FadeInDown.delay(200).springify()}
        className="mb-4"
      >
        <FrequencyPicker
          frequency={form.frequency}
          selectedDays={form.selectedDays}
          onFrequencyChange={form.setFrequency}
          onDaysChange={form.setSelectedDays}
        />
      </Animated.View>

      {/* Reminder */}
      <Animated.View
        entering={FadeInDown.delay(250).springify()}
        className="mb-4"
      >
        <ReminderPicker
          enabled={form.reminderEnabled}
          time={form.reminderTime}
          timeOfDay={form.timeOfDay}
          onEnabledChange={(enabled) =>
            void handleReminderEnabledChange(enabled)
          }
          onTimeChange={form.setReminderTime}
          onTimeOfDayChange={form.setTimeOfDay}
        />
      </Animated.View>
    </View>
  );
}

type HeaderProps = {
  isEditing: boolean;
  canSave: boolean;
  onBack: () => void;
  onSave: () => void;
};

function AddHabitHeader({
  isEditing,
  canSave,
  onBack,
  onSave,
}: HeaderProps): React.ReactElement {
  const saveScale = useSharedValue(1);

  const saveAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: saveScale.value }],
  }));

  const handleSavePress = (): void => {
    if (!canSave) return;
    saveScale.value = withSequence(
      withTiming(0.9, { duration: 50 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );
    onSave();
  };

  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      {/* Back button */}
      <Pressable
        onPress={onBack}
        className="size-10 items-center justify-center rounded-full bg-neutral-100"
      >
        <ArrowLeft color="#404040" size={20} />
      </Pressable>

      {/* Title */}
      <Text className="font-poppins-semibold text-lg text-neutral-800">
        {isEditing ? 'Edit Habit' : 'New Habit'}
      </Text>

      {/* Create/Save button */}
      <AnimatedPressable
        onPress={handleSavePress}
        disabled={!canSave}
        style={saveAnimatedStyle}
        className={cn(
          'rounded-full px-5 py-2',
          canSave ? 'bg-primary-500' : 'bg-neutral-200'
        )}
      >
        <Text
          className={cn(
            'font-poppins-semibold text-sm',
            canSave ? 'text-white' : 'text-neutral-400'
          )}
        >
          {isEditing ? 'Save' : 'Create'}
        </Text>
      </AnimatedPressable>
    </View>
  );
}
