import type { ReactNode } from 'react';
import { yourLogo } from '../content/copy';
import type { Slot } from './logoSlots';

/**
 * A vessel photo with a dashed "YOUR LOGO HERE" slot over the bird + wordmark zone.
 * Static stand-in until the 3D label swap (Phase 4). `children` replaces the
 * placeholder text (e.g. a typed brand name).
 */
export function SlottedVessel({
  src,
  alt,
  width,
  height,
  slot,
  children,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  slot: Slot;
  children?: ReactNode;
}) {
  return (
    <figure className="m-0 border border-aluminium bg-paper p-[clamp(8px,1.5vw,20px)]">
      <div className="relative">
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="w-full"
        />
        <div
          aria-hidden="true"
          data-logo-slot
          className="absolute flex items-center justify-center border border-dashed border-ink/45 bg-[#e9ebec] p-2 text-center"
          style={slot}
        >
          {children ?? (
            <span className="eyebrow text-[clamp(8px,0.9vw,12px)] leading-relaxed text-ink">
              {yourLogo.placeholder}
            </span>
          )}
        </div>
      </div>
    </figure>
  );
}
