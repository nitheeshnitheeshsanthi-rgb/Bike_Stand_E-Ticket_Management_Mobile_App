import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Bike, ShieldCheck, User, ChevronRight, Zap } from 'lucide-react-native';
import { Theme } from '../theme';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.brandIcon}>
            <Bike size={48} color={Theme.colors.primary} />
            <View style={styles.glow} />
          </View>
          <Text style={styles.brandText}>SRI APARNA</Text>
          <Text style={styles.brandSubtitle}>Cycle and Bike stand Manager</Text>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeBox}>
          <Text style={styles.welcomeTitle}>Smart Parking{"\n"}Redefined.</Text>
          <Text style={styles.welcomeDesc}>Experience the next generation of E-Ticket management and secure parking.</Text>
        </View>

        {/* Options Grid */}
        <View style={styles.options}>
          {/* Staff Option */}
          <TouchableOpacity 
            style={styles.optionCard} 
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Login', { roleHint: 'staff' })}
          >
            <View style={[styles.optionIconBox, { backgroundColor: Theme.colors.primary + '15' }]}>
              <ShieldCheck size={32} color={Theme.colors.primary} />
            </View>
            <View style={styles.optionInfo}>
              <Text style={styles.optionTitle}>Staff Control Hub</Text>
              <Text style={styles.optionDesc}>Process entry, scan tickets, and manage revenue.</Text>
            </View>
            <ChevronRight size={24} color={Theme.colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>

        {/* Footer Info */}
        <View style={styles.footer}>
          <View style={styles.featureRow}>
            <Zap size={14} color={Theme.colors.primary} />
            <Text style={styles.featureText}>Secure E-Tickets</Text>
            <View style={styles.dot} />
            <Text style={styles.featureText}>Instant Scans</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background, paddingTop: 40 },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: 'space-between', paddingVertical: 40 },
  header: { alignItems: 'center', marginTop: 20 },
  brandIcon: { width: 100, height: 100, backgroundColor: Theme.colors.surface, borderRadius: 30, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  glow: { position: 'absolute', width: 60, height: 60, borderRadius: 30, backgroundColor: Theme.colors.primary, opacity: 0.1, zIndex: -1 },
  brandText: { fontSize: 24, fontWeight: '900', color: Theme.colors.primary, letterSpacing: 4 },
  brandSubtitle: { fontSize: 13, color: Theme.colors.onSurfaceVariant, fontWeight: '600', marginTop: 5 },
  welcomeBox: { marginTop: 40 },
  welcomeTitle: { fontSize: 48, fontWeight: '900', color: '#fff', letterSpacing: -2, lineHeight: 52 },
  welcomeDesc: { fontSize: 16, color: Theme.colors.onSurfaceVariant, marginTop: 15, lineHeight: 24, fontWeight: '500' },
  options: { gap: 20, marginTop: 40 },
  optionCard: { backgroundColor: Theme.colors.surface, borderRadius: 32, padding: 25, flexDirection: 'row', alignItems: 'center', gap: 20, borderWidth: 1, borderColor: '#333' },
  riderCard: { backgroundColor: Theme.colors.surfaceHigh },
  optionIconBox: { width: 64, height: 64, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  optionInfo: { flex: 1 },
  optionTitle: { fontSize: 20, fontWeight: '800', color: '#fff' },
  optionDesc: { fontSize: 13, color: Theme.colors.onSurfaceVariant, marginTop: 4, lineHeight: 18 },
  footer: { alignItems: 'center', marginBottom: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: Theme.colors.surface, paddingHorizontal: 20, height: 40, borderRadius: 20 },
  featureText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 1 },
  dot: { width: 4, height: 4, borderRadius: 2, backgroundColor: Theme.colors.outline },
});

export default HomeScreen;
