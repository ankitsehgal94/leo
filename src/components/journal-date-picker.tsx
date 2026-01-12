import * as React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';

import { Text, View } from './ui';

type Props = {
  date: string;
  time: string;
};

export function JournalDatePicker({ date, time }: Props): React.ReactElement {
  const formattedDate = formatDate(date);

  return (
    <View className="mb-2 mt-4 flex-row items-end justify-between">
      <View>
        <Text className="font-poppins-semibold text-xs tracking-wider text-neutral-400 dark:text-neutral-500">
          DATE
        </Text>
        <View className="mt-2 flex-row items-center rounded-xl px-4 py-3">
          <CalendarIcon />
          <Text className="ml-3 font-nunito-bold text-lg text-neutral-800 dark:text-neutral-100">
            {formattedDate}
          </Text>
        </View>
      </View>
      <View className="items-end">
        <Text className="font-poppins-semibold text-xs tracking-wider text-neutral-400 dark:text-neutral-500">
          TIME
        </Text>
        <Text className="mt-2 font-nunito-bold text-xl text-neutral-700 dark:text-neutral-200">
          {time}
        </Text>
      </View>
    </View>
  );
}

function CalendarIcon(): React.ReactElement {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Rect
        x={3}
        y={4}
        width={18}
        height={18}
        rx={2}
        stroke="#F97316"
        strokeWidth={2}
      />
      <Path d="M3 10h18" stroke="#F97316" strokeWidth={2} />
      <Path
        d="M8 2v4M16 2v4"
        stroke="#F97316"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
