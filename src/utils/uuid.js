import AsyncStorage from '@react-native-async-storage/async-storage';
import {DEVICE_UUID} from '../common/constants';

const randomHex = len => {
  let out = '';
  for (let i = 0; i < len; i++) {
    out += Math.floor(Math.random() * 16).toString(16);
  }
  return out;
};

const generateUUID = () => {
  const s = randomHex(8) + '-' + randomHex(4) + '-' + randomHex(4) + '-' + randomHex(4) + '-' + randomHex(12);
  return s;
};

export const getOrCreateDeviceUUID = async () => {
  let uuid = await AsyncStorage.getItem(DEVICE_UUID);
  if (!uuid) {
    uuid = generateUUID();
    await AsyncStorage.setItem(DEVICE_UUID, uuid);
  }
  return uuid;
};

