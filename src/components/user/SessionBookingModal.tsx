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
              onChange={(e) => setPreferredDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Preferred Time</Label>
            <Input
              type="time"
              value={preferredTime}
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
