import { site } from '../content/copy';

/**
 * The client's LANGLOK logo (logo pack, Chatak direction, 17 Oct 2026): the Chatak mark
 * catching a raindrop, with the wordmark after it. Never typeset or redrawn.
 *   header  the mark + LANGLOK (the small "INT. COMPANY LTD." line is left out: it would be
 *           ~3 px tall at header size)
 *   full    the complete horizontal lockup, for larger places (the footer)
 * Sources: docs/client/logo-pack/ (SVG) and the pack's PNGs.
 */
const SRC = {
  header: '/brand/langlok-logo-header.svg',
  full: '/brand/langlok-logo.svg',
} as const;

/** The lockup's viewBox (565 × 156): the intrinsic size, so it never shifts the layout. */
const W = 565;
const H = 156;

export function Logo({
  variant = 'header',
  className = '',
}: {
  variant?: keyof typeof SRC;
  className?: string;
}) {
  return (
    <img
      src={SRC[variant]}
      alt={variant === 'full' ? site.company : site.brand}
      width={W}
      height={H}
      decoding="async"
      className={`block max-w-full ${className}`}
    />
  );
}
