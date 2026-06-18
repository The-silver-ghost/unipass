// auth.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, TextInput, View, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { handleRegistration } from '../usr/RegistrationController';
import { API_BASE_URL } from '../config';
import { userSession } from '../usr/UserSession';

import { useDebugPause, triggerTerminalResume } from '../utils/debugPause';

export default function AuthScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { pauseDebug } = useDebugPause();
  
  const [stage, setStage] = useState(1);
  const [role, setRole] = useState<'student' | 'organizer'>('student');

  useEffect(() => {
    if (params.selectedRole === 'student' || params.selectedRole === 'organizer') {
      setRole(params.selectedRole);
    }
  }, [params.selectedRole]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameOrClub, setNameOrClub] = useState('');
  const [studentID, setStudentID] = useState('');

  const handleLoginSubmit = async () => {
    if (!email || !password) {
      if (typeof alert !== 'undefined') alert("Please fill up both Email and Password to log in.");
      else Alert.alert("Input Error", "Please fill up both Email and Password to log in.");
      return;
    } 

    try {
      // Dump raw email and target URL before fetch
      await pauseDebug({ email, url: `${API_BASE_URL}/login` });

      console.log(`[Web Client Test] Attempting login for: ${email}`);
      const backendUrl = `${API_BASE_URL}/login`; 

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      // Dump raw fetch response metadata
      await pauseDebug({ status: response.status, ok: response.ok });

      const data = await response.json();

      // Dump raw json data received
      await pauseDebug(data);

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      userSession.setUser({
        id: data.user.id,
        name: data.user.full_name,
        email: data.user.email,
        role: data.user.role.toLowerCase() as 'student' | 'organizer',
      });

      // Dump session data after mapping it locally
      await pauseDebug(userSession.getUser());

      if (typeof alert !== 'undefined') alert(`Welcome Back, ${data.user.full_name}!`);
      else Alert.alert("Welcome Back!", `Logged in successfully as ${data.user.full_name}`);
      
      if (data.user.role.toLowerCase() === 'student') {
        router.push('/(student)/dashboard');
      } else {
        router.push('/(organizer)/dashboard');
      }

    } catch (error: any) {
      // Dump raw error details
      await pauseDebug({ error: error.message });

      if (typeof alert !== 'undefined') alert(`Login Failed: ${error.message}`);
      else Alert.alert("Login Failed", error.message);
    }
  };

  const handleNextStage = () => {
    if (!email.trim() || !password.trim()) {
      if (typeof alert !== 'undefined') {
        alert("Please fill up both Email and Password to begin registration.");
      } else {
        Alert.alert("Input Error", "Please fill up both Email and Password to begin registration.");
      }
      return; 
    }

    if (!email.includes('@')) {
      if (typeof alert !== 'undefined') alert("Please enter a valid email address.");
      else Alert.alert("Input Error", "Please enter a valid email address.");
      return;
    }

    setStage(2);
  };  

  const handleSignUpFormSubmit = async () => {
    const registrationPayload: any = { email, password };

    if (role === 'student') {
      registrationPayload.name = nameOrClub;
      registrationPayload.studentID = studentID;
    } else {
      registrationPayload.name = nameOrClub; 
      registrationPayload.clubName = nameOrClub;
    }

    try {
      // Dump payload tracking data before account registration
      await pauseDebug({ role, registrationPayload });

      const createdUser = await handleRegistration(role, registrationPayload);
      
      // Dump raw created user profile info returned from system module
      await pauseDebug(createdUser);

      userSession.setUser({
        id: createdUser.id || '',
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role as 'student' | 'organizer',
      });

      if (typeof alert !== 'undefined') alert("Registration Success!");
      else Alert.alert("Registration Success", `Welcome!`);
      router.push(role === 'student' ? '/(student)/dashboard' : '/(organizer)/dashboard');
    } catch (error: any) {
      // Dump registration exception logs
      await pauseDebug({ registrationError: error.message });

      if (typeof alert !== 'undefined') alert(`Registration Error: ${error.message}`);
      else Alert.alert("Registration Error", error.message);
    }
  };

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'center' }}>
          <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled">
            <View style={styles.header}>
              <Pressable onPress={() => stage === 2 ? setStage(1) : router.back()} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Back</Text>
              </Pressable>
              <Text style={styles.pageTitle}>
                {stage === 1 
                  ? `Login / Register as ${role === 'student' ? 'Student' : 'Organizer'}` 
                  : 'Complete Profile'
                }
              </Text>
            </View>

            <View style={[theme.glassmorphism, styles.formContainer]}>
              {stage === 1 && (
                <>
                  <TextInput 
                    style={styles.input} 
                    placeholder="Email Address" 
                    placeholderTextColor={theme.colors.textMuted}
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                  <TextInput 
                    style={styles.input} 
                    placeholder="Password" 
                    placeholderTextColor={theme.colors.textMuted} 
                    secureTextEntry 
                    value={password}
                    onChangeText={setPassword}
                  />
                  
                  <Pressable style={styles.primaryButton} onPress={handleLoginSubmit}>
                    <Text style={styles.primaryButtonText}>Log In</Text>
                  </Pressable>

                  <Pressable style={styles.secondaryButton} onPress={handleNextStage}>  
                    <Text style={styles.secondaryButtonText}>New User? Register Here →</Text>
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
                  
                  <Pressable style={styles.primaryButton} onPress={handleSignUpFormSubmit}>
                    <Text style={styles.primaryButtonText}>Create Account</Text>
                  </Pressable>
                </>
              )}
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
  container: { flex: 1, padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 40, marginTop: 40 },
  backButton: { marginRight: 16, padding: 8, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 8 },
  backButtonText: { color: theme.colors.white, fontWeight: '600' },
  pageTitle: { color: theme.colors.white, fontSize: 22, fontWeight: '800' },
  formContainer: { padding: 24 },
  input: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: 16, color: theme.colors.white, fontSize: 16, marginBottom: 16 },
  primaryButton: { backgroundColor: theme.colors.white, paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: theme.colors.brightRed, fontWeight: '800', fontSize: 18 },
  secondaryButton: { paddingVertical: 14, alignItems: 'center', marginTop: 15 },
  secondaryButtonText: { color: theme.colors.white, fontWeight: '600', fontSize: 15, textDecorationLine: 'underline' },
  
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
    elevation: 5,
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