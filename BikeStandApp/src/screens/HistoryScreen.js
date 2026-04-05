import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, RefreshControl, ActivityIndicator, Dimensions } from 'react-native';
import { ticketService } from '../services/api';
import { Search, Bike, MapPin, ChevronRight, History as HistoryIcon, Clock } from 'lucide-react-native';
import { Theme } from '../theme';

const { width } = Dimensions.get('window');

const HistoryScreen = ({ navigation }) => {
  const [history, setHistory] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async (search = '') => {
    try {
      const data = await ticketService.getHistory(search);
      setHistory(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchHistory(searchTerm);
  };

  const handleSearch = () => {
    setLoading(true);
    fetchHistory(searchTerm);
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.historyCard} 
      onPress={() => navigation.navigate('TicketDetail', { ticket: item })}
    >
      <View style={styles.cardLeft}>
        <View style={styles.iconBox}>
          <MapPin size={24} color={Theme.colors.onSurfaceVariant} />
        </View>
        <View>
          <Text style={styles.stationName}>{item.vehicleNumber}</Text>
          <Text style={styles.bikeInfo}>ID: {item.ticketId}</Text>
          <Text style={styles.timeInfo}>{new Date(item.entryTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={[styles.amount, { color: item.paymentStatus === 'PAID' ? Theme.colors.primary : Theme.colors.error }]}>
          {item.paymentStatus === 'PAID' ? `₹${(item.fee || 0).toFixed(2)}` : 'ACTIVE'}
        </Text>
        <ChevronRight size={16} color={Theme.colors.outline} />
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* App Bar */}
      <View style={styles.appBar}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.menuIcon}><HistoryIcon size={24} color={Theme.colors.primary} /></TouchableOpacity>
          <Text style={styles.logoText}>SRI APARNA</Text>
        </View>
        <View style={styles.profileBox} />
      </View>

      <View style={styles.searchSection}>
        <View style={styles.searchWrapper}>
          <Search size={20} color={Theme.colors.outline} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by vehicle number..."
            placeholderTextColor={Theme.colors.outline}
            value={searchTerm}
            onChangeText={setSearchTerm}
            onSubmitEditing={handleSearch}
            autoCapitalize="characters"
          />
        </View>
      </View>

      <View style={styles.header}>
        <Text style={styles.statusLabel}>RECENT PARKING</Text>
        <TouchableOpacity><Text style={styles.seeAllText}>SEE ALL</Text></TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loader}><ActivityIndicator color={Theme.colors.primary} /></View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.ticketId}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Theme.colors.primary} />}
          ListEmptyComponent={<Text style={styles.emptyText}>No transactions found today.</Text>}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.colors.background },
  appBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, height: 70 },
  logoText: { fontSize: 24, fontWeight: '900', color: Theme.colors.primary, letterSpacing: -1.5 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 15 },
  profileBox: { width: 40, height: 40, borderRadius: 20 },
  searchSection: { paddingHorizontal: 25, marginTop: 20 },
  searchWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: Theme.colors.surface, borderRadius: 15, paddingHorizontal: 20, height: 60, borderWeight: 1, borderColor: Theme.colors.surfaceVariant },
  searchIcon: { marginRight: 15 },
  searchInput: { flex: 1, color: Theme.colors.onSurface, fontSize: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 25, marginTop: 40, marginBottom: 20 },
  statusLabel: { fontSize: 10, fontWeight: '800', color: Theme.colors.onSurfaceVariant, letterSpacing: 2.5 },
  seeAllText: { fontSize: 10, fontWeight: '800', color: Theme.colors.primary, letterSpacing: 2 },
  listContent: { paddingHorizontal: 25, paddingBottom: 100 },
  historyCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: Theme.colors.surface + '88', padding: 25, borderRadius: 20, marginBottom: 15, borderWeight: 1, borderColor: '#333' },
  cardLeft: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  iconBox: { width: 45, height: 45, borderRadius: 22, backgroundColor: Theme.colors.surfaceHigh, justifyContent: 'center', alignItems: 'center' },
  stationName: { fontSize: 16, fontWeight: '800', color: Theme.colors.onSurface },
  bikeInfo: { fontSize: 13, color: Theme.colors.onSurfaceVariant, fontWeight: '600', marginTop: 4 },
  timeInfo: { fontSize: 12, color: Theme.colors.outline, marginTop: 2 },
  cardRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  amount: { fontSize: 16, fontWeight: '900' },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { textAlign: 'center', marginTop: 50, color: Theme.colors.onSurfaceVariant, fontSize: 16 },
});

export default HistoryScreen;
