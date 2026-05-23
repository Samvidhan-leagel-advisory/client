import { useCallback, useEffect, useRef, useState } from 'react';

export const MAX_ATTACHMENTS = 3;

export interface PendingAttachment {
  file: File;
  previewUrl: string | null;
}

export function useAttachments(resetKey?: string) {
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const attachmentsRef = useRef(attachments);
  attachmentsRef.current = attachments;

  useEffect(() => {
    return () => {
      for (const a of attachmentsRef.current) {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      }
    };
  }, []);

  useEffect(() => {
    setAttachments((prev) => {
      for (const a of prev) {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      }
      return [];
    });
  }, [resetKey]);

  const add = useCallback((file: File) => {
    setAttachments((prev) => {
      if (prev.length >= MAX_ATTACHMENTS) return prev;
      const previewUrl = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null;
      return [...prev, { file, previewUrl }];
    });
  }, []);

  const remove = useCallback((index: number) => {
    setAttachments((prev) => {
      const item = prev[index];
      if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const clear = useCallback(() => {
    setAttachments((prev) => {
      for (const a of prev) {
        if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
      }
      return [];
    });
  }, []);

  return {
    attachments,
    isFull: attachments.length >= MAX_ATTACHMENTS,
    add,
    remove,
    clear,
  };
}
