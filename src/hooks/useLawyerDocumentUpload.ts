import { createLawyerDocument } from '@/api-client';
import { useToast } from '@/hooks/use-toast';
import { uploadAssetFile } from '@/hooks/useAssetUpload';
import { LAWYER_DOCUMENT_REVERIFICATION_NOTE } from '@/lib/lawyer-documents-messages';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';

export function useLawyerDocumentUpload() {
  const { toast } = useToast();

  const {
    mutateAsync: uploadLawyerDocument,
    isPending: isUploadingLawyerDocument,
  } = useMutation({
    mutationFn: async (file: File) => {
      const uploaded = await uploadAssetFile(file);
      await createLawyerDocument({
        assetUrl: uploaded.assetUrl,
        assetName: uploaded.assetName,
      });
    },
  });

  const uploadFromPicker = async (file: File) => {
    try {
      await uploadLawyerDocument(file);
      await queryClient.invalidateQueries({ queryKey: ['lawyer-documents'] });
      await queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      toast({
        title: 'Document uploaded',
        description: `"${file.name}" was saved. ${LAWYER_DOCUMENT_REVERIFICATION_NOTE}`,
      });
    } catch (err) {
      toast({
        title: 'Upload failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  return {
    isUploadingLawyerDocument,
    uploadFromPicker,
    uploadLawyerDocument,
  };
}
