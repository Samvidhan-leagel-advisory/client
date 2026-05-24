import { getAdminUserCases, getAdminUserDetails } from '@/api-client';
import { Button } from '@/components/ui/button';
import { ActiveSubscriptionCard } from '@/components/user/ActiveSubscriptionCard';
import { UserCasesTable } from '@/components/user/UserCasesTable';
import { UserPaymentsTable } from '@/components/user/UserPaymentsTable';
import WithShimmer from '@/components/WithShimmer';
import { path } from '@/constants';
import { useAdminPayments } from '@/hooks/useAdminPayments';
import { useDebounce } from '@/hooks/useDebounce';
import { useUserActiveSubscription } from '@/hooks/useUserActiveSubscription';
import { AdminLayout } from '@/layouts/AdminLayout';
import { CasesResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Calendar, Mail, Phone, Plus } from 'lucide-react';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { buildUserCasesQueryParams } from '../user/UserCases';

const AdminUserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: userData, isLoading } = useQuery({
    queryKey: ['adminUserDetails', id],
    queryFn: async () => {
      const response = await getAdminUserDetails(id);
      return response.data;
    },
    enabled: Boolean(id),
  });

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const debouncedSearch = useDebounce(search, 500);

  const { data, isFetching, isError } = useQuery<CasesResponse>({
    queryKey: ['adminUserCases', id, page, debouncedSearch, statusFilter],
    queryFn: async () => {
      const params = buildUserCasesQueryParams(
        page,
        debouncedSearch,
        statusFilter
      );
      const response = await getAdminUserCases(id, params);
      return response.data;
    },
    enabled: Boolean(id),
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const payments = useAdminPayments({
    userId: id,
    enabled: Boolean(id),
  });

  const cases = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;
  const casesLoading = isFetching;

  const {
    subscription: userActiveSubscription,
    isLoading: isUserSubscriptionLoading,
  } = useUserActiveSubscription(id);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    if (page !== 1) setPage(1);
  };

  return (
    <AdminLayout>
      <div className="min-w-0 space-y-4">
        <div className="rounded-xl border bg-card p-4 sm:p-6">
          <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-start">
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <WithShimmer
                loading={isLoading}
                className="h-14 w-14 shrink-0 rounded-full"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-navy text-lg font-bold text-gold">
                  {userData?.avatarUrl ? (
                    <img
                      src={userData.avatarUrl}
                      alt={userData.fullName ?? 'User'}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span>
                      {userData?.fullName?.charAt(0).toUpperCase() ?? '?'}
                    </span>
                  )}
                </div>
              </WithShimmer>
              <div className="min-w-0 flex-1">
                <WithShimmer loading={isLoading} className="h-7 w-48">
                  <h1 className="text-xl font-bold">{userData?.fullName}</h1>
                </WithShimmer>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  {isLoading ? (
                    <>
                      <WithShimmer loading className="h-4 w-40" />
                      <WithShimmer loading className="h-4 w-28" />
                      <WithShimmer loading className="h-4 w-36" />
                    </>
                  ) : (
                    <>
                      <span className="flex min-w-0 max-w-full items-center gap-1 break-all">
                        <Mail className="h-3.5 w-3.5 shrink-0" />
                        {userData?.email || '-'}
                      </span>
                      {userData?.phone && (
                        <span className="flex min-w-0 items-center gap-1">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          {userData.phone}
                        </span>
                      )}
                      {userData?.createdAt && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 shrink-0" />
                          Joined{' '}
                          {new Date(userData.createdAt).toLocaleDateString(
                            'en-IN'
                          )}
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
            {id && (
              <Button
                type="button"
                size="sm"
                onClick={() => navigate(path.adminUserNewCase(id))}
                className="w-full shrink-0 sm:w-auto"
              >
                <Plus className="mr-1.5 h-4 w-4" />
                Create Case
              </Button>
            )}
          </div>
        </div>

        <ActiveSubscriptionCard
          subscription={userActiveSubscription}
          isLoading={isUserSubscriptionLoading}
        />

        {/* Cases */}
        <div>
          <UserCasesTable
            cases={cases}
            isFetching={casesLoading}
            isError={isError}
            totalPages={totalPages}
            total={total}
            page={page}
            setPage={setPage}
            search={search}
            isAdmin={true}
            statusFilter={statusFilter}
            handleSearchChange={handleSearchChange}
            handleStatusChange={handleStatusChange}
          />
        </div>

        <UserPaymentsTable
          hideUserColumn
          rows={payments.rows}
          isFetching={payments.isFetching}
          isError={payments.isError}
          totalPages={payments.totalPages}
          total={payments.total}
          page={payments.page}
          setPage={payments.setPage}
          search={payments.search}
          statusFilter={payments.statusFilter}
          handleSearchChange={payments.handleSearchChange}
          handleStatusChange={payments.handleStatusChange}
          refetch={payments.refetch}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminUserDetail;
