import PlanGrid from '@/components/subscription/PlanGrid';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminSubscriptions } from '@/hooks/useAdminSubscriptions';
import { AdminLayout } from '@/layouts/AdminLayout';

const AdminSubscriptions = () => {
  const {
    catalogPlans,
    activeSubscriptionCounts,
    isLoading,
    isError,
    modalOpen,
    editingPlan,
    openEdit,
    closeModal,
    savePlan,
    isSaving,
  } = useAdminSubscriptions();

  const busyPlanId = isSaving && editingPlan ? editingPlan.id : null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Subscription plans</h1>
          <p className="mt-1 text-muted-foreground">
            Same layout as the member catalog. You can edit display names and
            feature bullets only; pricing and Razorpay stay server-side.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {isLoading ? (
            [0, 1, 2].map((i) => (
              <div key={i} className="rounded-xl border bg-card p-5">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="mt-3 h-9 w-14" />
              </div>
            ))
          ) : isError ? (
            <p className="text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
              Could not load active subscriber counts.
            </p>
          ) : activeSubscriptionCounts.length === 0 ? (
            <p className="text-sm text-muted-foreground sm:col-span-2 xl:col-span-3">
              No active subscriber counts returned.
            </p>
          ) : (
            activeSubscriptionCounts.map((row) => (
              <div
                key={row.subscriptionPlanId}
                className="rounded-xl border bg-card p-5"
              >
                <p className="text-sm text-muted-foreground">
                  <span className="font-bold text-gold">{row.name}</span>{' '}
                  subscribers
                </p>
                <p className="mt-1 text-2xl font-bold">
                  {Number(row.count) || 0}
                </p>
              </div>
            ))
          )}
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Catalog plans</h2>
          <PlanGrid
            variant="admin"
            plans={catalogPlans}
            loading={isLoading}
            error={isError}
            busyPlanId={busyPlanId}
            isPending={isSaving}
            onEdit={openEdit}
          />
        </section>
      </div>
    </AdminLayout>
  );
};

export default AdminSubscriptions;
