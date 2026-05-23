import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import { ROUTES } from '@/constants';
import { getCookie } from '@/lib/helpers';
import type { AdminProtectedRouteProps } from '@/types';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminProtectedRoute = ({ children }: AdminProtectedRouteProps) => {
  const [isChecking, setIsChecking] = useState(true);
  const activeRole = getCookie('x-active-role');
  const navigate = useNavigate();
  const isAdminRole = activeRole === 'admin';

  useEffect(() => {
    if (!isAdminRole) {
      navigate(ROUTES.login, { replace: true });
    } else {
      setIsChecking(false);
    }
  }, [isAdminRole, navigate]);

  if (isChecking) return <DashboardSkeleton />;

  return <>{children}</>;
};

export default AdminProtectedRoute;
