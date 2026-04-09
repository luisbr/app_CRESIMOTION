import {API_BASE_URL, ENDPOINTS} from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AUTH_HASH, AUTH_ID, AUTH_TOKEN, AUTH_UUID, ACCESS_TOKEN, AUTH_NAME, AUTH_ALIAS} from '../common/constants';
import * as SecureStore from 'expo-secure-store';
import {getOrCreateDeviceUUID} from '../utils/uuid';

const emptySession = {
  id: null,
  token: null,
  uuid: null,
  hash: null,
  nombre: null,
  alias: null,
};

const clearStoredAuthState = async () => {
  await AsyncStorage.multiRemove([AUTH_ID, AUTH_UUID, AUTH_NAME, AUTH_ALIAS, ACCESS_TOKEN]);
  await SecureStore.deleteItemAsync(AUTH_TOKEN);
  await SecureStore.deleteItemAsync(AUTH_HASH);
};

const hasValue = value => value !== null && value !== undefined;

export const isAuthenticatedSession = (session) => (
  hasValue(session?.id) && !!session?.token && hasValue(session?.uuid)
);

const requireAuthenticatedSession = (session) => {
  if (!isAuthenticatedSession(session)) {
    throw new Error('Sesion no disponible');
  }
};

const postJson = async (path, body) => {
  const url = `${API_BASE_URL}${path}`;
  console.log(`[auth] POST ${url}`);
  console.log('[auth] Payload:', JSON.stringify(body));
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const contentType = res.headers?.get?.('content-type') || '';
    const rawBody = await res.text();
    let data = rawBody;
    if (rawBody && contentType.includes('application/json')) {
      try {
        data = JSON.parse(rawBody);
      } catch (parseErr) {
        console.warn('[auth] Failed to parse JSON response:', parseErr);
      }
    }

    console.log('[auth] Status:', res.status);
    console.log('[auth] Response:', data);

    if (!res.ok) {
      const error = new Error(`Request failed with status ${res.status}`);
      error.status = res.status;
      error.body = data;
      throw error;
    }

    return data;
  } catch (err) {
    console.error('[auth] postJson error:', err?.message || err);
    throw err;
  }
};

export const login = async ({correo, contrasena}) => {

  console.log(ENDPOINTS.LOGIN);
  const uuid = await getOrCreateDeviceUUID();
  const resp = await postJson(ENDPOINTS.LOGIN, {correo: (correo || '').toLowerCase(), contrasena, uuid});
  if (resp && (resp.success === true || resp.status === true)) {
    const {id, token, hash, nombre, alias} = resp;
    await AsyncStorage.multiSet([
      [AUTH_ID, JSON.stringify(id)],
      [AUTH_UUID, JSON.stringify(uuid)],
      [AUTH_NAME, JSON.stringify(nombre || null)],
      [AUTH_ALIAS, JSON.stringify(alias || null)],
      [ACCESS_TOKEN, JSON.stringify(true)],
    ]);
    await SecureStore.setItemAsync(AUTH_TOKEN, JSON.stringify(token));
    await SecureStore.setItemAsync(AUTH_HASH, JSON.stringify(hash));
    
    // Also try to send the push token if we just logged in
    try {
      const pushToken = await AsyncStorage.getItem('EXPO_PUSH_TOKEN');
      if (pushToken) await savePushToken(pushToken);
    } catch(e) {
      console.log('Error saving push token after login', e);
    }
  }
  return resp;
};

export const requestPasswordReset = async ({correo}) => {
  const uuid = await getOrCreateDeviceUUID();
  return postJson(ENDPOINTS.REQUEST_PWD_RESET, {correo: (correo || '').toLowerCase(), uuid});
};

export const updatePassword = async ({correo, token, contrasena}) => {
  const uuid = await getOrCreateDeviceUUID();
  return postJson(ENDPOINTS.UPDATE_PWD, {
    correo: (correo || '').toLowerCase(),
    uuid,
    token,
    contrasena,
  });
};

const splitName = full => {
  const parts = (full || '').trim().split(' ');
  const nombre = parts.shift() || '';
  const apellido = parts.join(' ') || '';
  return {nombre, apellido};
};

const makeAlias = base => {
  const rnd = Math.random().toString(36).substring(2, 6);
  return `${(base || 'user').replace(/\s+/g, '').toLowerCase()}${rnd}`;
};

export const checkAliasAvailability = async ({alias}) => {
  return postJson(ENDPOINTS.CHECK_ALIAS, {alias});
};

