const DEFAULT_PATH = "/";
const DEFAULT_MAX_AGE = 7 * 24 * 60 * 60; // 7 days

export const setCookie = (
  name: string,
  value: string,
  maxAge = DEFAULT_MAX_AGE,
): void => {
  document.cookie = `${name}=${encodeURIComponent(value)};path=${DEFAULT_PATH};max-age=${maxAge};SameSite=Lax`;
};

export const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const removeCookie = (name: string): void => {
  document.cookie = `${name}=;path=${DEFAULT_PATH};max-age=0`;
};
