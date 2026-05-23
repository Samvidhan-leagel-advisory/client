import {
  getAdminLawyerDocuments,
  getAdminLawyerPendingDocuments,
  reviewAdminLawyerDocument,
} from '@/api-client';
import { useToast } from '@/hooks/use-toast';
import { buildGenericQueryParams } from '@/lib/helpers';
import {
  extractLawyerDocumentsFromResponse,
  extractPendingLawyerDocumentsPage,
} from '@/lib/lawyer-documents';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import type { ReviewLawyerDocumentBody } from '@/types';
import { keepPreviousData, useMutation, useQuery } from '@tanstack/react-query';

export const adminLawyerDocumentsQueryKey = (lawyerId: string) =>
  ['adminLawyerDocuments', lawyerId] as const;

export const adminLawyerPendingDocumentsQueryKey = (page: number) =>
  ['adminLawyerPendingDocuments', page] as const;

export function useAdminLawyerDocumentsList(lawyerId: string | undefined) {
  return useQuery({
    queryKey: adminLawyerDocumentsQueryKey(lawyerId ?? ''),
    queryFn: async () => {
      const res = await getAdminLawyerDocuments(lawyerId!);
      return extractLawyerDocumentsFromResponse(res.data);
    },
    enabled: Boolean(lawyerId),
    refetchOnWindowFocus: false,
  });
}

export function useAdminLawyerPendingDocuments(page: number) {
  return useQuery({
    queryKey: adminLawyerPendingDocumentsQueryKey(page),
    queryFn: async () => {
      const params = buildGenericQueryParams(page);
      const res = await getAdminLawyerPendingDocuments(params);
      return extractPendingLawyerDocumentsPage(res.data);
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });
}

type ReviewArgs = { documentId: string; body: ReviewLawyerDocumentBody };

/**
 * @param lawyerProfileId When set, also refreshes that lawyer's detail + documents list.
 */
export function useAdminLawyerDocumentReview(lawyerProfileId?: string) {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ documentId, body }: ReviewArgs) => {
      await reviewAdminLawyerDocument(documentId, body);
    },
    onSuccess: async (_, { body }) => {
      await queryClient.invalidateQueries({
        queryKey: ['adminLawyerPendingDocuments'],
      });
      if (lawyerProfileId) {
        await queryClient.invalidateQueries({
          queryKey: adminLawyerDocumentsQueryKey(lawyerProfileId),
        });
        await queryClient.invalidateQueries({
          queryKey: ['adminLawyerDetails', lawyerProfileId],
        });
      }
      toast({
        title: body.isApproved ? 'Document approved' : 'Document rejected',
        description: body.isApproved
          ? 'This document is marked approved.'
          : 'The lawyer will see your reason on this document.',
      });
    },
    onError: (err: unknown) => {
      toast({
        title: 'Review failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    },
  });
}
