import { getAdminCases } from '@/api-client';
import { PaginationControls } from '@/components/PaginationControls';
import { CaseCodeLink } from '@/components/CaseCodeText';
import { PracticeAreaBadge, StatusBadge } from '@/components/StatusBadge';
import { CasesTableSkeleton } from '@/components/skeletons/CasesTableSkeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { path } from '@/constants';
import { useDebounce } from '@/hooks/useDebounce';
import { AdminLayout } from '@/layouts/AdminLayout';
import { CASE_STATUS_FILTERS, PAGE_SIZE } from '@/lib/mock-data';
import { CasesResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const buildQueryParams = (
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

const AdminCases = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 500);

  const { data, isFetching, isError } = useQuery<CasesResponse>({
    queryKey: ['admin-cases', page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = buildQueryParams(page, debouncedSearch, statusFilter);
      const response = await getAdminCases(params);
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
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Case Management</h1>
          <p className="mt-1 text-muted-foreground">
            View and manage all cases on the platform.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search cases..."
              className="pl-9"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CASE_STATUS_FILTERS.filter((s) => s.value !== 'new').map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground">
                  Case #
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Title
                </th>
                <th className="hidden whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Client
                </th>
                <th className="hidden whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Lawyer
                </th>
                <th className="hidden whitespace-nowrap px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Status
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  Priority
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {isFetching && <CasesTableSkeleton />}
              {isError && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-destructive"
                  >
                    Failed to load cases.
                  </td>
                </tr>
              )}
              {!isFetching && !isError && cases.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    No cases found.
                  </td>
                </tr>
              )}
              {!isFetching &&
                !isError &&
                cases.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3">
                      <CaseCodeLink
                        to={path.adminCase(c.id)}
                        className="text-xs"
                      >
                        {c.caseCode}
                      </CaseCodeLink>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 font-medium">
                      <Link
                        to={path.adminCase(c.id)}
                        className="hover:text-gold hover:underline"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 sm:table-cell">
                      <Link to={path.adminUser(c.user?.id)} className="hover:text-gold hover:underline">
                        {c.user?.fullName || '—'}
                      </Link>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 sm:table-cell">
                      <Link to={path.adminLawyer(c.assignedLawyer?.id)} className="hover:text-gold hover:underline">
                      {c.assignedLawyer?.user?.fullName || '—'}
                      </Link>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-muted-foreground md:table-cell">
                      <PracticeAreaBadge
                        practiceArea={c.practiceArea?.name as string}
                      />
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 lg:table-cell">
                      <span
                        className={
                          c.isEmergency
                            ? 'font-semibold text-red-600'
                            : 'text-green-600'
                        }
                      >
                        {c.isEmergency ? 'Emergency' : 'Normal'}
                      </span>
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                      {new Date(c.createdAt).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <PaginationControls
          page={page}
          totalPages={totalPages}
          total={total}
          onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onPageChange={setPage}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminCases;
