import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_ID, AUTH_TOKEN, AUTH_UUID, AUTH_HASH, AUTH_NAME, AUTH_ALIAS, ACCESS_TOKEN } from '../common/constants';

type Session = {
  id: number | string | null;
  token: string | null;
  uuid: string | null;
  hash: string | null;
  nombre?: string | null;
  alias?: string | null;
};

const secureKeys = [AUTH_TOKEN, AUTH_HASH] as const;

async function migrateFromAsyncStorageOnce() {
  try {
    const migratedFlag = await AsyncStorage.getItem('SECURE_MIGRATED_V1');
    if (migratedFlag) return;

    const pairs = await AsyncStorage.multiGet([AUTH_TOKEN, AUTH_HASH]);
    for (const [k, v] of pairs) {
      if (v) {
        await SecureStore.setItemAsync(k!, v, {
          keychainAccessible: SecureStore.WHEN_UNLOCKED,
        });
        await AsyncStorage.removeItem(k!);
      }
    }
    await AsyncStorage.setItem('SECURE_MIGRATED_V1', '1');
  } catch (e) {
    // noop: don't block app if migration fails; it will retry next run
  }
}

export async function setSession(partial: Session) {
  // Persist secure fields to SecureStore; others to AsyncStorage
  const ops: [string, string][] = [];
  if (partial.id !== undefined) ops.push([AUTH_ID, JSON.stringify(partial.id)]);
  if (partial.uuid !== undefined) ops.push([AUTH_UUID, JSON.stringify(partial.uuid)]);
  if (partial.nombre !== undefined) ops.push([AUTH_NAME, JSON.stringify(partial.nombre ?? null)]);
  if (partial.alias !== undefined) ops.push([AUTH_ALIAS, JSON.stringify(partial.alias ?? null)]);

  // ACCESS_TOKEN is a simple flag denoting logged-in state
  ops.push([ACCESS_TOKEN, JSON.stringify(true)]);
  if (ops.length) await AsyncStorage.multiSet(ops);

  if (partial.token !== undefined) {
    await SecureStore.setItemAsync(AUTH_TOKEN, JSON.stringify(partial.token), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  }
  if (partial.hash !== undefined) {
    await SecureStore.setItemAsync(AUTH_HASH, JSON.stringify(partial.hash), {
      keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
  }
}

export async function getSession(): Promise<Session> {
  await migrateFromAsyncStorageOnce();
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
    uuid: uuid ? JSON.parse(uuid) : null,
    token: token ? JSON.parse(token) : null,
    hash: hash ? JSON.parse(hash) : null,
    nombre: nombre ? JSON.parse(nombre) : null,
    alias: alias ? JSON.parse(alias) : null,
  };
}

export async function clearSession() {
  await AsyncStorage.multiRemove([AUTH_ID, AUTH_UUID, AUTH_NAME, AUTH_ALIAS, ACCESS_TOKEN]);
  for (const k of secureKeys) {
    await SecureStore.deleteItemAsync(k);
  }
}

export async function isLoggedIn(): Promise<boolean> {
  const v = await AsyncStorage.getItem(ACCESS_TOKEN);
  return v ? JSON.parse(v) === true : false;
}

