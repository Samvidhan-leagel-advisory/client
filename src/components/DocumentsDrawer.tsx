import { CaseDocumentsContent } from '@/components/case-detail/CaseDocumentsContent';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { CaseStatus } from '@/types';
import { QueryKey } from '@tanstack/react-query';

interface DocumentsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploadClick?: (queryKey: QueryKey) => void;
  caseClientName?: string;
  caseLawyerName?: string;
  loading?: boolean;
  isAdmin?: boolean;
  caseStatus?: CaseStatus;
}

export const DocumentsDrawer = ({
  open,
  onOpenChange,
  onUploadClick,
  caseClientName,
  caseLawyerName,
  loading,
  isAdmin,
  caseStatus,
}: DocumentsDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Documents</SheetTitle>
          <SheetDescription>All files attached to this case.</SheetDescription>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col py-4">
          <CaseDocumentsContent
            caseClientName={caseClientName}
            caseLawyerName={caseLawyerName}
            loading={loading}
            isAdmin={isAdmin}
            caseStatus={caseStatus}
            onUploadClick={onUploadClick}
          />
        </div>
      </SheetContent>
    </Sheet>
  );
};
