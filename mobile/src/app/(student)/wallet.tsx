import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform, Alert, RefreshControl } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useFocusEffect } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import { theme } from '../../constants/theme';
import { API_BASE_URL } from '../../config';
import { userSession } from '../../usr/UserSession';
import { Ionicons } from '@expo/vector-icons';
import { useDebugPause, triggerTerminalResume } from '../../utils/debugPause';
import { EPassManager } from '../../epass/EPassManager';

export default function StudentWalletScreen() {
  const router = useRouter();
  const { pauseDebug } = useDebugPause();
  const [passes, setPasses] = useState<any[]>([]);
  const [activePass, setActivePass] = useState<any | null>(null);
  const [refundPass, setRefundPass] = useState<any | null>(null);
  const [refundReason, setRefundReason] = useState<'schedule' | 'sick' | 'other'>('schedule');
  const [otherText, setOtherText] = useState('');

  const fetchPasses = async () => {
    try {
      const user = userSession.getUser();
      if (!user) return;
      const res = await fetch(`${API_BASE_URL}/student/${user.id}/passes`);
      const data = await res.json();
      if (data.passes) {
        setPasses(data.passes.filter((p: any) => !p.is_hidden));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPasses();
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPasses();
    }, [])
  );

  useEffect(() => {
    if (!activePass) return;

    const interval = setInterval(async () => {
      try {
        const user = userSession.getUser();
        if (!user) return;
        const res = await fetch(`${API_BASE_URL}/student/${user.id}/passes`);
        if (res.ok) {
          const data = await res.json();
          if (data.passes) {
            const updatedPass = data.passes.find((p: any) => p.epass_id === activePass.epass_id);
            if (updatedPass) {
              setActivePass(updatedPass);
              setPasses(data.passes.filter((p: any) => !p.is_hidden));
            }
          }
        }
      } catch (error) {
        console.error("Failed to poll E-Pass status:", error);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [activePass]);

  const handleRefundOrCancel = async () => {
    if (!refundPass) return;
    const isFree = parseFloat(refundPass.ticket_price) === 0;
    try {
      const epassContext = EPassManager.createContext(refundPass.state, refundPass.epass_id, refundPass.registration_id);
      const oldState = epassContext.getStateName();
      epassContext.requestRefund(isFree);
      const newState = epassContext.getStateName();

      await pauseDebug({
        pattern: "State Pattern (E-Pass State)",
        action: "State transition on refund/cancel request",
        epassId: refundPass.epass_id,
        isFree: isFree,
        previousState: oldState,
        newState: newState
      });

      const res = await fetch(`${API_BASE_URL}/refunds/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ epassId: refundPass.epass_id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      Alert.alert('Success', data.message);
      setRefundPass(null);
      fetchPasses();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async (epassId: string) => {
    try {
      const pass = passes.find(p => p.epass_id === epassId);
      if (pass) {
        const epassContext = EPassManager.createContext(pass.state, pass.epass_id, pass.registration_id);
        await pauseDebug({
          pattern: "State Pattern (E-Pass State)",
          action: "Deleting/Hiding E-Pass",
          epassId: epassId,
          currentState: epassContext.getStateName(),
          canBeDeleted: epassContext.canBeDeleted()
        });
      }

      const res = await fetch(`${API_BASE_URL}/epass/${epassId}/hide`, { method: 'PUT' });
      if (res.ok) {
        fetchPasses();
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (activePass) {
    return (
      <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
        <SafeAreaView style={styles.qrFullscreen}>
          <Pressable onPress={() => { setActivePass(null); fetchPasses(); }} style={styles.qrBackButton}>
            <Text style={styles.qrBackButtonText}>← Back to Wallet</Text>
          </Pressable>
          
          <View style={styles.qrContent}>
            <Text style={styles.qrTitle}>{activePass.title}</Text>
            <Text style={styles.qrSubtitle}>{activePass.state}</Text>
            
            <View style={styles.qrPlaceholder}>
              <QRCode 
                value={activePass.qr_code}
                size={240}
                backgroundColor="transparent"
                color={theme.colors.bgDark}
              />
            </View>
            
            <Text style={styles.qrInstruction}>Turn up your screen brightness and present this at the entrance.</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.topBackButton}>
            <Text style={styles.topBackButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.pageTitle}>My E-Passes</Text>
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.white} />
          }
        >
          {passes.map(pass => {
            const isFree = parseFloat(pass.ticket_price) === 0;
            const eventEnded = pass.event_end_date ? new Date(pass.event_end_date).getTime() < new Date().getTime() : false;
            
            const epassContext = EPassManager.createContext(pass.state, pass.epass_id, pass.registration_id);
            const showQR = epassContext.canShowQRCode() && !eventEnded;
            const canRefund = epassContext.canRequestRefund() && !eventEnded;
            const canDelete = epassContext.canBeDeleted() || eventEnded;

            return (
              <View key={pass.epass_id} style={[theme.glassmorphism, styles.card]}>
                <View style={styles.cardInfo}>
                  <Text style={styles.eventTitle}>{pass.title}</Text>
                  <Text style={styles.eventDetails}>{new Date(pass.event_date).toLocaleDateString()}</Text>
                  <Text style={[styles.eventStatus, pass.state === 'Active' ? {} : {color: theme.colors.textMuted}]}>
                    {eventEnded ? 'Expired' : pass.state}
                  </Text>
                </View>
                
                <View style={styles.cardActions}>
                  {!eventEnded && showQR && (
                    <Pressable style={styles.qrButton} onPress={() => setActivePass(pass)}>
                      <Text style={styles.qrButtonText}>Show QR</Text>
                    </Pressable>
                  )}
                  {canRefund && (
                    <Pressable style={styles.refundButton} onPress={() => setRefundPass(pass)}>
                      <Text style={styles.refundButtonText}>{isFree ? 'Cancel' : 'Refund'}</Text>
                    </Pressable>
                  )}
                  {canDelete && (
                    <Pressable style={[styles.refundButton, {borderColor: '#555'}]} onPress={() => handleDelete(pass.epass_id)}>
                      <Text style={[styles.refundButtonText, {color: '#555'}]}>Delete</Text>
                    </Pressable>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <Modal visible={!!refundPass} transparent animationType="fade">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.modalOverlay}>
              <View style={[theme.glassmorphism, styles.modalContent]}>
                <Text style={styles.modalTitle}>Cancel / Refund Pass</Text>
                <Text style={styles.modalSubtext}>Please select a reason.</Text>
                
                <View style={styles.reasonGroup}>
                  <Pressable onPress={() => setRefundReason('schedule')} style={styles.radioRow}>
                    <Ionicons name={refundReason === 'schedule' ? "radio-button-on" : "radio-button-off"} size={20} color={theme.colors.white} style={{ marginRight: 8 }} />
                    <Text style={refundReason === 'schedule' ? styles.radioSelected : styles.radioUnselected}>Schedule Conflict</Text>
                  </Pressable>
                  <Pressable onPress={() => setRefundReason('sick')} style={styles.radioRow}>
                    <Ionicons name={refundReason === 'sick' ? "radio-button-on" : "radio-button-off"} size={20} color={theme.colors.white} style={{ marginRight: 8 }} />
                    <Text style={refundReason === 'sick' ? styles.radioSelected : styles.radioUnselected}>Medical / Sick</Text>
                  </Pressable>
                  <Pressable onPress={() => setRefundReason('other')} style={styles.radioRow}>
                    <Ionicons name={refundReason === 'other' ? "radio-button-on" : "radio-button-off"} size={20} color={theme.colors.white} style={{ marginRight: 8 }} />
                    <Text style={refundReason === 'other' ? styles.radioSelected : styles.radioUnselected}>Other</Text>
                  </Pressable>
                </View>

                {refundReason === 'other' && (
                  <TextInput 
                    style={[styles.input, styles.textArea]} 
                    placeholder="Please explain your reason..." 
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    multiline 
                    numberOfLines={3}
                    value={otherText}
                    onChangeText={setOtherText}
                  />
                )}

                <View style={styles.modalActions}>
                  <Pressable onPress={() => setRefundPass(null)} style={styles.modalCancelBtn}>
                    <Text style={styles.modalCancelText}>Go Back</Text>
                  </Pressable>
                  <Pressable style={styles.modalSubmitBtn} onPress={handleRefundOrCancel}>
                    <Text style={styles.modalSubmitText}>Confirm</Text>
                  </Pressable>
                </View>
              </View>
              {/* FLOATING STEP OVERLAY BUTTON FOR MODAL */}
              <Pressable style={styles.terminalDebuggerButtonModal} onPress={triggerTerminalResume}>
                <Text style={styles.terminalDebuggerButtonText}>STEP OVER ⏭️</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Modal>

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
  headerRow: { padding: 24, paddingTop: 60, paddingBottom: 20 },
  pageTitle: { color: theme.colors.white, fontSize: 28, fontWeight: '800' },
  scrollContent: { padding: 24, paddingTop: 10 },
  card: { padding: 20, marginBottom: 16, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardInfo: { flex: 1, paddingRight: 16 },
  eventTitle: { color: theme.colors.white, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  eventDetails: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 8 },
  eventStatus: { color: '#28a745', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1 },
  cardActions: { gap: 10 },
  qrButton: { backgroundColor: theme.colors.white, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  qrButtonText: { color: theme.colors.bgDark, fontWeight: '800' },
  refundButton: { borderWidth: 1, borderColor: theme.colors.brightRed, paddingVertical: 10, paddingHorizontal: 20, borderRadius: 10, alignItems: 'center' },
  refundButtonText: { color: theme.colors.brightRed, fontWeight: '700' },
  qrFullscreen: { flex: 1, padding: 24 },
  qrBackButton: { alignSelf: 'flex-start', padding: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, marginTop: 40 },
  qrBackButtonText: { color: theme.colors.white, fontWeight: 'bold', fontSize: 16 },
  qrContent: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 60 },
  qrTitle: { color: theme.colors.white, fontSize: 26, fontWeight: 'bold', textAlign: 'center' },
  qrSubtitle: { color: theme.colors.brightRed, fontSize: 16, fontWeight: '600', marginTop: 8, marginBottom: 40, textTransform: 'uppercase', letterSpacing: 2 },
  qrPlaceholder: { width: 280, height: 280, backgroundColor: theme.colors.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center', padding: 20 },
  qrPlaceholderText: { color: theme.colors.bgDark, fontWeight: '900', fontSize: 18 },
  qrInstruction: { color: theme.colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 24 },
  topBackButton: { alignSelf: 'flex-start', marginBottom: 16, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  topBackButtonText: { color: theme.colors.white, fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  modalTitle: { color: theme.colors.white, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  modalSubtext: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 },
  reasonGroup: { marginBottom: 20 },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  radioUnselected: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  radioSelected: { color: theme.colors.brightRed, fontSize: 16, fontWeight: 'bold' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 16, color: theme.colors.white, fontSize: 16, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)' },
  modalCancelText: { color: theme.colors.white, fontWeight: '600' },
  modalSubmitBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, backgroundColor: theme.colors.brightRed },
  modalSubmitText: { color: theme.colors.white, fontWeight: '800' },
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
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4.5,
  },
  terminalDebuggerButtonModal: {
    position: 'absolute',
    top: 60,
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