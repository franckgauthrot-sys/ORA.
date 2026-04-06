import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configuration des notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Demander la permission et récupérer le token
export const registerForPushNotifications = async (userId) => {
  if (!Device.isDevice) {
    console.log('Les notifications nécessitent un vrai appareil');
    return null;
  }

  // Demander la permission
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Permission refusée');
    return null;
  }

  // Récupérer le token Expo Push
  const token = (await Notifications.getExpoPushTokenAsync()).data;
  console.log('Push token:', token);

  // Sauvegarder le token dans Supabase
  if (userId && token) {
    await supabase
      .from('profiles')
      .update({ push_token: token })
      .eq('id', userId);
  }

  // Configuration Android
  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  return token;
};

// Écouter les notifications reçues
export const setupNotificationListeners = (onNotification) => {
  const receivedSub = Notifications.addNotificationReceivedListener(notification => {
    console.log('Notification reçue:', notification);
    if (onNotification) onNotification(notification);
  });

  const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
    console.log('Notification cliquée:', response);
  });

  return () => {
    receivedSub.remove();
    responseSub.remove();
  };
};