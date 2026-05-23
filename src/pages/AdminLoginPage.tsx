import { AdminLoginOtpModalConnected } from '@/components/auth/AdminLoginOtpModal';
import { LoginBrandingAside } from '@/components/login/LoginBrandingAside';
import { LoginEmailPasswordForm } from '@/components/login/LoginEmailPasswordForm';
import { BrandLogo } from '@/components/BrandLogo';
import { useLoginEmailAuth } from '@/hooks/use-login-email-auth';
import { useLoginSessionRedirect } from '@/hooks/use-login-session-redirect';

const AdminLoginPage = () => {
  useLoginSessionRedirect();
  const emailAuth = useLoginEmailAuth('user');

  return (
    <div className="flex min-h-screen">
      <AdminLoginOtpModalConnected controller={emailAuth.adminOtp} />
      <LoginBrandingAside />
      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <BrandLogo size="lg" textVariant="header" />
          </div>
          <h1 className="text-2xl font-bold">Admin Sign In</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Enter your admin credentials
          </p>
          <LoginEmailPasswordForm auth={emailAuth} />
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
