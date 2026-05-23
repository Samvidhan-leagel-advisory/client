import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { useId } from 'react';

export interface AdminLawyerDocumentRejectDialogProps {
  open: boolean;
  fileLabel: string;
  reason: string;
  onReasonChange: (value: string) => void;
  onOpenChange: (open: boolean) => void;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function AdminLawyerDocumentRejectDialog({
  open,
  fileLabel,
  reason,
  onReasonChange,
  onOpenChange,
  onCancel,
  onSubmit,
  isSubmitting,
}: AdminLawyerDocumentRejectDialogProps) {
  const fieldId = useId();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject document</DialogTitle>
          <DialogDescription>
            Explain why &quot;{fileLabel}&quot; cannot be accepted. The advocate
            will read this in their dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <Label htmlFor={fieldId}>Rejection reason</Label>
          <Textarea
            id={fieldId}
            rows={4}
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="e.g. Bar Council ID unreadable — please upload a clearer scan."
            disabled={isSubmitting}
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="inline-flex items-center gap-2"
            disabled={isSubmitting || !reason.trim()}
            onClick={onSubmit}
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
            ) : null}
            Submit rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
