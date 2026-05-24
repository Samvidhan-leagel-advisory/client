import { CaseCodeText } from '@/components/CaseCodeText';
import { Button } from '@/components/ui/button';
import { env } from '@/config/env';
import {
  caseNotificationsHubPath,
  isCaseChatPathname,
  isCaseNotificationsHubPathname,
  path,
} from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { useCaseChatUnreadSummary } from '@/hooks/use-case-chat-unread';
import { useDraggableFixedStack } from '@/hooks/use-draggable-fixed-stack';
import {
  invalidateCaseChatUnread,
  invalidateCaseMessagesForCase,
} from '@/lib/case-chat-queries';
import { CHAT_NOTIFY, createCaseChatSocket } from '@/lib/case-chat-socket';
import { playCaseMessageChime } from '@/lib/case-notify-sound';
import { getCookie } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import { cn } from '@/lib/utils';
import type { CaseChatNotifierLivePeek, CaseChatNotifyPayload } from '@/types';
import { MessageCircle, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PEEK_MS = 2200;
const UNREAD_INVALIDATE_DEBOUNCE_MS = 600;

const NOTIFIER_POS_STORAGE_KEY = 'caseChatNotifierPosition';

const APP_ROLES = new Set(['admin', 'lawyer', 'user']);

function hasChatNotifySession(userId: string | undefined, activeRole: string | undefined) {
  if (userId) return true;
  return Boolean(activeRole && APP_ROLES.has(activeRole));
}

function truncate(s: string, n: number) {
  const t = s.trim();
  if (t.length <= n) return t;
  return t.slice(0, n);
}

function peekSenderLabel(role: string) {
  if (role === 'lawyer') return 'Lawyer';
  if (role === 'admin') return 'Admin';
  return 'User';
}

/**
 * Live peek on new messages + FAB to open the inbox page (same data as sidebar badge).
 */
export function CaseChatGlobalNotifier() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const openCaseIdRef = useRef<string | null>(null);
  const recentKeys = useRef<string[]>([]);
  const peekTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const invalidateDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [livePeek, setLivePeek] = useState<CaseChatNotifierLivePeek | null>(null);

  const { stackRef, positionStyle, inboxFabDragProps, consumeClickIfDragged } =
    useDraggableFixedStack({
      storageKey: NOTIFIER_POS_STORAGE_KEY,
      defaultPositionStyle: {
        right: 'max(0.75rem, env(safe-area-inset-right))',
        bottom: 'max(1.25rem, env(safe-area-inset-bottom))',
        left: 'auto',
        top: 'auto',
      },
    });

  const { data: unread } = useCaseChatUnreadSummary(user?.id);
  const totalUnread = unread?.totalUnread ?? 0;

  const clearPeekTimer = useCallback(() => {
    if (peekTimerRef.current) {
      clearTimeout(peekTimerRef.current);
      peekTimerRef.current = null;
    }
  }, []);

  const dismissPeek = useCallback(() => {
    clearPeekTimer();
    setLivePeek(null);
  }, [clearPeekTimer]);

  const scheduleUnreadInvalidate = useCallback(() => {
    if (invalidateDebounceRef.current) {
      clearTimeout(invalidateDebounceRef.current);
    }
    invalidateDebounceRef.current = setTimeout(() => {
      invalidateDebounceRef.current = null;
      invalidateCaseChatUnread(queryClient);
    }, UNREAD_INVALIDATE_DEBOUNCE_MS);
  }, []);


  const goToInbox = useCallback(() => {
    dismissPeek();
    navigate(caseNotificationsHubPath(pathname));
  }, [dismissPeek, navigate, pathname]);

  openCaseIdRef.current =
    pathname.match(/^\/cases\/([^/]+)(?:\/chat)?\/?$/)?.[1] ??
    pathname.match(/^\/admin\/cases\/([^/]+)(?:\/chat)?\/?$/)?.[1] ??
    null;

  useEffect(() => {
    const activeRole = getCookie('x-active-role');
    if (!hasChatNotifySession(user?.id, activeRole)) return;
    if (isCaseChatPathname(pathname) || isCaseNotificationsHubPathname(pathname)) return;

    const socket = createCaseChatSocket();
    if (!socket) return;

    const dedup = (key: string) => {
      const r = recentKeys.current;
      if (r.includes(key)) return true;
      r.unshift(key);
      if (r.length > 40) r.pop();
      return false;
    };

    const onNotify = (payload: CaseChatNotifyPayload) => {
      if (payload.caseId === openCaseIdRef.current) return;
      const key = `${payload.caseId}:${payload.message.id}`;
      if (dedup(key)) return;

      scheduleUnreadInvalidate();

      const isAdminArea = window.location.pathname.startsWith('/admin');
      const target = isAdminArea
        ? path.adminCaseChat(payload.caseId)
        : path.caseChat(payload.caseId);

      void playCaseMessageChime();

      clearPeekTimer();
      setLivePeek({ key, payload, target });

      peekTimerRef.current = setTimeout(() => {
        setLivePeek(null);
        peekTimerRef.current = null;
      }, PEEK_MS);
    };

    socket.on(CHAT_NOTIFY, onNotify);

    return () => {
      socket.off(CHAT_NOTIFY, onNotify);
      socket.disconnect();
      clearPeekTimer();
      if (invalidateDebounceRef.current) {
        clearTimeout(invalidateDebounceRef.current);
        invalidateDebounceRef.current = null;
      }
    };
  }, [user?.id, pathname, clearPeekTimer, scheduleUnreadInvalidate]);

  const activeRole = getCookie('x-active-role');
  if (
    !env.apiOrigin ||
    !hasChatNotifySession(user?.id, activeRole) ||
    isCaseChatPathname(pathname) ||
    isCaseNotificationsHubPathname(pathname)
  ) {
    return null;
  }

  const badgeCount = totalUnread > 0 ? (totalUnread > 99 ? '99+' : String(totalUnread)) : null;

  return (
    <div
      ref={stackRef}
      className="pointer-events-none fixed z-[200] flex flex-col items-end gap-2"
      style={positionStyle}
      aria-live="polite"
    >
      {livePeek ? (
        <div className="pointer-events-auto w-full max-w-sm">
          <div
            key={livePeek.key}
            className="overflow-hidden rounded-xl border border-border bg-card/95 shadow-lg ring-1 ring-primary/15 backdrop-blur-sm animate-fade-in"
          >
            <div className="h-0.5 w-full bg-primary" />
            <div className="relative p-4 pt-3">
              <button
                type="button"
                onClick={dismissPeek}
                className="absolute right-2 top-2 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Dismiss"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="pr-8 text-xs font-semibold tracking-wide text-primary">
                <span className="uppercase">New message · </span>
                <CaseCodeText className="font-semibold text-primary">
                  {livePeek.payload.caseCode}
                </CaseCodeText>
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {peekSenderLabel(livePeek.payload.message.senderRole)}
              </p>
              <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {truncate(livePeek.payload.message.content, 100)}
              </p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="pointer-events-auto">
        <button
          type="button"
          {...inboxFabDragProps}
          onClick={(e) => {
            if (consumeClickIfDragged()) {
              e.preventDefault();
              return;
            }
            goToInbox();
          }}
          className={cn(
            'relative flex h-12 w-12 touch-none items-center justify-center rounded-full',
            'bg-primary text-primary-foreground shadow-md',
            'ring-2 ring-background ring-offset-2 ring-offset-background',
            'cursor-grab active:cursor-grabbing',
            'transition-transform hover:scale-105 hover:brightness-110 active:scale-95',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
          )}
          aria-label={`Case messages inbox${badgeCount ? `, ${totalUnread} unread` : ''}`}
        >
          <MessageCircle className="h-6 w-6" strokeWidth={2.25} />
          {badgeCount ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground shadow-sm">
              {badgeCount}
            </span>
          ) : null}
        </button>
      </div>
    </div>
  );
}
