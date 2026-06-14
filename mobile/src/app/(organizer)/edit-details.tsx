import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function EditDetailsScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.pageTitle}>Edit Details</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={[theme.glassmorphism, styles.card]}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Update Description</Text>
              <TextInput 
                style={[styles.input, styles.textArea]} 
                placeholder="Update event details..." 
                placeholderTextColor="rgba(255,255,255,0.3)" 
                multiline
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Update Capacity</Text>
              <TextInput style={styles.input} placeholder="500" placeholderTextColor="rgba(255,255,255,0.3)" keyboardType="numeric" />
            </View>
            <Pressable style={styles.primaryButton} onPress={() => router.back()}>
              <Text style={styles.primaryButtonText}>Save Changes</Text>
            </Pressable>
          </View>
        </ScrollView>
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