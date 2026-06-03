import React from 'react';
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* The Dev Launchpad */}
      <Stack.Screen name="index" />
      
      {/* The Role-Based Drawer Navigators */}
      <Stack.Screen name="(organizer)" />
      <Stack.Screen name="(student)" />
    </Stack>
  );
}