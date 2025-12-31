import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { FocusAwareStatusBar, SafeAreaView, Text, View } from '@/components/ui';
import {
  CATEGORIES,
  CATEGORY_COLORS,
  HABIT_TEMPLATES,
  type HabitTemplate,
} from '@/data/templates';
import { cn } from '@/lib';
import { MAX_FREE_HABITS_COUNT, useHabitStore } from '@/lib/stores';

export default function Discover(): React.ReactElement {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const habits = useHabitStore.use.habits();

  const filteredTemplates = React.useMemo(() => {
    if (selectedCategory === 'all') return HABIT_TEMPLATES;
    return HABIT_TEMPLATES.filter((t) => t.category === selectedCategory);
  }, [selectedCategory]);

  const handleTemplatePress = (template: HabitTemplate): void => {
    router.push(`/habit/template/${template.id}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-neutral-50 dark:bg-charcoal-950">
      <FocusAwareStatusBar />
      <DiscoverHeader />
      <CategoryFilter
        selectedCategory={selectedCategory}
        onSelect={setSelectedCategory}
      />
      <FreeTierBanner habitsCount={habits.length} />
      <TemplatesList
        templates={filteredTemplates}
        onTemplatePress={handleTemplatePress}
      />
    </SafeAreaView>
  );
}

function DiscoverHeader(): React.ReactElement {
  return (
    <View className="px-4 pb-2 pt-4">
      <View className="flex-row items-center">
        <Text className="text-2xl">🔍</Text>
        <Text className="ml-2 font-nunito-bold text-2xl text-neutral-800 dark:text-neutral-100">
          Discover
        </Text>
      </View>
      <Text className="mt-1 font-poppins text-sm text-neutral-500 dark:text-neutral-400">
        Browse habit templates to get started
      </Text>
    </View>
  );
}

type CategoryFilterProps = {
  selectedCategory: string;
  onSelect: (id: string) => void;
};

function CategoryFilter({
  selectedCategory,
  onSelect,
}: CategoryFilterProps): React.ReactElement {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="max-h-14 px-4 py-2"
      contentContainerStyle={{ gap: 8 }}
    >
      {CATEGORIES.map((category) => {
        const isSelected = selectedCategory === category.id;
        return (
          <Pressable
            key={category.id}
            onPress={() => onSelect(category.id)}
            className={cn(
              'flex-row items-center rounded-full px-4 py-2.5',
              isSelected
                ? 'bg-primary-500'
                : 'border border-neutral-200 bg-white dark:border-charcoal-700 dark:bg-charcoal-850'
            )}
          >
            <Text className="mr-1.5">{category.emoji}</Text>
            <Text
              className={cn(
                'font-poppins-medium text-sm',
                isSelected
                  ? 'text-white'
                  : 'text-neutral-700 dark:text-neutral-300'
              )}
            >
              {category.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function FreeTierBanner({
  habitsCount,
}: {
  habitsCount: number;
}): React.ReactElement {
  return (
    <View className="mx-4 mt-2 flex-row items-center rounded-2xl bg-primary-50 px-4 py-3 dark:bg-primary-900/20">
      <View className="mr-3 size-6 items-center justify-center rounded-full bg-primary-500">
        <Text className="text-xs text-white">i</Text>
      </View>
      <Text className="flex-1 font-poppins text-sm text-neutral-700 dark:text-neutral-300">
        You have {habitsCount} of {MAX_FREE_HABITS_COUNT} free habits used.
      </Text>
    </View>
  );
}

type TemplatesListProps = {
  templates: HabitTemplate[];
  onTemplatePress: (template: HabitTemplate) => void;
};

function TemplatesList({
  templates,
  onTemplatePress,
}: TemplatesListProps): React.ReactElement {
  return (
    <ScrollView
      className="flex-1 px-4 pt-4"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      {templates.map((template, index) => (
        <TemplateCard
          key={template.id}
          template={template}
          index={index}
          onPress={() => onTemplatePress(template)}
        />
      ))}
    </ScrollView>
  );
}

type TemplateCardProps = {
  template: HabitTemplate;
  index: number;
  onPress: () => void;
};

function TemplateCard({
  template,
  index,
  onPress,
}: TemplateCardProps): React.ReactElement {
  const colors = CATEGORY_COLORS[template.category] || {
    bg: 'bg-neutral-100',
  };
  const categoryLabel = getCategoryLabel(template.category);
  const habitCount = template.habits.length;
  const metaText = template.duration
    ? `${template.duration} • ${categoryLabel}`
    : `${habitCount} habits • ${categoryLabel}`;

  return (
    <Pressable onPress={onPress}>
      <Animated.View
        entering={FadeInDown.delay(index * 60).springify()}
        className="mb-4 rounded-3xl bg-white p-5 dark:bg-charcoal-850"
      >
        <View className="flex-row">
          {/* Icon Circle */}
          <View
            className={cn(
              'mr-4 size-16 items-center justify-center rounded-full',
              colors.bg
            )}
          >
            <Text className="text-3xl">{template.emoji}</Text>
          </View>

          {/* Content */}
          <View className="flex-1 justify-center">
            <Text className="font-nunito-bold text-lg text-neutral-800 dark:text-neutral-100">
              {template.name}
            </Text>
            <Text
              className="mt-1 font-poppins text-sm text-neutral-500 dark:text-neutral-400"
              numberOfLines={2}
            >
              {template.description}
            </Text>
            <Text className="mt-2 font-poppins text-xs text-neutral-400 dark:text-neutral-500">
              {metaText}
            </Text>
          </View>
        </View>

        {/* Use Template Button */}
        <View className="mt-4 items-center rounded-xl bg-primary-50 py-3 dark:bg-primary-900/20">
          <Text className="font-poppins-semibold text-sm text-primary-600 dark:text-primary-400">
            Use Template
          </Text>
        </View>
      </Animated.View>
    </Pressable>
  );
}

function getCategoryLabel(category: string): string {
  const found = CATEGORIES.find((c) => c.id === category);
  return found?.label || category;
}
