import * as React from 'react';

import { Image, Text, View } from './ui';

const CELEBRATION_MESSAGES = [
  "You're on fire!",
  'Amazing work today!',
  'All habits complete!',
  'Perfect day!',
  'You crushed it!',
  'Way to go!',
];

function getRandomMessage(): string {
  return CELEBRATION_MESSAGES[
    Math.floor(Math.random() * CELEBRATION_MESSAGES.length)
  ];
}

export function Celebration(): React.ReactElement {
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    setMessage(getRandomMessage());
  }, []);

  return (
    <View className="mx-4 my-3 items-center rounded-3xl py-6">
      <Image
        source={require('../../assets/images/happy_cat.gif')}
        style={{ width: 180, height: 180 }}
        contentFit="contain"
        autoplay={true}
        placeholder={null}
      />
      <Text className="mt-2 text-xl font-bold text-success-700">{message}</Text>
      <Text className="mt-1 text-sm text-success-600">
        All habits completed for today ✨
      </Text>
    </View>
  );
}
