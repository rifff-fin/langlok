/**
 * The Chatak (pied cuckoo) for the hero film, drawn in code: a small 3D rig (a spine of
 * spheres, crest, beak, long graduated tail, two wings) projected orthographically. The same
 * bird can sit on a branch in profile, open its wings, beat them, and climb past the camera
 * showing its pale underside. Shapes follow the client's pictures (tall swept-back crest,
 * black above and white below, white wing patch, white-tipped graduated tail) but are drawn,
 * not traced. Rig units: about 0.7 from rump to forehead.
 *
 * Local frame: x forward (to the head), y up (dorsal), z to the bird's left. With pitch and
 * roll 0 the bird faces screen right and shows its left side.
 */

export interface BirdPose {
  /** Screen position of the rig origin (mid-body), px. */
  x: number;
  y: number;
  /** px per rig unit. */
  size: number;
  /** 1 faces right, -1 faces left. */
  facing: number;
  /** Nose up, radians. */
  pitch: number;
  /** About the forward axis after the pitch; -PI/2 turns the underside to the camera. */
  roll: number;
  /** Wings: 0 folded along the flank, 1 spread. */
  open: number;
  /** Wing dihedral, radians, positive up. */
  flap: number;
  /** Hand folded back (upstroke), 0..1. */
  fold: number;
  /** Crest raised, 0..1. */
  crest: number;
  /** Beak open, 0..1. */
  beak: number;
  headYaw: number;
  headPitch: number;
  /** Tail droop, radians (positive down), and fan, 0..1. */
  tailDroop: number;
  tailSpread: number;
  /** Breathing, -1..1. */
  breathe: number;
  /** Perched: where the feet grip (screen px), or null in flight. */
  perch: { x: number; y: number } | null;
  /** Overall opacity. */
  alpha: number;
}

export const INK = '#141d2b';
const PALE = '#e8ecef';

type P3 = [number, number, number];
type P2 = [number, number];

interface Frame {
  f: P3;
  u: P3;
  l: P3;
  pose: BirdPose;
}

function frame(pose: BirdPose): Frame {
  const cp = Math.cos(pose.pitch);
  const sp = Math.sin(pose.pitch);
  const cr = Math.cos(pose.roll);
  const sr = Math.sin(pose.roll);
  // pitch about world z, then roll about the new forward axis (Rodrigues; f x u = l)
  const u0: P3 = [-sp, cp, 0];
  const l0: P3 = [0, 0, 1];
  return {
    f: [cp, sp, 0],
    u: [u0[0] * cr + l0[0] * sr, u0[1] * cr + l0[1] * sr, u0[2] * cr + l0[2] * sr],
    l: [l0[0] * cr - u0[0] * sr, l0[1] * cr - u0[1] * sr, l0[2] * cr - u0[2] * sr],
    pose,
  };
}

/** Local rig point -> screen px, plus depth (larger = nearer the camera). */
function project(F: Frame, p: P3): [number, number, number] {
  const { f, u, l, pose } = F;
  const wx = f[0] * p[0] + u[0] * p[1] + l[0] * p[2];
  const wy = f[1] * p[0] + u[1] * p[1] + l[1] * p[2];
  const wz = f[2] * p[0] + u[2] * p[1] + l[2] * p[2];
  return [pose.x + pose.facing * wx * pose.size, pose.y - wy * pose.size, wz];
}

const rotXY = (x: number, y: number, a: number): P2 => [
  x * Math.cos(a) - y * Math.sin(a),
  x * Math.sin(a) + y * Math.cos(a),
];

// ---------------------------------------------------------------- the rig

/** Neck pivot (the head turns about it) and head centre. */
const NECK: P3 = [0.32, 0.075, 0];
const HEAD: P3 = [0.41, 0.13, 0];

