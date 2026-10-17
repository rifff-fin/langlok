import {
  BufferAttribute,
  CanvasTexture,
  CylinderGeometry,
  ExtrudeGeometry,
  LatheGeometry,
  Path,
  Shape,
  ShapeGeometry,
  SRGBColorSpace,
  Vector2,
} from 'three';

type Profile = readonly (readonly number[])[];

/**
 * Densify a measured [r, y] profile: short segments (curves: neck, shoulder, rim, base)
 * get centripetal Catmull-Rom points (no overshoot); long straight walls stay straight.
 */
export function densify(profile: Profile, steps = 4): Vector2[] {
  const p = profile.map(([r, y]) => new Vector2(r, y));
  const out: Vector2[] = [p[0].clone()];
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[Math.max(0, i - 1)];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[Math.min(p.length - 1, i + 2)];
    if (p1.distanceTo(p2) > 1) {
      out.push(p2.clone());
      continue;
    }
    for (let s = 1; s <= steps; s++) out.push(centripetal(p0, p1, p2, p3, s / steps));
  }
  return out;
}

function centripetal(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, u: number) {
  const knot = (a: Vector2, b: Vector2) => Math.max(Math.sqrt(a.distanceTo(b)), 1e-4);
  const t0 = 0;
  const t1 = t0 + knot(p0, p1);
  const t2 = t1 + knot(p1, p2);
  const t3 = t2 + knot(p2, p3);
  const t = t1 + (t2 - t1) * u;
  const mix = (a: Vector2, b: Vector2, ta: number, tb: number) =>
    a
      .clone()
      .multiplyScalar((tb - t) / (tb - ta))
      .add(b.clone().multiplyScalar((t - ta) / (tb - ta)));
  const a1 = mix(p0, p1, t0, t1);
  const a2 = mix(p1, p2, t1, t2);
  const a3 = mix(p2, p3, t2, t3);
  const b1 = mix(a1, a2, t0, t2);
  const b2 = mix(a2, a3, t1, t3);
  return mix(b1, b2, t1, t2);
}

/**
 * Lathe body. `phiStart = PI` puts u = 0.5 (the label front) on +z, facing the camera.
 * v is remapped by height across the printable zone; outside it the texture clamps to its
 * bare-silver edge rows, so rim, lid and base read as plain aluminium with no seam.
 */
export function latheBody(profile: Profile, segments: number, label?: { y0: number; y1: number }) {
  const geo = new LatheGeometry(densify(profile), segments, Math.PI, Math.PI * 2);
  if (label) {
    const pos = geo.getAttribute('position');
    const uv = geo.getAttribute('uv') as BufferAttribute;
    for (let i = 0; i < uv.count; i++) {
      uv.setY(i, (pos.getY(i) - label.y0) / (label.y1 - label.y0));
    }
    uv.needsUpdate = true;
  }
  return geo;
}

/** Vertical knurling on the bottle cap: radius modulated around the circumference. */
export function knurlBand(k: {
  y0: number;
  y1: number;
  radius: number;
  ribs: number;
  depth: number;
}) {
  const segs = k.ribs * 4;
  const geo = new CylinderGeometry(k.radius, k.radius, k.y1 - k.y0, segs, 1, true);
  const pos = geo.getAttribute('position');
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const a = Math.atan2(x, z);
    const r = k.radius - k.depth * (0.5 - 0.5 * Math.cos(a * k.ribs));
    const len = Math.hypot(x, z) || 1;
    pos.setX(i, (x / len) * r);
    pos.setZ(i, (z / len) * r);
  }
  geo.translate(0, (k.y0 + k.y1) / 2, 0);
  geo.computeVertexNormals();
  return geo;
}

