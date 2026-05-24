import WithShimmer from '@/components/WithShimmer';
import type { ActiveSubscriptionView } from '@/types';
import { AlertCircle, CreditCard } from 'lucide-react';
import type { ReactNode } from 'react';

type ActiveSubscriptionCardProps = {
  subscription: ActiveSubscriptionView | null | undefined;
  /** True while the source list is still loading and we have nothing to show yet. */
  isLoading?: boolean;
  /** Optional CTA rendered in the card header (e.g. "Manage subscription"). */
  action?: ReactNode;
};

export function ActiveSubscriptionCard({
  subscription,
  isLoading = false,
  action,
}: ActiveSubscriptionCardProps) {
  return (
    <div className="rounded-xl border bg-card p-4 sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Active Subscription
          </h2>
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
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
  subscription: ActiveSubscriptionView;
}) {
  const { isLifetime, cancelledAtPeriodEnd, plan, refId } = subscription;
  const price = plan.priceInr ? Number(plan.priceInr) : null;
  const endDateLabel = subscription.endDate
    ? new Date(subscription.endDate).toLocaleDateString('en-IN')
    : '—';

  const statusBadgeClass = cancelledAtPeriodEnd
    ? 'bg-amber-50 text-amber-700'
    : 'bg-green-50 text-green-700';
  const statusLabel = cancelledAtPeriodEnd ? 'Cancelling' : subscription.status;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold">{plan.name || '—'}</span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${isLifetime ? 'bg-purple-50 text-purple-700' : 'bg-blue-50 text-blue-700'}`}
        >
          {isLifetime ? 'Lifetime' : 'Subscription'}
        </span>
        <span
          className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusBadgeClass}`}
        >
          {statusLabel}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        {price !== null && (
          <span>
            ₹{price.toLocaleString('en-IN')}
            {plan.billingCycle
              ? ` · ${String(plan.billingCycle).replace(/_/g, ' ')}`
              : ''}
          </span>
        )}
        <span>
          {isLifetime
            ? 'No expiry'
            : cancelledAtPeriodEnd
              ? `Ends ${endDateLabel}`
              : `Renews ${endDateLabel}`}
        </span>
      </div>
      {cancelledAtPeriodEnd && (
        <div className="mt-1 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            Subscription cancelled. Access continues until the period ends.
          </span>
        </div>
      )}
      {refId && (
        <div className="break-all pt-1 font-mono text-xs text-muted-foreground/70">
          {refId}
        </div>
      )}
    </div>
  );
}

export default ActiveSubscriptionCard;
