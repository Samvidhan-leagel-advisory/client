import * as React from 'react';

import { cn } from '@/lib/utils';

type AppToastContentProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
};

/** Body only — toast shell uses light theme + pastel overrides in `toastify-overrides.css`. */
export function AppToastContent({ title, description, action }: AppToastContentProps) {
  const hasTitle = title != null && title !== '';
  const hasDescription = description != null && description !== '';
  const descriptionOnly = !hasTitle && hasDescription;

  return (
    <div className="min-w-0 flex-1 pr-6 text-inherit">
      {hasTitle && <div className="font-sans text-sm font-semibold leading-snug">{title}</div>}
      {hasDescription && (
        <div
          className={cn(
            'font-sans leading-snug opacity-95',
            descriptionOnly ? 'text-sm font-semibold opacity-100' : 'text-xs',
            hasTitle && 'mt-0.5',
          )}
        >
          {description}
        </div>
      )}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
