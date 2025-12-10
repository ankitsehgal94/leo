export type TimeOfDay = 'morning' | 'afternoon' | 'evening';

export type SubTask = {
  id: string;
  title: string;
};

export type Habit = {
  id: string;
  name: string;
  timeOfDay: TimeOfDay;
  subTasks?: SubTask[];
  createdAt: string;
};

export type HabitCompletion = {
  date: string; // 'YYYY-MM-DD'
  habitId: string;
  completedSubTasks: string[]; // IDs of completed sub-tasks
  isComplete: boolean;
};

export type HabitWithCompletion = Habit & {
  todayCompletion?: HabitCompletion;
};
