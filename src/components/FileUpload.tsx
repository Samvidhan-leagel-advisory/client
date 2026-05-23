import { CASE_DOCUMENT_ACCEPT } from '@/lib/helpers';
import { FileText, Image, Paperclip, X } from 'lucide-react';
import { useRef, useState } from 'react';

interface UploadedFile {
  file: File;
  id: string;
  preview?: string;
}

interface FileUploadProps {
  onFilesChange?: (files: File[]) => void;
  onError?: (message: string) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  accept?: string;
  label?: string;
}

export const FileUpload = ({
  onFilesChange,
  onError,
  maxFiles = 10,
  maxSizeMB = 10,
  accept = CASE_DOCUMENT_ACCEPT,
  label = 'Upload Documents',
}: FileUploadProps) => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    if (files.length >= maxFiles) {
      onError?.(`Maximum ${maxFiles} files allowed`);
      return;
    }

    const incoming = Array.from(newFiles);
    const oversized = incoming.filter((f) => f.size > maxSizeMB * 1024 * 1024);
    if (oversized.length > 0) {
      onError?.(`Each file must be less than ${maxSizeMB}MB`);
    }

    const valid = incoming.filter((f) => f.size <= maxSizeMB * 1024 * 1024);
    const remaining = maxFiles - files.length;
    if (valid.length > remaining) {
      onError?.(`Only ${remaining} more file(s) can be added`);
    }

    const updated = [...files];
    for (const file of valid) {
      if (updated.length >= maxFiles) break;
      const id = Math.random().toString(36).slice(2);
      const preview = file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : undefined;
      updated.push({ file, id, preview });
    }
    setFiles(updated);
    onFilesChange?.(updated.map((f) => f.file));
  };

  const removeFile = (id: string) => {
    const f = files.find((f) => f.id === id);
    if (f?.preview) URL.revokeObjectURL(f.preview);
    const updated = files.filter((f) => f.id !== id);
    setFiles(updated);
    onFilesChange?.(updated.map((f) => f.file));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    addFiles(e.dataTransfer.files);
  };

  const getIcon = (type: string) => {
    if (type.startsWith('image/'))
      return <Image className="h-4 w-4 text-blue-500" />;
    return <FileText className="h-4 w-4 text-muted-foreground" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => addFiles(e.target.files)}
      />

      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="cursor-pointer rounded-lg border-2 border-dashed bg-card p-6 text-center transition-colors hover:border-gold/50 hover:bg-muted/30"
      >
        <Paperclip className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          Drag & drop or click to upload
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Images (any), PDF, DOC. Max {maxSizeMB}MB each · up to {maxFiles} files
        </p>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((f) => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-2.5"
            >
              {f.preview ? (
                <img
                  src={f.preview}
                  alt=""
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                getIcon(f.file.type)
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm">{f.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(f.file.size)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeFile(f.id)}
                className="p-1 text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
