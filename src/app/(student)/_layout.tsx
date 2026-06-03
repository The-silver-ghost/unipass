import React from 'react';
import { Drawer } from 'expo-router/drawer';
import { Pressable, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function StudentLayout() {
  const router = useRouter();

  return (
    <Drawer
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.bg, shadowColor: 'transparent', elevation: 0 },
        headerTintColor: theme.colors.white,
        headerTitleStyle: { fontWeight: 'bold' },
        drawerActiveBackgroundColor: 'rgba(219, 44, 44, 0.2)',
        drawerActiveTintColor: theme.colors.brightRed,
        drawerInactiveTintColor: theme.colors.white,
        drawerStyle: { backgroundColor: theme.colors.bgDark, width: 250 },
        headerRight: () => (
          <Pressable style={styles.logoutBtn} onPress={() => router.replace('/')}>
            <Text style={styles.logoutText}>Log Out</Text>
          </Pressable>
        ),
      }}
    >
      <Drawer.Screen name="wallet" options={{ drawerLabel: '🎟️ My E-Passes', title: 'Wallet' }} />
      <Drawer.Screen name="notifications" options={{ drawerLabel: '🔔 Notifications', title: 'Notifications' }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  logoutBtn: { marginRight: 16, backgroundColor: 'rgba(219, 44, 44, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.brightRed },
  logoutText: { color: theme.colors.brightRed, fontWeight: '700', fontSize: 12 }
});