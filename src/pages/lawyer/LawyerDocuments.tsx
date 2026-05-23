import { deleteLawyerDocument, getLawyerDocuments } from '@/api-client';
import { FileViewer } from '@/components/FileViewer';
import { LawyerDocumentsSkeleton } from '@/components/skeletons/LawyerDocumentsSkeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useLawyerDocumentUpload } from '@/hooks/useLawyerDocumentUpload';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { CASE_DOCUMENT_ACCEPT } from '@/lib/helpers';
import {
  extractLawyerDocumentsFromResponse,
  lawyerDocDisplayName,
} from '@/lib/lawyer-documents';
import { LAWYER_DOCUMENT_REVERIFICATION_NOTE } from '@/lib/lawyer-documents-messages';
import { MAX_SIZE_MB } from '@/lib/mock-data';
import { queryClient } from '@/lib/query-client';
import { getApiErrorMessage } from '@/lib/utils';
import type { LawyerDocument } from '@/types';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Eye, Loader2, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';

const LawyerDocuments = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<LawyerDocument | null>(null);
  const [pendingDelete, setPendingDelete] = useState<LawyerDocument | null>(
    null
  );

  const { uploadFromPicker, isUploadingLawyerDocument } =
    useLawyerDocumentUpload();

  const userId = user?.id;

  const {
    data: docs = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['lawyer-documents'],
    queryFn: async () => {
      const res = await getLawyerDocuments();
      return extractLawyerDocumentsFromResponse(res.data);
    },
    enabled: Boolean(userId),
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: removeDocument, isPending: isDeleting } = useMutation({
    mutationFn: (documentId: string) => deleteLawyerDocument(documentId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['lawyer-documents'] });
    },
  });

  const handlePick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !userId) return;

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: `Each file must be under ${MAX_SIZE_MB} MB.`,
        variant: 'destructive',
      });
      return;
    }

    await uploadFromPicker(file);
  };

  const openViewer = (d: LawyerDocument) => {
    setActiveDoc(d);
    setViewerOpen(true);
  };

  const confirmRemove = async () => {
    if (!pendingDelete) return;
    try {
      const name = lawyerDocDisplayName(pendingDelete);
      await removeDocument(pendingDelete.id);
      setPendingDelete(null);
      toast({
        title: 'Document removed',
        description: `"${name}" was deleted. ${LAWYER_DOCUMENT_REVERIFICATION_NOTE}`,
      });
    } catch (err) {
      toast({
        title: 'Delete failed',
        description: getApiErrorMessage(err),
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">Documents</h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Upload reference files and certificates. Open a row to preview.
              Your list is saved on the server.
            </p>
          </div>
          <div>
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              accept={CASE_DOCUMENT_ACCEPT}
              onChange={handlePick}
            />
            <Button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploadingLawyerDocument}
            >
              {isUploadingLawyerDocument ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Add document
            </Button>
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-sm">
          {isLoading ? (
            <LawyerDocumentsSkeleton />
          ) : isError ? (
            <p className="p-8 text-center text-sm text-destructive">
              Failed to load documents. Please try again.
            </p>
          ) : docs.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No documents yet. Use &quot;Add document&quot; to upload a file.
            </p>
          ) : (
            <ul className="divide-y">
              {docs.map((d) => (
                <li
                  key={d.id}
                  className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <button
                    type="button"
                    onClick={() => openViewer(d)}
                    className="min-w-0 flex-1 rounded-lg text-left transition-colors sm:px-2 sm:py-1"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="min-w-0 truncate font-medium">
                        {lawyerDocDisplayName(d)}
                      </p>
                      {d.isApproved ? (
                        <Badge
                          variant="secondary"
                          className="shrink-0 border-emerald-200 bg-emerald-50 text-emerald-900 hover:bg-emerald-50/90"
                        >
                          Approved
                        </Badge>
                      ) : d.rejectionReason?.trim() ? (
                        <Badge variant="destructive" className="shrink-0">
                          Rejected
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="shrink-0 border-amber-200 bg-amber-50 text-amber-950 hover:bg-amber-50/90"
                        >
                          Pending review
                        </Badge>
                      )}
                    </div>
                    {d.createdAt ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Added {new Date(d.createdAt).toLocaleString('en-IN')}
                      </p>
                    ) : null}
                    {d.rejectionReason?.trim() ? (
                      <p className="mt-1 text-xs text-destructive">
                        {d.rejectionReason.trim()}
                      </p>
                    ) : null}
                  </button>
                  <div className="flex shrink-0 items-center gap-2 sm:pl-4">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openViewer(d)}
                    >
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      disabled={isDeleting}
                      onClick={() => setPendingDelete(d)}
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                      Delete
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {activeDoc && (
        <FileViewer
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          fileName={
            (activeDoc.assetName && String(activeDoc.assetName).trim()) ||
            'document'
          }
          fileUrl={activeDoc.assetUrl}
        />
      )}

      <AlertDialog
        open={pendingDelete !== null}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove document?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <span>
                This permanently removes &quot;
                {pendingDelete ? lawyerDocDisplayName(pendingDelete) : ''}
                &quot; from your documents.
              </span>
              <span className="block text-muted-foreground">
                {LAWYER_DOCUMENT_REVERIFICATION_NOTE}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                void confirmRemove();
              }}
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Remove'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
};

export default LawyerDocuments;
