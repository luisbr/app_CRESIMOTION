import NetInfo from '@react-native-community/netinfo';

export const isWifiConnected = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.type === 'wifi' || state.type === 'ethernet';
  } catch (e) {
    console.log('Error checking network type', e);
    return false;
  }
};

export const getNetworkType = async () => {
  try {
    const state = await NetInfo.fetch();
    return state.type;
  } catch (e) {
    console.log('Error getting network type', e);
    return 'unknown';
  }
};

export const shouldAllowDownload = async (descargaWifiPreference) => {
  // If descarga_wifi is 0 (disabled), allow download on any network
  if (descargaWifiPreference === 0) {
    return { allowed: true, reason: null };
  }
  
  // If descarga_wifi is 1 (enabled), only allow on WiFi
  const isWifi = await isWifiConnected();
  if (!isWifi) {
    return { 
      allowed: false, 
      reason: 'Estás usando datos móviles. La descarga solo está disponible con WiFi según tu configuración.' 
    };
  }
  
  return { allowed: true, reason: null };
};
