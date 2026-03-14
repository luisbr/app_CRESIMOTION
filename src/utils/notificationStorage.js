import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTIFICATIONS_KEY = '@user_notifications';

export const getStoredNotifications = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem(NOTIFICATIONS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error reading notifications', e);
    return [];
  }
};

export const saveStoredNotifications = async (notifications) => {
  try {
    const jsonValue = JSON.stringify(notifications);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, jsonValue);
  } catch (e) {
    console.error('Error saving notifications', e);
  }
};

export const addNotification = async (notificationData) => {
  const notifications = await getStoredNotifications();
  
  // check if already exists by id (if push notification has an id)
  if (notificationData.id) {
    const exists = notifications.find(n => n.id === notificationData.id);
    if (exists) return notifications;
  }
  
  const newNotification = {
    ...notificationData,
    localId: notificationData.id || Date.now().toString() + Math.random().toString(),
    isNew: true,
    isRead: false,
    isFavorite: false,
    isArchived: false,
    isDeleted: false,
    date: new Date().toISOString(),
  };
  
  const updatedNotifications = [newNotification, ...notifications];
  await saveStoredNotifications(updatedNotifications);
  return updatedNotifications;
};

export const markAllAsOld = async () => {
  const notifications = await getStoredNotifications();
  const updated = notifications.map(n => ({...n, isNew: false}));
  await saveStoredNotifications(updated);
  return updated;
};

export const updateNotificationStatus = async (localId, updates) => {
  const notifications = await getStoredNotifications();
  const updated = notifications.map(n => 
    n.localId === localId ? { ...n, ...updates } : n
  );
  await saveStoredNotifications(updated);
  return updated;
};
