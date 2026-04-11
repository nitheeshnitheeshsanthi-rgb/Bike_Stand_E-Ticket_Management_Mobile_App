import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.188.212.58:5000/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds timeout
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authService = {
  login: async (email, password, role) => {
    const response = await api.post('/auth/login', { email, password, role });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  signup: async (name, email, password, role = 'rider', username, phone) => {
    const response = await api.post('/auth/signup', { name, email, password, role, username, phone });
    if (response.data.token) {
      await AsyncStorage.setItem('token', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },
  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },
  updateProfile: async (data) => {
    const response = await api.put('/auth/update-profile', data);
    if (response.data.success) {
      const currentUser = await AsyncStorage.getItem('user');
      const updatedUser = { ...JSON.parse(currentUser), ...response.data.user };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
    }
    return response.data;
  },
  checkUsername: async (username) => {
    const response = await api.get(`/auth/check-username/${username}`);
    return response.data;
  },
  forgotPassword: async (email) => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
  verifyOTP: async (email, otp) => {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },
  resetPassword: async (email, resetToken, newPassword) => {
    const response = await api.post('/auth/reset-password', { email, resetToken, newPassword });
    return response.data;
  }
};

export const ticketService = {
  getStats: async () => {
    const response = await api.get('/tickets/stats');
    return response.data;
  },
  createEntry: async (vehicleNumber, type, whatsappNumber) => {
    const response = await api.post('/tickets/entry', { vehicleNumber, type, whatsappNumber });
    return response.data;
  },
  getTicket: async (id) => {
    const response = await api.get(`/tickets/ticket/${id}`);
    return response.data;
  },
  scanVerify: async (payload) => {
    const response = await api.post('/tickets/scan-verify', payload);
    return response.data;
  },
  processExit: async (ticketId) => {
    const response = await api.post('/tickets/exit', { ticketId });
    return response.data;
  },
  getHistory: async (vehicleNumber = '') => {
    const response = await api.get(`/tickets/history?vehicleNumber=${vehicleNumber}`);
    return response.data;
  },
  sendWhatsapp: async (ticketId, phone) => {
    const response = await api.post('/tickets/send-whatsapp', { ticketId, phone });
    return response.data;
  }
};

export const paymentService = {
  createOrder: async (ticketId) => {
    const response = await api.post('/payments/create-order', { ticketId });
    return response.data;
  },
  verifyPayment: async (paymentData) => {
    const response = await api.post('/payments/verify-payment', paymentData);
    return response.data;
  },
  markPaid: async (paymentData) => {
    const response = await api.post('/payments/mark-paid', paymentData);
    return response.data;
  }
};

export default api;
