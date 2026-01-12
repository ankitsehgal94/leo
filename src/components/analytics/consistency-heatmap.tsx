import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { ScrollView } from 'react-native';

import type { HeatmapDay } from '@/types';

import { Text, View } from '../ui';
import colors from '../ui/colors';

type Props = { data: HeatmapDay[] };

const CELL_SIZE = 12;
const CELL_GAP = 3;
const WEEKS = 13;
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function getHeatmapColor(level: 0 | 1 | 2 | 3 | 4, isDark: boolean): string {
  const map = {
    0: isDark ? colors.charcoal[700] : colors.neutral[200],
    1: isDark ? colors.success[900] : colors.success[100],
    2: isDark ? colors.success[700] : colors.success[200],
    3: isDark ? colors.success[500] : colors.success[300],
    4: isDark ? colors.success[400] : colors.success[500],
  };
  return map[level];
}

function buildGrid(data: HeatmapDay[]): HeatmapDay[][] {
  const paddedData = [...data];
  const firstDate = new Date(paddedData[0]?.date + 'T12:00:00');
  const emptyDays = firstDate.getDay();

  for (let i = 0; i < emptyDays; i++) {
    paddedData.unshift({ date: '', completionLevel: 0, completionRate: 0 });
  }

  const grid: HeatmapDay[][] = [];
  for (let week = 0; week < WEEKS; week++) {
    const weekData: HeatmapDay[] = [];
    for (let day = 0; day < 7; day++) {
      const index = week * 7 + day;
      if (index < paddedData.length) weekData.push(paddedData[index]);
    }
    if (weekData.length > 0) grid.push(weekData);
  }
  return grid;
}

function HeatmapLegend({ isDark }: { isDark: boolean }): React.ReactElement {
  const levels: (0 | 1 | 2 | 3 | 4)[] = [0, 1, 2, 3, 4];
  return (
    <View className="mt-3 flex-row items-center justify-end">
      <Text className="mr-2 text-xs text-neutral-500 dark:text-neutral-400">
        Less
      </Text>
      {levels.map((level) => (
        <View
          key={level}
          style={{
            width: CELL_SIZE,
            height: CELL_SIZE,
            backgroundColor: getHeatmapColor(level, isDark),
            borderRadius: 2,
            marginLeft: 2,
          }}
        />
      ))}
      <Text className="ml-2 text-xs text-neutral-500 dark:text-neutral-400">
        More
      </Text>
    </View>
  );
}

function DayLabels(): React.ReactElement {
  return (
    <View className="mr-1 justify-between py-0.5">
      {DAY_LABELS.map((label, index) => (
        <View
          key={index}
          style={{ height: CELL_SIZE, justifyContent: 'center' }}
        >
          <Text className="text-xs text-neutral-400 dark:text-neutral-500">
            {index % 2 === 1 ? label : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function ConsistencyHeatmap({ data }: Props): React.ReactElement {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (data.length === 0) {
    return (
      <View className="h-32 items-center justify-center">
        <Text className="text-neutral-500 dark:text-neutral-400">
          No data available
        </Text>
      </View>
    );
  }

  const grid = buildGrid(data);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View className="flex-row">
          <DayLabels />
          <View className="flex-row">
            {grid.map((week, wi) => (
              <View key={wi} style={{ marginRight: CELL_GAP }}>
                {week.map((day, di) => (
                  <View
                    key={di}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      backgroundColor: day.date
                        ? getHeatmapColor(day.completionLevel, isDark)
                        : 'transparent',
                      borderRadius: 2,
                      marginBottom: CELL_GAP,
                    }}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      <HeatmapLegend isDark={isDark} />
    </View>
  );
}
