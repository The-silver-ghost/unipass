import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { StyleSheet, Text, View, ScrollView,  Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../constants/theme';

export default function EventDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Extract params with safe defaults
  const id = params.id as string || '';
  const title = params.title as string || 'Event Details';
  const description = params.description as string || '';
  const date = params.date as string || '';
  const price = params.price as string || 'Free';
  const rawPrice = params.rawPrice as string || '0';
  const capacity = params.capacity as string || '0';
  const organizerId = params.organizerId as string || '';
  const isRegistered = params.isRegistered === 'true';

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back to Events</Text>
          </Pressable>

          <View style={styles.heroSection}>
            <View style={styles.organizerBadge}>
              <Text style={styles.organizerText}>Event Details</Text>
            </View>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.price}>{price}</Text>
          </View>

          <View style={[theme.glassmorphism, styles.detailsCard]}>
            <Text style={styles.sectionHeader}>Event Details</Text>
            <Text style={styles.infoRow}>📅 Date: {date}</Text>
            <Text style={styles.infoRow}>📍 Venue: MMU Campus (General Admission)</Text>
            <Text style={styles.infoRow}>🎟️ Capacity: {capacity} Spots</Text>
            
            <Text style={styles.description}>
              {description || 'No description provided for this event.'}
            </Text>
          </View>

        </ScrollView>
        
        {/* Sticky Bottom Checkout Bar */}
        <View style={styles.stickyBottom}>
          {isRegistered ? (
            <Pressable 
              style={[styles.checkoutButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]} 
              onPress={() => router.push('/(student)/wallet')}
            >
              <Text style={[styles.checkoutButtonText, { color: theme.colors.white }]}>Joined - View E-Pass</Text>
            </Pressable>
          ) : (
            <Pressable 
              style={styles.checkoutButton} 
              onPress={() => router.push({
                pathname: '/(student)/checkout',
                params: {
                  id,
                  title,
                  price,
                  rawPrice,
                  date,
                  capacity,
                  organizerId
                }
              })}
            >
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </Pressable>
          )}
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