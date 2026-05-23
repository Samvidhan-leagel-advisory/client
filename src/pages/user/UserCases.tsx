import { getCases } from '@/api-client';
import { UserCasesTable } from '@/components/user/UserCasesTable';
import { useDebounce } from '@/hooks/useDebounce';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { PAGE_SIZE } from '@/lib/mock-data';
import type { CasesResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export const buildUserCasesQueryParams = (
  page: number,
  search: string,
  statusFilter: string
) => {
  const params: Record<string, string | number> = {
    page,
    limit: PAGE_SIZE,
    orderBy: 'createdAt',
    order: 'DESC',
  };
  if (search.trim()) params.search = search.trim();
  if (statusFilter !== 'all') params.status = statusFilter;
  return params;
};

const UserCases = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 500);

  const { data, isFetching, isError } = useQuery<CasesResponse>({
    queryKey: ['user-cases', page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = buildUserCasesQueryParams(
        page,
        debouncedSearch,
        statusFilter
      );
      const response = await getCases(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const cases = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    if (page !== 1) setPage(1);
  };

  return (
    <DashboardLayout>
      <UserCasesTable
        cases={cases}
        isFetching={isFetching}
        isError={isError}
        totalPages={totalPages}
        total={total}
        page={page}
        setPage={setPage}
        search={search}
        statusFilter={statusFilter}
        handleSearchChange={handleSearchChange}
        handleStatusChange={handleStatusChange}
      />
    </DashboardLayout>
  );
};

export default UserCases;
