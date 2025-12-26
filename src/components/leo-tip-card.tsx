import * as React from 'react';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { Image, Text, View } from '@/components/ui';

type Props = {
  message: string;
  delay?: number;
};

export function LeoTipCard({ message, delay = 0 }: Props): React.ReactElement {
  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(15)}
      className="mx-4 mb-6 overflow-hidden rounded-2xl bg-[#FFF8F5] p-4"
    >
      {/* Paw print watermark */}
      <View className="absolute -right-4 -top-2 opacity-10">
        <Text className="text-6xl">🐾</Text>
      </View>

      <View className="flex-row items-start">
        {/* Cat avatar */}
        <View className="mr-3">
          <Image
            source={require('@assets/images/happy_cat.gif')}
            className="size-12 rounded-full"
            contentFit="cover"
          />
        </View>

        {/* Message content */}
        <View className="flex-1">
          <Text className="font-poppins-semibold text-sm text-primary-500">
            Leo says:{' '}
            <Text className="font-poppins text-sm text-neutral-700">
              {message}
            </Text>
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
