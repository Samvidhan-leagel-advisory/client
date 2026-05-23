import { updateUserFcmToken } from '@/api-client';
import { getCookie } from '@/lib/helpers';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function isLoggedIn() {
  return !!getCookie('x-active-role');
}

function isAndroidNativeShell() {
  if (typeof window === 'undefined') return false;
  const w = window as Window & {
    __samvidhanNativeApp?: boolean;
    __samvidhanNativePlatform?: string;
  };
  return w.__samvidhanNativeApp === true && w.__samvidhanNativePlatform === 'android';
}

function waitForInjectedNativeToken(timeoutMs = 25000): Promise<string | null> {
  if (typeof window === 'undefined' || !isAndroidNativeShell()) {
    return Promise.resolve(null);
  }
  const w = window as Window & { nativeFCMToken?: string };
  if (typeof w.nativeFCMToken === 'string' && w.nativeFCMToken.length > 0) {
    return Promise.resolve(w.nativeFCMToken);
  }
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      window.removeEventListener('nativeTokenReady', onReady);
      resolve(null);
    }, timeoutMs);
    const onReady = () => {
      window.clearTimeout(timer);
      window.removeEventListener('nativeTokenReady', onReady);
      const t = w.nativeFCMToken;
      resolve(typeof t === 'string' && t.length > 0 ? t : null);
    };
    window.addEventListener('nativeTokenReady', onReady);
  });
}

async function pushTokenToBackend(token: string) {
  try {
    await updateUserFcmToken({ fcmToken: token });
  } catch {
    /* retry on next navigation or nativeTokenReady */
  }
}

async function syncAndroidInjectedToken() {
  const token = await waitForInjectedNativeToken();
  if (token) await pushTokenToBackend(token);
}

/** Registers native FCM token from the Android Expo shell only (no web push). */
export async function syncFcmToken() {
  if (!isLoggedIn() || !isAndroidNativeShell()) return;
  await syncAndroidInjectedToken();
}

export function useFcmToken() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined' || !isAndroidNativeShell()) return;
    const onReady = () => void syncFcmToken();
    window.addEventListener('nativeTokenReady', onReady);
    return () => window.removeEventListener('nativeTokenReady', onReady);
  }, []);

  useEffect(() => {
    if (!isLoggedIn() || !isAndroidNativeShell()) return;
    void syncFcmToken();
  }, [pathname]);
}

export function FcmTokenSync() {
  useFcmToken();
  return null;
}
