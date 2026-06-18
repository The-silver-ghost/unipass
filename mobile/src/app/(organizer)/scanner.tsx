import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Pressable, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Camera, CameraView } from 'expo-camera';
import { theme } from '../../constants/theme';
import { API_BASE_URL } from '../../config';
import { userSession } from '../../usr/UserSession';
import { EPassManager } from '../../epass/EPassManager';
import { useDebugPause, triggerTerminalResume } from '../../utils/debugPause';

export default function ScannerScreen() {
  const router = useRouter();
  const { pauseDebug } = useDebugPause();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
    setScanned(true);

    try {
      const user = userSession.getUser();
      if (!user) return;

      // State Pattern transition simulation
      const epassContext = EPassManager.createContext('Active', 'epass-id-placeholder', 'reg-id-placeholder');
      const oldState = epassContext.getStateName();
      epassContext.scan();
      const newState = epassContext.getStateName();

      await pauseDebug({
        pattern: "State Pattern (E-Pass State)",
        action: "Scanning E-Pass (State transition simulation)",
        qrCode: data,
        previousState: oldState,
        newState: newState
      });

      const response = await fetch(`${API_BASE_URL}/epass/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          qrCode: data,
          organizerId: user.id
        })
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'E-Pass scanned successfully!', [
          { text: 'Scan Next', onPress: () => setScanned(false) }
        ]);
      } else {
        Alert.alert('Error', result.message || 'Scan failed', [
          { text: 'Try Again', onPress: () => setScanned(false) }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to connect to server.', [
        { text: 'Try Again', onPress: () => setScanned(false) }
      ]);
    }
  };

  if (hasPermission === null) {
    return <Text>Requesting for camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

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
              <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>

          {scanned && (
            <Pressable style={styles.scanNextButton} onPress={() => setScanned(false)}>
              <Text style={styles.scanNextButtonText}>Tap to Scan Again</Text>
            </Pressable>
          )}
        </View>
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
  backButton: { marginRight: 16, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backButtonText: { color: theme.colors.white, fontWeight: '600' },
  pageTitle: { color: theme.colors.white, fontSize: 28, fontWeight: '800' },
  content: { flex: 1, padding: 24, alignItems: 'center', justifyContent: 'center', paddingBottom: 100 },
  instructionText: { color: 'rgba(255,255,255,0.7)', fontSize: 16, textAlign: 'center', marginBottom: 40, paddingHorizontal: 20, lineHeight: 24 },
  cameraPlaceholder: { padding: 16, borderRadius: 24, width: '100%', height: 350, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  scannerFrame: { flex: 1, width: '100%', borderRadius: 16, overflow: 'hidden', backgroundColor: 'transparent' },
  scanNextButton: { marginTop: 40, paddingVertical: 14, paddingHorizontal: 30, backgroundColor: theme.colors.white, borderRadius: 30 },
  scanNextButtonText: { color: theme.colors.bgDark, fontWeight: 'bold', fontSize: 16 },
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