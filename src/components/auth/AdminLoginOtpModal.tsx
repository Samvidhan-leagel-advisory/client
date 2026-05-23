import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import type { AdminLoginOtpController } from '@/hooks/use-admin-login-otp';
import { cn } from '@/lib/utils';
import { Clock, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';

function formatCountdown(totalSec: number) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export interface AdminLoginOtpModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  email: string;
  hintMessage: string;
  otpRemainingSec: number;
  resendCooldownSec: number;
  resendAllowed: boolean;
  onVerify: (otp: string) => Promise<boolean>;
  /** Returns true when a new code was sent (modal clears OTP). */
  onResend: () => Promise<boolean>;
  isVerifying: boolean;
  isResending: boolean;
}

export function AdminLoginOtpModal({
  open,
  onOpenChange,
  email,
  hintMessage,
  otpRemainingSec,
  resendCooldownSec,
  resendAllowed,
  onVerify,
  onResend,
  isVerifying,
  isResending,
}: AdminLoginOtpModalProps) {
  const [otp, setOtp] = useState('');
  /** Remount OTP slots so internal state resets after resend. */
  const [otpFieldKey, setOtpFieldKey] = useState(0);

  useEffect(() => {
    if (!open) {
      setOtp('');
      setOtpFieldKey((k) => k + 1);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) return;
    await onVerify(otp);
  };

  const handleResend = async () => {
    const sent = await onResend();
    if (sent) {
      setOtp('');
      setOtpFieldKey((k) => k + 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-[440px]">
        <div className="border-b bg-muted/35 px-6 py-5">
          <DialogHeader className="space-y-0 text-left">
            <div className="flex gap-4">
              <div
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gold/15 text-gold"
                aria-hidden
              >
                <Mail className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div className="min-w-0 space-y-2 pt-0.5">
                <DialogTitle className="text-left text-xl font-semibold leading-snug tracking-tight">
                  Super admin code
                </DialogTitle>
                <DialogDescription className="text-left text-sm leading-relaxed text-muted-foreground">
                  A 6-digit code was emailed to your super admin. Get it from
                  them, then enter it here.
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
        </div>

        <div className="space-y-5 px-6 py-5">
          <p className="text-center text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="flex flex-col items-center gap-3">
              <InputOTP
                key={otpFieldKey}
                maxLength={6}
                inputMode="numeric"
                value={otp}
                onChange={(v) => setOtp(v.replace(/\D/g, '').slice(0, 6))}
                disabled={isVerifying}
                autoFocus
                containerClassName="gap-0"
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>

              <div
                className={cn(
                  'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium tabular-nums',
                  otpRemainingSec > 0
                    ? 'border-border bg-muted/50 text-foreground'
                    : 'border-amber-500/35 bg-amber-500/10 text-amber-950 dark:text-amber-100'
                )}
              >
                <Clock
                  className="h-3.5 w-3.5 shrink-0 opacity-70"
                  aria-hidden
                />
                {otpRemainingSec > 0 ? (
                  <span>Expires in {formatCountdown(otpRemainingSec)}</span>
                ) : (
                  <span>Expired. Resend</span>
                )}
              </div>
            </div>

            <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
              <Button
                type="submit"
                className="w-full"
                disabled={isVerifying || otp.length !== 6}
              >
                {isVerifying ? 'Checking…' : 'Verify'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-gold/30 hover:bg-gold/10"
                disabled={
                  isResending || resendCooldownSec > 0 || !resendAllowed
                }
                onClick={() => void handleResend()}
              >
                {isResending
                  ? 'Sending…'
                  : resendCooldownSec > 0
                    ? `Resend (${resendCooldownSec}s)`
                    : 'Resend code'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function AdminLoginOtpModalConnected({
  controller: c,
}: {
  controller: AdminLoginOtpController;
}) {
  return (
    <AdminLoginOtpModal
      open={c.isOpen}
      onOpenChange={(next) => {
        if (!next) c.closeModal();
      }}
      email={c.email}
      hintMessage={c.hintMessage}
      otpRemainingSec={c.otpRemainingSec}
      resendCooldownSec={c.resendCooldownSec}
      resendAllowed={c.resendAllowed}
      onVerify={c.verifyOtp}
      onResend={c.resendOtp}
      isVerifying={c.isVerifying}
      isResending={c.isResending}
    />
  );
}
