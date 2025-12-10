import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, ScrollView, TextInput } from 'react-native';

import { TimeOfDayPicker } from '@/components/time-of-day-picker';
import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { ArrowRight } from '@/components/ui/icons';
import {
  MAX_FREE_HABITS_COUNT,
  useHabitStore,
  useUserStore,
} from '@/lib/stores';
import type { SubTask, TimeOfDay } from '@/types';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function useHabitData(editId?: string) {
  const habits = useHabitStore.use.habits();
  const existingHabit = editId
    ? habits.find((h) => h.id === editId)
    : undefined;
  return { habits, existingHabit, isEditing: !!existingHabit };
}

export default function AddHabit(): React.ReactElement {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();

  const addHabit = useHabitStore.use.addHabit();
  const updateHabit = useHabitStore.use.updateHabit();
  const canAddHabit = useUserStore.use.canAddHabit();

  const { habits, existingHabit, isEditing } = useHabitData(edit);

  const [name, setName] = React.useState(existingHabit?.name ?? '');
  const [timeOfDay, setTimeOfDay] = React.useState<TimeOfDay>(
    existingHabit?.timeOfDay ?? 'morning'
  );
  const [subTasks, setSubTasks] = React.useState<SubTask[]>(
    existingHabit?.subTasks ?? []
  );
  const [newSubTask, setNewSubTask] = React.useState('');

  const canSave = name.trim().length > 0;

  const handleSave = (): void => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a habit name');
      return;
    }
    const habitData = {
      name: name.trim(),
      timeOfDay,
      subTasks: subTasks.length > 0 ? subTasks : undefined,
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
    <AddHabitView
      isEditing={isEditing}
      canSave={canSave}
      habitsCount={habits.length}
      name={name}
      setName={setName}
      timeOfDay={timeOfDay}
      setTimeOfDay={setTimeOfDay}
      subTasks={subTasks}
      setSubTasks={setSubTasks}
      newSubTask={newSubTask}
      setNewSubTask={setNewSubTask}
      onBack={() => router.back()}
      onSave={handleSave}
    />
  );
}

type ViewProps = {
  isEditing: boolean;
  canSave: boolean;
  habitsCount: number;
  name: string;
  setName: (name: string) => void;
  timeOfDay: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
  subTasks: SubTask[];
  setSubTasks: React.Dispatch<React.SetStateAction<SubTask[]>>;
  newSubTask: string;
  setNewSubTask: (value: string) => void;
  onBack: () => void;
  onSave: () => void;
};

function AddHabitView({
  isEditing,
  canSave,
  habitsCount,
  name,
  setName,
  timeOfDay,
  setTimeOfDay,
  subTasks,
  setSubTasks,
  newSubTask,
  setNewSubTask,
  onBack,
  onSave,
}: ViewProps): React.ReactElement {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <FocusAwareStatusBar />
      <AddHabitHeader
        isEditing={isEditing}
        canSave={canSave}
        onBack={onBack}
        onSave={onSave}
      />
      <ScrollView
        className="flex-1 px-4 pt-6"
        showsVerticalScrollIndicator={false}
      >
        <FreeTierInfo isEditing={isEditing} habitsCount={habitsCount} />
        <HabitNameInput name={name} setName={setName} />
        <TimeOfDaySection timeOfDay={timeOfDay} setTimeOfDay={setTimeOfDay} />
        <SubTasksSection
          subTasks={subTasks}
          setSubTasks={setSubTasks}
          newSubTask={newSubTask}
          setNewSubTask={setNewSubTask}
        />
      </ScrollView>
    </SafeAreaView>
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
  return (
    <View className="flex-row items-center justify-between border-b border-neutral-100 px-4 py-3">
      <Pressable onPress={onBack} className="mr-4">
        <View className="rotate-180">
          <ArrowRight color="#737373" />
        </View>
      </Pressable>
      <Text className="flex-1 text-lg font-semibold text-neutral-800">
        {isEditing ? 'Edit Habit' : 'New Habit'}
      </Text>
      <Pressable onPress={onSave} disabled={!canSave}>
        <Text
          className={`text-base font-semibold ${
            canSave ? 'text-primary-500' : 'text-neutral-300'
          }`}
        >
          Save
        </Text>
      </Pressable>
    </View>
  );
}

