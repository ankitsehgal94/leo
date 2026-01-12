import * as React from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Ellipse, Path } from 'react-native-svg';

import { View } from './ui';

type CatMoodType = 'sleepy' | 'curious' | 'happy' | 'excited' | 'celebrating';

type Props = {
  progress: number; // 0 to 1
  size?: number;
};

function getMoodFromProgress(progress: number): CatMoodType {
  if (progress === 0) return 'sleepy';
  if (progress < 0.25) return 'curious';
  if (progress < 0.5) return 'happy';
  if (progress < 1) return 'excited';
  return 'celebrating';
}

function getMoodMessage(mood: CatMoodType, userName?: string): string {
  const name = userName || 'there';
  switch (mood) {
    case 'sleepy':
      return `Let's get started, ${name}!`;
    case 'curious':
      return `Nice start, ${name}!`;
    case 'happy':
      return `Nice momentum, ${name}!`;
    case 'excited':
      return `Almost there, ${name}!`;
    case 'celebrating':
      return `You crushed it, ${name}!`;
  }
}

function getMoodSubtitle(mood: CatMoodType): string {
  switch (mood) {
    case 'sleepy':
      return 'Your habits are waiting for you.';
    case 'curious':
      return "You're warming up nicely.";
    case 'happy':
      return "You're finding your rhythm today.";
    case 'excited':
      return 'Keep pushing, victory is near!';
    case 'celebrating':
      return 'All habits completed! Amazing!';
  }
}

function SleepyEyes(): React.ReactElement {
  return (
    <>
      <Path
        d="M28 40 Q32 44 36 40"
        stroke="#333"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M44 40 Q48 44 52 40"
        stroke="#333"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

function CuriousEyes(): React.ReactElement {
  return (
    <>
      <Circle cx="32" cy="40" r="6" fill="#333" />
      <Circle cx="48" cy="40" r="6" fill="#333" />
      <Circle cx="34" cy="38" r="2" fill="#FFF" />
      <Circle cx="50" cy="38" r="2" fill="#FFF" />
    </>
  );
}

function HappyEyes(): React.ReactElement {
  return (
    <>
      <Path
        d="M26 40 Q32 36 38 40"
        stroke="#333"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M42 40 Q48 36 54 40"
        stroke="#333"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

function CelebratingEyes(): React.ReactElement {
  return (
    <>
      <Path
        d="M26 38 Q32 34 38 38"
        stroke="#333"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      <Path
        d="M42 38 Q48 34 54 38"
        stroke="#333"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
    </>
  );
}

function CatEyes({ mood }: { mood: CatMoodType }): React.ReactElement | null {
  if (mood === 'sleepy') return <SleepyEyes />;
  if (mood === 'curious') return <CuriousEyes />;
  if (mood === 'happy' || mood === 'excited') return <HappyEyes />;
  if (mood === 'celebrating') return <CelebratingEyes />;
  return null;
}

function CatMouth({ mood }: { mood: CatMoodType }): React.ReactElement {
  if (mood === 'sleepy') {
    return (
      <Path
        d="M36 54 Q40 56 44 54"
        stroke="#333"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    );
  }
  if (mood === 'curious') {
    return <Ellipse cx="40" cy="55" rx="3" ry="2" fill="#333" />;
  }
  return (
    <Path
      d="M34 52 Q40 60 46 52"
      stroke="#333"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
    />
  );
}

function CatBlush({ mood }: { mood: CatMoodType }): React.ReactElement | null {
  if (mood === 'happy' || mood === 'excited' || mood === 'celebrating') {
    return (
      <>
        <Ellipse cx="22" cy="48" rx="5" ry="3" fill="#FFB6C1" opacity={0.6} />
        <Ellipse cx="58" cy="48" rx="5" ry="3" fill="#FFB6C1" opacity={0.6} />
      </>
    );
  }
  return null;
}

function CatSparkles({
  mood,
}: {
  mood: CatMoodType;
}): React.ReactElement | null {
  if (mood === 'celebrating') {
    return (
      <>
        <Path
          d="M12 20 L14 24 L18 22 L14 26 L12 30 L10 26 L6 28 L10 24 Z"
          fill="#FFD700"
        />
        <Path
          d="M68 20 L66 24 L62 22 L66 26 L68 30 L70 26 L74 28 L70 24 Z"
          fill="#FFD700"
        />
      </>
    );
  }
  return null;
}

function CatFace({ mood, size }: { mood: CatMoodType; size: number }) {
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 80 80">
        <Circle cx="40" cy="40" r="38" fill="#FFF5EB" />
        <Path d="M15 30 L25 10 L35 28 Z" fill="#FF8C42" />
        <Path d="M65 30 L55 10 L45 28 Z" fill="#FF8C42" />
        <Path d="M20 26 L25 14 L30 25 Z" fill="#FFB088" />
        <Path d="M60 26 L55 14 L50 25 Z" fill="#FFB088" />
        <Circle cx="40" cy="42" r="28" fill="#FF8C42" />
        <Ellipse cx="40" cy="50" rx="20" ry="16" fill="#FFFFFF" />
        <CatEyes mood={mood} />
        <Ellipse cx="40" cy="48" rx="3" ry="2.5" fill="#FF6B6B" />
        <CatMouth mood={mood} />
        <Path d="M10 45 L24 47" stroke="#333" strokeWidth="1.5" />
        <Path d="M12 50 L24 50" stroke="#333" strokeWidth="1.5" />
        <Path d="M56 47 L70 45" stroke="#333" strokeWidth="1.5" />
        <Path d="M56 50 L68 50" stroke="#333" strokeWidth="1.5" />
        <CatBlush mood={mood} />
        <CatSparkles mood={mood} />
      </Svg>
    </View>
  );
}

export function CatMood({ progress, size = 80 }: Props): React.ReactElement {
  const mood = getMoodFromProgress(progress);
  const scale = useSharedValue(1);
  const rotate = useSharedValue(0);

  // Bounce animation when mood changes
  React.useEffect(() => {
    scale.value = withSequence(
      withTiming(1.1, { duration: 150 }),
      withSpring(1, { damping: 12, stiffness: 400 })
    );

    // Add wiggle for celebrating mood
    if (mood === 'celebrating') {
      rotate.value = withRepeat(
        withSequence(
          withTiming(-5, { duration: 100 }),
          withTiming(5, { duration: 100 }),
          withTiming(0, { duration: 100 })
        ),
        3,
        false
      );
    } else {
      rotate.value = withTiming(0, { duration: 100 });
    }
  }, [mood, scale, rotate]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { rotate: `${rotate.value}deg` }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <CatFace mood={mood} size={size} />
    </Animated.View>
  );
}

export { getMoodFromProgress, getMoodMessage, getMoodSubtitle };
export type { CatMoodType };
