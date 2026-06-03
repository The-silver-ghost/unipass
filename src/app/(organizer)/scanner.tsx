import React from 'react';
import { StyleSheet, Text, View, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function ScannerScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.pageTitle}>Scan E-Pass</Text>
        </View>

        <View style={styles.content}>
          <Text style={styles.instructionText}>
            Align the student's QR code within the frame to verify their ticket.
          </Text>

          <View style={[theme.glassmorphism, styles.cameraPlaceholder]}>
            <View style={styles.scannerFrame}>
              <Text style={styles.placeholderText}>[ Camera Feed Goes Here ]</Text>
            </View>
          </View>

          <Text style={styles.statusText}>Waiting for camera...</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingTop: 60, paddingBottom: 20 },
  backButton: { marginRight: 16, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backButtonText: { color: theme.colors.white, fontWeight: '600' },
  pageTitle: { color: theme.colors.white, fontSize: 28, fontWeight: '800' },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  instructionText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20, lineHeight: 24 },
  cameraPlaceholder: { padding: 16, borderRadius: 24, width: '100%', aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  scannerFrame: { width: '100%', height: '100%', borderWidth: 2, borderColor: theme.colors.brightRed, borderRadius: 16, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  placeholderText: { color: 'rgba(255,255,255,0.5)', fontWeight: 'bold', fontSize: 16 },
  statusText: { color: theme.colors.white, opacity: 0.5, fontSize: 14, fontWeight: 'bold', marginTop: 40, letterSpacing: 2, textTransform: 'uppercase' },
});