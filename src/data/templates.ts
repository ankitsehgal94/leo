import type { TimeOfDay } from '@/types';

export type HabitTemplate = {
  id: string;
  name: string;
  description: string;
  timeOfDay: TimeOfDay;
  emoji: string;
  category: 'health' | 'mindfulness' | 'productivity' | 'self-care';
};

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: 'drink-water',
    name: 'Drink Water',
    description: 'Stay hydrated throughout the day',
    timeOfDay: 'morning',
    emoji: '💧',
    category: 'health',
  },
  {
    id: 'morning-meditation',
    name: 'Morning Meditation',
    description: 'Start your day with mindfulness',
    timeOfDay: 'morning',
    emoji: '🧘',
    category: 'mindfulness',
  },
  {
    id: 'evening-reading',
    name: 'Evening Reading',
    description: 'Read at least 10 pages before bed',
    timeOfDay: 'evening',
    emoji: '📚',
    category: 'productivity',
  },
  {
    id: 'skincare-routine',
    name: 'Skincare Routine',
    description: 'Take care of your skin',
    timeOfDay: 'evening',
    emoji: '✨',
    category: 'self-care',
  },
  {
    id: 'daily-exercise',
    name: 'Daily Exercise',
    description: 'Move your body for at least 20 minutes',
    timeOfDay: 'morning',
    emoji: '🏃',
    category: 'health',
  },
  {
    id: 'gratitude-journal',
    name: 'Gratitude Journal',
    description: "Write 3 things you're grateful for",
    timeOfDay: 'evening',
    emoji: '🙏',
    category: 'mindfulness',
  },
  {
    id: 'morning-stretch',
    name: 'Morning Stretch',
    description: 'Stretch for 5-10 minutes after waking up',
    timeOfDay: 'morning',
    emoji: '🌅',
    category: 'health',
  },
  {
    id: 'digital-detox',
    name: 'Digital Detox',
    description: 'No screens 1 hour before bed',
    timeOfDay: 'evening',
    emoji: '📵',
    category: 'self-care',
  },
  {
    id: 'healthy-lunch',
    name: 'Healthy Lunch',
    description: 'Eat a balanced, nutritious lunch',
    timeOfDay: 'afternoon',
    emoji: '🥗',
    category: 'health',
  },
  {
    id: 'afternoon-walk',
    name: 'Afternoon Walk',
    description: 'Take a 15-minute walk after lunch',
    timeOfDay: 'afternoon',
    emoji: '🚶',
    category: 'health',
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'health', label: 'Health', emoji: '💪' },
  { id: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { id: 'productivity', label: 'Productivity', emoji: '📈' },
  { id: 'self-care', label: 'Self-Care', emoji: '💆' },
] as const;
