import { getAdminCaseRequests } from '@/api-client';
import { CaseCodeText } from '@/components/CaseCodeText';
import { CaseDescriptionModal } from '@/components/CaseDescriptionModal';
import { GenericTooltip } from '@/components/GenericTooltip';
import { PaginationControls } from '@/components/PaginationControls';
import { StatusBadge } from '@/components/StatusBadge';
import { CaseCardSkeleton } from '@/components/skeletons/CaseCardSkeleton';
import { Button } from '@/components/ui/button';
import { path } from '@/constants';
import { useAdminCaseMutations } from '@/hooks/useAdminCaseMutations';
import { AdminLayout } from '@/layouts/AdminLayout';
import { splitWords, truncateToWords } from '@/lib/caseDescriptionPreview';
import { PAGE_SIZE } from '@/lib/mock-data';
import { CaseStatus, CasesResponse, LEGAL_CATEGORIES } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CheckCircle, Eye, Loader2, XCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const buildQueryParams = (page: number) => {
  const params: Record<string, string | number> = {
    page,
    limit: PAGE_SIZE,
    orderBy: 'createdAt',
    order: 'DESC',
  };
  params.status = 'new';
  return params;
};

const AdminCaseRequests = () => {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<{
    caseId: string | null;
    action: 'accept' | 'reject' | null;
  }>({
    caseId: null,
    action: null,
  });
  const { updateCaseStatusForCase } = useAdminCaseMutations(undefined, {
    additionalInvalidationKeys: [['case-requests', page]],
  });
  const [descriptionModal, setDescriptionModal] = useState<{
    open: boolean;
    title: string;
    description: string;
  }>({ open: false, title: '', description: '' });

  const { data, isFetching } = useQuery<CasesResponse>({
    queryKey: ['case-requests', page],
    queryFn: async () => {
      const params = buildQueryParams(page);
      const response = await getAdminCaseRequests(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const cases = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const handleUpdateAdminCaseStatus = async (
    caseId: string,
    status: CaseStatus
  ) => {
    const action = status === 'under_review' ? 'accept' : 'reject';
    setLoading({
      caseId,
      action,
    });
    try {
      await updateCaseStatusForCase(caseId, status);
    } finally {
      setLoading({ caseId: null, action: null });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">New Case Requests</h1>
          <p className="mt-1 text-muted-foreground">
            Review and approve incoming case requests from users.
          </p>
        </div>

        {isFetching && <CaseCardSkeleton />}

        {!isFetching && cases?.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No new case requests at the moment.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {!isFetching &&
              cases?.map((c) => {
                const isAcceptLoading =
                  loading.caseId === c.id && loading.action === 'accept';
                const isRejectLoading =
                  loading.caseId === c.id && loading.action === 'reject';
                const isRowLoading = loading.caseId === c.id;
                return (
                  <div key={c.id} className="rounded-xl border bg-card p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <CaseCodeText className="text-xs text-muted-foreground">
                            {c.caseCode}
                          </CaseCodeText>
                          <StatusBadge status={c.status} />
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                              c.isEmergency
                                ? 'bg-destructive/10 text-destructive'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {c.isEmergency ? 'Emergency' : 'Normal Priority'}
                          </span>
                        </div>
                        <GenericTooltip content={c.title} side="bottom" className="min-w-0">
                          <h3 className="line-clamp-2 min-w-0 break-words font-semibold">
                            {c.title}
                          </h3>
                        </GenericTooltip>
                        {c.description?.trim() &&
                        splitWords(c.description).length > 50 ? (
                          <button
                            type="button"
                            className="group mt-0.5 w-full rounded-md text-left text-sm leading-relaxed text-foreground/90 transition-colors hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                            onClick={() =>
                              setDescriptionModal({
                                open: true,
                                title: c.title,
                                description: c.description!,
                              })
                            }
                          >
                            <span className="block whitespace-pre-wrap">
                              {truncateToWords(c.description, 50)}
                            </span>
                            <span className="mt-3 block border-t border-border/60 pt-3 text-xs text-muted-foreground hover:text-gold">
                              Show full description
                            </span>
                          </button>
                        ) : (
                          <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                            {c.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                          <span>
                            By:{' '}
                            <span className="font-medium text-foreground">
                              {c.user?.fullName}
                            </span>
                          </span>
                          <span>{LEGAL_CATEGORIES[c.practiceArea?.name]}</span>
                          <span>
                            {new Date(c.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={path.adminCase(c.id)}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateAdminCaseStatus(c.id, 'under_review')
                          }
                          disabled={isRowLoading}
                        >
                          {isAcceptLoading ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleUpdateAdminCaseStatus(c.id, 'rejected')
                          }
                          disabled={isRowLoading}
                        >
                          {isRejectLoading ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
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
        )}
      </div>

      <CaseDescriptionModal
        open={descriptionModal.open}
        onOpenChange={(open) =>
          setDescriptionModal((prev) => ({ ...prev, open }))
        }
        caseTitle={descriptionModal.title}
        description={descriptionModal.description}
      />
    </AdminLayout>
  );
};

export default AdminCaseRequests;
