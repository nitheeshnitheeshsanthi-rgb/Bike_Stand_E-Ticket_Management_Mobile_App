import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { authService } from '../services/api';
import { Lock, Eye, EyeOff, Save, ShieldCheck } from 'lucide-react-native';
import { Theme } from '../theme';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email, resetToken } = route.params || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please enter both fields');
      return;
    }
    
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await authService.resetPassword(email, resetToken, newPassword);
      Alert.alert('Success', 'Password reset successful. Please log in with your new password.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (err) {
      Alert.alert('Reset Failed', err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <ShieldCheck size={40} color={Theme.colors.primary} />
            </View>
            <Text style={styles.title}>Secure Reset</Text>
            <Text style={styles.subtitle}>Set a strong new password for your account</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>NEW PASSWORD</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Theme.colors.outline}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color={Theme.colors.primary} /> : <Eye size={20} color={Theme.colors.onSurfaceVariant} />}
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>CONFIRM NEW PASSWORD</Text>
              <View style={styles.inputContainer}>
                <Lock size={20} color={Theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor={Theme.colors.outline}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.mainButton} 
              onPress={handleReset} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.background} />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.mainButtonText}>UPDATE PASSWORD</Text>
                  <Save size={20} color={Theme.colors.background} />
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
  header: { alignItems: 'center', marginBottom: 40 },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: Theme.colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 32, fontWeight: '900', color: Theme.colors.primary, textTransform: 'uppercase', letterSpacing: -1 },
  subtitle: { fontSize: 16, color: Theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 10, paddingHorizontal: 20 },
  form: { width: '100%' },
  inputWrapper: { marginBottom: 25 },
  label: { fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 2, marginBottom: 10, marginLeft: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface, borderRadius: 20, paddingHorizontal: 20, height: 65, borderWidth: 1, borderColor: '#333' },
  inputIcon: { marginRight: 15 },
  input: { flex: 1, color: Theme.colors.onSurface, fontSize: 16 },
  mainButton: { backgroundColor: Theme.colors.primary, height: 65, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mainButtonText: { color: Theme.colors.background, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
});

export default ResetPasswordScreen;
