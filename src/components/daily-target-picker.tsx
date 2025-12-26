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
import { BarChart, ChevronDown } from '@/components/ui/icons';
import { cn } from '@/lib';
import type { TrackingConfig, TrackingUnit } from '@/types';
import { TRACKING_UNITS } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Subtle purple/blue colors
const ICON_COLOR = '#818CF8'; // indigo-400
const ICON_BG = '#EEF2FF'; // indigo-50

type Props = {
  value: TrackingConfig;
  onChange: (config: TrackingConfig) => void;
};

function useTargetHandlers(
  value: TrackingConfig,
  onChange: (config: TrackingConfig) => void,
  setIsExpanded: (expanded: boolean) => void
) {
  const handleAddTarget = (): void => {
    setIsExpanded(true);
    onChange({ type: 'count', unit: 'glasses', goal: 10 });
  };

  const handleRemoveTarget = (): void => {
    setIsExpanded(false);
    onChange({ type: 'simple', goal: 1 });
  };

  const handleGoalChange = (newGoal: number): void => {
    if (newGoal >= 1) {
      onChange({ ...value, goal: newGoal });
    }
  };

  const handleUnitChange = (unit: TrackingUnit): void => {
    onChange({ ...value, unit });
  };

  return {
    handleAddTarget,
    handleRemoveTarget,
    handleGoalChange,
    handleUnitChange,
  };
}

export function DailyTargetPicker({
  value,
  onChange,
}: Props): React.ReactElement {
  const [isExpanded, setIsExpanded] = React.useState(value.type !== 'simple');
  const hasTarget = value.type !== 'simple';
  const handlers = useTargetHandlers(value, onChange, setIsExpanded);

  return (
    <View className="rounded-3xl bg-white p-5">
      <PickerHeader
        isExpanded={isExpanded}
        onAdd={handlers.handleAddTarget}
        onRemove={handlers.handleRemoveTarget}
      />
      {isExpanded && hasTarget && (
        <Animated.View
          entering={FadeInDown.springify().damping(15)}
          exiting={FadeOut.duration(150)}
          className="mt-4"
        >
          <TargetControls
            goal={value.goal}
            unit={value.unit}
            type={value.type}
            onGoalChange={handlers.handleGoalChange}
            onUnitChange={handlers.handleUnitChange}
          />
        </Animated.View>
      )}
    </View>
  );
}

type PickerHeaderProps = {
  isExpanded: boolean;
  onAdd: () => void;
  onRemove: () => void;
};

function PickerHeader({
  isExpanded,
  onAdd,
  onRemove,
}: PickerHeaderProps): React.ReactElement {
  return (
    <View className="flex-row items-center justify-between">
      <View className="flex-row items-center">
        <View
          className="mr-3 size-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: ICON_BG }}
        >
          <BarChart color={ICON_COLOR} size={20} />
        </View>
        <Text className="font-poppins-semibold text-base text-neutral-800">
          Daily target
        </Text>
      </View>
      {!isExpanded ? (
        <Pressable
          onPress={onAdd}
          className="rounded-full bg-primary-50 px-4 py-2"
        >
          <Text className="font-poppins-medium text-sm text-primary-500">
            + Add
          </Text>
        </Pressable>
      ) : (
        <Pressable
          onPress={onRemove}
          className="size-8 items-center justify-center rounded-lg border border-neutral-200"
        >
          <Text className="text-lg text-neutral-400">×</Text>
        </Pressable>
      )}
    </View>
  );
}

type TargetControlsProps = {
  goal: number;
  unit?: TrackingUnit;
  type: string;
  onGoalChange: (goal: number) => void;
  onUnitChange: (unit: TrackingUnit) => void;
};

function TargetControls({
  goal,
  unit,
  type,
  onGoalChange,
  onUnitChange,
}: TargetControlsProps): React.ReactElement {
  const [showUnitPicker, setShowUnitPicker] = React.useState(false);
  const units =
    TRACKING_UNITS[type as keyof typeof TRACKING_UNITS] || TRACKING_UNITS.count;
  const selectedUnit = units.find((u) => u.value === unit);

  return (
    <View className="flex-row items-center gap-3">
      {/* Stepper */}
      <View className="flex-row items-center rounded-2xl bg-neutral-50">
        <StepperButton
          icon="−"
          onPress={() => onGoalChange(goal - 1)}
          disabled={goal <= 1}
        />
        <View className="w-12 items-center">
          <Text className="font-nunito-bold text-xl text-neutral-800">
            {goal}
          </Text>
        </View>
        <StepperButton icon="+" onPress={() => onGoalChange(goal + 1)} />
      </View>

      {/* Unit selector */}
      <Pressable
        onPress={() => setShowUnitPicker(true)}
        className="flex-1 flex-row items-center justify-between rounded-2xl bg-neutral-50 px-4 py-3"
      >
        <Text className="font-poppins text-base text-neutral-600">
          {selectedUnit?.label ?? 'glasses'}
        </Text>
        <ChevronDown color="#A3A3A3" size={20} />
      </Pressable>

      {/* Unit Picker Modal */}
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
          'text-xl',
          disabled ? 'text-neutral-300' : 'text-neutral-500'
        )}
      >
        {icon}
      </Text>
    </AnimatedPressable>
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
                selectedUnit === u.value && 'bg-indigo-50'
              )}
            >
              <Text
                className={cn(
                  'font-poppins text-base',
                  selectedUnit === u.value
                    ? 'text-indigo-600'
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
