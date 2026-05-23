import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface BubbleConfig {
  side: 'left' | 'right';
  lines: number[];
  grouped?: boolean;
}

const SKELETON_BUBBLES: BubbleConfig[] = [
  { side: 'left', lines: [75, 50], grouped: false },
  { side: 'left', lines: [60], grouped: true },
  { side: 'right', lines: [85], grouped: false },
  { side: 'right', lines: [70, 45], grouped: true },
  { side: 'left', lines: [90, 65, 35], grouped: false },
  { side: 'right', lines: [55], grouped: false },
  { side: 'right', lines: [80, 50], grouped: true },
  { side: 'left', lines: [65], grouped: false },
];

function SkeletonBubble({ side, lines, grouped }: BubbleConfig) {
  const isRight = side === 'right';
  const maxW = lines.length > 2 ? 'max-w-[65%]' : lines.length > 1 ? 'max-w-[55%]' : 'max-w-[45%]';

  return (
    <div
      className={cn(
        'flex',
        isRight ? 'justify-end' : 'justify-start',
        grouped ? 'mt-1' : 'mt-4'
      )}
    >
      <div className={cn('w-full rounded-2xl px-4 py-3', maxW, isRight ? 'bg-amber-50/60' : 'bg-muted/70')}>
        {lines.map((w, i) => (
          <Skeleton
            key={i}
            className={cn('h-3 rounded-full', i > 0 && 'mt-2', isRight ? 'bg-amber-200/40' : 'bg-muted-foreground/10')}
            style={{ width: `${w}%` }}
          />
        ))}
        <Skeleton
          className={cn(
            'ml-auto mt-2.5 h-2 w-10 rounded-full',
            isRight ? 'bg-amber-200/40' : 'bg-muted-foreground/10'
          )}
        />
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div className="flex flex-1 flex-col justify-end gap-0 px-1 py-4">
      {SKELETON_BUBBLES.map((b, i) => (
        <SkeletonBubble key={i} {...b} />
      ))}
    </div>
  );
}
