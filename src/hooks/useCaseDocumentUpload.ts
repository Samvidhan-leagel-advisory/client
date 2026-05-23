import { uploadCaseDocument } from '@/api-client';
import { useToast } from '@/hooks/use-toast';
import { uploadAssetFile } from '@/hooks/useAssetUpload';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';

export type CaseDocumentAuthor = 'lawyer' | 'user' | 'admin';

export function useCaseDocumentUpload(
  caseId: string | undefined,
  author: CaseDocumentAuthor
) {
  const { toast } = useToast();

  const { mutateAsync: uploadSingleDocument, isPending: isUploadingDocument } =
    useMutation({
      mutationFn: async (file: File) => {
        const uploaded = await uploadAssetFile(file);
        await uploadCaseDocument(caseId, {
          assetUrl: uploaded.assetUrl,
          assetType: uploaded.assetType,
          assetName: uploaded.assetName,
          author,
        });
      },
    });

  const uploadFromSource = async (
    file: File,
    source: 'Chat' | 'Documents drawer' | 'Case page' | 'Documents page'
  ) => {
    try {
      await uploadSingleDocument(file);
      await queryClient.invalidateQueries({ queryKey: ['case-documents'] });
      if (author === 'admin') {
        await queryClient.invalidateQueries({
          queryKey: ['admin-case-documents'],
        });
      }
      toast({
        title: 'Document uploaded',
        description: `${file.name} uploaded from ${source}.`,
      });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  return { isUploadingDocument, uploadFromSource, uploadSingleDocument };
}
