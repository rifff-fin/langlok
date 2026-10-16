import { Fragment } from 'react';

/**
 * Headline copy marks its accent with asterisks: 'Drink only what *the sky gives.*'.
 * The plain words set in light Jost, the accent in Bodoni Moda italic (globals.css), the
 * two-voice headline style taken from the Morpho reference.
 */
export function Emph({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\*[^*]+\*)/)
        .map((part, i) =>
          part.length > 2 && part.startsWith('*') && part.endsWith('*') ? (
            <em key={i}>{part.slice(1, -1)}</em>
          ) : (
            <Fragment key={i}>{part}</Fragment>
          ),
        )}
    </>
  );
}
