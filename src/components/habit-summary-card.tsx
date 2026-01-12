import * as React from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { Text } from '@/components/ui';
import type { Frequency, TrackingConfig } from '@/types';
import { TRACKING_UNITS } from '@/types';

type Props = {
  tracking: TrackingConfig;
  frequency: Frequency;
  selectedDaysCount: number;
  reminderEnabled: boolean;
  reminderTime: string;
};

export function HabitSummaryCard({
  tracking,
  frequency,
  selectedDaysCount,
  reminderEnabled,
  reminderTime,
}: Props): React.ReactElement {
  const trackingText = getTrackingText(tracking);
  const frequencyText = getFrequencyText(frequency, selectedDaysCount);
  const reminderText = getReminderText(reminderEnabled, reminderTime);

  return (
    <Animated.View
      entering={FadeInUp.delay(300).springify()}
      className="mx-4 mb-4 rounded-3xl bg-primary-500 p-5"
    >
      {/* Label */}
      <Text className="mb-2 font-poppins-medium text-xs uppercase tracking-wider text-white/70">
        SUMMARY
      </Text>

      {/* Main summary line */}
      <Text className="font-nunito-bold text-xl text-white">
        {trackingText}
        <Text className="font-poppins text-lg text-white/80">
          {' · '}
          {frequencyText}
        </Text>
      </Text>

      {/* Reminder info */}
      {reminderText && (
        <Text className="mt-1 font-poppins text-sm text-white/70">
          {reminderText}
        </Text>
      )}
    </Animated.View>
  );
}

function getTrackingText(tracking: TrackingConfig): string {
  if (tracking.type === 'simple') {
    return 'Mark as done';
  }

  const units = TRACKING_UNITS[tracking.type];
  const unitLabel = units.find((u) => u.value === tracking.unit)?.label || '';

  return `${tracking.goal} ${unitLabel}`;
}

function getFrequencyText(
  frequency: Frequency,
  selectedDaysCount: number
): string {
  if (frequency === 'daily') {
    return 'every day';
  }

  if (selectedDaysCount === 7) {
    return '7 days per week';
  }

  return `${selectedDaysCount} ${selectedDaysCount === 1 ? 'day' : 'days'} per week`;
}

function getReminderText(enabled: boolean, time: string): string | null {
  if (!enabled) return null;

  const [h, m] = time.split(':').map(Number);
  const displayHours = h % 12 || 12;
  const formattedTime = `${displayHours.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

  return `Reminder at ${formattedTime}`;
}
