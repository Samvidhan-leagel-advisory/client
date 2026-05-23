import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { formatDateEnIn } from '@/pages/user/userSubscription.helpers';
import type { MyRazorpaySubscriptionsResponse } from '@/types';
import { CalendarDays, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import WithShimmer from '@/components/WithShimmer';

type Props = {
  loading: boolean;
  active: MyRazorpaySubscriptionsResponse['subscription'];
  isCancelling: boolean;
  onCancel: () => void;
};

export default function ActivePlanCard({ loading, active, isCancelling, onCancel }: Props) {
  if (loading) {
    return (
      <div className="rounded-2xl border bg-card p-6 space-y-3">
        <WithShimmer loading className="h-4 w-20" />
        <WithShimmer loading className="h-7 w-40" />
        <WithShimmer loading className="h-4 w-32" />
      </div>
    );
  }

  if (!active) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <p className="text-sm font-medium text-muted-foreground">No active subscription</p>
        <p className="mt-1 text-sm text-muted-foreground">Pick a plan below to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-gold bg-card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          {active.cancelledAtPeriodEnd ? (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Cancels {formatDateEnIn(active.endDate)}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold uppercase tracking-wide text-gold">
                Active
              </span>
            </div>
          )}
          <h2 className="text-2xl font-bold">{active.plan.name}</h2>
          <p className="text-sm capitalize text-muted-foreground">
            {active.isLifetime ? 'Lifetime membership' : `Billed ${active.plan.billingCycle}`}
          </p>
          {!active.isLifetime && !active.cancelledAtPeriodEnd && (
            <div className="flex items-center gap-1.5 pt-1 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span>Renews {formatDateEnIn(active.endDate)}</span>
            </div>
          )}
          {!active.isLifetime && active.cancelledAtPeriodEnd && (
            <p className="pt-1 text-sm text-muted-foreground">
              You have full access until {formatDateEnIn(active.endDate)}.
            </p>
          )}
        </div>

        {!active.isLifetime && !active.cancelledAtPeriodEnd && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={isCancelling}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/5"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Cancelling…
                  </>
                ) : (
                  'Cancel subscription'
                )}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Cancel your subscription?</AlertDialogTitle>
                <AlertDialogDescription>
                  You'll keep access to <strong>{active.plan.name}</strong> until{' '}
                  <strong>{formatDateEnIn(active.endDate)}</strong>. After that it won't
                  renew.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep subscription</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={onCancel}
                >
                  Yes, cancel
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
