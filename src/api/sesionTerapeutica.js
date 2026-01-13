import { API_BASE_URL } from './config';
import { getSession } from './auth';
import { getOrCreateDeviceUUID } from '../utils/uuid';

const authFetch = async (path, init) => {
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  const headers = {
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

const safeJson = async (res) => {
  const contentType = res.headers?.get?.('content-type') || '';
  const raw = await res.text();
  if (contentType.includes('application/json')) {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }
  return raw || null;
};

export const getTherapyNext = async (userId) => {
  const path = `/api/app/sesion-terapeutica/next?usuario_id=${encodeURIComponent(String(userId))}`;
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  console.log(
    '[THERAPY] curl next',
    `curl -X GET '${API_BASE_URL}${path}' -H 'Authorization: Bearer ${session?.token || ''}' -H 'X-Device-UUID: ${uuid || ''}'`
  );
  const res = await authFetch(path);
  const json = await safeJson(res);
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo obtener el siguiente paso.');
  }
  return json?.data ?? json;
};

export const completeTherapyStep = async ({ sessionId, action, extra }) => {
  const session = await getSession();
  const payload = {
    session_id: sessionId,
    action,
    ...(extra || {}),
  };
  console.log('[THERAPY] step complete request', {
    sessionId,
    action,
    hasToken: Boolean(session?.token),
  });
  const uuid = await getOrCreateDeviceUUID();
  console.log(
    '[THERAPY] curl step complete',
    `curl -X POST '${API_BASE_URL}/api/app/sesion-terapeutica/step/complete' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${session?.token || ''}' -H 'X-Device-UUID: ${uuid || ''}' -d '${JSON.stringify(payload)}'`
  );
  const res = await authFetch('/api/app/sesion-terapeutica/step/complete', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await safeJson(res);
  console.log('[THERAPY] step complete response', {
    status: res.status,
    ok: res.ok,
    body: json,
  });
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo completar el paso.');
  }
  return json?.data ?? json;
};

export const selectTherapyFocus = async ({ sessionId, motivoId }) => {
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  const payload = { session_id: sessionId, motivo_id: motivoId };
  console.log(
    '[THERAPY] curl focus select',
    `curl -X POST '${API_BASE_URL}/api/app/sesion-terapeutica/focus/select' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${session?.token || ''}' -H 'X-Device-UUID: ${uuid || ''}' -d '${JSON.stringify(payload)}'`
  );
  const res = await authFetch('/api/app/sesion-terapeutica/focus/select', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await safeJson(res);
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo seleccionar el motivo.');
  }
  return json?.data ?? json;
};

export const resetTherapySession = async (sessionId) => {
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  const payload = { session_id: sessionId };
  console.log(
    '[THERAPY] curl reset',
    `curl -X POST '${API_BASE_URL}/api/app/sesion-terapeutica/reset' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${session?.token || ''}' -H 'X-Device-UUID: ${uuid || ''}' -d '${JSON.stringify(payload)}'`
  );
  const res = await authFetch('/api/app/sesion-terapeutica/reset', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await safeJson(res);
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo reiniciar la sesión.');
  }
  return json?.data ?? json;
};

export const selectHealingEmotion = async ({ sessionId, emocionId }) => {
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  const payload = { session_id: sessionId, emocion_id: emocionId };
  console.log(
    '[THERAPY] curl healing select',
    `curl -X POST '${API_BASE_URL}/api/app/sesion-terapeutica/healing/select' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${session?.token || ''}' -H 'X-Device-UUID: ${uuid || ''}' -d '${JSON.stringify(payload)}'`
  );
  const res = await authFetch('/api/app/sesion-terapeutica/healing/select', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await safeJson(res);
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo seleccionar la emoción.');
  }
  return json?.data ?? json;
};

export const sendPlaybackEvent = async ({ sessionId, event }) => {
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  const payload = { session_id: sessionId, event };
  console.log(
    '[THERAPY] curl playback event',
    `curl -X POST '${API_BASE_URL}/api/app/sesion-terapeutica/playback/event' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${session?.token || ''}' -H 'X-Device-UUID: ${uuid || ''}' -d '${JSON.stringify(payload)}'`
  );
  const res = await authFetch('/api/app/sesion-terapeutica/playback/event', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await safeJson(res);
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo registrar el evento.');
  }
  return json?.data ?? json;
};

export const postEval = async ({ sessionId, emocionId, value }) => {
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  const payload = { session_id: sessionId, emocion_id: emocionId, value };
  console.log(
    '[THERAPY] curl post-eval',
    `curl -X POST '${API_BASE_URL}/api/app/sesion-terapeutica/post-eval' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${session?.token || ''}' -H 'X-Device-UUID: ${uuid || ''}' -d '${JSON.stringify(payload)}'`
  );
  const res = await authFetch('/api/app/sesion-terapeutica/post-eval', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await safeJson(res);
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo enviar la evaluación.');
  }
  return json?.data ?? json;
};

export const submitBehaviorRecommendations = async ({ sessionId, recomendacionIds }) => {
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  const payload = { session_id: sessionId, recomendacion_ids: recomendacionIds };
  console.log(
    '[THERAPY] curl transformacion recomendaciones',
    `curl -X POST '${API_BASE_URL}/api/app/transformacion/recomendaciones' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${session?.token || ''}' -H 'X-Device-UUID: ${uuid || ''}' -d '${JSON.stringify(payload)}'`
  );
  const res = await authFetch('/api/app/transformacion/recomendaciones', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await safeJson(res);
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo guardar las recomendaciones.');
  }
  return json?.data ?? json;
};

export const submitAgendaItems = async ({ sessionId, items }) => {
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  const payload = { session_id: sessionId, items };
  console.log(
    '[THERAPY] curl agenda save',
    `curl -X POST '${API_BASE_URL}/api/app/agenda/save' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${session?.token || ''}' -H 'X-Device-UUID: ${uuid || ''}' -d '${JSON.stringify(payload)}'`
  );
  const res = await authFetch('/api/app/agenda/save', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await safeJson(res);
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo guardar la agenda.');
  }
  return json?.data ?? json;
};

export const submitBehaviorExercises = async ({ sessionId, items }) => {
  const session = await getSession();
  const uuid = await getOrCreateDeviceUUID();
  const payload = { session_id: sessionId, items };
  console.log(
    '[THERAPY] curl transformacion ejercicios',
    `curl -X POST '${API_BASE_URL}/api/app/transformacion/ejercicios' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${session?.token || ''}' -H 'X-Device-UUID: ${uuid || ''}' -d '${JSON.stringify(payload)}'`
  );
  const res = await authFetch('/api/app/transformacion/ejercicios', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await safeJson(res);
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo guardar los ejercicios.');
  }
  return json?.data ?? json;
};

export const getAgendaItems = async () => {
  const res = await authFetch('/api/app/agenda');
  const json = await safeJson(res);
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo cargar la agenda.');
  }
  return json?.data ?? json;
};

export const updateAgendaItem = async (payload) => {
  const res = await authFetch('/api/app/agenda/update', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  const json = await safeJson(res);
  if (!res.ok || (json && json.ok === false)) {
    throw new Error(json?.message || 'No se pudo actualizar la agenda.');
  }
  return json?.data ?? json;
};
