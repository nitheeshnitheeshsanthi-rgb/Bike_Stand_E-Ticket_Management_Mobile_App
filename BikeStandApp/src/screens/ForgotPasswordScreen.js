import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { authService } from '../services/api';
import { Mail, ArrowRight, ChevronLeft, ShieldCheck } from 'lucide-react-native';
import { Theme } from '../theme';

const { width } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    setLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      Alert.alert('Success', response.message, [
        { text: 'OK', onPress: () => navigation.navigate('VerifyOTP', { email }) }
      ]);
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Something went wrong');
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
            <Text style={styles.title}>Recovery Mode</Text>
            <Text style={styles.subtitle}>Enter your email to receive a recovery OTP</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>EMAIL ADDRESS</Text>
              <View style={styles.inputContainer}>
                <Mail size={20} color={Theme.colors.onSurfaceVariant} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor={Theme.colors.outline}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.mainButton} 
              onPress={handleSendOTP} 
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={Theme.colors.background} />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.mainButtonText}>SEND CODE</Text>
                  <ArrowRight size={20} color={Theme.colors.background} />
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
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface, borderRadius: 20, paddingHorizontal: 20, height: 65, borderWidth: 1, borderColor: '#333' },
  inputIcon: { marginRight: 15 },
  input: { flex: 1, color: Theme.colors.onSurface, fontSize: 16 },
  mainButton: { backgroundColor: Theme.colors.primary, height: 65, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mainButtonText: { color: Theme.colors.background, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
});

export default ForgotPasswordScreen;
