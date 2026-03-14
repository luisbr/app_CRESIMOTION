import { getSession } from './auth';
import { API_BASE_URL } from './config';

/**
 * Fetches the list of active custom tests
 */
export async function getCustomTests(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/app/custom-tests`);
    const json = await res.json();
    return json.data ?? [];
  } catch (e) {
    console.log('[CustomTests][ERROR] getCustomTests', e);
    return [];
  }
}

/**
 * Fetches a single test with its questions and scoring ranges
 */
export async function getCustomTest(id: number | string): Promise<any | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/app/custom-tests/${id}`);
    const json = await res.json();
    return json.data ?? null;
  } catch (e) {
    console.log('[CustomTests][ERROR] getCustomTest', e);
    return null;
  }
}

/**
 * Submits the user's test result to the backend
 */
export async function submitCustomTestResult(
  testId: number | string,
  puntaje: number,
): Promise<any | null> {
  try {
    const session = await getSession();
    const usuarioId = session?.id ?? 0;
    const res = await fetch(`${API_BASE_URL}/api/app/custom-tests/${testId}/resultado`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ puntaje, usuario_id: usuarioId }),
    });
    const json = await res.json();
    console.log('[CustomTests] API Response:', JSON.stringify(json, null, 2));
    return json;
  } catch (e) {
    console.log('[CustomTests][ERROR] submitCustomTestResult', e);
    return null;
  }
}
