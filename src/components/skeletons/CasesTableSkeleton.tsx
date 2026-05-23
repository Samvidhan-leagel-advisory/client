import { Skeleton } from '@/components/ui/skeleton';

const SKELETON_WIDTHS = [
  ['w-24', 'w-44', 'w-20', 'w-20', 'w-32', 'w-16'],
  ['w-20', 'w-36', 'w-24', 'w-16', 'w-28', 'w-20'],
  ['w-28', 'w-48', 'w-16', 'w-24', 'w-24', 'w-14'],
  ['w-22', 'w-40', 'w-28', 'w-20', 'w-36', 'w-18'],
  ['w-24', 'w-32', 'w-20', 'w-16', 'w-28', 'w-20'],
  ['w-20', 'w-44', 'w-24', 'w-24', 'w-32', 'w-16'],
  ['w-28', 'w-36', 'w-16', 'w-20', 'w-24', 'w-14'],
  ['w-24', 'w-48', 'w-28', 'w-16', 'w-36', 'w-20'],
  ['w-20', 'w-40', 'w-20', 'w-24', 'w-28', 'w-18'],
  ['w-28', 'w-32', 'w-24', 'w-20', 'w-32', 'w-16'],
];

export const CasesTableSkeleton = ({
  length = SKELETON_WIDTHS.length,
}: {
  length?: number;
}) => (
  <>
    {SKELETON_WIDTHS.slice(0, length).map((widths, i) => (
      <tr key={i} className="border-b last:border-0">
        <td className="px-4 py-3">
          <Skeleton className={`h-4 ${widths[0]} rounded`} />
        </td>
        <td className="px-4 py-3">
          <Skeleton className={`h-4 ${widths[1]} rounded`} />
        </td>
        <td className="hidden px-4 py-3 md:table-cell">
          <Skeleton className={`h-4 ${widths[2]} rounded`} />
        </td>
        <td className="px-4 py-3">
          <Skeleton className={`h-5 ${widths[3]} rounded-full`} />
        </td>
        <td className="hidden px-4 py-3 lg:table-cell">
          <Skeleton className={`h-4 ${widths[4]} rounded`} />
        </td>
        <td className="hidden px-4 py-3 sm:table-cell">
          <Skeleton className={`h-4 ${widths[5]} rounded`} />
        </td>
      </tr>
    ))}
  </>
);
