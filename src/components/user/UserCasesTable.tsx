import { CaseCodeLink } from '@/components/CaseCodeText';
import { PaginationControls } from '@/components/PaginationControls';
import { CasesTableSkeleton } from '@/components/skeletons/CasesTableSkeleton';
import { PracticeAreaBadge, StatusBadge } from '@/components/StatusBadge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { path } from '@/constants';
import { CASE_STATUS_FILTERS } from '@/lib/mock-data';
import { Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const MOBILE_SKELETON_KEYS = ['a', 'b', 'c'] as const;

export const UserCasesTable = ({
  cases,
  isFetching,
  isError,
  totalPages,
  total,
  page,
  setPage,
  search = '',
  statusFilter,
  handleSearchChange,
  handleStatusChange,
  isAdmin = false,
}) => {
  const caseHref = (id: string) =>
    isAdmin ? path.adminCase(id) : path.caseDetail(id);

  return (
    <div className="min-w-0 space-y-4">
      <h2 className="text-xl font-bold">Cases ({total})</h2>

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 max-w-sm flex-1">
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
            <table className="w-full min-w-0 text-sm">
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
                className="min-w-0 rounded-xl border bg-card p-4 shadow-sm"
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
                  title={c.title}
                  className="mt-2 block min-w-0 font-medium text-foreground hover:text-gold hover:underline"
                >
                  <span className="line-clamp-6 min-w-0 break-words">
                    {c.title}
                  </span>
                </Link>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
                  {c.practiceArea?.name ? (
                    <PracticeAreaBadge
                      practiceArea={c.practiceArea.name as string}
                    />
                  ) : null}
                  <span className="whitespace-nowrap">
                    {new Date(c.createdAt).toLocaleDateString('en-IN')}
                  </span>
                </div>
                {isAdmin && c.assignedLawyer?.user?.fullName ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Lawyer:{' '}
                    <span className="break-words text-foreground">
                      {c.assignedLawyer.user.fullName}
                    </span>
                  </p>
                ) : null}
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

                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Category
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                    Lawyer
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
                      <CaseCodeLink to={caseHref(c.id)} className="text-xs">
                        {c.caseCode}
                      </CaseCodeLink>
                    </td>
                    <td className="min-w-0 max-w-[200px] truncate px-4 py-3 font-medium">
                      <Link
                        to={caseHref(c.id)}
                        className="hover:text-gold hover:underline"
                      >
                        {c.title}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-muted-foreground md:whitespace-nowrap">
                      <PracticeAreaBadge
                        practiceArea={c.practiceArea?.name as string}
                      />
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {c.assignedLawyer?.user?.fullName || '—'}
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
