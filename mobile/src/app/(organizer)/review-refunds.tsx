import React from 'react';
import { StyleSheet, Text, View, ScrollView, SafeAreaView, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { theme } from '../../constants/theme';

export default function ReviewRefundsScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={[theme.colors.bg, theme.colors.bgDark]} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </Pressable>
          <Text style={styles.pageTitle}>Review Refunds</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={[theme.glassmorphism, styles.refundCard]}>
            <View style={styles.refundInfo}>
              <Text style={styles.studentName}>Sanjeevan</Text>
              <Text style={styles.refundReason}>Reason: Schedule Conflict</Text>
              <Text style={styles.refundDate}>Requested: 2 hours ago</Text>
            </View>
            <View style={styles.actionRow}>
              <Pressable style={styles.denyButton}><Text style={styles.denyButtonText}>Deny</Text></Pressable>
              <Pressable style={styles.approveButton}><Text style={styles.approveButtonText}>Approve</Text></Pressable>
            </View>
          </View>

          <View style={[theme.glassmorphism, styles.refundCard]}>
            <View style={styles.refundInfo}>
              <Text style={styles.studentName}>Isaiah</Text>
              <Text style={styles.refundReason}>Reason: Other (Medical Emergency, have MC)</Text>
              <Text style={styles.refundDate}>Requested: 1 day ago</Text>
            </View>
            <View style={styles.actionRow}>
              <Pressable style={styles.denyButton}><Text style={styles.denyButtonText}>Deny</Text></Pressable>
              <Pressable style={styles.approveButton}><Text style={styles.approveButtonText}>Approve</Text></Pressable>
            </View>
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
  
  refundCard: { padding: 20, marginBottom: 16, backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 16 },
  refundInfo: { marginBottom: 16 },
  studentName: { color: theme.colors.white, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  refundReason: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 4 },
  refundDate: { color: 'rgba(255,255,255,0.5)', fontSize: 12 },
  
  actionRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 16 },
  denyButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.1)' },
  denyButtonText: { color: theme.colors.white, fontWeight: '600' },
  approveButton: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8, backgroundColor: '#28a745' },
  approveButtonText: { color: '#fff', fontWeight: 'bold' }
});