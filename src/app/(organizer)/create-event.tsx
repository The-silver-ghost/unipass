import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function CreateEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('');

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Cancel</Text>
            </Pressable>
            <Text style={styles.pageTitle}>New Event</Text>
          </View>

          <View style={[theme.glassmorphism, styles.formContainer]}>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Title</Text>
              <TextInput style={styles.input} placeholder="e.g., MMU Tech Symposium" placeholderTextColor="rgba(255,255,255,0.3)" value={title} onChangeText={setTitle} />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Date & Time</Text>
              <TextInput style={styles.input} placeholder="DD/MM/YYYY HH:MM" placeholderTextColor="rgba(255,255,255,0.3)" value={date} onChangeText={setDate} />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.inputLabel}>Base Price (RM)</Text>
                <TextInput style={styles.input} placeholder="0.00 for Free" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" value={price} onChangeText={setPrice} />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
                <Text style={styles.inputLabel}>Max Capacity</Text>
                <TextInput style={styles.input} placeholder="e.g., 500" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" value={capacity} onChangeText={setCapacity} />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Event Description & Rules</Text>
              <TextInput style={[styles.input, styles.textArea]} placeholder="Enter full event details, schedule, and rules..." placeholderTextColor="rgba(255,255,255,0.3)" multiline numberOfLines={4} value={description} onChangeText={setDescription} />
            </View>

            <View style={styles.paymentSection}>
              <Text style={styles.paymentLabel}>Payment Account</Text>
              <TextInput style={styles.input} placeholder="Bank Account or Gateway ID (e.g., Stripe/FPX)" placeholderTextColor="rgba(255,255,255,0.3)" value={paymentAccount} onChangeText={setPaymentAccount} />
              <Text style={styles.infoText}>Funds from ticket sales will be routed to this account.</Text>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>ℹ️ This event will be strictly General Admission as per UniPass guidelines.</Text>
            </View>

          </View>

          <Pressable style={styles.submitButton} onPress={() => router.back()}>
            <Text style={styles.submitButtonText}>Publish Event</Text>
          </Pressable>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: 60, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  backButton: { marginRight: 16, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backButtonText: { color: theme.colors.white, fontWeight: '600' },
  pageTitle: { color: theme.colors.white, fontSize: 28, fontWeight: '800' },
  formContainer: { padding: 24, marginBottom: 30 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: theme.colors.white, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 16, color: theme.colors.white, fontSize: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  textArea: { height: 100, textAlignVertical: 'top' },
  paymentSection: { marginTop: 10, paddingTop: 20, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', marginBottom: 20 },
  paymentLabel: { color: theme.colors.brightRed, fontSize: 14, fontWeight: '800', marginBottom: 8 },
  infoText: { color: theme.colors.white, fontSize: 12, marginTop: 8, opacity: 0.6 },
  infoBox: { backgroundColor: 'rgba(219, 44, 44, 0.1)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(219, 44, 44, 0.3)' },
  infoBoxText: { color: theme.colors.white, fontSize: 12, lineHeight: 18, opacity: 0.8 },
  submitButton: { backgroundColor: theme.colors.brightRed, paddingVertical: 18, borderRadius: 16, alignItems: 'center' },
  submitButtonText: { color: theme.colors.white, fontWeight: '800', fontSize: 18 },
});