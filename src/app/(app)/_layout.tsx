import { Redirect, SplashScreen, Tabs } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useCallback, useEffect } from 'react';

import { FloatingAddButton } from '@/components/floating-add-button';
import { View } from '@/components/ui';
import colors from '@/components/ui/colors';
import {
  Discover as DiscoverIcon,
  Home as HomeIcon,
  Journal as JournalIcon,
  User as UserIcon,
} from '@/components/ui/icons';
import { useIsFirstTime } from '@/lib';

function getTabBarStyle(isDark: boolean) {
  return {
    backgroundColor: isDark ? colors.charcoal[950] : '#FFFFFF',
    borderTopWidth: 0,
    paddingTop: 8,
    height: 88,
    elevation: 0,
    shadowOpacity: 0,
  };
}

const TAB_BAR_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: '500' as const,
};

function useSplashScreen() {
  const hideSplash = useCallback(async () => {
    await SplashScreen.hideAsync();
  }, []);

  useEffect(() => {
    setTimeout(() => {
      hideSplash();
    }, 1000);
  }, [hideSplash]);
}

function TabScreens(): React.ReactElement {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View className="flex-1">
      <Tabs
        screenOptions={{
          tabBarStyle: getTabBarStyle(isDark),
          tabBarActiveTintColor: colors.primary[500],
          tabBarInactiveTintColor: isDark ? colors.charcoal[500] : '#9CA3AF',
          tabBarLabelStyle: TAB_BAR_LABEL_STYLE,
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
            tabBarIcon: ({ color }) => <HomeIcon color={color} />,
            tabBarButtonTestID: 'today-tab',
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: 'Stats',
            headerShown: false,
            tabBarIcon: ({ color }) => <JournalIcon color={color} />,
            tabBarButtonTestID: 'journal-tab',
          }}
        />
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Social',
            headerShown: false,
            tabBarIcon: ({ color }) => <DiscoverIcon color={color} />,
            tabBarButtonTestID: 'discover-tab',
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Settings',
            headerShown: false,
            tabBarIcon: ({ color }) => <UserIcon color={color} />,
            tabBarButtonTestID: 'profile-tab',
          }}
        />
        {/* Hidden screens */}
        <Tabs.Screen name="add" options={{ href: null }} />
        <Tabs.Screen name="settings" options={{ href: null }} />
      </Tabs>
      <FloatingAddButton />
    </View>
  );
}

export default function TabLayout(): React.ReactElement {
  const [isFirstTime] = useIsFirstTime();
  useSplashScreen();

  if (isFirstTime) {
    return <Redirect href="/onboarding" />;
  }

  return <TabScreens />;
}
