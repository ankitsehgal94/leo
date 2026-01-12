import type { TimeOfDay, TrackingConfig } from '@/types';

export type TemplateHabit = {
  name: string;
  emoji: string;
  timeOfDay: TimeOfDay;
  tracking?: TrackingConfig;
};

export type HabitTemplate = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  category: 'health' | 'mindfulness' | 'productivity' | 'self-care';
  duration?: string;
  habits: TemplateHabit[];
};

export const HABIT_TEMPLATES: HabitTemplate[] = [
  {
    id: 'hydration-cat',
    name: 'Hydration Cat',
    description: 'Stay hydrated throughout the day with reminders.',
    emoji: '💧',
    category: 'health',
    habits: [
      {
        name: 'Morning Water',
        emoji: '🌅',
        timeOfDay: 'morning',
        tracking: { type: 'count', unit: 'glasses', goal: 2 },
      },
      {
        name: 'Afternoon Hydration',
        emoji: '☀️',
        timeOfDay: 'afternoon',
        tracking: { type: 'count', unit: 'glasses', goal: 3 },
      },
      {
        name: 'Evening Water',
        emoji: '🌙',
        timeOfDay: 'evening',
        tracking: { type: 'count', unit: 'glasses', goal: 2 },
      },
      {
        name: 'Track Water Intake',
        emoji: '📊',
        timeOfDay: 'anytime',
        tracking: { type: 'count', unit: 'glasses', goal: 8 },
      },
      {
        name: 'Refill Water Bottle',
        emoji: '🍶',
        timeOfDay: 'anytime',
      },
    ],
  },
  {
    id: 'zen-master-meow',
    name: 'Zen Master Meow',
    description: 'Start your day with mindfulness and purring.',
    emoji: '🧘',
    category: 'mindfulness',
    duration: '10 mins',
    habits: [
      {
        name: 'Morning Meditation',
        emoji: '🧘',
        timeOfDay: 'morning',
        tracking: { type: 'duration', unit: 'minutes', goal: 10 },
      },
      {
        name: 'Deep Breathing',
        emoji: '🌬️',
        timeOfDay: 'morning',
        tracking: { type: 'count', unit: 'times', goal: 5 },
      },
      {
        name: 'Gratitude Moment',
        emoji: '🙏',
        timeOfDay: 'morning',
      },
    ],
  },
  {
    id: 'intellectual-kitty',
    name: 'Intellectual Kitty',
    description: 'Read at least 10 pages before bed every night.',
    emoji: '📚',
    category: 'productivity',
    duration: '20 mins',
    habits: [
      {
        name: 'Evening Reading',
        emoji: '📖',
        timeOfDay: 'evening',
        tracking: { type: 'count', unit: 'pages', goal: 10 },
      },
      {
        name: 'Book Notes',
        emoji: '📝',
        timeOfDay: 'evening',
      },
      {
        name: 'Reading Corner Setup',
        emoji: '🛋️',
        timeOfDay: 'evening',
      },
    ],
  },
  {
    id: 'glow-up-routine',
    name: 'Glow Up Routine',
    description: 'Take care of your skin and pamper yourself.',
    emoji: '✨',
    category: 'self-care',
    habits: [
      {
        name: 'Morning Skincare',
        emoji: '🧴',
        timeOfDay: 'morning',
      },
      {
        name: 'Evening Skincare',
        emoji: '🌙',
        timeOfDay: 'evening',
      },
      {
        name: 'Sunscreen Application',
        emoji: '☀️',
        timeOfDay: 'morning',
      },
    ],
  },
  {
    id: 'zoomies-exercise',
    name: 'Zoomies Exercise',
    description: 'Get your daily movement in like a cat with zoomies.',
    emoji: '🏃',
    category: 'health',
    duration: '30 mins',
    habits: [
      {
        name: 'Morning Stretch',
        emoji: '🤸',
        timeOfDay: 'morning',
        tracking: { type: 'duration', unit: 'minutes', goal: 10 },
      },
      {
        name: 'Cardio Session',
        emoji: '🏃',
        timeOfDay: 'morning',
        tracking: { type: 'duration', unit: 'minutes', goal: 20 },
      },
      {
        name: 'Cool Down',
        emoji: '🧘',
        timeOfDay: 'morning',
        tracking: { type: 'duration', unit: 'minutes', goal: 5 },
      },
      {
        name: 'Step Count',
        emoji: '👟',
        timeOfDay: 'anytime',
        tracking: { type: 'count', unit: 'times', goal: 10000 },
      },
    ],
  },
  {
    id: 'grateful-paws',
    name: 'Grateful Paws',
    description: "Write 3 things you're grateful for today.",
    emoji: '🙏',
    category: 'mindfulness',
    duration: '5 mins',
    habits: [
      {
        name: 'Morning Gratitude',
        emoji: '🌅',
        timeOfDay: 'morning',
      },
      {
        name: 'Evening Reflection',
        emoji: '🌙',
        timeOfDay: 'evening',
      },
    ],
  },
  {
    id: 'sunrise-stretch',
    name: 'Sunrise Stretch',
    description: 'Stretch like a cat for 5-10 minutes after waking up.',
    emoji: '🌅',
    category: 'health',
    duration: '10 mins',
    habits: [
      {
        name: 'Wake Up Stretch',
        emoji: '🤸',
        timeOfDay: 'morning',
        tracking: { type: 'duration', unit: 'minutes', goal: 5 },
      },
      {
        name: 'Neck & Shoulders',
        emoji: '💆',
        timeOfDay: 'morning',
      },
      {
        name: 'Full Body Stretch',
        emoji: '🧘',
        timeOfDay: 'morning',
        tracking: { type: 'duration', unit: 'minutes', goal: 5 },
      },
    ],
  },
  {
    id: 'catnap-detox',
    name: 'Catnap Detox',
    description: 'No screens 1 hour before bed for better sleep.',
    emoji: '📵',
    category: 'self-care',
    duration: '60 mins',
    habits: [
      {
        name: 'Screen-Free Hour',
        emoji: '📵',
        timeOfDay: 'evening',
        tracking: { type: 'duration', unit: 'minutes', goal: 60 },
      },
      {
        name: 'Dim Lights',
        emoji: '💡',
        timeOfDay: 'evening',
      },
      {
        name: 'Relaxation Activity',
        emoji: '🎵',
        timeOfDay: 'evening',
      },
    ],
  },
  {
    id: 'healthy-nibbles',
    name: 'Healthy Nibbles',
    description: 'Eat a balanced, nutritious lunch like a wise cat.',
    emoji: '🥗',
    category: 'health',
    habits: [
      {
        name: 'Healthy Breakfast',
        emoji: '🍳',
        timeOfDay: 'morning',
      },
      {
        name: 'Balanced Lunch',
        emoji: '🥗',
        timeOfDay: 'afternoon',
      },
      {
        name: 'Light Dinner',
        emoji: '🍽️',
        timeOfDay: 'evening',
      },
      {
        name: 'Healthy Snacks',
        emoji: '🍎',
        timeOfDay: 'afternoon',
      },
    ],
  },
  {
    id: 'prowl-walk',
    name: 'Prowl Walk',
    description: 'Take a 15-minute walk and explore your territory.',
    emoji: '🚶',
    category: 'health',
    duration: '15 mins',
    habits: [
      {
        name: 'Morning Walk',
        emoji: '🌅',
        timeOfDay: 'morning',
        tracking: { type: 'duration', unit: 'minutes', goal: 15 },
      },
      {
        name: 'After Lunch Walk',
        emoji: '☀️',
        timeOfDay: 'afternoon',
        tracking: { type: 'duration', unit: 'minutes', goal: 10 },
      },
    ],
  },
];

export const CATEGORIES = [
  { id: 'all', label: 'All', emoji: '✨' },
  { id: 'health', label: 'Health', emoji: '💪' },
  { id: 'mindfulness', label: 'Mindfulness', emoji: '🧘' },
  { id: 'productivity', label: 'Productivity', emoji: '📈' },
  { id: 'self-care', label: 'Self Care', emoji: '💆' },
] as const;

export const CATEGORY_COLORS: Record<string, { bg: string }> = {
  health: { bg: 'bg-success-100' },
  mindfulness: { bg: 'bg-warning-100' },
  productivity: { bg: 'bg-danger-100' },
  'self-care': { bg: 'bg-primary-50' },
};

export function getTemplateById(id: string): HabitTemplate | undefined {
  return HABIT_TEMPLATES.find((t) => t.id === id);
}
