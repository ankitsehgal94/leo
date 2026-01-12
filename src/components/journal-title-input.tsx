import * as React from 'react';
import { TextInput } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { View } from './ui';

const AnimatedView = Animated.createAnimatedComponent(View);

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
};

export function JournalTitleInput({
  value,
  onChangeText,
  placeholder = 'Title of your entry...',
}: Props): React.ReactElement {
  const [isFocused, setIsFocused] = React.useState(false);
  const underlineWidth = useSharedValue(0);

  React.useEffect(() => {
    underlineWidth.value = withSpring(isFocused || value.length > 0 ? 60 : 0, {
      damping: 15,
      stiffness: 200,
    });
  }, [isFocused, value.length, underlineWidth]);

  const underlineStyle = useAnimatedStyle(() => ({
    width: underlineWidth.value,
    opacity: withTiming(underlineWidth.value > 0 ? 1 : 0, { duration: 200 }),
  }));

  return (
    <View className="mt-6">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#A3A3A3"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className="font-nunito-bold text-2xl text-neutral-700 dark:text-neutral-100"
            style={{ padding: 0 }}
          />
          <AnimatedView
            style={underlineStyle}
            className="mt-2 h-1 rounded-full bg-primary-400"
          />
        </View>
        <PinIcon />
      </View>
    </View>
  );
}

function PinIcon(): React.ReactElement {
  return (
    <View className="ml-4 opacity-30">
      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
        <Path
          d="M16 4v4l2 2v4h-5v6l-1 1-1-1v-6H6v-4l2-2V4h8z"
          stroke="#737373"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </View>
  );
}
