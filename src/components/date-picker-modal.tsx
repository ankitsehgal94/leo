import dayjs from 'dayjs';
import * as React from 'react';
import { Modal, Pressable, StyleSheet } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  SlideInDown,
  SlideOutDown,
} from 'react-native-reanimated';
import DateTimePicker from 'react-native-ui-datepicker';

import { Text, View } from './ui';

type Props = {
  visible: boolean;
  date: string;
  onDateChange: (date: string) => void;
  onClose: () => void;
};

export function DatePickerModal({
  visible,
  date,
  onDateChange,
  onClose,
}: Props): React.ReactElement {
  const [selectedDate, setSelectedDate] = React.useState(dayjs(date));

  React.useEffect(() => {
    if (visible) {
      setSelectedDate(dayjs(date));
    }
  }, [visible, date]);

  if (!visible) return <></>;

  return (
    <Modal transparent visible={visible} animationType="none">
      <Animated.View
        entering={FadeIn.duration(200)}
        exiting={FadeOut.duration(200)}
        className="flex-1 justify-end bg-black/50"
      >
        <Pressable className="flex-1" onPress={onClose} />

        <Animated.View
          entering={SlideInDown.springify().damping(20)}
          exiting={SlideOutDown.duration(200)}
          className="rounded-t-3xl bg-white px-4 pb-8 pt-4 dark:bg-charcoal-900"
        >
          <ModalHeader
            onCancel={onClose}
            onDone={() => {
              onDateChange(selectedDate.format('YYYY-MM-DD'));
              onClose();
            }}
          />

          <CalendarPicker
            selectedDate={selectedDate}
            onSelect={(newDate) => {
              setSelectedDate(newDate);
              onDateChange(newDate.format('YYYY-MM-DD'));
              onClose();
            }}
          />
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

type HeaderProps = {
  onCancel: () => void;
  onDone: () => void;
};

function ModalHeader({ onCancel, onDone }: HeaderProps): React.ReactElement {
  return (
    <>
      <View className="mb-4 items-center">
        <View className="h-1 w-10 rounded-full bg-neutral-300 dark:bg-charcoal-600" />
      </View>

      <View className="mb-4 flex-row items-center justify-between">
        <Pressable onPress={onCancel} className="px-2 py-1">
          <Text className="font-poppins-medium text-base text-neutral-500">
            Cancel
          </Text>
        </Pressable>
        <Text className="font-nunito-bold text-lg text-neutral-800 dark:text-neutral-100">
          Select Date
        </Text>
        <Pressable onPress={onDone} className="px-2 py-1">
          <Text className="font-poppins-semibold text-base text-primary-500">
            Done
          </Text>
        </Pressable>
      </View>
    </>
  );
}

type CalendarProps = {
  selectedDate: dayjs.Dayjs;
  onSelect: (date: dayjs.Dayjs) => void;
};

function CalendarPicker({
  selectedDate,
  onSelect,
}: CalendarProps): React.ReactElement {
  return (
    <DateTimePicker
      mode="single"
      date={selectedDate.toDate()}
      onChange={(params) => {
        if (params.date) {
          onSelect(dayjs(params.date));
        }
      }}
      styles={{
        day: styles.day,
        day_label: styles.dayLabel,
        weekday_label: styles.weekdayLabel,
        selected: styles.selected,
        selected_label: styles.selectedLabel,
        today: styles.today,
        today_label: styles.todayLabel,
        month_selector_label: styles.monthLabel,
        year_selector_label: styles.yearLabel,
      }}
    />
  );
}

const styles = StyleSheet.create({
  day: {
    borderRadius: 20,
  },
  dayLabel: {
    fontFamily: 'Poppins_400Regular',
    color: '#404040',
  },
  weekdayLabel: {
    fontFamily: 'Poppins_500Medium',
    color: '#737373',
  },
  selected: {
    backgroundColor: '#F97316',
    borderRadius: 20,
  },
  selectedLabel: {
    fontFamily: 'Poppins_600SemiBold',
    color: '#FFFFFF',
  },
  today: {
    borderColor: '#F97316',
    borderWidth: 1,
    borderRadius: 20,
  },
  todayLabel: {
    color: '#F97316',
  },
  monthLabel: {
    fontFamily: 'Nunito_700Bold',
    color: '#262626',
  },
  yearLabel: {
    fontFamily: 'Nunito_700Bold',
    color: '#262626',
  },
});
