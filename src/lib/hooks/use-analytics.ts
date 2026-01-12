import * as React from 'react';

import type { TimePeriod } from '@/types';

import {
  calculateAnalyticsSummary,
  calculateCompletionTrends,
  calculateHabitInsights,
  generateHeatmapData,
} from '../analytics';
import { useHabitStore } from '../stores';

export function useAnalytics(period: TimePeriod = 'daily') {
  const habits = useHabitStore.use.habits();
  const completions = useHabitStore.use.completions();

  const trends = React.useMemo(
    () => calculateCompletionTrends(habits, completions, period),
    [habits, completions, period]
  );

  const heatmap = React.useMemo(
    () => generateHeatmapData(habits, completions, 91),
    [habits, completions]
  );

  const habitInsights = React.useMemo(
    () => calculateHabitInsights(habits, completions),
    [habits, completions]
  );

  const summary = React.useMemo(
    () => calculateAnalyticsSummary(habits, completions),
    [habits, completions]
  );

  return {
    trends,
    heatmap,
    habitInsights,
    summary,
    hasData: habits.length > 0,
  };
}
