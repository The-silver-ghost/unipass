import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function ManageEventDashboard() {
  const router = useRouter();

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
            <Text style={styles.pageTitle}>Manage Event</Text>
          </View>

          <Text style={styles.eventSubtitle}>Campus Music Fest</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>412</Text>
              <Text style={styles.statLabel}>Sold / 500</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>3</Text>
              <Text style={styles.statLabel}>Pending Refunds</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Event Tools</Text>

          <View style={styles.gridContainer}>
            <Pressable style={styles.gridItem} onPress={() => router.push('/(organizer)/edit-details')}>
              <Text style={styles.gridIcon}>✏️</Text>
              <Text style={styles.gridText}>Edit Details</Text>
            </Pressable>

            <Pressable style={styles.gridItem} onPress={() => router.push('/(organizer)/send-announcement')}>
              <Text style={styles.gridIcon}>📣</Text>
              <Text style={styles.gridText}>Send Announcement</Text>
            </Pressable>

            <Pressable style={styles.gridItem} onPress={() => router.push('/(organizer)/review-refunds')}>
              <Text style={styles.gridIcon}>💸</Text>
              <Text style={styles.gridText}>Review Refunds</Text>
            </Pressable>

            <Pressable style={styles.gridItem} onPress={() => console.log('Exporting...')}>
              <Text style={styles.gridIcon}>📥</Text>
              <Text style={styles.gridText}>Export Roster</Text>
            </Pressable>
          </View>

          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>DANGER ZONE</Text>
            <Pressable style={styles.dangerButton}>
              <Text style={styles.dangerButtonText}>Cancel Event (Mass Refund)</Text>
            </Pressable>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 40, paddingBottom: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 16, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backButtonText: { color: theme.colors.white, fontWeight: '700', fontSize: 14 },
  pageTitle: { color: theme.colors.white, fontSize: 28, fontWeight: '900' },
  eventSubtitle: { color: theme.colors.brightRed, fontSize: 20, fontWeight: '800', marginBottom: 20 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 20, alignItems: 'center', marginHorizontal: 4 },
  statNumber: { color: theme.colors.white, fontSize: 28, fontWeight: '900', marginBottom: 4 },
  statLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 12, fontWeight: '600' },
  sectionTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '800', marginBottom: 16 },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12, marginBottom: 40 },
  gridItem: { width: '48%', backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16, padding: 24, alignItems: 'center', justifyContent: 'center' },
  gridIcon: { fontSize: 32, marginBottom: 12 },
  gridText: { color: theme.colors.white, fontSize: 14, fontWeight: '700', textAlign: 'center' },
  dangerZone: { borderWidth: 1, borderColor: theme.colors.brightRed, borderRadius: 16, padding: 20, backgroundColor: 'rgba(219, 44, 44, 0.05)' },
  dangerTitle: { color: theme.colors.brightRed, fontSize: 14, fontWeight: '900', marginBottom: 16, letterSpacing: 1 },
  dangerButton: { backgroundColor: theme.colors.brightRed, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  dangerButtonText: { color: theme.colors.white, fontWeight: '800', fontSize: 16 }
});