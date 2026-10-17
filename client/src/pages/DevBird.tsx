import { useEffect, useRef } from 'react';
import { drawChatak, type BirdPose } from '../film/chatak';

/** Dev only: the film's Chatak in a grid of poses, for tuning its shape (/dev/bird). */
export function DevBird() {
  const canvas = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = canvas.current!;
    const W = 1400;
    const H = 1000;
    const dpr = window.devicePixelRatio || 1;
    c.width = W * dpr;
    c.height = H * dpr;
    const ctx = c.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.fillStyle = '#e9eef1';
    ctx.fillRect(0, 0, W, H);

    const base: BirdPose = {
      x: 0,
      y: 0,
      size: 150,
      facing: 1,
      pitch: 0,
      roll: 0,
      open: 0,
      flap: 0,
      fold: 0,
      crest: 0.7,
      beak: 0,
      headYaw: 0,
      headPitch: 0,
      tailDroop: 0.1,
      tailSpread: 0.2,
      breathe: 0,
      perch: null,
      alpha: 1,
    };
    const cells: Partial<BirdPose>[] = [
      // perched, as on the branch
      { pitch: 0.9, headPitch: -0.75, tailDroop: 0.42, perch: { x: 0, y: 0 } },
      {
        pitch: 0.9,
        headPitch: -0.75,
        headYaw: 0.5,
        tailDroop: 0.42,
        crest: 1,
        perch: { x: 0, y: 0 },
      },
      { pitch: 0.9, headPitch: 0.2, tailDroop: 0.42, crest: 1, beak: 0.6, perch: { x: 0, y: 0 } },
      // opening the wings
      { pitch: 0.75, headPitch: -0.4, tailDroop: 0.3, open: 0.5, flap: 0.6 },
      // wingbeat, side view
      { pitch: 0.5, open: 1, flap: 1.05, fold: 0.5, tailSpread: 0.6 },
      { pitch: 0.5, open: 1, flap: 0.1, fold: 0.1, tailSpread: 0.6 },
      { pitch: 0.5, open: 1, flap: -0.8, fold: 0, tailSpread: 0.6 },
      // climbing, turning the underside to the camera
      { pitch: 1.0, roll: -0.6, open: 1, flap: 0.7, tailSpread: 0.8 },
      { pitch: 1.25, roll: -1.1, open: 1, flap: 0.2, tailSpread: 0.9, beak: 1, headPitch: 0.2 },
      { pitch: 1.4, roll: -1.4, open: 1, flap: -0.5, tailSpread: 0.9 },
      { pitch: 1.4, roll: -1.4, open: 1, flap: 0.9, fold: 0.5, tailSpread: 0.9 },
      { pitch: 1.57, roll: -1.57, open: 1, flap: 0.15, tailSpread: 1 },
    ];
    cells.forEach((p, i) => {
      const cx = 175 + (i % 4) * 350;
      const cy = 170 + Math.floor(i / 4) * 330;
      const pose = { ...base, ...p, x: cx, y: cy };
      if (pose.perch) {
        pose.perch = { x: cx + 6, y: cy + 150 * 0.16 };
        ctx.strokeStyle = '#3b3f39';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx - 140, pose.perch.y + 4);
        ctx.lineTo(cx + 140, pose.perch.y - 6);
        ctx.stroke();
      }
      drawChatak(ctx, pose);
    });
  }, []);

  return (
    <div className="pt-[var(--header-h)]">
      <canvas ref={canvas} style={{ width: 1400, height: 1000 }} aria-hidden="true" />
    </div>
  );
}
