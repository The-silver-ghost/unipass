import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../constants/theme';
import { EventCreationController } from '../../event/EventCreationController';

export default function EditDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const eventId = params.id as string;
  const initialDescription = params.description as string || '';
  const initialCapacity = params.capacity as string || '';

  const [description, setDescription] = useState(initialDescription);
  const [capacity, setCapacity] = useState(initialCapacity);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!description.trim() || !capacity.trim()) {
      Alert.alert('Error', 'Please fill out all fields.');
      return;
    }

    const capNumber = parseInt(capacity, 10);
    if (isNaN(capNumber) || capNumber <= 0) {
      Alert.alert('Error', 'Capacity must be a valid number greater than 0.');
      return;
    }

    setSaving(true);
    try {
      await EventCreationController.updateEvent(eventId, description, capNumber);
      Alert.alert('Success', 'Event details updated successfully!', [
        { text: 'OK', onPress: () => router.replace('/(organizer)/dashboard') }
      ]);
    } catch (error: any) {
      Alert.alert('Save Failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Text style={styles.backButtonText}>← Back</Text>
            </Pressable>
            <Text style={styles.pageTitle}>Edit Details</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={[theme.glassmorphism, styles.card]}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Update Description</Text>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholder="Update event details..." 
                  placeholderTextColor="rgba(255,255,255,0.3)" 
                  multiline
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Update Capacity</Text>
                <TextInput 
                  style={styles.input} 
                  placeholder="500" 
                  placeholderTextColor="rgba(255,255,255,0.3)" 
                  keyboardType="numeric" 
                  value={capacity}
                  onChangeText={setCapacity}
                />
              </View>
              <Pressable style={styles.primaryButton} onPress={handleSave} disabled={saving}>
                {saving ? (
                  <ActivityIndicator color={theme.colors.white} />
                ) : (
                  <Text style={styles.primaryButtonText}>Save Changes</Text>
                )}
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
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, paddingBottom: 20 },
  backButton: { marginRight: 16, paddingVertical: 8, paddingHorizontal: 12, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backButtonText: { color: theme.colors.white, fontWeight: '700' },
  pageTitle: { color: theme.colors.white, fontSize: 24, fontWeight: '800' },
  scrollContent: { padding: 24 },
  card: { padding: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: theme.colors.white, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 16, color: theme.colors.white, fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  primaryButton: { backgroundColor: theme.colors.brightRed, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: theme.colors.white, fontWeight: '800', fontSize: 16 },
});