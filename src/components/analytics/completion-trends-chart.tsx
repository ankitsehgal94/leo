import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { BarChart, LineChart } from 'react-native-gifted-charts';

import type { CompletionDataPoint } from '@/types';

import { Text, View } from '../ui';
import colors from '../ui/colors';

type Props = {
  data: CompletionDataPoint[];
  chartType: 'bar' | 'line';
};

function useChartColors() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  return {
    primary: isDark ? colors.primary[400] : colors.primary[500],
    grid: isDark ? colors.charcoal[700] : colors.neutral[200],
    text: isDark ? colors.neutral[400] : colors.neutral[500],
  };
}

function getCommonProps(chartColors: ReturnType<typeof useChartColors>) {
  return {
    width: 300,
    height: 180,
    initialSpacing: 10,
    endSpacing: 10,
    noOfSections: 4,
    maxValue: 100,
    yAxisTextStyle: { color: chartColors.text, fontSize: 10 },
    xAxisLabelTextStyle: { color: chartColors.text, fontSize: 10 },
    yAxisThickness: 0,
    xAxisThickness: 1,
    xAxisColor: chartColors.grid,
    rulesColor: chartColors.grid,
    rulesType: 'dashed' as const,
    isAnimated: true,
    animationDuration: 500,
  };
}

function EmptyChart(): React.ReactElement {
  return (
    <View className="h-48 items-center justify-center">
      <Text className="text-neutral-500 dark:text-neutral-400">
        No data available
      </Text>
    </View>
  );
}

export function CompletionTrendsChart({
  data,
  chartType,
}: Props): React.ReactElement {
  const chartColors = useChartColors();

  if (data.length === 0) return <EmptyChart />;

  const commonProps = getCommonProps(chartColors);

  if (chartType === 'line') {
    const lineData = data.map((p) => ({
      value: p.completionRate,
      label: p.label,
      dataPointColor: chartColors.primary,
    }));

    return (
      <View className="mt-2">
        <LineChart
          data={lineData}
          color={chartColors.primary}
          thickness={2}
          dataPointsRadius={4}
          dataPointsColor={chartColors.primary}
          curved
          areaChart
          startFillColor={chartColors.primary}
          endFillColor="transparent"
          startOpacity={0.3}
          endOpacity={0}
          {...commonProps}
        />
      </View>
    );
  }

  const barData = data.map((p) => ({
    value: p.completionRate,
    label: p.label,
    frontColor: chartColors.primary,
  }));

  return (
    <View className="mt-2">
      <BarChart
        data={barData}
        barWidth={data.length > 7 ? 20 : 28}
        spacing={data.length > 7 ? 12 : 16}
        frontColor={chartColors.primary}
        barBorderRadius={4}
        {...commonProps}
      />
    </View>
  );
}
