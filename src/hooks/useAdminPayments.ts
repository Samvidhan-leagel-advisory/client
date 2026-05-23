import { getAdminPayments } from '@/api-client';
import { useDebounce } from '@/hooks/useDebounce';
import { PAGE_SIZE } from '@/lib/mock-data';
import type { AdminPaymentsListResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

export type AdminPaymentsStatusFilter = 'all' | 'active' | 'inactive';

const buildQueryParams = (
  page: number,
  search: string,
  status: AdminPaymentsStatusFilter,
  userId?: string
) => {
  const params: Record<string, string | number> = {
    page,
    limit: PAGE_SIZE,
    orderBy: 'createdAt',
    order: 'DESC',
  };
  if (search.trim()) params.search = search.trim();
  if (status !== 'all') params.status = status;
  if (userId) params.userId = userId;
  return params;
};

type UseAdminPaymentsOptions = {
  userId?: string;
  /** When false, the query does not run (e.g. missing route param). */
  enabled?: boolean;
};

export function useAdminPayments(options: UseAdminPaymentsOptions = {}) {
  const { userId, enabled = true } = options;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] =
    useState<AdminPaymentsStatusFilter>('all');
  const debouncedSearch = useDebounce(search, 500);

  const query = useQuery<AdminPaymentsListResponse>({
    queryKey: [
      'admin',
      'payments',
      userId ?? '_all',
      page,
      debouncedSearch,
      statusFilter,
    ],
    queryFn: async () => {
      const params = buildQueryParams(
        page,
        debouncedSearch,
        statusFilter,
        userId
      );
      const { data } = await getAdminPayments(params);
      return data as AdminPaymentsListResponse;
    },
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const list = query.data?.data ?? [];
  const pagination = query.data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value as AdminPaymentsStatusFilter);
    setPage(1);
  }, []);

  return {
    page,
    setPage,
    search,
    statusFilter,
    handleSearchChange,
    handleStatusChange,
    rows: list,
    totalPages,
    total,
    isFetching: query.isFetching,
    isError: query.isError,
    refetch: query.refetch,
  };
}
