import { getAdminUsers } from '@/api-client';
import { PaginationControls } from '@/components/PaginationControls';
import { UserFormModal } from '@/components/admin/UserFormModal';
import { CasesTableSkeleton } from '@/components/skeletons/CasesTableSkeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { path } from '@/constants';
import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { AdminLayout } from '@/layouts/AdminLayout';
import { PAGE_SIZE } from '@/lib/mock-data';
import { User, UsersListResponse } from '@/types';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { Edit, Search, UserPlus } from 'lucide-react';
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

const AdminUsers = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 500);

  const { data, isFetching } = useQuery<UsersListResponse>({
    queryKey: ['admin-users', page, debouncedSearch],
    queryFn: async () => {
      const params = buildQueryParams(page, debouncedSearch);
      const response = await getAdminUsers(params);
      return response.data;
    },
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: false,
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const users = data?.data ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.totalPages ?? 1;
  const total = pagination?.total ?? 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="mt-1 text-muted-foreground">
              Manage all registered users on the platform.
            </p>
          </div>
          <Button
            onClick={() => {
              setEditingUser(null);
              setModalOpen(true);
            }}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Mem Number
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Email
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground md:table-cell">
                  Phone
                </th>

                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground lg:table-cell">
                  Joined
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 && !isFetching && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-4 text-center text-muted-foreground"
                  >
                    No users found
                  </td>
                </tr>
              )}
              {!isFetching &&
                users.map((u) => (
                  <tr
                    key={u.id}
                    className="border-b last:border-0 hover:bg-muted/30"
                  >
                    <td className="px-4 py-3 font-medium">
                      <Link
                        to={path.adminUser(u.id)}
                        aria-label={`View ${u.fullName ?? 'user'}`}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gold/20 text-sm font-bold text-gold ring-offset-background transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      >
                        {u.avatarUrl ? (
                          <img
                            src={u.avatarUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span aria-hidden>
                            {u.fullName?.charAt(0).toUpperCase() ?? '?'}
                          </span>
                        )}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <Link
                        to={path.adminUser(u.id)}
                        className="hover:text-gold hover:underline"
                      >
                        {u.fullName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {u.memNumber ?? '-'}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {u.email}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {u.phone ? `+91${u.phone}` : '-'}
                    </td>

                    <td className="hidden px-4 py-3 text-muted-foreground lg:table-cell">
                      {new Date(u.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingUser(u);
                            setModalOpen(true);
                          }}
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                        <Link to={path.adminUser(u.id)}>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
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
        <UserFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          user={editingUser as User | undefined}
          onSave={(data, message) => {
            toast({
              title:
                message ||
                `${data.name} has been ${editingUser ? 'updated' : 'added'}.`,
            });
            setModalOpen(false);
          }}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