function headPoint(pose: BirdPose, p: P3): P3 {
  let x = p[0] - NECK[0];
  let y = p[1] - NECK[1];
  let z = p[2] - NECK[2];
  [x, y] = rotXY(x, y, pose.headPitch);
  const c = Math.cos(pose.headYaw);
  const s = Math.sin(pose.headYaw);
  [x, z] = [x * c - z * s, x * s + z * c];
  return [x + NECK[0], y + NECK[1], z + NECK[2]];
}

/** Spine: [x, y, radius]; the first is the head (on the head rig). */
const SPINE: [number, number, number][] = [
  [HEAD[0], HEAD[1], 0.075],
  [NECK[0], NECK[1], 0.07],
  [0.2, 0.03, 0.118],
  [0.06, 0.0, 0.13],
  [-0.08, 0.005, 0.11],
  [-0.18, 0.02, 0.08],
  [-0.25, 0.028, 0.05],
];

/** Pale underparts (chin to vent): [x, y, radius, onHead]. */
const BELLY: [number, number, number, boolean][] = [
  [0.455, 0.092, 0.034, true],
  [0.36, 0.045, 0.052, false],
  [0.23, -0.01, 0.09, false],
  [0.08, -0.03, 0.102, false],
  [-0.07, -0.03, 0.08, false],
];

/** Crest spikes on the back of the crown: base angle, direction (deg), length. */
const CREST: [number, number, number][] = [
  [72, 108, 0.1],
  [86, 116, 0.15],
  [100, 124, 0.18],
  [114, 132, 0.17],
  [128, 140, 0.14],
  [142, 148, 0.1],
  [156, 156, 0.06],
];

/** Wing outline in (span s 0..1, chord c: 0 leading edge, negative trailing). */
const WING: P2[] = [
  [0, 0.0],
  [0.16, 0.035],
  [0.32, 0.05],
  [0.47, 0.035],
  [0.64, -0.03],
  [0.82, -0.13],
  [0.95, -0.24],
  [1.0, -0.31],
  [0.98, -0.355],
  [0.93, -0.335],
  [0.91, -0.395],
  [0.86, -0.37],
  [0.83, -0.435],
  [0.77, -0.41],
  [0.73, -0.47],
  [0.66, -0.45],
  [0.58, -0.485],
  [0.46, -0.47],
  [0.33, -0.47],
  [0.21, -0.45],
  [0.1, -0.41],
  [0.03, -0.34],
  [0, -0.27],
];
/** The white crescent at the base of the primaries. */
const PATCH: P2[] = [
  [0.6, -0.055],
  [0.665, -0.07],
  [0.69, -0.2],
  [0.675, -0.31],
  [0.615, -0.3],
  [0.625, -0.18],
];
const SHOULDER: P3 = [0.17, 0.06, 0.045];

function wingPoint(pose: BirdPose, sc: P2, side: number): P3 {
  let [s, c] = sc;
  if (s > 0.48) {
    // upstroke: the hand sweeps back and in
    const k = (s - 0.48) * pose.fold;
    c -= k * 0.7;
    s = 0.48 + (s - 0.48) * (1 - 0.42 * pose.fold);
  }
  // spread, and folded along the flank with the primaries reaching over the tail
  const ex = SHOULDER[0] + c * 0.6 - s * 0.06;
  const ez = s * 0.98;
  const fx = SHOULDER[0] - s * 0.6 + c * 0.25;
  const fy = 0.03 - s * 0.07 + c * 0.08;
  const fz = 0.075 + s * 0.02;
  const o = pose.open;
  const x = fx + (ex - fx) * o;
  const y = fy * (1 - o);
  const z = fz + (ez - fz) * o;
  const a = pose.flap * o; // folded wings don't flap
  const y2 = y * Math.cos(a) + z * Math.sin(a);
  const z2 = -y * Math.sin(a) + z * Math.cos(a);
  return [x, SHOULDER[1] + y2, side * (SHOULDER[2] + z2)];
}

