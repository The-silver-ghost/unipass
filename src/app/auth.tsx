import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../constants/theme';

export default function AuthScreen() {
  const router = useRouter();
  const [stage, setStage] = useState(1);
  const [role, setRole] = useState<'student' | 'organizer'>('student');

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
        
        <View style={styles.header}>
          <Pressable onPress={() => stage === 2 ? setStage(1) : router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.pageTitle}>{stage === 1 ? 'Login / Register' : 'Complete Profile'}</Text>
        </View>

        <View style={[theme.glassmorphism, styles.formContainer]}>
          
          {stage === 1 && (
            <>
              <View style={styles.roleToggle}>
                <Pressable style={[styles.roleBtn, role === 'student' && styles.roleBtnActive]} onPress={() => setRole('student')}>
                  <Text style={[styles.roleText, role === 'student' && styles.roleTextActive]}>Student</Text>
                </Pressable>
                <Pressable style={[styles.roleBtn, role === 'organizer' && styles.roleBtnActive]} onPress={() => setRole('organizer')}>
                  <Text style={[styles.roleText, role === 'organizer' && styles.roleTextActive]}>Organizer</Text>
                </Pressable>
              </View>

              <TextInput style={styles.input} placeholder="Email Address" placeholderTextColor={theme.colors.textMuted} />
              <TextInput style={styles.input} placeholder="Password" placeholderTextColor={theme.colors.textMuted} secureTextEntry />
              
              <Pressable style={styles.primaryButton} onPress={() => setStage(2)}>
                <Text style={styles.primaryButtonText}>Continue</Text>
              </Pressable>
            </>
          )}

          {stage === 2 && (
            <>
              <TextInput 
                style={styles.input} 
                placeholder={role === 'student' ? 'Full Name' : 'Club / Society Name'} 
                placeholderTextColor={theme.colors.textMuted} 
              />
              {role === 'student' && (
                <TextInput style={styles.input} placeholder="Student ID (e.g. 1211100000)" placeholderTextColor={theme.colors.textMuted} />
              )}
              
              <Pressable 
                style={styles.primaryButton} 
                onPress={() => router.push(role === 'student' ? '/(student)/dashboard' : '/(organizer)/dashboard')}
              >
                <Text style={styles.primaryButtonText}>Create Account</Text>
              </Pressable>
            </>
          )}

        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, marginTop: 40 },
  backButton: { marginRight: 16, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backButtonText: { color: theme.colors.white, fontWeight: '600' },
  pageTitle: { color: theme.colors.white, fontSize: 28, fontWeight: '800' },
  
  formContainer: { padding: 24 },
  roleToggle: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, padding: 4, marginBottom: 24 },
  roleBtn: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  roleBtnActive: { backgroundColor: theme.colors.brightRed },
  roleText: { color: theme.colors.textMuted, fontWeight: '600' },
  roleTextActive: { color: theme.colors.white, fontWeight: '800' },
  
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 16, color: theme.colors.white, fontSize: 16, marginBottom: 16 },
  primaryButton: { backgroundColor: theme.colors.white, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: theme.colors.brightRed, fontWeight: '800', fontSize: 18 },
});