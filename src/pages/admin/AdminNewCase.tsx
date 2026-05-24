import { getAdminUserDetails } from '@/api-client';
import { CreateCase } from '@/components/CreateCase';
import WithShimmer from '@/components/WithShimmer';
import { path } from '@/constants';
import { AdminLayout } from '@/layouts/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { Mail, Phone } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const AdminNewCase = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <div className="mx-auto max-w-2xl space-y-4">
        <CreateCase
          mode="admin"
          userId={id}
          title="New Case"
          subtitle="File a legal query on behalf of this user."
          submitLabel="Create Case"
          onSuccess={() => navigate(path.adminUser(id))}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminNewCase;
