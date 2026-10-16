import type { AnchorId, VesselId } from '../store/scene';
import { useVesselAnchor } from '../hooks/useVesselAnchor';
import spec from '../three/vesselSpec.json';

export type StillLabel = 'brand' | 'yourlogo';

/** Studio stills of the 3D vessels, rendered at their frame (dev route /dev/studio). */
const STILL_PX = 1200;
const stillSrc = (vessel: VesselId, label: StillLabel) => `/img/stills/${vessel}-${label}.webp`;

/**
 * The box a vessel stands in: its frame's aspect ratio at the given height, holding a
 * studio still of the whole vessel. With an `anchor`, the live 3D vessel lands exactly on
 * the still and the still fades out once WebGL is ready (globals.css); without WebGL the
 * still stays, and it always carries the alt text.
 */
export function VesselPlate({
  vessel,
  anchor,
  label = 'brand',
  alt,
  height,
  className = '',
  priority = false,
}: {
  vessel: VesselId;
  anchor?: AnchorId;
  label?: StillLabel;
  alt: string;
  /** CSS length for the plate's height; the width follows the frame. */
  height: string;
  className?: string;
  priority?: boolean;
}) {
  const ref = useVesselAnchor(anchor);
  const frame = spec[vessel].frame;
  return (
    <figure
      ref={ref}
      data-vessel-plate={anchor ? '' : undefined}
      className={`m-0 max-w-full shrink-0 ${className}`}
      style={{ height, aspectRatio: `${frame.w} / ${frame.h}` }}
    >
      <img
        src={stillSrc(vessel, label)}
        alt={alt}
        width={Math.round((STILL_PX * frame.w) / frame.h)}
        height={STILL_PX}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
        decoding="async"
        className="block h-full w-full object-contain"
      />
    </figure>
  );
}
