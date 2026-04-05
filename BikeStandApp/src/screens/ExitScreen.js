import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Dimensions, Platform } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { ticketService, paymentService } from '../services/api';
import { notificationService } from '../services/notifications';
import { CreditCard, Hash, CheckCircle, Clock, Calendar, LogOut, Smartphone, ArrowRight, Wallet, Banknote } from 'lucide-react-native';
import { Theme } from '../theme';
import RazorpayCheckout from 'react-native-razorpay';

const { width } = Dimensions.get('window');

const RAZORPAY_KEY_ID = 'rzp_test_your_key_id'; // In production, move to env/config

const ExitScreen = ({ navigation }) => {
  const route = useRoute();
  const [ticketId, setTicketId] = useState(route.params?.ticket?.ticketId || '');
  const [loading, setLoading] = useState(false);
  const [ticketData, setTicketData] = useState(route.params?.ticket || null);
  const [paymentMethod, setPaymentMethod] = useState('UPI_QR'); // 'UPI' (Razorpay), 'UPI_QR' or 'Cash'

  useEffect(() => {
    if (route.params?.ticket) {
      setTicketData(route.params.ticket);
      setTicketId(route.params.ticket.ticketId);
    }
  }, [route.params]);

  const handleFetchTicket = async () => {
    if (!ticketId) return Alert.alert('Error', 'Please enter ticket ID');
    setLoading(true);
    try {
      const ticket = await ticketService.getTicket(ticketId);
      if (ticket.status === 'COMPLETED' || ticket.paymentStatus === 'PAID') {
        Alert.alert('Info', 'This ticket is already paid and released.');
        setLoading(false);
        return;
      }
      setTicketData(ticket);
    } catch (err) {
      Alert.alert('Error', 'Ticket not found or network error');
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (paymentMethod === 'Cash') {
      await handleCashPayment();
    } else if (paymentMethod === 'UPI_QR') {
      navigation.navigate('Payment', { 
        ticket: ticketData, 
        amount: calculateFee(), 
        ticketId: ticketId 
      });
    } else {
      await handleRazorpayPayment();
    }
  };

  const handleCashPayment = async () => {
    setLoading(true);
    try {
      const response = await paymentService.markPaid({
        ticketId: ticketId,
        paymentMethod: 'Cash'
      });
      if (response.success) {
        await notificationService.sendLocalNotification(
          'Payment Successful ✅',
          `₹${response.ticket.fee} received (Cash) for ${ticketId}. Vehicle released.`
        );
        navigation.replace('Receipt', { ticket: response.ticket });
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to mark cash payment');
    } finally {
      setLoading(false);
    }
  };

  const handleRazorpayPayment = async () => {
    setLoading(true);
    try {
      // 1. Create order on backend
      const orderData = await paymentService.createOrder(ticketId);
      
      if (!orderData.success) {
        throw new Error('Failed to create Razorpay order');
      }

      // 2. Open Razorpay Checkout
      const options = {
        description: `Parking Fee for ${ticketId}`,
        image: 'https://i.imgur.com/39N9LpU.png', // Logo
        currency: orderData.currency,
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        name: 'Sri Aparna Bike Stand',
        order_id: orderData.orderId,
        prefill: {
          email: '',
          contact: ticketData.whatsappNumber || '',
          name: ticketData.vehicleNumber
        },
        theme: { color: Theme.colors.primary }
      };

      RazorpayCheckout.open(options).then(async (data) => {
        // 3. Verify payment on backend
        try {
          const verifyData = {
            razorpay_order_id: data.razorpay_order_id,
            razorpay_payment_id: data.razorpay_payment_id,
            razorpay_signature: data.razorpay_signature,
            ticketId: ticketId,
            paymentMethod: 'UPI'
          };

          const verifyRes = await paymentService.verifyPayment(verifyData);
          
          if (verifyRes.success) {
             await notificationService.sendLocalNotification(
              'Payment Successful ✅',
              `Payment of ₹${verifyRes.ticket.fee} verified. Vehicle released.`
            );
            navigation.replace('Receipt', { ticket: verifyRes.ticket });
          }
        } catch (vErr) {
          Alert.alert('Verification Failed', 'Critical: Payment made but verification failed. Support informed.');
        }
      }).catch((error) => {
        console.log('Razorpay Error:', error);
        Alert.alert('Payment Failed', error.description || 'User cancelled');
      });

    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateFee = () => {
    if (route.params?.estimatedFee) return route.params.estimatedFee;
    if (!ticketData) return 10;
    const rate = ticketData.vehicleType === 'Bike' ? 10 : 20;
    const durationHours = Math.ceil((new Date() - new Date(ticketData.entryTime)) / (1000 * 60 * 60));
    return Math.max(rate, durationHours * rate);
  };

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}><LogOut size={24} color={Theme.colors.primary} /></TouchableOpacity>
          <Text style={styles.logoText}>SRI APARNA</Text>
        </View>
        <View style={styles.profileBox} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerWrapper}>
          <View style={styles.titleRow}>
            <Text style={styles.statusLabel}>CURRENT SESSION</Text>
            <View style={styles.idBadge}><Text style={styles.idText}>ID: {ticketId ? ticketId : 'KNT-000'}</Text></View>
          </View>
          
          <Text style={styles.amountText}>₹{ticketData ? calculateFee().toFixed(2) : '0.00'}</Text>
          <Text style={styles.amountLabel}>Total Parking Fee</Text>
        </View>

        {!ticketData && (
          <View style={styles.inputCard}>
            <Text style={styles.inputTitle}>Search Ticket</Text>
            <View style={styles.inputContainer}>
              <Hash size={20} color={Theme.colors.onSurfaceVariant} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="ID or Vehicle No."
                placeholderTextColor={Theme.colors.outline}
                value={ticketId}
                onChangeText={setTicketId}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.fetchBtn} onPress={handleFetchTicket} disabled={loading}>
                <Text style={styles.fetchBtnText}>Fetch</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {ticketData && (
          <View style={styles.details}>
            {/* Bento Stats */}
            <View style={styles.bentoGrid}>
              <View style={styles.bentoItem}>
                <LogOut size={24} color={Theme.colors.primary} style={styles.bentoIcon} />
                <View>
                  <Text style={styles.bentoValue}>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                  <Text style={styles.bentoLabel}>EXIT TIME</Text>
                </View>
              </View>
              <View style={styles.bentoItem}>
                <Clock size={24} color={Theme.colors.primary} style={styles.bentoIcon} />
                <View>
                  <Text style={styles.bentoValue}>{Math.ceil((new Date() - new Date(ticketData.entryTime)) / (1000 * 60 * 60))}h</Text>
                  <Text style={styles.bentoLabel}>TOTAL HOURS</Text>
                </View>
              </View>
            </View>

            {/* Payment Methods */}
            <Text style={styles.sectionTitle}>
              <Wallet size={16} color={Theme.colors.primary} /> PAYMENT METHOD
            </Text>
            <View style={styles.methodList}>
              <TouchableOpacity 
                style={paymentMethod === 'UPI_QR' ? styles.methodItemActive : styles.methodItem}
                onPress={() => setPaymentMethod('UPI_QR')}
              >
                <View style={styles.methodLeft}>
                  <View style={styles.methodIconBox}><Smartphone size={20} color={paymentMethod === 'UPI_QR' ? Theme.colors.primary : Theme.colors.onSurfaceVariant} /></View>
                  <View>
                    <Text style={styles.methodTitle}>UPI QR Code</Text>
                    <Text style={styles.methodDesc}>Scan to Pay (GPay/PhonePe)</Text>
                  </View>
                </View>
                <View style={paymentMethod === 'UPI_QR' ? styles.radioActive : styles.radio}>
                   {paymentMethod === 'UPI_QR' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={paymentMethod === 'UPI' ? styles.methodItemActive : styles.methodItem}
                onPress={() => setPaymentMethod('UPI')}
              >
                <View style={styles.methodLeft}>
                  <View style={styles.methodIconBox}><CreditCard size={20} color={paymentMethod === 'UPI' ? Theme.colors.primary : Theme.colors.onSurfaceVariant} /></View>
                  <View>
                    <Text style={styles.methodTitle}>Razorpay Checkout</Text>
                    <Text style={styles.methodDesc}>UPI / Card / NetBanking</Text>
                  </View>
                </View>
                <View style={paymentMethod === 'UPI' ? styles.radioActive : styles.radio}>
                   {paymentMethod === 'UPI' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={paymentMethod === 'Cash' ? styles.methodItemActive : styles.methodItem}
                onPress={() => setPaymentMethod('Cash')}
              >
                <View style={styles.methodLeft}>
                  <View style={styles.methodIconBox}><Banknote size={20} color={paymentMethod === 'Cash' ? Theme.colors.primary : Theme.colors.onSurfaceVariant} /></View>
                  <View>
                    <Text style={styles.methodTitle}>Cash</Text>
                    <Text style={styles.methodDesc}>Manual collection by staff</Text>
                  </View>
                </View>
                <View style={paymentMethod === 'Cash' ? styles.radioActive : styles.radio}>
                   {paymentMethod === 'Cash' && <View style={styles.radioInner} />}
                </View>
              </TouchableOpacity>
            </View>

            {/* Breakdown */}
            <View style={styles.breakdownCard}>
              <View style={styles.breakRow}><Text style={styles.breakLabel}>Ticket ID</Text><Text style={styles.breakValue}>{ticketData.ticketId}</Text></View>
              <View style={styles.breakRow}><Text style={styles.breakLabel}>Base Rate</Text><Text style={styles.breakValue}>₹{calculateFee().toFixed(2)}</Text></View>
              <View style={styles.breakRow}><Text style={styles.breakLabel}>GST (18%)</Text><Text style={styles.breakValue}>₹0.00</Text></View>
              <View style={styles.breakLine} />
              <View style={styles.breakRow}>
                <Text style={styles.totalLabel}>Total Due</Text>
                <Text style={styles.totalValue}>₹{calculateFee().toFixed(2)}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Floating Pay Button */}
      {ticketData && (
        <View style={styles.footer}>
          <TouchableOpacity style={styles.payBtn} onPress={handlePay} disabled={loading}>
            {loading ? (
              <ActivityIndicator color={Theme.colors.background} />
            ) : (
              <View style={styles.btnRow}>
                <Text style={styles.payBtnText}>
                  {paymentMethod === 'Cash' ? 'Confirm Cash Payment' : `Pay ₹${calculateFee().toFixed(2)} Now`}
                </Text>
                <ArrowRight size={20} color={Theme.colors.background} />
              </View>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  appBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, height: 70 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  logoText: { fontSize: 24, fontWeight: '900', color: Theme.colors.primary, letterSpacing: -1.5 },
  profileBox: { width: 40, height: 40, borderRadius: 20 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 120 },
  headerWrapper: { marginTop: 40, marginBottom: 50 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 15 },
  statusLabel: { fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 3 },
  idBadge: { backgroundColor: Theme.colors.surface, paddingHorizontal: 10, py: 4, borderRadius: 4, borderWidth: 1, borderColor: Theme.colors.surfaceVariant },
  idText: { color: Theme.colors.onSurfaceVariant, fontSize: 10, fontWeight: '500' },
  amountText: { fontSize: 64, fontWeight: '900', color: Theme.colors.primary, letterSpacing: -2 },
  amountLabel: { fontSize: 18, color: Theme.colors.onSurfaceVariant, fontWeight: '500', marginTop: 5 },
  inputCard: { backgroundColor: Theme.colors.surface, borderRadius: 24, padding: 30, gap: 20 },
  inputTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.onSurface },
  inputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#000', borderRadius: 15, paddingLeft: 20, overflow: 'hidden' },
  inputIcon: { marginRight: 15 },
  input: { flex: 1, height: 60, color: Theme.colors.onSurface, fontSize: 16 },
  fetchBtn: { backgroundColor: Theme.colors.primary, px: 20, height: 60, justifyContent: 'center' },
  fetchBtnText: { color: Theme.colors.background, fontWeight: '900' },
  details: { gap: 40 },
  bentoGrid: { flexDirection: 'row', gap: 15 },
  bentoItem: { flex: 1, backgroundColor: Theme.colors.surface, borderRadius: 24, padding: 25, minHeight: 160, justifyContent: 'space-between' },
  bentoIcon: { marginBottom: 15 },
  bentoValue: { fontSize: 28, fontWeight: '800', color: Theme.colors.onSurface, letterSpacing: -1 },
  bentoLabel: { fontSize: 10, color: Theme.colors.onSurfaceVariant, fontWeight: '800', letterSpacing: 2 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.onSurface, gap: 10, flexDirection: 'row', alignItems: 'center' },
  methodList: { gap: 12 },
  methodItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A1A1A', padding: 25, borderRadius: 24 },
  methodItemActive: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Theme.colors.primary + '10', padding: 25, borderRadius: 24, borderWidth: 1, borderColor: Theme.colors.primary + '33' },
  methodLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  methodIconBox: { width: 50, height: 50, borderRadius: 25, backgroundColor: Theme.colors.surfaceVariant, justifyContent: 'center', alignItems: 'center' },
  methodTitle: { fontSize: 16, fontWeight: '800', color: Theme.colors.onSurface },
  methodDesc: { fontSize: 13, color: Theme.colors.onSurfaceVariant, marginTop: 2 },
  radio: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Theme.colors.outline },
  radioActive: { width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
  radioInner: { width: 12, height: 12, borderRadius: 6, backgroundColor: Theme.colors.primary },
  breakdownCard: { backgroundColor: '#000', borderRadius: 24, padding: 30, borderWidth: 1, borderColor: Theme.colors.surfaceVariant + '33' },
  breakRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  breakLabel: { color: Theme.colors.onSurfaceVariant, fontSize: 14 },
  breakValue: { color: Theme.colors.onSurface, fontWeight: '700' },
  breakLine: { height: 1, backgroundColor: Theme.colors.surfaceVariant, opacity: 0.2, marginVertical: 10 },
  totalLabel: { fontSize: 18, fontWeight: '800', color: Theme.colors.onSurface },
  totalValue: { fontSize: 24, fontWeight: '900', color: Theme.colors.primary },
  footer: { position: 'absolute', bottom: 40, left: 0, right: 0, paddingHorizontal: 25 },
  payBtn: { backgroundColor: Theme.colors.primary, height: 75, borderRadius: 37, justifyContent: 'center', alignItems: 'center' },
  btnRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  payBtnText: { color: Theme.colors.background, fontSize: 18, fontWeight: '900', letterSpacing: -0.5 },
});

export default ExitScreen;
