import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as React from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
} from 'react-native-reanimated';

import { JournalDatePicker } from '@/components/journal-date-picker';
import { JournalHeader } from '@/components/journal-header';
import { JournalTitleInput } from '@/components/journal-title-input';
import { MoodSelector } from '@/components/mood-selector';
import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import { useJournalStore } from '@/lib/stores';
import type { MoodLevel } from '@/types';

const QUOTES = [
  '"Small steps every day add up to big results."',
  '"Your story matters. Keep writing it."',
  '"Today is a new page in your journal of life."',
  '"Reflection is the lamp of the heart."',
  '"Write what should not be forgotten."',
];

function getRandomQuote(): string {
  return QUOTES[Math.floor(Math.random() * QUOTES.length)];
}

function getTodayDate(): string {
  return new Date().toISOString().split('T')[0];
}

function getCurrentTime(): string {
  return new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function useInitialDate(editId?: string, dateParam?: string): string {
  const entries = useJournalStore.use.entries();
  if (editId) {
    const entry = entries.find((e) => e.id === editId);
    return entry?.date ?? getTodayDate();
  }
  if (dateParam) {
    return dateParam;
  }
  return getTodayDate();
}

function useJournalEntry(selectedDate: string) {
  const getEntryForDate = useJournalStore.use.getEntryForDate();
  const addEntry = useJournalStore.use.addEntry();
  const updateEntry = useJournalStore.use.updateEntry();
  const deleteEntry = useJournalStore.use.deleteEntry();
  const entryForDate = getEntryForDate(selectedDate);

  return { entryForDate, addEntry, updateEntry, deleteEntry };
}

function useFormState(selectedDate: string) {
  const getEntryForDate = useJournalStore.use.getEntryForDate();
  const entryForDate = getEntryForDate(selectedDate);

  const [title, setTitle] = React.useState(entryForDate?.title ?? '');
  const [text, setText] = React.useState(entryForDate?.text ?? '');
  const [mood, setMood] = React.useState<MoodLevel>(entryForDate?.mood ?? 4);

  React.useEffect(() => {
    const entry = getEntryForDate(selectedDate);
    setTitle(entry?.title ?? '');
    setText(entry?.text ?? '');
    setMood(entry?.mood ?? 4);
  }, [selectedDate, getEntryForDate]);

  return { title, text, mood, setTitle, setText, setMood };
}

type HandlersParams = {
  entryForDate: ReturnType<typeof useJournalStore.use.getEntryForDate> extends (
    d: string
  ) => infer R
    ? R
    : never;
  title: string;
  text: string;
  mood: MoodLevel;
  selectedDate: string;
  addEntry: ReturnType<typeof useJournalStore.use.addEntry>;
  updateEntry: ReturnType<typeof useJournalStore.use.updateEntry>;
  deleteEntry: ReturnType<typeof useJournalStore.use.deleteEntry>;
  router: ReturnType<typeof useRouter>;
};

function useHandlers(params: HandlersParams) {
  const {
    entryForDate,
    title,
    text,
    mood,
    selectedDate,
    addEntry,
    updateEntry,
    deleteEntry,
    router,
  } = params;

  const canSave = title.trim().length > 0 || text.trim().length > 0;

  const handleSave = (): void => {
    if (!canSave) {
      Alert.alert('Error', 'Please add a title or write something');
      return;
    }
    if (entryForDate) {
      updateEntry({
        id: entryForDate.id,
        title: title.trim(),
        text: text.trim(),
        mood,
      });
    } else {
      addEntry({
        title: title.trim(),
        text: text.trim(),
        mood,
        date: selectedDate,
        time: getCurrentTime(),
      });
    }
    router.back();
  };

  const handleDelete = (): void => {
    if (!entryForDate) return;
    Alert.alert('Delete Entry', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteEntry(entryForDate.id);
          router.back();
        },
      },
    ]);
  };

  return { canSave, handleSave, handleDelete };
}

