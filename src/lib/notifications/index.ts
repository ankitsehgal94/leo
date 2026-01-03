import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { DayOfWeek, Habit } from '@/types';

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

// Map DayOfWeek to JS weekday (1=Sunday for Notifications)
const DAY_OF_WEEK_TO_WEEKDAY: Record<DayOfWeek, number> = {
  sun: 1,
  mon: 2,
  tue: 3,
  wed: 4,
  thu: 5,
  fri: 6,
  sat: 7,
};

// Parse HH:mm time and subtract 5 minutes for early reminder
function getReminderTriggerTime(reminderTime: string): {
  hour: number;
  minute: number;
} {
  const [hours, minutes] = reminderTime.split(':').map(Number);
  let notifyMinute = minutes - 5;
  let notifyHour = hours;

  if (notifyMinute < 0) {
    notifyMinute += 60;
    notifyHour -= 1;
    if (notifyHour < 0) notifyHour = 23;
  }

  return { hour: notifyHour, minute: notifyMinute };
}

// Generate notification message with streak motivation
function getNotificationMessage(habitName: string, streak: number): string {
  if (streak >= 10) {
    return `You're on fire! ${streak}-day streak. Time for ${habitName}`;
  } else if (streak > 0) {
    return `Keep your ${streak}-day streak going! Time for ${habitName}`;
  }
  return `Time for ${habitName}`;
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
      sound: 'default',
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF7B1A',
    });
  }

  return true;
}

export async function scheduleHabitNotification(
  habit: Habit,
  currentStreak: number = 0
): Promise<string[] | null> {
  try {
    // Only schedule if reminder is enabled and time is set
    if (!habit.reminderEnabled || !habit.reminderTime) {
      return null;
    }

    // Cancel any existing notifications for this habit
    await cancelHabitNotification(habit.id);

    const { hour, minute } = getReminderTriggerTime(habit.reminderTime);
    const message = getNotificationMessage(habit.name, currentStreak);
    const identifiers: string[] = [];

    if (habit.frequency === 'daily') {
      // Schedule daily notification
      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: habit.emoji ? `${habit.emoji} ${habit.name}` : habit.name,
          body: message,
          sound: 'default',
          data: { habitId: habit.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour,
          minute,
          channelId: Platform.OS === 'android' ? 'habits' : undefined,
        },
      });
      identifiers.push(identifier);
    } else if (habit.frequency === 'custom' && habit.selectedDays) {
      // Schedule weekly notifications for each selected day
      for (const day of habit.selectedDays) {
        const weekday = DAY_OF_WEEK_TO_WEEKDAY[day];
        const identifier = await Notifications.scheduleNotificationAsync({
          content: {
            title: habit.emoji ? `${habit.emoji} ${habit.name}` : habit.name,
            body: message,
            sound: 'default',
            data: { habitId: habit.id, dayOfWeek: day },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
            weekday,
            hour,
            minute,
            channelId: Platform.OS === 'android' ? 'habits' : undefined,
          },
        });
        identifiers.push(identifier);
      }
    }

    return identifiers.length > 0 ? identifiers : null;
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
    if (habit.reminderEnabled) {
      await scheduleHabitNotification(habit, habit.currentStreak);
    }
  }
}

// Cancel today's pending notification for a habit (when completed)
export async function cancelTodayHabitNotification(
  habitId: string
): Promise<void> {
  try {
    const scheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();

    for (const notification of scheduledNotifications) {
      if (notification.content.data?.habitId === habitId) {
        const trigger = notification.trigger;
        // Check if this notification is scheduled for today
        // For daily/weekly triggers, we need to check the next fire date
        if (trigger && 'dateComponents' in trigger) {
          // This is a calendar-based trigger, cancel it
          // The notification will be rescheduled tomorrow
          await Notifications.cancelScheduledNotificationAsync(
            notification.identifier
          );
        }
      }
    }
  } catch (error) {
    console.error('Error canceling today notification:', error);
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
