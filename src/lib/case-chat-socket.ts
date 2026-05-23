import { env } from '@/config/env';
import { getAccessToken } from '@/lib/auth-token';
import { getCookie } from '@/lib/helpers';
import { io, type Socket } from 'socket.io-client';

/**
 * Socket.IO event names — must stay aligned with
 * `nyaya/src/case-chat/case-chat.constants.ts`.
 */
export const CHAT_JOIN = 'chat.join';
export const CHAT_SEND = 'chat.send';
export const CHAT_MESSAGE = 'chat.message';
export const CHAT_NOTIFY = 'chat.notify';
export const CHAT_ERROR = 'chat.error';

export const CASE_CHAT_IO_PATH = '/api/socket.io';

/** ACK timeout for chat.send — if the server doesn't respond within this window, treat as failed. */
export const CHAT_SEND_ACK_TIMEOUT_MS = 8_000;

export function createCaseChatSocket(): Socket | null {
  if (!env.socketOrigin) return null;
  const activeRole = getCookie('x-active-role');
  const token = getAccessToken();
  return io(env.socketOrigin, {
    path: CASE_CHAT_IO_PATH,
    withCredentials: true,
    auth: {
      activeRole: activeRole || undefined,
      ...(token ? { token } : {}),
    },
    transports: ['websocket'],
    timeout: env.apiTimeoutMs,
    reconnection: true,
    reconnectionDelay: 1_000,
    reconnectionDelayMax: 8_000,
    reconnectionAttempts: 10,
  });
}
