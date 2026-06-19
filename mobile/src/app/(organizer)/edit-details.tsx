import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView,  Pressable, TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../../constants/theme';
import { EventCreationController } from '../../event/EventCreationController';
import { useDebugPause, triggerTerminalResume } from '../../utils/debugPause';

export default function EditDetailsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { pauseDebug } = useDebugPause();

  const eventId = params.id as string;
  const initialDescription = params.description as string || '';
  const initialCapacity = params.capacity as string || '';

  const [description, setDescription] = useState(initialDescription);
  const [capacity, setCapacity] = useState(initialCapacity);
  
  const [date, setDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(new Date().getTime() + 60 * 60 * 1000));
  const [showPicker, setShowPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [endPickerMode, setEndPickerMode] = useState<'date' | 'time'>('date');
  
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvent() {
      try {
        const ev = await EventCreationController.getEventDetails(eventId);
        setDate(new Date(ev.date));
        setEndDate(ev.endDate ? new Date(ev.endDate) : new Date(new Date(ev.date).getTime() + 60 * 60 * 1000));
        setDescription(ev.description);
        setCapacity(ev.capacity.toString());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadEvent();
  }, [eventId]);

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
      await pauseDebug({
        pattern: "Factory Pattern (Event Creation)",
        action: "Updating event details via EventCreationController",
        eventId: eventId,
        newDescription: description,
        newCapacity: capNumber,
        newDate: date.toISOString(),
        newEndDate: endDate.toISOString()
      });

      await EventCreationController.updateEvent(eventId, description, capNumber, date.toISOString(), endDate.toISOString());
      Alert.alert('Success', 'Event details updated successfully!', [
        { text: 'OK', onPress: () => router.replace('/(organizer)/dashboard') }
      ]);
    } catch (error: any) {
      Alert.alert('Save Failed', error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={theme.colors.brightRed} />
      </LinearGradient>
    );
  }

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

              <Text style={styles.inputLabel}>Update Start Date</Text>
              <View style={styles.dateTimeRow}>
                <Pressable 
                  style={[styles.input, { flex: 1, marginRight: 8, justifyContent: 'center' }]} 
                  onPress={() => { setPickerMode('date'); setShowPicker(true); }}
                >
                  <Text style={{ color: theme.colors.white }}>{date.toLocaleDateString()}</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.input, { flex: 1, marginLeft: 8, justifyContent: 'center' }]} 
                  onPress={() => { setPickerMode('time'); setShowPicker(true); }}
                >
                  <Text style={{ color: theme.colors.white }}>
                    {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Pressable>
              </View>

              {showPicker && (
                <DateTimePicker
                  value={date}
                  mode={pickerMode}
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') setShowPicker(false);
                    if (selectedDate) {
                      setDate(selectedDate);
                      if (selectedDate > endDate) {
                        setEndDate(new Date(selectedDate.getTime() + 60 * 60 * 1000));
                      }
                    }
                  }}
                  onDismiss={() => setShowPicker(false)}
                />
              )}

              <Text style={styles.inputLabel}>Update End Date</Text>
              <View style={styles.dateTimeRow}>
                <Pressable 
                  style={[styles.input, { flex: 1, marginRight: 8, justifyContent: 'center' }]} 
                  onPress={() => { setEndPickerMode('date'); setShowEndPicker(true); }}
                >
                  <Text style={{ color: theme.colors.white }}>{endDate.toLocaleDateString()}</Text>
                </Pressable>
                
                <Pressable 
                  style={[styles.input, { flex: 1, marginLeft: 8, justifyContent: 'center' }]} 
                  onPress={() => { setEndPickerMode('time'); setShowEndPicker(true); }}
                >
                  <Text style={{ color: theme.colors.white }}>
                    {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </Pressable>
              </View>

              {showEndPicker && (
                <DateTimePicker
                  value={endDate}
                  mode={endPickerMode}
                  display="default"
                  onValueChange={(event, selectedDate) => {
                    if (Platform.OS === 'android') setShowEndPicker(false);
                    if (selectedDate) {
                      if (selectedDate < date) {
                        Alert.alert('Invalid Date', 'End date cannot be earlier than start date.');
                        setEndDate(new Date(date.getTime() + 60 * 60 * 1000));
                      } else {
                        setEndDate(selectedDate);
                      }
                    }
                  }}
                  onDismiss={() => setShowEndPicker(false)}
                />
              )}

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
  card: { padding: 20, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { color: theme.colors.white, fontSize: 14, fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 16, color: theme.colors.white, fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  dateTimeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  primaryButton: { backgroundColor: theme.colors.brightRed, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: theme.colors.white, fontWeight: '800', fontSize: 16 },
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