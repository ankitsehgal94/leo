import * as React from 'react';

import { useUserStore } from '@/lib/stores';

import { Text, View } from './ui';

// Helper to safely get userName from store
function useUserName(): string | undefined {
  return useUserStore((state) => state.userName);
}

const GREETINGS = {
  morning: ['Good morning', 'Rise and shine', 'Hello sunshine'],
  afternoon: [
    'Good afternoon',
    'Hope your day is going well',
    'Keep up the momentum',
  ],
  evening: ['Good evening', 'Wind down time', 'Almost there'],
};

const MOTIVATIONAL_MESSAGES = [
  'Small steps lead to big changes.',
  "You're building something beautiful.",
  'Every habit counts.',
  'Progress, not perfection.',
  'One day at a time.',
  "You've got this!",
  'Keep showing up.',
  'Consistency is key.',
];

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function Greeting(): React.ReactElement {
  const userName = useUserName();
  const timeOfDay = getTimeOfDay();

  // Use a stable random message per day
  const [greeting, setGreeting] = React.useState('');
  const [message, setMessage] = React.useState('');

  React.useEffect(() => {
    setGreeting(getRandomItem(GREETINGS[timeOfDay]));
    setMessage(getRandomItem(MOTIVATIONAL_MESSAGES));
  }, [timeOfDay]);

  const displayName = userName || 'friend';

  return (
    <View className="px-4 py-3">
      <Text className="text-2xl font-bold text-neutral-800">
        {greeting}, {displayName}! 👋
      </Text>
      <Text className="mt-1 text-base text-neutral-500">{message}</Text>
    </View>
  );
}
