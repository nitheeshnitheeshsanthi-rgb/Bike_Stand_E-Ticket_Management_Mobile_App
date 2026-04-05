import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { CheckCircle, Home, Download, Share2, Receipt, MapPin, Calendar, Clock } from 'lucide-react-native';
import { Theme } from '../theme';

const { width } = Dimensions.get('window');

const ReceiptScreen = ({ route, navigation }) => {
  const { ticket } = route.params || {};

  if (!ticket) {
    navigation.replace('Dashboard');
    return null;
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.successHeader}>
          <View style={styles.successIconBox}>
            <CheckCircle size={60} color={Theme.colors.primary} />
          </View>
          <Text style={styles.successTitle}>Vehicle Released</Text>
          <Text style={styles.successDesc}>The payment has been verified and the session is closed. The vehicle can now exit the stand.</Text>
        </View>

        {/* Digital Receipt Card */}
        <View style={styles.receiptCard}>
          <View style={styles.receiptHeader}>
            <Receipt size={24} color={Theme.colors.onSurfaceVariant} />
            <Text style={styles.receiptHeaderTitle}>OFFICIAL RECEIPT</Text>
          </View>

          <View style={styles.separator} />

          <View style={styles.mainInfo}>
            <Text style={styles.amountPaid}>₹{ticket.fee.toFixed(2)}</Text>
            <Text style={styles.amountLabel}>Total Amount Paid</Text>
          </View>

          <View style={styles.grid}>
             <View style={styles.gridItem}>
               <Text style={styles.label}>VEHICLE NO</Text>
               <Text style={styles.value}>{ticket.vehicleNumber}</Text>
             </View>
             <View style={styles.gridItem}>
               <Text style={styles.label}>TICKET ID</Text>
               <Text style={styles.value}>#{ticket.ticketId}</Text>
             </View>
             <View style={styles.gridItem}>
               <Text style={styles.label}>ENTRY</Text>
               <Text style={styles.value}>{new Date(ticket.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
             </View>
             <View style={styles.gridItem}>
               <Text style={styles.label}>EXIT</Text>
               <Text style={styles.value}>{new Date(ticket.exitTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
             </View>
          </View>

          <View style={styles.footerInfo}>
             <View style={styles.footerRow}>
               <MapPin size={14} color={Theme.colors.onSurfaceVariant} />
               <Text style={styles.footerText}>Aparna Bike Stand Hub</Text>
             </View>
             <View style={styles.footerRow}>
               <Calendar size={14} color={Theme.colors.onSurfaceVariant} />
               <Text style={styles.footerText}>{new Date().toLocaleDateString()}</Text>
             </View>
          </View>
          
          <View style={styles.scanLine} />
          <View style={styles.receiptTail}>
            <Text style={styles.tailText}>PAID VIA {ticket.paymentMethod?.toUpperCase()}</Text>
            <Text style={styles.tailSubtext}>Transaction ID: {ticket.paymentId || 'CASHCOLL'}</Text>
          </View>
        </View>

        <View style={styles.actions}>
           <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.replace('Dashboard')}>
             <Home size={20} color={Theme.colors.background} />
             <Text style={styles.homeBtnText}>BACK TO DASHBOARD</Text>
           </TouchableOpacity>
           
           <View style={styles.secondaryActions}>
             <TouchableOpacity style={styles.secBtn}>
               <Download size={18} color={Theme.colors.onSurface} opacity={0.6} />
               <Text style={styles.secBtnText}>PDF</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.secBtn}>
               <Share2 size={18} color={Theme.colors.onSurface} opacity={0.6} />
               <Text style={styles.secBtnText}>SHARE</Text>
             </TouchableOpacity>
           </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  scroll: { paddingHorizontal: 25, paddingVertical: 60, alignItems: 'center' },
  successHeader: { alignItems: 'center', marginBottom: 40 },
  successIconBox: { width: 100, height: 100, borderRadius: 50, backgroundColor: Theme.colors.primary + '10', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  successTitle: { fontSize: 32, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 10 },
  successDesc: { fontSize: 14, color: Theme.colors.onSurfaceVariant, textAlign: 'center', lineHeight: 22, maxWidth: 300 },
  receiptCard: { width: '100%', backgroundColor: Theme.colors.surface, borderRadius: 32, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 20 }, shadowOpacity: 0.3, shadowRadius: 30, elevation: 10 },
  receiptHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  receiptHeaderTitle: { fontSize: 12, fontWeight: '900', color: Theme.colors.onSurfaceVariant, letterSpacing: 2 },
  separator: { height: 1, backgroundColor: Theme.colors.surfaceVariant, opacity: 0.1, marginBottom: 30 },
  mainInfo: { alignItems: 'center', marginBottom: 40 },
  amountPaid: { fontSize: 56, fontWeight: '900', color: Theme.colors.primary, letterSpacing: -2 },
  amountLabel: { fontSize: 14, color: Theme.colors.onSurfaceVariant, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 20, marginBottom: 30 },
  gridItem: { width: '45%' },
  label: { fontSize: 9, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 1, marginBottom: 4 },
  value: { fontSize: 16, fontWeight: '800', color: Theme.colors.onSurface },
  footerInfo: { gap: 8, marginBottom: 30 },
  footerRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footerText: { fontSize: 12, color: Theme.colors.onSurfaceVariant },
  scanLine: { height: 1, borderStyle: 'dashed', borderWidth: 1, borderColor: Theme.colors.surfaceVariant, opacity: 0.2, marginHorizontal: -30, marginBottom: 30 },
  receiptTail: { alignItems: 'center' },
  tailText: { fontSize: 11, fontWeight: '900', color: Theme.colors.primary, letterSpacing: 2, marginBottom: 4 },
  tailSubtext: { fontSize: 10, color: Theme.colors.onSurfaceVariant, opacity: 0.5 },
  actions: { width: '100%', marginTop: 40, gap: 15 },
  homeBtn: { backgroundColor: Theme.colors.primary, height: 75, borderRadius: 37, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  homeBtnText: { color: Theme.colors.background, fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  secondaryActions: { flexDirection: 'row', gap: 15 },
  secBtn: { flex: 1, height: 60, borderRadius: 30, backgroundColor: Theme.colors.surface, borderWeight: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 12 },
  secBtnText: { color: Theme.colors.onSurface, fontWeight: '800', fontSize: 12 },
});

export default ReceiptScreen;