export default function AddReflection(): React.ReactElement {
  const router = useRouter();
  const { edit, date } = useLocalSearchParams<{
    edit?: string;
    date?: string;
  }>();
  const selectedDate = useInitialDate(edit, date);
  const [quote] = React.useState(getRandomQuote);

  const { entryForDate, addEntry, updateEntry, deleteEntry } =
    useJournalEntry(selectedDate);
  const { title, text, mood, setTitle, setText, setMood } =
    useFormState(selectedDate);

  const { canSave, handleSave, handleDelete } = useHandlers({
    entryForDate,
    title,
    text,
    mood,
    selectedDate,
    addEntry,
    updateEntry,
    deleteEntry,
    router,
  });

  const time = entryForDate?.time ?? getCurrentTime();
  const hasExistingEntry = !!entryForDate;

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-charcoal-950">
      <FocusAwareStatusBar />
      <JournalHeader
        title={hasExistingEntry ? 'Edit Entry' : 'New Entry'}
        canSave={canSave}
        onBack={() => router.back()}
        onSave={handleSave}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <JournalScrollContent
          selectedDate={selectedDate}
          time={time}
          title={title}
          text={text}
          mood={mood}
          quote={quote}
          hasExistingEntry={hasExistingEntry}
          setTitle={setTitle}
          setText={setText}
          setMood={setMood}
          onDelete={handleDelete}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type ScrollContentProps = {
  selectedDate: string;
  time: string;
  title: string;
  text: string;
  mood: MoodLevel;
  quote: string;
  hasExistingEntry: boolean;
  setTitle: (title: string) => void;
  setText: (text: string) => void;
  setMood: (mood: MoodLevel) => void;
  onDelete: () => void;
};

function JournalScrollContent({
  selectedDate,
  time,
  title,
  text,
  mood,
  quote,
  hasExistingEntry,
  setTitle,
  setText,
  setMood,
  onDelete,
}: ScrollContentProps): React.ReactElement {
  return (
    <ScrollView
      className="flex-1"
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View className="flex-1 gap-4 px-4">
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <JournalDatePicker date={selectedDate} time={time} />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <MoodSelector value={mood} onChange={setMood} />
        </Animated.View>

        <ContentCard
          title={title}
          text={text}
          setTitle={setTitle}
          setText={setText}
        />

        {hasExistingEntry && <DeleteButton onDelete={onDelete} />}

        <QuoteFooter quote={quote} />
      </View>
    </ScrollView>
  );
}

type ContentCardProps = {
  title: string;
  text: string;
  setTitle: (title: string) => void;
  setText: (text: string) => void;
};

function ContentCard({
  title,
  text,
  setTitle,
  setText,
}: ContentCardProps): React.ReactElement {
  const cardScale = useSharedValue(0.95);
  const cardOpacity = useSharedValue(0);

  React.useEffect(() => {
    cardOpacity.value = withDelay(200, withSpring(1));
    cardScale.value = withDelay(200, withSpring(1, { damping: 15 }));
  }, [cardOpacity, cardScale]);

  const cardStyle = useAnimatedStyle(() => ({
    opacity: cardOpacity.value,
    transform: [{ scale: cardScale.value }],
  }));

  return (
    <Animated.View
      style={cardStyle}
      className="flex-1 overflow-hidden rounded-3xl bg-white dark:bg-charcoal-850"
    >
      <LinearGradient
        colors={['rgba(249, 115, 22, 0.08)', 'transparent']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.5, y: 0.5 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: 150,
          height: 150,
          borderTopLeftRadius: 24,
        }}
      />
      <View className="p-5">
        <JournalTitleInput value={title} onChangeText={setTitle} />
        <View className="my-4 h-px bg-neutral-100 dark:bg-charcoal-700" />
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder="How was your day? Tell Leo all about it..."
          placeholderTextColor="#A3A3A3"
          multiline
          textAlignVertical="top"
          className="min-h-[200px] flex-1 font-poppins text-base text-neutral-700 dark:text-neutral-200"
          style={{ padding: 0 }}
        />
      </View>
    </Animated.View>
  );
}

function DeleteButton({
  onDelete,
}: {
  onDelete: () => void;
}): React.ReactElement {
  return (
    <Animated.View entering={FadeIn.delay(400)}>
      <Pressable onPress={onDelete} className="my-4 py-3">
        <Text className="text-center text-base text-danger-500">
          Delete Entry
        </Text>
      </Pressable>
    </Animated.View>
  );
}

function QuoteFooter({ quote }: { quote: string }): React.ReactElement {
  return (
    <Animated.View entering={FadeIn.delay(500)} className="py-4">
      <Text className="text-center font-poppins text-sm italic text-neutral-400 dark:text-neutral-500">
        {quote}
      </Text>
    </Animated.View>
  );
}
