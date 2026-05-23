import { PaginationControls } from '@/components/PaginationControls';
import { CasesTableSkeleton } from '@/components/skeletons/CasesTableSkeleton';
import { CaseCodeLink } from '@/components/CaseCodeText';
import { PracticeAreaBadge, StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { path } from '@/constants';
import { CASE_STATUS_FILTERS } from '@/lib/mock-data';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOBILE_SKELETON_KEYS = ['a', 'b', 'c'] as const;

export const LawyerCasesTable = ({
  cases,
  isFetching,
  isError,
  totalPages,
  total,
  page,
  setPage,
  search,
  statusFilter,
  handleSearchChange,
  handleStatusChange,
  isAdmin = false,
}) => {
  const caseHref = (id: string) =>
    isAdmin ? path.adminCase(id) : path.caseDetail(id);

  return (
    <div className="min-w-0 space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Cases</h1>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative max-w-sm min-w-0 flex-1">
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
            {CASE_STATUS_FILTERS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-8 text-center text-sm text-destructive">
          Failed to load cases.
        </div>
      )}

      {!isError && isFetching && cases.length === 0 && (
        <>
          <div className="space-y-3 md:hidden">
            {MOBILE_SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="space-y-2 rounded-xl border bg-card p-4 shadow-sm"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full max-w-md" />
                <Skeleton className="h-6 w-28 rounded-full" />
              </div>
            ))}
          </div>
          <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
            <table className="w-full text-sm">
              <tbody>
                <CasesTableSkeleton />
              </tbody>
            </table>
          </div>
        </>
      )}

      {!isError && !isFetching && cases.length === 0 && (
        <div className="rounded-xl border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          No cases found.
        </div>
      )}

      {!isError && cases.length > 0 && (
        <>
          <ul className="space-y-3 md:hidden">
            {cases.map((c) => (
              <li
                key={c.id}
                className="rounded-xl border bg-card p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-2 gap-y-2">
                  <CaseCodeLink
                    to={caseHref(c.id)}
                    className="text-xs font-medium"
                  >
                    {c.caseCode}
                  </CaseCodeLink>
                  <StatusBadge status={c.status} />
                </div>
                <Link
                  to={caseHref(c.id)}
                  className="mt-2 block break-words font-medium text-foreground hover:text-gold hover:underline"
                >
                  {c.title}
                </Link>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {c.user?.fullName ? (
                    <span className="min-w-0 break-words">
                      {c.user.fullName}
                    </span>
                  ) : null}
                  {c.practiceArea?.name ? (
                    <span className="min-w-0 break-words">
                      {c.practiceArea.name}
                    </span>
                  ) : null}
                  <span className="whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                <div className="mt-2 text-xs">
                  <span
                    className={
                      c.isEmergency
                        ? 'font-semibold text-red-600'
                        : 'text-green-600'
                    }
                  >
                    {c.isEmergency ? 'Emergency' : 'Normal'}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
            <table className="w-full min-w-0 text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Case #
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Title
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                    Client
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
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
                {cases.map((c) => (
                    <tr
                      key={c.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <CaseCodeLink
                          to={caseHref(c.id)}
                          className="text-xs"
                        >
                          {c.caseCode}
                        </CaseCodeLink>
                      </td>
                      <td className="max-w-[200px] min-w-0 truncate px-4 py-3 font-medium">
                        <Link
                          to={caseHref(c.id)}
                          className="hover:text-gold hover:underline"
                        >
                          {c.title}
                        </Link>
                      </td>
                      <td className="hidden px-4 py-3 sm:table-cell">
                        {c.user?.fullName || '—'}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        <PracticeAreaBadge
                          practiceArea={c.practiceArea?.name as string}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="hidden px-4 py-3 lg:table-cell">
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
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                        {new Date(c.createdAt).toLocaleDateString('en-IN')}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        total={total}
        onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
        onPrev={() => setPage((p) => Math.max(p - 1, 1))}
        onPageChange={setPage}
      />
    </div>
  );
};
