import { cn } from '@/lib/utils';
import type { TimelineEvent } from '@/types';
import {
  ArrowRight,
  FileText,
  MessageSquare,
  StickyNote,
  UserCheck,
} from 'lucide-react';

const iconMap: Record<TimelineEvent['type'], React.ReactNode> = {
  status_change: <ArrowRight className="h-3.5 w-3.5" />,
  message: <MessageSquare className="h-3.5 w-3.5" />,
  document: <FileText className="h-3.5 w-3.5" />,
  note: <StickyNote className="h-3.5 w-3.5" />,
  assignment: <UserCheck className="h-3.5 w-3.5" />,
};

export const CaseTimeline = ({ events }: { events: TimelineEvent[] }) => (
  <div className="relative space-y-0">
    {events.map((event, i) => (
      <div key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
        {i < events.length - 1 && (
          <div className="absolute left-[15px] top-8 h-full w-px bg-border" />
        )}
        <div
          className={cn(
            'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-border bg-card',
            event.type === 'assignment' && 'border-gold bg-gold-light text-gold'
          )}
        >
          {iconMap[event.type]}
        </div>
        <div className="pt-0.5">
          <p className="text-sm font-medium">{event.title}</p>
          <p className="text-xs text-muted-foreground">{event.description}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(event.timestamp).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>
    ))}
  </div>
);
