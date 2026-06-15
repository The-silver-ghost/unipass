import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../constants/theme';

export default function OrganizerDashboard() {
  const router = useRouter();

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.greeting}>Organizer Portal</Text>
            <Text style={styles.pageTitle}>My Dashboard</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[theme.glassmorphism, styles.statBox]}>
              <Text style={styles.statNumber}>412</Text>
              <Text style={styles.statLabel}>Tickets Sold</Text>
            </View>
            <View style={[theme.glassmorphism, styles.statBox]}>
              <Text style={styles.statNumber}>RM 2.4k</Text>
              <Text style={styles.statLabel}>Net Revenue</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Events</Text>
            
            {/* Route: Create New Event Form */}
            <Pressable onPress={() => router.push('/(organizer)/create-event')}>
              <Text style={styles.createLink}>+ New Event</Text>
            </Pressable>
          </View>

          <View style={[theme.glassmorphism, styles.eventCard]}>
            <Text style={styles.eventTitle}>Campus Music Fest</Text>
            <Text style={styles.eventDate}>Nov 05, 2026 • 500 Capacity</Text>
            <View style={styles.actionRow}>
              
              {/* Route: QR Code Scanner */}
              <Pressable style={styles.actionButtonPrimary} onPress={() => router.push('/(organizer)/scanner')}>
                <Text style={styles.actionTextPrimary}>Scan QR</Text>
              </Pressable>
              
              {/* Route: Event Management Hub */}
              <Pressable style={styles.actionButtonSecondary} onPress={() => router.push('/(organizer)/manage-event')}>
                <Text style={styles.actionTextSecondary}>Manage</Text>
              </Pressable>
              
            </View>
          </View>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 30 },
  greeting: { color: theme.colors.brightRed, fontSize: 16, fontWeight: '600', marginBottom: 4, textTransform: 'uppercase' },
  pageTitle: { color: theme.colors.white, fontSize: 32, fontWeight: '800' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  statBox: { width: '48%', padding: 20, alignItems: 'center' },
  statNumber: { color: theme.colors.white, fontSize: 28, fontWeight: '800', marginBottom: 4 },
  statLabel: { color: theme.colors.textMuted, fontSize: 14 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '700' },
  createLink: { color: theme.colors.brightRed, fontWeight: '700', fontSize: 16 },
  eventCard: { padding: 20 },
  eventTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  eventDate: { color: theme.colors.textMuted, fontSize: 14, marginBottom: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButtonPrimary: { backgroundColor: theme.colors.brightRed, flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  actionTextPrimary: { color: theme.colors.white, fontWeight: '800' },
  actionButtonSecondary: { backgroundColor: 'transparent', flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.white, alignItems: 'center' },
  actionTextSecondary: { color: theme.colors.white, fontWeight: '800' },
});