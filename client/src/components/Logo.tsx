/**
 * TODO(client): replace with the master LANGLOK logo SVG (client/public/img/logo/langlok.svg).
 * The label artwork still carries the earlier VERSA wordmark (two versions: the can's Λ
 * and the forest image's swash), so there is no LANGLOK mark to use yet. Until then this
 * is a deliberately neutral text placeholder — never imitate a wordmark.
 */
export function Logo({ className = '' }: { className?: string }) {
  return (
    <span
      className={`inline-block font-sans text-[15px] font-medium tracking-[0.42em] text-ink ${className}`}
      data-placeholder="logo"
    >
      LANGLOK
    </span>
  );
}
