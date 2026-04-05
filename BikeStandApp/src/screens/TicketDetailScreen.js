import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Share, Dimensions, Linking, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Download, Share2, CheckCircle, Home, Menu, ChevronLeft, MessageCircle } from 'lucide-react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Theme } from '../theme';

const { width } = Dimensions.get('window');

const TicketDetailScreen = ({ route, navigation }) => {
  const { ticket } = route.params || {};

  if (!ticket) {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconBox}>
          <CheckCircle size={80} color={Theme.colors.surfaceVariant} />
        </View>
        <Text style={styles.emptyTitle}>No Active Pass</Text>
        <Text style={styles.emptyDesc}>You don't have an active parking session at the moment.</Text>
        <TouchableOpacity style={styles.homeBtn} onPress={() => navigation.navigate('Home')}>
          <Text style={styles.homeBtnText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const onShare = async () => {
    try {
      await Share.share({
        message: `SRI APARNA E-Ticket\n\nTicket ID: ${ticket.ticketId}\nVehicle: ${ticket.vehicleNumber}\nEntry Time: ${new Date(ticket.entryTime).toLocaleString()}`,
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const sendWhatsApp = () => {
    if (!ticket.whatsappNumber) {
      Alert.alert('No Number', 'This ticket does not have a WhatsApp number associated with it.');
      return;
    }
    const qrLink = `http://10.100.130.211:5000/api/tickets/qr/${ticket.ticketId}`;
    const message = `Bike Stand Ticket\n\nTicket ID: ${ticket.ticketId}\nVehicle: ${ticket.vehicleNumber}\nEntry Time: ${new Date(ticket.entryTime).toLocaleTimeString()}\n\nScan this QR at exit:\n${qrLink}`;
    const url = `https://wa.me/${ticket.whatsappNumber}?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open WhatsApp');
    });
  };

  const openWebPreview = () => {
    const previewUrl = `http://10.100.130.211:5000/preview/${ticket.ticketId}`;
    Linking.openURL(previewUrl);
  };

  const generatePDF = async () => {
    const html = `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 40px; color: #333; }
            .ticket { border: 2px solid #000; padding: 30px; border-radius: 20px; text-align: center; }
            .header { border-bottom: 2px dashed #ccc; padding-bottom: 20px; margin-bottom: 20px; }
            .brand { font-size: 28px; font-weight: 900; color: #000; }
            .id { font-size: 14px; color: #666; margin-top: 5px; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; text-align: left; margin: 30px 0; }
            .label { font-size: 10px; color: #999; font-weight: bold; }
            .value { font-size: 16px; font-weight: bold; }
            .footer { font-size: 12px; color: #888; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div class="brand">SRI APARNA</div>
              <div class="id">Ticket ID: ${ticket.ticketId}</div>
            </div>
            <div class="details">
              <div><div class="label">VEHICLE</div><div class="value">${ticket.vehicleNumber}</div></div>
              <div><div class="label">TYPE</div><div class="value">${ticket.vehicleType || 'Vehicle'}</div></div>
              <div><div class="label">STATION</div><div class="value">Aparna Main Hub</div></div>
              <div><div class="label">TIME</div><div class="value">${new Date(ticket.entryTime).toLocaleString()}</div></div>
            </div>
            <div class="footer">Thank you for choosing Sri Aparna Cycle & Bike Stand</div>
          </div>
        </body>
      </html>
    `;

    try {
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => navigation.goBack()}><ChevronLeft size={24} color={Theme.colors.primary} /></TouchableOpacity>
          <Text style={styles.logoText}>SRI APARNA</Text>
        </View>
        <View style={styles.profileBox} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.statusLabel}>ACTIVE SESSION</Text>
          <Text style={styles.title}>Your Digital Pass</Text>
        </View>

        {/* Ticket Component */}
        <View style={styles.passContainer}>
          <View style={styles.passMain}>
            <View style={styles.passHeader}>
              <View>
                <Text style={styles.metaLabel}>STATION HUB</Text>
                <Text style={styles.stationName}>SRI APARNA HUB</Text>
              </View>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>LEVEL 02</Text>
              </View>
            </View>

            {/* Staff Info */}
            <View style={styles.staffInfo}>
              <Text style={styles.metaLabel}>ISSUED BY</Text>
              <Text style={styles.staffName}>{ticket.createdBy?.name || 'Authorized Staff'}</Text>
            </View>

            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Text style={styles.metaLabel}>ENTRY TIME</Text>
                <Text style={styles.metaValue}>{new Date(ticket.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.metaLabel}>ISSUED AT</Text>
                <Text style={styles.metaValue}>{new Date(ticket.issuedAt).toLocaleTimeString()}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.metaLabel}>PLATE NUMBER</Text>
                <Text style={styles.metaValue}>{ticket.vehicleNumber}</Text>
              </View>
              <View style={styles.infoItem}>
                <Text style={styles.metaLabel}>VEHICLE TYPE</Text>
                <Text style={styles.metaValue}>{ticket.vehicleType || 'Bike'}</Text>
              </View>
              <View style={[styles.infoItem, { width: '100%', marginTop: 10 }]}>
                <Text style={styles.metaLabel}>SIGNATURE</Text>
                <Text style={[styles.metaValue, { fontSize: 10, color: Theme.colors.primary }]}>{ticket.signature}</Text>
              </View>
            </View>
          </View>

          {/* QR Section */}
          <View style={styles.qrSection}>
            <View style={styles.qrWrapper}>
              <QRCode value={ticket.qrCodeData || ticket.ticketId} size={150} color={Theme.colors.background} backgroundColor="#fff" quietZone={10} />
            </View>
            <View style={styles.qrFooter}>
              <Text style={styles.scanLabel}>TICKET REFERENCE ID</Text>
              <Text style={styles.ticketIdTag}>{ticket.ticketId}</Text>
            </View>
          </View>

          {/* Cut-outs */}
          <View style={styles.cutOutLeft} />
          <View style={styles.cutOutRight} />
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.downloadBtn} onPress={generatePDF}>
            <Download size={20} color={Theme.colors.background} />
            <Text style={styles.downloadText}>DOWNLOAD TICKET</Text>
          </TouchableOpacity>

          <View style={styles.actionGrid}>
            <TouchableOpacity style={styles.sideBtn} onPress={onShare}>
              <Share2 size={16} color={Theme.colors.onSurface} />
              <Text style={styles.sideBtnText}>SHARE PASS</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sideBtn} onPress={openWebPreview}>
              <Text style={styles.sideBtnText}>WEB PREVIEW</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.sideBtn, { backgroundColor: '#25D366' }]} onPress={sendWhatsApp}>
              <MessageCircle size={16} color={Theme.colors.background} />
              <Text style={[styles.sideBtnText, { color: Theme.colors.background }]}>WHATSAPP</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Station Load */}
        <View style={styles.loadCard}>
          <View style={styles.loadHeader}>
            <Text style={styles.loadTitle}>Station Load</Text>
            <Text style={styles.loadValue}>64% Full</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '64%' }]} />
          </View>
        </View>
      </ScrollView>
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
  scrollContent: { paddingHorizontal: 25, paddingBottom: 100 },
  header: { marginTop: 40, marginBottom: 30, paddingLeft: 10 },
  statusLabel: { fontSize: 10, fontWeight: '800', color: Theme.colors.primary, letterSpacing: 2.5, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: '800', color: Theme.colors.onSurface, letterSpacing: -1.5 },
  passContainer: { backgroundColor: Theme.colors.surface, borderRadius: 20, overflow: 'hidden', shadowColor: Theme.colors.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, elevation: 10 },
  passMain: { padding: 30, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  passHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 25 },
  metaLabel: { fontSize: 10, color: Theme.colors.onSurfaceVariant, fontWeight: '800', letterSpacing: 2, marginBottom: 4 },
  stationName: { fontSize: 22, color: Theme.colors.onSurface, fontWeight: '800', letterSpacing: -0.5 },
  badge: { backgroundColor: Theme.colors.primary + '15', paddingHorizontal: 10, py: 4, borderRadius: 100 },
  badgeText: { color: Theme.colors.primary, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  staffInfo: { marginBottom: 25, backgroundColor: '#000', padding: 15, borderRadius: 12 },
  staffName: { fontSize: 16, color: Theme.colors.onSurface, fontWeight: '700' },
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 30 },
  infoItem: { width: '45%' },
  metaValue: { fontSize: 18, color: Theme.colors.onSurface, fontWeight: '800' },
  qrSection: { backgroundColor: Theme.colors.surfaceHigh, padding: 30, alignItems: 'center', gap: 20 },
  qrWrapper: { backgroundColor: '#fff', padding: 15, borderRadius: 12 },
  qrFooter: { alignItems: 'center', gap: 5 },
  scanLabel: { fontSize: 10, color: Theme.colors.onSurfaceVariant, fontWeight: '800', letterSpacing: 3 },
  ticketIdTag: { fontSize: 24, color: Theme.colors.primary, fontWeight: '900', letterSpacing: 4, marginTop: 5 },
  cutOutLeft: { position: 'absolute', top: '50%', left: -15, width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.background, marginTop: 45 },
  cutOutRight: { position: 'absolute', top: '50%', right: -15, width: 30, height: 30, borderRadius: 15, backgroundColor: Theme.colors.background, marginTop: 45 },
  actions: { marginTop: 40, gap: 15 },
  downloadBtn: { backgroundColor: Theme.colors.primary, height: 65, borderRadius: 32, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  downloadText: { color: Theme.colors.background, fontSize: 14, fontWeight: '800', letterSpacing: 1 },
  actionGrid: { flexDirection: 'row', gap: 15 },
  sideBtn: { flex: 1, backgroundColor: Theme.colors.surfaceHigh, height: 55, borderRadius: 27, borderWeight: 1, borderColor: Theme.colors.outline + '33', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
  sideBtnText: { color: Theme.colors.onSurface, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
  loadCard: { marginTop: 40, backgroundColor: '#131313', padding: 25, borderRadius: 20 },
  loadHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 15 },
  loadTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.onSurface },
  loadValue: { fontSize: 14, fontWeight: '800', color: Theme.colors.primary },
  progressBar: { height: 12, backgroundColor: Theme.colors.surfaceVariant, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: Theme.colors.primaryDim, borderRadius: 6, shadowColor: Theme.colors.primaryDim, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.5, shadowRadius: 10 },
  emptyContainer: { flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyIconBox: { marginBottom: 30, opacity: 0.5 },
  emptyTitle: { fontSize: 24, fontWeight: '900', color: '#fff', letterSpacing: -1 },
  emptyDesc: { fontSize: 13, color: Theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 10, lineHeight: 22, maxWidth: 280 },
  homeBtn: { backgroundColor: Theme.colors.primary, paddingHorizontal: 35, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginTop: 40 },
  homeBtnText: { color: Theme.colors.background, fontWeight: '900', fontSize: 13, letterSpacing: 0.5 },
});

export default TicketDetailScreen;
