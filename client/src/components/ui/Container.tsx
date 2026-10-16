import type { ComponentPropsWithoutRef, ElementType } from 'react';

type ContainerProps<T extends ElementType> = {
  as?: T;
} & ComponentPropsWithoutRef<T>;

/** Max-width 1440, fluid side gutters. Inside, use `grid-cols-4 md:grid-cols-12 gap-x-[var(--grid-gap)]`. */
export function Container<T extends ElementType = 'div'>({
  as,
  className = '',
  ...rest
}: ContainerProps<T>) {
  const Tag = as ?? 'div';
  return (
    <Tag
      className={`mx-auto w-full max-w-[var(--page-max)] px-[var(--gutter)] ${className}`}
      {...rest}
    />
  );
}
