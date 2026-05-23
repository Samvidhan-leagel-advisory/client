import { login } from '@/api-client';
import { ROUTES, dashboardForRole } from '@/constants';
import { syncFcmToken } from '@/hooks/use-fcm-token';
import { useAdminLoginOtp } from '@/hooks/use-admin-login-otp';
import { useToast } from '@/hooks/use-toast';
import { setCookie } from '@/lib/helpers';
import { getApiErrorMessage } from '@/lib/utils';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type LoginRole = 'user' | 'lawyer';

const OTP_DEFAULT_SEC = 600;

export function useLoginEmailAuth(role: LoginRole) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const toastError = useCallback(
    (title: string, message: string) => {
      toast({ title, description: message, variant: 'destructive' });
    },
    [toast]
  );

  const finishAsAdmin = useCallback(() => {
    setCookie('x-active-role', 'admin');
    void syncFcmToken();
    toast({ title: 'Welcome back!', description: 'Signed in to admin.' });
    navigate(ROUTES.admin.dashboard);
  }, [navigate, toast]);

  const adminOtp = useAdminLoginOtp(finishAsAdmin);

  const finishAsClientOrLawyer = useCallback(() => {
    setCookie('x-active-role', role);
    void syncFcmToken();
    toast({
      title: 'Welcome back!',
      description: `Logged in as ${role}.`,
    });
    navigate(dashboardForRole(role));
  }, [navigate, role, toast]);

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      try {
        setLoading(true);
        const { data } = await login({ email, password, role });

        if (data?.requiresOtp) {
          adminOtp.openModal({
            email,
            password,
            expiresInSeconds:
              typeof data.expiresInSeconds === 'number'
                ? data.expiresInSeconds
                : OTP_DEFAULT_SEC,
            message: data.message,
          });
          return;
        }

        if (!data.status) {
          toastError('Login', data.message ?? 'Unable to sign in.');
          return;
        }

        if (data?.isAdmin) {
          finishAsAdmin();
          return;
        }

        finishAsClientOrLawyer();
      } catch (e) {
        toastError('Login failed', getApiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    },
    [
      email,
      password,
      role,
      adminOtp.openModal,
      finishAsAdmin,
      finishAsClientOrLawyer,
      toastError,
    ]
  );

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPw,
    setShowPw,
    loading,
    submit,
    adminOtp,
  };
}

export type LoginEmailAuth = ReturnType<typeof useLoginEmailAuth>;
