import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Configure how notifications are handled when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const isExpoGo = Constants.appOwnership === 'expo';

export const notificationService = {
  requestPermissions: async () => {
    try {
      if (isExpoGo && Platform.OS === 'android') {
        console.warn('Expo Go Notifications: Remote functionality is limited in SDK 53+');
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') return false;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
      return true;
    } catch (e) {
      console.warn('Notifications Setup Skipped:', e.message);
      return false;
    }
  },

  sendLocalNotification: async (title, body, data = {}) => {
    try {
      // Local notifications still work for some, but let's be safe
      await Notifications.scheduleNotificationAsync({
        content: { title, body, data, sound: true, priority: Notifications.AndroidNotificationPriority.HIGH },
        trigger: null,
      });
    } catch (err) {
      console.log('Notification suppressed in dev/Go mode:', body);
    }
  }
};
