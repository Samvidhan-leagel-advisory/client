import { cn } from '@/lib/utils';
import type { CaseStatus } from '@/types';
import { CASE_STATUS_LABELS } from '@/types';

const statusStyles: Record<CaseStatus, string> = {
  new: 'bg-blue-50 text-blue-700 border-blue-200',
  under_review: 'bg-amber-50 text-amber-700 border-amber-200',
  lawyer_assigned: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  resolved: 'bg-green-50 text-green-700 border-green-200',
  closed: 'bg-gray-50 text-gray-500 border-gray-200',
  emergency: 'bg-red-50 text-red-700 border-red-200',
};

export const StatusBadge = ({
  status,
  className,
}: {
  status: CaseStatus;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium',
      statusStyles[status],
      className
    )}
  >
    {status === 'emergency' && (
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" />
    )}
    {CASE_STATUS_LABELS[status]}
  </span>
);

export const PracticeAreaBadge = ({
  practiceArea,
  className,
}: {
  practiceArea: string;
  className?: string;
}) => (
  <span
    className={cn(
      'inline-flex max-w-full min-w-0 items-center gap-1 break-words rounded-full border px-2.5 py-0.5 text-xs font-medium',
      'border-gray-200 bg-yellow-50 text-yellow-700',
      className
    )}
  >
    {practiceArea}
  </span>
);
