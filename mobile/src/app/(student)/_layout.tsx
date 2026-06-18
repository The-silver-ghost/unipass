import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
      <Drawer.Screen 
        name="dashboard" 
        options={{ 
          drawerLabel: 'Home', 
          title: 'Discover Events',
          drawerIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} />
        }} 
      />
      <Drawer.Screen 
        name="wallet" 
        options={{ 
          drawerLabel: 'My E-Passes', 
          title: 'E-Pass Wallet',
          drawerIcon: ({ color, size }) => <Ionicons name="ticket" color={color} size={size} />
        }} 
      />
      <Drawer.Screen 
        name="notifications" 
        options={{ 
          drawerLabel: 'Notifications', 
          title: 'Notifications',
          drawerIcon: ({ color, size }) => <Ionicons name="notifications" color={color} size={size} />
        }} 
      />
      <Drawer.Screen name="event-details" options={{ drawerItemStyle: { display: 'none' }, title: 'Event Details' }} />
      <Drawer.Screen name="checkout" options={{ drawerItemStyle: { display: 'none' }, title: 'Checkout' }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  logoutBtn: { marginRight: 16, backgroundColor: 'rgba(219, 44, 44, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.brightRed },
  logoutText: { color: theme.colors.brightRed, fontWeight: '700', fontSize: 12 }
});