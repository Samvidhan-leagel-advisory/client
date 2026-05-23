import { CaseTimeline } from '@/components/CaseTimeline';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import type { CaseStatus } from '@/types';

interface TimelineDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status?: CaseStatus;
  updatedAt?: string;
}

export const TimelineDrawer = ({
  open,
  onOpenChange,
  status,
  updatedAt,
}: TimelineDrawerProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="flex flex-col sm:max-w-md">
      <SheetHeader>
        <SheetTitle>Case Timeline</SheetTitle>
        <SheetDescription>
          History of all activity on this case.
        </SheetDescription>
      </SheetHeader>

      <div className="flex-1 overflow-y-auto py-4">
        <CaseTimeline events={[]} />
      </div>
    </SheetContent>
  </Sheet>
);
