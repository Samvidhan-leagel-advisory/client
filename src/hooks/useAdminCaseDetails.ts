import { getAdminCaseById } from '@/api-client';
import type { CaseDetails } from '@/types';
import { useQuery } from '@tanstack/react-query';

export const adminCaseDetailsQueryKey = (caseId: string | undefined) =>
  ['admin-case-details', caseId] as const;

export function useAdminCaseDetails(
  caseId: string | undefined,
  options?: { enabled?: boolean }
) {
  const extraEnabled = options?.enabled ?? true;
  return useQuery({
    queryKey: adminCaseDetailsQueryKey(caseId),
    queryFn: async () => {
      const response = await getAdminCaseById(caseId);
      return response.data as CaseDetails;
    },
    enabled: Boolean(caseId) && extraEnabled,
    refetchOnWindowFocus: false,
  });
}
