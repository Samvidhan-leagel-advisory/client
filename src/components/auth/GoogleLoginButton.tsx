import { DPDP_CONSENT_REQUIRED_TOAST } from '@/components/login/LoginDpdpConsent';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants';
import { useAuth } from '@/contexts/AuthContext';
import { syncFcmToken } from '@/hooks/use-fcm-token';
import { useToast } from '@/hooks/use-toast';
import { setCookie } from '@/lib/helpers';
import { isReactNativeWebView } from '@/lib/is-react-native-webview';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { Loader2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface GoogleLoginButtonProps {
  role: UserRole;
  dpdpConsentAccepted: boolean;
  onSuccess: () => void;
  onAdminOtp?: (args: { email: string; expiresInSeconds: number; message?: string }) => void;
}

/** Multicolor G mark for “Sign in with Google” (official palette). */
function GoogleGMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const googleSignInChrome =
  'flex h-10 w-full items-center justify-center gap-3 rounded-full border border-border bg-card text-sm font-medium text-muted-foreground shadow-sm transition-colors group-hover:border-gold/40 group-hover:bg-gold/10 group-hover:text-foreground';

const GoogleLoginButton = ({
  role,
  dpdpConsentAccepted,
  onSuccess,
  onAdminOtp,
}: GoogleLoginButtonProps) => {
  const { googleLogin } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const nativeShell = isReactNativeWebView();

  const requireDpdpConsent = useCallback(() => {
    if (dpdpConsentAccepted) return true;
    toast({ ...DPDP_CONSENT_REQUIRED_TOAST, variant: 'destructive' });
    return false;
  }, [dpdpConsentAccepted, toast]);

  const finishWithIdToken = useCallback(
    async (idToken: string) => {
      if (!requireDpdpConsent()) return;

      if (!idToken) {
        toast({
          title: 'Google sign-in failed',
          description: 'No credential received.',
          variant: 'destructive',
        });
        return;
      }

      setIsLoading(true);
      try {
        const data = await googleLogin(idToken, role);

        if (data?.requiresOtp && data.adminEmail) {
          onAdminOtp?.({
            email: data.adminEmail,
            expiresInSeconds: data.expiresInSeconds ?? 600,
            message: data.message,
          });
          return;
        }

        if (!data.status) throw new Error(data.message);
        if (data?.isAdmin) {
          setCookie('x-active-role', 'admin');
          void syncFcmToken();
          return navigate(ROUTES.admin.dashboard);
        } else {
          setCookie('x-active-role', role as string);
          void syncFcmToken();
        }
        toast({
          title: 'Welcome!',
          description: `Signed in with Google as ${role}.`,
        });
        onSuccess();
      } catch (e) {
        toast({
          title: 'Login failed',
          description:
            e instanceof Error ? e.message : 'Please check your credentials.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [googleLogin, navigate, onAdminOtp, onSuccess, requireDpdpConsent, role, toast]
  );

  useEffect(() => {
    if (!nativeShell) return;
    const onNativeGoogle = (ev: Event) => {
      const detail = (ev as CustomEvent<{ idToken?: string }>).detail;
      if (detail?.idToken) void finishWithIdToken(detail.idToken);
    };
    window.addEventListener('samvidhan-native-google', onNativeGoogle as EventListener);
    return () =>
      window.removeEventListener('samvidhan-native-google', onNativeGoogle as EventListener);
  }, [finishWithIdToken, nativeShell]);

  const requestNativeGoogleSignIn = () => {
    if (!requireDpdpConsent()) return;
    const bridge = (window as Window & { ReactNativeWebView?: { postMessage(msg: string): void } })
      .ReactNativeWebView;
    bridge?.postMessage(JSON.stringify({ type: 'REQUEST_GOOGLE_SIGN_IN', role }));
  };

  const handleCredentialResponse = async (response: CredentialResponse) => {
    await finishWithIdToken(response.credential ?? '');
  };

  const handleError = () => {
    toast({
      title: 'Google sign-in failed',
      description: 'Google authentication was cancelled or failed.',
      variant: 'destructive',
    });
  };

  return (
    <div className="mt-6 w-full rounded-lg">
      <div className="min-h-10 w-full">
        {isLoading ? (
          <Button
            type="button"
            variant="outline"
            className={cn(googleSignInChrome, 'cursor-wait')}
            disabled
          >
            <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden />
            Signing in with Google…
          </Button>
        ) : nativeShell ? (
          <button
            type="button"
            className={cn(
              googleSignInChrome,
              'w-full cursor-pointer border-border outline-none focus-visible:ring-2 focus-visible:ring-gold/55 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
            )}
            onClick={requestNativeGoogleSignIn}
          >
            <GoogleGMark className="h-5 w-5 shrink-0" />
            Sign in with Google
          </button>
        ) : (
          <div className="group relative w-full rounded-full transition-shadow focus-within:outline-none focus-within:ring-2 focus-within:ring-gold/55 focus-within:ring-offset-2 focus-within:ring-offset-background">
            {/* Visible chrome — Google’s iframe hover is sky-blue; we hide it and match your palette. */}
            <div
              className={cn('pointer-events-none', googleSignInChrome)}
              aria-hidden
            >
              <GoogleGMark className="h-5 w-5 shrink-0" />
              Sign in with Google
            </div>
            <div
              className={cn(
                'absolute inset-0 z-[1] overflow-hidden rounded-full opacity-0',
                !dpdpConsentAccepted && 'pointer-events-none'
              )}
            >
              <GoogleLogin
                onSuccess={handleCredentialResponse}
                onError={handleError}
                width="100%"
                type="standard"
                theme="outline"
                size="large"
                shape="pill"
                text="signin_with"
                logo_alignment="left"
                containerProps={{
                  className:
                    'flex h-full w-full min-h-10 [&>div]:!h-full [&>div]:!w-full [&_iframe]:!h-10 [&_iframe]:!w-full',
                }}
              />
            </div>
            {!dpdpConsentAccepted ? (
              <button
                type="button"
                className="absolute inset-0 z-[2] cursor-pointer rounded-full bg-transparent"
                onClick={() => requireDpdpConsent()}
                aria-label="Accept DPDP consent to sign in with Google"
              />
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleLoginButton;
