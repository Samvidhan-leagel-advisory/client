import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { ReactNode, useCallback, useRef, useState } from 'react';

interface GenericTooltipProps {
  content?: string | null;
  children?: ReactNode;
  className?: string;
  tooltipClassName?: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export const GenericTooltip = ({
  content,
  children,
  className,
  tooltipClassName,
  side = 'top',
}: GenericTooltipProps) => {
  const text = content ?? '';
  const triggerRef = useRef<HTMLDivElement>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [triggerWidth, setTriggerWidth] = useState<number | undefined>();

  const isTruncated = useCallback((): boolean => {
    const wrapper = triggerRef.current;
    if (!wrapper) return false;
    const el = (wrapper.firstElementChild ?? wrapper) as HTMLElement;
    // For single-line truncate (text-overflow: ellipsis)
    if (el.scrollWidth > el.clientWidth) return true;
    // For line-clamp: temporarily remove clamp + overflow to measure natural height
    const style = getComputedStyle(el);
    const clamp = style.getPropertyValue('-webkit-line-clamp');
    if (clamp && clamp !== 'none') {
      const clampedHeight = el.clientHeight;
      el.style.webkitLineClamp = 'unset';
      el.style.overflow = 'visible';
      el.style.display = 'block';
      const naturalHeight = el.scrollHeight;
      el.style.webkitLineClamp = '';
      el.style.overflow = '';
      el.style.display = '';
      return naturalHeight > clampedHeight;
    }
    return el.scrollHeight > el.clientHeight;
  }, []);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (open) {
        if (!isTruncated()) {
          setShowTooltip(false);
          return;
        }
        setTriggerWidth(triggerRef.current?.clientWidth);
      }
      setShowTooltip(open);
    },
    [isTruncated]
  );

  // Fallback: render as before if no children provided (backward compat)
  if (!children) {
    return (
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <p
              className={cn(
                'mt-2 line-clamp-2 cursor-pointer text-xs text-muted-foreground',
                className
              )}
            >
              {text}
            </p>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs whitespace-pre-wrap bg-black text-xs text-white">
            {text}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip open={showTooltip} onOpenChange={handleOpenChange}>
        <TooltipTrigger asChild>
          <div ref={triggerRef} className={className}>
            {children}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side={side}
          className={cn(
            'z-[100] whitespace-pre-wrap bg-black text-sm text-white',
            tooltipClassName
          )}
          style={triggerWidth ? { maxWidth: triggerWidth } : undefined}
        >
          {text}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
