import { useRouter } from 'expo-router';
import * as React from 'react';
import { Alert, Pressable, ScrollView } from 'react-native';

import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import {
  CATEGORIES,
  HABIT_TEMPLATES,
  type HabitTemplate,
} from '@/data/templates';
import { cn } from '@/lib';
import {
  MAX_FREE_HABITS_COUNT,
  useHabitStore,
  useUserStore,
} from '@/lib/stores';

type TemplateCardProps = {
  template: HabitTemplate;
  onUse: () => void;
};

function TemplateCard({
  template,
  onUse,
}: TemplateCardProps): React.ReactElement {
  return (
    <View className="mb-3 rounded-2xl bg-white p-4">
      <View className="flex-row items-start">
        <View className="mr-3 size-12 items-center justify-center rounded-xl bg-primary-50">
          <Text className="text-2xl">{template.emoji}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-lg font-semibold text-neutral-800">
            {template.name}
          </Text>
          <Text className="mt-1 text-sm text-neutral-500">
            {template.description}
          </Text>
          {template.subTasks && (
            <Text className="mt-1 text-xs text-neutral-400">
              {template.subTasks.length} steps
            </Text>
          )}
        </View>
      </View>
      <Pressable onPress={onUse} className="mt-3 rounded-xl bg-primary-50 py-2">
        <Text className="text-center font-semibold text-primary-600">
          Use Template
        </Text>
      </Pressable>
    </View>
  );
}

function CategoryFilter({
  selectedCategory,
  onSelect,
}: {
  selectedCategory: string;
  onSelect: (id: string) => void;
}): React.ReactElement {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="max-h-12 px-4 py-2"
    >
      {CATEGORIES.map((category) => (
        <Pressable
          key={category.id}
          onPress={() => onSelect(category.id)}
          className={cn(
            'mr-2 flex-row items-center rounded-full px-4 py-2',
            selectedCategory === category.id ? 'bg-primary-500' : 'bg-white'
          )}
        >
          <Text className="mr-1">{category.emoji}</Text>
          <Text
            className={cn(
              'text-sm font-medium',
              selectedCategory === category.id
                ? 'text-white'
                : 'text-neutral-600'
            )}
          >
            {category.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

export default function Discover(): React.ReactElement {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState('all');

  const habits = useHabitStore.use.habits();
  const addHabit = useHabitStore.use.addHabit();
  const canAddHabit = useUserStore.use.canAddHabit();

  const filteredTemplates = React.useMemo(() => {
    if (selectedCategory === 'all') return HABIT_TEMPLATES;
    return HABIT_TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const handleUseTemplate = (template: HabitTemplate): void => {
    if (!canAddHabit(habits.length)) {
      router.push('/paywall');
      return;
    }
    Alert.alert('Add Habit', `Add "${template.name}" to your habits?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Add',
        onPress: () => {
          addHabit({
            name: template.name,
            timeOfDay: template.timeOfDay,
            subTasks: template.subTasks,
          });
          Alert.alert('Success', `"${template.name}" has been added!`);
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <FocusAwareStatusBar />
      <DiscoverHeader />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <FreeTierWarning habitsCount={habits.length} />
      <TemplatesList
        templates={filteredTemplates}
        onUseTemplate={handleUseTemplate}
      />
    </SafeAreaView>
  );
}

function DiscoverHeader(): React.ReactElement {
  return (
    <View className="px-4 py-2">
      <View className="flex-row items-center">
        <Text className="text-2xl">🔍</Text>
        <Text className="ml-2 text-xl font-bold text-neutral-800">
          Discover
        </Text>
      </View>
      <Text className="mt-1 text-neutral-500">
        Browse habit templates to get started
      </Text>
    </View>
  );
}

function FreeTierWarning({
  habitsCount,
}: {
  habitsCount: number;
}): React.ReactElement | null {
  if (habitsCount < MAX_FREE_HABITS_COUNT - 1) return null;
  return (
    <View className="mx-4 mt-2 rounded-xl bg-warning-50 p-3">
      <Text className="text-sm text-warning-700">
        You have {habitsCount} of {MAX_FREE_HABITS_COUNT} free habits.
      </Text>
    </View>
  );
}

function TemplatesList({
  templates,
  onUseTemplate,
}: {
  templates: HabitTemplate[];
  onUseTemplate: (template: HabitTemplate) => void;
}): React.ReactElement {
  return (
    <ScrollView
      className="flex-1 px-4 pt-4"
      showsVerticalScrollIndicator={false}
    >
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
          onUse={() => onUseTemplate(template)}
        />
      ))}
      <View className="h-8" />
    </ScrollView>
  );
}
