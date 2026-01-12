# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Leo is a React Native/Expo habit tracking app with iOS widget support. Users can create habits with various tracking types, schedule reminders, view streaks, and journal their progress.

## Development Commands

```bash
# Development
pnpm start                 # Start Expo dev server
pnpm ios                   # Run on iOS simulator
pnpm android               # Run on Android emulator

# Code Quality
pnpm lint                  # Run ESLint
pnpm type-check            # Run TypeScript check
pnpm test                  # Run Jest tests
pnpm test:watch            # Watch mode testing
pnpm check-all             # Run lint + type-check + test

# Building
pnpm prebuild              # Generate native iOS/Android directories
pnpm build:development:ios # Dev build for iOS
pnpm build:production:ios  # Production build for iOS

# E2E Testing
pnpm e2e-test              # Run Maestro E2E tests
```

## Tech Stack

- **Framework**: React Native 0.79, Expo 53, React 19
- **Routing**: Expo Router (file-based)
- **Styling**: Nativewind (Tailwind CSS for RN)
- **State**: Zustand with MMKV persistence
- **Data Fetching**: TanStack React Query + React Query Kit
- **Forms**: React Hook Form + Zod validation
- **Notifications**: Expo Notifications
- **Animations**: Moti + React Native Reanimated

## Architecture

### Directory Structure

```
src/
├── app/           # Expo Router screens (file-based routing)
│   ├── (app)/     # Tab navigation group (Home, Journal, Discover, Profile)
│   └── habit/     # Habit detail screens with dynamic routes [id].tsx
├── api/           # Axios client, React Query setup
├── components/    # Reusable components
│   └── ui/        # Core UI (Button, Input, Modal, icons)
├── lib/
│   ├── stores/    # Zustand stores (habit-store, journal-store, user-store)
│   ├── hooks/     # Custom hooks
│   ├── notifications/ # Habit reminder scheduling
│   └── storage.tsx    # MMKV + Widget sync via SharedGroupPreferences
├── types/         # TypeScript types (habit.ts, journal.ts)
└── data/          # Static data (templates.ts)
```

### State Management Pattern

Stores use `createSelectors` utility for atomic selectors and persist to MMKV:

```typescript
// src/lib/stores/habit-store.ts
export const useHabitStore = createSelectors(_useHabitStore);
export const hydrateHabits = (): void => _useHabitStore.getState().hydrate();
```

### Widget Data Sync (iOS)

The app syncs habit data to iOS widgets via SharedGroupPreferences:

- App Group: `group.com.leo.shared`
- Sync triggered when habits change via `useWidgetSync` hook
- Data includes today's habits, completion stats, and streak

### Habit Domain Model

- **Tracking types**: `simple` (checkbox), `count`, `duration`, `quantity`
- **Frequency**: `daily` or `custom` (specific days of week)
- **Streaks**: Calculated based on scheduled days only (non-scheduled days don't break streaks)
- **Notifications**: Scheduled 5 minutes before reminder time

## Code Conventions

- **File naming**: kebab-case (e.g., `habit-card.tsx`)
- **Exports**: Named exports preferred over default
- **Components**: Functional only, max ~80 lines, single responsibility
- **Imports**: Absolute paths with `@/` prefix
- **Types**: Use `type` over `interface`, `as const` over enums
- **Variables**: Descriptive with auxiliary verbs (`isLoading`, `hasError`)

### Component Example

```tsx
import { Text, View } from '@/components/ui';

type Props = {
  text: string;
};

export function Title({ text }: Props) {
  return (
    <View className="flex-row items-center py-4">
      <Text className="text-2xl">{text}</Text>
    </View>
  );
}
```

## Git Conventions

Commit prefixes: `feat:`, `fix:`, `perf:`, `docs:`, `style:`, `refactor:`, `test:`, `chore:`

- Use lowercase messages
- Max 100 chars summary
- Reference issue numbers when applicable

## Key Patterns

### Adding a New Habit Screen

1. Create route in `src/app/` following Expo Router conventions
2. Use existing UI components from `@/components/ui`
3. Access habit state via `useHabitStore` selectors
4. Use Nativewind classes from `tailwind.config.js` colors

### Scheduling Notifications

```typescript
// Notifications are scheduled when reminderEnabled is true
import { scheduleHabitNotification } from '@/lib/notifications';
await scheduleHabitNotification(habit, currentStreak);
```

### Environment Variables

- Validated via Zod in `env.js`
- Client vars exposed via `app.config.ts` extra field
- Files: `.env.development`, `.env.staging`, `.env.production`
