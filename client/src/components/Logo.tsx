/**
 * TODO(client): replace with the master VERSA logo SVG (client/public/img/logo/versa.svg).
 * The can (Λ wordmark) and the forest image (swash wordmark) disagree; the client must
 * pick one. Until then this is a deliberately neutral text placeholder — never imitate
 * the wordmark.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block font-sans text-[15px] font-medium tracking-[0.42em] text-ink ${className}`}
      data-placeholder="logo"
    >
      VERSA
    </span>
  );
}
