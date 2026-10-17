/**
 * The acacia branch the Chatak waits on, drawn live so it moves in the wind: a tapering limb
 * with twigs ending in pinnate fronds (pairs of small leaflets), as in the client's picture.
 * Coordinates are in branch units relative to the perch, so one layout serves every screen.
 */

type P2 = [number, number];

interface Twig {
  at: number; // position along the limb, 0..1
  side: number; // 1 up, -1 down
  ang: number; // from the limb's direction, deg
  len: number;
  fronds: [number, number, number][]; // angle offset (deg), length, leaflet pairs
  front?: boolean; // drawn in front of the bird
}

const LIMB: P2[] = [
  [-1.05, 0.24],
  [-0.62, -0.02],
  [0.08, 0.1],
  [0.86, -0.17],
];

const TWIGS: Twig[] = [
  {
    at: 0.08,
    side: -1,
    ang: 35,
    len: 0.1,
    fronds: [
      [-10, 0.192, 12],
      [32, 0.16, 10],
    ],
  },
  {
    at: 0.18,
    side: 1,
    ang: 42,
    len: 0.12,
    fronds: [
      [0, 0.208, 13],
      [-45, 0.16, 10],
    ],
  },
  { at: 0.28, side: -1, ang: 28, len: 0.08, fronds: [[12, 0.176, 11]] },
  {
    at: 0.37,
    side: 1,
    ang: 58,
    len: 0.15,
    fronds: [
      [-14, 0.192, 12],
      [36, 0.144, 9],
    ],
  },
  { at: 0.47, side: -1, ang: 40, len: 0.07, fronds: [[25, 0.16, 10]], front: true },
  {
    at: 0.64,
    side: 1,
    ang: 46,
    len: 0.14,
    fronds: [
      [-20, 0.184, 11],
      [26, 0.16, 10],
    ],
  },
  { at: 0.72, side: -1, ang: 30, len: 0.1, fronds: [[0, 0.192, 12]], front: true },
  {
    at: 0.82,
    side: 1,
    ang: 22,
    len: 0.12,
    fronds: [
      [-12, 0.16, 10],
      [40, 0.128, 8],
    ],
  },
  { at: 0.98, side: 1, ang: 8, len: 0.04, fronds: [[0, 0.16, 10]] },
];

const bez = (p: P2[], t: number): P2 => {
  const m = 1 - t;
  const a = m * m * m;
  const b = 3 * m * m * t;
  const c = 3 * m * t * t;
  const d = t * t * t;
  return [
    a * p[0][0] + b * p[1][0] + c * p[2][0] + d * p[3][0],
    a * p[0][1] + b * p[1][1] + c * p[2][1] + d * p[3][1],
  ];
};

// where the curve passes closest to the perch (0, 0)
let PERCH_T = 0.5;
{
  let best = Infinity;
  for (let i = 0; i <= 400; i++) {
    const t = i / 400;
    const [x, y] = bez(LIMB, t);
    const d = x * x + y * y;
    if (d < best) {
      best = d;
      PERCH_T = t;
    }
  }
}

export interface BranchStyle {
  limb: string;
  back: string;
  front: string;
}

export class Branch {
  /** Limb points for this frame, in px (bent by the wind). */
  private pts: P2[] = [];

  constructor(private style: BranchStyle) {}

  /**
   * Lay the branch out with the perch at (px, py) and `u` px per branch unit, bent by the
   * wind at time t. Returns the perch point (it moves with the branch).
   */
  layout(px: number, py: number, u: number, t: number, wind: number): P2 {
    const [ox, oy] = bez(LIMB, PERCH_T);
    const bend = (0.006 + 0.022 * wind) * Math.sin(t * 0.8) + 0.012 * wind * Math.sin(t * 2.1 + 1);
    this.pts = [];
    for (let i = 0; i <= 48; i++) {
      const s = i / 48;
      const [x, y] = bez(LIMB, s);
      const sway = bend * s * s; // the free end moves most
      this.pts.push([px + (x - ox) * u, py + (y - oy + sway) * u]);
    }
    const i = PERCH_T * 48;
    const a = this.pts[Math.floor(i)];
    const b = this.pts[Math.min(48, Math.floor(i) + 1)];
    const k = i - Math.floor(i);
    return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  }

  private point(s: number): { p: P2; dir: P2 } {
    const i = Math.min(47, Math.floor(s * 48));
    const a = this.pts[i];
    const b = this.pts[i + 1];
    const k = s * 48 - i;
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return { p: [a[0] + dx * k, a[1] + dy * k], dir: [dx / l, dy / l] };
  }

