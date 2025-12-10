<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# Here’s a concise PRD-style spec for V1 that you can drop into Cursor and refine.

1. Product overview
   A mobile app where a friendly cat companion helps users stick to gentle daily routines (morning, evening, self‑care) through simple checklists, reminders, a 7‑day progress view, a small library of templates, and one daily journal entry. V1 targets solo users and runs fully on-device (no backend).
2. Scope for V1
   In scope
   Routines with tasks (CRUD)
   Simple scheduling \& local notifications
   7‑day progress overview
   Discover: small library of pre‑made routines
   Daily journaling (one entry per day)
   Cat mascot visuals in key states
   Freemium limit (max 3 routines free)
   Basic paywall screen and “isPremium” flag (stubbed; pricing integration can be wired later)
   Basic settings (notifications toggle, restore purchases placeholder)
   Out of scope (V1)
   Streak badges, advanced analytics
   Guided programs
   Widgets
   Health/Calendar integrations
   Multi‑device sync / accounts
3. Platforms \& tech
   Platform: Mobile only, starting with Android (Expo managed workflow)
   Stack: React Native + Expo, TypeScript
   Storage: AsyncStorage (or MMKV) for local data
   Notifications: expo-notifications
   Navigation: @react-navigation (stack + bottom tabs)
4. Data model (initial)
   ts
   type TimeOfDay = 'morning' | 'afternoon' | 'evening';

type Task = {
id: string;
title: string;
isDone: boolean;
};

type Routine = {
id: string;
name: string;
timeOfDay: TimeOfDay;
tasks: Task[];
createdAt: string; // ISO string
};

type CompletionRecord = {
date: string; // 'YYYY-MM-DD'
routineId: string;
};

type JournalEntry = {
date: string; // 'YYYY-MM-DD'
text: string;
};

type UserState = {
isPremium: boolean;
onboardingCompleted: boolean;
};

5. Screens \& behavior
   5.1 Onboarding
   Simple 2–3 screens, all skippable:
   Screen 1: Welcome + cat illustration.
   Screen 2: “What do you care about most?” (optional choices like Morning routine / Movement / Sleep / Self‑care).
   On finish or skip → Home.
   Store onboardingCompleted = true.
   5.2 Home (Today)
   Purpose: Daily hub.
   UI:
   Header: “Today” + small cat avatar.
   Section: list of today’s routines, grouped by timeOfDay.
   Each routine card: name, timeOfDay label, completion status (e.g., tasks done / total).
   CTA: “+ New routine”.
   Footer: link to “Today’s journal”.
   Behavior:
   Tap routine card → Routine Details.
   Tap “+ New routine” → Add/Edit Routine.
   If no routines: show empty state with cat in “encouraging” pose + button “Create your first routine” and “Browse templates”.
   5.3 Routine Details
   Purpose: Manage tasks within a routine.
   UI:
   Routine name + timeOfDay.
   Editable list of tasks with checkboxes.
   Buttons: “Add task”, “Edit routine” (name/timeOfDay), “Delete routine”.
   Behavior:
   Checking a task marks it complete for today.
   If all tasks in a routine are completed for today:
   Record a CompletionRecord for that date \& routine.
   Show a small “happy cat” success state (banner/modal).
   5.4 Add / Edit Routine
   Fields:
   Name (required).
   Time of day (segmented control: morning / afternoon / evening).
   Task list:
   Simple add/remove of task titles.
   Behavior:
   On save:
   If creating and user already has 3 routines and isPremium === false → redirect to Paywall instead of saving.
   Otherwise:
   Persist to storage.
   Schedule or reschedule notification for this routine.
   5.5 Discover (Templates)
   Purpose: Let users quickly add pre‑made routines.
   UI:
   List/grid of 6–10 templates, each with:
   Title (e.g., “Gentle Morning Start”).
   Short subtitle (1 line).
   Small cat illustration variant (optional).
   Behavior:
   Tap template → preview:
   Show tasks and timeOfDay.
   “Use this template” button → create a new routine populated with those tasks (respecting free tier limit → may show Paywall).
   (Template content can be hard‑coded JSON in V1.)
   5.6 Journal
   Purpose: One simple daily reflection.
   UI:
   Date (today).
   Prompt text (static): “How did today feel?”.
   Multiline TextInput.
   Save button (or autosave on blur).
   Behavior:
   Only one entry per date; opening again loads existing text.
   Entries saved locally; no listing of historical entries needed for V1 (optional simple “Previous entry” navigation if you want).
   5.7 Paywall
   Purpose: Explain free vs premium and allow upgrade (logic stub).
   UI:
   Title: “Go Premium”.
   Two columns/sections:
   Free: up to 3 routines.
   Premium: unlimited routines, more templates \& cat styles (future benefits).
   Price placeholders for Monthly and Yearly.
   Button: “Continue (stub)” → for now, simply set isPremium = true locally (replace with real purchase flow later).
   5.8 Settings
   UI:
   Toggle notifications on/off.
   “Restore purchases” (stub).
   “About” / version info.
   Behavior:
   Notification toggle enables/disables scheduling and receiving local notifications.
