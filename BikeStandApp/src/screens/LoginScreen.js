import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { authService } from '../services/api';
import { User, Lock, Bike, ArrowRight, Apple, Mail, Eye, EyeOff } from 'lucide-react-native';
import { Theme } from '../theme';

const { width } = Dimensions.get('window');

const LoginScreen = ({ navigation, route }) => {
  const { roleHint } = route.params || {};
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      await authService.login(email, password, roleHint);
      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    if (isNavigating) return;
    setIsNavigating(true);
    navigation.navigate('ForgotPassword');
    setTimeout(() => setIsNavigating(false), 1000);
  };

  return (
    <View style={styles.container}>
      {/* Decorative Glows */}
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <View style={styles.header}>
        <View style={styles.brandIcon}>
          <Bike size={40} color={Theme.colors.primary} />
          <View style={styles.brandIconBorder} />
        </View>
        <Text style={styles.title}>SRI APARNA</Text>
        <Text style={styles.subtitle}>{roleHint?.toUpperCase() || 'GENERAL'} PORTAL</Text>
        
        {roleHint && (
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{roleHint === 'staff' ? 'OFFICIAL ACCESS' : 'RIDER PORTAL'}</Text>
          </View>
        )}
      </View>

      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View style={styles.inputContainer}>
            <Mail size={20} color={Theme.colors.onSurfaceVariant} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="rider@aparna.io"
              placeholderTextColor={Theme.colors.outline}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>PASSWORD</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color={Theme.colors.onSurfaceVariant} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Theme.colors.outline}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={setPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color={Theme.colors.primary} /> : <Eye size={20} color={Theme.colors.onSurfaceVariant} />}
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.forgotBtn} 
          onPress={handleForgotPassword}
        >
          <Text style={styles.forgotText}>Forgot Password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.mainButton} onPress={handleLogin} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Theme.colors.surface} />
          ) : (
            <View style={styles.btnContent}>
              <Text style={styles.mainButtonText}>LOG IN</Text>
              <ArrowRight size={20} color={Theme.colors.surface} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.socialGrid}>
          <TouchableOpacity style={styles.socialBtn}>
            <Text style={styles.socialBtnText}>Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.socialBtn}>
            <Apple size={20} color={Theme.colors.onSurface} style={styles.socialIcon} />
            <Text style={styles.socialBtnText}>Apple</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to the circuit? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
          <Text style={styles.signUpText}>Create an Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center', padding: 25 },
  glowTop: { position: 'absolute', top: -100, left: -100, width: 300, height: 300, backgroundColor: Theme.colors.primary, opacity: 0.05, borderRadius: 150 },
  glowBottom: { position: 'absolute', bottom: -100, right: -100, width: 300, height: 300, backgroundColor: Theme.colors.tertiary, opacity: 0.05, borderRadius: 150 },
  header: { alignItems: 'center', marginBottom: 50 },
  brandIcon: { width: 80, height: 80, backgroundColor: Theme.colors.surfaceHigh, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  brandIconBorder: { position: 'absolute', inset: 0, borderWidth: 1, borderColor: Theme.colors.primary, opacity: 0.1, borderRadius: 20 },
  title: { fontSize: 40, fontWeight: '900', color: Theme.colors.primary, letterSpacing: -2, textTransform: 'uppercase' },
  subtitle: { fontSize: 16, color: Theme.colors.onSurfaceVariant, letterSpacing: 0.5 },
  form: { width: '100%' },
  inputWrapper: { marginBottom: 25 },
  label: { fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 2, marginBottom: 10, marginLeft: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 20, paddingHorizontal: 20, height: 65 },
  inputIcon: { marginRight: 15 },
  input: { flex: 1, color: Theme.colors.onSurface, fontSize: 16 },
  forgotBtn: { alignSelf: 'flex-end', marginBottom: 30 },
  forgotText: { color: Theme.colors.primary, fontSize: 14, fontWeight: '600' },
  mainButton: { backgroundColor: Theme.colors.primary, height: 65, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 10, shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mainButtonText: { color: Theme.colors.background, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginVertical: 30 },
  dividerLine: { flex: 1, height: 1, backgroundColor: Theme.colors.surfaceVariant, opacity: 0.3 },
  dividerText: { marginHorizontal: 15, fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant },
  socialGrid: { flexDirection: 'row', gap: 15 },
  socialBtn: { flex: 1, backgroundColor: Theme.colors.surface, height: 55, borderRadius: 15, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#333' },
  socialIcon: { marginRight: 10 },
  socialBtnText: { color: Theme.colors.onSurface, fontWeight: '700', fontSize: 14 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 40 },
  footerText: { color: Theme.colors.onSurfaceVariant },
  signUpText: { color: Theme.colors.primary, fontWeight: '800' },
  roleTag: { backgroundColor: Theme.colors.primary + '20', paddingHorizontal: 15, paddingVertical: 6, borderRadius: 10, marginTop: 15, borderWidth: 1, borderColor: Theme.colors.primary + '40' },
  roleTagText: { color: Theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1.5 },
});

export default LoginScreen;
