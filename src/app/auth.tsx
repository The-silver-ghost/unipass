import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';
import { theme } from '../constants/theme';
import { handleRegistration } from '../usr/RegistrationController'; 

export default function AuthScreen() {
  const router = useRouter();
  const [stage, setStage] = useState(1);
  const [role, setRole] = useState<'student' | 'organizer'>('student');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameOrClub, setNameOrClub] = useState('');
  const [studentID, setStudentID] = useState('');

  const handleSignUpFormSubmit = async () => {
    const registrationPayload: any = {
      email: email,
      password: password, 
    };

    if (role === 'student') {
      registrationPayload.name = nameOrClub;
      registrationPayload.studentID = studentID;
    } else {
      registrationPayload.name = nameOrClub; 
      registrationPayload.clubName = nameOrClub;
    }

    try {
      const createdUser = await handleRegistration(role, registrationPayload);
      Alert.alert(
        "Registration Success", 
        `Welcome to UniPass, ${createdUser.name}! Registered as a ${createdUser.role}.`
      );

      router.push(role === 'student' ? '/(student)/dashboard' : '/(organizer)/dashboard');
    } catch (error: any) {
      // Catches and shows validation errors thrown by StudentFactory or OrganizerFactory
      Alert.alert("Registration Error", error.message);
    }
  };

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

              <TextInput 
                style={styles.input} 
                placeholder="Email Address" 
                placeholderTextColor={theme.colors.textMuted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput 
                style={styles.input} 
                placeholder="Password" 
                placeholderTextColor={theme.colors.textMuted} 
                secureTextEntry 
                value={password}
                onChangeText={setPassword}
              />
              
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
                value={nameOrClub}
                onChangeText={setNameOrClub}
              />
              
              {role === 'student' && (
                <TextInput 
                  style={styles.input} 
                  placeholder="Student ID (e.g. 1211100000)" 
                  placeholderTextColor={theme.colors.textMuted} 
                  value={studentID}
                  onChangeText={setStudentID}
                />
              )}

              <Pressable 
                style={styles.primaryButton} 
                onPress={handleSignUpFormSubmit}
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