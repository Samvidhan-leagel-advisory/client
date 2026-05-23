import { getMyRazorpaySubscription } from '@/api-client';
import type { MyRazorpaySubscriptionsResponse } from '@/types';
import { useQuery } from '@tanstack/react-query';

export function useActiveSubscription() {
  const { data, isLoading } = useQuery({
    queryKey: ['razorpaySubscriptionMe'],
    queryFn: async (): Promise<MyRazorpaySubscriptionsResponse> =>
      (await getMyRazorpaySubscription()).data,
    staleTime: 1000 * 60 * 5, // treat as fresh for 5 min
  });

  return {
    isActive: data?.hasActiveSubscription ?? false,
    subscription: data?.subscription ?? null,
    isLoading,
  };
}
