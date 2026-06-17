import { useRouter } from 'expo-router';
import { Drawer } from 'expo-router/drawer';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { theme } from '../../constants/theme';

export default function OrganizerLayout() {
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
      {/* VISIBLE IN SIDEBAR */}
      <Drawer.Screen name="dashboard" options={{ drawerLabel: '🏠 Home', title: 'Organizer Dashboard' }} />
      <Drawer.Screen name="manage-event" options={{ drawerItemStyle: { display: 'none' }, title: 'Event Settings' }} />
      <Drawer.Screen name="notifications" options={{ drawerLabel: 'Notifications', title: 'Notifications' }} />
      
      {/* HIDDEN FROM SIDEBAR (But still accessible via clicks) */}
      <Drawer.Screen name="create-event" options={{ drawerItemStyle: { display: 'none' }, title: 'New Event' }} />
      <Drawer.Screen name="scanner" options={{ drawerItemStyle: { display: 'none' }, title: 'QR Scanner', headerShown: false }} />
      
      {/* The new Management Tools */}
      <Drawer.Screen name="edit-details" options={{ drawerItemStyle: { display: 'none' }, title: 'Edit Details' }} />
      <Drawer.Screen name="send-announcement" options={{ drawerItemStyle: { display: 'none' }, title: 'Send Announcement' }} />
      <Drawer.Screen name="review-refunds" options={{ drawerItemStyle: { display: 'none' }, title: 'Review Refunds' }} />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  logoutBtn: { 
    marginRight: 16, 
    backgroundColor: 'rgba(219, 44, 44, 0.2)', 
    paddingHorizontal: 12, 
    paddingVertical: 6, 
    borderRadius: 8, 
    borderWidth: 1, 
    borderColor: theme.colors.brightRed 
  },
  logoutText: { 
    color: theme.colors.brightRed, 
    fontWeight: '700', 
    fontSize: 12 
  }
});