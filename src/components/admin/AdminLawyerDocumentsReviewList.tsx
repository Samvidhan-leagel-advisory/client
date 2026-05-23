import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { lawyerDocDisplayName } from '@/lib/lawyer-documents';
import type { LawyerDocument } from '@/types';
import { Check, Eye, Loader2, X } from 'lucide-react';
import type { ReactNode } from 'react';

export type AdminLawyerDocumentsBusyReview = {
  documentId: string;
  isApprove: boolean;
} | null;

export interface AdminLawyerDocumentsReviewListProps {
  documents: LawyerDocument[];
  busyReview: AdminLawyerDocumentsBusyReview;
  onView: (doc: LawyerDocument) => void;
  onApprove: (doc: LawyerDocument) => void;
  onReject: (doc: LawyerDocument) => void;
  renderMeta?: (doc: LawyerDocument) => ReactNode;
}

export function AdminLawyerDocumentsReviewList({
  documents,
  busyReview,
  onView,
  onApprove,
  onReject,
  renderMeta,
}: AdminLawyerDocumentsReviewListProps) {
  return (
    <ul className="divide-y">
      {documents.map((d) => {
        const rowBusy = busyReview !== null && busyReview.documentId === d.id;
        const isRejected = Boolean(d.rejectionReason?.trim());
        const canReview = !d.isApproved && !isRejected;
        const approveSpin =
          rowBusy && busyReview !== null && busyReview.isApprove;
        const rejectSpin =
          rowBusy && busyReview !== null && !busyReview.isApprove;

        return (
          <li
            key={d.id}
            className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <button
              type="button"
              onClick={() => onView(d)}
              className="min-w-0 flex-1 rounded-lg text-left transition-colors hover:bg-muted/60 sm:px-2 sm:py-1"
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
              {renderMeta ? (
                <div className="mt-1 text-xs text-muted-foreground">
                  {renderMeta(d)}
                </div>
              ) : null}
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
            <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pl-4">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onView(d)}
              >
                <Eye className="mr-1.5 h-3.5 w-3.5" />
                View
              </Button>
              {canReview ? (
                <>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-600/90"
                    disabled={rowBusy}
                    onClick={() => onApprove(d)}
                  >
                    {approveSpin ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Check className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Approve
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    disabled={rowBusy}
                    onClick={() => onReject(d)}
                  >
                    {rejectSpin ? (
                      <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <X className="mr-1.5 h-3.5 w-3.5" />
                    )}
                    Reject
                  </Button>
                </>
              ) : null}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
