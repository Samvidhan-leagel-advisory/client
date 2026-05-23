import {
  getAdminLawyerVerifications,
  updateLawyerRoleStatus,
} from '@/api-client';
import { path } from '@/constants';
import { PaginationControls } from '@/components/PaginationControls';
import { PracticeAreaBadge } from '@/components/StatusBadge';
import { CasesTableSkeleton } from '@/components/skeletons/CasesTableSkeleton';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PAGE_SIZE } from '@/lib/mock-data';
import { queryClient } from '@/lib/query-client';
import { LawyersListResponse } from '@/types';
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
  params.roleStatus = 'pending';
  return params;
};

type PendingAction = { lawyerId: string; kind: 'approve' | 'reject' };

const AdminLawyerVerifications = () => {
  const { toast } = useToast();
  const [pending, setPending] = useState<PendingAction | null>(null);

  const [page, setPage] = useState(1);

  const { data, isFetching } = useQuery<LawyersListResponse>({
    queryKey: ['admin-lawyer-verifications', page],
    queryFn: async () => {
      const params = buildQueryParams(page);
      const response = await getAdminLawyerVerifications(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const lawyers = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  const handleUpdateLawyerRoleStatus = async (
    lawyerId: string,
    userId: string,
    roleCode: string,
    status: string
  ) => {
    const kind = status === 'active' ? 'approve' : 'reject';
    setPending({ lawyerId, kind });
    try {
      await updateLawyerRoleStatus(userId, roleCode, status);
      toast({
        title: 'Lawyer Role Status Updated',
        description: `${userId} has been updated to ${status}.`,
      });
      await queryClient.invalidateQueries({
        queryKey: ['admin-lawyer-verifications', page],
      });
    } catch (error) {
      toast({
        title: 'Error Updating Lawyer Role Status',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setPending(null);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Lawyer Verifications</h1>
          <p className="mt-1 text-muted-foreground">
            Review and verify new lawyer registrations.
          </p>
        </div>

        {!isFetching && lawyers.length === 0 ? (
          <div className="rounded-xl border bg-card p-8 text-center">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
            <p className="font-medium">All caught up!</p>
            <p className="mt-1 text-sm text-muted-foreground">
              No pending lawyer verifications.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto rounded-xl border bg-card">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                      Specialization
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                      Bar Council ID
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                      Experience
                    </th>
                    <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                      Applied On
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {!isFetching &&
                    lawyers.map((l) => {
                      const rowBusy =
                        pending !== null && pending.lawyerId === l.id;
                      const approving = rowBusy && pending?.kind === 'approve';
                      const rejecting = rowBusy && pending?.kind === 'reject';
                      return (
                        <tr
                          key={l.id}
                          className="border-b last:border-0 hover:bg-muted/30"
                        >
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{l.user?.fullName}</p>
                              <p className="text-xs text-muted-foreground">
                                {l.user?.email || '-'}
                              </p>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                            {l.lawyerPracticeAreas.slice(0, 2).map((s, i) => (
                              <PracticeAreaBadge
                                key={s.practiceArea?.id}
                                practiceArea={s.practiceArea?.name || '-'}
                              />
                            ))}
                          </td>
                          <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                            {l.barCouncilId || '-'}
                          </td>
                          <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                            {/* {l.experience} yrs */}
                            10 yrs
                          </td>
                          <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                            {new Date(l.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-green-200 text-xs text-green-600 hover:bg-green-50"
                                disabled={rowBusy}
                                onClick={() =>
                                  handleUpdateLawyerRoleStatus(
                                    l.id,
                                    l.user?.id,
                                    'lawyer',
                                    'active'
                                  )
                                }
                              >
                                {approving ? (
                                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle className="mr-1 h-3.5 w-3.5" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 border-destructive/20 text-xs text-destructive hover:bg-destructive/5"
                                disabled={rowBusy}
                                onClick={() =>
                                  handleUpdateLawyerRoleStatus(
                                    l.id,
                                    l.user?.id,
                                    'lawyer',
                                    'rejected'
                                  )
                                }
                              >
                                {rejecting ? (
                                  <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <XCircle className="mr-1 h-3.5 w-3.5" />
                                )}
                                Reject
                              </Button>
                              <Link to={path.adminLawyer(l.id)}>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 text-xs"
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  {isFetching && <CasesTableSkeleton />}
                </tbody>
              </table>
            </div>
            <PaginationControls
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={PAGE_SIZE}
              onNext={() => setPage((p) => Math.min(p + 1, totalPages))}
              onPrev={() => setPage((p) => Math.max(p - 1, 1))}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminLawyerVerifications;
