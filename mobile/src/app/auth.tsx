import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useState, useEffect } from 'react';
import { Pressable,  StyleSheet, Text, TextInput, View, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { theme } from '../constants/theme';
import { handleRegistration } from '../usr/RegistrationController';
import { API_BASE_URL } from '../config';
import { userSession } from '../usr/UserSession';

export default function AuthScreen() {
  const router = useRouter();
  
  // 1. READ PARAMS PASSED FROM THE LANDING PAGE
  // Expects the landing page to route like: router.push('/auth?selectedRole=student')
  const params = useLocalSearchParams();
  
  const [stage, setStage] = useState(1);
  
  // Initialize role based on selection, default to student if something goes wrong
  const [role, setRole] = useState<'student' | 'organizer'>('student');

  // Update role dynamically if params change
  useEffect(() => {
    if (params.selectedRole === 'student' || params.selectedRole === 'organizer') {
      setRole(params.selectedRole);
    }
  }, [params.selectedRole]);

  // Input states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nameOrClub, setNameOrClub] = useState('');
  const [studentID, setStudentID] = useState('');

  // LOGIN HANDLER
  const handleLoginSubmit = async () => {
    if (!email || !password) {
      if (typeof alert !== 'undefined') alert("Please fill up both Email and Password to log in.");
      else Alert.alert("Input Error", "Please fill up both Email and Password to log in.");
      return;
    } 

    try {
      console.log(`[Web Client Test] Attempting login for: ${email}`);
      const backendUrl = `${API_BASE_URL}/login`; 

      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      userSession.setUser({
        id: data.user.id,
        name: data.user.full_name,
        email: data.user.email,
        role: data.user.role.toLowerCase() as 'student' | 'organizer',
      });

      if (typeof alert !== 'undefined') alert(`Welcome Back, ${data.user.full_name}!`);
      else Alert.alert("Welcome Back!", `Logged in successfully as ${data.user.full_name}`);
      
      if (data.user.role.toLowerCase() === 'student') {
        router.push('/(student)/dashboard');
      } else {
        router.push('/(organizer)/dashboard');
      }

    } catch (error: any) {
      if (typeof alert !== 'undefined') alert(`Login Failed: ${error.message}`);
      else Alert.alert("Login Failed", error.message);
    }
  };

  const handleNextStage = () => {
      // Check if either field is missing or contains only empty spaces
      if (!email.trim() || !password.trim()) {
        if (typeof alert !== 'undefined') {
          alert("Please fill up both Email and Password to begin registration.");
        } else {
          Alert.alert("Input Error", "Please fill up both Email and Password to begin registration.");
        }
        return; // Stop execution here so it doesn't change stages
      }

      // Basic email syntax safety check (optional but recommended)
      if (!email.includes('@')) {
        if (typeof alert !== 'undefined') alert("Please enter a valid email address.");
        else Alert.alert("Input Error", "Please enter a valid email address.");
        return;
      }

      // If validation passes, move forward safely
      setStage(2);
    };  


  // REGISTER HANDLER
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
      const createdUser = await handleRegistration(role, registrationPayload);
      
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
              
              {/* STAGE 1: The toggle pill row has been removed from here */}
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

              {/* STAGE 2 */}
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
});