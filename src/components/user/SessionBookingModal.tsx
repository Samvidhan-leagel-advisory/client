import {
  createAdminCaseSessionRequest,
  createCaseSessionRequest,
} from '@/api-client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { adminCaseDetailsQueryKey } from '@/hooks/useAdminCaseDetails';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import type {
  CaseSessionRequestRaisedBy,
  CreateCaseSessionRequestBody,
} from '@/types';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

const pad2 = (n: number) => String(n).padStart(2, '0');

const localTodayIso = () => {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
};

const localNowTime = () => {
  const d = new Date();
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
};

export const SessionBookingModal = ({
  bookingOpen,
  setBookingOpen,
  caseId,
  lawyerName,
  raisedBy = 'user',
}) => {
  const { toast } = useToast();
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const todayIso = localTodayIso();
  const minTime = preferredDate === todayIso ? localNowTime() : undefined;

  const isAdminRequest = raisedBy === 'admin';

  const { mutateAsync: submitSessionRequest, isPending } = useMutation({
    mutationFn: async () => {
      const requestedDate = new Date(`${preferredDate}T00:00:00`).toISOString();
      const raisedByRole = raisedBy as CaseSessionRequestRaisedBy;
      if (isAdminRequest) {
        return createAdminCaseSessionRequest({
          caseId,
          requestedDate,
          requestedTime: preferredTime,
          raisedBy: raisedByRole,
        });
      }
      const body: CreateCaseSessionRequestBody = {
        caseId,
        requestedDate,
        requestedTime: preferredTime,
        raisedBy: raisedByRole,
      };
      return createCaseSessionRequest(caseId, body);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: isAdminRequest
          ? adminCaseDetailsQueryKey(caseId)
          : ['case-details', caseId],
      });
    },
  });

  const handleBookSession = async () => {
    if (preferredDate < todayIso) {
      toast({
        title: 'Invalid date',
        description: 'Please choose today or a future date.',
        variant: 'destructive',
      });
      return;
    }
    if (preferredDate === todayIso && preferredTime < localNowTime()) {
      toast({
        title: 'Invalid time',
        description: 'Please choose a time later than now.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await submitSessionRequest();
      toast({
        title: 'Session request sent',
        description:
          'Your consultation request has been submitted for admin approval',
      });
      setPreferredDate('');
      setPreferredTime('');
      setBookingOpen(false);
    } catch (err) {
      toast({
        title: getApiErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Book Consultation</DialogTitle>
          <DialogDescription>
            {lawyerName
              ? `Schedule a session with ${lawyerName}. The request will be sent to admin for approval.`
              : 'Schedule a consultation. The request will be sent to admin for approval.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Preferred Date</Label>
            <Input
              type="date"
              value={preferredDate}
              min={todayIso}
              onChange={(e) => {
                const next = e.target.value;
                setPreferredDate(next);
                if (
                  next === todayIso &&
                  preferredTime &&
                  preferredTime < localNowTime()
                ) {
                  setPreferredTime('');
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label>Preferred Time</Label>
            <Input
              type="time"
              value={preferredTime}
              min={minTime}
              disabled={!preferredDate}
              onChange={(e) => setPreferredTime(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            disabled={isPending || !preferredDate || !preferredTime}
            onClick={handleBookSession}
          >
            {isPending ? 'Sending…' : 'Send Booking Request'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
