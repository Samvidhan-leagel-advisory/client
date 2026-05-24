import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useCaseMeetingUriSessionActions } from '@/hooks/useCaseMeetingUriSessionActions';
import {
  type CaseSessionRequestLike,
  useCaseSessionRequestDisplay,
} from '@/hooks/useCaseSessionRequestDisplay';
import {
  CalendarClock,
  CheckCircle2,
  CheckCircle,
  Clock,
  ExternalLink,
  Loader2,
  Video,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

export type CaseMeetingUriProps = {
  sessionRequest?: CaseSessionRequestLike | null;
  caseId?: string | null;
  allowWithdrawSessionRequest?: boolean;
  allowAdminDeleteSessionRequest?: boolean;
  /** Approve / reject pending requests (admin API). */
  allowAdminReviewSessionRequest?: boolean;
  caseCode?: string | null;
};

export const CaseMeetingUri = ({
  sessionRequest,
  caseId,
  allowWithdrawSessionRequest = false,
  allowAdminDeleteSessionRequest = false,
  allowAdminReviewSessionRequest = false,
  caseCode,
}: CaseMeetingUriProps) => {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [adminRemoveOpen, setAdminRemoveOpen] = useState(false);

  const display = useCaseSessionRequestDisplay(sessionRequest);
  const {
    withdrawAsync,
    isWithdrawing,
    adminRemoveAsync,
    isAdminRemoving,
    adminReviewAsync,
    isApproveLoading,
    isRejectLoading,
    isAdminReviewing,
  } = useCaseMeetingUriSessionActions({
    caseId,
    sessionRequestId: display.sessionRequestId,
    caseCode,
  });

  const {
    meetingLink,
    statusLabel,
    statusBadgeVariant,
    isPending,
    isAccepted,
    isRejected,
    sessionRequestId,
    isUpcoming,
    scheduledFormatted,
    callTypeLabel,
    statusHint,
  } = display;

  const showWithdraw =
    isPending &&
    allowWithdrawSessionRequest &&
    Boolean(sessionRequestId) &&
    Boolean(caseId);

  const showAdminReview =
    isPending &&
    allowAdminReviewSessionRequest &&
    Boolean(sessionRequestId) &&
    Boolean(caseId);

  const showAdminRemove =
    allowAdminDeleteSessionRequest &&
    Boolean(sessionRequestId) &&
    Boolean(caseId);

  const handleApprove = () => {
    void adminReviewAsync('accepted').catch(() => {});
  };

  const handleReject = () => {
    void adminReviewAsync('rejected').catch(() => {});
  };

  const handleConfirmWithdraw = () => {
    void withdrawAsync()
      .then(() => setWithdrawOpen(false))
      .catch(() => {});
  };

  const handleConfirmAdminRemove = () => {
    void adminRemoveAsync()
      .then(() => setAdminRemoveOpen(false))
      .catch(() => {});
  };

  const adminReviewButtonsDisabled =
    isAdminReviewing || isAdminRemoving || isWithdrawing;

  const statusBadgeClass =
    statusBadgeVariant === 'rejected'
      ? 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300'
      : statusBadgeVariant === 'pending'
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-200'
        : statusBadgeVariant === 'accepted'
          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
          : '';

  const statusBadgeIcon =
    statusBadgeVariant === 'rejected' ? (
      <XCircle className="h-3.5 w-3.5" />
    ) : statusBadgeVariant === 'pending' ? (
      <Clock className="h-3.5 w-3.5" />
    ) : statusBadgeVariant === 'accepted' ? (
      <CheckCircle2 className="h-3.5 w-3.5" />
    ) : null;

  const hintStripClass = isRejected
    ? 'border-red-200/60 bg-red-50/50 text-red-700 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300'
    : isPending
      ? 'border-amber-200/60 bg-amber-50/50 text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200'
      : 'border-border bg-muted/30 text-muted-foreground';

  return (
    <>
      <div className="w-full min-w-0 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold/15 px-2.5 py-1 text-xs font-medium text-gold">
                <Video className="h-3.5 w-3.5 shrink-0" />
                {isUpcoming === true
                  ? 'Upcoming'
                  : isUpcoming === false
                    ? 'Past session'
                    : 'Consultation'}
                {callTypeLabel ? ` · ${callTypeLabel}` : ''}
              </span>

              {statusBadgeVariant && statusLabel && (
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass}`}
                >
                  {statusBadgeIcon}
                  {statusBadgeVariant === 'pending'
                    ? 'Pending approval'
                    : statusLabel}
                </span>
              )}
            </div>

            {scheduledFormatted && (
              <div className="flex items-center gap-2">
                <CalendarClock className="h-4 w-4 shrink-0 text-gold" />
                <span className="text-sm font-semibold text-foreground sm:text-base">
                  {scheduledFormatted}
                </span>
              </div>
            )}
          </div>

          <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center sm:justify-end">
            {showAdminReview ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={adminReviewButtonsDisabled}
                  onClick={handleApprove}
                >
                  {isApproveLoading ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Approve
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                  disabled={adminReviewButtonsDisabled}
                  onClick={handleReject}
                >
                  {isRejectLoading ? (
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <XCircle className="mr-1.5 h-3.5 w-3.5" />
                  )}
                  Reject
                </Button>
              </>
            ) : null}

            {showWithdraw ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                disabled={isWithdrawing}
                onClick={() => setWithdrawOpen(true)}
              >
                Cancel request
              </Button>
            ) : null}

            {showAdminRemove ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive sm:w-auto"
                disabled={isAdminRemoving || isAdminReviewing}
                onClick={() => setAdminRemoveOpen(true)}
              >
                Remove session
              </Button>
            ) : null}

            {meetingLink && isAccepted ? (
              <a
                href={meetingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gold px-4 py-2.5 text-sm font-semibold text-black shadow-sm transition hover:bg-gold/90 sm:w-auto sm:self-center"
              >
                <ExternalLink className="h-4 w-4 shrink-0" />
                Join Google Meet
              </a>
            ) : isAccepted && !isRejected && !isPending ? (
              <span className="shrink-0 rounded-lg border border-border bg-muted/40 px-3 py-2 text-center text-xs text-muted-foreground sm:self-center">
                Link pending
              </span>
            ) : null}
          </div>
        </div>

        {statusHint && (
          <div
            className={`border-t px-4 py-2.5 text-xs leading-relaxed ${hintStripClass}`}
          >
            {statusHint}
          </div>
        )}
      </div>

      <AlertDialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel session request?</AlertDialogTitle>
            <AlertDialogDescription>
              This withdraws your booking request before it is approved. You can
              submit a new request afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isWithdrawing}>
              Keep request
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isWithdrawing}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmWithdraw();
              }}
            >
              {isWithdrawing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Cancel request'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={adminRemoveOpen} onOpenChange={setAdminRemoveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove session request?</AlertDialogTitle>
            <AlertDialogDescription>
              This deletes the session request for this case, including approved
              sessions and any meeting link. The client can submit a new booking
              afterward.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isAdminRemoving}>Keep</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isAdminRemoving}
              onClick={(e) => {
                e.preventDefault();
                void handleConfirmAdminRemove();
              }}
            >
              {isAdminRemoving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Remove session'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
