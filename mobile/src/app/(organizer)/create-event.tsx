import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, SafeAreaView, Alert, Platform, KeyboardAvoidingView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../constants/theme';
import { EventCreationController } from '../../event/EventCreationController';
import { userSession } from '../../usr/UserSession';

export default function CreateEventScreen() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [capacityInput, setCapacityInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  // Payout account states
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');

  const basePrice = priceInput.trim() === '' ? 0 : parseFloat(priceInput);
  const isPaidEvent = basePrice > 0;

  const handleSubmit = async () => {
    setLoading(true);
    
    const capacity = capacityInput.trim() === '' ? 0 : parseInt(capacityInput, 10);
    const isoDateString = date.toISOString();
    const sessionUser = userSession.getUser();
    const organizerId = sessionUser?.id || 'ec52b657-01ca-47fc-bf41-a1ee9fb094f2';

    try {
      await EventCreationController.createNewEvent({
        organizerId,
        title,
        date: isoDateString,
        description,
        basePrice,
        capacity,
        bankName,
        accountNumber,
        accountHolder,
      });

      Alert.alert('Success', 'Your event has been successfully published!', [
        { text: 'OK', onPress: () => router.replace('/(organizer)/dashboard') }
      ]);
      
    } catch (error: any) {
      Alert.alert('Creation Failed', error.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          
            <View style={styles.header}>
              <Pressable onPress={() => router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </Pressable>
              <Text style={styles.pageTitle}>Create New Event</Text>
            </View>

            <View style={[theme.glassmorphism, styles.formContainer]}>
              
              <Text style={styles.inputLabel}>Event Title</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g., MMU Cyber Hackathon"
                placeholderTextColor={theme.colors.textMuted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.inputLabel}>Event Date & Time</Text>
              <View style={styles.dateTimeRow}>
                <Pressable 
                  style={[styles.input, { flex: 1, marginRight: 8 }]} 
                  onPress={() => { setPickerMode('date'); setShowPicker(true); }}
                >
                  <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.input, { flex: 1, marginLeft: 8 }]} 
                  onPress={() => { setPickerMode('time'); setShowPicker(true); }}
                >
                  <Text style={styles.dateText}>
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Pressable>
              </View>

              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode={pickerMode}
                  display="default"
                  onChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') setShowPicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setDate(selectedDate);
                    } else if (event.type === 'dismissed') {
                      setShowPicker(false);
                    }
                  }}
                />
              )}

              <Text style={styles.inputLabel}>Description</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                placeholder="Provide complete details about tickets, rules, and timeline..."
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />

              <Text style={styles.inputLabel}>Base Price (RM) — Leave blank or 0 if Free</Text>
              <TextInput 
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="numeric"
                value={priceInput}
                onChangeText={setPriceInput}
              />

              <Text style={styles.inputLabel}>General Admission Capacity</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g., 200"
                placeholderTextColor={theme.colors.textMuted}
                keyboardType="number-pad"
                value={capacityInput}
                onChangeText={setCapacityInput}
              />

              {isPaidEvent && (
                <>
                  <View style={styles.payoutHeader}>
                    <Text style={styles.payoutTitle}>Payout Account</Text>
                    <Text style={styles.payoutSubtitle}>Where ticket sales will be sent</Text>
                  </View>

                  <Text style={styles.inputLabel}>Bank Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Maybank"
                    placeholderTextColor={theme.colors.textMuted}
                    value={bankName}
                    onChangeText={setBankName}
                  />

                  <Text style={styles.inputLabel}>Account Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. 1234567890"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="numeric"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                  />

                  <Text style={styles.inputLabel}>Account Holder Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. Ahmad bin Ali"
                    placeholderTextColor={theme.colors.textMuted}
                    value={accountHolder}
                    onChangeText={setAccountHolder}
                  />
                </>
              )}

              <Pressable 
                style={[styles.submitButton, loading && { opacity: 0.6 }]} 
                onPress={handleSubmit}
                disabled={loading}
              >
                <Text style={styles.submitButtonText}>
                  {loading ? 'Publishing...' : 'Publish Event'}
                </Text>
              </Pressable>

            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 30, marginTop: 10 },
  backButton: { marginRight: 16, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backButtonText: { color: theme.colors.white, fontWeight: '600' },
  pageTitle: { color: theme.colors.white, fontSize: 24, fontWeight: '800' },
  formContainer: { padding: 20, borderRadius: 16 },
  inputLabel: { color: theme.colors.white, fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { 
    backgroundColor: 'rgba(255,255,255,0.05)', 
    borderRadius: 10, 
    padding: 14, 
    color: theme.colors.white, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.1)',
    fontSize: 15
  },
  dateTimeRow: { flexDirection: 'row', justifyContent: 'space-between' },
  dateText: { color: theme.colors.white, fontSize: 15 },
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  payoutHeader: { marginTop: 24, marginBottom: 4, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 20 },
  payoutTitle: { color: theme.colors.white, fontSize: 16, fontWeight: '700' },
  payoutSubtitle: { color: theme.colors.textMuted, fontSize: 13, marginTop: 2 },
  submitButton: { backgroundColor: theme.colors.brightRed, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  submitButtonText: { color: theme.colors.white, fontWeight: '800', fontSize: 16 }
});
