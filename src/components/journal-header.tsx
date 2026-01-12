import * as React from 'react';
import { Pressable } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { Text, View } from './ui';
import { ArrowLeft } from './ui/icons';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = {
  title: string;
  canSave: boolean;
  onBack: () => void;
  onSave: () => void;
};

export function JournalHeader({
  title,
  canSave,
  onBack,
  onSave,
}: Props): React.ReactElement {
  return (
    <View className="flex-row items-center justify-between px-4 py-3">
      <BackButton onPress={onBack} />
      <Text className="font-nunito-bold text-lg text-neutral-800 dark:text-neutral-100">
        {title}
      </Text>
      <SaveButton canSave={canSave} onPress={onSave} />
    </View>
  );
}

type BackButtonProps = {
  onPress: () => void;
};

function BackButton({ onPress }: BackButtonProps): React.ReactElement {
  const scale = useSharedValue(1);

  const handlePressIn = (): void => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={animatedStyle}
      className="size-10 items-center justify-center rounded-full bg-neutral-100 dark:bg-charcoal-800"
    >
      <ArrowLeft size={20} color="#737373" />
    </AnimatedPressable>
  );
}

type SaveButtonProps = {
  canSave: boolean;
  onPress: () => void;
};

function SaveButton({ canSave, onPress }: SaveButtonProps): React.ReactElement {
  const scale = useSharedValue(1);

  const handlePressIn = (): void => {
    if (canSave) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: canSave ? 1 : 0.5,
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={!canSave}
      style={animatedStyle}
      className="rounded-full bg-primary-500 px-5 py-2.5"
    >
      <Text className="font-poppins-semibold text-base text-white">Save</Text>
    </AnimatedPressable>
  );
}
