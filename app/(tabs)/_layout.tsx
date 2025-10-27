import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { Pressable, TouchableOpacity } from 'react-native';

import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useAuthStore } from '../../src/store/authStore';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { signOut } = useAuthStore();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563eb', // Primary blue
        tabBarInactiveTintColor: '#64748b', // Secondary gray
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? '#1e293b' : '#ffffff',
          borderTopColor: colorScheme === 'dark' ? '#334155' : '#e2e8f0',
        },
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: useClientOnlyValue(false, true),
      }}>
      
      <Tabs.Screen
        name="index"
        options={{
          title: 'Matches',
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
          headerTitle: 'Your Matches',
          headerRight: () => (
            <TouchableOpacity onPress={signOut}>
              <FontAwesome
                name="sign-out"
                size={22}
                color={Colors[colorScheme ?? 'light'].text}
                style={{ marginRight: 15 }}
              />
            </TouchableOpacity>
          ),
        }}
      />
      
      <Tabs.Screen
        name="discover"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
          headerTitle: 'Discover Peers',
        }}
      />
      
      <Tabs.Screen
        name="requests"
        options={{
          title: 'Requests',
          tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
          headerTitle: 'Peer Requests',
        }}
      />
      
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color }) => <TabBarIcon name="comments" color={color} />,
          headerTitle: 'Messages',
        }}
      />
      
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerTitle: 'My Profile',
        }}
      />
    </Tabs>
  );
}
