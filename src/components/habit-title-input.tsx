import * as React from 'react';
import { TextInput } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { View } from './ui';

const AnimatedView = Animated.createAnimatedComponent(View);

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function HabitTitleInput({
  value,
  onChangeText,
  placeholder = 'Name your habit...',
}: Props): React.ReactElement {
  const [isFocused, setIsFocused] = React.useState(false);
  const underlineWidth = useSharedValue(0);

  React.useEffect(() => {
    underlineWidth.value = withSpring(isFocused || value.length > 0 ? 80 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [isFocused, value.length, underlineWidth]);

  const underlineStyle = useAnimatedStyle(() => ({
    width: underlineWidth.value,
    opacity: withTiming(underlineWidth.value > 0 ? 1 : 0, { duration: 200 }),
  }));

  return (
    <View className="px-4 pb-2 pt-4">
      <View className="flex-row items-center">
        <View className="flex-1">
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#D4D4D4"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="font-nunito-bold text-2xl text-neutral-700"
            style={{
              padding: 0,
              fontStyle: value ? 'normal' : 'italic',
            }}
          />
          <AnimatedView
            style={underlineStyle}
            className="mt-2 h-1 rounded-full bg-primary-300"
          />
        </View>
      </View>
    </View>
  );
}
