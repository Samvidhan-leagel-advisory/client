import type {
  CaseMessage,
  CaseMessagesPage,
  CaseChatConnectionStatus,
  FailedChatMessage,
  UseCaseChatSocketOptions,
} from '@/types';
import { useQueryClient, type InfiniteData } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import {
  CHAT_ERROR,
  CHAT_JOIN,
  CHAT_MESSAGE,
  CHAT_SEND,
  CHAT_SEND_ACK_TIMEOUT_MS,
  createCaseChatSocket,
} from '@/lib/case-chat-socket';
import { invalidateCaseChatUnread } from '@/lib/case-chat-queries';
import { toast } from '@/hooks/use-toast';
import { caseMessagesQueryKey } from './use-case-messages';

export type CaseChatSendPayload =
  | string
  | { text?: string; assetUrl?: string; assetName?: string };

type PendingOutbound = {
  clientMessageId: string;
  label: string;
  payload: Record<string, unknown>;
};

type AckResponse = { ok: boolean; error?: string };

function buildEmitPayload(
  caseId: string,
  raw: CaseChatSendPayload,
  clientMessageId: string
): Record<string, unknown> {
  const text = typeof raw === 'string' ? raw.trim() : (raw.text ?? '').trim();
  const assetUrl = typeof raw === 'string' ? '' : (raw.assetUrl ?? '').trim();
  const assetName = typeof raw === 'string' ? '' : (raw.assetName ?? '').trim();
  return {
    caseId,
    ...(text ? { text } : {}),
    ...(assetUrl ? { assetUrl, ...(assetName ? { assetName } : {}) } : {}),
    clientMessageId,
  };
}

function appendAndSort(messages: CaseMessage[], incoming: CaseMessage): CaseMessage[] {
  if (messages.some((m) => m.id === incoming.id)) return messages;
  return [...messages, incoming].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );
}

