import React, { useState, useEffect } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View, ActivityIndicator, Alert } from 'react-native';
import { theme } from '../../constants/theme';
import { EventCreationController } from '../../event/EventCreationController';
import { Event } from '../../event/Event';
import { userSession } from '../../usr/UserSession';

export default function OrganizerDashboard() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [organizerName, setOrganizerName] = useState('Organizer');

  const sessionUser = userSession.getUser();
  const organizerId = sessionUser?.id || '41e2bc68-e878-4713-9726-9aafffc0af71'; // Fallback for developer testing

  useFocusEffect(
    React.useCallback(() => {
      if (sessionUser) {
        setOrganizerName(sessionUser.name);
      }

      async function loadEvents() {
        setLoading(true);
        try {
          const fetched = await EventCreationController.getEventsByOrganizer(organizerId);
          setEvents(fetched);
        } catch (error) {
          console.error('[OrganizerDashboard] Error fetching events:', error);
        } finally {
          setLoading(false);
        }
      }

      loadEvents();
    }, [organizerId])
  );

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.header}>
            <Text style={styles.greeting}>{organizerName} Portal</Text>
            <Text style={styles.pageTitle}>My Dashboard</Text>
          </View>

          <View style={styles.statsRow}>
            <View style={[theme.glassmorphism, styles.statBox]}>
              <Text style={styles.statNumber}>{events.length}</Text>
              <Text style={styles.statLabel}>Active Events</Text>
            </View>
            <View style={[theme.glassmorphism, styles.statBox]}>
              <Text style={styles.statNumber}>RM 0.00</Text>
              <Text style={styles.statLabel}>Total Net Revenue</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Active Events</Text>
            
            {/* Route: Create New Event Form */}
            <Pressable onPress={() => router.push('/(organizer)/create-event')}>
              <Text style={styles.createLink}>+ New Event</Text>
            </Pressable>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color={theme.colors.brightRed} style={{ marginTop: 20 }} />
          ) : events.length === 0 ? (
            <View style={[theme.glassmorphism, { padding: 30, alignItems: 'center' }]}>
              <Text style={{ color: theme.colors.textMuted, fontSize: 16, textAlign: 'center', marginBottom: 12 }}>
                You haven't created any events yet!
              </Text>
              <Pressable style={styles.createBtnInline} onPress={() => router.push('/(organizer)/create-event')}>
                <Text style={styles.createBtnInlineText}>Publish Your First Event</Text>
              </Pressable>
            </View>
          ) : (
            events.map((event) => {
              const eventDateObj = new Date(event.date);
              const formattedDate = isNaN(eventDateObj.getTime())
                ? event.date
                : eventDateObj.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });

              const detailsParams = {
                id: event.id,
                title: event.title,
                description: event.description,
                date: formattedDate,
                price: event.basePrice === 0 ? 'Free' : `RM ${event.basePrice.toFixed(2)}`,
                capacity: event.capacity.toString(),
                organizerId: event.organizerId
              };

              return (
                <View key={event.id} style={[theme.glassmorphism, styles.eventCard]}>
                  <Text style={styles.eventTitle}>{event.title}</Text>
                  <Text style={styles.eventDate}>{formattedDate} • {event.capacity} Capacity</Text>
                  <View style={styles.actionRow}>
                    {event.status === 'Cancelled' ? (
                      <Pressable 
                        style={[styles.actionButtonPrimary, { backgroundColor: theme.colors.brightRed }]} 
                        onPress={() => {
                          const canDelete = event.basePrice === 0;
                          if (!canDelete) {
                            Alert.alert("Cannot Delete", "Delete event is only allowed if all participants have been refunded, unless the event was free or no one has registered.");
                            return;
                          }
                          
                          Alert.alert(
                            "Delete Event",
                            "Are you sure you want to permanently delete this cancelled event?",
                            [
                              { text: "Cancel", style: "cancel" },
                              { 
                                text: "Delete", 
                                style: "destructive",
                                onPress: async () => {
                                  try {
                                    await EventCreationController.deleteEvent(event.id);
                                    setEvents(events.filter(e => e.id !== event.id));
                                  } catch (e: any) {
                                    Alert.alert("Error", e.message);
                                  }
                                }
                              }
                            ]
                          );
                        }}
                      >
                        <Text style={styles.actionTextPrimary}>Delete Event</Text>
                      </Pressable>
                    ) : (
                      <>
                        {/* Route: QR Code Scanner */}
                        <Pressable style={styles.actionButtonPrimary} onPress={() => router.push('/(organizer)/scanner')}>
                          <Text style={styles.actionTextPrimary}>Scan QR</Text>
                        </Pressable>
                        
                        {/* Route: Event Management Hub */}
                        <Pressable 
                          style={styles.actionButtonSecondary} 
                          onPress={() => router.push({
                            pathname: '/(organizer)/manage-event',
                            params: detailsParams
                          })}
                        >
                          <Text style={styles.actionTextSecondary}>Manage</Text>
                        </Pressable>
                      </>
                    )}
                  </View>
                </View>
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
  eventCard: { padding: 20, marginBottom: 16 },
  eventTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '700', marginBottom: 4 },
  eventDate: { color: theme.colors.textMuted, fontSize: 14, marginBottom: 20 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionButtonPrimary: { backgroundColor: theme.colors.brightRed, flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginRight: 10 },
  actionTextPrimary: { color: theme.colors.white, fontWeight: '800' },
  actionButtonSecondary: { backgroundColor: 'transparent', flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: theme.colors.white, alignItems: 'center' },
  actionTextSecondary: { color: theme.colors.white, fontWeight: '800' },
  createBtnInline: { backgroundColor: theme.colors.white, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, marginTop: 8 },
  createBtnInlineText: { color: theme.colors.brightRed, fontWeight: '800', fontSize: 14 },
});