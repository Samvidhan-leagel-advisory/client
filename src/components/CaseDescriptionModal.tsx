import { GenericTooltip } from '@/components/GenericTooltip';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CaseDescriptionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseTitle: string;
  description: string;
}

export const CaseDescriptionModal = ({
  open,
  onOpenChange,
  caseTitle,
  description,
}: CaseDescriptionModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[min(80vh,720px)] max-w-2xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="shrink-0 space-y-1 border-b px-6 py-4 pr-14 text-left">
          <GenericTooltip content={caseTitle || 'Case'} side="bottom">
            <DialogTitle className="line-clamp-2 text-left text-base font-semibold leading-snug">
              {caseTitle || 'Case'}
            </DialogTitle>
          </GenericTooltip>
          <DialogDescription className="text-left text-xs">
            Case description
          </DialogDescription>
        </DialogHeader>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-6 py-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {description}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
