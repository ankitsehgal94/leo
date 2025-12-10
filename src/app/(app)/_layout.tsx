import { Redirect, SplashScreen, Tabs } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import { View } from '@/components/ui';
import {
  Discover as DiscoverIcon,
  Home as HomeIcon,
  Journal as JournalIcon,
  Plus as PlusIcon,
  User as UserIcon,
} from '@/components/ui/icons';
import { useIsFirstTime } from '@/lib';

const TAB_BAR_STYLE = {
  backgroundColor: '#FAFAF8',
  borderTopWidth: 1,
  borderTopColor: '#E5E5E0',
  paddingTop: 8,
  height: 88,
};

const TAB_BAR_LABEL_STYLE = {
  fontSize: 11,
  fontWeight: '500' as const,
};

function AddTabIcon({ focused }: { focused: boolean }): React.ReactElement {
  return (
    <View
      className={`-mt-4 size-14 items-center justify-center rounded-full ${
        focused ? 'bg-primary-500' : 'bg-primary-400'
      }`}
    >
      <PlusIcon color="#FFFFFF" />
    </View>
  );
}

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
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: TAB_BAR_STYLE,
        tabBarActiveTintColor: '#FF7B1A',
        tabBarInactiveTintColor: '#737373',
        tabBarLabelStyle: TAB_BAR_LABEL_STYLE,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Today',
          headerShown: false,
          tabBarIcon: ({ color }) => <HomeIcon color={color} />,
          tabBarButtonTestID: 'today-tab',
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          headerShown: false,
          tabBarIcon: ({ color }) => <JournalIcon color={color} />,
          tabBarButtonTestID: 'journal-tab',
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          headerShown: false,
          tabBarIcon: AddTabIcon,
          tabBarButtonTestID: 'add-tab',
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          headerShown: false,
          tabBarIcon: ({ color }) => <DiscoverIcon color={color} />,
          tabBarButtonTestID: 'discover-tab',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color }) => <UserIcon color={color} />,
          tabBarButtonTestID: 'profile-tab',
        }}
      />
      <Tabs.Screen name="settings" options={{ href: null }} />
    </Tabs>
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
