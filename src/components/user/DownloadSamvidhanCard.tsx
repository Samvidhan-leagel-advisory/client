import { getCurrentUser } from '@/api-client';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { useActiveSubscription } from '@/hooks/useActiveSubscription';
import { downloadSamvidhanAdvisoryCardPdf } from '@/lib/samvidhan-advisory-card-pdf';
import type { ActiveSubscriptionView } from '@/types';
import { FileDown, Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';

interface CardMember {
  fullName?: string | null;
  memNumber?: string | null;
  avatarUrl?: string | null;
  phone?: string | null;
}

interface DownloadSamvidhanCardProps {
  subscriptionPlan: ActiveSubscriptionView;
  /**
   * Admin override: when provided, the card is generated for this member using
   * the supplied subscription instead of the currently authenticated user.
   */
  member?: CardMember;
}

export const DownloadSamvidhanCard = ({
  subscriptionPlan,
  member,
}: DownloadSamvidhanCardProps) => {
  const isAdminMode = Boolean(member);
  const { user } = useAuth();
  const { subscription: ownActiveSubscription } = useActiveSubscription();
  const [downloading, setDownloading] = useState(false);

  const activeSubscription = isAdminMode
    ? subscriptionPlan
    : ownActiveSubscription;

  const handleDownload = useCallback(async () => {
    setDownloading(true);
    try {
      const member$ = member
        ? member
        : await getCurrentUser().then(({ data }) => data);

      await downloadSamvidhanAdvisoryCardPdf({
        memberName: member$?.fullName ?? user?.fullName ?? '',
        memNumber: member$?.memNumber ?? user?.memNumber ?? '',
        photoUrl: member$?.avatarUrl ?? user?.avatarUrl ?? undefined,
        userMobileNo: member$?.phone ?? user?.phone ?? '',
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
  }, [member, user, activeSubscription]);

  return (
    <div className="space-y-3 rounded-xl border border-gold/25 bg-gold/5 p-6 shadow-sm">
      <div className="flex items-center gap-2">
        <FileDown className="h-4 w-4 text-gold" />
        <h3 className="font-semibold">Legal Advisory card</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        {isAdminMode
          ? 'Download this member’s Samvidhan Legal Advisory membership card as a PDF.'
          : 'Download your Samvidhan Legal Advisory membership card as a PDF.'}
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
        {downloading ? 'Generating…' : 'Card download'}
      </Button>
    </div>
  );
};