/** Tail feathers: fan angle, length. The middle pair is longest (graduated tail). */
const TAIL: P2[] = [
  [-0.3, 0.6],
  [-0.15, 0.74],
  [0, 0.86],
  [0.15, 0.74],
  [0.3, 0.6],
];
const RUMP: P3 = [-0.235, 0.025, 0];

function tailPoint(pose: BirdPose, p: P3): P3 {
  const [x, y] = rotXY(p[0] - RUMP[0], p[1] - RUMP[1], pose.tailDroop);
  return [x + RUMP[0], y + RUMP[1], p[2]];
}

/** One feather as two outlines (fanned in x-z, and with depth in y) from u0 to u1. */
function featherPolys(pose: BirdPose, fan: number, len: number, u0: number, u1: number) {
  const a = fan * (0.12 + 0.88 * pose.tailSpread);
  const dir: P3 = [-Math.cos(a), 0, Math.sin(a)];
  const side: P3 = [Math.sin(a), 0, Math.cos(a)];
  const HW: P2[] = [
    [0, 0.03],
    [0.5, 0.046],
    [0.85, 0.044],
    [0.96, 0.03],
    [1, 0],
  ];
  const width = (u: number) => {
    for (let i = 1; i < HW.length; i++) {
      if (u <= HW[i][0]) {
        const k = (u - HW[i - 1][0]) / (HW[i][0] - HW[i - 1][0]);
        return HW[i - 1][1] + (HW[i][1] - HW[i - 1][1]) * k;
      }
    }
    return 0;
  };
  const steps = [u0, ...HW.map((h) => h[0]).filter((u) => u > u0 && u < u1), u1];
  const out: P3[][] = [];
  for (const plane of [side, [0, 1, 0] as P3]) {
    const left: P3[] = [];
    const right: P3[] = [];
    for (const u of steps) {
      const hw = width(u);
      const c: P3 = [RUMP[0] + dir[0] * u * len, RUMP[1], RUMP[2] + dir[2] * u * len];
      left.push(
        tailPoint(pose, [c[0] + plane[0] * hw, c[1] + plane[1] * hw, c[2] + plane[2] * hw]),
      );
      right.push(
        tailPoint(pose, [c[0] - plane[0] * hw, c[1] - plane[1] * hw, c[2] - plane[2] * hw]),
      );
    }
    out.push([...left, ...right.reverse()]);
  }
  return out;
}

// ---------------------------------------------------------------- drawing

function fillPoly(ctx: CanvasRenderingContext2D, F: Frame, pts: P3[], smooth = false) {
  const q = pts.map((p) => project(F, p));
  ctx.beginPath();
  if (smooth) {
    // through the midpoints, bending at each point: rounded feather tips, soft outline
    const n = q.length;
    const mid = (i: number) => [
      (q[i % n][0] + q[(i + 1) % n][0]) / 2,
      (q[i % n][1] + q[(i + 1) % n][1]) / 2,
    ];
    const [mx, my] = mid(0);
    ctx.moveTo(mx, my);
    for (let i = 1; i <= n; i++) {
      const [nx, ny] = mid(i);
      ctx.quadraticCurveTo(q[i % n][0], q[i % n][1], nx, ny);
    }
  } else {
    q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
  }
  ctx.closePath();
  ctx.fill();
}

/** Where the beak's tip is on screen (the film aims the raindrop at it). */
export function beakTip(pose: BirdPose): [number, number] {
  const F = frame(pose);
  const [x, y] = project(F, headPoint(pose, [HEAD[0] + 0.165, HEAD[1] - 0.012, 0]));
  return [x, y];
}