6. Notifications
   For each routine, schedule 1 local notification at its timeOfDay (simple mapping like:
   morning → 8:00
   afternoon → 13:00
   evening → 21:00
   When a routine is edited (timeOfDay changed) or deleted, update/cancel its notification.
   Notification copy: short and gentle, e.g., “Your evening routine is waiting 😊”.
7. Cat mascot states (V1)
   Neutral/home cat – used in Home header.
   Empty‑state cat – used when no routines.
   Success cat – used when a routine is fully completed for today.
   Journal cat (optional) – small illustration on Journal screen.
   All as static images in /assets/cat/.
8. Non‑functional constraints
   Should feel responsive on mid‑range Android devices.
   All core flows must work offline (no network required).
   Avoid long onboarding; user can reach Home in under 15 seconds.

If you want, the next step can be to break this into a task list for Cursor (e.g., “implement storage layer”, “build HomeScreen skeleton”, etc.) so you can start coding in a sane order.
Add to follow-up
Can you go through this and create a tech doc for both react native and for pack and where we will be using something called supabase.

The app will remain primarily offline-first with local storage, while Supabase is introduced as a backend for future sync, auth, and backups.[^1][^2]

## Architecture overview

- Mobile client: Expo React Native app (TypeScript) using React Navigation, expo-notifications, and local storage (AsyncStorage or MMKV) as the source of truth for V1.[^3][^1]
- Backend: Supabase project (Postgres + Auth + optional Storage) used initially for user accounts, feature flags (e.g., templates, paywall config), and future sync of routines and completions.[^2][^4]
- Data flow: UI ↔ local store (offline-first) with optional background/explicit sync to Supabase once accounts are added in a later V1.1.[^5][^6]

## React Native (client) tech doc

### Core libraries and setup

- Expo managed workflow with TypeScript: created via `npx create-expo-app -t expo-template-blank-typescript`.[^3]
- Supabase client: `@supabase/supabase-js` with AsyncStorage as the auth/session storage, configured in a `supabaseClient.ts` helper using `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.[^7][^1]
- Auth/session: `supabase.auth.getSession()` and `supabase.auth.onAuthStateChange` used to keep a `Session | null` in global state once you introduce login. [^1][^3]

### Local persistence \& state

- Storage:
  - Local app state (routines, tasks, completion records, journal entries, onboarding flags, isPremium) remains in AsyncStorage/MMKV for V1.
  - A thin repository layer (e.g., `RoutineRepository`, `JournalRepository`, `UserStateRepository`) abstracts reads/writes so later you can plug Supabase sync in without touching UI.[^8][^5]
- Caching strategy:
  - All screens read from in-memory state (e.g., React context/Zustand/Jotai) hydrated from AsyncStorage on app start.
  - Writes update in-memory state first, then persist to AsyncStorage; sync to Supabase can be queued when online.[^6][^5]

### Navigation \& screens

- Navigation: `@react-navigation/native` with a root stack (Onboarding, Paywall, Settings) and bottom tabs (Home/Today, Discover, Journal, optionally Settings).[^3]
- Screen responsibilities (from your PRD) remain the same; tech-specific notes:
  - Home: reads routines from local store; computes “today” completion status by joining routines with today’s CompletionRecords.
  - Routine Details / Add–Edit: CRUD operations on routines and tasks through repository, plus calls to a `NotificationService` to schedule/update/cancel notifications.
  - Discover: template JSON can live locally; later, you can switch to fetching template lists from Supabase (public table) via a typed data access layer.[^4]
  - Journal: one entry per day keyed by date, stored locally; later mirrored to Supabase.

### Notifications

- Library: `expo-notifications`.[^2]
- Mapping: `TimeOfDay` → static times (08:00, 13:00, 21:00) maintained in a shared config used by both notification scheduling and UI labels.
- Behavior:
  - On routine create/update: schedule or reschedule one local notification.
  - On delete or notifications toggle off: cancel related notifications.

## Supabase tech doc

### Project \& configuration

- Create a Supabase project from the Supabase dashboard, then copy project URL and anon key into Expo public env vars.[^7][^4]
- Client initialization: `createClient(supabaseUrl, supabaseAnonKey, { auth: { storage: AsyncStorage, autoRefreshToken: true, persistSession: true, detectSessionInUrl: false } })` for React Native.[^1][^8]

### Data model (backend)

Map current local types to Supabase tables to support future sync and multi-device:

- Tables:
  - `users`: user profile and settings (`id`, `is_premium`, `onboarding_completed`, notification pref).
  - `routines`: `id`, `user_id`, `name`, `time_of_day`, `created_at`.
  - `tasks`: `id`, `routine_id`, `title`, `is_archived`.
  - `completion_records`: `id`, `user_id`, `routine_id`, `date`.
  - `journal_entries`: `id`, `user_id`, `date`, `text`.
  - `routine_templates`: template routines \& tasks for Discover, with an optional `is_premium_only` flag.
- Security: enable Row Level Security on user-scoped tables so users can only access their own data, using Supabase’s recommended policies for authenticated clients.[^4][^7]

### Usage phases

- V1 (no login):
  - Supabase is technically available but not required; the app functions fully offline using local storage.
  - You can still leverage a public `routine_templates` table for remote template updates if desired, using anon key and public read policies.[^7]
- V1.1+ (accounts \& sync):
  - Use Supabase Auth for email/password or social login flows, based on Expo React Native quickstart guides.[^3][^7]
  - Introduce a sync engine that:
    - Pushes local changes (routines, tasks, completions, journal entries) to Supabase when online.
    - Pulls remote changes and merges into local store, keeping local-first semantics.[^5][^6]

## “Pack” / integration layer

- Define a reusable “pack” (internal module) that bundles:
  - Supabase client initialization and typed query helpers.
  - Local repositories for each entity type with optional Supabase sync hooks.
  - Feature flags (e.g., premium features, templates) fetched from Supabase and cached locally.[^1][^2]
- This pack exposes a clean API to the rest of the app (e.g., `useRoutines`, `useJournalForDate`, `useUserState`), hiding whether data comes from local storage, Supabase, or both.[^6][^5]

## Local vs Supabase responsibilities

| Concern                  | Local storage (AsyncStorage/MMKV) | Supabase (now / later)  |
| :----------------------- | :-------------------------------- | :---------------------- |
| Routines \& tasks        | Source of truth in V1             | Sync + multi-device     |
| Completion records       | Source of truth in V1             | History and analytics   |
| Journal entries          | Source of truth in V1             | Backup \& cross-device  |
| Templates (Discover)     | Hard-coded JSON initially         | Dynamic from table      |
| isPremium / paywall flag | Local boolean in V1               | Server-driven in future |
| Auth \& accounts         | Out of scope for V1               | Supabase Auth later     |

This should be ready to paste into Cursor as a tech design; if you want, the next step can be a task breakdown ordered by “platform foundations → local data layer → core screens → notifications → Supabase wiring stub.”
<span style="display:none">[^10][^9]</span>

<div align="center">⁂</div>

[^1]: https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native

[^2]: https://docs.expo.dev/guides/using-supabase/

[^3]: https://supabase.com/docs/guides/auth/quickstarts/react-native

[^4]: https://supabase.com/docs/guides/getting-started

[^5]: https://supabase.com/blog/offline-first-flutter-apps

[^6]: https://www.powersync.com/blog/offline-first-apps-made-simple-supabase-powersync

[^7]: https://supabase.com/docs/guides/auth/quickstarts/with-expo-react-native-social-auth

[^8]: https://supabase.com/blog/react-native-storage

[^9]: https://www.youtube.com/watch?v=Bb2zQFbDOG4

[^10]: https://github.com/supabase/supabase/issues/14523