export function useCaseChatSocket(options: UseCaseChatSocketOptions): {
  status: CaseChatConnectionStatus;
  send: (payload: CaseChatSendPayload) => void;
  sendingText: string | null;
  failedMessages: FailedChatMessage[];
  retryFailed: (clientMessageId: string) => void;
} {
  const {
    caseId,
    variant,
    enabled,
    markRead,
    isMessagesPending,
    tailMessageId,
    tailFromViewer,
  } = options;

  const queryClient = useQueryClient();
  const socketRef = useRef<Socket | null>(null);
  const [status, setStatus] = useState<CaseChatConnectionStatus>('idle');
  const [sendingText, setSendingText] = useState<string | null>(null);
  const [failedMessages, setFailedMessages] = useState<FailedChatMessage[]>([]);

  const pendingRef = useRef<PendingOutbound | null>(null);
  const failedPayloadsRef = useRef<Map<string, CaseChatSendPayload>>(new Map());
  const lastReadKeyRef = useRef<string | null>(null);

  useEffect(() => {
    lastReadKeyRef.current = null;
  }, [caseId, enabled]);

  useEffect(() => {
    if (!markRead || !caseId || !enabled) return;
    if (isMessagesPending || !tailMessageId) return;

    const key = `${caseId}:${tailMessageId}`;
    if (lastReadKeyRef.current === key) return;
    lastReadKeyRef.current = key;

    if (tailFromViewer) {
      invalidateCaseChatUnread(queryClient);
      return;
    }

    void markRead(caseId, { messageId: tailMessageId })
      .then(() => invalidateCaseChatUnread(queryClient))
      .catch(() => {
        lastReadKeyRef.current = null;
      });
  }, [caseId, enabled, isMessagesPending, markRead, queryClient, tailFromViewer, tailMessageId]);

  useEffect(() => {
    if (!enabled || !caseId) {
      setStatus('idle');
      return;
    }

    const socket = createCaseChatSocket();
    if (!socket) {
      setStatus('idle');
      return;
    }

    setStatus('connecting');
    socketRef.current = socket;

    const messagesQueryKey = caseMessagesQueryKey(caseId, variant);

    const joinRoom = () => socket.emit(CHAT_JOIN, { caseId });

    const onConnect = () => {
      setStatus('open');
      joinRoom();
    };

    const onDisconnect = (reason: string) => {
      if (reason === 'io client disconnect' || reason === 'io server disconnect') {
        setStatus('idle');
      } else {
        setStatus('reconnecting');
      }
    };

    const onConnectError = () => setStatus('error');
    const onReconnect = () => {
      setStatus('open');
      joinRoom();
    };
    const onReconnectFailed = () => setStatus('error');

    const onMessage = (msg: CaseMessage) => {
      const pending = pendingRef.current;
      if (pending && msg.clientMessageId && msg.clientMessageId === pending.clientMessageId) {
        pendingRef.current = null;
        setSendingText(null);
      }

      const { clientMessageId: _drop, ...rest } = msg;

      queryClient.setQueryData(
        messagesQueryKey,
        (prev: InfiniteData<CaseMessagesPage> | undefined) => {
          if (!prev?.pages?.length) {
            queueMicrotask(() => {
              queryClient.invalidateQueries({ queryKey: messagesQueryKey });
            });
            return prev;
          }
          const pages = prev.pages.map((page, idx) => {
            if (idx !== 0) return page;
            return { ...page, messages: appendAndSort(page.messages, rest) };
          });
          return { ...prev, pages };
        }
      );
    };

    const onChatError = (err: { code?: string; error?: string }) => {
      if (err?.code === 'JOIN') {
        setStatus('error');
        toast({
          title: 'Chat unavailable',
          description: err.error || 'You do not have access to this chat.',
          variant: 'destructive',
        });
        return;
      }

      if (err?.code === 'SEND') {
        const pending = pendingRef.current;
        if (pending) {
          setFailedMessages((prev) => [
            ...prev,
            { clientMessageId: pending.clientMessageId, label: pending.label, error: err.error || 'Send failed' },
          ]);
          pendingRef.current = null;
          setSendingText(null);
        }
        toast({
          title: 'Message not sent',
          description: err.error || 'Something went wrong. You can retry below.',
          variant: 'destructive',
        });
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('connect_error', onConnectError);
    socket.on('reconnect', onReconnect);
    socket.on('reconnect_failed', onReconnectFailed);
    socket.on(CHAT_MESSAGE, onMessage);
    socket.on(CHAT_ERROR, onChatError);

    if (socket.connected) onConnect();

    return () => {
      pendingRef.current = null;
      failedPayloadsRef.current.clear();
      setSendingText(null);
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('connect_error', onConnectError);
      socket.off('reconnect', onReconnect);
      socket.off('reconnect_failed', onReconnectFailed);
      socket.off(CHAT_MESSAGE, onMessage);
      socket.off(CHAT_ERROR, onChatError);
      socket.disconnect();
      socketRef.current = null;
      setStatus('idle');
    };
  }, [caseId, enabled, queryClient, variant]);

  const sendPayload = useCallback(
    (raw: CaseChatSendPayload, clientMessageId: string) => {
      const socket = socketRef.current;
      if (!socket?.connected || !caseId) return;

      const outbound = buildEmitPayload(caseId, raw, clientMessageId);
      const label =
        typeof raw === 'string'
          ? raw.trim()
          : (raw.text?.trim() || raw.assetName?.trim() || 'Attachment');

      pendingRef.current = { clientMessageId, label, payload: outbound };
      setSendingText(label);

      failedPayloadsRef.current.set(clientMessageId, raw);

      socket.timeout(CHAT_SEND_ACK_TIMEOUT_MS).emit(
        CHAT_SEND,
        outbound,
        (err: Error | null, ack: AckResponse | undefined) => {
          if (err || !ack?.ok) {
            const pending = pendingRef.current;
            if (pending?.clientMessageId === clientMessageId) {
              const error = ack?.error ?? (err ? 'Request timed out' : 'Send failed');
              setFailedMessages((prev) => [
                ...prev,
                { clientMessageId, label, error },
              ]);
              pendingRef.current = null;
              setSendingText(null);
              toast({ title: 'Message not sent', description: error, variant: 'destructive' });
            }
          } else {
            failedPayloadsRef.current.delete(clientMessageId);
          }
        }
      );
    },
    [caseId]
  );

  const send = useCallback(
    (raw: CaseChatSendPayload) => {
      const text = typeof raw === 'string' ? raw.trim() : (raw.text ?? '').trim();
      const assetUrl = typeof raw === 'string' ? '' : (raw.assetUrl ?? '').trim();
      if (!text && !assetUrl) return;
      sendPayload(raw, crypto.randomUUID());
    },
    [sendPayload]
  );

  const retryFailed = useCallback(
    (clientMessageId: string) => {
      const originalPayload = failedPayloadsRef.current.get(clientMessageId);
      if (!originalPayload) return;

      failedPayloadsRef.current.delete(clientMessageId);
      setFailedMessages((prev) => prev.filter((m) => m.clientMessageId !== clientMessageId));

      sendPayload(originalPayload, crypto.randomUUID());
    },
    [sendPayload]
  );

  return { status, send, sendingText, failedMessages, retryFailed };
}
