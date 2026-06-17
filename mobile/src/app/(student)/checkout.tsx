import React, { useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView, SafeAreaView,
  Pressable, Modal, TextInput, ActivityIndicator, Platform, KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../constants/theme';
import { resolveStrategy } from '../../payment/PaidEvent';
import { CheckoutContext } from '../../payment/CheckoutContext';

type PaymentStatus = 'idle' | 'credentials' | 'processing' | 'success' | 'failed';

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const [selectedMethod, setSelectedMethod] = useState('fpx');
  const [status, setStatus] = useState<PaymentStatus>('idle');

  // Extract params with safe defaults
  const id = params.id as string || '';
  const title = params.title as string || 'Event';
  const price = params.price as string || 'Free';
  const rawPrice = params.rawPrice as string || '0';
  const ticketPrice = parseFloat(rawPrice);

  // FPX fields
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');

  // E-Wallet fields
  const [walletId, setWalletId] = useState('');
  const [pin, setPin] = useState('');

  // Card fields
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');

  const handleConfirmPress = () => {
    setStatus('credentials');
  };

  const handlePayment = () => {
    setStatus('processing');

    setTimeout(() => {
      try {
        const strategy = resolveStrategy(ticketPrice, selectedMethod);
        const checkout = new CheckoutContext(strategy);
        const success = strategy.pay(ticketPrice);
        checkout.executePayment(ticketPrice);
        setStatus(success ? 'success' : 'failed');
      } catch (e) {
        setStatus('failed');
      }
    }, 1500);
  };

  const resetModal = () => {
    setStatus('idle');
    setBankCode(''); setAccountNumber('');
    setWalletId(''); setPin('');
    setCardNumber(''); setExpiryDate(''); setCvv('');
  };

  const methodLabel: Record<string, string> = {
    fpx: 'Online Banking (FPX)',
    ewallet: "Touch 'n Go eWallet",
    card: 'Credit / Debit Card',
  };

  const renderCredentialFields = () => {
    if (selectedMethod === 'fpx') return (
      <>
        <Text style={styles.inputLabel}>Bank Code</Text>
        <TextInput style={styles.input} placeholder="e.g. MBBEMYKL" placeholderTextColor="#888"
          value={bankCode} onChangeText={setBankCode} autoCapitalize="characters" />
        <Text style={styles.inputLabel}>Account Number</Text>
        <TextInput style={styles.input} placeholder="e.g. 1234567890" placeholderTextColor="#888"
          value={accountNumber} onChangeText={setAccountNumber} keyboardType="numeric" />
      </>
    );

    if (selectedMethod === 'ewallet') return (
      <>
        <Text style={styles.inputLabel}>Wallet ID</Text>
        <TextInput style={styles.input} placeholder="e.g. tng_user_1234" placeholderTextColor="#888"
          value={walletId} onChangeText={setWalletId} autoCapitalize="none" />
        <Text style={styles.inputLabel}>PIN</Text>
        <TextInput style={styles.input} placeholder="6-digit PIN" placeholderTextColor="#888"
          value={pin} onChangeText={setPin} keyboardType="numeric" secureTextEntry maxLength={6} />
      </>
    );

    if (selectedMethod === 'card') return (
      <>
        <Text style={styles.inputLabel}>Card Number</Text>
        <TextInput style={styles.input} placeholder="1234 5678 9012 3456" placeholderTextColor="#888"
          value={cardNumber} onChangeText={setCardNumber} keyboardType="numeric" maxLength={16} />
        <Text style={styles.inputLabel}>Expiry Date</Text>
        <TextInput style={styles.input} placeholder="MM/YY" placeholderTextColor="#888"
          value={expiryDate} onChangeText={setExpiryDate} maxLength={5} />
        <Text style={styles.inputLabel}>CVV</Text>
        <TextInput style={styles.input} placeholder="123" placeholderTextColor="#888"
          value={cvv} onChangeText={setCvv} keyboardType="numeric" secureTextEntry maxLength={3} />
      </>
    );
  };

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
            <Text style={styles.pageTitle}>Checkout</Text>
          </View>

          {/* Order Summary */}
          <View style={[theme.glassmorphism, styles.summaryCard]}>
            <Text style={styles.sectionLabel}>ORDER SUMMARY</Text>
            <Text style={styles.eventTitle}>{title}</Text>
            <Text style={styles.eventDetails}>General Admission • 1 Ticket</Text>
            <View style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.totalText}>Total to Pay</Text>
              <Text style={styles.priceAmount}>{price}</Text>
            </View>
          </View>

          <Text style={styles.methodTitle}>Select Payment Method</Text>

          {/* Payment Options */}
          <View style={theme.glassmorphism}>
            <Pressable
              style={[styles.paymentOption, selectedMethod === 'fpx' && styles.selectedOption]}
              onPress={() => setSelectedMethod('fpx')}
            >
              <Text style={styles.paymentText}>🏦 Online Banking (FPX)</Text>
              {selectedMethod === 'fpx' && <View style={styles.radioDot} />}
            </Pressable>

            <Pressable
              style={[styles.paymentOption, selectedMethod === 'ewallet' && styles.selectedOption]}
              onPress={() => setSelectedMethod('ewallet')}
            >
              <Text style={styles.paymentText}>📱 Touch 'n Go eWallet</Text>
              {selectedMethod === 'ewallet' && <View style={styles.radioDot} />}
            </Pressable>

            <Pressable
              style={[styles.paymentOption, selectedMethod === 'card' && styles.selectedOption, { borderBottomWidth: 0 }]}
              onPress={() => setSelectedMethod('card')}
            >
              <Text style={styles.paymentText}>💳 Credit / Debit Card</Text>
              {selectedMethod === 'card' && <View style={styles.radioDot} />}
            </Pressable>
          </View>

          <Pressable style={styles.payButton} onPress={handleConfirmPress}>
            <Text style={styles.payButtonText}>Confirm & Pay</Text>
          </Pressable>

        </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Payment Credentials / Process Modal */}
      <Modal visible={status !== 'idle'} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>

            {/* Stage: Enter Details */}
            {status === 'credentials' && (
              <>
                <Text style={styles.modalTitle}>Enter {methodLabel[selectedMethod]} Details</Text>
                <Text style={styles.modalSubtitle}>{price} • {title}</Text>
                <View style={styles.modalDivider} />
                {renderCredentialFields()}
                <Pressable style={styles.modalPayBtn} onPress={handlePayment}>
                  <Text style={styles.modalPayBtnText}>Pay Now</Text>
                </Pressable>
                <Pressable onPress={resetModal}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </Pressable>
              </>
            )}

            {/* Stage: Processing */}
            {status === 'processing' && (
              <>
                <ActivityIndicator size="large" color={theme.colors.brightRed} style={{ marginBottom: 16 }} />
                <Text style={styles.modalTitle}>Processing Payment…</Text>
                <Text style={styles.modalSubtitle}>Please wait</Text>
              </>
            )}

            {/* Stage: Success */}
            {status === 'success' && (
              <>
                <Text style={styles.modalTitle}>Payment Confirmed!</Text>
                <Text style={styles.modalSubtitle}>{price} paid via {methodLabel[selectedMethod]}</Text>
                <Text style={styles.modalSubtitle}>Your ticket for {title} is being generated.</Text>
                <Pressable style={styles.modalPayBtn} onPress={() => {
                  resetModal();
                  router.push('/(student)/wallet');
                }}>
                  <Text style={styles.modalPayBtnText}>Go to Wallet</Text>
                </Pressable>
              </>
            )}

            {/* Stage: Failed */}
            {status === 'failed' && (
              <>
                <Text style={styles.statusIcon}>❌</Text>
                <Text style={styles.modalTitle}>Payment Failed</Text>
                <Text style={styles.modalSubtitle}>Something went wrong. Please try again.</Text>
                <Pressable style={styles.modalPayBtn} onPress={resetModal}>
                  <Text style={styles.modalPayBtnText}>Try Again</Text>
                </Pressable>
              </>
            )}

          </View>
        </View>
      </Modal>

    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backButton: { marginRight: 16, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backButtonText: { color: theme.colors.white, fontWeight: '600' },
  pageTitle: { color: theme.colors.white, fontSize: 28, fontWeight: '800' },

  summaryCard: { padding: 24, marginBottom: 30 },
  sectionLabel: { color: theme.colors.brightRed, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginBottom: 12 },
  eventTitle: { color: theme.colors.white, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  eventDetails: { color: theme.colors.textMuted, fontSize: 14, marginBottom: 16 },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: 16 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalText: { color: theme.colors.white, fontSize: 16, fontWeight: '600' },
  priceAmount: { color: theme.colors.white, fontSize: 24, fontWeight: '800' },

  methodTitle: { color: theme.colors.white, fontSize: 18, fontWeight: '700', marginBottom: 16 },
  paymentOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  selectedOption: { backgroundColor: 'rgba(219, 44, 44, 0.1)' },
  paymentText: { color: theme.colors.white, fontSize: 16, fontWeight: '500' },
  radioDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: theme.colors.brightRed },

  payButton: { backgroundColor: theme.colors.white, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 30 },
  payButtonText: { color: theme.colors.brightRed, fontWeight: '800', fontSize: 18 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#1a1a2e', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 28, paddingBottom: 40 },
  modalTitle: { color: theme.colors.white, fontSize: 20, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  modalSubtitle: { color: '#aaa', fontSize: 14, textAlign: 'center', marginBottom: 6 },
  modalDivider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 16 },

  inputLabel: { color: '#aaa', fontSize: 13, marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.08)', color: theme.colors.white, borderRadius: 10, padding: 12, fontSize: 15, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.12)' },

  modalPayBtn: { backgroundColor: theme.colors.brightRed, paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 24 },
  modalPayBtnText: { color: theme.colors.white, fontWeight: '800', fontSize: 16 },
  cancelText: { color: '#888', textAlign: 'center', marginTop: 14, fontSize: 14 },
  statusIcon: { fontSize: 48, textAlign: 'center', marginBottom: 12 },
});
