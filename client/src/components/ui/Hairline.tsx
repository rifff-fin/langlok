/** 1px aluminium rule that separates chapters. */
export function Hairline({ className = '' }: { className?: string }) {
  return <hr className={`m-0 border-0 border-t border-aluminium ${className}`} />;
}
