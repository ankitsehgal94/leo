import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Platform, Pressable, Switch } from 'react-native';
import Animated, { FadeInDown, FadeOut } from 'react-native-reanimated';

import type { TimeOfDay } from '@/types';

import { Text, View } from './ui';
import colors from './ui/colors';
import { Bell, ChevronDown, Clock } from './ui/icons';
import { renderBackdrop } from './ui/modal';

type ReminderMode = 'once' | 'throughout';
type TimeFormatted = { hours: string; minutes: string; period: string };

type Props = {
  enabled: boolean;
  time: string;
  timeOfDay: TimeOfDay;
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
  onTimeOfDayChange: (timeOfDay: TimeOfDay) => void;
};

const INTERVAL_OPTIONS = [
  { value: 1, label: '1 hour' },
  { value: 2, label: '2 hours' },
  { value: 3, label: '3 hours' },
  { value: 4, label: '4 hours' },
];

const TIME_OF_DAY_OPTIONS: {
  value: TimeOfDay;
  label: string;
  icon: string;
}[] = [
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'afternoon', label: 'Afternoon', icon: '☀️' },
  { value: 'evening', label: 'Evening', icon: '🌙' },
  { value: 'anytime', label: 'Anytime', icon: '∞' },
];

function useReminderState(time: string, onTimeChange: (time: string) => void) {
  const [mode, setMode] = React.useState<ReminderMode>('once');
  const [fromTime, setFromTime] = React.useState('08:00');
  const [toTime, setToTime] = React.useState('20:00');
  const [interval, setInterval] = React.useState(2);
  const [activeTimePicker, setActiveTimePicker] = React.useState<
    'once' | 'from' | 'to' | null
  >(null);
  const [showIntervalPicker, setShowIntervalPicker] = React.useState(false);
  const bottomSheetRef = React.useRef<BottomSheetModal>(null);

  const openTimePicker = (type: 'once' | 'from' | 'to'): void => {
    setActiveTimePicker(type);
    bottomSheetRef.current?.present();
  };

  const closeTimePicker = (): void => {
    bottomSheetRef.current?.dismiss();
    setActiveTimePicker(null);
  };

  const handleTimeChange = (_event: unknown, selectedDate?: Date): void => {
    if (selectedDate) {
      const newHours = selectedDate.getHours().toString().padStart(2, '0');
      const newMinutes = selectedDate.getMinutes().toString().padStart(2, '0');
      const newTime = `${newHours}:${newMinutes}`;
      if (activeTimePicker === 'once') onTimeChange(newTime);
      else if (activeTimePicker === 'from') setFromTime(newTime);
      else if (activeTimePicker === 'to') setToTime(newTime);
    }
  };

  const getActiveTime = (): string => {
    if (activeTimePicker === 'from') return fromTime;
    if (activeTimePicker === 'to') return toTime;
    return time;
  };

  return {
    mode,
    setMode,
    fromTime,
    toTime,
    interval,
    setInterval,
    activeTimePicker,
    showIntervalPicker,
    setShowIntervalPicker,
    bottomSheetRef,
    openTimePicker,
    closeTimePicker,
    handleTimeChange,
    getActiveTime,
  };
}

export function ReminderPicker({
  enabled,
  time,
  timeOfDay,
  onEnabledChange,
  onTimeChange,
  onTimeOfDayChange,
}: Props): React.ReactElement {
  const state = useReminderState(time, onTimeChange);

  return (
    <View className="rounded-3xl bg-white p-5">
      <ReminderHeader enabled={enabled} onEnabledChange={onEnabledChange} />

      {/* When reminder is OFF, show time-of-day picker */}
      {!enabled && (
        <TimeOfDayPicker
          selectedTimeOfDay={timeOfDay}
          onTimeOfDayChange={onTimeOfDayChange}
        />
      )}

      {/* When reminder is ON, show time picker */}
      {enabled && (
        <ReminderContent
          mode={state.mode}
          setMode={state.setMode}
          time={time}
          fromTime={state.fromTime}
          toTime={state.toTime}
          interval={state.interval}
          setShowIntervalPicker={state.setShowIntervalPicker}
          openTimePicker={state.openTimePicker}
        />
      )}

      <TimePickerSheet
        bottomSheetRef={state.bottomSheetRef}
        activeTimePicker={state.activeTimePicker}
        getActiveTime={state.getActiveTime}
        handleTimeChange={state.handleTimeChange}
        closeTimePicker={state.closeTimePicker}
      />
      <IntervalPickerModal
        visible={state.showIntervalPicker}
        selectedInterval={state.interval}
        onSelect={(val) => {
          state.setInterval(val);
          state.setShowIntervalPicker(false);
        }}
        onClose={() => state.setShowIntervalPicker(false)}
      />
    </View>
  );
}

type ReminderHeaderProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
};

function ReminderHeader({
  enabled,
  onEnabledChange,
}: ReminderHeaderProps): React.ReactElement {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View className="mr-3 size-10 items-center justify-center rounded-xl bg-primary-50">
          <Bell color="#FF7B1A" size={20} />
        </View>
        <Text className="font-poppins-semibold text-base text-neutral-800">
          Reminder
        </Text>
      </View>
      <Switch
        value={enabled}
        onValueChange={onEnabledChange}
        trackColor={{ false: '#E5E5E5', true: '#FF7B1A' }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E5E5E5"
      />
    </View>
  );
}

type TimeOfDayPickerProps = {
  selectedTimeOfDay: TimeOfDay;
  onTimeOfDayChange: (timeOfDay: TimeOfDay) => void;
};

function TimeOfDayPicker({
  selectedTimeOfDay,
  onTimeOfDayChange,
}: TimeOfDayPickerProps): React.ReactElement {
  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      exiting={FadeOut.duration(150)}
    >
      <View className="my-4 h-px bg-neutral-100" />
      <Text className="mb-3 font-poppins text-base text-neutral-500">
        When do you usually do this?
      </Text>
      <View className="flex-row gap-2">
        {TIME_OF_DAY_OPTIONS.map((option) => (
          <TimeOfDayOption
            key={option.value}
            value={option.value}
            label={option.label}
            icon={option.icon}
            isSelected={selectedTimeOfDay === option.value}
            onSelect={() => onTimeOfDayChange(option.value)}
          />
        ))}
      </View>
    </Animated.View>
  );
}

type TimeOfDayOptionProps = {
  value: TimeOfDay;
  label: string;
  icon: string;
  isSelected: boolean;
  onSelect: () => void;
};