export const register = async ({
  fullName,
  nombre,
  apellido,
  correo,
  contrasena,
  telefono,
  fecha_nacimiento,
  menor_edad,
  alias,
  genero,
  idioma,
  como_se_entero,
  tutor_consent,
  tutor_nombre,
  tutor_apellido,
  tutor_fecha_nacimiento,
  tutor_telefono,
  tutor_correo,
  tutor_verificado,
}) => {
  const uuid = await getOrCreateDeviceUUID();
  const nameParts = splitName(fullName);
  const firstName = nombre || nameParts.nombre;
  const lastName = apellido || nameParts.apellido;
  const payload = {
    nombre: firstName,
    apellido: lastName,
    fecha_nacimiento: fecha_nacimiento || '',
    menor_edad: menor_edad ?? 0,
    alias: alias || makeAlias(firstName || correo),
    telefono: telefono || '',
    correo: (correo || '').toLowerCase(),
    contrasena,
    genero: genero || '',
    idioma: idioma || '',
    como_se_entero: como_se_entero || '',
    tutor_consent: tutor_consent ?? 0,
    tutor_nombre: tutor_nombre || '',
    tutor_apellido: tutor_apellido || '',
    tutor_fecha_nacimiento: tutor_fecha_nacimiento || '',
    tutor_telefono: tutor_telefono || '',
    tutor_correo: tutor_correo || '',
    tutor_verificado: tutor_verificado ?? 0,
    estatus: 'activo',
    uuid,
  };
  const resp = await postJson(ENDPOINTS.REGISTER, payload);
  if (resp && (resp.success === true || resp.status === true)) {
    const id = resp.id;
    const token = resp.token;
    const hash = resp.hash;
    const savedNombre = payload.nombre;
    const savedAlias = payload.alias;
    await AsyncStorage.multiSet([
      [AUTH_ID, JSON.stringify(id)],
      [AUTH_UUID, JSON.stringify(uuid)],
      [AUTH_NAME, JSON.stringify(savedNombre || null)],
      [AUTH_ALIAS, JSON.stringify(savedAlias || null)],
      [ACCESS_TOKEN, JSON.stringify(true)],
    ]);
    await SecureStore.setItemAsync(AUTH_TOKEN, JSON.stringify(token));
    await SecureStore.setItemAsync(AUTH_HASH, JSON.stringify(hash));

    // Also try to send the push token if we just registered
    try {
      const pushToken = await AsyncStorage.getItem('EXPO_PUSH_TOKEN');
      if (pushToken) await savePushToken(pushToken);
    } catch(e) {
      console.log('Error saving push token after register', e);
    }
  }
  return resp;
};

export const requestEmailVerificationCode = async ({correo}) => {
  return postJson(ENDPOINTS.REGISTER_REQUEST_CODE, {correo});
};

export const verifyEmailCode = async ({correo, codigo}) => {
  return postJson(ENDPOINTS.REGISTER_VERIFY_CODE, {correo, codigo});
};

export const requestTutorVerificationCode = async ({
  correo_tutor,
  telefono_tutor,
  nombre_tutor,
  apellido_tutor,
  fecha_nacimiento_tutor,
  correo_usuario,
}) => {
  return postJson(ENDPOINTS.TUTOR_REQUEST_CODE, {
    correo_tutor,
    telefono_tutor,
    nombre_tutor,
    apellido_tutor,
    fecha_nacimiento_tutor,
    correo_usuario,
  });
};

export const verifyTutorCode = async ({correo_tutor, codigo}) => {
  return postJson(ENDPOINTS.TUTOR_VERIFY_CODE, {correo_tutor, codigo});
};

export const getSession = async () => {
  const [[, id], [, uuid], [, nombre], [, alias], [, accessTokenFlag]] = await AsyncStorage.multiGet([
    AUTH_ID,
    AUTH_UUID,
    AUTH_NAME,
    AUTH_ALIAS,
    ACCESS_TOKEN,
  ]);
  const token = await SecureStore.getItemAsync(AUTH_TOKEN);
  const hash = await SecureStore.getItemAsync(AUTH_HASH);
  const session = {
    id: id ? JSON.parse(id) : null,
    token: token ? JSON.parse(token) : null,
    uuid: uuid ? JSON.parse(uuid) : null,
    hash: hash ? JSON.parse(hash) : null,
    nombre: nombre ? JSON.parse(nombre) : null,
    alias: alias ? JSON.parse(alias) : null,
  };
  const accessToken = accessTokenFlag ? JSON.parse(accessTokenFlag) === true : false;
  const hasAnyStoredAuth =
    accessToken ||
    hasValue(session.id) ||
    hasValue(session.uuid) ||
    !!session.token ||
    !!session.hash;

  if (!hasAnyStoredAuth) {
    return session;
  }

  const hasCompleteSession = accessToken && isAuthenticatedSession(session);

  if (!hasCompleteSession) {
    console.log('[auth] Clearing inconsistent stored session state');
    await clearStoredAuthState();
    return emptySession;
  }

  return session;
};

