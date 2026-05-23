import { ROUTES } from '@/constants';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

import logoUrl from '@/assets/logo.png';

const sizePx = {
  sm: 32,
  md: 36,
  lg: 40,
  xl: 48,
} as const;

/** Serif wordmark — marketing / public chrome (`header`, `footer` only). */
const textStyles = {
  header: 'font-serif text-xl font-bold text-navy',
  footer: 'font-serif text-lg font-bold text-primary-foreground',
} as const;

/**
 * Sans stacked wordmark for narrow dashboard chrome — Inter renders more
 * clearly than small optical-size serif next to the nav.
 */
const stackedWordmarkStyles = {
  sidebar: {
    wrap: 'min-w-0 flex-1 subpixel-antialiased',
    line1:
      'block font-sans text-sm font-semibold leading-tight tracking-tight text-primary-foreground',
    line2:
      'mt-0.5 block font-sans text-xs font-medium leading-tight text-primary-foreground/90',
  },
  headerCompact: {
    wrap: 'min-w-0 flex-1',
    line1:
      'block font-sans text-sm font-semibold leading-tight tracking-tight text-navy',
    line2:
      'mt-0.5 block font-sans text-xs font-medium leading-tight text-navy/80',
  },
} as const;

type StackedVariant = keyof typeof stackedWordmarkStyles;

export type BrandLogoTextVariant =
  | keyof typeof textStyles
  | keyof typeof stackedWordmarkStyles;

function isStackedVariant(v: BrandLogoTextVariant): v is StackedVariant {
  return v === 'sidebar' || v === 'headerCompact';
}

export type BrandLogoProps = {
  to?: string;
  /** Use `div` for decorative marks (no navigation). */
  as?: 'link' | 'div';
  size?: keyof typeof sizePx | number;
  showText?: boolean;
  textVariant?: BrandLogoTextVariant;
  className?: string;
  imgClassName?: string;
};

export function BrandLogo({
  to = ROUTES.home,
  as = 'link',
  size = 'md',
  showText = true,
  textVariant = 'header',
  className,
  imgClassName,
}: BrandLogoProps) {
  const dim = typeof size === 'number' ? size : sizePx[size];

  const wordmark =
    showText &&
    (isStackedVariant(textVariant) ? (
      <span className={stackedWordmarkStyles[textVariant].wrap}>
        <span className={stackedWordmarkStyles[textVariant].line1}>
          Samvidhan
        </span>
        <span className={stackedWordmarkStyles[textVariant].line2}>
          Legal Advisory
        </span>
      </span>
    ) : (
      <span
        className={cn(
          textStyles[textVariant],
          'min-w-0 flex-1 text-left leading-snug'
        )}
      >
        Samvidhan Legal Advisory
      </span>
    ));

  const inner = (
    <>
      <img
        src={logoUrl}
        alt=""
        width={dim}
        height={dim}
        className={cn('shrink-0 rounded-full object-cover', imgClassName)}
        decoding="async"
      />
      {wordmark}
    </>
  );

  const rowClass = 'flex min-w-0 items-center gap-2.5';

  if (as === 'div') {
    return <div className={cn(rowClass, className)}>{inner}</div>;
  }

  return (
    <Link
      to={to}
      className={cn(rowClass, className)}
      aria-label="Samvidhan Legal Advisory home"
    >
      {inner}
    </Link>
  );
}
