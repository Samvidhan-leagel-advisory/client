import { env } from '@/config/env';
import { ROUTES } from '@/constants/routes';
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from '@/lib/auth-token';
import { getCookie, resetCookies } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import axios from 'axios';
import routes from './routes';

const ACTIVE_ROLE_COOKIE = 'x-active-role';

function isAndroidNativeShell() {
  if (typeof window === 'undefined') return false;
  return (
    window.__samvidhanNativeApp === true &&
    window.__samvidhanNativePlatform === 'android'
  );
}

/** Paths that don't need an Authorization header (login / register). */
const skipAuthPaths = new Set([
  routes.GOOGLE_AUTH_LOGIN.URL,
  routes.LOGIN.URL,
  routes.ADMIN_LOGIN.URL,
  routes.ADMIN_LOGIN_VERIFY_OTP.URL,
  routes.ADMIN_LOGIN_RESEND_OTP.URL,
  routes.DUMMY_LOGIN.URL,
]);

// --- Axios instance ---

const apiClient = axios.create({
  // Local dev: use explicit origin from env. Production: use /api prefix so
  // Vercel routes /api/* to the backend without conflicting with React Router paths.
  baseURL: env.apiBaseUrl || '/api',
  timeout: env.apiTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// --- Refresh state (prevents parallel refresh calls) ---

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach(({ resolve, reject }) => {
    error ? reject(error) : resolve();
  });
  failedQueue = [];
};

const enqueueFailedRequest = () => {
  return new Promise((resolve, reject) => {
    failedQueue.push({ resolve, reject });
  });
};

// --- Helpers ---

const isRefreshRequest = (config) => config.url === routes.REFRESH_TOKEN.URL;

const redirectToLogin = async (requestUrl = '') => {
  queryClient.clear();
  const isAdminRequest = requestUrl.startsWith('/admin/');

  try {
    let logoutUrl = env.apiBaseUrl
      ? `${env.apiBaseUrl}${routes.LOGOUT.URL}`
      : routes.LOGOUT.URL;
    if (isAndroidNativeShell()) {
      logoutUrl += logoutUrl.includes('?') ? '&' : '?';
      logoutUrl += 'clearFcm=1';
    }
    await fetch(logoutUrl, {
      method: routes.LOGOUT.METHOD,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(getAccessToken()
          ? { Authorization: `Bearer ${getAccessToken()}` }
          : {}),
      },
    });
  } catch {
    /* ignore — still clear client-visible session hints */
  }

  clearTokens();
  resetCookies();
  localStorage.removeItem('auth_user');

  window.location.href = isAdminRequest ? ROUTES.admin.login : ROUTES.login;
};

const attemptTokenRefresh = async () => {
  return apiClient({
    method: routes.REFRESH_TOKEN.METHOD,
    url: routes.REFRESH_TOKEN.URL,
    data: {},
  });
};

// --- Request interceptor ---

apiClient.interceptors.request.use(
  (config) => {
    const url = config.url ?? '';

    if (isRefreshRequest(config)) {
      // Inject refresh token from localStorage into the request body.
      const refreshToken = getRefreshToken();
      if (refreshToken) {
        config.data = { ...(config.data ?? {}), refreshToken };
      }
      return config;
    }

    if (skipAuthPaths.has(url)) {
      return config;
    }

    // Attach access token as Authorization header.
    const accessToken = getAccessToken();
    if (accessToken) {
      config.headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const activeRole = getCookie(ACTIVE_ROLE_COOKIE);
    if (activeRole) {
      config.headers.set('x-active-role', activeRole);
    }

    if (url === routes.LOGOUT.URL && isAndroidNativeShell()) {
      config.url = `${routes.LOGOUT.URL}?clearFcm=1`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response interceptor ---

apiClient.interceptors.response.use(
  (response) => {
    // Persist tokens whenever the backend returns them (login / refresh).
    const { accessToken, refreshToken } = response.data ?? {};
    if (typeof accessToken === 'string' && typeof refreshToken === 'string') {
      setTokens(accessToken, refreshToken);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest?.url) {
      return Promise.reject(error);
    }

    const isUnauthorized = error.response?.status === 401;
    const isAlreadyRetried = originalRequest._retry;
    const isRefreshCall = isRefreshRequest(originalRequest);
    const isAuthEndpoint = skipAuthPaths.has(originalRequest.url);

    // Auth endpoints (login/register) — just reject, don't redirect
    if (isAuthEndpoint) {
      return Promise.reject(error);
    }

    // If refresh itself failed or already retried, bail out
    if (!isUnauthorized || isAlreadyRetried || isRefreshCall) {
      if (isUnauthorized) await redirectToLogin(originalRequest.url);
      return Promise.reject(error);
    }

    // If another request is already refreshing, queue this one
    if (isRefreshing) {
      await enqueueFailedRequest();
      return apiClient(originalRequest);
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await attemptTokenRefresh();
      isRefreshing = false;
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      processQueue(refreshError);
      await redirectToLogin(originalRequest.url);
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
