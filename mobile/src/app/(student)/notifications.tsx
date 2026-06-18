import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView,  Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { API_BASE_URL } from '../../config';
import { userSession } from '../../usr/UserSession';

export default function StudentNotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const user = userSession.getUser();
        if (!user) return;
        const res = await fetch(`${API_BASE_URL}/notifications/${user.id}`);
        const data = await res.json();
        if (data.notifications) {
          setNotifications(data.notifications);
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchNotifications();
  }, []);

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.pageTitle}>Notifications</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {notifications.length === 0 ? (
            <Text style={{ color: 'white', textAlign: 'center', marginTop: 50 }}>No new notifications.</Text>
          ) : (
            notifications.map((notif) => (
              <View key={notif.id} style={[theme.glassmorphism, styles.card, notif.isUnread && styles.unreadCard]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, notif.isUnread && styles.unreadText]}>{notif.title}</Text>
                  <Text style={styles.timeText}>{notif.time}</Text>
                </View>
                <Text style={styles.messageText}>{notif.message}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, paddingBottom: 10 },
  backButton: { marginRight: 16, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backButtonText: { color: theme.colors.white, fontWeight: '600' },
  pageTitle: { color: theme.colors.white, fontSize: 28, fontWeight: '800' },
  scrollContent: { padding: 24, paddingTop: 10 },
  card: { padding: 16, marginBottom: 16, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  unreadCard: { borderColor: theme.colors.brightRed, backgroundColor: 'rgba(219, 44, 44, 0.05)' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
  unreadText: { color: theme.colors.brightRed },
  timeText: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  messageText: { color: 'rgba(255,255,255,0.7)', fontSize: 14, lineHeight: 20 },
});