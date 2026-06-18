import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView,  Pressable, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { theme } from '../../constants/theme';
import { API_BASE_URL } from '../../config';

export default function SendAnnouncementScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [announcement, setAnnouncement] = useState('');
  const [loading, setLoading] = useState(false);

  const eventId = params.id as string;
  const organizerId = params.organizerId as string;
  const eventTitle = params.title as string;

  const handleSend = async () => {
    if (!announcement.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizerId,
          eventId,
          message: announcement
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('Announcement sent successfully!');
        router.back();
      } else {
        alert(data.message || 'Failed to send announcement');
      }
    } catch (error) {
      console.error(error);
      alert('Error sending announcement');
    } finally {
      setLoading(false);
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
            <Text style={styles.pageTitle}>Announcement</Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
            <View style={[theme.glassmorphism, styles.card]}>
              <Text style={styles.cardHeader}>Broadcast Notification</Text>
              <Text style={styles.cardSubtext}>This will send a push notification to all students holding an E-Pass for {eventTitle || 'this event'}.</Text>
              
              <View style={styles.inputGroup}>
                <TextInput 
                  style={[styles.input, styles.textArea]} 
                  placeholder="e.g., The venue has been moved to the Main Hall..." 
                  placeholderTextColor="rgba(255,255,255,0.3)" 
                  multiline
                  value={announcement}
                  onChangeText={setAnnouncement}
                />
              </View>
              
              <Pressable 
                style={[styles.primaryButton, loading && { opacity: 0.5 }]} 
                onPress={handleSend}
                disabled={loading}
              >
                <Text style={styles.primaryButtonText}>{loading ? 'Sending...' : 'Send Announcement'}</Text>
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
  cardHeader: { color: theme.colors.white, fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  cardSubtext: { color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 20, lineHeight: 20 },
  inputGroup: { marginBottom: 20 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 16, color: theme.colors.white, fontSize: 16 },
  textArea: { height: 120, textAlignVertical: 'top' },
  primaryButton: { backgroundColor: theme.colors.brightRed, paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  primaryButtonText: { color: theme.colors.white, fontWeight: '800', fontSize: 16 },
});