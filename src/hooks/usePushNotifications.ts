import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { addNotification } from '../utils/notificationStorage';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  }),
});

export interface PushNotificationState {
  expoPushToken: string | undefined;
  notification: Notifications.Notification | undefined;
}

export interface NotificationTapData {
  tipo: string;
  data: Record<string, any>;
  titulo: string;
  mensaje: string;
}

export const usePushNotifications = (onNotificationTap?: (tapData: NotificationTapData) => void): PushNotificationState => {
  const [expoPushToken, setExpoPushToken] = useState<string | undefined>();
  const [notification, setNotification] = useState<Notifications.Notification | undefined>();

  const notificationListener = useRef<Notifications.Subscription | undefined>(undefined);
  const responseListener = useRef<Notifications.Subscription | undefined>(undefined);

  async function registerForPushNotificationsAsync() {
    let token;
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      try {
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId ?? "3addbbcb-6772-4100-aeda-cc592300a1a4";
        token = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
      } catch (e) {
          console.log("Error getting token", e);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return token?.data;
  }

  useEffect(() => {
    registerForPushNotificationsAsync().then((token) => {
        if(token) {
            setExpoPushToken(token);
            AsyncStorage.setItem('EXPO_PUSH_TOKEN', token).catch(e => console.log('Failed saving push token', e));
        }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener(async (notification) => {
      setNotification(notification);
      // Save locally if it has title/body
      const content = notification.request.content;
      if (content && content.title && content.body) {
        await addNotification({
           titulo: content.title,
           mensaje: content.body,
           tipo: content.data?.tipo || 'promocion',
           data: content.data,
        });
      }
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener(async (response) => {
      const content = response.notification.request.content;
      if (content) {
        const tapData: NotificationTapData = {
          tipo: content.data?.tipo || 'promocion',
          data: content.data || {},
          titulo: content.title || '',
          mensaje: content.body || '',
        };
        if (content.title && content.body) {
          await addNotification({
            titulo: content.title,
            mensaje: content.body,
            tipo: tapData.tipo,
            data: content.data,
          });
        }
        if (onNotificationTap) {
          onNotificationTap(tapData);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  return { expoPushToken, notification };
};
