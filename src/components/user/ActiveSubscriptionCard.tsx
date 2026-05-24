import WithShimmer from '@/components/WithShimmer';
import type { AdminPaymentsSubscriptionRow } from '@/types';
import { CreditCard } from 'lucide-react';

type ActiveSubscriptionCardProps = {
  subscription: AdminPaymentsSubscriptionRow | undefined;
  /** True while the source list is still loading and we have nothing to show yet. */
  isLoading?: boolean;
};

export function ActiveSubscriptionCard({
  subscription,
  isLoading = false,
}: ActiveSubscriptionCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Active Subscription
        </h2>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <WithShimmer loading className="h-5 w-48" />
          <WithShimmer loading className="h-4 w-64" />
        </div>
      ) : subscription ? (
        <ActiveSubscriptionBody subscription={subscription} />
      ) : (
        <p className="text-sm text-muted-foreground">No active subscription.</p>
      )}
    </div>
  );
}

function ActiveSubscriptionBody({
  subscription,
}: {
  subscription: AdminPaymentsSubscriptionRow;
}) {
  const isLifetime =
    !subscription.razorpaySubscriptionId &&
    Boolean(subscription.razorpayOrderId);
  const refId =
    subscription.razorpaySubscriptionId ??
    subscription.razorpayOrderId ??
    '—';
  const price = subscription.subscriptionPlan?.priceInr
    ? Number(subscription.subscriptionPlan.priceInr)
    : null;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold">
          {subscription.subscriptionPlan?.name ?? '—'}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${isLifetime ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}
        >
          {isLifetime ? 'Lifetime' : 'Subscription'}
        </span>
        <span className="inline-flex rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium capitalize text-green-700">
          {subscription.status}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {price !== null && (
          <span>
            ₹{price.toLocaleString('en-IN')}
            {subscription.subscriptionPlan?.billingCycle
              ? ` · ${String(subscription.subscriptionPlan.billingCycle).replace(/_/g, ' ')}`
              : ''}
          </span>
        )}
        <span>
          {isLifetime
            ? 'No expiry'
            : `Renews ${subscription.currentPeriodEnd ? new Date(subscription.currentPeriodEnd).toLocaleDateString('en-IN') : '—'}`}
        </span>
      </div>
      <div className="break-all font-mono text-xs text-muted-foreground">
        {refId}
      </div>
    </div>
  );
}

export default ActiveSubscriptionCard;
