import {
  createAdminCaseNote,
  createCaseNote,
  getAdminCaseInternalNotes,
  getCaseInternalNotes,
} from '@/api-client';
import { useToast } from '@/hooks/use-toast';
import { buildGenericQueryParams } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

const emptyNotesResponse = () => ({
  data: [] as {
    id: string;
    note: string;
    author: string;
    createdAt: string;
  }[],
  pagination: {
    total: 0,
    totalPages: 1,
  },
});

type UseInternalCaseNotesOptions =
  | { variant: 'admin' }
  | { variant: 'lawyer'; skipFetch: boolean };

export function useInternalCaseNotes(
  caseId: string | undefined,
  options: UseInternalCaseNotesOptions
) {
  const { toast } = useToast();
  const [noteText, setNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [page, setPage] = useState(1);

  const isAdmin = options.variant === 'admin';
  const skipFetch = options.variant === 'lawyer' && options.skipFetch;

  const queryKey = isAdmin
    ? (['admin-case-notes', caseId, page] as const)
    : (['case-notes', caseId, page] as const);

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      if (skipFetch) {
        return emptyNotesResponse();
      }
      const params = buildGenericQueryParams(page);
      if (isAdmin) {
        const response = await getAdminCaseInternalNotes(caseId, params);
        return response.data;
      }
      const response = await getCaseInternalNotes(caseId, params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const handleAdd = async () => {
    setIsAddingNote(true);
    try {
      if (isAdmin) {
        await createAdminCaseNote(caseId, {
          note: noteText.trim(),
        });
        await queryClient.invalidateQueries({
          queryKey: ['admin-case-notes', caseId],
        });
      } else {
        await createCaseNote(caseId, {
          note: noteText.trim(),
          author: 'lawyer',
        });
        await queryClient.invalidateQueries({ queryKey: ['case-notes', caseId] });
      }
      toast({
        title: 'Note added',
        description: 'Your note has been added successfully.',
      });
    } catch (error) {
      toast({
        title: getApiErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setNoteText('');
      setIsAddingNote(false);
    }
  };

  const notes = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  return {
    noteText,
    setNoteText,
    page,
    setPage,
    handleAdd,
    isAddingNote,
    notes,
    totalPages,
    total,
  };
}