  /** The limb and the fronds behind the bird. */
  drawBack(ctx: CanvasRenderingContext2D, u: number, t: number, wind: number) {
    const pts = this.pts;
    // limb: a tapering band
    ctx.fillStyle = this.style.limb;
    ctx.beginPath();
    const left: P2[] = [];
    const right: P2[] = [];
    pts.forEach((p, i) => {
      const s = i / (pts.length - 1);
      const q = pts[Math.min(pts.length - 1, i + 1)];
      const r = pts[Math.max(0, i - 1)];
      const dx = q[0] - r[0];
      const dy = q[1] - r[1];
      const l = Math.hypot(dx, dy) || 1;
      const hw = (0.024 - 0.018 * s) * u * 0.5;
      left.push([p[0] - (dy / l) * hw, p[1] + (dx / l) * hw]);
      right.push([p[0] + (dy / l) * hw, p[1] - (dx / l) * hw]);
    });
    [...left, ...right.reverse()].forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.closePath();
    ctx.fill();
    this.drawTwigs(ctx, u, t, wind, false);
  }

  /** The few fronds that hang in front of the bird. */
  drawFront(ctx: CanvasRenderingContext2D, u: number, t: number, wind: number) {
    this.drawTwigs(ctx, u, t, wind, true);
  }

  private drawTwigs(
    ctx: CanvasRenderingContext2D,
    u: number,
    t: number,
    wind: number,
    front: boolean,
  ) {
    const leaves = new Path2D();
    ctx.strokeStyle = this.style.limb;
    ctx.lineCap = 'round';
    TWIGS.forEach((tw, n) => {
      if (!!tw.front !== front) return;
      const { p, dir } = this.point(tw.at);
      const sway =
        (0.03 + 0.1 * wind) * Math.sin(t * 1.4 + n * 1.7) + 0.05 * wind * Math.sin(t * 3.6 + n);
      const up: P2 = [dir[1], -dir[0]]; // the limb's upper side
      const a = (tw.ang * Math.PI) / 180;
      let tx = dir[0] * Math.cos(a) + up[0] * tw.side * Math.sin(a);
      let ty = dir[1] * Math.cos(a) + up[1] * tw.side * Math.sin(a);
      [tx, ty] = [
        tx * Math.cos(sway * 0.4) - ty * Math.sin(sway * 0.4),
        tx * Math.sin(sway * 0.4) + ty * Math.cos(sway * 0.4),
      ];
      const end: P2 = [p[0] + tx * tw.len * u, p[1] + ty * tw.len * u];
      ctx.lineWidth = Math.max(1, u * 0.006);
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(end[0], end[1]);
      ctx.stroke();
      tw.fronds.forEach(([off, len, pairs], k) => {
        const fa = Math.atan2(ty, tx) + (off * Math.PI) / 180 + sway * (1 + 0.3 * k);
        this.frond(leaves, ctx, end, fa, len * u, pairs, u, tw.side);
      });
    });
    ctx.fillStyle = front ? this.style.front : this.style.back;
    ctx.fill(leaves);
  }

  /** A pinnate frond: a rachis that droops under its own weight, leaflets in pairs. */
  private frond(
    path: Path2D,
    ctx: CanvasRenderingContext2D,
    base: P2,
    ang: number,
    len: number,
    pairs: number,
    u: number,
    side: number,
  ) {
    const droop = 0.35 * (side > 0 ? 1 : 0.5);
    let x = base[0];
    let y = base[1];
    ctx.lineWidth = Math.max(0.8, u * 0.0028);
    ctx.beginPath();
    ctx.moveTo(x, y);
    const leaf = u * 0.0165;
    for (let i = 1; i <= pairs; i++) {
      const s = i / pairs;
      const a = ang + droop * s * s * Math.sign(Math.cos(ang) || 1);
      x += (Math.cos(a) * len) / pairs;
      y += (Math.sin(a) * len) / pairs;
      ctx.lineTo(x, y);
      const size = leaf * (1 - 0.5 * s);
      for (const sd of [-1, 1]) {
        const la = a + sd * 1.05;
        const cx = x + Math.cos(la) * size * 0.85;
        const cy = y + Math.sin(la) * size * 0.85;
        path.moveTo(cx + Math.cos(la) * size, cy + Math.sin(la) * size);
        path.ellipse(cx, cy, size, size * 0.34, la, 0, Math.PI * 2);
      }
    }
    ctx.stroke();
  }
}
