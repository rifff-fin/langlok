/**
 * A client product photo presented as an editorial plate (paper mount + hairline).
 * Temporary stand-in for the live 3D vessels; also the no-WebGL fallback later.
 */
export function ProductPlate({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  priority?: boolean;
}) {
  return (
    <figure
      className={`m-0 border border-aluminium bg-paper p-[clamp(12px,2vw,28px)] ${className}`}
    >
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        className="mx-auto max-h-[72svh] w-auto object-contain"
      />
    </figure>
  );
}
