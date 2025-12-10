import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { ArrowRight } from '@/components/ui/icons';
import { useJournalStore } from '@/lib/stores';
import type { JournalEntry } from '@/types';

const PROMPTS = [
  'How are you feeling today?',
  'What are you grateful for?',
  'What was the highlight of your day?',
  'What challenged you today?',
  'What did you learn today?',
];

function getRandomPrompt(): string {
  return PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function useReflectionData(editId?: string) {
  const entries = useJournalStore.use.entries();
  const getEntryForDate = useJournalStore.use.getEntryForDate();

  const existingEntry = editId
    ? entries.find((e) => e.id === editId)
    : undefined;
  const todayEntry = !editId ? getEntryForDate(getTodayDate()) : undefined;
  const currentEntry = existingEntry || todayEntry;

  return { currentEntry, isEditing: !!currentEntry };
}

export default function AddReflection(): React.ReactElement {
  const router = useRouter();
  const { edit } = useLocalSearchParams<{ edit?: string }>();

  const addEntry = useJournalStore.use.addEntry();
  const updateEntry = useJournalStore.use.updateEntry();
  const deleteEntry = useJournalStore.use.deleteEntry();

  const { currentEntry, isEditing } = useReflectionData(edit);

  const [text, setText] = React.useState(currentEntry?.text ?? '');
  const [prompt] = React.useState(getRandomPrompt);
  const date = currentEntry?.date ?? getTodayDate();
  const canSave = text.trim().length > 0;

  const handleSave = (): void => {
    if (!text.trim()) {
      Alert.alert('Error', 'Please write something before saving');
      return;
    }
    if (currentEntry) {
      updateEntry(currentEntry.id, text.trim());
    } else {
      addEntry(text.trim(), date);
    }
    router.back();
  };

  const handleDelete = (): void => {
    if (!currentEntry) return;
    Alert.alert('Delete Reflection', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteEntry(currentEntry.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <AddReflectionView
      isEditing={isEditing}
      canSave={canSave}
      date={date}
      prompt={prompt}
      text={text}
      setText={setText}
      currentEntry={currentEntry}
      onBack={() => router.back()}
      onSave={handleSave}
      onDelete={handleDelete}
    />
  );
}

type ViewProps = {
  isEditing: boolean;
  canSave: boolean;
  date: string;
  prompt: string;
  text: string;
  setText: (text: string) => void;
  currentEntry: JournalEntry | undefined;
  onBack: () => void;
  onSave: () => void;
  onDelete: () => void;
};

function AddReflectionView({
  isEditing,
  canSave,
  date,
  prompt,
  text,
  setText,
  currentEntry,
  onBack,
  onSave,
  onDelete,
}: ViewProps): React.ReactElement {
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <FocusAwareStatusBar />
      <ReflectionHeader
        isEditing={isEditing}
        canSave={canSave}
        onBack={onBack}
        onSave={onSave}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ReflectionContent
          date={date}
          prompt={prompt}
          text={text}
          setText={setText}
          currentEntry={currentEntry}
          onDelete={onDelete}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type HeaderProps = {
  isEditing: boolean;
  canSave: boolean;
  onBack: () => void;
  onSave: () => void;
};

function ReflectionHeader({
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
        {isEditing ? 'Edit Reflection' : 'New Reflection'}
      </Text>
      <Pressable onPress={onSave} disabled={!canSave}>
        <Text
          className={`text-base font-semibold ${canSave ? 'text-primary-500' : 'text-neutral-300'}`}
        >
          Save
        </Text>
      </Pressable>
    </View>
  );
}

type ContentProps = {
  date: string;
  prompt: string;
  text: string;
  setText: (text: string) => void;
  currentEntry: JournalEntry | undefined;
  onDelete: () => void;
};

function ReflectionContent({
  date,
  prompt,
  text,
  setText,
  currentEntry,
  onDelete,
}: ContentProps): React.ReactElement {
  return (
    <View className="flex-1 px-4 pt-4">
      <Text className="text-sm font-medium text-primary-500">
        {formatDisplayDate(date)}
      </Text>
      <Text className="mt-4 text-xl font-semibold text-neutral-700">
        {prompt}
      </Text>
      <TextInput
        value={text}
        onChangeText={setText}
        placeholder="Start writing..."
        placeholderTextColor="#A3A3A3"
        multiline
        textAlignVertical="top"
        className="mt-4 flex-1 rounded-2xl bg-white p-4 text-base text-neutral-800"
        autoFocus
      />
      {currentEntry && (
        <Pressable onPress={onDelete} className="my-4 py-3">
          <Text className="text-center text-base text-danger-500">
            Delete Reflection
          </Text>
        </Pressable>
      )}
    </View>
  );
}
