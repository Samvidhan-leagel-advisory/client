import { getAdminCaseDocuments, getCaseDocuments } from '@/api-client';
import { DocumentList } from '@/components/DocumentList';
import { PaginationControls } from '@/components/PaginationControls';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { buildGenericQueryParams } from '@/lib/helpers';
import { CaseStatus } from '@/types';
import { keepPreviousData, QueryKey, useQuery } from '@tanstack/react-query';
import { Loader2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export interface CaseDocumentsContentProps {
  caseClientName?: string;
  caseLawyerName?: string;
  loading?: boolean;
  isAdmin?: boolean;
  caseStatus?: CaseStatus;
  onUploadClick?: (queryKey: QueryKey) => void;
  previewMode?: boolean;
  previewLimit?: number;
  onViewAllClick?: () => void;
  onDocumentCountChange?: (total: number) => void;
  showUploadInHeader?: boolean;
}

export function CaseDocumentsContent({
  caseClientName,
  caseLawyerName,
  loading,
  isAdmin,
  caseStatus,
  onUploadClick,
  previewMode = false,
  previewLimit = 5,
  onViewAllClick,
  onDocumentCountChange,
  showUploadInHeader = false,
}: CaseDocumentsContentProps) {
  const { id } = useParams();
  const { toast } = useToast();
  const [page, setPage] = useState(1);

  const queryKey = isAdmin
    ? ['admin-case-documents', id, page]
    : ['case-documents', id, page];

  const queryFn = isAdmin ? getAdminCaseDocuments : getCaseDocuments;

  const { data } = useQuery({
    queryKey,
    queryFn: async () => {
      if (previewMode) {
        const params = buildGenericQueryParams(1, previewLimit);
        const response = await queryFn(id, params);
        return response.data;
      }
      const params = buildGenericQueryParams(page);
      const response = await queryFn(id, params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const documents = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  useEffect(() => {
    if (onDocumentCountChange) {
      onDocumentCountChange(total);
    }
  }, [total, onDocumentCountChange]);

  const isCaseClosed = caseStatus === 'closed' || caseStatus === 'rejected';

  return (
    <div className="flex flex-1 flex-col">
      {previewMode ? (
        <div className="flex-1">
          {documents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No documents uploaded yet.
            </p>
          ) : (
            <DocumentList
              documents={documents}
              caseClientName={caseClientName}
              caseLawyerName={caseLawyerName}
            />
          )}
        </div>
      ) : (
        <div className="scrollbar-hide min-h-0 flex-1 overflow-y-auto py-1">
          {documents.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No documents uploaded yet.
            </p>
          ) : (
            <DocumentList
              documents={documents}
              caseClientName={caseClientName}
              caseLawyerName={caseLawyerName}
            />
          )}
        </div>
      )}

      <div className="shrink-0 pt-4">
        {!previewMode && (
          <PaginationControls
            page={page}
            totalPages={totalPages}
            total={total}
            onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
            onPrev={() => setPage((p) => Math.max(p - 1, 1))}
            onPageChange={setPage}
            className="pt-0"
          />
        )}
        {!showUploadInHeader && (
          <div className={`flex gap-2 ${previewMode ? 'mt-0' : 'mt-3'}`}>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                if (onUploadClick) onUploadClick(queryKey);
              }}
              disabled={loading || isCaseClosed}
            >
              {loading ? (
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
              ) : (
                <Upload className="mr-1.5 h-3.5 w-3.5" />
              )}
              Upload Document
            </Button>
          </div>
        )}
        {previewMode && total > previewLimit && (
          <Button
            variant="outline"
            className={`w-full ${showUploadInHeader ? 'mt-0' : 'mt-2'}`}
            onClick={onViewAllClick}
          >
            Show More ({total - previewLimit} more)
          </Button>
        )}
      </div>
    </div>
  );
}
