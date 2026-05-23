import { uploadAsset } from '@/api-client';
import { normalizeCaseDocumentAssetType } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';

export interface UploadedAssetPayload {
  assetUrl: string;
  assetType: string;
  assetName: string;
}

/** Upload a single file to asset storage (shared by case docs, lawyer vault, etc.). */
export async function uploadAssetFile(
  file: File
): Promise<UploadedAssetPayload> {
  const { data } = await uploadAsset(file);
  return {
    assetUrl: data.assetUrl,
    assetType: normalizeCaseDocumentAssetType(data.assetType, file),
    assetName: data.assetName ?? file.name,
  };
}

export function useAssetUpload() {
  return useMutation({
    mutationFn: uploadAssetFile,
  });
}
