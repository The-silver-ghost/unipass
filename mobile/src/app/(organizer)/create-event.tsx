import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, Pressable, ScrollView, SafeAreaView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';
import { EventCreationController } from '../../event/EventCreationController';

export default function CreateEventScreen() {
  const router = useRouter();
  
  // Form States
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [capacityInput, setCapacityInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    
    const basePrice = priceInput.trim() === '' ? 0 : parseFloat(priceInput);
    const capacity = capacityInput.trim() === '' ? 0 : parseInt(capacityInput, 10);

    try {
      // Execute Domain Controller
      EventCreationController.createNewEvent({
        organizerId: '2df69e3a-3a9a-48d3-845a-f1a354d5298d', // Contextually pulled from session later
        title,
        date,
        description,
        basePrice,
        capacity,
      });

      Alert.alert('Success', 'Your event has been successfully published!', [
        { text: 'OK', onPress: () => router.replace('/(organizer)/dashboard') }
      ]);
    } catch (error: any) {
      // Captures validations including Alternative Flow 3a (RM1.00 processing fee warning)
      Alert.alert('Creation Failed', error.message || 'An unknown error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
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
            <TextInput 
              style={styles.input}
              placeholder="e.g., Oct 12, 2026 at 9:00 AM"
              placeholderTextColor={theme.colors.textMuted}
              value={date}
              onChangeText={setDate}
            />

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
  textArea: { minHeight: 100, textAlignVertical: 'top' },
  submitButton: { backgroundColor: theme.colors.brightRed, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 28 },
  submitButtonText: { color: theme.colors.white, fontWeight: '800', fontSize: 16 }
});