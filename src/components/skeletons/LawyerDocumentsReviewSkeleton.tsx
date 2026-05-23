import { Skeleton } from '@/components/ui/skeleton';

export const LawyerDocumentsReviewSkeleton = ({ count = 5 }: { count?: number }) => (
  <ul className="divide-y">
    {Array.from({ length: count }).map((_, i) => (
      <li
        key={i}
        className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="min-w-0 flex-1 space-y-2 sm:px-2 sm:py-1">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-40" />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 sm:pl-4">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-22 rounded-md" />
          <Skeleton className="h-8 w-18 rounded-md" />
        </div>
      </li>
    ))}
  </ul>
);
