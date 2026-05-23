import { Skeleton } from '@/components/ui/skeleton';

type CaseDetailSkeletonProps = {
  isLawyer?: boolean;
};

export const CaseDetailSkeleton = ({ isLawyer = false }: CaseDetailSkeletonProps) => (
  <div className="flex min-h-0 flex-1 flex-col gap-4">
    {/* Header */}
    <div className="shrink-0">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="mt-2 h-7 w-3/5" />
      <Skeleton className="mt-2 h-4 w-4/5" />
      <Skeleton className="mt-1 h-4 w-2/5" />
    </div>

    {/* Action bar */}
    <div className="flex shrink-0 flex-wrap items-center gap-2">
      <Skeleton className="h-7 w-36 rounded-full" />
      <Skeleton className="h-4 w-24" />
      <div className="flex-1" />
      <div className="flex items-center gap-1">
        {Array.from({ length: isLawyer ? 3 : 2 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8 rounded-md" />
        ))}
      </div>
    </div>

    {/* Meeting URI line (optional on real page) */}
    <div className="shrink-0">
      <Skeleton className="h-10 w-full max-w-md rounded-lg" />
    </div>

    {/* Documents + optional internal notes */}
    <div
      className={
        isLawyer
          ? 'flex min-h-0 flex-1 flex-col gap-4 lg:flex-row lg:items-stretch'
          : 'flex min-h-0 flex-1 flex-col gap-4'
      }
    >
      <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card p-6 shadow-sm">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="mt-2 h-3 w-full max-w-xs" />
        <div className="mt-6 flex min-h-0 flex-1 flex-col gap-3">
          <Skeleton className="h-16 w-full rounded-md" />
          <Skeleton className="h-16 w-full rounded-md" />
        </div>
        <Skeleton className="mt-6 h-9 w-full rounded-md" />
        <Skeleton className="mt-3 h-10 w-full rounded-md" />
      </div>
      {isLawyer ? (
        <div className="flex min-h-0 flex-1 flex-col rounded-lg border bg-card p-6 shadow-sm">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="mt-2 h-3 w-full max-w-sm" />
          <div className="mt-6 flex min-h-0 flex-1 flex-col gap-3">
            <Skeleton className="h-20 w-full rounded-md" />
          </div>
          <Skeleton className="mt-6 h-20 w-full rounded-md" />
          <Skeleton className="mt-3 h-10 w-full rounded-md" />
        </div>
      ) : null}
    </div>
  </div>
);
