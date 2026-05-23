import { UserPaymentsTable } from '@/components/user/UserPaymentsTable';
import { useAdminPayments } from '@/hooks/useAdminPayments';
import { AdminLayout } from '@/layouts/AdminLayout';

const AdminPayments = () => {
  const payments = useAdminPayments({});

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Payment Tracking</h1>
          <p className="mt-1 text-muted-foreground">
            Track all transactions and payments.
          </p>
        </div>

        <UserPaymentsTable
          showTitle={false}
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

export default AdminPayments;
