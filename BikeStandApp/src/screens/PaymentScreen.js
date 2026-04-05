import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { paymentService } from '../services/api';
import { CheckCircle, ArrowLeft, Smartphone, ShieldCheck, Info } from 'lucide-react-native';
import { Theme } from '../theme';

const PaymentScreen = ({ route, navigation }) => {
  const { ticket, amount, ticketId } = route.params;
  const [loading, setLoading] = useState(false);
  const [upiRef, setUpiRef] = useState('');

  // Merchant UPI Details - SHOUD BE IN CONFIG
  const MERCHANT_UPI = 'jrrohithk-2@okicici';
  const MERCHANT_NAME = 'Bike Stand';
  
  // upi://pay?pa=merchant@upi&pn=BikeStand&am=10&cu=INR
  const upiLink = `upi://pay?pa=${MERCHANT_UPI}&pn=${encodeURIComponent(MERCHANT_NAME)}&am=${amount}&cu=INR`;

  const handleConfirmPaid = async () => {
    setLoading(true);
    try {
      const response = await paymentService.markPaid({
        ticketId: ticketId || ticket.ticketId,
        paymentMethod: 'UPI_QR',
        upiReference: upiRef
      });

      if (response.success) {
        navigation.replace('Receipt', { ticket: response.ticket });
      }
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={Theme.colors.onSurface} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>UPI Payment</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Total Amount Due</Text>
          <Text style={styles.amountValue}>₹{amount}</Text>
          <Text style={styles.ticketId}>#{ticketId || ticket.ticketId}</Text>
        </View>

        {/* QR Section */}
        <View style={styles.qrCard}>
          <View style={styles.qrWrapper}>
            <QRCode
              value={upiLink}
              size={220}
              color="#000"
              backgroundColor="#fff"
            />
          </View>
          <View style={styles.upiInfo}>
            <Text style={styles.upiText}>Scan with GPay, PhonePe, or Paytm</Text>
            <View style={styles.shieldRow}>
              <ShieldCheck size={16} color={Theme.colors.primary} />
              <Text style={styles.secureText}>Secure Digital Payment</Text>
            </View>
          </View>
        </View>

        {/* Verification Section */}
        <View style={styles.verifyCard}>
          <Text style={styles.sectionTitle}>STAFF VERIFICATION</Text>
          <Text style={styles.helpText}>Ask the user to show the successful payment screen and enter the Ref. No. or just mark as paid.</Text>
          
          <View style={styles.inputBox}>
            <TextInput
              style={styles.input}
              placeholder="UPI Reference No. (Optional)"
              placeholderTextColor={Theme.colors.onSurfaceVariant}
              value={upiRef}
              onChangeText={setUpiRef}
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity 
            style={[styles.confirmBtn, loading && { opacity: 0.7 }]} 
            onPress={handleConfirmPaid}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : (
              <>
                <CheckCircle size={20} color="#000" />
                <Text style={styles.confirmBtnText}>Confirm Received</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Info size={16} color={Theme.colors.onSurfaceVariant} />
          <Text style={styles.infoText}>Upon clicking confirm, the vehicle will be marked as COMPLETED in the system.</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, marginTop: 10 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.onSurface },
  scroll: { padding: 25 },
  amountCard: { alignItems: 'center', marginBottom: 30 },
  amountLabel: { fontSize: 12, color: Theme.colors.onSurfaceVariant, letterSpacing: 2, fontWeight: '800', marginBottom: 5 },
  amountValue: { fontSize: 48, fontWeight: '900', color: Theme.colors.primary },
  ticketId: { color: Theme.colors.onSurfaceVariant, fontSize: 14, marginTop: 5, fontWeight: '500' },
  qrCard: { backgroundColor: Theme.colors.surface, borderRadius: 30, padding: 30, alignItems: 'center', shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, elevation: 5 },
  qrWrapper: { backgroundColor: '#fff', padding: 15, borderRadius: 20, marginBottom: 20 },
  upiInfo: { alignItems: 'center' },
  upiText: { fontSize: 14, fontWeight: '700', color: Theme.colors.onSurface },
  shieldRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  secureText: { fontSize: 10, color: Theme.colors.primary, fontWeight: '800', letterSpacing: 1 },
  verifyCard: { marginTop: 30, backgroundColor: Theme.colors.surfaceHigh, padding: 25, borderRadius: 24 },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 2, marginBottom: 8 },
  helpText: { fontSize: 12, color: Theme.colors.onSurfaceVariant, lineHeight: 18, marginBottom: 15 },
  inputBox: { backgroundColor: '#000', borderRadius: 12, paddingHorizontal: 15, height: 55, justifyContent: 'center', marginBottom: 15 },
  input: { color: Theme.colors.onSurface, fontSize: 14 },
  confirmBtn: { backgroundColor: Theme.colors.primary, height: 55, borderRadius: 27, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10 },
  confirmBtnText: { color: '#000', fontSize: 16, fontWeight: '900' },
  infoBox: { flexDirection: 'row', gap: 10, marginTop: 25, paddingHorizontal: 10 },
  infoText: { flex: 1, fontSize: 11, color: Theme.colors.onSurfaceVariant, lineHeight: 16 }
});

export default PaymentScreen;
