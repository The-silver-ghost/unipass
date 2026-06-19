import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView,  Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { theme } from '../../constants/theme';
import { EventCreationController } from '../../event/EventCreationController';
import { userSession } from '../../usr/UserSession';
import { API_BASE_URL } from '../../config';
import { useDebugPause, triggerTerminalResume } from '../../utils/debugPause';
import { EPassManager } from '../../epass/EPassManager';

export default function ManageEventDashboard() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { pauseDebug } = useDebugPause();

  const eventId = params.id as string;
  const title = params.title as string || 'Event Details';
  const capacity = params.capacity as string || '0';
  const participantCount = params.participantCount as string || '0';
  const price = params.price as string || 'Free';

  const [isCancelling, setIsCancelling] = useState(false);
  const [pendingRefunds, setPendingRefunds] = useState(0);

  React.useEffect(() => {
    async function loadRefunds() {
      try {
        const sessionUser = userSession.getUser();
        if (!sessionUser) return;
        
        const res = await fetch(`${API_BASE_URL}/organizer/${sessionUser.id}/refunds`);
        if (res.ok) {
          const data = await res.json();
          // Filter refunds for this specific event
          const eventRefunds = data.refunds.filter((r: any) => r.event_id === eventId);
          setPendingRefunds(eventRefunds.length);
        }
      } catch (error) {
        console.error(error);
      }
    }
    loadRefunds();
  }, [eventId]);

  const handleCancelEvent = () => {
    Alert.alert(
      "Cancel Event",
      "Are you sure you want to cancel this event? This action cannot be undone and will initiate refunds.",
      [
        { text: "No, Keep It", style: "cancel" },
        { 
          text: "Yes, Cancel Event", 
          style: "destructive",
          onPress: async () => {
            setIsCancelling(true);
            try {
              // State Pattern transition simulation
              const epassContext = EPassManager.createContext('Active', 'epass-id-placeholder', 'reg-id-placeholder');
              const oldState = epassContext.getStateName();
              
              // Simulate transition to Cancelled/Refunded state depending on whether event is free
              const isFree = price === 'Free' || parseFloat(price) === 0;
              const targetStateName = isFree ? 'Cancelled' : 'Refunded';
              const simulatedNewState = EPassManager.getStateInstance(targetStateName);
              epassContext.setState(simulatedNewState);
              const newState = epassContext.getStateName();

              await pauseDebug({
                pattern: "State Pattern (E-Pass State)",
                action: "Event Cancellation (Mass state transition simulation)",
                eventId: eventId,
                eventTitle: title,
                isFree: isFree,
                previousState: oldState,
                newState: newState
              });

              await EventCreationController.cancelEvent(eventId);
              Alert.alert('Success', 'Event has been cancelled.', [
                { text: 'OK', onPress: () => router.replace('/(organizer)/dashboard') }
              ]);
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setIsCancelling(false);
            }
          }
        }
      ]
    );
  };

  const handleExport = async () => {
    try {
      await pauseDebug({
        pattern: "File System / Export Data",
        action: "Exporting participant roster as CSV",
        eventId: eventId,
        eventTitle: title
      });

      Alert.alert('Exporting', 'Preparing your roster...');
      const res = await fetch(`${API_BASE_URL}/events/${eventId}/participants/export`);
      if (!res.ok) {
        throw new Error('Failed to fetch export data.');
      }
      const csvText = await res.text();
      
      const safeTitle = title.replace(/[^a-zA-Z0-9]/g, '_');
      const dateStr = new Date().toISOString().split('T')[0];
      const timeStr = new Date().toTimeString().split(' ')[0].replace(/:/g, '-');
      const filename = `${safeTitle}_${dateStr}_${timeStr}.csv`;
      
      const fileUri = `${FileSystem.documentDirectory}${filename}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvText, { encoding: FileSystem.EncodingType.UTF8 });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Success', `File saved to ${fileUri}`);
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert('Error', 'Failed to export roster: ' + error.message);
    }
  };

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

          <Text style={styles.eventSubtitle}>{title}</Text>

          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{participantCount}</Text>
              <Text style={styles.statLabel}>Sold / {capacity}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingRefunds}</Text>
              <Text style={styles.statLabel}>Pending Refunds</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Event Tools</Text>

          <View style={styles.gridContainer}>
            <Pressable style={styles.gridItem} onPress={() => router.push({
              pathname: '/(organizer)/edit-details',
              params: params
            })}>
              <Ionicons name="pencil" size={32} color={theme.colors.white} style={styles.gridIcon} />
              <Text style={styles.gridText}>Edit Details</Text>
            </Pressable>

            <Pressable style={styles.gridItem} onPress={() => router.push({
              pathname: '/(organizer)/send-announcement',
              params: params
            })}>
              <Ionicons name="megaphone" size={32} color={theme.colors.white} style={styles.gridIcon} />
              <Text style={styles.gridText}>Send Announcement</Text>
            </Pressable>

            <Pressable style={styles.gridItem} onPress={() => router.push({
              pathname: '/(organizer)/review-refunds',
              params: params
            })}>
              <Ionicons name="cash-outline" size={32} color={theme.colors.white} style={styles.gridIcon} />
              <Text style={styles.gridText}>Review Refunds</Text>
            </Pressable>

            <Pressable style={styles.gridItem} onPress={handleExport}>
              <Ionicons name="download-outline" size={32} color={theme.colors.white} style={styles.gridIcon} />
              <Text style={styles.gridText}>Export Roster</Text>
            </Pressable>
          </View>

          <View style={styles.dangerZone}>
            <Text style={styles.dangerTitle}>DANGER ZONE</Text>
            <Pressable style={styles.dangerButton} onPress={handleCancelEvent} disabled={isCancelling}>
              {isCancelling ? (
                <ActivityIndicator color={theme.colors.white} />
              ) : (
                <Text style={styles.dangerButtonText}>Cancel Event (Mass Refund)</Text>
              )}
            </Pressable>
          </View>

        </ScrollView>
        {/* FLOATING STEP OVERLAY BUTTON */}
        <Pressable style={styles.terminalDebuggerButton} onPress={triggerTerminalResume}>
          <Text style={styles.terminalDebuggerButtonText}>STEP OVER ⏭️</Text>
        </Pressable>
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
  dangerButtonText: { color: theme.colors.white, fontWeight: '800', fontSize: 16 },
  terminalDebuggerButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#121214',
    borderColor: '#29292e',
    borderWidth: 1.5,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 30,
    elevation: 10,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
  },
  terminalDebuggerButtonText: {
    color: '#00ff66',
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace'
  }
});