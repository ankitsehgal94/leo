import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { Text, View } from './ui';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function FloatingAddButton(): React.ReactElement {
  const router = useRouter();
  const scale = useSharedValue(1);
  const pulseScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.3);

  // Subtle pulse animation on mount
  React.useEffect(() => {
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      false
    );
    pulseOpacity.value = withRepeat(
      withSequence(
        withTiming(0, { duration: 1500 }),
        withTiming(0.3, { duration: 1500 })
      ),
      -1,
      false
    );
  }, [pulseScale, pulseOpacity]);

  const handlePressIn = (): void => {
    scale.value = withSpring(0.9, { damping: 15, stiffness: 400 });
  };

  const handlePressOut = (): void => {
    scale.value = withSpring(1, { damping: 15, stiffness: 400 });
  };

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: pulseOpacity.value,
  }));

  return (
    <View style={styles.container} pointerEvents="box-none">
      {/* Pulse ring */}
      <Animated.View style={[styles.pulseRing, pulseAnimatedStyle]} />

      {/* Main button */}
      <AnimatedPressable
        onPress={() => router.push('/habit/add')}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.button, buttonAnimatedStyle]}
        className="items-center justify-center bg-neutral-800"
      >
        <Text className="text-2xl font-light text-white">+</Text>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pulseRing: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#374151',
  },
});
