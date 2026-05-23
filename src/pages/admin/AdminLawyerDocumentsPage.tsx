import { AdminLawyerDocumentRejectDialog } from '@/components/admin/AdminLawyerDocumentRejectDialog';
import {
  AdminLawyerDocumentsReviewList,
  type AdminLawyerDocumentsBusyReview,
} from '@/components/admin/AdminLawyerDocumentsReviewList';
import { FileViewer } from '@/components/FileViewer';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminLawyerDocumentReview,
  useAdminLawyerDocumentsList,
} from '@/hooks/useAdminLawyerDocuments';
import { AdminLayout } from '@/layouts/AdminLayout';
import { lawyerDocDisplayName } from '@/lib/lawyer-documents';
import type { LawyerDocument, ReviewLawyerDocumentBody } from '@/types';
import { Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

const AdminLawyerDocumentsPage = () => {
  const { id: lawyerId } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<LawyerDocument | null>(null);
  const [rejectDoc, setRejectDoc] = useState<LawyerDocument | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const {
    data: docs = [],
    isLoading,
    isError,
  } = useAdminLawyerDocumentsList(lawyerId);

  const reviewMutation = useAdminLawyerDocumentReview(lawyerId);
  const busyId = reviewMutation.variables?.documentId;
  const isBusy = reviewMutation.isPending;

  const busyReview: AdminLawyerDocumentsBusyReview = useMemo(() => {
    if (!isBusy || !reviewMutation.variables) return null;
    return {
      documentId: reviewMutation.variables.documentId,
      isApprove: reviewMutation.variables.body.isApproved,
    };
  }, [isBusy, reviewMutation.variables]);

  const openViewer = (d: LawyerDocument) => {
    setActiveDoc(d);
    setViewerOpen(true);
  };

  const approve = (d: LawyerDocument) => {
    const body: ReviewLawyerDocumentBody = {
      isApproved: true,
      rejectionReason: null,
    };
    reviewMutation.mutate({ documentId: d.id, body });
  };

  const submitReject = () => {
    if (!rejectDoc) return;
    const trimmed = rejectReason.trim();
    if (!trimmed) {
      toast({
        title: 'Reason required',
        description: 'Please enter a short reason the lawyer can act on.',
        variant: 'destructive',
      });
      return;
    }
    const body: ReviewLawyerDocumentBody = {
      isApproved: false,
      rejectionReason: trimmed,
    };
    reviewMutation.mutate(
      { documentId: rejectDoc.id, body },
      {
        onSuccess: () => {
          setRejectDoc(null);
          setRejectReason('');
        },
      }
    );
  };

  const dialogRejectBusy =
    isBusy &&
    rejectDoc &&
    busyId === rejectDoc.id &&
    reviewMutation.variables?.body.isApproved === false;

  if (!lawyerId) {
    return (
      <AdminLayout>
        <p className="text-sm text-muted-foreground">Invalid lawyer.</p>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="mt-10 space-y-6">
        <div className="rounded-xl border bg-card shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 p-12 text-sm text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-gold" />
              <span>Loading documents…</span>
            </div>
          ) : isError ? (
            <p className="p-8 text-center text-sm text-destructive">
              Failed to load documents. Please try again.
            </p>
          ) : docs.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No documents uploaded yet.
            </p>
          ) : (
            <AdminLawyerDocumentsReviewList
              documents={docs}
              busyReview={busyReview}
              onView={openViewer}
              onApprove={approve}
              onReject={(d) => {
                setRejectDoc(d);
                setRejectReason('');
              }}
            />
          )}
        </div>
      </div>

      {activeDoc ? (
        <FileViewer
          open={viewerOpen}
          onOpenChange={(open) => {
            setViewerOpen(open);
            if (!open) setActiveDoc(null);
          }}
          fileName={lawyerDocDisplayName(activeDoc)}
          fileUrl={activeDoc.assetUrl}
        />
      ) : null}

      <AdminLawyerDocumentRejectDialog
        open={rejectDoc !== null}
        fileLabel={rejectDoc ? lawyerDocDisplayName(rejectDoc) : ''}
        reason={rejectReason}
        onReasonChange={setRejectReason}
        onOpenChange={(open) => {
          if (!open) {
            setRejectDoc(null);
            setRejectReason('');
          }
        }}
        onCancel={() => {
          setRejectDoc(null);
          setRejectReason('');
        }}
        onSubmit={submitReject}
        isSubmitting={Boolean(dialogRejectBusy)}
      />
    </AdminLayout>
  );
};

export default AdminLawyerDocumentsPage;
