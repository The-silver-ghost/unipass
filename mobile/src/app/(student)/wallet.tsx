import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';

export default function StudentWalletScreen() {
  const [activeQR, setActiveQR] = useState<string | null>(null);
  const [refundPassId, setRefundPassId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState<'schedule' | 'sick' | 'other'>('schedule');
  const [otherText, setOtherText] = useState('');

  if (activeQR) {
    return (
      <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
        <SafeAreaView style={styles.qrFullscreen}>
          <Pressable onPress={() => setActiveQR(null)} style={styles.qrBackButton}>
            <Text style={styles.qrBackButtonText}>← Back to Wallet</Text>
          </Pressable>
          
          <View style={styles.qrContent}>
            <Text style={styles.qrTitle}>Campus Music Fest</Text>
            <Text style={styles.qrSubtitle}>General Admission</Text>
            
            <View style={styles.qrPlaceholder}>
              <Text style={styles.qrPlaceholderText}>[ QR CODE RENDER ]</Text>
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
          <Text style={styles.pageTitle}>My E-Passes</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[theme.glassmorphism, styles.card]}>
            <View style={styles.cardInfo}>
              <Text style={styles.eventTitle}>Campus Music Fest</Text>
              <Text style={styles.eventDetails}>May 28 • Main Hall</Text>
              <Text style={styles.eventStatus}>Valid Ticket</Text>
            </View>
            
            <View style={styles.cardActions}>
              <Pressable style={styles.qrButton} onPress={() => setActiveQR('pass_123')}>
                <Text style={styles.qrButtonText}>Show QR</Text>
              </Pressable>
              <Pressable style={styles.refundButton} onPress={() => setRefundPassId('pass_123')}>
                <Text style={styles.refundButtonText}>Refund</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        <Modal visible={!!refundPassId} transparent animationType="fade">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
            <View style={styles.modalOverlay}>
              <View style={[theme.glassmorphism, styles.modalContent]}>
                <Text style={styles.modalTitle}>Request Refund</Text>
              <Text style={styles.modalSubtext}>Please select a reason for canceling your E-Pass.</Text>
              
              <View style={styles.reasonGroup}>
                <Pressable onPress={() => setRefundReason('schedule')} style={styles.radioRow}>
                  <Text style={refundReason === 'schedule' ? styles.radioSelected : styles.radioUnselected}>◉ Schedule Conflict</Text>
                </Pressable>
                <Pressable onPress={() => setRefundReason('sick')} style={styles.radioRow}>
                  <Text style={refundReason === 'sick' ? styles.radioSelected : styles.radioUnselected}>◉ Medical / Sick</Text>
                </Pressable>
                <Pressable onPress={() => setRefundReason('other')} style={styles.radioRow}>
                  <Text style={refundReason === 'other' ? styles.radioSelected : styles.radioUnselected}>◉ Other</Text>
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
                <Pressable onPress={() => setRefundPassId(null)} style={styles.modalCancelBtn}>
                  <Text style={styles.modalCancelText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.modalSubmitBtn}>
                  <Text style={styles.modalSubmitText}>Submit Request</Text>
                </Pressable>
              </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

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
  qrPlaceholder: { width: 280, height: 280, backgroundColor: theme.colors.white, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  qrPlaceholderText: { color: theme.colors.bgDark, fontWeight: '900', fontSize: 18 },
  qrInstruction: { color: 'rgba(255,255,255,0.5)', fontSize: 14, textAlign: 'center', marginTop: 40, paddingHorizontal: 40, lineHeight: 22 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 },
  modalContent: { padding: 24, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  modalTitle: { color: theme.colors.white, fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  modalSubtext: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20 },
  reasonGroup: { marginBottom: 20 },
  radioRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  radioUnselected: { color: 'rgba(255,255,255,0.5)', fontSize: 16 },
  radioSelected: { color: theme.colors.brightRed, fontSize: 16, fontWeight: 'bold' },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 16, color: theme.colors.white, fontSize: 16, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  modalCancelBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.1)' },
  modalCancelText: { color: theme.colors.white, fontWeight: '600' },
  modalSubmitBtn: { paddingVertical: 12, paddingHorizontal: 20, borderRadius: 10, backgroundColor: theme.colors.brightRed },
  modalSubmitText: { color: theme.colors.white, fontWeight: '800' }
});