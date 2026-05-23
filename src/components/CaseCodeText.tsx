import { cn } from '@/lib/utils';
import { Link, type LinkProps } from 'react-router-dom';

const caseCodeBase =
  'shrink-0 whitespace-nowrap font-mono tabular-nums';

export function CaseCodeText({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span className={cn(caseCodeBase, className)} {...props}>
      {children}
    </span>
  );
}

export function CaseCodeLink({
  className,
  children,
  ...props
}: LinkProps) {
  return (
    <Link
      className={cn(
        caseCodeBase,
        'hover:text-gold hover:underline',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  );
}
