import { getCurrentUser } from '@/api-client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useActiveSubscription } from '@/hooks/useActiveSubscription';
import { downloadSamvidhanAdvisoryCardPdf } from '@/lib/samvidhan-advisory-card-pdf';
import type { MyRazorpaySubscriptionsResponse } from '@/types';
import { FileDown, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

interface DownloadSamvidhanCardProps {
  subscriptionPlan: NonNullable<
    MyRazorpaySubscriptionsResponse['subscription']
  >;
}

export const DownloadSamvidhanCard = ({
  subscriptionPlan: _,
}: DownloadSamvidhanCardProps) => {
  const { user } = useAuth();
  const { subscription: activeSubscription } = useActiveSubscription();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const { data: freshUser } = await getCurrentUser();

      await downloadSamvidhanAdvisoryCardPdf({
        memberName: freshUser?.fullName ?? user?.fullName ?? '',
        memNumber: user?.memNumber ?? '',
        photoUrl: freshUser?.avatarUrl ?? user?.avatarUrl,
        userMobileNo: freshUser?.phone ?? user?.phone ?? '',
        memStartDate: new Date(
          activeSubscription?.startDate ?? ''
        ).toLocaleDateString('en-GB'),
        memEndDate: activeSubscription?.endDate
          ? new Date(activeSubscription.endDate).toLocaleDateString('en-GB')
          : 'Lifetime',
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Something went wrong.';
      toast({
        title: 'Could not download card',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setDownloading(false);
    }
  }, [user, activeSubscription]);

  return (
    <div className="space-y-3 rounded-xl border border-gold/25 bg-gold/5 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <FileDown className="h-4 w-4 text-gold" />
        <h3 className="font-semibold">Legal Advisory card</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Download your Samvidhan Legal Advisory membership card as a PDF.
      </p>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2 border-gold/40"
        disabled={downloading}
        onClick={handleDownload}
      >
        {downloading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <FileDown className="h-3.5 w-3.5" />
        )}
        {downloading ? 'Generating…' : 'Download PDF'}
      </Button>
    </div>
  );
};
