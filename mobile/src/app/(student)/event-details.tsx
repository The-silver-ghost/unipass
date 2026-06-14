import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function EventDetailsScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Events</Text>
          </Pressable>

          <View style={styles.heroSection}>
            <View style={styles.organizerBadge}>
              <Text style={styles.organizerText}>By: IT Society</Text>
            </View>
            <Text style={styles.title}>Campus Music Fest</Text>
            <Text style={styles.price}>RM 15.00</Text>
          </View>

          <View style={[theme.glassmorphism, styles.detailsCard]}>
            <Text style={styles.sectionHeader}>Event Details</Text>
            <Text style={styles.infoRow}>📅 Date: Thursday, Nov 05, 2026</Text>
            <Text style={styles.infoRow}>🕒 Time: 6:00 PM - 11:00 PM</Text>
            <Text style={styles.infoRow}>📍 Venue: Main Hall (General Admission)</Text>
            <Text style={styles.infoRow}>🎟️ Capacity: 500 Spots</Text>
            
            <Text style={styles.description}>
              Join us for the biggest campus music festival of the year! Featuring live performances from local student bands, DJ sets, and food stalls. 
            </Text>
          </View>

        </ScrollView>
        
        {/* Sticky Bottom Checkout Bar */}
        <View style={styles.stickyBottom}>
          <Pressable style={styles.checkoutButton} onPress={() => router.push('/(student)/checkout')}>
            <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 40, paddingBottom: 100 },
  backButton: { alignSelf: 'flex-start', padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8, marginBottom: 30 },
  backButtonText: { color: theme.colors.white, fontWeight: '600' },
  
  heroSection: { marginBottom: 30 },
  organizerBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(219, 44, 44, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.brightRed, marginBottom: 12 },
  organizerText: { color: theme.colors.brightRed, fontWeight: '700', fontSize: 12 },
  title: { color: theme.colors.white, fontSize: 40, fontWeight: '800', lineHeight: 46, marginBottom: 8 },
  price: { color: theme.colors.white, fontSize: 24, fontWeight: '600', opacity: 0.9 },
  
  detailsCard: { padding: 24 },
  sectionHeader: { color: theme.colors.white, fontSize: 20, fontWeight: '700', marginBottom: 16 },
  infoRow: { color: theme.colors.textMuted, fontSize: 16, marginBottom: 10, fontWeight: '500' },
  description: { color: theme.colors.white, fontSize: 16, lineHeight: 24, marginTop: 16, opacity: 0.8 },
  
  stickyBottom: { position: 'absolute', bottom: 0, width: '100%', padding: 24, backgroundColor: theme.colors.bgDark, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)' },
  checkoutButton: { backgroundColor: theme.colors.white, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  checkoutButtonText: { color: theme.colors.brightRed, fontWeight: '800', fontSize: 18 },
});