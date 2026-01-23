import {API_BASE_URL} from '../../../api/config';

const fetchJson = async (path: string) => {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url);
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

export const getEmergencyByLocation = async (lat: number, lng: number) => {
  const query = `?lat=${encodeURIComponent(String(lat))}&lng=${encodeURIComponent(String(lng))}`;
  return fetchJson(`/api/ws/emergency-contacts/by-location${query}`);
};

export const getEmergencyContacts = async () => {
  return fetchJson('/api/ws/emergency-contacts');
};
