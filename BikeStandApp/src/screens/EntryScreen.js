import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Linking, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { ticketService } from '../services/api';
import { notificationService } from '../services/notifications';
import { Bike, Car, Hash, Clock, Phone, ChevronRight } from 'lucide-react-native';
import { Theme } from '../theme';

const EntryScreen = ({ navigation }) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [type, setType] = useState('Bike');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!vehicleNumber) {
      Alert.alert('Required', 'Please enter a vehicle number');
      return;
    }
    setLoading(true);
    try {
      const response = await ticketService.createEntry(vehicleNumber, type, whatsappNumber);
      const ticket = response.ticket;
      const deepLink = response.whatsappDeepLink;

      await notificationService.sendLocalNotification(
        'Parking Secured 🚲',
        `Space locked for ${vehicleNumber}. Entry time recorded.`
      );

      if (whatsappNumber) {
        Alert.alert(
          'Ticket Generated', 
          `Ticket ID: ${ticket.ticketId}\nVehicle: ${vehicleNumber}\n\nWhat would you like to do?`,
          [
            { 
              text: 'Send WhatsApp', 
              onPress: () => {
                Linking.openURL(deepLink);
                navigation.replace('TicketDetail', { ticket });
              },
              style: 'default' 
            },
            { 
              text: 'View Ticket', 
              onPress: () => navigation.replace('TicketDetail', { ticket }),
            }
          ]
        );
      } else {
        navigation.replace('TicketDetail', { ticket });
      }
    } catch (err) {
      Alert.alert('Entry Failed', err.response?.data?.message || 'Error creating ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* App Bar */}
        <View style={styles.appBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ChevronRight size={24} color={Theme.colors.primary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.logoText}>SRI APARNA</Text>
          <View style={styles.profileBox} />
        </View>

        <ScrollView 
          style={styles.scroll} 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.statusLabel}>REGISTRATION</Text>
            <Text style={styles.title}>Secure Your{"\n"}Space</Text>
          </View>

          <View style={styles.formCard}>
            {/* Type Toggle */}
            <View style={styles.toggleContainer}>
              <TouchableOpacity 
                style={[styles.toggleBtn, type === 'Bike' && styles.toggleBtnActive]} 
                onPress={() => setType('Bike')}
              >
                <Bike size={20} color={type === 'Bike' ? Theme.colors.background : Theme.colors.onSurfaceVariant} />
                <Text style={[styles.toggleText, type === 'Bike' && styles.toggleTextActive]}>Bicycle</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.toggleBtn, type === 'Scooter' && styles.toggleBtnActive]} 
                onPress={() => setType('Scooter')}
              >
                <Car size={20} color={type === 'Scooter' ? Theme.colors.background : Theme.colors.onSurfaceVariant} />
                <Text style={[styles.toggleText, type === 'Scooter' && styles.toggleTextActive]}>E-Scooter</Text>
              </TouchableOpacity>
            </View>

            {/* Vehicle Number Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Vehicle Number</Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}><Hash size={20} color={Theme.colors.primary} opacity={0.7} /></View>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. TN-09-AB-1234"
                  placeholderTextColor={Theme.colors.outline}
                  value={vehicleNumber}
                  onChangeText={setVehicleNumber}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            {/* WhatsApp Number */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>WhatsApp Number <Text style={styles.optional}>(Optional)</Text></Text>
              <View style={styles.inputContainer}>
                <View style={styles.inputIconBox}><Phone size={18} color={Theme.colors.primary} /></View>
                <View style={styles.prefixWrapper}>
                  <Text style={styles.prefixText}>+91</Text>
                  <View style={styles.prefixSeparator} />
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="10-digit number"
                  placeholderTextColor={Theme.colors.outline}
                  value={whatsappNumber}
                  onChangeText={setWhatsappNumber}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>
          </View>

          <View style={styles.infoNoteCard}>
            <Clock size={20} color={Theme.colors.primary} />
            <Text style={styles.infoNoteText}>Payment will be calculated automatically at the exit point based on actual stay duration.</Text>
          </View>
        </ScrollView>

        {/* Floating Action Bar */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.mainBtn} onPress={handleSubmit} disabled={loading} activeOpacity={0.8}>
            {loading ? (
              <ActivityIndicator color={Theme.colors.background} />
            ) : (
              <View style={styles.btnRow}>
                <Text style={styles.btnText}>Generate Ticket</Text>
                <View style={styles.btnIconBox}><Hash size={18} color={Theme.colors.background} /></View>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  appBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, height: 70, paddingTop: 10 },
  logoText: { fontSize: 22, fontWeight: '900', color: Theme.colors.primary, letterSpacing: -1 },
  backBtn: { width: 45, height: 45, justifyContent: 'center', alignItems: 'center', backgroundColor: Theme.colors.surface, borderRadius: 15 },
  profileBox: { width: 45, height: 45 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 150 },
  header: { marginTop: 40, marginBottom: 35 },
  statusLabel: { fontSize: 11, fontWeight: '900', color: Theme.colors.primary, letterSpacing: 3, marginBottom: 12, opacity: 0.8 },
  title: { fontSize: 42, fontWeight: '900', color: Theme.colors.onSurface, letterSpacing: -2, lineHeight: 46 },
  formCard: { backgroundColor: Theme.colors.surface, borderRadius: 32, padding: 25, gap: 24, borderWeight: 1, borderColor: '#333' },
  toggleContainer: { flexDirection: 'row', backgroundColor: '#000', borderRadius: 24, padding: 6, gap: 6 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 55, borderRadius: 20, gap: 12 },
  toggleBtnActive: { backgroundColor: Theme.colors.primary, shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  toggleText: { color: Theme.colors.onSurfaceVariant, fontSize: 15, fontWeight: '800' },
  toggleTextActive: { color: Theme.colors.background },
  inputGroup: { gap: 12 },
  inputLabel: { fontSize: 13, color: Theme.colors.onSurfaceVariant, fontWeight: '800', marginLeft: 8, letterSpacing: 0.5 },
  optional: { color: Theme.colors.outline, fontSize: 11, fontWeight: '400' },
  inputContainer: { backgroundColor: '#000', height: 65, borderRadius: 18, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', gap: 15 },
  inputIconBox: { opacity: 0.6, marginRight: 5 },
  prefixWrapper: { flexDirection: 'row', alignItems: 'center' },
  prefixText: { color: Theme.colors.onSurfaceVariant, fontSize: 16, fontWeight: '700', marginRight: 12 },
  prefixSeparator: { width: 1, height: 20, backgroundColor: Theme.colors.outline + '44', marginRight: 5 },
  input: { flex: 1, color: Theme.colors.onSurface, fontSize: 16, fontWeight: '700' },
  infoNoteCard: { flexDirection: 'row', backgroundColor: Theme.colors.surface, padding: 25, borderRadius: 24, marginTop: 25, alignItems: 'center', gap: 18, borderWeight: 1, borderColor: '#333' },
  infoNoteText: { flex: 1, color: Theme.colors.onSurfaceVariant, fontSize: 14, fontWeight: '500', lineHeight: 20 },
  footer: { position: 'absolute', bottom: 30, left: 0, right: 0, paddingHorizontal: 25 },
  mainBtn: { backgroundColor: Theme.colors.primary, height: 70, borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15 },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  btnText: { color: Theme.colors.background, fontSize: 19, fontWeight: '900', letterSpacing: -0.5 },
  btnIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: Theme.colors.background + '20', justifyContent: 'center', alignItems: 'center' },
});

export default EntryScreen;
