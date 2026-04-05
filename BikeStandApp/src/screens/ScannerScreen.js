import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Zap, ZapOff, RefreshCcw } from 'lucide-react-native';
import { Theme } from '../theme';
import { ticketService } from '../services/api';

const { width } = Dimensions.get('window');

const ScannerScreen = ({ navigation }) => {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    if (!permission) requestPermission();
  }, []);

  const handleBarcodeScanned = async ({ type, data }) => {
    setScanned(true);
    console.log('Scanned QR:', data);

    try {
      // 1. Parse JSON safely
      const parsed = JSON.parse(data);
      
      // 2. Validate shape (must contain data + sig)
      if (parsed.data && parsed.sig) {
        // 3. Send to backend for verification
        const response = await ticketService.scanVerify(parsed);
        if (response.success) {
          // Navigate to Exit Screen with prepopulated data
          navigation.replace('Exit', { 
            ticket: response.ticket, 
            estimatedFee: response.estimatedFee 
          });
        }
      } else {
        throw new Error('INVALID_QR');
      }
    } catch (err) {
      // Logic for non-secure / fallback QR or vehicle numbers
      if (data.length <= 10 && !data.includes('{')) {
        // If it looks like a vehicle number (simple string), navigate to Entry
        navigation.replace('Entry', { vehicleNumber: data });
      } else {
        // Real security error
        const errorMessage = err.response?.data?.message || 'Invalid or foreign QR code';
        Alert.alert('Security Alert', errorMessage, [
          { text: 'OK', onPress: () => setScanned(false) }
        ]);
      }
    }
  };

  if (!permission) {
    return <View style={styles.container}><Text style={styles.text}>Requesting permissions...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>No access to camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />

      {/* Overlay */}
      <View style={styles.overlay}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.iconBtn} onPress={() => navigation.goBack()}>
            <X size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>SCAN TICKET</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={() => setTorch(!torch)}>
            {torch ? <Zap size={24} color={Theme.colors.primary} /> : <ZapOff size={24} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.scannerBox}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
          {scanned && (
            <TouchableOpacity style={styles.rescanBtn} onPress={() => setScanned(false)}>
              <RefreshCcw size={20} color="#000" />
              <Text style={styles.rescanText}>Tap to Scan Again</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.hint}>Align QR code within the frame to scan</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 16, textAlign: 'center', marginBottom: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', width: '100%', justifyContent: 'space-between', paddingVertical: 50 },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 30 },
  title: { color: '#fff', fontSize: 12, fontWeight: '900', letterSpacing: 4 },
  iconBtn: { width: 45, height: 45, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', alignItems: 'center' },
  scannerBox: { width: width * 0.7, height: width * 0.7, alignSelf: 'center', justifyContent: 'center', alignItems: 'center' },
  corner: { position: 'absolute', width: 40, height: 40, borderColor: Theme.colors.primary, borderWidth: 4 },
  topLeft: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 20 },
  topRight: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 20 },
  bottomLeft: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 20 },
  bottomRight: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 20 },
  hint: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontSize: 13, letterSpacing: 1 },
  button: { backgroundColor: Theme.colors.primary, paddingHorizontal: 30, height: 50, borderRadius: 25, justifyContent: 'center' },
  buttonText: { color: '#000', fontWeight: '900' },
  rescanBtn: { backgroundColor: Theme.colors.primary, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, height: 45, borderRadius: 22, gap: 10 },
  rescanText: { color: '#000', fontWeight: '800', fontSize: 14 },
  footer: { paddingBottom: 20 },
});

export default ScannerScreen;
