import type { SubTask, TimeOfDay } from '@/types';

export type HabitTemplate = {
  id: string;
  name: string;
  description: string;
  timeOfDay: TimeOfDay;
  subTasks?: SubTask[];
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
    subTasks: [
      { id: 'water-1', title: 'Morning glass' },
      { id: 'water-2', title: 'Mid-morning' },
      { id: 'water-3', title: 'After lunch' },
      { id: 'water-4', title: 'Afternoon' },
      { id: 'water-5', title: 'Before bed' },
    ],
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
    subTasks: [
      { id: 'skin-1', title: 'Cleanser' },
      { id: 'skin-2', title: 'Toner' },
      { id: 'skin-3', title: 'Moisturizer' },
    ],
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
    subTasks: [
      { id: 'stretch-1', title: 'Neck rolls' },
      { id: 'stretch-2', title: 'Shoulder stretch' },
      { id: 'stretch-3', title: 'Back stretch' },
      { id: 'stretch-4', title: 'Leg stretch' },
    ],
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
