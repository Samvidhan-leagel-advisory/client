import {
  deleteAdminCaseSessionRequest,
  deleteCaseSessionRequest,
  updateCaseSessionRequestStatus,
} from '@/api-client';
import { adminCaseDetailsQueryKey } from '@/hooks/useAdminCaseDetails';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';

function invalidateUserCaseDetail(caseId: string) {
  void queryClient.invalidateQueries({ queryKey: ['case-details', caseId] });
}

function invalidateAdminSessionRelated(caseId: string) {
  void queryClient.invalidateQueries({
    queryKey: adminCaseDetailsQueryKey(caseId),
  });
  void queryClient.invalidateQueries({ queryKey: ['session-requests'] });
}

type ActionsParams = {
  caseId?: string | null;
  sessionRequestId?: string | null;
  /** For approve / reject toast copy */
  caseCode?: string | null;
};

export function useCaseMeetingUriSessionActions({
  caseId,
  sessionRequestId,
  caseCode,
}: ActionsParams) {
  const { toast } = useToast();
  const resolvedCaseId = caseId?.trim() || null;
  const resolvedSessionId = sessionRequestId?.trim() || null;
  const caseLabel = (caseCode?.trim() || 'this case');

  const toastErr = (err: unknown) =>
    toast({
      title: getApiErrorMessage(err),
      variant: 'destructive',
    });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedSessionId) {
        throw new Error('Missing session request');
      }
      return deleteCaseSessionRequest(resolvedSessionId);
    },
    onSuccess: () => {
      if (resolvedCaseId) invalidateUserCaseDetail(resolvedCaseId);
      toast({
        title: 'Request cancelled',
        description: 'You can book a new session anytime.',
      });
    },
    onError: toastErr,
  });

  const adminRemoveMutation = useMutation({
    mutationFn: async () => {
      if (!resolvedSessionId) {
        throw new Error('Missing session request');
      }
      return deleteAdminCaseSessionRequest(resolvedSessionId);
    },
    onSuccess: () => {
      if (resolvedCaseId) invalidateAdminSessionRelated(resolvedCaseId);
      toast({
        title: 'Session request removed',
        description:
          'The consultation request has been deleted from this case.',
      });
    },
    onError: toastErr,
  });

  const adminReviewMutation = useMutation({
    mutationFn: async (status: 'accepted' | 'rejected') => {
      if (!resolvedSessionId) {
        throw new Error('Missing session request');
      }
      return updateCaseSessionRequestStatus(resolvedSessionId, status);
    },
    onSuccess: (_data, status) => {
      if (resolvedCaseId) invalidateAdminSessionRelated(resolvedCaseId);
      if (status === 'accepted') {
        toast({
          title: 'Session approved',
          description: `Session for ${caseLabel} approved.`,
        });
      } else {
        toast({
          title: 'Session rejected',
          description: `Session request for ${caseLabel} has been rejected.`,
        });
      }
    },
    onError: toastErr,
  });

  const reviewVariables = adminReviewMutation.variables;

  return {
    withdrawAsync: withdrawMutation.mutateAsync,
    isWithdrawing: withdrawMutation.isPending,

    adminRemoveAsync: adminRemoveMutation.mutateAsync,
    isAdminRemoving: adminRemoveMutation.isPending,

    adminReviewAsync: adminReviewMutation.mutateAsync,
    isAdminReviewing: adminReviewMutation.isPending,
    isApproveLoading:
      adminReviewMutation.isPending && reviewVariables === 'accepted',
    isRejectLoading:
      adminReviewMutation.isPending && reviewVariables === 'rejected',
  };
}
