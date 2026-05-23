import { getAdminCaseMessages, getCaseMessages } from '@/api-client';
import type {
  CaseMessage,
  CaseMessagesPage,
  CaseChatVariant,
} from '@/types';
import { useInfiniteQuery, type QueryKey } from '@tanstack/react-query';
import { useMemo } from 'react';

const PAGE_SIZE = 30;

export function caseMessagesQueryKey(
  caseId: string | undefined,
  variant: CaseChatVariant
): QueryKey {
  return variant === 'admin'
    ? (['admin-case-messages', caseId] as const)
    : (['case-messages', caseId] as const);
}

export function flattenCaseMessagePages(
  data: { pages: CaseMessagesPage[] } | undefined
): CaseMessage[] {
  if (!data?.pages?.length) return [];
  // pages[0] = newest window (ascending), pages[1+] = older windows — concatenate oldest → newest
  return [...data.pages].reverse().reduce<CaseMessage[]>(
    (acc, p) => [...acc, ...p.messages],
    []
  );
}

export function useCaseMessages(
  caseId: string | undefined,
  variant: CaseChatVariant
) {
  const query = useInfiniteQuery({
    queryKey: caseMessagesQueryKey(caseId, variant),
    enabled: Boolean(caseId),
    /** Case chat must not use the app-wide 60s staleTime — opens from notify were showing old pages. */
    staleTime: 0,
    initialPageParam: undefined as string | undefined,
    queryFn: async ({ pageParam }) => {
      const params = {
        limit: PAGE_SIZE,
        ...(pageParam ? { beforeMessageId: pageParam } : {}),
      };
      const res =
        variant === 'admin'
          ? await getAdminCaseMessages(caseId, { params })
          : await getCaseMessages(caseId, { params });
      return res.data as CaseMessagesPage;
    },
    getNextPageParam: (lastPage) =>
      lastPage.hasMore && lastPage.oldestMessageId
        ? lastPage.oldestMessageId
        : undefined,
  });

  const messages = useMemo(
    () => flattenCaseMessagePages(query.data),
    [query.data]
  );

  return {
    ...query,
    messages,
    pageSize: PAGE_SIZE,
  };
}
