import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function CheckoutScreen() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState('fpx');

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
            <Text style={styles.pageTitle}>Checkout</Text>
          </View>

          {/* Event Summary Card */}
          <View style={[theme.glassmorphism, styles.summaryCard]}>
            <Text style={styles.sectionLabel}>ORDER SUMMARY</Text>
            <Text style={styles.eventTitle}>Campus Music Fest</Text>
            <Text style={styles.eventDetails}>General Admission • 1 Ticket</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.priceRow}>
              <Text style={styles.totalText}>Total to Pay</Text>
              <Text style={styles.priceAmount}>RM 15.00</Text>
            </View>
          </View>

          <Text style={styles.methodTitle}>Select Payment Method</Text>

          {/* Payment Strategies (FPX, E-Wallet, Card) */}
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

          <Pressable style={styles.payButton} onPress={() => router.push('/(student)/wallet')}>
            <Text style={styles.payButtonText}>Confirm & Pay RM 15.00</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
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
});