import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { authService } from '../services/api';
import { User, Lock, Bike, ArrowRight, Apple, Smartphone, Mail, Shield, Eye, EyeOff } from 'lucide-react-native';
import { Theme } from '../theme';

const { width } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('staff');
  const [phone, setPhone] = useState('');
  const [usernameStatus, setUsernameStatus] = useState(null); // 'checking', 'available', 'taken', null
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (username.length >= 3) checkAvailability();
      else setUsernameStatus(null);
    }, 250);
    return () => clearTimeout(timer);
  }, [username]);

  const checkAvailability = async () => {
    setUsernameStatus('checking');
    try {
      const res = await authService.checkUsername(username);
      setUsernameStatus(res.available ? 'available' : 'taken');
    } catch (e) {
      setUsernameStatus(null);
    }
  };

  const handleSignUp = async () => {
    if (!name || !username || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      Alert.alert('Weak Password', 'Password must be at least 8 characters long and contain both letters and numbers.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await authService.signup(name, email, password, role, username, phone);
      navigation.replace('Main');
    } catch (err) {
      Alert.alert('Registration Failed', err.response?.data?.message || err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.glowTop} />

      <View style={styles.header}>
        <View style={styles.brandIcon}>
          <Bike size={40} color={Theme.colors.primary} />
          <View style={styles.brandIconBorder} />
        </View>
        <Text style={styles.title}>Join SRI APARNA</Text>
        <Text style={styles.subtitle}>Cycle and Bike Stand Manager</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputWrapper}>
          <Text style={styles.label}>FULL NAME</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={Theme.colors.onSurfaceVariant} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. Arjun Singh"
              placeholderTextColor={Theme.colors.outline}
              value={name}
              onChangeText={setName}
            />
          </View>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>USERNAME (UNIQUE)</Text>
          <View style={styles.inputContainer}>
            <User size={20} color={Theme.colors.primary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="e.g. arjun_hub"
              placeholderTextColor={Theme.colors.outline}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
            {usernameStatus === 'checking' && <ActivityIndicator size="small" color={Theme.colors.primary} />}
            {usernameStatus === 'available' && <Text style={[styles.statusTag, { color: '#4ADE80' }]}>Available</Text>}
            {usernameStatus === 'taken' && <Text style={[styles.statusTag, { color: Theme.colors.error }]}>Taken</Text>}
          </View>
        </View>

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
          <Text style={styles.label}>PHONE NUMBER</Text>
          <View style={styles.inputContainer}>
            <Smartphone size={20} color={Theme.colors.onSurfaceVariant} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="+91 99999 99999"
              placeholderTextColor={Theme.colors.outline}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
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
          <Text style={styles.hintText}>* Min 8 characters with at least one number & letter</Text>
        </View>

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>CONFIRM PASSWORD</Text>
          <View style={styles.inputContainer}>
            <Lock size={20} color={Theme.colors.onSurfaceVariant} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Theme.colors.outline}
              secureTextEntry={!showConfirmPassword}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={20} color={Theme.colors.primary} /> : <Eye size={20} color={Theme.colors.onSurfaceVariant} />}
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Type hidden - defaulting to staff */}

        <TouchableOpacity style={styles.mainButton} onPress={handleSignUp} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={Theme.colors.surface} />
          ) : (
            <View style={styles.btnContent}>
              <Text style={styles.mainButtonText}>CREATE ACCOUNT</Text>
              <ArrowRight size={20} color={Theme.colors.surface} />
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.linkText}>Log In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center', padding: 25 },
  glowTop: { position: 'absolute', top: -100, right: -100, width: 300, height: 300, backgroundColor: Theme.colors.primary, opacity: 0.05, borderRadius: 150 },
  header: { alignItems: 'center', marginBottom: 40 },
  brandIcon: { width: 80, height: 80, backgroundColor: Theme.colors.surfaceHigh, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  brandIconBorder: { position: 'absolute', inset: 0, borderWidth: 1, borderColor: Theme.colors.primary, opacity: 0.1, borderRadius: 20 },
  title: { fontSize: 32, fontWeight: '900', color: Theme.colors.primary, letterSpacing: -1, textTransform: 'uppercase' },
  subtitle: { fontSize: 16, color: Theme.colors.onSurfaceVariant, letterSpacing: 0.5 },
  form: { width: '100%' },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 2, marginBottom: 8, marginLeft: 15 },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 20, paddingHorizontal: 20, height: 60 },
  inputIcon: { marginRight: 15 },
  input: { flex: 1, color: Theme.colors.onSurface, fontSize: 16 },
  hintText: { fontSize: 10, color: Theme.colors.outline, marginTop: 8, marginLeft: 15, fontWeight: '500', opacity: 0.8 },
  mainButton: { backgroundColor: Theme.colors.primary, height: 65, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  btnContent: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  mainButtonText: { color: Theme.colors.background, fontSize: 16, fontWeight: '900', letterSpacing: 0 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30 },
  footerText: { color: Theme.colors.onSurfaceVariant },
  linkText: { color: Theme.colors.primary, fontWeight: '800' },
  roleContainer: { flexDirection: 'row', gap: 10, marginTop: 10 },
  roleBtn: { flex: 1, height: 50, borderRadius: 15, backgroundColor: Theme.colors.surface, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#333' },
  roleBtnActive: { backgroundColor: Theme.colors.primary, borderColor: Theme.colors.primary },
  roleBtnText: { color: Theme.colors.onSurfaceVariant, fontWeight: '700', fontSize: 13 },
  roleBtnTextActive: { color: Theme.colors.background },
  statusTag: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
});

export default SignUpScreen;
