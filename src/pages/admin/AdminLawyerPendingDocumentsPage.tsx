import { AdminLawyerDocumentRejectDialog } from '@/components/admin/AdminLawyerDocumentRejectDialog';
import {
  AdminLawyerDocumentsReviewList,
  type AdminLawyerDocumentsBusyReview,
} from '@/components/admin/AdminLawyerDocumentsReviewList';
import { FileViewer } from '@/components/FileViewer';
import { PaginationControls } from '@/components/PaginationControls';
import { LawyerDocumentsReviewSkeleton } from '@/components/skeletons/LawyerDocumentsReviewSkeleton';
import { path } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import {
  useAdminLawyerDocumentReview,
  useAdminLawyerPendingDocuments,
} from '@/hooks/useAdminLawyerDocuments';
import { AdminLayout } from '@/layouts/AdminLayout';
import { lawyerDocDisplayName } from '@/lib/lawyer-documents';
import { PAGE_SIZE } from '@/lib/mock-data';
import type {
  LawyerDocument,
  PendingLawyerDocumentListItem,
  ReviewLawyerDocumentBody,
} from '@/types';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

const AdminLawyerPendingDocumentsPage = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [activeDoc, setActiveDoc] = useState<LawyerDocument | null>(null);
  const [rejectDoc, setRejectDoc] = useState<LawyerDocument | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const { data, isLoading, isError, isFetching } =
    useAdminLawyerPendingDocuments(page);

  const docs = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const reviewMutation = useAdminLawyerDocumentReview();
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">
            Lawyer document pending reviews
          </h1>
          <p className="mt-1 text-muted-foreground">
            Pending uploads from advocates. Approve or reject with a clear
            reason.
          </p>
        </div>

        <div className="rounded-xl border bg-card shadow-sm">
          {isLoading ? (
            <LawyerDocumentsReviewSkeleton />
          ) : isError ? (
            <p className="p-8 text-center text-sm text-destructive">
              Failed to load pending documents.
            </p>
          ) : docs.length === 0 ? (
            <p className="p-8 text-center text-sm text-muted-foreground">
              No pending lawyer documents.
            </p>
          ) : (
            <>
              <div
                className={
                  isFetching ? 'pointer-events-none opacity-60' : undefined
                }
              >
                <AdminLawyerDocumentsReviewList
                  documents={docs}
                  busyReview={busyReview}
                  onView={openViewer}
                  onApprove={approve}
                  onReject={(d) => {
                    setRejectDoc(d);
                    setRejectReason('');
                  }}
                  renderMeta={(d) => {
                    const row = d as PendingLawyerDocumentListItem;
                    const name = row.lawyerProfile?.user?.fullName?.trim();
                    const lid =
                      row.lawyerProfile?.id ?? row.lawyerProfileId ?? null;
                    if (!name || !lid) return null;
                    return (
                      <Link
                        to={path.adminLawyerDocuments(lid)}
                        className="font-medium text-gold hover:underline"
                      >
                        Adv. {name}
                      </Link>
                    );
                  }}
                />
              </div>
              <div className="px-4 py-3">
                <PaginationControls
                  page={page}
                  totalPages={totalPages}
                  total={total}
                  pageSize={PAGE_SIZE}
                  onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
                  onPrev={() => setPage((p) => Math.max(p - 1, 1))}
                  onPageChange={setPage}
                />
              </div>
            </>
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

export default AdminLawyerPendingDocumentsPage;
