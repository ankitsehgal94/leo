import * as React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GoalStepper } from '@/components/goal-stepper';
import { Text, View } from '@/components/ui';
import { Check, ChevronDown } from '@/components/ui/icons';
import { cn } from '@/lib';
import type { TrackingConfig, TrackingType, TrackingUnit } from '@/types';
import { TRACKING_TYPES, TRACKING_UNITS } from '@/types';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  value: TrackingConfig;
  onChange: (config: TrackingConfig) => void;
};

function useTrackingHandlers(
  value: TrackingConfig,
  onChange: (config: TrackingConfig) => void
) {
  const handleTypeChange = (type: TrackingType): void => {
    if (type === 'simple') {
      onChange({ type, goal: 1 });
    } else {
      const defaultUnit = TRACKING_UNITS[type][0]?.value;
      onChange({
        type,
        unit: defaultUnit,
        goal: value.goal > 1 ? value.goal : getDefaultGoal(type),
      });
    }
  };

  const handleUnitChange = (unit: TrackingUnit): void => {
    onChange({ ...value, unit });
  };

  const handleGoalChange = (newGoal: number): void => {
    if (newGoal >= 1) {
      onChange({ ...value, goal: newGoal });
    }
  };

  return { handleTypeChange, handleUnitChange, handleGoalChange };
}

export function TrackingTypePicker({
  value,
  onChange,
}: Props): React.ReactElement {
  const [showMoreOptions, setShowMoreOptions] = React.useState(false);
  const handlers = useTrackingHandlers(value, onChange);
  const primaryType: TrackingType = 'simple';
  const otherTypes = (Object.keys(TRACKING_TYPES) as TrackingType[]).filter(
    (t) => t !== 'simple'
  );

  return (
    <Animated.View layout={LinearTransition.springify().damping(20)}>
      <TrackingTypeCard
        type={primaryType}
        isSelected={value.type === primaryType}
        onSelect={() => handlers.handleTypeChange(primaryType)}
      />
      <MoreOptionsToggle
        isExpanded={showMoreOptions}
        onToggle={() => setShowMoreOptions(!showMoreOptions)}
      />
      {showMoreOptions && (
        <Animated.View
          entering={FadeInDown.springify().damping(20)}
          exiting={FadeOut.duration(150)}
          className="mt-2 gap-2"
        >
          {otherTypes.map((type) => (
            <TrackingTypeCard
              key={type}
              type={type}
              isSelected={value.type === type}
              onSelect={() => handlers.handleTypeChange(type)}
            />
          ))}
        </Animated.View>
      )}
      {value.type !== 'simple' && (
        <Animated.View
          entering={FadeInDown.springify().damping(20)}
          exiting={FadeOut.duration(150)}
          layout={LinearTransition.springify()}
        >
          <GoalStepper
            type={value.type}
            goal={value.goal}
            unit={value.unit}
            onGoalChange={handlers.handleGoalChange}
            onUnitChange={handlers.handleUnitChange}
          />
        </Animated.View>
      )}
    </Animated.View>
  );
}

function getDefaultGoal(type: TrackingType): number {
  switch (type) {
    case 'count':
      return 8;
    case 'duration':
      return 30;
    case 'quantity':
      return 100;
    default:
      return 1;
  }
}

type MoreOptionsToggleProps = {
  isExpanded: boolean;
  onToggle: () => void;
};

function MoreOptionsToggle({
  isExpanded,
  onToggle,
}: MoreOptionsToggleProps): React.ReactElement {
  const rotation = useSharedValue(0);

  React.useEffect(() => {
    rotation.value = withTiming(isExpanded ? 180 : 0, { duration: 200 });
  }, [isExpanded, rotation]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  return (
    <Pressable
      onPress={onToggle}
      className="mt-4 flex-row items-center justify-center border-t border-neutral-100 py-4"
    >
      <Text className="mr-2 font-poppins text-base text-neutral-400">
        More options
      </Text>
      <Animated.View style={iconStyle}>
        <ChevronDown color="#A3A3A3" size={20} />
      </Animated.View>
    </Pressable>
  );
}

type TrackingTypeCardProps = {
  type: TrackingType;
  isSelected: boolean;
  onSelect: () => void;
};

function useCardAnimation(onSelect: () => void) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (): void => {
    scale.value = withTiming(0.98, { duration: 100 });
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const handlePress = (): void => {
    scale.value = withSequence(
      withTiming(0.96, { duration: 50 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );
    onSelect();
  };

  return { animatedStyle, handlePressIn, handlePressOut, handlePress };
}

function TrackingTypeCard({
  type,
  isSelected,
  onSelect,
}: TrackingTypeCardProps): React.ReactElement {
  const config = TRACKING_TYPES[type];
  const animation = useCardAnimation(onSelect);

  return (
    <AnimatedPressable
      style={animation.animatedStyle}
      onPress={animation.handlePress}
      onPressIn={animation.handlePressIn}
      onPressOut={animation.handlePressOut}
      className={cn(
        'flex-row items-center rounded-3xl px-5 py-5',
        isSelected ? 'bg-primary-50' : 'bg-white'
      )}
    >
      <View
        className={cn(
          'mr-4 size-12 items-center justify-center rounded-2xl',
          isSelected ? 'bg-white' : 'bg-neutral-50'
        )}
      >
        {isSelected ? (
          <Check color="#A3A3A3" size={24} />
        ) : (
          <View className="size-6 rounded-lg border-2 border-neutral-200" />
        )}
      </View>
      <View className="flex-1">
        <Text className="font-nunito-bold text-lg text-neutral-800">
          {config.label}
        </Text>
        <Text className="font-poppins text-sm text-neutral-400">
          {config.description}
        </Text>
      </View>
      <View className="size-7 items-center justify-center rounded-full border-2 border-neutral-200">
        {isSelected && <View className="size-3 rounded-full bg-neutral-300" />}
      </View>
    </AnimatedPressable>
  );
}
