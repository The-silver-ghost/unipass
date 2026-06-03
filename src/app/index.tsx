import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';

export default function DevLaunchpad() {
  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.header}>🧪 Dev Launchpad</Text>
          <Text style={styles.subtext}>Tap a link to test your new UI screens.</Text>

          <Text style={styles.sectionTitle}>Organizer Screens</Text>
          <Link href="/(organizer)/manage-event" style={styles.linkCard}>
            <Text style={styles.linkText}>Manage Event (Dashboard)</Text>
          </Link>
          <Link href="/(organizer)/create-event" style={styles.linkCard}>
            <Text style={styles.linkText}>Create Event</Text>
          </Link>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  header: { color: theme.colors.white, fontSize: 32, fontWeight: '900', marginBottom: 8 },
  subtext: { color: 'rgba(255,255,255,0.6)', fontSize: 16, marginBottom: 30 },
  sectionTitle: { color: theme.colors.brightRed, fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  linkCard: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: 12 },
  linkText: { color: theme.colors.white, fontSize: 16, fontWeight: '600' }
});