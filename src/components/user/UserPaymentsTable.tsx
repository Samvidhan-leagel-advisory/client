import { PaginationControls } from '@/components/PaginationControls';
import { CasesTableSkeleton } from '@/components/skeletons/CasesTableSkeleton';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { AdminPaymentsStatusFilter } from '@/hooks/useAdminPayments';
import { PAGE_SIZE } from '@/lib/mock-data';
import type { AdminPaymentsSubscriptionRow } from '@/types';
import { Search } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

const MOBILE_SKELETON_KEYS = ['a', 'b', 'c'] as const;

const formatInDate = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString('en-IN') : '—';

/** Lifetime one-time → razorpayOrderId. Recurring → razorpaySubscriptionId. */
const paymentRef = (row: AdminPaymentsSubscriptionRow) => {
  if (row.razorpaySubscriptionId)
    return { id: row.razorpaySubscriptionId, kind: 'Subscription' as const };
  if (row.razorpayOrderId)
    return { id: row.razorpayOrderId, kind: 'Lifetime' as const };
  return { id: null, kind: null };
};

const typeBadgeClass = (kind: 'Subscription' | 'Lifetime') =>
  kind === 'Lifetime'
    ? 'bg-purple-50 text-purple-700'
    : 'bg-blue-50 text-blue-700';

const rowStatusClass = (status: string) => {
  const s = status.toLowerCase();
  if (s === 'active' || s === 'success' || s === 'captured') {
    return 'bg-green-50 text-green-700';
  }
  if (s === 'pending' || s === 'created' || s === 'paused') {
    return 'bg-amber-50 text-amber-700';
  }
  if (
    s === 'cancelled' ||
    s === 'canceled' ||
    s === 'failed' ||
    s === 'refunded'
  ) {
    return 'bg-red-50 text-red-700';
  }
  return 'bg-muted text-muted-foreground';
};

type UserPaymentsTableProps = {
  rows: AdminPaymentsSubscriptionRow[];
  isFetching: boolean;
  isError: boolean;
  totalPages: number;
  total: number;
  page: number;
  setPage: Dispatch<SetStateAction<number>>;
  search: string;
  statusFilter: AdminPaymentsStatusFilter;
  handleSearchChange: (value: string) => void;
  handleStatusChange: (value: string) => void;
  refetch: () => void;
  /** Omit on admin user detail (single known user). */
  hideUserColumn?: boolean;
  showTitle?: boolean;
  searchPlaceholder?: string;
};

export function UserPaymentsTable({
  rows,
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
  refetch,
  hideUserColumn = false,
  showTitle = true,
  searchPlaceholder = 'Search by name, email or phone…',
}: UserPaymentsTableProps) {
  return (
    <div className="min-w-0 space-y-4">
      {showTitle ? (
        <h2 className="text-xl font-bold">Payments ({total})</h2>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative min-w-0 max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
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
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {!isError && isFetching && rows.length === 0 && (
        <>
          <div className="space-y-3 md:hidden">
            {MOBILE_SKELETON_KEYS.map((k) => (
              <div
                key={k}
                className="space-y-2 rounded-xl border bg-card p-4 shadow-sm"
              >
                <Skeleton className="h-4 w-40" />
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

      {!isError && !isFetching && rows.length === 0 && (
        <div className="rounded-xl border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          No payments found.
        </div>
      )}

      {!isError && rows.length > 0 && (
        <>
          <ul className="space-y-3 md:hidden">
            {rows.map((row) => {
              const plan = row.subscriptionPlan;
              const raw = (row.status ?? '').toLowerCase();
              const amountInr = Number(plan?.priceInr);
              const amount = Number.isFinite(amountInr) ? amountInr : 0;
              const ref = paymentRef(row);
              return (
                <li
                  key={row.id}
                  className="min-w-0 rounded-xl border bg-card p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="break-all font-mono text-xs text-muted-foreground">
                      {ref.id ?? '—'}
                    </span>
                    {ref.kind && (
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${typeBadgeClass(ref.kind)}`}
                      >
                        {ref.kind}
                      </span>
                    )}
                  </div>
                  {!hideUserColumn && row.user?.fullName?.trim() ? (
                    <div className="mt-1 font-medium">
                      {row.user.fullName.trim()}
                    </div>
                  ) : null}
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                    <span className="font-medium text-foreground">
                      {plan?.name ?? '—'}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${rowStatusClass(raw)}`}
                    >
                      {row.status ?? '—'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    ₹{amount.toLocaleString('en-IN')}
                    {plan?.billingCycle
                      ? ` · ${String(plan.billingCycle).replace(/_/g, ' ')}`
                      : ''}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Ends {formatInDate(row.currentPeriodEnd)} · Created{' '}
                    {formatInDate(row.createdAt)}
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-x-auto rounded-xl border bg-card md:block">
            <table className="w-full min-w-0 text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Payment Ref
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Type
                  </th>
                  {!hideUserColumn ? (
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      User
                    </th>
                  ) : null}
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Plan
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                    Billing
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Amount (INR)
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                    Period end
                  </th>
                  <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const plan = row.subscriptionPlan;
                  const raw = (row.status ?? '').toLowerCase();
                  const amountInr = Number(plan?.priceInr);
                  const ref = paymentRef(row);
                  return (
                    <tr
                      key={row.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="break-all px-4 py-3 font-mono text-xs">
                        {ref.id ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        {ref.kind ? (
                          <span
                            className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${typeBadgeClass(ref.kind)}`}
                          >
                            {ref.kind}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      {!hideUserColumn ? (
                        <td className="px-4 py-3">
                          {row.user?.fullName?.trim() || '—'}
                        </td>
                      ) : null}
                      <td className="px-4 py-3 text-muted-foreground">
                        {plan?.name ?? '—'}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                        {plan?.billingCycle
                          ? String(plan.billingCycle).replace(/_/g, ' ')
                          : '—'}
                      </td>
                      <td className="px-4 py-3 font-medium">
                        ₹
                        {(Number.isFinite(amountInr)
                          ? amountInr
                          : 0
                        ).toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${rowStatusClass(raw)}`}
                        >
                          {row.status ?? '—'}
                        </span>
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                        {formatInDate(row.currentPeriodEnd)}
                      </td>
                      <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                        {formatInDate(row.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      <PaginationControls
        page={page}
        totalPages={totalPages}
        total={total}
        pageSize={PAGE_SIZE}
        onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
        onPrev={() => setPage((p) => Math.max(p - 1, 1))}
        onPageChange={setPage}
      />
    </div>
  );
}
