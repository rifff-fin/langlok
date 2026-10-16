import type { ReactNode } from 'react';

/** Tracked uppercase Jost label (0.24em). */
export function Eyebrow({
  children,
  className = '',
  as: Tag = 'p',
}: {
  children: ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'h2' | 'h3';
}) {
  return <Tag className={`eyebrow ${className}`}>{children}</Tag>;
}
