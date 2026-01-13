export const normalizeTherapyNext = (payload: any) => {
  const base = payload?.data ?? payload;
  const route = base?.route ?? payload?.route ?? null;
  const sessionId =
    base?.session_state?.session_id ??
    base?.session_id ??
    base?.sessionId ??
    base?.session?.id ??
    base?.session?.session_id ??
    base?.sesion_id ??
    payload?.session_id ??
    payload?.sessionId ??
    payload?.session?.id ??
    base?.session_state?.diagnostico_id ??
    base?.diagnostico_id ??
    null;
  const data = base?.payload ?? base?.data ?? base ?? null;
  return { route, sessionId, data, raw: payload };
};

export const isTherapyRoute = (route?: string | null) => {
  return (
    route === 'SESSION_INTRO' ||
    route === 'FOCUS_SELECT' ||
    route === 'FOCUS_CONTENT' ||
    route === 'HEALING_SELECT_EMOTION' ||
    route === 'HEALING_INTRO' ||
    route === 'HEALING_PLAYBACK' ||
    route === 'HEALING_DONE' ||
    route === 'BEHAVIOR_RECO_SELECT' ||
    route === 'BEHAVIOR_EXERCISE_SELECT' ||
    route === 'AGENDA_SETUP'
  );
};

export const extractMotivos = (data: any) => {
  const list = data?.motivos || data?.items || data?.list || data?.motives || [];
  return Array.isArray(list) ? list : [];
};

export const extractEmotions = (data: any) => {
  const list = data?.emociones || data?.emotions || data?.items || data?.list || [];
  return Array.isArray(list) ? list : [];
};

export const getEmotionLabel = (item: any) => {
  if (!item) return '';
  if (typeof item?.label === 'string') return item.label;
  if (typeof item?.emocion === 'string') return item.emocion;
  if (typeof item?.nombre === 'string') return item.nombre;
  if (typeof item?.title === 'string') return item.title;
  if (typeof item?.name === 'string') return item.name;
  return '';
};

export const getEmotionId = (item: any) => {
  return item?.id ?? item?.emocion_id ?? item?.emotion_id ?? null;
};

export const getIntensityRank = (value?: string | number | null) => {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  const v = String(value).toLowerCase();
  if (v.includes('muy') && v.includes('alto')) return 5;
  if (v.includes('alto')) return 4;
  if (v.includes('medio')) return 3;
  return 0;
};

export const getMotivoLabel = (item: any) => {
  if (!item) return '';
  if (typeof item?.motivo === 'string') return item.motivo;
  if (typeof item?.nombre === 'string') return item.nombre;
  if (typeof item?.title === 'string') return item.title;
  if (typeof item?.name === 'string') return item.name;
  if (typeof item?.label === 'string') return item.label;
  if (typeof item?.descripcion === 'string') return item.descripcion;
  if (typeof item?.motivo?.motivo === 'string') return item.motivo.motivo;
  if (typeof item?.motivo?.nombre === 'string') return item.motivo.nombre;
  if (typeof item?.motivo?.title === 'string') return item.motivo.title;
  if (typeof item?.motivo?.name === 'string') return item.motivo.name;
  return '';
};

export const getAudioUrl = (data: any) => {
  if (!data) return '';
  const direct = data?.audio_url || data?.audioUrl || data?.audio?.url || data?.audio?.audio_url;
  if (direct) return String(direct);
  const enfoque = data?.enfoque || data?.focus || null;
  return enfoque?.audio_url || enfoque?.audioUrl || '';
};

export const getAudioTitle = (data: any) => {
  if (!data) return '';
  return data?.titulo || data?.title || data?.nombre || data?.name || data?.enfoque?.nombre || '';
};

export const canSkipAudio = (data: any) => {
  return Boolean(data?.allow_skip ?? data?.can_skip ?? data?.skip_enabled ?? data?.skip_allowed);
};

export const getSkipLabel = (data: any) => {
  return data?.skip_label || data?.skipLabel || 'Saltar';
};
