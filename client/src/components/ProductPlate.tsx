import type { AnchorId } from '../store/scene';
import { useVesselAnchor } from '../hooks/useVesselAnchor';

/**
 * A client product photo presented as an editorial plate (paper mount + hairline).
 * With an `anchor`, the live 3D vessel tracks this box and the photo fades out once WebGL
 * is ready; it stays as the reduced-motion / no-WebGL version and keeps its alt text.
 */
export function ProductPlate({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  anchor,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
  anchor?: AnchorId;
}) {
  const ref = useVesselAnchor(anchor);
  return (
    <figure
      ref={ref}
      data-vessel-plate={anchor ? '' : undefined}
      className={`m-0 border border-aluminium bg-paper p-[clamp(12px,2vw,28px)] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        // sized before load (no layout shift; the 3D vessel tracks this box)
        style={{
          aspectRatio: `${width} / ${height}`,
          width: `min(100%, calc(72svh * ${width / height}))`,
        }}
        className="mx-auto block h-auto"
      />
    </figure>
  );
}
