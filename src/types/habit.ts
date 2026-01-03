export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'anytime';

export type Frequency = 'daily' | 'custom';

export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

// Tracking types for habits
export type TrackingType = 'simple' | 'count' | 'duration' | 'quantity';

export type TrackingUnit =
  // Count units
  | 'glasses'
  | 'times'
  | 'reps'
  | 'pages'
  // Duration units
  | 'minutes'
  | 'hours'
  // Quantity units
  | 'grams'
  | 'ml'
  | 'calories'
  | 'servings';

export type TrackingConfig = {
  type: TrackingType;
  unit?: TrackingUnit;
  goal: number;
};

export type Habit = {
  id: string;
  name: string;
  emoji?: string;
  timeOfDay: TimeOfDay;
  frequency: Frequency;
  selectedDays?: DayOfWeek[]; // Only used when frequency is 'custom'
  reminderEnabled: boolean;
  reminderTime?: string; // HH:mm format, e.g., "07:00"
  tracking?: TrackingConfig;
  createdAt: string;
  currentStreak: number; // Consecutive completions (scheduled days only)
  longestStreak: number; // All-time best streak
};

export type HabitCompletion = {
  date: string; // 'YYYY-MM-DD'
  habitId: string;
  isComplete: boolean;
  progress?: number; // Current progress value for tracked habits
};

export type HabitWithCompletion = Habit & {
  todayCompletion?: HabitCompletion;
};

// Helper constants for UI
export const TRACKING_TYPES = {
  simple: {
    label: 'Just mark it done',
    icon: '✅',
    description: 'Simple yes/no tracking',
  },
  count: {
    label: 'Count repetitions',
    icon: '🔢',
    description: 'Track number of times',
  },
  duration: {
    label: 'Track duration',
    icon: '⏱️',
    description: 'Track time spent',
  },
  quantity: {
    label: 'Track quantity',
    icon: '📊',
    description: 'Track amounts',
  },
} as const;

export const TRACKING_UNITS: Record<
  TrackingType,
  { value: TrackingUnit; label: string }[]
> = {
  simple: [],
  count: [
    { value: 'glasses', label: 'glasses' },
    { value: 'times', label: 'times' },
    { value: 'reps', label: 'reps' },
    { value: 'pages', label: 'pages' },
  ],
  duration: [
    { value: 'minutes', label: 'minutes' },
    { value: 'hours', label: 'hours' },
  ],
  quantity: [
    { value: 'grams', label: 'grams' },
    { value: 'ml', label: 'ml' },
    { value: 'calories', label: 'calories' },
    { value: 'servings', label: 'servings' },
  ],
};

// All days constant
export const ALL_DAYS: DayOfWeek[] = [
  'mon',
  'tue',
  'wed',
  'thu',
  'fri',
  'sat',
  'sun',
];

export const DAY_LABELS: Record<DayOfWeek, { short: string; full: string }> = {
  mon: { short: 'M', full: 'Monday' },
  tue: { short: 'T', full: 'Tuesday' },
  wed: { short: 'W', full: 'Wednesday' },
  thu: { short: 'T', full: 'Thursday' },
  fri: { short: 'F', full: 'Friday' },
  sat: { short: 'S', full: 'Saturday' },
  sun: { short: 'S', full: 'Sunday' },
};

// Derive time of day from a time string (HH:mm)
export function deriveTimeOfDay(time: string): TimeOfDay {
  const [hours] = time.split(':').map(Number);
  if (hours < 12) return 'morning';
  if (hours < 17) return 'afternoon';
  return 'evening';
}

// Smart defaults based on habit name
export function suggestTracking(name: string): TrackingConfig {
  const lower = name.toLowerCase();

  if (lower.includes('water') || lower.includes('drink'))
    return { type: 'count', unit: 'glasses', goal: 8 };

  if (
    lower.includes('meditat') ||
    lower.includes('read') ||
    lower.includes('study')
  )
    return { type: 'duration', unit: 'minutes', goal: 15 };

  if (
    lower.includes('pushup') ||
    lower.includes('squat') ||
    lower.includes('exercise')
  )
    return { type: 'count', unit: 'reps', goal: 20 };

  if (lower.includes('walk') || lower.includes('run') || lower.includes('jog'))
    return { type: 'duration', unit: 'minutes', goal: 30 };

  if (lower.includes('calorie'))
    return { type: 'quantity', unit: 'calories', goal: 2000 };

  if (lower.includes('protein') || lower.includes('fiber'))
    return { type: 'quantity', unit: 'grams', goal: 50 };

  if (lower.includes('page') || lower.includes('book'))
    return { type: 'count', unit: 'pages', goal: 10 };

  return { type: 'simple', goal: 1 };
}
