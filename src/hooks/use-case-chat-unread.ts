import { getAdminCaseChatUnread, getCaseChatUnread } from '@/api-client';
import { env } from '@/config/env';
import { isCaseChatPathname } from '@/constants';
import { getCookie } from '@/lib/helpers';
import type { CaseChatUnreadSummary } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

const APP_ROLES = new Set(['admin', 'lawyer', 'user']);

/** Invalidate with `queryClient.invalidateQueries({ queryKey: caseChatUnreadQueryKey })`. */
export const caseChatUnreadQueryKey = ['case-chat-unread'] as const;

function canFetchUnread(userId: string | undefined, activeRole: string | undefined) {
  if (!env.apiBaseUrl) return false;
  if (userId) return true;
  return Boolean(activeRole && APP_ROLES.has(activeRole));
}

export function useCaseChatUnreadSummary(userId: string | undefined) {
  const { pathname } = useLocation();
  const isAdminArea = pathname.startsWith('/admin');
  const activeRole = getCookie('x-active-role');

  return useQuery({
    queryKey: [...caseChatUnreadQueryKey, isAdminArea ? 'admin' : 'app'],
    queryFn: async () => {
      const res = isAdminArea
        ? await getAdminCaseChatUnread()
        : await getCaseChatUnread();
      return res.data as CaseChatUnreadSummary;
    },
    enabled:
      canFetchUnread(userId, activeRole) && !isCaseChatPathname(pathname),
    /** Socket + mark-read invalidate this query; avoid refetching on every tab focus. */
    staleTime: 90_000,
    refetchOnWindowFocus: false,
  });
}