export const hasValidSession = async () => {
  const session = await getSession();
  return isAuthenticatedSession(session);
};

export const authPost = async (path, body) => {
  const session = await getSession();
  requireAuthenticatedSession(session);
  const payload = {
    ...body,
    id: session.id,
    token: session.token,
    uuid: session.uuid,
  };
  return postJson(path, payload);
};

const authPostWithHeaders = async (path, body) => {
  const session = await getSession();
  requireAuthenticatedSession(session);
  const url = `${API_BASE_URL}${path}`;
  const token = session.token;
  const uuid = session.uuid;
  console.log(`[auth] POST ${url}`);
  console.log('[auth] Payload:', JSON.stringify(body));
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? {Authorization: `Bearer ${token}`} : {}),
      ...(uuid ? {'X-Device-UUID': uuid} : {}),
    },
    body: JSON.stringify(body),
  });
  const contentType = res.headers?.get?.('content-type') || '';
  const rawBody = await res.text();
  let data = rawBody;
  if (rawBody && contentType.includes('application/json')) {
    try {
      data = JSON.parse(rawBody);
    } catch (parseErr) {
      console.warn('[auth] Failed to parse JSON response:', parseErr);
    }
  }
  console.log('[auth] Status:', res.status);
  console.log('[auth] Response:', data);
  if (!res.ok) {
    const error = new Error(`Request failed with status ${res.status}`);
    error.status = res.status;
    error.body = data;
    throw error;
  }
  return data;
};

export const getProfile = async () => {
  return authPost(ENDPOINTS.PROFILE, {});
};

export const updateProfile = async (payload) => {
  return authPostWithHeaders(ENDPOINTS.PROFILE_UPDATE, payload);
};

export const updateProfilePassword = async ({current_password, new_password}) => {
  return authPostWithHeaders(ENDPOINTS.PROFILE_PASSWORD, {current_password, new_password});
};

export const suspendAccount = async () => {
  return authPostWithHeaders(ENDPOINTS.PROFILE_SUSPEND, {});
};

export const deleteAccount = async () => {
  return authPostWithHeaders(ENDPOINTS.PROFILE_DELETE, {});
};

export const getMembresias = async () => {
  const url = `${API_BASE_URL}${ENDPOINTS.MEMBRESIAS}`;
  const res = await fetch(url);
  return res.json();
};

export const getSuscripcionActual = async () => {
  const session = await getSession();
  const url = `${API_BASE_URL}${ENDPOINTS.SUSCRIPCION_ACTUAL}/${session.id}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
};

export const createSuscripcionIntent = async (membresia_id, success_url, cancel_url, codigo_apoyo = null) => {
  const params = { membresia_id, success_url, cancel_url };
  if (codigo_apoyo) {
    params.codigo_apoyo = codigo_apoyo;
  }
  return authPost(ENDPOINTS.SUSCRIPCION_INTENT, params);
};

export const confirmarSuscripcion = async (membresia_id, session_id) => {
  return authPost(ENDPOINTS.SUSCRIPCION_CONFIRMAR, { membresia_id, session_id });
};

export const cancelarSuscripcion = async () => {
  return authPost(ENDPOINTS.SUSCRIPCION_CANCELAR, {});
};

export const savePushToken = async (expo_push_token) => {
  return authPost(ENDPOINTS.ACTUALIZAR_PUSH_TOKEN, { expo_push_token });
};

export const getPaymentMethod = async () => {
  const session = await getSession();
  const url = `${API_BASE_URL}${ENDPOINTS.SUSCRIPCION_METODO_PAGO}?id=${session.id}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
};

export const getPaymentHistory = async () => {
  const session = await getSession();
  const url = `${API_BASE_URL}${ENDPOINTS.SUSCRIPCION_HISTORIAL}?id=${session.id}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    return res.json();
  } catch (e) {
    return null;
  }
};

export const createSetupIntent = async (success_url, cancel_url) => {
  return authPost(ENDPOINTS.SUSCRIPCION_ACTUALIZAR_METODO, { success_url, cancel_url });
};
