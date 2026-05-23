import WithShimmer from '@/components/WithShimmer';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  formatInr,
  parseFeatureCsv,
} from '@/pages/user/userSubscription.helpers';
import type { SubscriptionCatalogPlan } from '@/types';
import { CheckCircle2, Loader2 } from 'lucide-react';

export type PlanGridProps =
  | {
      variant?: 'subscribe';
      plans: SubscriptionCatalogPlan[];
      loading: boolean;
      error: boolean;
      activePlanId?: string;
      hasActiveSub?: boolean;
      busyPlanId: string | null;
      isPending: boolean;
      onSubscribe: (planId: string) => void;
    }
  | {
      variant: 'admin';
      plans: SubscriptionCatalogPlan[];
      loading: boolean;
      error: boolean;
      busyPlanId: string | null;
      isPending: boolean;
      onEdit: (planId: string) => void;
    };

export default function PlanGrid(props: PlanGridProps) {
  const isAdmin = props.variant === 'admin';
  const { plans, loading, error, busyPlanId, isPending } = props;

  const activePlanId = !isAdmin ? props.activePlanId : undefined;
  const hasActiveSub = !isAdmin ? props.hasActiveSub : undefined;
  const onSubscribe = !isAdmin ? props.onSubscribe : undefined;
  const onEdit = isAdmin ? props.onEdit : undefined;

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {[0, 1].map((i) => (
          <div key={i} className="space-y-3 rounded-2xl border bg-card p-5">
            <WithShimmer loading className="h-5 w-3/4" />
            <WithShimmer loading className="h-7 w-24" />
            <WithShimmer loading className="h-4 w-full" />
            <WithShimmer loading className="h-4 w-5/6" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <p className="text-sm text-destructive">
        Could not load plans. Check your connection or try again in a moment.
      </p>
    );
  }

  const gridCols = plans.length === 1 ? 'mx-auto max-w-sm' : 'sm:grid-cols-2';
  return (
    <div className={cn('grid items-stretch gap-5', gridCols)}>
      {plans.map((plan) => {
        const isCurrent = !isAdmin && activePlanId === plan.id;
        const isThisBusy = busyPlanId === plan.id;
        const yearly = plan.billingCycle === 'yearly';
        const feats = parseFeatureCsv(plan.features);
        const showButton = isAdmin || !hasActiveSub || isCurrent;

        return (
          <div
            key={plan.id}
            className={cn(
              'relative flex h-full flex-col rounded-2xl border bg-card p-5 transition-shadow',
              !isAdmin &&
                yearly &&
                !isCurrent &&
                'border-gold shadow-sm ring-1 ring-gold/20',
              !isAdmin && isCurrent && 'border-gold/60 bg-gold/5',
              isAdmin &&
                yearly &&
                'border-gold/40 shadow-sm ring-1 ring-gold/15'
            )}
          >
            {!isAdmin && yearly && !isCurrent && (
              <span className="absolute -top-3 left-4 rounded-full bg-gold px-3 py-0.5 text-xs font-semibold text-accent-foreground">
                Best value
              </span>
            )}
            {!isAdmin && isCurrent && (
              <span className="absolute -top-3 left-4 z-20 inline-flex items-center gap-1 rounded-full border border-gold/40 bg-white px-3 py-0.5 text-xs font-semibold text-gold">
                <CheckCircle2 className="h-3 w-3" /> Your plan
              </span>
            )}

            <div className="space-y-1">
              <h3 className="text-base font-semibold leading-tight">
                {plan.name}
              </h3>
              {plan.description && (
                <p className="text-xs leading-snug text-muted-foreground">
                  {plan.description}
                </p>
              )}
            </div>

            <p className="mt-4 text-2xl font-bold leading-none">
              {formatInr(plan.priceInr)}
              <span className="ml-0.5 text-sm font-normal text-muted-foreground">
                /{plan.billingCycle}
              </span>
            </p>

            {feats.length > 0 && (
              <ul className="mt-5 flex-1 space-y-2">
                {feats.map((f) => (
                  <li
                    key={f}
                    className="flex items-start gap-2 text-sm leading-snug text-muted-foreground"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span className="min-w-0">{f}</span>
                  </li>
                ))}
              </ul>
            )}

            {showButton &&
              (isAdmin ? null : (
                <Button
                  variant={
                    isCurrent ? 'outline' : yearly ? 'default' : 'outline'
                  }
                  size="sm"
                  className={cn(
                    'mt-6 w-full',
                    yearly &&
                      !isCurrent &&
                      'bg-gold text-accent-foreground hover:bg-gold/90',
                    isCurrent &&
                      'cursor-default border-gold/40 text-gold hover:bg-transparent'
                  )}
                  disabled={isCurrent || isThisBusy}
                  onClick={() => !isCurrent && onSubscribe?.(plan.id)}
                >
                  {isThisBusy && isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                      Starting…
                    </>
                  ) : isThisBusy ? (
                    'Complete payment in the window…'
                  ) : isCurrent ? (
                    'Current plan'
                  ) : (
                    'Subscribe'
                  )}
                </Button>
              ))}
          </div>
        );
      })}
    </div>
  );
}
