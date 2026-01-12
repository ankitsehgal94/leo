import * as React from 'react';
import { Modal, Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text, View } from '@/components/ui';
import { ChevronDown, Flag, Target } from '@/components/ui/icons';
import { cn } from '@/lib';
import type { TrackingType, TrackingUnit } from '@/types';
import { TRACKING_UNITS } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  type: TrackingType;
  goal: number;
  unit?: TrackingUnit;
  onGoalChange: (goal: number) => void;
  onUnitChange: (unit: TrackingUnit) => void;
};

function useGoalStepper(
  goal: number,
  onGoalChange: (goal: number) => void
): {
  direction: 'up' | 'down';
  handleIncrement: () => void;
  handleDecrement: () => void;
} {
  const [direction, setDirection] = React.useState<'up' | 'down'>('up');
  const prevGoal = React.useRef(goal);

  React.useEffect(() => {
    if (goal > prevGoal.current) setDirection('up');
    else if (goal < prevGoal.current) setDirection('down');
    prevGoal.current = goal;
  }, [goal]);

  const handleIncrement = (): void => {
    setDirection('up');
    onGoalChange(goal + 1);
  };

  const handleDecrement = (): void => {
    if (goal > 1) {
      setDirection('down');
      onGoalChange(goal - 1);
    }
  };

  return { direction, handleIncrement, handleDecrement };
}

function GoalStepperHeader(): React.ReactElement {
  return (
    <View className="mb-5 flex-row items-center">
      <View className="mr-3 size-12 items-center justify-center rounded-full bg-primary-50">
        <Flag color="#FF7B1A" size={22} />
      </View>
      <Text className="font-nunito-bold text-lg text-neutral-800">
        Daily Goal
      </Text>
    </View>
  );
}

export function GoalStepper({
  type,
  goal,
  unit,
  onGoalChange,
  onUnitChange,
}: Props): React.ReactElement {
  const units = TRACKING_UNITS[type];
  const [showUnitPicker, setShowUnitPicker] = React.useState(false);
  const { direction, handleIncrement, handleDecrement } = useGoalStepper(
    goal,
    onGoalChange
  );
  const selectedUnit = units.find((u) => u.value === unit);

  return (
    <View className="relative mt-4 overflow-hidden rounded-3xl bg-white p-5">
      <View className="absolute -right-6 -top-2 opacity-10">
        <Target color="#D4D4D4" size={120} />
      </View>
      <GoalStepperHeader />
      <View className="flex-row items-center gap-3">
        <View className="flex-1 flex-row items-center justify-center rounded-2xl bg-neutral-50 py-2">
          <StepperButton
            icon="−"
            onPress={handleDecrement}
            disabled={goal <= 1}
          />
          <TickerNumber value={goal} direction={direction} />
          <StepperButton icon="+" onPress={handleIncrement} />
        </View>
        <Pressable
          onPress={() => setShowUnitPicker(true)}
          className="flex-1 flex-row items-center justify-center rounded-2xl bg-neutral-50 p-4"
        >
          <Text className="mr-2 font-poppins text-base text-neutral-500">
            {selectedUnit?.label ?? 'Select'}
          </Text>
          <ChevronDown color="#A3A3A3" size={18} />
        </Pressable>
      </View>
      <UnitPickerModal
        visible={showUnitPicker}
        units={units}
        selectedUnit={unit}
        onSelect={(u) => {
          onUnitChange(u);
          setShowUnitPicker(false);
        }}
        onClose={() => setShowUnitPicker(false)}
      />
    </View>
  );
}

type StepperButtonProps = {
  icon: string;
  onPress: () => void;
  disabled?: boolean;
};

function StepperButton({
  icon,
  onPress,
  disabled,
}: StepperButtonProps): React.ReactElement {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = (): void => {
    if (disabled) return;
    scale.value = withSequence(
      withTiming(0.85, { duration: 50 }),
      withSpring(1, { damping: 10, stiffness: 400 })
    );
    onPress();
  };

  return (
    <AnimatedPressable
      onPress={handlePress}
      disabled={disabled}
      style={animatedStyle}
      className="size-12 items-center justify-center"
    >
      <Text
        className={cn(
          'text-2xl',
          disabled ? 'text-neutral-300' : 'text-neutral-400'
        )}
      >
        {icon}
      </Text>
    </AnimatedPressable>
  );
}

type TickerNumberProps = {
  value: number;
  direction: 'up' | 'down';
};

function TickerNumber({
  value,
  direction,
}: TickerNumberProps): React.ReactElement {
  const key = `${value}-${Date.now()}`;

  const enteringAnimation =
    direction === 'up'
      ? FadeInDown.duration(200).withInitialValues({
          transform: [{ translateY: -8 }],
        })
      : FadeInDown.duration(200).withInitialValues({
          transform: [{ translateY: 8 }],
        });

  const exitingAnimation = FadeOut.duration(100);

  return (
    <View className="w-16 items-center justify-center">
      <Animated.Text
        key={key}
        entering={enteringAnimation}
        exiting={exitingAnimation}
        className="font-nunito-bold text-3xl text-neutral-800"
      >
        {value}
      </Animated.Text>
    </View>
  );
}

type UnitPickerModalProps = {
  visible: boolean;
  units: { value: TrackingUnit; label: string }[];
  selectedUnit?: TrackingUnit;
  onSelect: (unit: TrackingUnit) => void;
  onClose: () => void;
};

function UnitPickerModal({
  visible,
  units,
  selectedUnit,
  onSelect,
  onClose,
}: UnitPickerModalProps): React.ReactElement {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/40"
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="mx-8 w-full max-w-xs rounded-3xl bg-white p-2"
        >
          <Text className="px-4 py-3 font-poppins-semibold text-base text-neutral-800">
            Select Unit
          </Text>
          {units.map((u) => (
            <Pressable
              key={u.value}
              onPress={() => onSelect(u.value)}
              className={cn(
                'rounded-2xl px-4 py-3',
                selectedUnit === u.value && 'bg-primary-50'
              )}
            >
              <Text
                className={cn(
                  'font-poppins text-base',
                  selectedUnit === u.value
                    ? 'text-primary-600'
                    : 'text-neutral-700'
                )}
              >
                {u.label}
              </Text>
            </Pressable>
          ))}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
