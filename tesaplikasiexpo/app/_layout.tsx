import { Stack } from 'expo-router';
import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      // Sembunyikan navigation bar bawaan HP
      NavigationBar.setVisibilityAsync('hidden');
      // Muncul hanya saat swipe dari bawah, lalu otomatis sembunyi lagi
      NavigationBar.setBehaviorAsync('overlay-swipe');
    }
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}