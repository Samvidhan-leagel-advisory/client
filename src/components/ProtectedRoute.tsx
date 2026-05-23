import { getCurrentUser } from '@/api-client';
import DashboardSkeleton from '@/components/skeletons/DashboardSkeleton';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { getCookie, resetCookies, setCookie } from '@/lib/helpers';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: React.ReactNode;
  allowedRoles: string[];
}

const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const activeRole = getCookie('x-active-role');
  const navigate = useNavigate();
  const isAuthenticated = !!activeRole;

  const getUser = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data } = await getCurrentUser();
      setUser(data);
      setCookie('auth-user', JSON.stringify(data));
    } catch (e: unknown) {
      const status = (e as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        resetCookies();
        setUser(null);
        navigate(ROUTES.login);
      }
    } finally {
      setIsLoading(false);
    }
  }, [setUser, navigate]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.login);
    }

    if (!user && activeRole) {
      void getUser();
    }
  }, [isAuthenticated, navigate, getUser, user, activeRole]);

  return <>{isLoading ? <DashboardSkeleton /> : children}</>;
};

export default ProtectedRoute;
