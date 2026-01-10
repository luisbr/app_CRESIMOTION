import { API_BASE_URL } from './config';

function join(base, path) {
  if (!base) return path;
  if (base.endsWith('/')) base = base.slice(0, -1);
  if (!path.startsWith('/')) path = '/' + path;
  return base + path;
}

export async function getEncuestaById(id) {
  const url = join(API_BASE_URL, `api/ws/encuesta/${id}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  const json = await res.json();
  if (!json?.status) throw new Error(json?.message || 'API error');
  return json.data;
}

export async function getEncuestas() {
  const url = join(API_BASE_URL, 'api/ws/encuestas');
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network error');
  const json = await res.json();
  if (!json?.status) throw new Error(json?.message || 'API error');
  // Esperamos un array con encuestas completas (incluyendo motivos/intensidades)
  return json.data;
}
