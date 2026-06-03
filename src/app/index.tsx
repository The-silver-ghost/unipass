import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import { theme } from '../constants/theme';

export default function WelcomeScreen() {
  const router = useRouter(); 

  return (
    <LinearGradient 
      colors={[theme.colors.bg, theme.colors.bgDark]} 
      style={styles.mainContainer}
    >
      <StatusBar barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to</Text>
        <Text style={styles.titleText}>UniPass</Text>
        <View style={styles.titleUnderline} />
        <Text style={styles.subtitleText}>MMU's Official Event Ticketing Platform</Text>
      </View>

      <View style={[theme.glassmorphism, styles.glassContainer]}>
        <Text style={styles.selectionTitle}>Please select your role to continue:</Text>
        
        <Pressable style={styles.primaryButton} onPress={() => router.push('/auth')}>
          <Text style={styles.primaryButtonText}>I am a Student / Attendee</Text>
        </Pressable>
        
        <Text style={styles.orText}>— or —</Text>

        <Pressable style={styles.primaryButton} onPress={() => router.push('/auth')}>
          <Text style={styles.primaryButtonText}>I am an Event Organizer</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  mainContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  header: { alignItems: 'center', marginBottom: 60 },
  welcomeText: { color: theme.colors.white, fontSize: 20, fontWeight: '300', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 },
  titleText: { color: theme.colors.white, fontSize: 60, fontWeight: '800', letterSpacing: -1 },
  titleUnderline: { width: 120, height: 4, backgroundColor: theme.colors.brightRed, borderRadius: 2, marginTop: 4, marginBottom: 16 },
  subtitleText: { color: theme.colors.white, fontSize: 16, fontWeight: '400', textAlign: 'center', lineHeight: 24, opacity: 0.9 },
  glassContainer: { padding: 24, marginBottom: 20, width: '100%' },
  selectionTitle: { color: theme.colors.white, fontSize: 18, fontWeight: '600', textAlign: 'center', marginBottom: 24, letterSpacing: 0.5 },
  orText: { color: theme.colors.white, fontSize: 16, fontWeight: '400', textAlign: 'center', opacity: 0.6, marginVertical: 12 },
  primaryButton: { backgroundColor: theme.colors.white, borderWidth: 1, borderColor: 'rgba(255, 255, 255, 0.3)', borderRadius: 16, paddingVertical: 18, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'center' },
  primaryButtonText: { color: theme.colors.brightRed, fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});