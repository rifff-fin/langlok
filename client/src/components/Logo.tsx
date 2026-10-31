import { site } from '../content/copy';

/**
 * The LANGLOK logo: the LK logo pack (30 Oct 2026, docs/client/logo-pack-lk/: the LK mark and
 * the LANGLOK wordmark in Orbitron, outlined). The site is olive, so it wears the pack's white
 * colourway. Never typeset or redrawn.
 *   header  the mark + LANGLOK (the pack's horizontal lockup without its small "INT. COMPANY
 *           LTD." line, which would be ~3 px tall at header size)
 *   full    the complete horizontal lockup, for larger places (the footer)
 */
const SRC = {
  header: '/brand/langlok-lk-header-white.svg',
  full: '/brand/langlok-lk-horizontal-white.svg',
} as const;

/** The lockup's viewBox (722.6 × 232): the intrinsic size, so it never shifts the layout. */
const W = 723;
const H = 232;

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
      alt={variant === 'header' ? site.brand : site.company}
      width={W}
      height={H}
      decoding="async"
      className={`block max-w-full ${className}`}
    />
  );
}