function FreeTierInfo({
  isEditing,
  habitsCount,
}: {
  isEditing: boolean;
  habitsCount: number;
}): React.ReactElement | null {
  if (isEditing || habitsCount < MAX_FREE_HABITS_COUNT - 1) return null;
  return (
    <View className="mb-4 rounded-xl bg-warning-50 p-3">
      <Text className="text-sm text-warning-700">
        You have {habitsCount} of {MAX_FREE_HABITS_COUNT} free habits.
        {habitsCount === MAX_FREE_HABITS_COUNT - 1 &&
          ' This will be your last free habit.'}
      </Text>
    </View>
  );
}

function HabitNameInput({
  name,
  setName,
}: {
  name: string;
  setName: (name: string) => void;
}): React.ReactElement {
  return (
    <View className="mb-6">
      <Text className="mb-2 text-sm font-semibold text-neutral-500">
        HABIT NAME
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g., Drink Water, Meditate, Read"
        placeholderTextColor="#A3A3A3"
        className="rounded-xl bg-white px-4 py-3 text-base text-neutral-800"
      />
    </View>
  );
}

function TimeOfDaySection({
  timeOfDay,
  setTimeOfDay,
}: {
  timeOfDay: TimeOfDay;
  setTimeOfDay: (time: TimeOfDay) => void;
}): React.ReactElement {
  return (
    <View className="mb-6">
      <Text className="mb-2 text-sm font-semibold text-neutral-500">
        TIME OF DAY
      </Text>
      <TimeOfDayPicker value={timeOfDay} onChange={setTimeOfDay} />
    </View>
  );
}

type SubTasksSectionProps = {
  subTasks: SubTask[];
  setSubTasks: React.Dispatch<React.SetStateAction<SubTask[]>>;
  newSubTask: string;
  setNewSubTask: (value: string) => void;
};

function SubTasksSection({
  subTasks,
  setSubTasks,
  newSubTask,
  setNewSubTask,
}: SubTasksSectionProps): React.ReactElement {
  const handleAddSubTask = (): void => {
    if (newSubTask.trim()) {
      setSubTasks([
        ...subTasks,
        { id: generateId(), title: newSubTask.trim() },
      ]);
      setNewSubTask('');
    }
  };

  const handleRemoveSubTask = (id: string): void => {
    setSubTasks(subTasks.filter((s) => s.id !== id));
  };

  return (
    <View className="mb-6">
      <Text className="mb-2 text-sm font-semibold text-neutral-500">
        STEPS (OPTIONAL)
      </Text>
      <Text className="mb-3 text-xs text-neutral-400">
        Break your habit into smaller steps to track progress
      </Text>
      {subTasks.map((subTask) => (
        <View
          key={subTask.id}
          className="mb-2 flex-row items-center rounded-xl bg-white px-4 py-3"
        >
          <Text className="flex-1 text-base text-neutral-800">
            {subTask.title}
          </Text>
          <Pressable onPress={() => handleRemoveSubTask(subTask.id)}>
            <Text className="text-danger-500">Remove</Text>
          </Pressable>
        </View>
      ))}
      <View className="flex-row items-center rounded-xl bg-white">
        <TextInput
          value={newSubTask}
          onChangeText={setNewSubTask}
          placeholder="Add a step..."
          placeholderTextColor="#A3A3A3"
          className="flex-1 px-4 py-3 text-base text-neutral-800"
          onSubmitEditing={handleAddSubTask}
          returnKeyType="done"
        />
        {newSubTask.trim() && (
          <Pressable onPress={handleAddSubTask} className="px-4">
            <Text className="font-semibold text-primary-500">Add</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
