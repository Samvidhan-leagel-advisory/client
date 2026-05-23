import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { getCookie } from '@/lib/helpers';
import { isLawyerApprovedForPractice } from '@/lib/lawyer-access';
import { useLayoutEffect, type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const LAWYER_PATHS_WITHOUT_APPROVAL = new Set<string>([
  ROUTES.lawyer.profile,
  ROUTES.lawyer.documents,
]);

function normalizePathname(pathname: string) {
  const p = pathname.replace(/\/$/, '');
  return p === '' ? '/' : p;
}

function lawyerMayAccessPathWithoutApproval(pathname: string): boolean {
  return LAWYER_PATHS_WITHOUT_APPROVAL.has(normalizePathname(pathname));
}

/**
 * When the active role is lawyer, blocks routes outside profile/documents until
 * `lawyerProfile.isProfileCompleted` and `lawyerProfile.isVerified` are both true.
 */
export function LawyerApprovedGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const activeRole = getCookie('x-active-role');

  const blocked =
    activeRole === 'lawyer' &&
    Boolean(user) &&
    !lawyerMayAccessPathWithoutApproval(location.pathname) &&
    !isLawyerApprovedForPractice(user);

  useLayoutEffect(() => {
    if (blocked) navigate(ROUTES.lawyer.profile, { replace: true });
  }, [blocked, navigate]);

  if (blocked) return null;
  return <>{children}</>;
}
