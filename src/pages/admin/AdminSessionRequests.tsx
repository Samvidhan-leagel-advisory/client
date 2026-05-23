import {
  getAdminSessionRequests,
  updateCaseSessionRequestStatus,
} from '@/api-client';
import { CaseCodeText } from '@/components/CaseCodeText';
import { PaginationControls } from '@/components/PaginationControls';
import { CaseCardSkeleton } from '@/components/skeletons/CaseCardSkeleton';
import { Button } from '@/components/ui/button';
import { path } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/layouts/AdminLayout';
import { getFirstLetterCapitalized } from '@/lib/helpers';
import { PAGE_SIZE } from '@/lib/mock-data';
import { queryClient } from '@/lib/query-client';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  CheckCircle,
  Eye,
  Loader2,
  MessageSquare,
  Phone,
  Video,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
const typeIcons = { video: Video, phone: Phone, chat: MessageSquare };

export const buildSessionRequestsQueryParams = (page: number) => {
  const params: Record<string, string | number> = {
    page,
    limit: PAGE_SIZE,
    orderBy: 'createdAt',
    order: 'DESC',
  };

  return params;
};

const AdminSessionRequests = () => {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<{
    sessionRequestId: string | null;
    action: 'accept' | 'reject' | null;
  }>({
    sessionRequestId: null,
    action: null,
  });

  const { data, isFetching } = useQuery({
    queryKey: ['session-requests', page],
    queryFn: async () => {
      const params = buildSessionRequestsQueryParams(page);
      const response = await getAdminSessionRequests(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const sessionRequests = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const handleUpdateSessionRequestStatus = async (
    sessionRequestId: string,
    status: 'accepted' | 'rejected',
    caseCode?: string
  ) => {
    const action = status === 'accepted' ? 'accept' : 'reject';
    setLoading({
      sessionRequestId,
      action,
    });

    try {
      await updateCaseSessionRequestStatus(sessionRequestId, status);
      toast({
        title: status === 'accepted' ? 'Session Approved' : 'Session Rejected',
        description:
          status === 'accepted'
            ? `Session for ${caseCode ?? 'this case'} approved.`
            : `Session request for ${caseCode ?? 'this case'} has been rejected.`,
      });

      await queryClient.invalidateQueries({
        queryKey: ['session-requests', page],
      });
    } catch (error) {
      toast({
        title: 'Error Updating Session Request',
        description:
          error?.message || 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading({ sessionRequestId: null, action: null });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Session Booking Requests</h1>
          <p className="mt-1 text-muted-foreground">
            Review and approve consultation session requests from users.
          </p>
        </div>

        {isFetching && <CaseCardSkeleton />}

        {!isFetching && sessionRequests.length === 0 ? (
          <div className="rounded-xl border bg-card p-12 text-center">
            <p className="text-muted-foreground">
              No pending session requests.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {!isFetching &&
              sessionRequests.map((req) => {
                const Icon =
                  typeIcons[req?.callType as keyof typeof typeIcons] || Video;
                const isAcceptLoading =
                  loading.sessionRequestId === req.id &&
                  loading.action === 'accept';
                const isRejectLoading =
                  loading.sessionRequestId === req.id &&
                  loading.action === 'reject';
                const isRowLoading = loading.sessionRequestId === req.id;

                const isDisabled =
                  isRowLoading ||
                  ['accepted', 'rejected'].includes(req?.status);
                return (
                  <div key={req.id} className="rounded-xl border bg-card p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <Link
                            to={path.adminCase(req?.case?.id ?? '')}
                            className="hover:text-gold hover:underline"
                          >
                            <CaseCodeText className="text-xs text-muted-foreground">
                              {req?.case?.caseCode}
                            </CaseCodeText>
                          </Link>
                          <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
                            <Icon className="h-3 w-3" />
                            {req?.callType}
                          </span>
                          <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                            {getFirstLetterCapitalized(req?.status)}
                          </span>
                        </div>
                        <div className="mt-1 space-y-0.5 text-sm">
                          <p>
                            <span className="text-muted-foreground">User:</span>{' '}
                            <span className="font-medium">
                              {req.case?.user?.fullName}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Lawyer:
                            </span>{' '}
                            <span className="font-medium">
                              {req.case?.assignedLawyer?.user?.fullName}
                            </span>
                          </p>
                          <p>
                            <span className="text-muted-foreground">
                              Requested on:
                            </span>{' '}
                            {new Date(req?.createdAt).toLocaleDateString(
                              'en-IN'
                            )}
                          </p>
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          disabled={isDisabled}
                        >
                          <Link to={path.adminCase(req?.case?.id ?? '')}>
                            <Eye className="mr-1.5 h-3.5 w-3.5" />
                            View Case
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          onClick={() =>
                            handleUpdateSessionRequestStatus(
                              req.id,
                              'accepted',
                              req?.case?.caseCode
                            )
                          }
                          disabled={isDisabled}
                        >
                          {isAcceptLoading ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() =>
                            handleUpdateSessionRequestStatus(
                              req.id,
                              'rejected',
                              req?.case?.caseCode
                            )
                          }
                          disabled={isDisabled}
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
          </div>
        )}
        <PaginationControls
          page={page}
          totalPages={totalPages}
          total={total}
          onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
          onPrev={() => setPage((p) => Math.max(p - 1, 1))}
          onPageChange={setPage}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminSessionRequests;
