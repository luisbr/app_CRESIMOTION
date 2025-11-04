import {API_BASE_URL, ENDPOINTS} from './config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AUTH_HASH, AUTH_ID, AUTH_TOKEN, AUTH_UUID, ACCESS_TOKEN, AUTH_NAME, AUTH_ALIAS} from '../common/constants';
import * as SecureStore from 'expo-secure-store';
import {getOrCreateDeviceUUID} from '../utils/uuid';

const postJson = async (path, body) => {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return data;
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
  }
  return resp;
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
  }
  return resp;
};

export const getSession = async () => {
  const [[, id], [, uuid], [, nombre], [, alias]] = await AsyncStorage.multiGet([
    AUTH_ID,
    AUTH_UUID,
    AUTH_NAME,
    AUTH_ALIAS,
  ]);
  const token = await SecureStore.getItemAsync(AUTH_TOKEN);
  const hash = await SecureStore.getItemAsync(AUTH_HASH);
  return {
    id: id ? JSON.parse(id) : null,
    token: token ? JSON.parse(token) : null,
    uuid: uuid ? JSON.parse(uuid) : null,
    hash: hash ? JSON.parse(hash) : null,
    nombre: nombre ? JSON.parse(nombre) : null,
    alias: alias ? JSON.parse(alias) : null,
  };
};

export const authPost = async (path, body) => {
  const session = await getSession();
  const payload = {
    ...body,
    id: session.id,
    token: session.token,
    uuid: session.uuid,
  };
  return postJson(path, payload);
};
