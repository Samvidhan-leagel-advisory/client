import { CreateCase } from '@/components/CreateCase';
import { ROUTES } from '@/constants';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';

const NewCase = () => {
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <CreateCase
        mode="user"
        onSuccess={() => navigate(ROUTES.user.cases)}
      />
    </DashboardLayout>
  );
};

export default NewCase;
