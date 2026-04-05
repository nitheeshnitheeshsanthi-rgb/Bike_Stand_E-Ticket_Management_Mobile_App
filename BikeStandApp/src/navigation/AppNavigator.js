import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Home, Ticket, History, User, Layout } from 'lucide-react-native';
import { Theme } from '../theme';

import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import DashboardScreen from '../screens/DashboardScreen';
import EntryScreen from '../screens/EntryScreen';
import ScannerScreen from '../screens/ScannerScreen';
import TicketDetailScreen from '../screens/TicketDetailScreen';
import ExitScreen from '../screens/ExitScreen';
import HistoryScreen from '../screens/HistoryScreen';
import ProfileScreen from '../screens/ProfileScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import VerifyOTPScreen from '../screens/VerifyOTPScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';
import PaymentScreen from '../screens/PaymentScreen';
import ReceiptScreen from '../screens/ReceiptScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.tabContainer}>
      <View style={styles.tabContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          const Icon = options.tabBarIcon;

          return (
            <TouchableOpacity key={route.key} onPress={onPress} style={[styles.tabItem, isFocused && styles.tabItemActive]}>
              <Icon size={24} color={isFocused ? Theme.colors.primary : Theme.colors.onSurfaceVariant} />
              <Text style={[styles.tabLabel, { color: isFocused ? Theme.colors.primary : Theme.colors.onSurfaceVariant }]}>
                {route.name.toUpperCase()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const TabNavigator = () => (
  <Tab.Navigator
    tabBar={props => <CustomTabBar {...props} />}
    screenOptions={{ headerShown: false }}
  >
    <Tab.Screen name="Home" component={DashboardScreen} options={{ tabBarIcon: (props) => <Home size={props.size} color={props.color} /> }} />
    <Tab.Screen name="Tickets" component={HistoryScreen} 
      options={{ tabBarIcon: (props) => <Ticket size={props.size} color={props.color} /> }} />
    <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarIcon: (props) => <User size={props.size} color={props.color} /> }} />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      console.log('--- Checking Token ---');
      const token = await AsyncStorage.getItem('token');
      console.log('Token found:', !!token);
      if (token) setIsAuthenticated(true);
    } catch (err) {
      console.error('Token Check Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: Theme.colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={{ color: Theme.colors.primary, marginTop: 10, fontSize: 10, letterSpacing: 2 }}>INITIALIZING HUB...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        initialRouteName={isAuthenticated ? "Main" : "Landing"}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Theme.colors.background }
        }}
      >
        <Stack.Screen name="Landing" component={HomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen name="Scanner" component={ScannerScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Entry" component={EntryScreen} />
        <Stack.Screen name="Exit" component={ExitScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="TicketDetail" component={TicketDetailScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
        <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        <Stack.Screen name="Receipt" component={ReceiptScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  tabContainer: { 
    position: 'absolute', 
    bottom: 20, 
    left: 20, 
    right: 20, 
    height: 75, 
    backgroundColor: 'transparent' 
  },
  tabContent: { 
    flexDirection: 'row', 
    backgroundColor: '#1a1a1a', 
    borderRadius: 35, 
    height: '100%', 
    paddingHorizontal: 15, 
    justifyContent: 'space-around', 
    alignItems: 'center', 
    shadowColor: Theme.colors.primary, 
    shadowOffset: { width: 0, height: 10 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 20,
    elevation: 10
  },
  tabItem: { alignItems: 'center', paddingVertical: 10, paddingHorizontal: 15, borderRadius: 30 },
  tabItemActive: { backgroundColor: Theme.colors.primary + '15' },
  tabLabel: { fontSize: 9, fontWeight: '800', marginTop: 6, letterSpacing: 1 },
});

export default AppNavigator;
