import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView,  Pressable, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { API_BASE_URL } from '../../config';
import { userSession } from '../../usr/UserSession';
import { useDebugPause, triggerTerminalResume } from '../../utils/debugPause';
import { EPassManager } from '../../epass/EPassManager';

export default function ReviewRefundsScreen() {
  const router = useRouter();
  const [refunds, setRefunds] = useState<any[]>([]);
  const { pauseDebug } = useDebugPause();

  const fetchRefunds = async () => {
    try {
      const user = userSession.getUser();
      if (!user) return;
      
      const res = await fetch(`${API_BASE_URL}/organizer/${user.id}/refunds`);
      const data = await res.json();
      if (res.ok) {
        setRefunds(data.refunds || []);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const handleApprove = async (regId: string) => {
    try {
      // State Pattern transition simulation
      const epassContext = EPassManager.createContext('Active', 'epass-id-placeholder', regId);
      const oldState = epassContext.getStateName();
      epassContext.approveRefund();
      const newState = epassContext.getStateName();

      await pauseDebug({
        pattern: "State Pattern (E-Pass State)",
        action: "Approving Refund (State transition simulation)",
        registrationId: regId,
        previousState: oldState,
        newState: newState
      });

      const res = await fetch(`${API_BASE_URL}/refunds/${regId}/accept`, { method: 'PUT' });
      if (res.ok) {
        Alert.alert('Success', 'Refund approved.');
        fetchRefunds();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDeny = async (regId: string) => {
    try {
      // State Pattern transition simulation
      const epassContext = EPassManager.createContext('Active', 'epass-id-placeholder', regId);
      const oldState = epassContext.getStateName();
      // Refund is denied, state stays Active
      const newState = epassContext.getStateName();

      await pauseDebug({
        pattern: "State Pattern (E-Pass State)",
        action: "Denying Refund (State transition simulation)",
        registrationId: regId,
        previousState: oldState,
        newState: newState
      });

      const res = await fetch(`${API_BASE_URL}/refunds/${regId}/deny`, { method: 'PUT' });
      if (res.ok) {
        Alert.alert('Success', 'Refund denied.');
        fetchRefunds();
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.pageTitle}>Review Refunds</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {refunds.length === 0 ? (
            <Text style={{ color: 'white', textAlign: 'center', marginTop: 50 }}>No pending refunds.</Text>
          ) : (
            refunds.map((refund, idx) => (
              <View key={idx} style={[theme.glassmorphism, styles.refundCard]}>
                <View style={styles.refundInfo}>
                  <Text style={styles.studentName}>{refund.student_name}</Text>
                  <Text style={styles.refundReason}>Event: {refund.title}</Text>
                  <Text style={styles.refundDate}>Price: RM {refund.ticket_price}</Text>
                </View>
                <View style={styles.actionRow}>
                  <Pressable style={styles.denyButton} onPress={() => handleDeny(refund.registration_id)}>
                    <Text style={styles.denyButtonText}>Deny</Text>
                  </Pressable>
                  <Pressable style={styles.approveButton} onPress={() => handleApprove(refund.registration_id)}>
                    <Text style={styles.approveButtonText}>Approve</Text>
                  </Pressable>
                </View>
              </View>
            ))
          )}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, paddingBottom: 20 },
  backButton: { marginRight: 16, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backButtonText: { color: theme.colors.white, fontWeight: '700' },
  pageTitle: { color: theme.colors.white, fontSize: 24, fontWeight: '800' },
  scrollContent: { padding: 24 },
  
  refundCard: { padding: 20, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16 },
  refundInfo: { marginBottom: 16 },
  studentName: { color: theme.colors.white, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  refundReason: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  refundDate: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 16 },
  denyButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
  denyButtonText: { color: theme.colors.white, fontWeight: '600' },
  approveButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#28a745' },
  approveButtonText: { color: '#fff', fontWeight: 'bold' },
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