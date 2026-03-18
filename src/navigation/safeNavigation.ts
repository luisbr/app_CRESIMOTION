import {useMemo} from 'react';

let navigationLocked = false;
let lockTimer: ReturnType<typeof setTimeout> | null = null;

const LOCK_TIMEOUT_MS = 1200;

const scheduleFallbackUnlock = () => {
  if (lockTimer) {
    clearTimeout(lockTimer);
  }
  lockTimer = setTimeout(() => {
    navigationLocked = false;
    lockTimer = null;
  }, LOCK_TIMEOUT_MS);
};

export const releaseNavigationLock = () => {
  navigationLocked = false;
  if (lockTimer) {
    clearTimeout(lockTimer);
    lockTimer = null;
  }
};

export const runWithNavigationLock = (action: () => void) => {
  if (navigationLocked) {
    return false;
  }
  navigationLocked = true;
  scheduleFallbackUnlock();
  try {
    action();
    return true;
  } catch (error) {
    releaseNavigationLock();
    throw error;
  }
};

export const useSafeNavigation = (navigation: any) =>
  useMemo(
    () => ({
      navigate: (...args: any[]) => runWithNavigationLock(() => navigation.navigate(...args)),
      replace: (...args: any[]) => runWithNavigationLock(() => navigation.replace(...args)),
      reset: (...args: any[]) => runWithNavigationLock(() => navigation.reset(...args)),
      raw: navigation,
    }),
    [navigation]
  );
