import { AdminLoginOtpModalConnected } from '@/components/auth/AdminLoginOtpModal';
import { LoginBrandingAside } from '@/components/login/LoginBrandingAside';
import { LoginCredentialsColumn } from '@/components/login/LoginCredentialsColumn';
import {
  loginUrlForRole,
  parseLoginRole,
  type LoginRole,
} from '@/components/login/LoginRoleToggle';
import { ROUTES, dashboardForRole } from '@/constants';
import { useAdminLoginOtp } from '@/hooks/use-admin-login-otp';
import { syncFcmToken } from '@/hooks/use-fcm-token';
import { useLoginSessionRedirect } from '@/hooks/use-login-session-redirect';
import { useToast } from '@/hooks/use-toast';
import { setCookie } from '@/lib/helpers';
import { useNavigate, useSearchParams } from 'react-router-dom';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const role = parseLoginRole(searchParams.get('role'));
  const navigate = useNavigate();
  const { toast } = useToast();

  useLoginSessionRedirect();

  const finishAsAdmin = () => {
    setCookie('x-active-role', 'admin');
    void syncFcmToken();
    toast({ title: 'Welcome back!', description: 'Signed in to admin.' });
    navigate(ROUTES.admin.dashboard);
  };

  const adminOtp = useAdminLoginOtp(finishAsAdmin);

  const handleAdminOtp = (args: { email: string; expiresInSeconds: number; message?: string }) => {
    adminOtp.openModal({
      email: args.email,
      password: '',
      expiresInSeconds: args.expiresInSeconds,
      message: args.message,
      isGoogleAdmin: true,
    });
  };

  const handleRoleChange = (next: LoginRole) => {
    if (next === role) return;
    window.location.assign(loginUrlForRole(next, ROUTES.login));
  };

  return (
    <div className="flex min-h-screen">
      <AdminLoginOtpModalConnected controller={adminOtp} />
      <LoginBrandingAside />
      <LoginCredentialsColumn
        role={role}
        onRoleChange={handleRoleChange}
        onGoogleSuccess={() => navigate(dashboardForRole(role))}
        onAdminOtp={handleAdminOtp}
      />
    </div>
  );
};

export default LoginPage;
