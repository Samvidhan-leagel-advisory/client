import { getAdminPayments } from '@/api-client';
import type {
  AdminPaymentsListResponse,
  AdminPaymentsSubscriptionRow,
} from '@/types';
import { useQuery } from '@tanstack/react-query';

const EFFECTIVE_ACTIVE_STATUSES = new Set(['active', 'authenticated']);

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
    if (s === 'cancelled' || s === 'canceled') {
      if (!r.currentPeriodEnd) return false;
      return new Date(r.currentPeriodEnd).getTime() > now;
    }
    return false;
  });
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

  const subscription = pickEffectiveActive(query.data?.data ?? []);
  const isCancelledAtPeriodEnd =
    !!subscription &&
    ['cancelled', 'canceled'].includes(
      (subscription.status ?? '').toLowerCase()
    );

  return {
    subscription,
    isCancelledAtPeriodEnd,
    isLoading: query.isLoading,
    isError: query.isError,
  };
}
