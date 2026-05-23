import { CaseCodeText } from '@/components/CaseCodeText';
import { CaseUnreadInboxSkeleton } from '@/components/skeletons/CaseUnreadInboxSkeleton';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { CaseChatUnreadItem } from '@/types';
import { Loader2 } from 'lucide-react';

type CaseUnreadInboxListProps = {
  items: CaseChatUnreadItem[];
  totalUnread: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  onOpenCase: (row: CaseChatUnreadItem) => void;
};

export function CaseUnreadInboxList({
  items,
  totalUnread,
  isLoading,
  onRefresh,
  onOpenCase,
}: CaseUnreadInboxListProps) {
  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <h1 className="text-lg font-semibold text-foreground">
            Case messages
          </h1>
          <p className="text-sm text-muted-foreground">
            {totalUnread === 0
              ? 'You are caught up.'
              : `${totalUnread} unread across ${items.length} case${items.length === 1 ? '' : 's'}`}
          </p>
        </div>
        {onRefresh ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isLoading}
            onClick={() => onRefresh()}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        ) : null}
      </div>
      <ScrollArea className="max-h-[min(70vh,32rem)]">
        {isLoading ? (
          <CaseUnreadInboxSkeleton />
        ) : items.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-muted-foreground">
            No unread case messages right now.
          </p>
        ) : (
          <ul className="py-1">
            {items.map((row) => (
              <li key={row.caseId}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-0.5 border-b border-border/60 px-4 py-3 text-left last:border-0 hover:bg-muted/60"
                  onClick={() => onOpenCase(row)}
                >
                  <div className="flex min-w-0 items-center justify-between gap-2 overflow-x-auto">
                    <CaseCodeText className="text-xs font-semibold uppercase tracking-wide text-primary">
                      {row.caseCode}
                    </CaseCodeText>
                    <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                      {row.unreadCount} new
                    </span>
                  </div>
                  <span className="line-clamp-2 text-sm text-foreground">
                    {row.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>
    </div>
  );
}
