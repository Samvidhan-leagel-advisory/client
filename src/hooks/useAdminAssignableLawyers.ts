import { getAdminLawyerVerifications } from '@/api-client';
import { useDebounce } from '@/hooks/useDebounce';
import { PAGE_SIZE } from '@/lib/mock-data';
import type { LawyersListResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

/** Slightly larger page for assign dropdown; still paginated. */
const ASSIGN_LAWYERS_LIMIT = Math.max(PAGE_SIZE, 15);

export function buildAssignableLawyersParams(page: number, search: string) {
  const params: Record<string, string | number | boolean> = {
    page,
    limit: ASSIGN_LAWYERS_LIMIT,
    orderBy: 'createdAt',
    order: 'DESC',
    approved: true,
  };
  if (search.trim()) {
    params.search = search.trim();
  }
  return params;
}

export function useAdminAssignableLawyers(enabled = true) {
  const [search, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  const query = useQuery<LawyersListResponse>({
    queryKey: ['admin-lawyers-assign', page, debouncedSearch],
    queryFn: async () => {
      const response = await getAdminLawyerVerifications(
        buildAssignableLawyersParams(page, debouncedSearch)
      );
      return response.data;
    },
    enabled,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const setSearch = (value: string) => {
    setSearchInput(value);
    setPage(1);
  };

  return {
    lawyers: query.data?.data ?? [],
    pagination: query.data?.pagination,
    totalPages: query.data?.pagination?.totalPages ?? 1,
    isFetching: query.isFetching,
    isLoading: query.isLoading,
    search,
    setSearch,
    page,
    setPage,
    debouncedSearch,
  };
}
