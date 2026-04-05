import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { authService } from '../services/api';
import { ShieldCheck, ArrowRight, ChevronLeft, RefreshCw } from 'lucide-react-native';
import { Theme } from '../theme';

const VerifyOTPScreen = ({ navigation, route }) => {
  const { email } = route.params || {};
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit OTP');
      return;
    }
    
    setLoading(true);
    try {
      const response = await authService.verifyOTP(email, otp);
      if (response.success) {
        navigation.navigate('ResetPassword', { email, resetToken: response.resetToken });
      }
    } catch (err) {
      Alert.alert('Verification Failed', err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authService.forgotPassword(email);
      Alert.alert('OTP Sent', 'A new verification code has been sent to your email.');
    } catch (err) {
      Alert.alert('Error', 'Could not resend OTP. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={24} color={Theme.colors.onSurface} />
          </TouchableOpacity>

          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={40} color={Theme.colors.primary} />
            </View>
            <Text style={styles.title}>Verify It's You</Text>
            <Text style={styles.subtitle}>Enter the 6-digit code sent to {email}</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>6-DIGIT OTP</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.input}
                  placeholder="000 000"
                  placeholderTextColor={Theme.colors.outline}
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                  letterSpacing={10}
                  textAlign="center"
                  selectTextOnFocus
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.mainButton} 
              onPress={handleVerify} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.background} />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.mainButtonText}>VERIFY CODE</Text>
                  <ArrowRight size={20} color={Theme.colors.background} />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.resendBtn} 
              onPress={handleResend} 
              disabled={resending}
            >
              {resending ? (
                <ActivityIndicator size="small" color={Theme.colors.primary} />
              ) : (
                <View style={styles.resendContent}>
                  <RefreshCw size={16} color={Theme.colors.primary} style={styles.resendIcon} />
                  <Text style={styles.resendText}>I didn't receive code</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scrollContent: { flexGrow: 1, padding: 25, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 20, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: Theme.colors.surface, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: Theme.colors.primary, textTransform: 'uppercase', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: Theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  form: { width: '100%' },
  inputWrapper: { marginBottom: 30 },
  label: { fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 2, marginBottom: 10, marginLeft: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface, borderRadius: 20, paddingHorizontal: 20, height: 75, borderWidth: 1, borderColor: '#333' },
  input: { flex: 1, color: Theme.colors.primary, fontSize: 32, fontWeight: '800' },
  mainButton: { backgroundColor: Theme.colors.primary, height: 65, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mainButtonText: { color: Theme.colors.background, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  resendBtn: { marginTop: 30, alignSelf: 'center' },
  resendContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  resendText: { color: Theme.colors.primary, fontWeight: '700', fontSize: 14 },
  resendIcon: { transform: [{ rotate: '45deg' }] }
});

export default VerifyOTPScreen;
