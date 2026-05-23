import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getFileType } from '@/lib/helpers';
import { ExternalLink } from 'lucide-react';

interface FileViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fileName: string;
  fileUrl?: string;
}

export const FileViewer = ({
  open,
  onOpenChange,
  fileName,
  fileUrl,
}: FileViewerProps) => {
  const fileType = getFileType(fileName);
  const renderContent = () => {
    if (!fileUrl)
      return (
        <p className="text-sm text-muted-foreground">No file URL provided</p>
      );

    // Images — direct render
    if (fileType === 'image') {
      return (
        <img
          src={fileUrl}
          alt={fileName}
          className="h-full w-full rounded-lg object-contain"
        />
      );
    }

    // PDF — browser native iframe
    if (fileType === 'pdf') {
      return (
        <iframe
          src={fileUrl}
          className="h-full w-full rounded-lg border"
          title={fileName}
        />
      );
    }

    // DOCX, XLSX, PPTX — Google Docs Viewer
    if (fileType === 'office') {
      return (
        <iframe
          src={`https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`}
          className="h-full w-full rounded-lg border"
          title={fileName}
        />
      );
    }

    // Unknown — fallback open in new tab
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-sm text-muted-foreground">
          Preview not available for this file type
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.open(fileUrl, '_blank')}
        >
          <ExternalLink className="mr-2 h-3.5 w-3.5" />
          Open in New Tab
        </Button>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[80vh] max-w-3xl flex-col p-0">
        <DialogHeader className="px-6 pb-2 pt-6">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="truncate text-base">{fileName}</DialogTitle>
            {fileUrl && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(fileUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden px-6 pb-6">
          {renderContent()}
        </div>
      </DialogContent>
    </Dialog>
  );
};
