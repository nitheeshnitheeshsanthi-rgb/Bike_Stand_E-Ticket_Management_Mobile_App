import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert, TextInput, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/api';
import { User, Mail, Shield, LogOut, ChevronRight, Settings, CreditCard, Bell, ShieldCheck } from 'lucide-react-native';
import { Theme } from '../theme';

const ProfileScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    const userData = await AsyncStorage.getItem('user');
    if (userData) {
      const parsed = JSON.parse(userData);
      setUser(parsed);
      setNewName(parsed.name);
      setNewUsername(parsed.username || '');
      setNewPhone(parsed.phone || '');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', onPress: async () => {
        await AsyncStorage.clear();
        navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
      }}
    ]);
  };

  const menuActions = {
    personal: () => Alert.alert('Personal Info', `Name: ${user?.name}\nEmail: ${user?.email}\nRole: ${user?.role}`),
    payment: () => Alert.alert('Payment Methods', 'Default Wallet: GPay (Linked)\nLinked Card: **** 4421\n\nSecurity: Encrypted via Sri Aparna Pay'),
    notifications: () => Alert.alert('Notifications', 'Push Notifications: Enabled\nEmail Alerts: Enabled\nSMS Service: Active'),
    privacy: () => Alert.alert('Privacy & Security', 'Biometric Lock: Enabled\nData Encryption: AES-256\nLocation Access: Only while using'),
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatarPlaceholder}>
             <User size={48} color={Theme.colors.primary} />
          </View>
          <View style={styles.roleBadge}>
             <ShieldCheck size={12} color={Theme.colors.surface} />
             <Text style={styles.roleText}>{user?.role?.toUpperCase() || 'RIDER'}</Text>
          </View>
        </View>
        <Text style={styles.name}>{user?.name || 'Aparna Member'}</Text>
        {user?.username && <Text style={styles.usernameText}>@{user.username}</Text>}
        <Text style={styles.userId}>{user?.email}</Text>
        
        <TouchableOpacity style={styles.editBadge} onPress={() => setEditing(true)}>
          <Settings size={14} color="#fff" />
          <Text style={styles.editText}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT SETTINGS</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={menuActions.personal}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}><User size={20} color={Theme.colors.primary} /></View>
              <Text style={styles.menuText}>Personal Info</Text>
            </View>
            <ChevronRight size={20} color={Theme.colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={menuActions.payment}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}><CreditCard size={20} color={Theme.colors.secondary} /></View>
              <Text style={styles.menuText}>Payment Methods</Text>
            </View>
            <ChevronRight size={20} color={Theme.colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={menuActions.notifications}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}><Bell size={20} color={Theme.colors.tertiary} /></View>
              <Text style={styles.menuText}>Notifications</Text>
            </View>
            <ChevronRight size={20} color={Theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PREFERENCES</Text>
          
          <TouchableOpacity style={styles.menuItem} onPress={menuActions.privacy}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}><Shield size={20} color={Theme.colors.primary} /></View>
              <Text style={styles.menuText}>Privacy & Security</Text>
            </View>
            <ChevronRight size={20} color={Theme.colors.onSurfaceVariant} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuLeft}>
              <View style={styles.iconBox}><Settings size={20} color={Theme.colors.onSurfaceVariant} /></View>
              <Text style={styles.menuText}>App Settings</Text>
            </View>
            <ChevronRight size={20} color={Theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={20} color={Theme.colors.error} />
          <Text style={styles.logoutText}>LOG OUT</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>SRI APARNA v1.0.0 (PREMIUM)</Text>
      </ScrollView>

      {/* Edit Modal Placeholder / Logic */}
      {editing && (
        <View style={styles.editOverlay}>
          <View style={styles.editModal}>
            <Text style={styles.editTitle}>EDIT PROFILE</Text>
            
            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>FULL NAME</Text>
              <TextInput style={styles.editInput} value={newName} onChangeText={setNewName} />
            </View>

            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>UNIQUE USERNAME</Text>
              <TextInput style={styles.editInput} value={newUsername} onChangeText={setNewUsername} autoCapitalize="none" placeholder="e.g. arjun_hub" placeholderTextColor="#666" />
              <Text style={styles.editHint}>* Globally unique handle</Text>
            </View>

            <View style={styles.editInputWrapper}>
              <Text style={styles.editLabel}>PHONE NUMBER</Text>
              <TextInput style={styles.editInput} value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" placeholder="+91 00000 00000" placeholderTextColor="#666" />
            </View>

            <View style={styles.editActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}><Text style={styles.cancelText}>Cancel</Text></TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={async () => {
                if (newUsername && newUsername.length < 3) {
                  Alert.alert('Error', 'Username must be at least 3 characters');
                  return;
                }
                setLoading(true);
                try {
                  const res = await authService.updateProfile({ name: newName, username: newUsername, phone: newPhone });
                  if (res.success) {
                    await fetchUser();
                    setEditing(false);
                    Alert.alert('Perfect ✅', 'Your profile identity has been updated.');
                  }
                } catch (e) {
                  console.log('Profile Update Error:', e);
                  Alert.alert('Update Alert ⚠️', e.response?.data?.message || 'Check your internet connection or try a different username.');
                } finally {
                  setLoading(false);
                }
              }}>
                {loading ? <ActivityIndicator size="small" color="#000" /> : <Text style={styles.saveText}>Save Changes</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { alignItems: 'center', paddingVertical: 50, borderBottomWidth: 1, borderBottomColor: Theme.colors.surfaceVariant, backgroundColor: Theme.colors.surface },
  avatarContainer: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: Theme.colors.primary, padding: 5, marginBottom: 20, justifyContent: 'center', alignItems: 'center' },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  roleBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: Theme.colors.primary, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 4, elevation: 5 },
  roleText: { color: Theme.colors.surface, fontSize: 10, fontWeight: '900' },
  name: { fontSize: 24, fontWeight: '800', color: Theme.colors.onSurface },
  userId: { fontSize: 13, color: Theme.colors.onSurfaceVariant, fontWeight: '700', marginTop: 5, letterSpacing: 1 },
  content: { flex: 1, padding: 25 },
  section: { marginBottom: 35 },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 3, marginBottom: 20 },
  menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Theme.colors.surface, padding: 18, borderRadius: 20, marginBottom: 12 },
  menuLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  iconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  menuText: { fontSize: 16, fontWeight: '700', color: Theme.colors.onSurface },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 20, backgroundColor: Theme.colors.error + '11', borderRadius: 20, borderWidth: 1, borderColor: Theme.colors.error + '33', marginTop: 10 },
  logoutText: { color: Theme.colors.error, fontWeight: '900', fontSize: 14, letterSpacing: 1 },
  versionText: { textAlign: 'center', color: Theme.colors.onSurfaceVariant, fontSize: 10, fontWeight: '700', marginTop: 40, marginBottom: 150 },
  usernameText: { color: Theme.colors.primary, fontSize: 13, fontWeight: '800', marginTop: 5 },
  editBadge: { backgroundColor: '#333', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 15 },
  editText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  editOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: 25 },
  editModal: { backgroundColor: Theme.colors.surface, width: '100%', borderRadius: 32, padding: 30, gap: 20 },
  editTitle: { fontSize: 12, fontWeight: '900', color: Theme.colors.onSurfaceVariant, letterSpacing: 4, textAlign: 'center', marginBottom: 10 },
  editInputWrapper: { gap: 10 },
  editLabel: { fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 1 },
  editInput: { backgroundColor: '#000', height: 60, borderRadius: 15, paddingHorizontal: 20, color: '#fff', fontSize: 16 },
  editHint: { fontSize: 10, color: Theme.colors.outline, marginLeft: 5 },
  editActions: { flexDirection: 'row', gap: 15, marginTop: 10 },
  cancelBtn: { flex: 1, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: '#222' },
  saveBtn: { flex: 1, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.primary },
  cancelText: { color: '#fff', fontWeight: '800' },
  saveText: { color: '#000', fontWeight: '900' },
});

export default ProfileScreen;
