import Constants from 'expo-constants';
import {Platform} from 'react-native';

const extra = Constants?.expoConfig?.extra || {};
const DEFAULT_BASE = Platform.OS === 'android' ? 'http://10.0.2.2' : 'http://localhost';

export const API_BASE_URL = extra.API_BASE_URL || DEFAULT_BASE;
export const ENDPOINTS = {
  REGISTER: '/api/ws/registro',
  LOGIN: '/api/ws/login',
};
