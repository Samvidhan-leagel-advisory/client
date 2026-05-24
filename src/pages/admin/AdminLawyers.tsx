import { getAdminLawyerVerifications, verifyAdminLawyer } from '@/api-client';
import { GenericTooltip } from '@/components/GenericTooltip';
import { PaginationControls } from '@/components/PaginationControls';
import { PracticeAreaBadge } from '@/components/StatusBadge';
import { LawyerFormModal } from '@/components/admin/LawyerFormModal';
import { CasesTableSkeleton } from '@/components/skeletons/CasesTableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { path } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { AdminLayout } from '@/layouts/AdminLayout';
import { calculateYearsOfExperience } from '@/lib/helpers';
import { PAGE_SIZE } from '@/lib/mock-data';
import { queryClient } from '@/lib/query-client';
import { LawyerListItem, LawyersListResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { CheckCircle, Edit, Loader2, Search, UserPlus, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const buildQueryParams = (page: number, search: string) => {
  const params: Record<string, string | number> = {
    page,
    limit: PAGE_SIZE,
    orderBy: 'createdAt',
    order: 'DESC',
  };
  if (search.trim()) params.search = search.trim();
  return params;
};

type PendingVerification = { lawyerId: string };

const AdminLawyers = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLawyer, setEditingLawyer] = useState<LawyerListItem | null>(
    null
  );
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);
  const [pendingVerification, setPendingVerification] =
    useState<PendingVerification | null>(null);

  const { data, isFetching } = useQuery<LawyersListResponse>({
    queryKey: ['admin-lawyers', page, debouncedSearch],
    queryFn: async () => {
      const params = buildQueryParams(page, debouncedSearch);
      const response = await getAdminLawyerVerifications(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleUpdateLawyerVerification = async (
    lawyerId: string,
    isVerified: boolean,
    lawyerName: string
  ) => {
    setPendingVerification({ lawyerId });
    try {
      await verifyAdminLawyer(lawyerId, { verified: isVerified });
      toast({
        title: isVerified ? 'Lawyer verified' : 'Verification removed',
        description: isVerified
          ? `${lawyerName} is now marked as verified.`
          : `${lawyerName} is no longer marked as verified.`,
      });
      await queryClient.invalidateQueries({ queryKey: ['admin-lawyers'] });
    } catch (error) {
      toast({
        title: 'Could not update verification',
        description:
          error instanceof Error ? error.message : 'Something went wrong.',
        variant: 'destructive',
      });
    } finally {
      setPendingVerification(null);
    }
  };

  const lawyers = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Lawyer Management</h1>
            <p className="mt-1 text-muted-foreground">
              Verify, onboard, and manage lawyers.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingLawyer(null);
              setModalOpen(true);
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add Lawyer
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search lawyers..."
            className="pl-9"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>

        <div className="overflow-x-auto rounded-xl border bg-card">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Avatar
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Name
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Specialization
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Phone
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Bar Council ID
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Verified
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {lawyers.length === 0 && !isFetching && (
                <tr>
                  <td
                    colSpan={7}
                    className="py-4 text-center text-muted-foreground"
                  >
                    No lawyers found
                  </td>
                </tr>
              )}
              {!isFetching &&
                lawyers.length > 0 &&
                lawyers.map((l) => {
                  const rowBusy =
                    pendingVerification !== null &&
                    pendingVerification.lawyerId === l.id;

                  return (
                    <tr
                      key={l.id}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="px-4 py-3">
                        <Link
                          to={path.adminLawyer(l.id)}
                          aria-label={`View ${l.user?.fullName ?? 'lawyer'}`}
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold/20 text-sm font-bold text-gold ring-offset-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                        >
                          {l.user?.avatarUrl ? (
                            <img
                              src={l.user.avatarUrl}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span aria-hidden>
                              {l.user?.fullName?.charAt(0).toUpperCase() ??
                                '?'}
                            </span>
                          )}
                        </Link>
                      </td>
                      <td className="max-w-[160px] px-4 py-3">
                        <div className="min-w-0">
                          <GenericTooltip
                            content={l.user?.fullName}
                            side="bottom"
                            className="min-w-0"
                          >
                            <Link
                              to={path.adminLawyer(l.id)}
                              className="block truncate font-medium hover:text-gold hover:underline"
                            >
                              {l.user?.fullName}
                            </Link>
                          </GenericTooltip>
                          <p className="text-xs text-muted-foreground">
                            {calculateYearsOfExperience(l?.careerStartDate)}
                          </p>
                        </div>
                      </td>
                      <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                        {l.lawyerPracticeAreas.slice(0, 2).map((s, i) => (
                          <>
                            <PracticeAreaBadge
                              key={s.practiceArea?.id}
                              practiceArea={s.practiceArea?.name || '-'}
                            />
                            <span className="mr-1 text-xs text-muted-foreground"></span>
                          </>
                        ))}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {l.user?.phone ? `+91-${l.user.phone}` : '-'}
                      </td>
                      <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">
                        {l.barCouncilId}
                      </td>
                      <td className="px-4 py-3">
                        {l?.isVerified ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <X className="h-4 w-4 text-red-600" />
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-3">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingLawyer(l);
                              setModalOpen(true);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant={l.isVerified ? 'outline' : 'secondary'}
                            size="sm"
                            disabled={rowBusy}
                            onClick={() =>
                              handleUpdateLawyerVerification(
                                l.id,
                                !l.isVerified,
                                l.user?.fullName ?? 'Lawyer'
                              )
                            }
                          >
                            {rowBusy ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : l.isVerified ? (
                              'Unverify'
                            ) : (
                              'Verify'
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {isFetching && <CasesTableSkeleton />}
            </tbody>
          </table>
        </div>
        <LawyerFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          lawyer={editingLawyer as LawyerListItem}
          onSave={(data, message) => {
            toast({
              title:
                message ||
                `${data.name} has been ${editingLawyer ? 'updated' : 'added'}.`,
            });
            setModalOpen(false);
          }}
        />
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
    </AdminLayout>
  );
};

export default AdminLawyers;
