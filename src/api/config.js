import Constants from 'expo-constants';
import {Platform} from 'react-native';

const extra = Constants?.expoConfig?.extra || {};
const DEFAULT_BASE = Platform.OS === 'android' ? 'http://10.0.2.2' : 'http://127.0.0.1';

const resolveBaseUrl = () => {
  const configured = extra.API_BASE_URL || DEFAULT_BASE;
  if (!configured) {
    return DEFAULT_BASE;
  }

  // React Native runtimes treat localhost as the device itself.
  if (/^https?:\/\/(localhost|0\.0\.0\.0)(:\d+)?$/i.test(configured)) {
    return DEFAULT_BASE;
  }

  return configured;
};

export const API_BASE_URL = resolveBaseUrl();
export const ENDPOINTS = {
  REGISTER: '/api/ws/registro',
  LOGIN: '/api/ws/login',
  REQUEST_PWD_RESET: '/api/ws/solicitudCambioPwd',
  UPDATE_PWD: '/api/ws/actualizaPwd',
  TUTOR_REQUEST_CODE: '/api/ws/tutor/solicitudCodigo',
  TUTOR_VERIFY_CODE: '/api/ws/tutor/validarCodigo',
  REGISTER_REQUEST_CODE: '/api/ws/registro/solicitudCodigo',
  REGISTER_VERIFY_CODE: '/api/ws/registro/validarCodigo',
  PROFILE: '/api/ws/perfil',
  MEMBRESIAS: '/api/ws/membresias',
  SUSCRIPCION_ACTUAL: '/api/ws/obtenerSuscripcion',
  SUSCRIPCION_INTENT: '/api/ws/suscripcion/intent',
  SUSCRIPCION_CONFIRMAR: '/api/ws/suscripcion/confirmar',
  SUSCRIPCION_CANCELAR: '/api/ws/suscripcion/cancelar',
};
