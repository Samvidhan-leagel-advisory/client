import { getFirstLetterCapitalized } from '@/lib/helpers';
import { useMemo } from 'react';

export type CaseSessionRequestLike = {
  id?: string;
  requestedDate?: string;
  requestedTime?: string;
  callType?: string;
  meetingUri?: string | null;
  status?: string | null;
};

export function normalizeSessionStatus(status?: string | null) {
  return (status ?? '').trim().toLowerCase();
}

export function useCaseSessionRequestDisplay(
  sessionRequest?: CaseSessionRequestLike | null
) {
  const meetingLink = sessionRequest?.meetingUri?.trim() || null;
  const rawStatus = sessionRequest?.status ?? null;
  const statusNorm = normalizeSessionStatus(rawStatus);

  const isPending = statusNorm === 'pending';
  const isAccepted =
    statusNorm === 'accepted' ||
    statusNorm === 'approved' ||
    statusNorm === 'confirmed';
  const isRejected = statusNorm === 'rejected' || statusNorm === 'declined';

  const sessionRequestId = sessionRequest?.id?.trim() || null;

  const statusLabel =
    getFirstLetterCapitalized(rawStatus ?? '') ||
    (isRejected ? 'Rejected' : isAccepted ? 'Accepted' : null);

  const { requestedAt, isUpcoming, scheduledFormatted } = useMemo(() => {
    if (
      !sessionRequest?.requestedDate ||
      sessionRequest.requestedTime == null ||
      sessionRequest.requestedTime === ''
    ) {
      return {
        requestedAt: null as Date | null,
        isUpcoming: null as boolean | null,
        scheduledFormatted: null as string | null,
      };
    }
    const requestedAtDate = new Date(
      `${sessionRequest.requestedDate}T${sessionRequest.requestedTime}`
    );
    const upcoming = requestedAtDate.getTime() > Date.now();
    const formatted = requestedAtDate.toLocaleString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    return {
      requestedAt: requestedAtDate,
      isUpcoming: upcoming,
      scheduledFormatted: formatted,
    };
  }, [sessionRequest?.requestedDate, sessionRequest?.requestedTime]);

  const callTypeLabel =
    getFirstLetterCapitalized(sessionRequest?.callType ?? '') || null;

  const statusBadgeVariant = isRejected
    ? 'rejected'
    : isPending
      ? 'pending'
      : isAccepted
        ? 'accepted'
        : null;

  const statusHint = isRejected
    ? 'This session was not approved. You can book a new slot anytime.'
    : isPending
      ? 'Waiting for approval. A Google Meet link will appear here once confirmed.'
      : isAccepted && !meetingLink
        ? 'Session confirmed. The Meet link will appear here before your scheduled time.'
        : null;

  return {
    meetingLink,
    rawStatus,
    statusNorm,
    statusLabel,
    statusBadgeVariant,
    isPending,
    isAccepted,
    isRejected,
    sessionRequestId,
    requestedAt,
    isUpcoming,
    scheduledFormatted,
    callTypeLabel,
    statusHint,
  };
}
