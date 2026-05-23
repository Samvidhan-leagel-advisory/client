import {
  adminPatchSubscriptionPlan,
  getAdminSubscriptionAnalytics,
} from '@/api-client';
import { useToast } from '@/hooks/use-toast';
import type { AdminPlanFormSavePayload } from '@/hooks/usePlanFormModal';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import {
  catalogRowToModalSubscriptionPlan,
  sortPlansMonthlyFirst,
} from '@/pages/user/userSubscription.helpers';
import type {
  AdminSubscriptionAnalyticsResponse,
  SubscriptionPlan,
} from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

export function useAdminSubscriptions() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);

  const analyticsQuery = useQuery({
    queryKey: ['admin', 'subscriptionAnalytics'],
    queryFn: async (): Promise<AdminSubscriptionAnalyticsResponse> => {
      const { data } = await getAdminSubscriptionAnalytics();
      return data as AdminSubscriptionAnalyticsResponse;
    },
  });

  const catalogPlans = useMemo(
    () => sortPlansMonthlyFirst(analyticsQuery.data?.subscriptionPlans ?? []),
    [analyticsQuery.data?.subscriptionPlans]
  );

  const patchMutation = useMutation({
    mutationFn: async (input: {
      planId: string;
      body: { name: string; features: string };
    }) => {
      const res = await adminPatchSubscriptionPlan(input.planId, input.body);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['admin', 'subscriptionAnalytics'],
      });
      queryClient.invalidateQueries({ queryKey: ['subscriptionPlans'] });
      toast({
        title: 'Plan updated',
        description: 'Name and features were saved.',
      });
      setModalOpen(false);
      setEditingPlan(null);
    },
    onError: (err: unknown) => {
      toast({
        variant: 'destructive',
        title: 'Could not update plan',
        description: getApiErrorMessage(err),
      });
    },
  });

  const openEdit = useCallback(
    (planId: string) => {
      const row = catalogPlans.find((p) => p.id === planId);
      if (!row) return;
      setEditingPlan(catalogRowToModalSubscriptionPlan(row));
      setModalOpen(true);
    },
    [catalogPlans]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setEditingPlan(null);
  }, []);

  const savePlan = useCallback(
    (payload: AdminPlanFormSavePayload) => {
      if (!editingPlan) return;
      patchMutation.mutate({
        planId: editingPlan.id,
        body: { name: payload.name, features: payload.featuresRaw },
      });
    },
    [editingPlan, patchMutation]
  );

  return {
    catalogPlans,
    activeSubscriptionCounts:
      analyticsQuery.data?.activeSubscriptionCounts ?? [],
    isLoading: analyticsQuery.isPending,
    isError: analyticsQuery.isError,
    error: analyticsQuery.error,
    refetch: analyticsQuery.refetch,
    modalOpen,
    editingPlan,
    openEdit,
    closeModal,
    savePlan,
    isSaving: patchMutation.isPending,
  };
}
