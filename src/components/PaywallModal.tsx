import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/utils';
import { Check, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DEFAULT_PERKS = [
  'Matched with qualified advocates',
  'Secure uploads & case messaging',
  'Upgrade or cancel anytime',
] as const;

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  /** Optional bullet points under the description; defaults to short generic perks */
  perks?: string[];
  /**
   * When false: hides the dialog X, blocks overlay / Escape dismiss, and hides "Not now"
   * (same idea as ProfileCompletionModal).
   */
  showCloseButton?: boolean;
};

export default function PaywallModal({
  open,
  onOpenChange,
  title = 'This feature requires a subscription',
  description = 'Upgrade to a paid plan to access this feature.',
  perks,
  showCloseButton = true,
}: Props) {
  const navigate = useNavigate();
  const perkList = perks?.length ? perks : [...DEFAULT_PERKS];

  const goToPlans = () => {
    onOpenChange(false);
    navigate(ROUTES.user.subscription);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && !showCloseButton) return;
        onOpenChange(next);
      }}
    >
      <DialogContent
        className={cn(
          'gap-0 overflow-hidden p-0 sm:max-w-[420px]',
          'border-border/80 shadow-xl',
          !showCloseButton &&
            '[&>button:last-of-type]:hidden [&>button[data-radix-collection-item]]:hidden'
        )}
        onPointerDownOutside={
          showCloseButton ? undefined : (e) => e.preventDefault()
        }
        onInteractOutside={
          showCloseButton ? undefined : (e) => e.preventDefault()
        }
        onEscapeKeyDown={
          showCloseButton ? undefined : (e) => e.preventDefault()
        }
      >
        <div
          className="h-1.5 w-full bg-gradient-to-r from-transparent via-gold to-transparent"
          aria-hidden
        />

        <div className="px-6 pb-6 pt-2">
          <div className="flex justify-center pt-4">
            <div className="relative">
              <div
                className="absolute -inset-3 rounded-full bg-gold/15 blur-2xl"
                aria-hidden
              />
              <div className="from-gold/12 relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-gold/25 bg-gradient-to-b to-card shadow-sm">
                <Lock
                  className="h-8 w-8 text-gold"
                  strokeWidth={1.5}
                  aria-hidden
                />
              </div>
            </div>
          </div>

          <DialogHeader className="mt-6 space-y-3 text-center sm:text-center">
            <DialogTitle className="text-balance font-serif text-xl font-semibold leading-snug tracking-tight text-foreground">
              {title}
            </DialogTitle>
            <DialogDescription className="text-pretty text-[15px] leading-relaxed text-muted-foreground">
              {description}
            </DialogDescription>
          </DialogHeader>

          <ul className="mt-6 space-y-2.5 rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-left text-sm text-foreground/90">
            {perkList.map((line) => (
              <li key={line} className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold">
                  <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                </span>
                <span className="leading-snug">{line}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-2.5">
            <Button
              type="button"
              size="lg"
              className="w-full bg-gold font-semibold text-accent-foreground shadow-sm hover:bg-gold/90"
              onClick={goToPlans}
            >
              View plans & pricing
            </Button>
            {showCloseButton && (
              <Button
                type="button"
                variant="outline"
                className="w-full border-border bg-background hover:bg-muted/80"
                onClick={() => onOpenChange(false)}
              >
                Not now
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
