import {API_BASE_URL} from '../../../api/config';
import {getSession} from '../../../api/auth';
import {getOrCreateDeviceUUID} from '../../../utils/uuid';
import type {ModuleKey, SessionResults, SessionStartResponse} from '../types';

const authFetch = async (path: string, init?: RequestInit) => {
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Device-UUID': String(uuid || ''),
  };
  if (session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }
  const url = `${API_BASE_URL}${path}`;
  return fetch(url, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers || {}),
    },
  });
};

const parseJson = async (res: Response) => {
  const contentType = res.headers?.get?.('content-type') || '';
  const rawBody = await res.text();
  let data: any = rawBody;
  if (rawBody && contentType.includes('application/json')) {
    try {
      data = JSON.parse(rawBody);
    } catch (e) {
      // keep raw body
    }
  }
  if (!res.ok) {
    const error: any = new Error(`Request failed with status ${res.status}`);
    error.status = res.status;
    error.body = data;
    throw error;
  }
  return data;
};

export const startSession = async (moduleKey: ModuleKey, countryCode: string, groupId?: number | null) => {
  const res = await authFetch('/api/v1/evaluations/sessions/start', {
    method: 'POST',
    body: JSON.stringify({
      module_key: moduleKey,
      country_code: countryCode,
      ...(groupId ? {group_id: groupId} : {}),
    }),
  });
  return parseJson(res) as Promise<SessionStartResponse>;
};

export const saveSelection = async (sessionId: number, selectedIds: number[]) => {
  const res = await authFetch(`/api/v1/evaluations/sessions/${sessionId}/selection`, {
    method: 'POST',
    body: JSON.stringify({selected_item_ids: selectedIds}),
  });
  return parseJson(res);
};

export const saveAnswer = async (sessionId: number, payload: any) => {
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  console.log('[Diagnostico] saveAnswer request meta', {
    url: `${API_BASE_URL}/api/v1/evaluations/sessions/${sessionId}/answers`,
    token: session?.token || null,
    uuid: uuid || null,
  });
  const res = await authFetch(`/api/v1/evaluations/sessions/${sessionId}/answers`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return parseJson(res);
};

export const completeSession = async (sessionId: number) => {
  const res = await authFetch(`/api/v1/evaluations/sessions/${sessionId}/complete`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return parseJson(res);
};

export const getResults = async (sessionId: number) => {
  const res = await authFetch(`/api/v1/evaluations/sessions/${sessionId}/results`);
  return parseJson(res) as Promise<SessionResults>;
};

export const getHistory = async (moduleKey?: ModuleKey | null, limit = 20, offset = 0) => {
  const params = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (moduleKey) {
    params.set('module_key', moduleKey);
  }
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  console.log('[Diagnostico] getHistory request meta', {
    url: `${API_BASE_URL}/api/v1/evaluations/history?${params.toString()}`,
    token: session?.token || null,
    uuid: uuid || null,
  });
  const res = await authFetch(`/api/v1/evaluations/history?${params.toString()}`);
  return parseJson(res);
};

export const getOpenSession = async () => {
  const res = await authFetch('/api/v1/evaluations/sessions/open');
  return parseJson(res);
};
