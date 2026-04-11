import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, RefreshControl, ActivityIndicator, Image, Dimensions, Alert, SafeAreaView, StatusBar, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ticketService, authService } from '../services/api';
import { Bike, Car, LogIn, LogOut, History, Wallet, Map as MapIcon, Shield, BarChart3, ChevronRight, Menu, LayoutDashboard } from 'lucide-react-native';
import { Theme } from '../theme';

const { width } = Dimensions.get('window');

const DashboardScreen = ({ navigation }) => {
  const [stats, setStats] = useState({ totalVehiclesToday: 0, revenueToday: 0 });
  const [activeTicket, setActiveTicket] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userData, statData, historyData] = await Promise.all([
        AsyncStorage.getItem('user'),
        ticketService.getStats(),
        ticketService.getHistory()
      ]);

      if (userData) setUser(JSON.parse(userData));
      if (statData) setStats(statData);
      if (historyData) {
        setRecentHistory(historyData);
        const latest = historyData.find(t => t.status === 'ACTIVE');
        setActiveTicket(latest);
      }
    } catch (err) {
      console.error('Dashboard Load Error:', err);
      if (err.response?.status === 401) {
        setError('Session expired. Please log in again.');
      } else {
        setError('Could not connect to server. Please check your network.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.reset({ index: 0, routes: [{ name: 'Landing' }] });
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchInitialData();
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: Theme.colors.background }]}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={{ color: Theme.colors.primary, marginTop: 15, fontSize: 10, letterSpacing: 2 }}>SYNCING DATA...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.center, { backgroundColor: Theme.colors.background, padding: 40 }]}>
        <View style={styles.errorPulse}>
           <Text style={{ color: Theme.colors.error, fontSize: 40 }}>⚠️</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '800', marginTop: 20 }}>Connection Failed</Text>
        <Text style={{ color: Theme.colors.onSurfaceVariant, textAlign: 'center', marginTop: 10, lineHeight: 20 }}>
          {error}
        </Text>
        <TouchableOpacity 
          style={[styles.parkBtn, { width: '100%', marginTop: 30 }]} 
          onPress={error.includes('log in') ? handleLogout : fetchInitialData}
        >
          <Text style={styles.parkBtnText}>{error.includes('log in') ? 'LOG IN AGAIN' : 'TRY AGAIN'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const userRole = user?.role?.toLowerCase() || 'rider';
  const isStaff = userRole === 'staff' || userRole === 'admin';

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.appBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuIcon} onPress={() => {
            Alert.alert('Sign Out', 'Logout from Sri Aparna?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Log Out', style: 'destructive', onPress: handleLogout }
            ]);
          }}>
            <Menu size={24} color={Theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.logoText}>SRI APARNA</Text>
        </View>
        <TouchableOpacity style={styles.profileAvatar}>
          <View style={styles.avatarInner}>
            <Bike size={24} color={Theme.colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
      >
        <View style={styles.welcomeSection}>
          <Text style={styles.statusLabel}>{isStaff ? 'STATION PERFORMANCE' : 'RIDER PORTAL'}</Text>
          <Text style={styles.welcomeText}>Hello, {user?.name?.split(' ')[0] || 'Staff'}.</Text>
        </View>

        {/* Active Session Card */}
        {activeTicket && !isStaff && (
          <TouchableOpacity 
            style={styles.activeCard} 
            onPress={() => navigation.navigate('TicketDetail', { ticket: activeTicket })}
          >
            <View style={styles.liveIndicator}>
              <View style={styles.ping} />
              <View style={styles.dot} />
            </View>

            <Text style={styles.activeLabel}>MY ACTIVE SESSION</Text>
            <Text style={styles.timerText}>{activeTicket.vehicleNumber}</Text>
            <Text style={styles.locationText}>Secured: <Text style={styles.locationHighlight}>{new Date(activeTicket.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text></Text>

            <View style={styles.activeFooter}>
              <View style={styles.badgeRow}>
                <View style={styles.badge}><Bike size={16} color={Theme.colors.background} /></View>
                <Text style={styles.activeId}>#{activeTicket.ticketId.toUpperCase()}</Text>
              </View>
              <View style={styles.viewBtn}>
                 <Text style={styles.viewBtnText}>VIEW PASS</Text>
              </View>
            </View>
            <View style={styles.cardGlow} />
          </TouchableOpacity>
        )}

        {!activeTicket && !isStaff && (
          <View style={[styles.activeCard, { opacity: 0.8 }]}>
             <Text style={styles.activeLabel}>NO ACTIVE SESSION</Text>
             <Text style={styles.timerText}>READY TO PARK?</Text>
             <TouchableOpacity style={styles.parkBtn} onPress={() => navigation.navigate('Tickets')}>
               <Text style={styles.parkBtnText}>Explore History</Text>
             </TouchableOpacity>
          </View>
        )}

        {/* Bento Grid */}
        <Text style={styles.sectionTitle}>{isStaff ? 'CONTROL OPERATIONS' : 'QUICK ACTIONS'}</Text>
        <View style={styles.bentoGrid}>
          {isStaff ? (
            <>
              <TouchableOpacity 
                style={[styles.mainAction, { backgroundColor: Theme.colors.primary }]} 
                onPress={() => navigation.navigate('Scanner')}
              >
                <View style={styles.actionIconBox}><LogIn size={28} color={Theme.colors.background} /></View>
                <View>
                  <Text style={styles.actionTitle}>Quick Scan</Text>
                  <Text style={styles.actionDesc}>New Entry</Text>
                </View>
              </TouchableOpacity>

              <View style={styles.actionColumn}>
                <TouchableOpacity style={styles.sideAction} onPress={() => navigation.navigate('Entry')}>
                  <LayoutDashboard size={20} color={Theme.colors.secondary} />
                  <Text style={styles.sideActionTitle}>Manual</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.sideAction} onPress={() => navigation.navigate('Exit')}>
                  <LogOut size={20} color={Theme.colors.tertiary} />
                  <Text style={styles.sideActionTitle}>Exit</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={[styles.statsCard]} onPress={() => navigation.navigate('Tickets')}>
                <View style={styles.statsLeft}>
                  <Text style={styles.statLine}>REVENUE TODAY</Text>
                  <Text style={styles.statMoney}>₹{stats.revenueToday}</Text>
                </View>
                <View style={styles.statsRight}>
                  <BarChart3 size={24} color={Theme.colors.primary} />
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.bentoItem} onPress={() => navigation.navigate('Entry')}>
                <View style={[styles.bentoIcon, { backgroundColor: Theme.colors.primary + '33' }]}>
                  <Bike size={24} color={Theme.colors.primary} />
                </View>
                <View>
                  <Text style={styles.bentoTitle}>Book Parking</Text>
                  <Text style={styles.bentoDesc}>Find spot</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.bentoItem} onPress={() => navigation.navigate('Tickets')}>
                <View style={[styles.bentoIcon, { backgroundColor: Theme.colors.tertiary + '33' }]}>
                  <History size={24} color={Theme.colors.tertiary} />
                </View>
                <View>
                  <Text style={styles.bentoTitle}>My Tickets</Text>
                  <Text style={styles.bentoDesc}>View history</Text>
                </View>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.activityHeader}>
          <Text style={styles.sectionTitle}>RECENT PARKING</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tickets')}><Text style={styles.seeAllText}>SEE ALL</Text></TouchableOpacity>
        </View>

        <View style={styles.activityList}>
          {recentHistory.length > 0 ? (
            recentHistory.slice(0, 3).map(item => (
              <TouchableOpacity 
                key={item.ticketId} 
                style={styles.activityItem} 
                onPress={() => navigation.navigate('TicketDetail', { ticket: item })}
              >
                <View style={styles.activityLeft}>
                  <View style={styles.activityIconBox}>
                    {item.vehicleType === 'Scooter' ? <Car size={20} color={Theme.colors.onSurfaceVariant} /> : <Bike size={20} color={Theme.colors.onSurfaceVariant} />}
                  </View>
                  <View>
                    <Text style={styles.activityTitle}>{item.vehicleNumber}</Text>
                    <Text style={styles.activityTime}>
                      {new Date(item.entryTime).toLocaleDateString()} • {item.status}
                    </Text>
                  </View>
                </View>
                <Text style={styles.activityPrice}>
                  {item.status === 'COMPLETED' ? `₹${item.fee}` : 'ACTIVE'}
                </Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyText}>No recent activity</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Theme.colors.background
  },
  center: {
    flex: 1, justifyContent: 'center', alignItems: 'center'
  },
  appBar: {
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    paddingHorizontal: 25, 
    height: Platform.OS === 'android' ? 60 + StatusBar.currentHeight : 80, 
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 20,
    backgroundColor: Theme.colors.background,
    borderBottomWidth: 1, 
    borderBottomColor: Theme.colors.surfaceVariant
  },
  headerLeft: {
    flexDirection: 'row', alignItems: 'center', gap: 15
  },
  logoText: {
    fontSize: 20, fontWeight: '900', color: Theme.colors.primary, letterSpacing: -1.2
  },
  profileAvatar: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1, borderColor: Theme.colors.primary + '33', overflow: 'hidden'
  },
  avatarInner: { flex: 1, backgroundColor: Theme.colors.surfaceHigh, justifyContent: 'center', alignItems: 'center' },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 25, paddingBottom: 60 },
  welcomeSection: { marginTop: 25, marginBottom: 20 },
  statusLabel: { fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 3, marginBottom: 8 },
  welcomeText: { fontSize: 28, fontWeight: '800', color: Theme.colors.onSurface, letterSpacing: -1 },
  activeCard: { backgroundColor: Theme.colors.surface, borderRadius: 30, padding: 30, overflow: 'hidden', minHeight: 300, justifyContent: 'space-between' },
  liveIndicator: { position: 'absolute', top: 30, right: 30 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: Theme.colors.primary },
  ping: { position: 'absolute', width: 12, height: 12, borderRadius: 6, backgroundColor: Theme.colors.primary, transform: [{ scale: 2 }], opacity: 0.3 },
  activeLabel: { fontSize: 12, fontWeight: '900', color: Theme.colors.primary, letterSpacing: 2, marginBottom: 15 },
  timerText: { fontSize: 60, fontWeight: '900', color: Theme.colors.onSurface, letterSpacing: -2 },
  locationText: { color: Theme.colors.onSurfaceVariant, fontSize: 16, fontWeight: '500' },
  locationHighlight: { color: Theme.colors.onSurface },
  activeFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 20 },
  badgeRow: { flexDirection: 'row', gap: -8 },
  badge: { width: 40, height: 40, borderRadius: 20, backgroundColor: Theme.colors.primary, justifyContent: 'center', alignItems: 'center', borderWeight: 4, borderColor: Theme.colors.surface },
  viewBtn: { backgroundColor: Theme.colors.surfaceHigh, paddingHorizontal: 15, height: 40, borderRadius: 20, justifyContent: 'center' },
  viewBtnText: { color: Theme.colors.onSurface, fontWeight: '800', fontSize: 10, letterSpacing: 1 },
  activeId: { marginLeft: 15, color: Theme.colors.onSurfaceVariant, fontWeight: '800', fontSize: 12 },
  cardGlow: { position: 'absolute', bottom: -50, right: -50, width: 200, height: 200, backgroundColor: Theme.colors.primary, opacity: 0.05, borderRadius: 100 },
  sectionTitle: { fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 3, marginTop: 25, marginBottom: 15 },
  bentoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15 },
  mainAction: { flex: 1.5, borderRadius: 24, padding: 25, height: 160, justifyContent: 'space-between' },
  actionIconBox: { width: 50, height: 50, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
  actionTitle: { fontSize: 20, fontWeight: '900', color: Theme.colors.background },
  actionDesc: { fontSize: 12, color: Theme.colors.background, opacity: 0.8, fontWeight: '600' },
  actionColumn: { flex: 1, gap: 10 },
  sideAction: { flex: 1, backgroundColor: Theme.colors.surface, borderRadius: 20, padding: 15, justifyContent: 'center', alignItems: 'center', gap: 5 },
  sideActionTitle: { fontSize: 13, fontWeight: '800', color: Theme.colors.onSurface },
  statsCard: { width: '100%', backgroundColor: Theme.colors.surface, height: 100, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 25, borderWeight: 1, borderColor: '#333' },
  statLine: { fontSize: 11, fontWeight: '900', color: Theme.colors.onSurfaceVariant, letterSpacing: 2 },
  statMoney: { fontSize: 28, fontWeight: '900', color: Theme.colors.onSurface, marginTop: 4 },
  bentoItem: { width: (width - 65) / 2, backgroundColor: Theme.colors.surface, borderRadius: 24, padding: 25, height: (width - 65) / 2, justifyContent: 'space-between' },
  bentoIcon: { width: 50, height: 50, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  bentoTitle: { fontSize: 18, fontWeight: '800', color: Theme.colors.onSurface },
  bentoDesc: { fontSize: 12, color: Theme.colors.onSurfaceVariant, marginTop: 4 },
  activityHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  seeAllText: { fontSize: 10, fontWeight: '800', color: Theme.colors.primary, letterSpacing: 2 },
  activityList: { marginTop: 15 },
  activityItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#131313', padding: 20, borderRadius: 15, marginBottom: 12 },
  activityLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  activityIconBox: { width: 45, height: 45, borderRadius: 22, backgroundColor: Theme.colors.surfaceHigh, justifyContent: 'center', alignItems: 'center' },
  activityTitle: { fontSize: 16, fontWeight: '700', color: Theme.colors.onSurface },
  activityTime: { fontSize: 12, color: Theme.colors.onSurfaceVariant, marginTop: 2 },
  activityPrice: { fontSize: 16, fontWeight: '800', color: Theme.colors.onSurfaceVariant },
  parkBtn: { backgroundColor: Theme.colors.primary, paddingHorizontal: 25, height: 55, borderRadius: 27, justifyContent: 'center', marginTop: 15 },
  parkBtnText: { color: Theme.colors.background, fontWeight: '900', fontSize: 16 },
  emptyText: { textAlign: 'center', marginTop: 50, color: Theme.colors.onSurfaceVariant, fontSize: 16 },
  errorPulse: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Theme.colors.error + '15',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.error + '33'
  }
});

export default DashboardScreen;
