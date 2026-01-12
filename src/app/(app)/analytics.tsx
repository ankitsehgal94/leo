import * as React from 'react';
import { Pressable, ScrollView } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import {
  CompletionTrendsChart,
  ConsistencyHeatmap,
  HabitInsightCard,
} from '@/components/analytics';
import { SafeAreaView, Text, View } from '@/components/ui';
import { Analytics as AnalyticsIcon } from '@/components/ui/icons';
import { useAnalytics } from '@/lib';
import type { AnalyticsSummary, HabitInsight, TimePeriod } from '@/types';

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon?: string;
}) {
  return (
    <View className="flex-1 items-center rounded-xl bg-white p-3 dark:bg-charcoal-850">
      {icon && <Text className="text-xl">{icon}</Text>}
      <Text className="mt-1 font-poppins-bold text-xl text-primary-500">
        {value}
      </Text>
      <Text className="mt-0.5 text-center text-xs text-neutral-500 dark:text-neutral-400">
        {label}
      </Text>
    </View>
  );
}

function PeriodSelector({
  selected,
  onChange,
}: {
  selected: TimePeriod;
  onChange: (p: TimePeriod) => void;
}) {
  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'daily', label: '7D' },
    { value: 'weekly', label: '8W' },
    { value: 'monthly', label: '6M' },
  ];
  return (
    <View className="flex-row rounded-lg bg-neutral-100 p-1 dark:bg-charcoal-800">
      {periods.map((p) => (
        <Pressable
          key={p.value}
          onPress={() => onChange(p.value)}
          className={`flex-1 items-center rounded-md py-1.5 ${selected === p.value ? 'bg-white dark:bg-charcoal-700' : ''}`}
        >
          <Text
            className={`font-poppins-medium text-sm ${selected === p.value ? 'text-primary-500' : 'text-neutral-500 dark:text-neutral-400'}`}
          >
            {p.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function ChartTypeSelector({
  selected,
  onChange,
}: {
  selected: 'bar' | 'line';
  onChange: (t: 'bar' | 'line') => void;
}) {
  const types: ('bar' | 'line')[] = ['bar', 'line'];
  return (
    <View className="flex-row gap-2">
      {types.map((t) => (
        <Pressable
          key={t}
          onPress={() => onChange(t)}
          className={`rounded-lg px-3 py-1.5 ${selected === t ? 'bg-primary-500' : 'bg-neutral-100 dark:bg-charcoal-800'}`}
        >
          <Text
            className={`font-poppins-medium text-xs ${selected === t ? 'text-white' : 'text-neutral-500 dark:text-neutral-400'}`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function SectionHeader({
  title,
  children,
}: {
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <View className="mb-3 flex-row items-center justify-between">
      <Text className="font-nunito-bold text-lg text-neutral-800 dark:text-neutral-100">
        {title}
      </Text>
      {children}
    </View>
  );
}

function AnalyticsHeader() {
  return (
    <View className="flex-row items-center p-4">
      <AnalyticsIcon color="#FF7B1A" />
      <Text className="ml-2 font-nunito-bold text-2xl text-neutral-800 dark:text-neutral-100">
        Analytics
      </Text>
    </View>
  );
}

function EmptyState() {
  return (
    <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-charcoal-950">
      <AnalyticsHeader />
      <View className="flex-1 items-center justify-center px-8">
        <Text className="text-6xl">📊</Text>
        <Text className="mt-4 text-center font-nunito-bold text-xl text-neutral-800 dark:text-neutral-100">
          No data yet
        </Text>
        <Text className="mt-2 text-center font-poppins text-sm text-neutral-500 dark:text-neutral-400">
          Create some habits and start tracking to see your analytics here!
        </Text>
      </View>
    </SafeAreaView>
  );
}

function SummarySection({ summary }: { summary: AnalyticsSummary }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(300)}
      className="mx-4 flex-row gap-3"
    >
      <StatCard
        label="Completion"
        value={`${summary.overallCompletionRate}%`}
        icon="📈"
      />
      <StatCard
        label="Day Streak"
        value={summary.currentDailyStreak}
        icon="🔥"
      />
      <StatCard
        label="Total Done"
        value={summary.totalCompletionsAllTime}
        icon="✅"
      />
    </Animated.View>
  );
}

function HabitInsightsSection({ insights }: { insights: HabitInsight[] }) {
  return (
    <Animated.View
      entering={FadeInDown.duration(300).delay(300)}
      className="mx-4 mb-8 mt-4"
    >
      <SectionHeader title="Habit Insights" />
      {insights.map((insight) => (
        <HabitInsightCard key={insight.habitId} insight={insight} />
      ))}
    </Animated.View>
  );
}

export default function AnalyticsScreen(): React.ReactElement {
  const [period, setPeriod] = React.useState<TimePeriod>('daily');
  const [chartType, setChartType] = React.useState<'bar' | 'line'>('bar');
  const { trends, heatmap, habitInsights, summary, hasData } =
    useAnalytics(period);

  if (!hasData) return <EmptyState />;

  return (
    <SafeAreaView className="flex-1 bg-neutral-100 dark:bg-charcoal-950">
      <ScrollView showsVerticalScrollIndicator={false}>
        <AnalyticsHeader />
        <SummarySection summary={summary} />
        <Animated.View
          entering={FadeInDown.duration(300).delay(100)}
          className="mx-4 mt-4 rounded-2xl bg-white p-4 dark:bg-charcoal-850"
        >
          <SectionHeader title="Completion Trends">
            <ChartTypeSelector selected={chartType} onChange={setChartType} />
          </SectionHeader>
          <View className="mb-3">
            <PeriodSelector selected={period} onChange={setPeriod} />
          </View>
          <CompletionTrendsChart data={trends} chartType={chartType} />
        </Animated.View>
        <Animated.View
          entering={FadeInDown.duration(300).delay(200)}
          className="mx-4 mt-4 rounded-2xl bg-white p-4 dark:bg-charcoal-850"
        >
          <SectionHeader title="Consistency (Last 3 Months)" />
          <ConsistencyHeatmap data={heatmap} />
        </Animated.View>
        <HabitInsightsSection insights={habitInsights} />
      </ScrollView>
    </SafeAreaView>
  );
}
