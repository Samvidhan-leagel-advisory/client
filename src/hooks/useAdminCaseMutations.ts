import { resetAdminCase, updateAdminCaseStatus } from '@/api-client';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import type { CaseStatus } from '@/types';
import { useMutation } from '@tanstack/react-query';

function invalidateAdminCaseQueries(caseId?: string) {
  queryClient.invalidateQueries({ queryKey: ['admin-cases'] });
  if (caseId) {
    queryClient.invalidateQueries({ queryKey: ['admin-case-details', caseId] });
  }
}

export function useAdminCaseMutations(
  caseId: string | undefined,
  options?: { caseLabel?: string; additionalInvalidationKeys?: unknown[][] }
) {
  const { toast } = useToast();
  const label = options?.caseLabel;
  const additionalInvalidationKeys = options?.additionalInvalidationKeys ?? [];

  const caseRef = label ? `Case ${label}` : 'Case';

  const updateCaseStatusMutation = useMutation({
    mutationFn: async ({
      status,
      caseId: targetCaseId,
    }: {
      status: CaseStatus;
      caseId?: string;
    }) => {
      const resolvedCaseId = targetCaseId ?? caseId;
      if (!resolvedCaseId) {
        throw new Error('Missing case id');
      }
      await updateAdminCaseStatus(resolvedCaseId, status);
      return { status, caseId: resolvedCaseId };
    },
    onSuccess: ({ status, caseId: updatedCaseId }) => {
      invalidateAdminCaseQueries(updatedCaseId);
      additionalInvalidationKeys.forEach((queryKey) => {
        queryClient.invalidateQueries({ queryKey });
      });
      if (status === 'resolved') {
        toast({
          title: 'Case finalized',
          description: `${caseRef} marked as resolved.`,
        });
      } else if (status === 'closed') {
        toast({
          title: 'Case closed',
          description: `${caseRef} has been closed.`,
        });
      } else {
        toast({
          title: 'Status updated',
          description: `${caseRef} status is now ${status.replace(/_/g, ' ')}.`,
        });
      }
    },
    onError: (err) => {
      toast({
        title: 'Update failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const resetCaseMutation = useMutation({
    mutationFn: async () => {
      if (!caseId) {
        throw new Error('Missing case id');
      }
      await resetAdminCase(caseId);
    },
    onSuccess: () => {
      invalidateAdminCaseQueries(caseId);
      toast({
        title: 'Case reset',
        description: `${caseRef} has been reset to New status.`,
      });
    },
    onError: (err) => {
      toast({
        title: 'Reset failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    },
  });

  const isCaseActionPending =
    updateCaseStatusMutation.isPending || resetCaseMutation.isPending;

  return {
    updateCaseStatus: (status: CaseStatus) =>
      updateCaseStatusMutation.mutateAsync({ status }),
    updateCaseStatusForCase: (targetCaseId: string, status: CaseStatus) =>
      updateCaseStatusMutation.mutateAsync({ caseId: targetCaseId, status }),
    resetCase: resetCaseMutation.mutateAsync,
    isUpdatingStatus: updateCaseStatusMutation.isPending,
    isResetting: resetCaseMutation.isPending,
    isCaseActionPending,
  };
}
