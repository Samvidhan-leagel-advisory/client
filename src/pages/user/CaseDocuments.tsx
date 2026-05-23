import { getCaseDetails, getCaseDocuments } from '@/api-client';
import { AdminCaseDocumentCard } from '@/components/admin/AdminCaseDocumentCard';
import { FileViewer } from '@/components/FileViewer';
import { PaginationControls } from '@/components/PaginationControls';
import { CaseDetailSkeleton } from '@/components/skeletons/CaseDetailSkeleton';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { path } from '@/constants';
import { useCaseDocumentUpload } from '@/hooks/useCaseDocumentUpload';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { caseDocumentDisplayName } from '@/lib/case-document-utils';
import { buildGenericQueryParams, CASE_DOCUMENT_ACCEPT, getCookie } from '@/lib/helpers';
import { queryClient } from '@/lib/query-client';
import { CaseDocument } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { ArrowLeft, Loader2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

function UploadToolbarButton({
  disabled,
  busy,
  onClick,
}: {
  disabled: boolean;
  busy: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      size="sm"
      className="shrink-0 gap-1.5"
      disabled={disabled}
      onClick={onClick}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Upload className="h-3.5 w-3.5" />
      )}
      Upload
    </Button>
  );
}

const CaseDocuments = () => {
  const { id } = useParams();
  const activeRole = getCookie('x-active-role');
  const isLawyer = activeRole === 'lawyer';
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const [page, setPage] = useState(1);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<CaseDocument | null>(null);

  const { data: caseData, isLoading: isCaseLoading } = useQuery({
    queryKey: ['case-details', id],
    queryFn: async () => {
      const response = await getCaseDetails(id);
      return response.data;
    },
    refetchOnWindowFocus: false,
  });

  const { isUploadingDocument, uploadFromSource } = useCaseDocumentUpload(
    id,
    isLawyer ? 'lawyer' : 'user'
  );

  const backLink = path.caseDetail(id || '');

  const documentsQueryKey = ['case-documents', id, page] as const;
  const { data: documentsData, isLoading: isDocumentsLoading } = useQuery({
    queryKey: documentsQueryKey,
    queryFn: async () => {
      const params = buildGenericQueryParams(page, 30);
      const response = await getCaseDocuments(id, params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const documents = documentsData?.data ?? [];
  const pagination = documentsData?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const uploadDisabled =
    isUploadingDocument ||
    caseData?.status === 'closed' ||
    caseData?.status === 'rejected';

  const triggerUpload = () => {
    if (uploadDisabled) return;
    uploadInputRef.current?.click();
  };

  const handleUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadFromSource(file, 'Documents page');
    await queryClient.invalidateQueries({ queryKey: documentsQueryKey });
  };

  if (isCaseLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-0 flex-1 flex-col gap-4">
          <CaseDetailSkeleton isLawyer={isLawyer} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border bg-card px-4 py-2.5 sm:px-5">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
              asChild
            >
              <Link to={backLink} aria-label="Back to case">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>

            <h1 className="truncate text-sm font-semibold leading-none text-foreground">
              Case documents
            </h1>
          </div>

          <UploadToolbarButton
            disabled={uploadDisabled}
            busy={isUploadingDocument}
            onClick={triggerUpload}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4 sm:p-5">
            {isDocumentsLoading ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6">
                {Array.from({ length: 12 }).map((_, idx) => (
                  <div
                    key={`document-skeleton-${idx}`}
                    className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
                  >
                    <Skeleton className="aspect-square w-full rounded-none" />
                    <div className="space-y-1 border-t border-border p-2">
                      <Skeleton className="h-3 w-[85%]" />
                      <Skeleton className="h-3 w-[55%]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : documents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                  Nothing uploaded for this case yet.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={isUploadingDocument}
                  onClick={triggerUpload}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6">
                {documents.map((document) => (
                  <AdminCaseDocumentCard
                    key={document.id}
                    document={document}
                    onView={(doc) => {
                      setSelectedDoc(doc);
                      setViewerOpen(true);
                    }}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 pt-3">
              <PaginationControls
                page={page}
                totalPages={totalPages}
                total={total}
                onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
                onPrev={() => setPage((p) => Math.max(p - 1, 1))}
                onPageChange={setPage}
              />
            </div>
          </div>
        </div>

        <input
          ref={uploadInputRef}
          type="file"
          accept={CASE_DOCUMENT_ACCEPT}
          className="hidden"
          onChange={handleUploadChange}
        />

        {selectedDoc && (
          <FileViewer
            open={viewerOpen}
            onOpenChange={setViewerOpen}
            fileName={caseDocumentDisplayName(selectedDoc)}
            fileUrl={selectedDoc.assetUrl}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default CaseDocuments;
