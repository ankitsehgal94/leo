import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { Habit, TimeOfDay } from '@/types';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Time mapping for notifications
const TIME_HOURS: Record<TimeOfDay, number> = {
  morning: 8,
  afternoon: 13,
  evening: 21,
};

const NOTIFICATION_MESSAGES: Record<TimeOfDay, string[]> = {
  morning: [
    'Good morning! Your morning habits are waiting 🌅',
    'Rise and shine! Time for your morning routine ☀️',
    'Start your day right with your morning habits 🐱',
  ],
  afternoon: [
    'Afternoon check-in! How are your habits going? 🌤️',
    'Time for your afternoon habits! Keep going 💪',
    "Midday motivation: You're doing great! 🐱",
  ],
  evening: [
    'Evening routine time! Wind down with your habits 🌙',
    'Your evening habits are waiting for you ✨',
    'End your day strong with your evening routine 🐱',
  ],
};

function getRandomMessage(timeOfDay: TimeOfDay): string {
  const messages = NOTIFICATION_MESSAGES[timeOfDay];
  return messages[Math.floor(Math.random() * messages.length)];
}

export async function requestNotificationPermissions(): Promise<boolean> {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('habits', {
      name: 'Habit Reminders',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7B1A',
    });
  }

  return true;
}

export async function scheduleHabitNotification(
  habit: Habit
): Promise<string | null> {
  try {
    const hour = TIME_HOURS[habit.timeOfDay];
    const message = getRandomMessage(habit.timeOfDay);

    // Cancel any existing notification for this habit
    await cancelHabitNotification(habit.id);

    // Schedule daily notification
    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title: habit.name,
        body: message,
        data: { habitId: habit.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute: 0,
        channelId: Platform.OS === 'android' ? 'habits' : undefined,
      },
    });

    return identifier;
  } catch (error) {
    console.error('Error scheduling notification:', error);
    return null;
  }
}

export async function cancelHabitNotification(habitId: string): Promise<void> {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.habitId === habitId) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }
    }
  } catch (error) {
    console.error('Error canceling notification:', error);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling all notifications:', error);
  }
}

export async function scheduleAllHabitNotifications(
  habits: Habit[]
): Promise<void> {
  for (const habit of habits) {
    await scheduleHabitNotification(habit);
  }
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
