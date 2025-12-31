# Leo iOS Widget

This directory contains the iOS widget extension for the Leo habit tracker app.

## Widget Types

The widget supports three sizes:

### Small Widget (2x2)

- Shows a progress ring with completed/total habits
- Displays current streak

### Medium Widget (4x2)

- Progress ring on the left
- List of up to 4 habits with completion status
- Streak counter

### Large Widget (4x4)

- Full habit list grouped by time of day (Morning, Afternoon, Evening)
- Header with completion stats and streak

## Setup Instructions

### 1. Install expo-apple-targets

```bash
npx expo install expo-apple-targets
```

### 2. Add the plugin to app.config.ts

```typescript
plugins: [
  // ... other plugins
  [
    'expo-apple-targets',
    {
      appleTeamId: 'YOUR_TEAM_ID', // Your Apple Developer Team ID
    },
  ],
],
```

### 3. Configure App Group in Apple Developer Portal

1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to Certificates, Identifiers & Profiles → Identifiers
3. Select your app identifier (com.leo)
4. Enable "App Groups" capability
5. Create a new App Group: `group.com.leo.shared`
6. Add the App Group to your app identifier

### 4. Prebuild and run

```bash
# Clean and prebuild
pnpm prebuild --clean

# Run on iOS
pnpm ios
```

### 5. Add Widget to Home Screen

1. Long press on the home screen
2. Tap the + button in the top left
3. Search for "Leo"
4. Choose your preferred widget size
5. Tap "Add Widget"

## How Data Sync Works

1. The React Native app stores habit data in MMKV with App Group enabled
2. When habits or completions change, `useWidgetSync` hook updates the shared data
3. The widget reads from the same App Group storage using UserDefaults
4. Widget refreshes every 15 minutes or when iOS decides to update it

## File Structure

```
targets/widget/
├── LeoWidget.swift      # Main widget code with all views
├── WidgetBundle.swift   # Widget bundle entry point
├── expo-target.config.js # Expo Apple Targets configuration
└── README.md            # This file
```

## Troubleshooting

### Widget shows placeholder data

- Make sure the app has been opened at least once after installation
- Check that App Groups are properly configured in both the app and widget

### Widget doesn't update

- iOS controls when widgets refresh
- Force refresh by removing and re-adding the widget
- Check the app logs for any data sync errors

### Build errors

- Run `pnpm prebuild --clean` to regenerate native code
- Ensure your Apple Developer Team ID is correct
- Verify App Group identifier matches in all places
