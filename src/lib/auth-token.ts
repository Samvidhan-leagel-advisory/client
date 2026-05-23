const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

const safeGet = (key: string): string | null => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const safeSet = (key: string, value: string): void => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // localStorage unavailable (e.g. private browsing with storage blocked)
  }
};

const safeRemove = (key: string): void => {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
};

export const setTokens = (accessToken: string, refreshToken: string): void => {
  safeSet(ACCESS_TOKEN_KEY, accessToken);
  safeSet(REFRESH_TOKEN_KEY, refreshToken);
};

export const getAccessToken = (): string | null => safeGet(ACCESS_TOKEN_KEY);

export const getRefreshToken = (): string | null => safeGet(REFRESH_TOKEN_KEY);

export const clearTokens = (): void => {
  safeRemove(ACCESS_TOKEN_KEY);
  safeRemove(REFRESH_TOKEN_KEY);
};
