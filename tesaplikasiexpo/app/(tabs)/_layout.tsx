import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#1E88E5',
      tabBarInactiveTintColor: '#A0A0A0',
      headerShown: false, // Menyembunyikan header bawaan
    }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="home" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Jelajah',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="compass-outline" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="ticket"
        options={{
          title: 'Tiket',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="ticket-confirmation-outline" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="event"
        options={{
          title: 'Acara',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="calendar-month-outline" size={24} color={color} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color }) => <MaterialCommunityIcons name="account-outline" size={24} color={color} />
        }}
      />
    </Tabs>
  );
}