/** Pull tab: a thin rounded plate with a finger hole, lying on the lid. */
export function pullTab() {
  const w = 1.25;
  const l = 2.05;
  const r = 0.55;
  const s = new Shape();
  s.moveTo(-w / 2 + r, -l / 2);
  s.lineTo(w / 2 - r, -l / 2);
  s.quadraticCurveTo(w / 2, -l / 2, w / 2, -l / 2 + r);
  s.lineTo(w / 2, l / 2 - r);
  s.quadraticCurveTo(w / 2, l / 2, w / 2 - r, l / 2);
  s.lineTo(-w / 2 + r, l / 2);
  s.quadraticCurveTo(-w / 2, l / 2, -w / 2, l / 2 - r);
  s.lineTo(-w / 2, -l / 2 + r);
  s.quadraticCurveTo(-w / 2, -l / 2, -w / 2 + r, -l / 2);
  const hole = new Path();
  hole.absellipse(0, -0.35, 0.36, 0.42, 0, Math.PI * 2, true);
  s.holes.push(hole);
  const geo = new ExtrudeGeometry(s, {
    depth: 0.035,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.025,
    bevelSegments: 2,
    curveSegments: 16,
  });
  geo.rotateX(-Math.PI / 2);
  return geo;
}

const OPENING = { w: 0.8, l: 1.46 }; // half-width and length, cm

/**
 * The can's opening, lying flat on the lid: a teardrop whose narrow end starts at the
 * origin (under the tab's nose) and widens towards the rim along +z. `grow` scales it
 * about its middle (the rolled lip around the hole). UVs span the shape's box, 0..1.
 */
export function openingShape(grow = 1) {
  const { w, l } = OPENING;
  const s = new Shape();
  // drawn in XY with y negative, so rotating onto the lid (-90 deg about x) runs it along +z
  s.moveTo(0, 0);
  s.bezierCurveTo(0.42 * w, -0.03 * l, w, -0.26 * l, w, -0.59 * l);
  s.bezierCurveTo(w, -0.86 * l, 0.55 * w, -l, 0, -l);
  s.bezierCurveTo(-0.55 * w, -l, -w, -0.86 * l, -w, -0.59 * l);
  s.bezierCurveTo(-w, -0.26 * l, -0.42 * w, -0.03 * l, 0, 0);
  const geo = new ShapeGeometry(s, 24);
  const pos = geo.getAttribute('position');
  const uv = geo.getAttribute('uv') as BufferAttribute;
  for (let i = 0; i < uv.count; i++) {
    uv.setXY(i, (pos.getX(i) + w) / (2 * w), (pos.getY(i) + l) / l);
  }
  geo.translate(0, l * 0.55, 0);
  geo.scale(grow, grow, 1);
  geo.translate(0, -l * 0.55, 0);
  geo.rotateX(-Math.PI / 2);
  return geo;
}

/**
 * The pale monsoon sky seen through the opening (the hero's sky stage colours), darker at
 * the rim like light falling into a hole, so it reads as depth rather than a sticker.
 */
export function skyTexture() {
  const n = 128;
  const c = document.createElement('canvas');
  c.width = c.height = n;
  const ctx = c.getContext('2d')!;
  const sky = ctx.createLinearGradient(0, 0, 0, n);
  sky.addColorStop(0, '#d6e6f2'); // v = 1 (canvas top): the narrow end, by the tab
  sky.addColorStop(0.6, '#f4f7f9');
  sky.addColorStop(1, '#e6edf2');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, n, n);
  const rim = ctx.createRadialGradient(n / 2, n * 0.58, n * 0.12, n / 2, n * 0.58, n * 0.62);
  rim.addColorStop(0, 'rgba(70, 95, 120, 0)');
  rim.addColorStop(0.62, 'rgba(70, 95, 120, 0.08)');
  rim.addColorStop(1, 'rgba(40, 58, 80, 0.62)');
  ctx.fillStyle = rim;
  ctx.fillRect(0, 0, n, n);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** A soft white wisp (cold vapour puffing from the opened can). */
export function wispTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,0.9)');
  g.addColorStop(0.4, 'rgba(250,252,253,0.45)');
  g.addColorStop(1, 'rgba(250,252,253,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}

/** Soft elliptical contact shadow, drawn once to a small canvas. */
export function shadowTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(22,35,63,0.55)');
  g.addColorStop(0.45, 'rgba(22,35,63,0.22)');
  g.addColorStop(1, 'rgba(22,35,63,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new CanvasTexture(c);
  tex.colorSpace = SRGBColorSpace;
  return tex;
}
