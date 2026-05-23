import { dashboardForRole } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { getCookie } from '@/lib/helpers';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/** If cookies indicate an existing session, send the user to the right dashboard. */
export function useLoginSessionRedirect() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeRole = getCookie('x-active-role');
  const authUser = getCookie('auth-user');

  useEffect(() => {
    if (authUser || activeRole) {
      navigate(dashboardForRole(activeRole));
    }
  }, [user, navigate, activeRole, authUser]);
}
