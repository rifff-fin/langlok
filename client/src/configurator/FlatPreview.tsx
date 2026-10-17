import { useEffect, useRef } from 'react';
import { useStore } from 'zustand';
import { configurator } from '../content/copy';
import { configStore, designChanged } from '../store/configurator';
import { renderFlat } from './flat';

/** Without WebGL: the label's front, printed flat, redrawn as the design changes. */
export default function FlatPreview() {
  const ref = useRef<HTMLCanvasElement>(null);
  const vessel = useStore(configStore, (s) => (s.vessel === 'bottle' ? 'bottle' : 'can'));

  useEffect(() => {
    let frame = 0;
    const draw = () => {
      frame = 0;
      if (ref.current) void renderFlat(vessel, ref.current);
    };
    draw();
    const unsubscribe = configStore.subscribe((s, prev) => {
      if (designChanged(s, prev) && !frame) frame = requestAnimationFrame(draw);
    });
    return () => {
      unsubscribe();
      cancelAnimationFrame(frame);
    };
  }, [vessel]);

  return (
    <figure className="m-0 flex h-full flex-col items-center justify-center gap-4 p-6">
      <canvas ref={ref} aria-hidden="true" className="max-h-[85%] max-w-full shadow-sm" />
      <figcaption className="max-w-[36ch] text-center text-sm text-slate">
        {configurator.flatNote}
      </figcaption>
    </figure>
  );
}
