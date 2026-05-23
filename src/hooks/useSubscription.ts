import { cancelRazorpaySubscription, getMyRazorpaySubscription, getSubscriptionPlans, startRazorpaySubscription } from '@/api-client';
import type { MyRazorpaySubscriptionsResponse, SubscriptionCatalogPlan } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { openRazorpaySubscriptionCheckout } from '@/lib/razorpay-subscription-checkout';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import { sortPlansMonthlyFirst } from '@/pages/user/userSubscription.helpers';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

export function useSubscription() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [startingPlanId, setStartingPlanId] = useState<string | null>(null);

  const meQuery = useQuery({
    queryKey: ['razorpaySubscriptionMe'],
    queryFn: async (): Promise<MyRazorpaySubscriptionsResponse> => (await getMyRazorpaySubscription()).data,
  });

  const plansQuery = useQuery({
    queryKey: ['subscriptionPlans'],
    queryFn: async (): Promise<SubscriptionCatalogPlan[]> => (await getSubscriptionPlans()).data,
  });

  const startMutation = useMutation({
    mutationFn: (planId: string) => startRazorpaySubscription({ subscriptionPlanId: planId }),
    onSuccess: async (res) => {
      const { subscriptionId, razorpayKeyId, shortUrl, planName } = res.data;

      if (!subscriptionId || !razorpayKeyId) {
        if (shortUrl) window.location.assign(shortUrl);
        else toast({ variant: 'destructive', title: 'Checkout unavailable', description: 'Missing Razorpay config from server.' });
        setStartingPlanId(null);
        return;
      }

      try {
        await openRazorpaySubscriptionCheckout({
          keyId: razorpayKeyId,
          subscriptionId,
          businessName: 'Samvidhan',
          planLabel: planName,
          prefill: {
            name: user?.fullName,
            email: user?.email,
            contact: user?.phone?.replace(/\s/g, ''),
          },
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['razorpaySubscriptionMe'] });
            toast({ title: 'Payment successful', description: 'Subscription updates once Razorpay confirms.' });
            setStartingPlanId(null);
          },
          onDismiss: () => setStartingPlanId(null),
        });
      } catch (e) {
        toast({ variant: 'destructive', title: 'Could not open checkout', description: getApiErrorMessage(e) });
        if (shortUrl) window.location.assign(shortUrl);
        else setStartingPlanId(null);
      }
    },
    onError: (err: unknown) => {
      toast({ variant: 'destructive', title: 'Could not start subscription', description: getApiErrorMessage(err) });
      setStartingPlanId(null);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: cancelRazorpaySubscription,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['razorpaySubscriptionMe'] });
      toast({ title: 'Subscription cancelled', description: 'You\'ll keep access until the current period ends.' });
    },
    onError: (err: unknown) => {
      toast({ variant: 'destructive', title: 'Could not cancel', description: getApiErrorMessage(err) });
    },
  });

  return {
    active: meQuery.data?.hasActiveSubscription ? meQuery.data.subscription : null,
    plans: sortPlansMonthlyFirst(plansQuery.data ?? []),
    isLoadingMe: meQuery.isLoading,
    isLoadingPlans: plansQuery.isLoading,
    isErrorPlans: plansQuery.isError,
    startingPlanId,
    isPending: startMutation.isPending,
    isCancelling: cancelMutation.isPending,
    subscribe: (planId: string) => {
      setStartingPlanId(planId);
      startMutation.mutate(planId);
    },
    cancelSubscription: () => cancelMutation.mutate(),
  };
}
