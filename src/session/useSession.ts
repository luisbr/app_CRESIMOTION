import { useCallback, useEffect, useState } from 'react';
import { getSession as getSessionApi, setSession as setSessionApi, clearSession as clearSessionApi } from './storage';

export function useSession() {
  const [loading, setLoading] = useState(true);
  const [session, setSessionState] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const s = await getSessionApi();
      setSessionState(s);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Failed to load session');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const update = useCallback(async (patch: any) => {
    await setSessionApi(patch);
    await refresh();
  }, [refresh]);

  const clear = useCallback(async () => {
    await clearSessionApi();
    await refresh();
  }, [refresh]);

  return { session, loading, error, refresh, update, clear };
}
