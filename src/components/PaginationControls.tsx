import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Props {
  page: number;
  totalPages: number;
  total?: number;
  pageSize?: number;
  onNext: () => void;
  onPrev: () => void;
  onPageChange?: (page: number) => void;
  className?: string;
}

const getPageNumbers = (current: number, total: number): (number | '...')[] => {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
};

export const PaginationControls = ({
  page,
  totalPages,
  total,
  pageSize = 10,
  onNext,
  onPrev,
  onPageChange,
  className,
}: Props) => {
  if (totalPages <= 1) return null;
  if (total !== undefined && total <= pageSize) return null;

  const pages = getPageNumbers(page, totalPages);

  const handlePageClick = (target: number) => {
    if (target === page) return;
    onPageChange ? onPageChange(target) : target > page ? onNext() : onPrev();
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center gap-3 pt-4 sm:flex-row sm:justify-between',
        className
      )}
    >
      {total !== undefined ? (
        <p className="text-xs text-muted-foreground">
          Showing{' '}
          <span className="font-medium text-foreground">
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)}
          </span>{' '}
          of <span className="font-medium text-foreground">{total}</span>
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">
          Page <span className="font-medium text-foreground">{page}</span> of{' '}
          <span className="font-medium text-foreground">{totalPages}</span>
        </p>
      )}
      <div className="flex w-full max-w-full items-center justify-center gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:w-auto sm:justify-end [&::-webkit-scrollbar]:hidden">
        <button
          onClick={onPrev}
          disabled={page <= 1}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
            page <= 1
              ? 'cursor-not-allowed text-muted-foreground/40'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {pages.map((p, i) =>
          p === '...' ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-8 w-8 items-center justify-center text-xs text-muted-foreground"
            >
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => handlePageClick(p)}
              className={cn(
                'flex h-8 min-w-8 items-center justify-center rounded-lg px-2 text-xs font-medium transition-colors',
                p === page
                  ? 'bg-gold text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {p}
            </button>
          )
        )}

        <button
          onClick={onNext}
          disabled={page >= totalPages}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-lg text-sm transition-colors',
            page >= totalPages
              ? 'cursor-not-allowed text-muted-foreground/40'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