export function drawChatak(ctx: CanvasRenderingContext2D, pose: BirdPose) {
  if (pose.alpha <= 0.005) return;
  const F = frame(pose);
  const s = pose.size;
  ctx.save();
  ctx.globalAlpha *= pose.alpha;
  ctx.lineJoin = 'round';

  // which wing is nearer the camera
  const near =
    project(F, wingPoint(pose, [0.6, -0.2], 1))[2] >=
    project(F, wingPoint(pose, [0.6, -0.2], -1))[2]
      ? 1
      : -1;
  const wing = (side: number) => {
    ctx.fillStyle = INK;
    fillPoly(
      ctx,
      F,
      WING.map((p) => wingPoint(pose, p, side)),
      true,
    );
    if (pose.open > 0.55) {
      ctx.save();
      ctx.globalAlpha *= Math.min(1, (pose.open - 0.55) * 4) * 0.9;
      ctx.fillStyle = PALE;
      fillPoly(
        ctx,
        F,
        PATCH.map((p) => wingPoint(pose, p, side)),
        true,
      );
      ctx.restore();
    }
  };

  wing(-near);

  // tail: ink feathers, white tips
  ctx.fillStyle = INK;
  for (const [fan, len] of TAIL)
    for (const p of featherPolys(pose, fan, len, 0, 1)) fillPoly(ctx, F, p, true);
  // white tips on the outer feathers, on the fanned surface only (not stacked in profile)
  ctx.fillStyle = PALE;
  for (const [fan, len] of TAIL) {
    if (fan === 0) continue;
    fillPoly(ctx, F, featherPolys(pose, fan, len, 0.9, 1)[0], true);
  }

  // legs gripping the perch
  if (pose.perch) {
    const [bx, by] = project(F, [0.06, -0.09, 0]);
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1.2, s * 0.016);
    ctx.lineCap = 'round';
    for (const dx of [-0.035, 0.025]) {
      const fx = pose.perch.x + dx * s * pose.facing;
      ctx.beginPath();
      ctx.moveTo(bx + dx * s * 0.4 * pose.facing, by);
      ctx.lineTo(fx, pose.perch.y - s * 0.012);
      ctx.stroke();
      ctx.beginPath(); // toes round the branch
      ctx.arc(fx, pose.perch.y, s * 0.02, Math.PI * 1.05, Math.PI * 1.95);
      ctx.stroke();
    }
  }

  // body: a chain of spheres (their outline is a circle from any angle)
  ctx.fillStyle = INK;
  ctx.beginPath();
  const breathe = 1 + 0.018 * pose.breathe;
  for (let i = 0; i < SPINE.length - 1; i++) {
    const a = SPINE[i];
    const b = SPINE[i + 1];
    for (let k = 0; k < 4; k++) {
      const t = k / 4;
      const p: P3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0];
      const r = (a[2] + (b[2] - a[2]) * t) * (i >= 2 && i <= 4 ? breathe : 1);
      const q = i === 0 ? headPoint(pose, p) : p;
      const [x, y] = project(F, q);
      ctx.moveTo(x + r * s, y);
      ctx.arc(x, y, r * s, 0, Math.PI * 2);
    }
  }
  const last = SPINE[SPINE.length - 1];
  const [lx, ly] = project(F, [last[0], last[1], 0]);
  ctx.moveTo(lx + last[2] * s, ly);
  ctx.arc(lx, ly, last[2] * s, 0, Math.PI * 2);
  ctx.fill();

  // crest: spikes swept back from the crown, in two planes so it reads from any angle
  const raise = 0.62 + 0.38 * pose.crest;
  for (const [a0, d0, len] of CREST) {
    const a = (a0 * Math.PI) / 180;
    const d = ((d0 + (1 - pose.crest) * 24) * Math.PI) / 180;
    const base: P3 = [HEAD[0] + Math.cos(a) * 0.058, HEAD[1] + Math.sin(a) * 0.058, 0];
    const tip: P3 = [base[0] + Math.cos(d) * len * raise, base[1] + Math.sin(d) * len * raise, 0];
    const px = -Math.sin(d) * 0.017;
    const py = Math.cos(d) * 0.017;
    fillPoly(ctx, F, [
      headPoint(pose, [base[0] + px, base[1] + py, 0]),
      headPoint(pose, tip),
      headPoint(pose, [base[0] - px, base[1] - py, 0]),
    ]);
    fillPoly(ctx, F, [
      headPoint(pose, [base[0], base[1], 0.017]),
      headPoint(pose, tip),
      headPoint(pose, [base[0], base[1], -0.017]),
    ]);
  }

  // beak: upper mandible fixed, lower one opens about the gape
  const gape: P2 = [HEAD[0] + 0.05, HEAD[1] - 0.012];
  const upper: P2[] = [
    [HEAD[0] + 0.04, HEAD[1] + 0.022],
    [HEAD[0] + 0.115, HEAD[1] + 0.008],
    [HEAD[0] + 0.168, HEAD[1] - 0.012],
    [HEAD[0] + 0.11, HEAD[1] - 0.008],
    [gape[0], gape[1]],
  ];
  const open = -pose.beak * 0.6;
  const lower: P2[] = [
    [gape[0], gape[1]],
    [HEAD[0] + 0.11, HEAD[1] - 0.02],
    [HEAD[0] + 0.155, HEAD[1] - 0.024],
    [HEAD[0] + 0.1, HEAD[1] - 0.034],
    [HEAD[0] + 0.035, HEAD[1] - 0.04],
  ].map(([x, y]) => {
    const [rx, ry] = rotXY(x - gape[0], y - gape[1], open);
    return [rx + gape[0], ry + gape[1]];
  });
  for (const m of [upper, lower]) {
    fillPoly(
      ctx,
      F,
      m.map(([x, y]) => headPoint(pose, [x, y, 0])),
    );
    // and its width, for views from below
    const tipI = m === upper ? 2 : 2;
    const w = 0.022;
    fillPoly(ctx, F, [
      headPoint(pose, [m[0][0], m[0][1], w]),
      headPoint(pose, [m[tipI][0], m[tipI][1], 0]),
      headPoint(pose, [m[0][0], m[0][1], -w]),
    ]);
  }

  // pale underparts, as much as the camera sees of the belly side
  const vis = Math.min(1, Math.max(0, 0.5 - 0.9 * Math.sin(pose.roll)));
  if (vis > 0.12) {
    // the belly's direction on screen
    const [cx, cy] = project(F, [0, 0, 0]);
    const [dx0, dy0] = project(F, [0, -1, 0]);
    const dl = Math.hypot(dx0 - cx, dy0 - cy) || 1;
    const nx = (dx0 - cx) / dl;
    const ny = (dy0 - cy) / dl;
    ctx.save();
    ctx.globalAlpha *= Math.min(1, (vis - 0.12) * 5) * 0.96;
    ctx.fillStyle = PALE;
    ctx.beginPath();
    for (let i = 0; i < BELLY.length - 1; i++) {
      const a = BELLY[i];
      const b = BELLY[i + 1];
      for (let k = 0; k < 4; k++) {
        const t = k / 4;
        const p: P3 = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0];
        const r = (a[2] + (b[2] - a[2]) * t) * (0.62 + 0.38 * vis) * breathe;
        const q = a[3] && t < 0.6 ? headPoint(pose, p) : p;
        const [x, y] = project(F, q);
        const off = (a[2] + (b[2] - a[2]) * t) * s * (1 - vis) * 0.55;
        ctx.moveTo(x + nx * off + r * s, y + ny * off);
        ctx.arc(x + nx * off, y + ny * off, r * s, 0, Math.PI * 2);
      }
    }
    ctx.fill();
    ctx.restore();
  }

  // the eye's catchlight, on the side facing the camera
  for (const zs of [1, -1]) {
    const e = project(F, headPoint(pose, [HEAD[0] + 0.03, HEAD[1] + 0.012, 0.05 * zs]));
    const c = project(F, headPoint(pose, HEAD));
    if (e[2] - c[2] > 0.012) {
      ctx.fillStyle = 'rgba(232, 236, 239, 0.9)';
      ctx.beginPath();
      ctx.arc(e[0], e[1], Math.max(1, s * 0.011), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  wing(near);
  ctx.restore();
}
