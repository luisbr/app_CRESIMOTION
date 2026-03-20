export interface ApiError extends Error {
  code?: string;
  meta?: {
    limit_key?: string;
    allowed_max?: number;
    [key: string]: any;
  };
}

export const isLimitReached = (e: any): e is ApiError => {
  if (!e) return false;
  if (e.code === 'LIMIT_REACHED') return true;
  if (e.meta?.limit_key) return true;
  return false;
};

export const getLimitKeyLabel = (limitKey: string): string => {
  const labels: Record<string, string> = {
    max_recomendaciones: 'recomendaciones',
    max_ejercicios_total: 'ejercicios',
    max_emociones_nombradas_mes: 'emociones',
    max_metaforas_mes: 'metáforas',
  };
  return labels[limitKey] || 'beneficios';
};

export const createApiError = (message: string, code?: string, meta?: any): ApiError => {
  const err = new Error(message) as ApiError;
  err.code = code;
  err.meta = meta;
  return err;
};