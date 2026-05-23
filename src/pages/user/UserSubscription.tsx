import ActivePlanCard from '@/components/subscription/ActivePlanCard';
import PlanGrid from '@/components/subscription/PlanGrid';
import { useSubscription } from '@/hooks/useSubscription';
import { DashboardLayout } from '@/layouts/DashboardLayout';

export default function UserSubscription() {
  const {
    active,
    plans,
    isLoadingMe,
    isLoadingPlans,
    isErrorPlans,
    startingPlanId,
    isPending,
    isCancelling,
    subscribe,
    cancelSubscription,
  } = useSubscription();

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-8">
        <h1 className="text-2xl font-bold">Subscription</h1>

        <ActivePlanCard
          loading={isLoadingMe}
          active={active}
          isCancelling={isCancelling}
          onCancel={cancelSubscription}
        />

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Available plans</h2>
          {active && (
            <p className="text-xs text-muted-foreground">
              Cancel your current plan to switch to a different one.
            </p>
          )}
          <PlanGrid
            plans={plans}
            loading={isLoadingPlans}
            error={isErrorPlans}
            activePlanId={active?.plan.id}
            hasActiveSub={!!active}
            busyPlanId={startingPlanId}
            isPending={isPending}
            onSubscribe={subscribe}
          />
        </section>
      </div>
    </DashboardLayout>
  );
}
