import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { theme } from '../../constants/theme';
import { API_BASE_URL } from '../../config';
import { EventCreationController } from '../../event/EventCreationController';
import { Event } from '../../event/Event';
import { userSession } from '../../usr/UserSession';
import { Ionicons } from '@expo/vector-icons';

export default function StudentDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState('Harvind');

  const [refreshing, setRefreshing] = useState(false);

  const loadEvents = useCallback(async () => {
    const sessionUser = userSession.getUser();
    try {
      const fetched = await EventCreationController.getPublishedEvents();
      setEvents(fetched);
      
      if (sessionUser?.id) {
        const regRes = await fetch(`${API_BASE_URL}/student/${sessionUser.id}/registrations`);
        if (regRes.ok) {
          const regData = await regRes.json();
          setRegisteredEvents(regData.eventIds || []);
        }
      }
    } catch (error) {
      console.error('[StudentDashboard] Error loading events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadEvents();
    setRefreshing(false);
  }, [loadEvents]);

  useEffect(() => {
    const sessionUser = userSession.getUser();
    if (sessionUser) {
      setStudentName(sessionUser.name);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.white} />
          }
        >
          
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              <Text style={[styles.greeting, { marginBottom: 0, marginRight: 8 }]}>Hello, {studentName}</Text>
              <Ionicons name="hand-right" size={24} color="#FFD700" />
            </View>
            <Text style={styles.pageTitle}>Discover Events</Text>
          </View>

          {/* Route: Student E-Pass Wallet */}
          <Pressable style={styles.walletButton} onPress={() => router.push('/(student)/wallet')}>
            <Ionicons name="ticket" size={20} color={theme.colors.white} style={{ marginRight: 8 }} />
            <Text style={styles.walletButtonText}>Open My E-Pass Wallet</Text>
          </Pressable>

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.brightRed} style={{ marginTop: 40 }} />
          ) : events.length === 0 ? (
            <Text style={{ color: theme.colors.textMuted, textAlign: 'center', fontSize: 16, marginTop: 40 }}>
              No events published yet. Check back later!
            </Text>
          ) : (
            events.map((event) => {
              const formattedPrice = event.basePrice === 0 ? 'Free' : `RM ${event.basePrice.toFixed(2)}`;
              
              // Helper to parse dates nicely (handles ISO string or Date objects)
              const eventDateObj = new Date(event.date);
              const formattedDate = isNaN(eventDateObj.getTime()) 
                ? event.date 
                : eventDateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

              const navParams = {
                id: event.id,
                title: event.title,
                description: event.description,
                date: formattedDate,
                price: formattedPrice,
                rawPrice: event.basePrice.toString(),
                capacity: event.capacity.toString(),
                organizerId: event.organizerId,
                isRegistered: registeredEvents.includes(event.id) ? 'true' : 'false'
              };

              return (
                <Pressable 
                  key={event.id} 
                  style={[theme.glassmorphism, styles.eventCard]}
                  onPress={() => router.push({
                    pathname: '/(student)/event-details',
                    params: navParams
                  })}
                >
                  <View style={styles.eventHeader}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <View style={styles.priceTag}>
                      <Text style={styles.priceText}>{formattedPrice}</Text>
                    </View>
                  </View>
                  <Text style={styles.eventDate}>📅 {formattedDate}</Text>
                  <Text style={styles.eventCapacity}>🎟️ {event.capacity} Spots Total</Text>
                  
                  {/* Route: Event Details Page */}
                  {registeredEvents.includes(event.id) ? (
                    <Pressable 
                      style={[styles.buyButton, { backgroundColor: 'rgba(255,255,255,0.1)' }]} 
                      onPress={() => router.push('/(student)/wallet')}
                    >
                      <Text style={[styles.buyButtonText, { color: theme.colors.white }]}>Joined</Text>
                    </Pressable>
                  ) : (
                    <Pressable 
                      style={styles.buyButton} 
                      onPress={() => router.push({
                        pathname: '/(student)/event-details',
                        params: navParams
                      })}
                    >
                      <Text style={styles.buyButtonText}>Get E-Pass</Text>
                    </Pressable>
                  )}
                </Pressable>
              );
            })
          )}

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
  walletButton: { backgroundColor: 'rgba(255,255,255,0.1)', padding: 16, borderRadius: 12, marginBottom: 30, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
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