function TimeOfDayOption({
  label,
  icon,
  isSelected,
  onSelect,
}: TimeOfDayOptionProps): React.ReactElement {
  return (
    <Pressable
      onPress={onSelect}
      className={`flex-1 items-center rounded-2xl py-3 ${
        isSelected ? 'bg-primary-500' : 'bg-neutral-50'
      }`}
    >
      <Text className={`mb-1 text-xl ${isSelected ? '' : 'opacity-80'}`}>
        {icon}
      </Text>
      <Text
        className={`font-poppins-medium text-xs ${
          isSelected ? 'text-white' : 'text-neutral-600'
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

type ReminderContentProps = {
  mode: ReminderMode;
  setMode: (mode: ReminderMode) => void;
  time: string;
  fromTime: string;
  toTime: string;
  interval: number;
  setShowIntervalPicker: (show: boolean) => void;
  openTimePicker: (type: 'once' | 'from' | 'to') => void;
};

function ReminderContent({
  mode,
  setMode,
  time,
  fromTime,
  toTime,
  interval,
  setShowIntervalPicker,
  openTimePicker,
}: ReminderContentProps): React.ReactElement {
  const timeFormatted = useTimeFormatting(time);
  const fromFormatted = useTimeFormatting(fromTime);
  const toFormatted = useTimeFormatting(toTime);

  const reminderCount = React.useMemo(() => {
    if (mode !== 'throughout') return 1;
    const [fromH] = fromTime.split(':').map(Number);
    const [toH] = toTime.split(':').map(Number);
    return Math.max(1, Math.floor((toH - fromH) / interval) + 1);
  }, [mode, fromTime, toTime, interval]);

  return (
    <Animated.View
      entering={FadeInDown.springify().damping(15)}
      exiting={FadeOut.duration(150)}
    >
      <View className="my-4 h-px bg-neutral-100" />
      <ModeToggle mode={mode} setMode={setMode} />
      {mode === 'once' ? (
        <OnceMode
          timeFormatted={timeFormatted}
          openTimePicker={openTimePicker}
        />
      ) : (
        <ThroughoutMode
          fromFormatted={fromFormatted}
          toFormatted={toFormatted}
          interval={interval}
          reminderCount={reminderCount}
          openTimePicker={openTimePicker}
          setShowIntervalPicker={setShowIntervalPicker}
        />
      )}
    </Animated.View>
  );
}

type ModeToggleProps = {
  mode: ReminderMode;
  setMode: (mode: ReminderMode) => void;
};

function ModeToggle({ mode, setMode }: ModeToggleProps): React.ReactElement {
  return (
    <View className="mb-4 flex-row gap-3">
      <ModeOption
        label="Once"
        isSelected={mode === 'once'}
        onSelect={() => setMode('once')}
      />
      <ModeOption
        label="Throughout the day"
        isSelected={mode === 'throughout'}
        onSelect={() => setMode('throughout')}
      />
    </View>
  );
}

type ModeOptionProps = {
  label: string;
  isSelected: boolean;
  onSelect: () => void;
};

function ModeOption({
  label,
  isSelected,
  onSelect,
}: ModeOptionProps): React.ReactElement {
  const bgClass = isSelected
    ? 'border-primary-500 bg-primary-500'
    : 'border-neutral-200 bg-transparent';
  const textClass = isSelected ? 'text-white' : 'text-neutral-500';

  return (
    <Pressable
      onPress={onSelect}
      className={`flex-1 items-center justify-center rounded-2xl border-2 py-3 ${bgClass}`}
    >
      <Text className={`font-poppins-medium text-sm ${textClass}`}>
        {label}
      </Text>
    </Pressable>
  );
}

type OnceModeProps = {
  timeFormatted: TimeFormatted;
  openTimePicker: (type: 'once' | 'from' | 'to') => void;
};

function OnceMode({
  timeFormatted,
  openTimePicker,
}: OnceModeProps): React.ReactElement {
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOut.duration(100)}
      className="flex-row items-center justify-between"
    >
      <Text className="font-poppins text-base text-neutral-500">Time</Text>
      <TimeButton {...timeFormatted} onPress={() => openTimePicker('once')} />
    </Animated.View>
  );
}

type ThroughoutModeProps = {
  fromFormatted: TimeFormatted;
  toFormatted: TimeFormatted;
  interval: number;
  reminderCount: number;
  openTimePicker: (type: 'once' | 'from' | 'to') => void;
  setShowIntervalPicker: (show: boolean) => void;
};

function ThroughoutMode({
  fromFormatted,
  toFormatted,
  interval,
  reminderCount,
  openTimePicker,
  setShowIntervalPicker,
}: ThroughoutModeProps): React.ReactElement {
  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOut.duration(100)}
    >
      <View className="mb-4 flex-row gap-4">
        <TimeColumn
          label="From"
          formatted={fromFormatted}
          onPress={() => openTimePicker('from')}
        />
        <TimeColumn
          label="To"
          formatted={toFormatted}
          onPress={() => openTimePicker('to')}
        />
      </View>
      <IntervalRow
        interval={interval}
        onPress={() => setShowIntervalPicker(true)}
      />
      <ReminderCountBadge count={reminderCount} />
    </Animated.View>
  );
}

type TimeColumnProps = {
  label: string;
  formatted: TimeFormatted;
  onPress: () => void;
};

function TimeColumn({
  label,
  formatted,
  onPress,
}: TimeColumnProps): React.ReactElement {
  return (
    <View className="flex-1">
      <Text className="mb-2 font-poppins text-sm text-neutral-400">
        {label}
      </Text>
      <TimeButton {...formatted} onPress={onPress} fullWidth />
    </View>
  );
}

type IntervalRowProps = {
  interval: number;
  onPress: () => void;
};

function IntervalRow({
  interval,
  onPress,
}: IntervalRowProps): React.ReactElement {
  const label = interval === 1 ? 'hour' : 'hours';
  return (
    <View className="mb-4 flex-row items-center justify-between">
      <Text className="font-poppins text-base text-neutral-500">Every</Text>
      <Pressable
        onPress={onPress}
        className="flex-row items-center rounded-xl bg-neutral-50 px-4 py-2"
      >
        <Text className="mr-2 font-poppins-medium text-base text-neutral-700">
          {interval} {label}
        </Text>
        <ChevronDown color="#A3A3A3" size={18} />
      </Pressable>
    </View>
  );
}

function ReminderCountBadge({ count }: { count: number }): React.ReactElement {
  return (
    <View className="rounded-2xl bg-primary-50 p-4">
      <Text className="text-center font-poppins text-sm text-primary-600">
        {"You'll get "}
        <Text className="font-poppins-bold text-primary-600">
          {count} reminders
        </Text>
        {' per day'}
      </Text>
    </View>
  );
}

type TimeButtonProps = {
  hours: string;
  minutes: string;
  period: string;
  onPress: () => void;
  fullWidth?: boolean;
};

function TimeButton({
  hours,
  minutes,
  period,
  onPress,
  fullWidth,
}: TimeButtonProps): React.ReactElement {
  const containerClass = fullWidth
    ? 'flex-row items-center rounded-xl bg-neutral-50 px-4 py-2 justify-center'
    : 'flex-row items-center rounded-xl bg-neutral-50 px-4 py-2';

  return (
    <Pressable onPress={onPress} className={containerClass}>
      <Text className="font-nunito-bold text-lg text-neutral-800">
        {hours}:{minutes}
      </Text>
      <Text className="ml-1 font-poppins text-sm text-neutral-500">
        {period}
      </Text>
      <View className="ml-2">
        <Clock color="#A3A3A3" size={18} />
      </View>
    </Pressable>
  );
}

type TimePickerSheetProps = {
  bottomSheetRef: React.RefObject<BottomSheetModal | null>;
  activeTimePicker: 'once' | 'from' | 'to' | null;
  getActiveTime: () => string;
  handleTimeChange: (_event: unknown, selectedDate?: Date) => void;
  closeTimePicker: () => void;
};

function TimePickerSheet({
  bottomSheetRef,
  activeTimePicker,
  getActiveTime,
  handleTimeChange,
  closeTimePicker,
}: TimePickerSheetProps): React.ReactElement {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const timeAsDate = React.useMemo(() => {
    const [h, m] = getActiveTime().split(':').map(Number);
    const date = new Date();
    date.setHours(h, m, 0, 0);
    return date;
  }, [getActiveTime]);

  const title =
    activeTimePicker === 'from'
      ? 'Set Start Time'
      : activeTimePicker === 'to'
        ? 'Set End Time'
        : 'Set Reminder Time';

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={{
        backgroundColor: isDark ? colors.charcoal[600] : '#D1D5DB',
        width: 40,
      }}
      backgroundStyle={{
        backgroundColor: isDark ? colors.charcoal[900] : '#FFFFFF',
      }}
    >
      <BottomSheetView className="px-5 pb-10">
        <View className="mb-4 flex-row items-center justify-between border-b border-neutral-100 pb-4">
          <Text className="font-nunito-bold text-xl text-neutral-800">
            {title}
          </Text>
          <Pressable
            onPress={closeTimePicker}
            className="rounded-full bg-primary-500 px-4 py-2"
          >
            <Text className="font-poppins-semibold text-sm text-white">
              Done
            </Text>
          </Pressable>
        </View>
        <View className="items-center">
          <DateTimePicker
            value={timeAsDate}
            mode="time"
            is24Hour={false}
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleTimeChange}
            style={{ width: '100%', height: 200 }}
          />
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
}

type IntervalPickerModalProps = {
  visible: boolean;
  selectedInterval: number;
  onSelect: (interval: number) => void;
  onClose: () => void;
};

function IntervalPickerModal({
  visible,
  selectedInterval,
  onSelect,
  onClose,
}: IntervalPickerModalProps): React.ReactElement | null {
  if (!visible) return null;

  return (
    <Pressable
      onPress={onClose}
      className="absolute inset-0 items-center justify-center bg-black/40"
    >
      <Pressable
        onPress={(e) => e.stopPropagation()}
        className="mx-8 w-full max-w-xs rounded-3xl bg-white p-2"
      >
        <Text className="px-4 py-3 font-poppins-semibold text-base text-neutral-800">
          Reminder Interval
        </Text>
        {INTERVAL_OPTIONS.map((opt) => {
          const isSelected = selectedInterval === opt.value;
          const bgClass = isSelected ? 'bg-primary-50' : '';
          const textClass = isSelected
            ? 'text-primary-600'
            : 'text-neutral-700';
          return (
            <Pressable
              key={opt.value}
              onPress={() => onSelect(opt.value)}
              className={`rounded-2xl px-4 py-3 ${bgClass}`}
            >
              <Text className={`font-poppins text-base ${textClass}`}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </Pressable>
    </Pressable>
  );
}

function useTimeFormatting(time: string): TimeFormatted {
  return React.useMemo(() => {
    const [h, m] = time.split(':').map(Number);
    const isPM = h >= 12;
    const displayHours = h % 12 || 12;
    return {
      hours: displayHours.toString().padStart(2, '0'),
      minutes: m.toString().padStart(2, '0'),
      period: isPM ? 'PM' : 'AM',
    };
  }, [time]);
}
