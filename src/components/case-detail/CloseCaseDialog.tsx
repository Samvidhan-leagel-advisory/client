import { CaseCodeText } from '@/components/CaseCodeText';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export type CloseCaseDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseCode?: string | null;
  isConfirmPending?: boolean;
  onConfirmClose: (reason: string) => Promise<void>;
};

export function CloseCaseDialog({
  open,
  onOpenChange,
  caseCode,
  isConfirmPending = false,
  onConfirmClose,
}: CloseCaseDialogProps) {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!open) setReason('');
  }, [open]);

  const handleConfirm = async () => {
    const trimmed = reason.trim();
    if (!trimmed || isConfirmPending) return;
    await onConfirmClose(trimmed);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Close Case</DialogTitle>
          <DialogDescription>
            This will permanently close case{' '}
            <CaseCodeText className="text-sm">{caseCode ?? '—'}</CaseCodeText>
            . Please provide a reason.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Textarea
            placeholder="Reason for closing..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isConfirmPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleConfirm()}
              disabled={!reason.trim() || isConfirmPending}
            >
              {isConfirmPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Close Case
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
