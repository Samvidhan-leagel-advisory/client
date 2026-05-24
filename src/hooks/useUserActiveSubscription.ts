import { getAdminPayments } from '@/api-client';
import type {
  ActiveSubscriptionView,
  AdminPaymentsListResponse,
  AdminPaymentsSubscriptionRow,
} from '@/types';
import { useQuery } from '@tanstack/react-query';

const EFFECTIVE_ACTIVE_STATUSES = new Set(['active', 'authenticated']);
const CANCELLED_STATUSES = new Set(['cancelled', 'canceled']);

/**
 * "Effectively active" = currently entitled to plan benefits.
 * Includes Razorpay's cancel-at-cycle-end case: status=`cancelled` but
 * `currentPeriodEnd` is still in the future.
 */
const pickEffectiveActive = (
  rows: AdminPaymentsSubscriptionRow[]
): AdminPaymentsSubscriptionRow | undefined => {
  const now = Date.now();
  return rows.find((r) => {
    const s = (r.status ?? '').toLowerCase();
    if (EFFECTIVE_ACTIVE_STATUSES.has(s)) return true;
    if (CANCELLED_STATUSES.has(s)) {
      if (!r.currentPeriodEnd) return false;
      return new Date(r.currentPeriodEnd).getTime() > now;
    }
    return false;
  });
};

const toView = (
  row: AdminPaymentsSubscriptionRow | undefined
): ActiveSubscriptionView | undefined => {
  if (!row) return undefined;
  const isLifetime = !row.razorpaySubscriptionId && Boolean(row.razorpayOrderId);
  return {
    id: row.id,
    status: row.status,
    isLifetime,
    cancelledAtPeriodEnd: CANCELLED_STATUSES.has(
      (row.status ?? '').toLowerCase()
    ),
    startDate: row.currentPeriodStart ?? null,
    endDate: row.currentPeriodEnd ?? null,
    plan: row.subscriptionPlan
      ? {
          id: row.subscriptionPlan.id,
          name: row.subscriptionPlan.name,
          billingCycle: row.subscriptionPlan.billingCycle ?? null,
          priceInr: row.subscriptionPlan.priceInr,
        }
      : { name: '—', billingCycle: null },
    refId: row.razorpaySubscriptionId ?? row.razorpayOrderId ?? null,
  };
};

/** Single effectively-active subscription/order for a user (admin views). */
export function useUserActiveSubscription(userId: string | undefined) {
  const query = useQuery<AdminPaymentsListResponse>({
    queryKey: ['admin', 'user-active-subscription', userId],
    queryFn: async () => {
      const { data } = await getAdminPayments({
        userId,
        limit: 5,
        page: 1,
        orderBy: 'createdAt',
        order: 'DESC',
      });
      return data as AdminPaymentsListResponse;
    },
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
  });

  const subscription = toView(pickEffectiveActive(query.data?.data ?? []));

  return {
    subscription,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
