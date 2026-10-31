import type { ReactNode } from 'react';
import { Link } from 'react-router';

type Variant = 'primary' | 'secondary' | 'quiet';

const base =
  'eyebrow inline-flex min-h-12 items-center justify-center gap-3 rounded-full px-7 py-3 no-underline transition-colors duration-[var(--dur-ui)] ease-liquid disabled:cursor-not-allowed disabled:opacity-50';

const variants: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-rain-deep',
  secondary: 'border border-ink text-ink hover:bg-ink hover:text-paper',
  quiet: 'px-0 text-rain-deep underline-offset-[0.4em] hover:underline',
};

type ButtonProps = {
  children: ReactNode;
  variant?: Variant;
  className?: string;
} & (
  | { href: string; type?: never; onClick?: never; disabled?: never }
  | {
      href?: never;
      type?: 'button' | 'submit' | 'reset';
      onClick?: () => void;
      disabled?: boolean;
    }
);

/** Internal hrefs render a router Link, external an <a>, otherwise a <button>. */
export function Button({ children, variant = 'primary', className = '', ...rest }: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${className}`;

  if (rest.href !== undefined) {
    const { href } = rest;
    if (/^(https?:|mailto:|tel:)/.test(href)) {
      return (
        <a href={href} className={cls} target="_blank" rel="noreferrer">
          {children}
        </a>
      );
    }
    return (
      <Link to={href} className={cls}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={rest.type ?? 'button'}
      onClick={rest.onClick}
      disabled={rest.disabled}
      className={cls}
    >
      {children}
    </button>
  );
}
