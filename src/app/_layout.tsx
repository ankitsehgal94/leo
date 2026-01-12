// Import  global CSS file
import '../../global.css';

import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React from 'react';
import { StyleSheet } from 'react-native';
import FlashMessage from 'react-native-flash-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { APIProvider } from '@/api';
import {
  hydrateHabits,
  hydrateJournal,
  hydrateUser,
  loadSelectedTheme,
  useFonts,
} from '@/lib';
import { addNotificationResponseReceivedListener } from '@/lib/notifications';
import { useThemeConfig } from '@/lib/use-theme-config';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(app)',
};

loadSelectedTheme();
hydrateHabits();
hydrateJournal();
hydrateUser();
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. This is optional.
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  const fontsLoaded = useFonts();
  const router = useRouter();

  // Keep splash screen visible until fonts are loaded
  React.useEffect(() => {
    if (fontsLoaded) {
      // Fonts are loaded, splash screen will be hidden by the app layout
    }
  }, [fontsLoaded]);

  // Handle notification taps - navigate to habit detail
  React.useEffect(() => {
    const subscription = addNotificationResponseReceivedListener((response) => {
      const habitId = response.notification.request.content.data?.habitId as
        | string
        | undefined;
      if (habitId) {
        router.push(`/habit/${habitId}`);
      }
    });

    return () => subscription.remove();
  }, [router]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <Providers>
      <Stack>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
        <Stack.Screen name="habit/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="habit/add" options={{ headerShown: false }} />
        <Stack.Screen name="reflection/add" options={{ headerShown: false }} />
        <Stack.Screen name="paywall" options={{ headerShown: false }} />
      </Stack>
    </Providers>
  );
}

function Providers({ children }: { children: React.ReactNode }) {
  const theme = useThemeConfig();
  return (
    <GestureHandlerRootView
      style={styles.container}
      className={theme.dark ? `dark` : undefined}
    >
      <KeyboardProvider>
        <ThemeProvider value={theme}>
          <APIProvider>
            <BottomSheetModalProvider>
              {children}
              <FlashMessage position="top" />
            </BottomSheetModalProvider>
          </APIProvider>
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
