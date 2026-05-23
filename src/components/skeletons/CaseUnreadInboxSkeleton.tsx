import { Skeleton } from '@/components/ui/skeleton';

export const CaseUnreadInboxSkeleton = ({ count = 5 }: { count?: number }) => (
  <ul className="py-1">
    {Array.from({ length: count }).map((_, i) => (
      <li
        key={i}
        className="flex flex-col gap-1.5 border-b border-border/60 px-4 py-3 last:border-0"
      >
        <div className="flex items-center justify-between gap-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-4 w-4/5" />
      </li>
    ))}
  </ul>
);
