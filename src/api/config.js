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
export const ENABLE_FORWARD_BUTTON = extra.ENABLE_FORWARD_BUTTON !== false;
export const ENDPOINTS = {
  REGISTER: '/api/ws/registro',
  LOGIN: '/api/ws/login',
  CHECK_ALIAS: '/api/ws/checkAlias',
  REQUEST_PWD_RESET: '/api/ws/solicitudCambioPwd',
  UPDATE_PWD: '/api/ws/actualizaPwd',
  TUTOR_REQUEST_CODE: '/api/ws/tutor/solicitudCodigo',
  TUTOR_VERIFY_CODE: '/api/ws/tutor/validarCodigo',
  REGISTER_REQUEST_CODE: '/api/ws/registro/solicitudCodigo',
  REGISTER_VERIFY_CODE: '/api/ws/registro/validarCodigo',
  PROFILE: '/api/ws/perfil',
  PROFILE_UPDATE: '/api/v1/profile/update',
  PROFILE_PASSWORD: '/api/v1/profile/password',
  PROFILE_SUSPEND: '/api/v1/profile/suspend',
  PROFILE_DELETE: '/api/v1/profile/delete',
  MEMBRESIAS: '/api/ws/membresias',
  SUSCRIPCION_ACTUAL: '/api/ws/obtenerSuscripcion',
  SUSCRIPCION_INTENT: '/api/ws/suscripcion/intent',
  SUSCRIPCION_CONFIRMAR: '/api/ws/suscripcion/confirmar',
  SUSCRIPCION_CANCELAR: '/api/ws/suscripcion/cancelar',
  ACTUALIZAR_PUSH_TOKEN: '/api/ws/actualizarPushToken',
  SUSCRIPCION_METODO_PAGO: '/api/ws/suscripcion/metodo-pago',
  SUSCRIPCION_HISTORIAL: '/api/ws/suscripcion/historial',
  SUSCRIPCION_ACTUALIZAR_METODO: '/api/ws/suscripcion/actualizar-metodo',
};
