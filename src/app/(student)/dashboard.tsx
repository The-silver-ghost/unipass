import React from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

const upcomingEvents = [
  { id: '1', title: 'MMU Tech Symposium', date: 'Oct 12, 2026', price: 'Free', capacity: '250' },
  { id: '2', title: 'Campus Music Fest', date: 'Nov 05, 2026', price: 'RM 15.00', capacity: '500' },
  { id: '3', title: 'Coding Bootcamp', date: 'Nov 18, 2026', price: 'RM 10.00', capacity: '50' },
];

export default function StudentDashboard() {
  const router = useRouter();

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.greeting}>Hello, Harvind 👋</Text>
            <Text style={styles.pageTitle}>Discover Events</Text>
          </View>

          {/* Route: Student E-Pass Wallet */}
          <Pressable style={styles.walletButton} onPress={() => router.push('/(student)/wallet')}>
            <Text style={styles.walletButtonText}>🎟️ Open My E-Pass Wallet</Text>
          </Pressable>

          {upcomingEvents.map((event) => (
            <Pressable key={event.id} style={[theme.glassmorphism, styles.eventCard]}>
              <View style={styles.eventHeader}>
                <Text style={styles.eventTitle}>{event.title}</Text>
                <View style={styles.priceTag}>
                  <Text style={styles.priceText}>{event.price}</Text>
                </View>
              </View>
              <Text style={styles.eventDate}>📅 {event.date}</Text>
              <Text style={styles.eventCapacity}>🎟️ {event.capacity} Spots Total</Text>
              
              {/* Route: Event Details Page */}
              <Pressable style={styles.buyButton} onPress={() => router.push('/(student)/event-details')}>
                <Text style={styles.buyButtonText}>Get E-Pass</Text>
              </Pressable>
            </Pressable>
          ))}

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 20 },
  greeting: { color: theme.colors.textMuted, fontSize: 16, marginBottom: 4 },
  pageTitle: { color: theme.colors.white, fontSize: 32, fontWeight: '800' },
  walletButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: 30, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  walletButtonText: { color: theme.colors.white, fontWeight: '700', fontSize: 16 },
  eventCard: { padding: 20, marginBottom: 20 },
  eventHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  eventTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '700', flex: 1, paddingRight: 10 },
  priceTag: { backgroundColor: 'rgba(219, 44, 44, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: theme.colors.brightRed },
  priceText: { color: theme.colors.brightRed, fontWeight: '700' },
  eventDate: { color: theme.colors.textMuted, fontSize: 14, marginBottom: 6 },
  eventCapacity: { color: theme.colors.textMuted, fontSize: 14, marginBottom: 20 },
  buyButton: { backgroundColor: theme.colors.white, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  buyButtonText: { color: theme.colors.brightRed, fontWeight: '800', fontSize: 16 },
});