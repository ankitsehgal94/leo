export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export type JournalEntry = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:MM AM/PM'
  title: string;
  text: string;
  mood: MoodLevel;
  createdAt: string;
};
