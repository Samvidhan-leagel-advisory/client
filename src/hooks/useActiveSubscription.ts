import { getMyRazorpaySubscription } from '@/api-client';
import type {
  ActiveSubscriptionView,
  MyRazorpaySubscriptionsResponse,
} from '@/types';
import { useQuery } from '@tanstack/react-query';

export function useActiveSubscription() {
  const { data, isLoading } = useQuery({
    queryKey: ['razorpaySubscriptionMe'],
    queryFn: async (): Promise<MyRazorpaySubscriptionsResponse> =>
      (await getMyRazorpaySubscription()).data,
    staleTime: 1000 * 60 * 5, // treat as fresh for 5 min
  });

  // /me response already matches ActiveSubscriptionView (plan has an extra
  // `slug` field that structurally widens fine). priceInr/refId are absent
  // for now — render is gated on truthiness inside the card.
  const subscription: ActiveSubscriptionView | null = data?.subscription ?? null;

  return {
    isActive: data?.hasActiveSubscription ?? false,
    subscription,
    isLoading,
  };
}
