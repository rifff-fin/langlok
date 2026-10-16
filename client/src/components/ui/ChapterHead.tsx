import { Hairline } from './Hairline';

/** Chapter number in Jost small caps, e.g. "03". */
export function ChapterNumber({ n, className = '' }: { n: string; className?: string }) {
  return (
    <span className={`eyebrow tabular-nums ${className}`} aria-hidden="true">
      {n}
    </span>
  );
}

/** Hairline + "03 ——— The vessels" row that opens every chapter. */
export function ChapterHead({
  n,
  label,
  className = '',
  tone = 'ink',
}: {
  n: string;
  label: string;
  className?: string;
  tone?: 'ink' | 'paper';
}) {
  const color = tone === 'paper' ? 'text-paper' : 'text-slate';
  return (
    <div className={className} data-chapter-head>
      <Hairline className={tone === 'paper' ? 'border-paper/40' : ''} />
      <div className={`flex items-baseline gap-4 pt-4 ${color}`} data-chapter-label>
        <ChapterNumber n={n} />
        <span className="h-px w-8 translate-y-[-0.3em] bg-current opacity-50" aria-hidden="true" />
        <p className="eyebrow">{label}</p>
      </div>
    </div>
  );
}
