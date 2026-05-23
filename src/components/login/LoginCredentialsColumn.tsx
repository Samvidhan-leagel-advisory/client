import GoogleLoginButton from '@/components/auth/GoogleLoginButton';
import { BrandLogo } from '@/components/BrandLogo';
import { LoginDpdpConsent } from '@/components/login/LoginDpdpConsent';
import { LoginRoleToggle } from '@/components/login/LoginRoleToggle';
import type { LoginRole } from '@/components/login/LoginRoleToggle';
import { useState } from 'react';

interface LoginCredentialsColumnProps {
  role: LoginRole;
  onRoleChange: (role: LoginRole) => void;
  onGoogleSuccess: () => void;
  onAdminOtp?: (args: { email: string; expiresInSeconds: number; message?: string }) => void;
}

export function LoginCredentialsColumn({
  role,
  onRoleChange,
  onGoogleSuccess,
  onAdminOtp,
}: LoginCredentialsColumnProps) {
  const [dpdpConsentAccepted, setDpdpConsentAccepted] = useState(false);

  return (
    <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-md">
        <div className="mb-8 lg:hidden">
          <BrandLogo size="lg" textVariant="header" />
        </div>

        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Select your role and sign in with Google
        </p>

        <LoginRoleToggle value={role} onChange={onRoleChange} />
        <LoginDpdpConsent checked={dpdpConsentAccepted} onCheckedChange={setDpdpConsentAccepted} />
        <GoogleLoginButton
          role={role}
          dpdpConsentAccepted={dpdpConsentAccepted}
          onSuccess={onGoogleSuccess}
          onAdminOtp={onAdminOtp}
        />
      </div>
    </div>
  );
}
