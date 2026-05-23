import { adminLoginResendOtp, adminLoginVerifyOtp } from '@/api-client';
import { useToast } from '@/hooks/use-toast';
import { getApiErrorMessage } from '@/lib/utils';
import { useCallback, useEffect, useMemo, useState } from 'react';

const RESEND_THROTTLE_MS = 45_000;

export function useAdminLoginOtp(onVerified: () => void) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isGoogleAdmin, setIsGoogleAdmin] = useState(false);
  const [hintMessage, setHintMessage] = useState('');
  const [otpDeadline, setOtpDeadline] = useState<number | null>(null);
  const [resendNotBefore, setResendNotBefore] = useState(0);
  const [tick, setTick] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!open) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [open]);

  const otpRemainingSec = useMemo(() => {
    if (otpDeadline == null) return 0;
    return Math.max(0, Math.ceil((otpDeadline - Date.now()) / 1000));
  }, [otpDeadline, tick]);

  const resendCooldownSec = useMemo(() => {
    return Math.max(0, Math.ceil((resendNotBefore - Date.now()) / 1000));
  }, [resendNotBefore, tick]);

  const closeModal = useCallback(() => {
    setOpen(false);
    setEmail('');
    setPassword('');
    setIsGoogleAdmin(false);
    setHintMessage('');
    setOtpDeadline(null);
    setResendNotBefore(0);
  }, []);

  const openModal = useCallback(
    (args: {
      email: string;
      password: string;
      expiresInSeconds: number;
      message?: string;
      isGoogleAdmin?: boolean;
    }) => {
      setEmail(args.email);
      setPassword(args.password);
      setIsGoogleAdmin(args.isGoogleAdmin ?? false);
      setHintMessage(args.message ?? '');
      setOtpDeadline(Date.now() + args.expiresInSeconds * 1000);
      setResendNotBefore(0);
      setOpen(true);
    },
    []
  );

  const verifyOtp = useCallback(
    async (otp: string) => {
      setIsVerifying(true);
      try {
        const { data } = await adminLoginVerifyOtp({ email, password, otp });
        if (!data.status) {
          toast({
            title: 'Verification failed',
            description: data.message ?? 'Invalid or expired code.',
            variant: 'destructive',
          });
          return false;
        }
        onVerified();
        closeModal();
        return true;
      } catch (e) {
        toast({
          title: 'Verification failed',
          description: getApiErrorMessage(e),
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsVerifying(false);
      }
    },
    [email, password, onVerified, closeModal, toast]
  );

  const resendOtp = useCallback(async (): Promise<boolean> => {
    if (Date.now() < resendNotBefore || !email || (!isGoogleAdmin && password.length < 6)) {
      return false;
    }
    setIsResending(true);
    try {
      const { data } = await adminLoginResendOtp({ email, password });
      if (!data.status) {
        toast({
          title: 'Could not resend code',
          description: data.message ?? 'Try again later.',
          variant: 'destructive',
        });
        return false;
      }
      const secs =
        typeof data.expiresInSeconds === 'number' ? data.expiresInSeconds : 600;
      setOtpDeadline(Date.now() + secs * 1000);
      setResendNotBefore(Date.now() + RESEND_THROTTLE_MS);
      toast({
        title: 'New code sent',
        description:
          data.message ??
          'A new code was emailed to your super admin. Enter it below.',
      });
      return true;
    } catch (e) {
      toast({
        title: 'Could not resend code',
        description: getApiErrorMessage(e),
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsResending(false);
    }
  }, [email, password, isGoogleAdmin, resendNotBefore, toast]);

  return {
    isOpen: open,
    openModal,
    closeModal,
    email,
    hintMessage,
    otpRemainingSec,
    resendCooldownSec,
    /** Google admins can always resend; email admins need password (min 6 chars). */
    resendAllowed: isGoogleAdmin || password.length >= 6,
    verifyOtp,
    resendOtp,
    isVerifying,
    isResending,
  };
}

export type AdminLoginOtpController = ReturnType<typeof useAdminLoginOtp>;
